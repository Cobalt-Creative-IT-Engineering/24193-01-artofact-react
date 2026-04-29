import { useEffect, useState } from "react";
import logoWhite from "../../assets/logo/artofact-white.svg";
import iconBurgerOpen from "../../assets/icon/icon_burger_open.svg";
import { NavOverlay } from "./NavOverlay";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll lock quand l'overlay est ouvert
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Fermeture via Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <>
      <header className={`nav-wrapper${scrolled ? " nav-wrapper--scrolled" : ""}`}>
        <div className="nav-inner">
          {/* Placeholder left — même largeur que le burger pour équilibrer */}
          <div className="nav-side" aria-hidden="true" />

          <a href="/" className="nav-logo" aria-label="Artofact — accueil">
            <img src={logoWhite} alt="Artofact" className="nav-logo-img" />
          </a>

          <div className="nav-side nav-side--right">
            <button
              type="button"
              className="nav-toggle"
              aria-label="Menu"
              aria-expanded={isOpen}
              onClick={() => setIsOpen(o => !o)}
            >
              <img src={iconBurgerOpen} alt="" className="nav-toggle-icon" />
            </button>
          </div>
        </div>
      </header>

      {isOpen && <NavOverlay onClose={() => setIsOpen(false)} />}
    </>
  );
}
