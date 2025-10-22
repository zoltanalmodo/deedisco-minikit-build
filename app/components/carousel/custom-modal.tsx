"use client";

import { useEffect, useRef } from "react";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  allowClose?: boolean; // NEW: Control whether modal can be closed
}

export function CustomModal({ open, onClose, children, allowClose = true }: CustomModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && allowClose) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEsc);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose, allowClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={(e) => {
        console.log('🖱️ Overlay clicked - target:', e.target, 'overlayRef:', overlayRef.current, 'allowClose:', allowClose);
        // Only close if clicking the overlay (not the content) AND allowClose is true
        if (e.target === overlayRef.current && allowClose) {
          console.log('✅ Overlay click - closing modal');
          onClose();
        } else if (!allowClose) {
          console.log('🚫 Overlay click BLOCKED - allowClose is false');
        } else {
          console.log('⏸️ Click on content - not closing');
        }
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* Content */}
      <div 
        className="relative z-[101] w-[92vw] max-w-md animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => {
          console.log('🖱️ Content clicked - stopping propagation');
          e.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>
  );
}

