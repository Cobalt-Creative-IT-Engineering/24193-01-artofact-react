import { SOCIAL_LINKS } from "../../config/site";
import logoDark from "../../assets/logo/artofact-dark.svg";
import mobiliereLogo from "../../assets/images/partners/mobiliere.svg";
import fpeLogo from "../../assets/images/partners/fpe.svg";

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#E8E6E1" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<string, () => JSX.Element> = {
  instagram: IconInstagram,
  linkedin:  IconLinkedIn,
  youtube:   IconYoutube,
};

export function Footer() {
  const socials = Object.entries(SOCIAL_LINKS).filter(([, url]) => !!url) as [keyof typeof SOCIAL_LINKS, string][];

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Gauche : logo */}
        <div>
          <a href="/" aria-label="Artofact — accueil">
            <img src={logoDark} alt="Artofact" className="footer-logo-img" />
          </a>
        </div>

        {/* Centre : réseaux sociaux */}
        {socials.length > 0 && (
          <div>
            <p className="footer-social-title">Suivez-nous&nbsp;!</p>
            <ul className="footer-social-icons">
              {socials.map(([name, url]) => {
                const Icon = SOCIAL_ICONS[name];
                return (
                  <li key={name}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={name}
                      className="footer-social-icon"
                    >
                      {Icon ? <Icon /> : <span>{name}</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Droite : presenting partners */}
        <div className="footer-col-end">
          <p className="footer-partners-title">Presenting partners:</p>
          <div className="footer-partners-row">
            <img src={mobiliereLogo} alt="la Mobilière" className="footer-partner-logo" />
            <img src={fpeLogo} alt="FPE — Fédération Patronale et Économique" className="footer-partner-logo" />
          </div>
        </div>

      </div>
    </footer>
  );
}
