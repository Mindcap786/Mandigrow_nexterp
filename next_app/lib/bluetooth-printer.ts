export class ESCPOS {
  buffer: number[] = [];

  init() {
    this.buffer.push(0x1B, 0x40);
    return this;
  }

  align(align: 'left' | 'center' | 'right') {
    const map = { left: 0, center: 1, right: 2 };
    this.buffer.push(0x1B, 0x61, map[align]);
    return this;
  }

  bold(on: boolean) {
    this.buffer.push(0x1B, 0x45, on ? 1 : 0);
    return this;
  }

  text(str: string) {
    for (let i = 0; i < str.length; i++) {
      this.buffer.push(str.charCodeAt(i));
    }
    return this;
  }

  textLine(str: string) {
    this.text(str);
    this.buffer.push(0x0A);
    return this;
  }

  feed(lines: number = 1) {
    this.buffer.push(0x1B, 0x64, lines);
    return this;
  }

  cut() {
    this.buffer.push(0x1D, 0x56, 0x41, 0x10); // Full cut
    return this;
  }

  // Helper for printing rows with left and right columns
  row(left: string, right: string, width: number = 32) {
    const spaceCount = width - left.length - right.length;
    if (spaceCount > 0) {
      this.textLine(left + ' '.repeat(spaceCount) + right);
    } else {
      // If it overflows, just print them separated by space
      this.textLine(left + ' ' + right);
    }
    return this;
  }

  // Draw a dashed line
  line(width: number = 32, char: string = '-') {
    this.textLine(char.repeat(width));
    return this;
  }

  getBuffer() {
    return new Uint8Array(this.buffer);
  }
}

export class BluetoothPrinter {
  private static device: any = null;
  private static server: any = null;
  private static characteristic: any = null;

  async connect(forcePrompt: boolean = false) {
    if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
      throw new Error('Web Bluetooth is not supported in this browser. Please use Chrome on Desktop or Android.');
    }

    // Reuse existing connection if valid and not forcing a prompt
    if (!forcePrompt && BluetoothPrinter.characteristic && BluetoothPrinter.device?.gatt?.connected) {
      return;
    }

    try {
      const COMMON_PRINTER_SERVICES = [
        '000018f0-0000-1000-8000-00805f9b34fb',
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2'
      ];
      const bt = (navigator as any).bluetooth;

      // 1. Try to auto-connect to previously permitted devices to bypass prompt
      if (!forcePrompt && bt.getDevices) {
        try {
          const devices = await bt.getDevices();
          if (devices.length > 0) {
            for (const d of devices) {
              try {
                BluetoothPrinter.device = d;
                // 5s timeout so it doesn't hang forever if the printer is off
                BluetoothPrinter.server = await Promise.race([
                  d.gatt.connect(),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
                ]);
                
                const services = await BluetoothPrinter.server.getPrimaryServices();
                for (const service of services) {
                  const characteristics = await service.getCharacteristics();
                  for (const char of characteristics) {
                    if (char.properties.write || char.properties.writeWithoutResponse) {
                      BluetoothPrinter.characteristic = char;
                      return; // Successfully auto-connected!
                    }
                  }
                }
              } catch (e) {
                this.disconnect(); // Failed to connect (off or out of range), try next
              }
            }
            // If we get here, we had permitted devices but NONE connected
            throw new Error("Could not connect to the paired printer. Please ensure it is turned on and in range, or use 'Connect New Printer'.");
          }
        } catch (e: any) {
          if (e.message.includes("Could not connect")) {
              throw e;
          }
          console.warn('Auto-connect to previously paired devices failed:', e);
        }
      }

      // 2. Fallback to requesting a new device via browser prompt
      BluetoothPrinter.device = await bt.requestDevice({
        acceptAllDevices: true,
        optionalServices: COMMON_PRINTER_SERVICES
      });

      BluetoothPrinter.server = await BluetoothPrinter.device.gatt.connect();

      // Find the writable characteristic
      const services = await BluetoothPrinter.server.getPrimaryServices();
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            BluetoothPrinter.characteristic = char;
            return; // Connected successfully
          }
        }
      }

      throw new Error('Could not find a writable Bluetooth characteristic on this device.');
    } catch (err: any) {
      this.disconnect();
      throw err;
    }
  }

  async print(escposData: Uint8Array) {
    if (!BluetoothPrinter.characteristic) {
      throw new Error('Printer not connected');
    }

    // Bluetooth LE typically has a 20-512 byte MTU (Maximum Transmission Unit).
    // It's safest to chunk the data into 256 byte segments to prevent buffer overruns.
    const CHUNK_SIZE = 256;
    for (let i = 0; i < escposData.length; i += CHUNK_SIZE) {
      const chunk = escposData.slice(i, i + CHUNK_SIZE);
      if (BluetoothPrinter.characteristic.properties.writeWithoutResponse) {
        await BluetoothPrinter.characteristic.writeValueWithoutResponse(chunk);
      } else {
        await BluetoothPrinter.characteristic.writeValue(chunk);
      }
      
      // Small delay between chunks to let the printer process
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  disconnect() {
    if (BluetoothPrinter.device && BluetoothPrinter.device.gatt.connected) {
      BluetoothPrinter.device.gatt.disconnect();
    }
    // We intentionally DO NOT clear the static variables here!
    // This allows the connection to remain active for the next print.
    // If the user forces a new connection, it will disconnect and reconnect naturally.
  }
}
