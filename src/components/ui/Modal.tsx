import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Popup modale générique, rendue via portal sur <body>.
 * Fermeture : touche Échap, clic sur le fond, ou bouton de fermeture.
 * Bloque le scroll du body tant qu'elle est ouverte.
 */
type ModalProps = {
  onClose: () => void;
  labelledBy?: string;
  children: ReactNode;
};

export function Modal({ onClose, labelledBy, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
