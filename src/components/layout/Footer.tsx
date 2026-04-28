import { SOCIAL_LINKS } from "../../config/site";
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
          <div className="footer-social">
            <p className="footer-social-title">Suivez-nous&nbsp;!</p>
            <ul className="footer-social-icons">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={name}
                    className="footer-social-icon"
                  >
                    <img src={SOCIAL_ICONS[name]} alt="" className="footer-social-icon-img" />
                  </a>
                </li>
              ))}
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
