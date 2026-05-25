import { useEffect, useRef } from 'react';

interface UseBarcodeScannerProps {
    onScan: (barcode: string) => void;
    timeout?: number;
}

export function useBarcodeScanner({ onScan, timeout = 50 }: UseBarcodeScannerProps) {
    const barcodeBuffer = useRef<string>('');
    const lastKeyTime = useRef<number>(Date.now());

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input field, EXCEPT if they are focused on the global barcode search
            // We want the scanner to work globally, but not mess up manual typing in forms.
            const activeElement = document.activeElement as HTMLElement;
            const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
            
            // Allow scanning even if input is focused ONLY if it types fast enough.
            // But to be safe, if they are typing in a normal input, we let the default behavior happen unless it's an Enter key finalizing a rapid scan.

            const currentTime = Date.now();
            const timeDiff = currentTime - lastKeyTime.current;

            // If time between keystrokes is too long, reset the buffer (human typing)
            if (timeDiff > timeout) {
                barcodeBuffer.current = '';
            }

            // Only capture printable characters and Enter
            if (e.key === 'Enter') {
                if (barcodeBuffer.current.length > 2) {
                    // It's a valid barcode scan
                    e.preventDefault(); // Prevent form submission
                    onScan(barcodeBuffer.current);
                }
                barcodeBuffer.current = '';
            } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                barcodeBuffer.current += e.key;
            }

            lastKeyTime.current = currentTime;
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onScan, timeout]);
}
