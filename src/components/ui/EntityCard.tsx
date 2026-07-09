import bannerImg from "../../assets/images/banner.svg";
import iconLink from "../../assets/icon/icon_link.svg";
import { RichText } from "./RichText";
import { htmlToText } from "../../lib/utils";

/**
 * Carte « entité » (artiste, entreprise, partenaire) : titre + image/logo +
 * présentation (HTML WYSIWYG) + lien externe. Utilisée sur la page détail d'un
 * duo (artiste / entreprise) et sur la page partenaires.
 * `small` : variante compacte (padding réduit, logo en `contain`).
 */
export type EntityCardProps = {
  name: string;
  text?: string;              // HTML WYSIWYG (présentation / description)
  photoUrl: string | null;
  photoAlt?: string;
  linkUrl?: string | null;
  small?: boolean;
  /**
   * Si fourni, la carte n'affiche pas la présentation inline : elle montre un
   * bouton « Voir le descriptif » qui appelle ce callback (ouverture d'une
   * popup gérée par le parent). Sinon, comportement par défaut (texte + lien).
   */
  onOpenDetail?: () => void;
};

export function EntityCard({ name, text, photoUrl, photoAlt, linkUrl, small, onOpenDetail }: EntityCardProps) {
  return (
    <article className={`duo-member-card${small ? " duo-member-card--small" : ""}`}>
      <h3 className="duo-member-card-name">{name}</h3>
      <div className="duo-member-card-photo">
        <img src={photoUrl ?? bannerImg} alt={photoAlt ?? name} />
      </div>
      {onOpenDetail
        ? text && <p className="duo-member-card-excerpt">{htmlToText(text)}</p>
        : text && <RichText html={text} className="duo-member-card-text" />}
      <div className="duo-member-card-cta-row">
        {onOpenDetail ? (
          <button type="button" className="btn-cta" onClick={onOpenDetail}>
            Voir le descriptif
          </button>
        ) : linkUrl ? (
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="btn-cta">
            <img src={iconLink} alt="" className="btn-cta-icon" />
            {name}
          </a>
        ) : (
          <span className="btn-cta">
            <img src={iconLink} alt="" className="btn-cta-icon" />
            {name}
          </span>
        )}
      </div>
    </article>
  );
}
