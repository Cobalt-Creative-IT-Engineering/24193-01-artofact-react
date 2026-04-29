import { createPortal } from "react-dom";
import { NAV_ITEMS, SOCIAL_LINKS } from "../../config/site";
import type { NavChildItem } from "../../config/site";
import { useDuosList } from "../../hooks/useWordPress";
import logoDark from "../../assets/logo/artofact-dark.svg";
import mobiliereLogo from "../../assets/images/partners/mobiliere.svg";
import fpeLogo from "../../assets/images/partners/fpe.svg";
import iconInstagram from "../../assets/icon/icon_instagram.svg";
import iconLinkedin from "../../assets/icon/icon_linkedin.svg";
import iconYoutube from "../../assets/icon/icon_youtube.svg";

const SOCIAL_ICONS: Record<keyof typeof SOCIAL_LINKS, string> = {
  instagram: iconInstagram,
  linkedin:  iconLinkedin,
  youtube:   iconYoutube,
};

type Props = { onClose: () => void };

export function NavOverlay({ onClose }: Props) {
  const primaryItems = NAV_ITEMS.filter(i => !i.children);
  const itemsWithChildren = NAV_ITEMS.filter(i => i.children);

  // Charge dynamiquement les duos depuis le CPT pour alimenter le sous-menu
  // de l'item "/duos". Fallback sur les children hardcodés de NAV_ITEMS
  // tant que la liste GraphQL est vide (pré-prod, loading, erreur).
  const { data: duosData } = useDuosList();
  const dynamicChildrenForItem = (url: string): readonly NavChildItem[] | undefined => {
    if (url !== "/duos" || !duosData || duosData.length === 0) return undefined;
    return duosData.map(d => ({ id: d.slug, title: d.title, url: `/duos/${d.slug}` }));
  };

  // On affiche TOUTES les icônes (instagram, linkedin, youtube) — celles
  // sans URL sont rendues désactivées en attendant le lien réel.
  const socials = Object.entries(SOCIAL_LINKS) as [keyof typeof SOCIAL_LINKS, string][];

  const overlay = (
    <div className="nav-overlay" role="dialog" aria-modal="true" aria-label="Navigation">
      <div className="nav-overlay-header">
        <div aria-hidden="true" />
        <a href="/" className="nav-overlay-logo" onClick={onClose} aria-label="Artofact — accueil">
          <img src={logoDark} alt="Artofact" />
        </a>
        <div className="nav-overlay-close">
          <button type="button" className="nav-overlay-close-btn" onClick={onClose} aria-label="Fermer le menu">
            <span className="nav-overlay-close-line" />
          </button>
        </div>
      </div>

      <nav className="nav-overlay-body" aria-label="Navigation principale">
        <div className="nav-overlay-col">
          {primaryItems.map(item => (
            <a key={item.id} href={item.url} className="nav-overlay-link" onClick={onClose}>
              {item.title}
            </a>
          ))}
        </div>
        <div className="nav-overlay-col">
          {itemsWithChildren.map(item => {
            const children = dynamicChildrenForItem(item.url) ?? item.children;
            return (
              <div key={item.id}>
                <a href={item.url} className="nav-overlay-link" onClick={onClose}>
                  {item.title}
                </a>
                {children && children.length > 0 && (
                  <div className="nav-overlay-sublinks">
                    {children.map(child => (
                      <a key={child.id} href={child.url} className="nav-overlay-sublink" onClick={onClose}>
                        {child.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="nav-overlay-footer">
        <div className="nav-overlay-footer-inner">
          <address className="nav-overlay-footer-address">
            Artôfact<br />
            p.a. FPE<br />
            Rue de la Condémine 56<br />
            1630 Bulle
          </address>

          <div className="nav-overlay-footer-social">
            <p className="nav-overlay-footer-title">Suivez-nous&nbsp;!</p>
            <ul className="nav-overlay-footer-social-icons">
              {socials.map(([name, url]) => (
                <li key={name}>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={name}
                      className="nav-overlay-footer-social-icon"
                    >
                      <img src={SOCIAL_ICONS[name]} alt="" />
                    </a>
                  ) : (
                    <span
                      aria-label={`${name} (bientôt disponible)`}
                      className="nav-overlay-footer-social-icon nav-overlay-footer-social-icon--disabled"
                    >
                      <img src={SOCIAL_ICONS[name]} alt="" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="nav-overlay-footer-partners">
            <p className="nav-overlay-footer-title">Presenting partners:</p>
            <div className="nav-overlay-footer-partners-row">
              <img src={mobiliereLogo} alt="la Mobilière" />
              <img src={fpeLogo} alt="FPE — Fédération Patronale et Économique" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
