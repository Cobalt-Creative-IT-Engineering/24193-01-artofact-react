import { useEffect } from "react";
import { useDuoBySlug } from "../hooks/useWordPress";
import type { DuoNode, DuoArtiste, DuoEntreprise, AcfLink } from "../config/acf-schemas";
import { CTAButton, Sticker } from "../components/ui";
import { formatDuoTitle } from "../lib/utils";
import { setPageMeta } from "../lib/meta";
import bannerImg from "../assets/images/banner.svg";
import iconLink from "../assets/icon/icon_link.svg";

// ─── Lorem ipsum placeholder ──────────────────────────────────────────────

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.";

// ─── Fake data (affiché si WP retourne null après chargement) ────────────

const FAKE_DUO_DETAIL: DuoNode = {
  slug:  "matthia-gremaud-x-morand-construction",
  title: "Matthia Gremaud x Morand construction",
  duoFields: {
    titre:     "Matthia Gremaud x Morand construction",
    sousTitre: "Un duo gravé dans le métal",
    texte:     LOREM,
    artiste: {
      nom: "Matthia Gremaud",
      descriptionArtiste: LOREM,
    },
    entreprise: {
      nom: "Morand construction",
      descriptionEntreprise: LOREM,
    },
  },
};

// ─── Hero détail ─────────────────────────────────────────────────────────

type DuoDetailHeroProps = {
  title:    string;
  subtitle: string;
  text:     string;
  imageUrl: string | null;
  imageAlt: string;
};

function DuoDetailHero({ title, subtitle, text, imageUrl, imageAlt }: DuoDetailHeroProps) {
  return (
    <section className="duo-detail-hero" aria-label={title}>
      <Sticker name="04" className="duo-detail-hero-sticker" />
      <div className="duo-detail-hero-inner">
        <h1 className="duo-detail-hero-title">{formatDuoTitle(title)}</h1>
        <div className="duo-detail-hero-row">
          <div className="duo-detail-hero-content">
            {subtitle && <p className="duo-detail-hero-subtitle">{subtitle}</p>}
            {text && <p className="duo-detail-hero-text">{text}</p>}
          </div>
          <div className="duo-detail-hero-image">
            <img src={imageUrl ?? bannerImg} alt={imageAlt || title} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Card Artiste / Entreprise ────────────────────────────────────────────

type DuoMemberCardProps = {
  name: string;
  text: string;
  photoUrl: string | null;
  photoAlt: string;
  link?: AcfLink | null;
};

function DuoMemberCard({ name, text, photoUrl, photoAlt, link }: DuoMemberCardProps) {
  const cta = link?.url
    ? { href: link.url, label: link.title || name }
    : null;
  return (
    <article className="duo-member-card">
      <h3 className="duo-member-card-name">{name}</h3>
      <div className="duo-member-card-photo">
        <img src={photoUrl ?? bannerImg} alt={photoAlt} />
      </div>
      {text && <p className="duo-member-card-text">{text}</p>}
      <div className="duo-member-card-cta-row">
        {cta ? (
          <a href={cta.href} target={link?.target ?? "_blank"} rel="noopener noreferrer" className="btn-cta">
            <img src={iconLink} alt="" className="btn-cta-icon" />
            {cta.label}
          </a>
        ) : (
          <span className="btn-cta">
            <img src={iconLink} alt="" className="btn-cta-icon" />
            {name}
          </span>
        )}
      </div>
    </article>
  );
}

// ─── Helpers d'extraction ────────────────────────────────────────────────

function artisteCardProps(artiste: DuoArtiste | null | undefined): DuoMemberCardProps | null {
  const name = artiste?.nom?.trim();
  if (!name) return null;
  return {
    name,
    text:     artiste?.descriptionArtiste ?? "",
    photoUrl: artiste?.imageArtiste?.node.sourceUrl ?? null,
    photoAlt: artiste?.imageArtiste?.node.altText ?? name,
    link:     artiste?.lienArtiste ?? null,
  };
}

function entrepriseCardProps(entreprise: DuoEntreprise | null | undefined): DuoMemberCardProps | null {
  const name = entreprise?.nom?.trim();
  if (!name) return null;
  return {
    name,
    text:     entreprise?.descriptionEntreprise ?? "",
    photoUrl: entreprise?.imageEntreprise?.node.sourceUrl ?? null,
    photoAlt: entreprise?.imageEntreprise?.node.altText ?? name,
    link:     entreprise?.lienEntreprise ?? null,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────

export function DuoDetailPage({ slug }: { slug: string }) {
  const { data, status } = useDuoBySlug(slug);

  // Si loading sans donnée en cache, on ne rend rien (pas de flash fake → réel).
  // Si status success mais data null, on utilise le fake.
  const duo: DuoNode | null =
    status === "loading" && !data
      ? null
      : (data ?? FAKE_DUO_DETAIL);

  const titleRendered = duo?.title ?? "";
  const fields        = duo?.duoFields ?? {};
  const heroSubtitle  = fields.sousTitre ?? "";
  const heroText      = fields.texte ?? "";
  const heroImageUrl  = fields.image?.node.sourceUrl ?? null;
  const heroImageAlt  = fields.image?.node.altText ?? "";

  const artisteProps    = artisteCardProps(fields.artiste);
  const entrepriseProps = entrepriseCardProps(fields.entreprise);

  useEffect(() => {
    if (!titleRendered) return;
    setPageMeta({ title: titleRendered });
  }, [titleRendered]);

  if (!duo) return null;

  return (
    <main className="duo-detail-main">
      <DuoDetailHero
        title={titleRendered}
        subtitle={heroSubtitle}
        text={heroText}
        imageUrl={heroImageUrl}
        imageAlt={heroImageAlt}
      />

      {(artisteProps || entrepriseProps) && (
        <section className="duo-detail-members" aria-label="Membres du duo">
          <div className="duo-detail-members-inner">
            <div className="duo-detail-members-grid">
              {artisteProps    && <DuoMemberCard {...artisteProps} />}
              {entrepriseProps && <DuoMemberCard {...entrepriseProps} />}
            </div>
          </div>
        </section>
      )}

      <div className="duo-detail-more">
        <CTAButton href="/duos">Les autres duos</CTAButton>
      </div>
    </main>
  );
}
