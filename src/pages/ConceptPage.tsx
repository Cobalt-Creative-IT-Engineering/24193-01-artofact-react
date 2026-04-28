import { useConceptContent } from "../hooks/useWordPress";
import type { AcfLink, PageSection, PageSectionTextOnly } from "../config/acf-schemas";
import { ContentSection, CTAButton } from "../components/ui";

// ─── Lorem ipsum (placeholders pré-prod tant que WP n'a pas de contenu) ───

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.";

// ─── Hero (composant local non exporté) ───────────────────────────────────

function ConceptHero({ title, text }: { title: string; text: string }) {
  return (
    <section className="concept-hero" aria-label="Le concept">
      <div className="concept-hero-inner">
        <h1 className="concept-hero-title">{title}</h1>
        <p className="concept-hero-text">{text}</p>
      </div>
    </section>
  );
}

// ─── Card sans image (variant accent) ─────────────────────────────────────

type ConceptCardProps = {
  title: string;
  text: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

function ConceptCard({ title, text, ctaLabel, ctaUrl }: ConceptCardProps) {
  return (
    <article className="concept-card">
      <h2 className="concept-card-title">{title}</h2>
      <div className="concept-card-content">
        <p className="concept-card-text">{text}</p>
        {ctaLabel && ctaUrl && (
          <div className="concept-card-cta-row">
            <CTAButton href={ctaUrl}>{ctaLabel}</CTAButton>
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function linkProps(lien: AcfLink | null | undefined): { href: string; label: string } | null {
  if (!lien?.url) return null;
  return { href: lien.url, label: lien.title || "Découvrir" };
}

function imageProps(image: PageSection["image"]): { url: string | null; alt: string } {
  return {
    url: image?.node.sourceUrl ?? null,
    alt: image?.node.altText ?? "",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────

export function ConceptPage() {
  const { data, status } = useConceptContent();
  const enTete     = data?.enTete;
  const zoneGrise  = data?.zoneGrise;
  const carte      = data?.carte;
  const piedDePage = data?.piedDePage;

  const heroTitle = enTete?.titre || "Le concept";
  const heroText  = enTete?.texte || (status !== "loading" ? LOREM : "");

  return (
    <main className="concept-main">
      <ConceptHero title={heroTitle} text={heroText} />

      {/* Section grise (variant light) — rendue en pleine largeur via CSS */}
      {(zoneGrise?.titre || zoneGrise?.texte) && (
        <ConceptListSection
          item={zoneGrise}
          variant="light"
          reversed={false}
        />
      )}

      {/* Pied-de-page (variant dark, image à gauche) */}
      {(piedDePage?.titre || piedDePage?.texte) && (
        <ConceptListSection
          item={piedDePage}
          variant="dark"
          reversed
        />
      )}

      {/* Card accent — sans image */}
      {(carte?.titre || carte?.texte) && (
        <ConceptCard
          title={carte.titre ?? ""}
          text={carte.texte ?? ""}
          {...(linkProps(carte.lien) && {
            ctaLabel: linkProps(carte.lien)!.label,
            ctaUrl:   linkProps(carte.lien)!.href,
          })}
        />
      )}
    </main>
  );
}

// ─── Section avec image (zoneGrise / piedDePage) ─────────────────────────

function ConceptListSection({
  item,
  variant,
  reversed,
}: {
  item: PageSection | PageSectionTextOnly;
  variant: "dark" | "light" | "accent";
  reversed: boolean;
}) {
  const img = "image" in item ? imageProps(item.image) : { url: null, alt: "" };
  const cta = linkProps(item.lien);
  return (
    <ContentSection
      title={item.titre ?? ""}
      text={item.texte ?? ""}
      imageUrl={img.url}
      imageAlt={img.alt}
      reversed={reversed}
      variant={variant}
      {...(cta && { ctaLabel: cta.label, ctaUrl: cta.href })}
    />
  );
}
