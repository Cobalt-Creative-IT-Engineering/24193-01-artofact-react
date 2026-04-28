import { createPortal } from "react-dom";
import { NAV_ITEMS } from "../../config/site";
import type { NavChildItem } from "../../config/site";
import { useDuosList } from "../../hooks/useWordPress";
import logoDark from "../../assets/logo/artofact-dark.svg";
import { Footer } from "./Footer";

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

      <Footer showAddress />
    </div>
  );

  return createPortal(overlay, document.body);
}
