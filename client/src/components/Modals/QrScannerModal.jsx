import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import UniversalModal from './UniversalModal';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const QrScannerModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // This effect only runs when the modal is open to set up the scanner
    if (isOpen) {
      let scanner; // Define scanner here to be accessible in the cleanup function

      // This function runs when the scanner successfully detects any QR code.
      const onScanSuccess = (decodedText, decodedResult) => {
        
        // --- THE FIX IS HERE ---
        // 1. We use a try...catch block to safely handle any scanned data.
        try {
          // 2. We use the standard 'URL' constructor to parse the scanned text.
          // This is the robust way to handle full URLs like yours.
          const url = new URL(decodedText);
          
          // 3. We check if the path is correct and if it has a 'binId' parameter.
          const binId = url.searchParams.get('binId');
          
          if (url.pathname === '/citizen/report' && binId) {
            // Success! We found a valid bin URL.
            toast.success(`Bin ${binId} scanned! Redirecting...`);
            
            // It's crucial to stop the scanner to turn off the camera before navigating.
            if (scanner) {
              scanner.clear().catch(error => console.error("Failed to clear scanner on success.", error));
            }
            
            onClose(); // Close the modal
            navigate(`/citizen/report?binId=${binId}`); // Navigate to the report page
          } else {
            // The URL is valid, but it's not a bin URL we recognize.
            toast.warn("Scanned QR code is not a valid CleanConnect bin URL.");
          }
        } catch (error) {
          // This block runs if the scanned text is not a valid URL at all (e.g., just plain text).
          toast.error("Scanned QR code is not a valid URL.");
        }
      };

      const onScanFailure = (error) => {
        // This function is called frequently as the camera searches, so we keep it silent.
      };

      // Create and render the scanner instance
      scanner = new Html5QrcodeScanner(
        "qr-reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false // verbose logging
      );
      scanner.render(onScanSuccess, onScanFailure);

      // This is the cleanup function that runs when the modal closes.
      // It ensures the camera is always turned off.
      return () => {
        if (scanner) {
          scanner.clear().catch(error => {
            // This can sometimes throw a harmless error if the component unmounts quickly.
            console.warn("Scanner cleanup issue (can often be ignored):", error);
          });
        }
      };
    }
  }, [isOpen, navigate, onClose]); // Dependencies are correct.

  return (
    <UniversalModal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h2>Scan Bin QR Code</h2>
        <button onClick={onClose} className="modal-close-btn"><FaTimes /></button>
      </div>
      <div style={{ padding: '1rem', background: '#f0f2f5' }}>
        {/* This div is the target for the Html5QrcodeScanner library. */}
        <div id="qr-reader"></div>
        <p style={{ color: '#333', textAlign: 'center', marginTop: '1rem', fontWeight: '500' }}>
          Point your camera at the QR code on the dustbin.
        </p>
      </div>
    </UniversalModal>
  );
};

export default QrScannerModal;