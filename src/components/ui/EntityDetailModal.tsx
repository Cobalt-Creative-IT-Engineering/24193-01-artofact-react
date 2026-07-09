import { Modal } from "./Modal";
import { RichText } from "./RichText";

/**
 * Popup de détail d'une entité (partenaire, entreprise, artiste) :
 * nom + logo + descriptif complet (HTML WYSIWYG) + lien externe.
 * Contrepartie « détail » de <EntityCard onOpenDetail>.
 */
type EntityDetailModalProps = {
  name: string;
  text?: string;              // HTML WYSIWYG
  photoUrl?: string | null;
  photoAlt?: string;
  linkUrl?: string | null;
  linkLabel?: string;
  onClose: () => void;
};

export function EntityDetailModal({
  name,
  text,
  photoUrl,
  photoAlt,
  linkUrl,
  linkLabel = "Visiter le site",
  onClose,
}: EntityDetailModalProps) {
  return (
    <Modal onClose={onClose} labelledBy="entity-modal-title">
      <h3 id="entity-modal-title" className="entity-modal-title">{name}</h3>
      {photoUrl && (
        <div className="entity-modal-logo">
          <img src={photoUrl} alt={photoAlt || name} />
        </div>
      )}
      {text && <RichText html={text} className="entity-modal-text" />}
      {linkUrl && (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cta entity-modal-cta"
        >
          {linkLabel}
        </a>
      )}
    </Modal>
  );
}
