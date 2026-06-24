import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';

interface UseBarcodeScannerProps {
    onScan: (barcode: string) => void;
    timeout?: number;
}

export function useBarcodeScanner({ onScan, timeout = 50 }: UseBarcodeScannerProps) {
    const barcodeBuffer = useRef<string>('');
    const lastKeyTime = useRef<number>(Date.now());
    const { profile } = useAuth();
    const { toast } = useToast();
    const orgId = profile?.organization_id;

    // Use a ref for onScan so we don't have to put it in the dependency array
    // which could cause the useEffect to re-bind constantly if onScan isn't memoized
    const onScanRef = useRef(onScan);
    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const currentTime = Date.now();
            const timeDiff = currentTime - lastKeyTime.current;

            if (timeDiff > timeout) {
                barcodeBuffer.current = '';
            }

            if (e.key === 'Enter') {
                if (barcodeBuffer.current.length > 2) {
                    e.preventDefault(); 
                    
                    let finalBarcode = barcodeBuffer.current;
                    
                    if (finalBarcode.startsWith('MGC|')) {
                        const parts = finalBarcode.split('|');
                        if (parts.length >= 3) {
                            const scannedOrgId = parts[1];
                            if (orgId && scannedOrgId !== orgId) {
                                toast({ 
                                    title: "Security Error", 
                                    description: "This ID Card belongs to a different Mandi!", 
                                    variant: "destructive" 
                                });
                                barcodeBuffer.current = '';
                                return;
                            }
                            finalBarcode = parts.slice(2).join('|');
                        }
                    }

                    // Blur active element to prevent leftover focus bugs on inputs
                    if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                    }

                    onScanRef.current(finalBarcode);
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
    }, [timeout, orgId, toast]);
}
