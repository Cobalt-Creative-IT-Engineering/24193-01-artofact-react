import { useEffect, useState } from "react";
import { LogoPlaceholder } from "../ui";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav-wrapper${scrolled ? " nav-wrapper--scrolled" : ""}`}>
      <div className="nav-inner">
        {/* Placeholder left — même largeur que le burger pour équilibrer */}
        <div className="nav-side" aria-hidden="true" />

        <a href="/" className="nav-logo" aria-label="Artofact — accueil">
          <LogoPlaceholder style={{ width: "7rem", height: "auto", color: "#E8E6E1" }} />
        </a>

        {/* Burger visuel uniquement — le menu full-screen sera implémenté séparément */}
        <div className="nav-side nav-side--right">
          <button
            type="button"
            className="nav-burger"
            aria-label="Menu"
            aria-expanded="false"
          >
            <span className="nav-burger-line" />
            <span className="nav-burger-line" />
          </button>
        </div>
      </div>
    </header>
  );
}
