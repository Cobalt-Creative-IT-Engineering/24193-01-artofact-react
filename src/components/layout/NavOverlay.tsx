import { createPortal } from "react-dom";
import { NAV_ITEMS } from "../../config/site";
import logoDark from "../../assets/logo/artofact-dark.svg";
import { Footer } from "./Footer";

type Props = { onClose: () => void };

export function NavOverlay({ onClose }: Props) {
  const primaryItems = NAV_ITEMS.filter(i => !i.children);
  const itemsWithChildren = NAV_ITEMS.filter(i => i.children);

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
          {itemsWithChildren.map(item => (
            <div key={item.id}>
              <a href={item.url} className="nav-overlay-link" onClick={onClose}>
                {item.title}
              </a>
              {item.children && (
                <div className="nav-overlay-sublinks">
                  {item.children.map(child => (
                    <a key={child.id} href={child.url} className="nav-overlay-sublink" onClick={onClose}>
                      {child.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      <Footer />
    </div>
  );

  return createPortal(overlay, document.body);
}
