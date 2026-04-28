import type { ReactNode } from "react";
import bannerImg from "../../assets/images/banner.svg";
import { CTAButton } from "./CTAButton";
import type { ContentVariant } from "../../config/acf-schemas";

type ContentSectionProps = {
  title: string;
  /**
   * Override optionnel du titre : si fourni, remplace `title` dans le rendu.
   * Utilisé pour afficher un titre splitté (ex : "ECAL<br/>x<br/>Ateliers Firmann").
   */
  titleNode?: ReactNode;
  text: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl: string | null;
  imageAlt?: string;
  reversed: boolean;
  variant: ContentVariant;
};

export function ContentSection({
  title,
  titleNode,
  text,
  ctaLabel,
  ctaUrl,
  imageUrl,
  imageAlt,
  reversed,
  variant,
}: ContentSectionProps) {
  const directionClass = reversed
    ? "content-section--reversed"
    : "content-section--normal";
  const contentAlignClass = reversed
    ? "content-section-content--right"
    : "content-section-content--left";

  return (
    <div
      className={`content-section content-section--${variant} ${directionClass}`}
    >
      <div className="content-section-image">
        <img src={imageUrl ?? bannerImg} alt={imageAlt ?? ""} />
      </div>

      <div className={`content-section-content ${contentAlignClass}`}>
        <h2 className="content-section-title">{titleNode ?? title}</h2>
        <p className="content-section-text">{text}</p>

        {ctaLabel && ctaUrl && (
          <div className="content-section-cta-row">
            <CTAButton href={ctaUrl}>{ctaLabel}</CTAButton>
          </div>
        )}
      </div>
    </div>
  );
}
