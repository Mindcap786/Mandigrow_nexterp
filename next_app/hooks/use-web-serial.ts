import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWebSerialProps {
    baudRate?: number;
    onData?: (data: string) => void;
    onWeightParsed?: (weight: number) => void;
}

export function useWebSerial({ baudRate = 9600, onData, onWeightParsed }: UseWebSerialProps = {}) {
    const [port, setPort] = useState<any | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rawWeight, setRawWeight] = useState<string>('');
    const [parsedWeight, setParsedWeight] = useState<number | null>(null);
    
    const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
    const keepReadingRef = useRef(true);

    // Auto-connect to previously approved ports
    useEffect(() => {
        if (!('serial' in navigator)) {
            setError('Web Serial API is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        const autoConnect = async () => {
            try {
                const ports = await (navigator as any).serial.getPorts();
                if (ports.length > 0) {
                    await connectToPort(ports[0]);
                }
            } catch (err) {
                console.error("Auto-connect failed", err);
            }
        };

        autoConnect();

        // Listen for disconnects
        const handleDisconnect = (e: Event) => {
            if ((e.target as any) === port) {
                disconnect();
                setError("Scale disconnected");
            }
        };
        (navigator as any).serial.addEventListener('disconnect', handleDisconnect);

        return () => {
            (navigator as any).serial.removeEventListener('disconnect', handleDisconnect);
        };
    }, []);

    const parseWeight = (dataString: string) => {
        // Most scales output something like: "ST,GS,+  10.50kg\r\n" or "= 10.50 kg"
        // We want to extract the first positive decimal number we find.
        const matches = dataString.match(/(\d+\.\d+|\d+)/);
        if (matches && matches[0]) {
            const weight = parseFloat(matches[0]);
            if (!isNaN(weight)) {
                setParsedWeight(weight);
                if (onWeightParsed) onWeightParsed(weight);
            }
        }
    };

    const readLoop = async (currentPort: any) => {
        while (currentPort.readable && keepReadingRef.current) {
            readerRef.current = currentPort.readable.getReader();
            try {
                let buffer = '';
                while (keepReadingRef.current) {
                    const { value, done } = await readerRef.current.read();
                    if (done) break;
                    
                    // Decode uint8array to string
                    const chunk = new TextDecoder().decode(value);
                    buffer += chunk;
                    
                    if (onData) onData(chunk);

                    // Parse lines (usually delimited by \n or \r)
                    if (buffer.includes('\\n') || buffer.includes('\\r')) {
                        const lines = buffer.split(/[\\r\\n]+/);
                        // Keep the last incomplete line in buffer
                        buffer = lines.pop() || '';
                        
                        // Process complete lines
                        for (const line of lines) {
                            if (line.trim()) {
                                setRawWeight(line.trim());
                                parseWeight(line);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Read error:", error);
                setError("Error reading from scale");
            } finally {
                readerRef.current.releaseLock();
            }
        }
    };

    const connectToPort = async (selectedPort: any) => {
        try {
            await selectedPort.open({ baudRate });
            setPort(selectedPort);
            setIsConnected(true);
            setError(null);
            keepReadingRef.current = true;
            readLoop(selectedPort);
        } catch (err: any) {
            console.error("Failed to open port:", err);
            setError(err.message || "Failed to connect to scale");
            setIsConnected(false);
        }
    };

    const requestConnection = async () => {
        try {
            if (!('serial' in navigator)) {
                setError('Web Serial API is not supported in this browser.');
                return;
            }
            const selectedPort = await (navigator as any).serial.requestPort();
            await connectToPort(selectedPort);
        } catch (err: any) {
            // User cancelled selection or error
            console.warn("Connection request cancelled or failed", err);
        }
    };

    const disconnect = useCallback(async () => {
        keepReadingRef.current = false;
        if (readerRef.current) {
            await readerRef.current.cancel();
        }
        if (port) {
            try {
                await port.close();
            } catch (e) {
                console.error("Error closing port", e);
            }
        }
        setPort(null);
        setIsConnected(false);
        setRawWeight('');
        setParsedWeight(null);
    }, [port]);

    return {
        isConnected,
        rawWeight,
        parsedWeight,
        error,
        requestConnection,
        disconnect
    };
}
