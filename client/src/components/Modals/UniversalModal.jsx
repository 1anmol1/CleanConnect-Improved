import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './UniversalModal.css';

const UniversalModal = ({ isOpen, onClose, children }) => {
  const overlayRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div 
      className="universal-modal-overlay" 
      ref={overlayRef} 
      onClick={handleOverlayClick}
    >
      <div 
        className="universal-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default UniversalModal;

