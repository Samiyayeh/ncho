import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export function QrScanner({ onScanSuccess, onScanError }: QrScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Check if element exists before initializing
    if (!document.getElementById("reader")) return;

    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Stop scanning after successful read to prevent duplicate calls
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        if (onScanError) onScanError(errorMessage);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="reader" className="w-full rounded-lg overflow-hidden border-2 border-gray-300"></div>
      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
    </div>
  );
}
