import { useACFOptionsPage } from "../hooks/useWordPress";
import { acfReader } from "../components/acf";
import { ConceptACF } from "../config/acf-schemas";
import type { ConceptSectionItem, ContentVariant } from "../config/acf-schemas";
import { ContentSection, CTAButton } from "../components/ui";

// ─── Lorem ipsum (placeholders pré-prod tant que WP n'a pas de contenu) ───

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.";

const FAKE_SECTIONS: ConceptSectionItem[] = [
  { title: "Mêler art et industrie",         text: LOREM, image: null, cta_label: "Découvrir", cta_url: "/duos", variant: "dark"   },
  { title: "Des duos favorisant l'échange",  text: LOREM, image: null, cta_label: "Découvrir", cta_url: "/duos", variant: "light"  },
  { title: "Mêler art et industrie",         text: LOREM, image: null, cta_label: "Découvrir", cta_url: "/duos", variant: "dark"   },
  { title: "L'art s'inscrit dans la ville",  text: LOREM, image: null, cta_label: "Découvrir", cta_url: "/duos", variant: "accent" },
];

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

// ─── Page ─────────────────────────────────────────────────────────────────

export function ConceptPage() {
  const { data, status } = useACFOptionsPage("concept");
  const concept = acfReader(data, ConceptACF);

  const heroTitle = concept.text("heroTitle") || "Le concept";
  const heroText  = concept.text("heroText")  || (status !== "loading" ? LOREM : "");
  const sections  = concept.repeater<ConceptSectionItem>("sections");
  const list      = sections.length > 0 ? sections : FAKE_SECTIONS;

  return (
    <main className="concept-main">
      <ConceptHero title={heroTitle} text={heroText} />

      {list.map((item, i) => {
        const variant: ContentVariant = item.variant ?? (i % 2 === 0 ? "dark" : "light");
        const imageUrl = item.image && typeof item.image === "object" && "url" in item.image
          ? item.image.url
          : null;
        const imageAlt = item.image && typeof item.image === "object" && "alt" in item.image
          ? (item.image.alt ?? "")
          : "";

        // Variant accent sans image → rendu en card (titre + texte + CTA, fond turquoise)
        if (variant === "accent" && !imageUrl) {
          return (
            <ConceptCard
              key={i}
              title={item.title ?? ""}
              text={item.text ?? ""}
              ctaLabel={item.cta_label}
              ctaUrl={item.cta_url}
            />
          );
        }

        return (
          <ContentSection
            key={i}
            title={item.title ?? ""}
            text={item.text ?? ""}
            ctaLabel={item.cta_label}
            ctaUrl={item.cta_url}
            imageUrl={imageUrl}
            imageAlt={imageAlt}
            reversed={i % 2 !== 0}
            variant={variant}
          />
        );
      })}
    </main>
  );
}
