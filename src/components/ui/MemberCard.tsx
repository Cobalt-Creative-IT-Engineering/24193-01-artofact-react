import { CTAButton } from "./CTAButton";
import bannerImg from "../../assets/images/banner.svg";

type Props = {
  name: string;
  photoUrl: string | null;
  photoAlt?: string;
  text: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export function MemberCard({
  name,
  photoUrl,
  photoAlt = "",
  text,
  ctaLabel,
  ctaUrl,
}: Props) {
  const isExternal = !!ctaUrl && /^https?:\/\//.test(ctaUrl);

  return (
    <article className="member-card">
      <div className="member-card-photo">
        <img src={photoUrl ?? bannerImg} alt={photoAlt} />
      </div>
      <h3 className="member-card-name">{name}</h3>
      {text && <p className="member-card-text">{text}</p>}
      {ctaLabel && ctaUrl && (
        <div className="member-card-cta">
          {isExternal ? (
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta"
            >
              {ctaLabel}
            </a>
          ) : (
            <CTAButton href={ctaUrl}>{ctaLabel}</CTAButton>
          )}
        </div>
      )}
    </article>
  );
}
