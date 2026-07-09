import { useEffect } from "react";
import { useDuoBySlug } from "../hooks/useWordPress";
import type { DuoNode, ArtisteNode, PartenaireNode } from "../config/acf-schemas";
import { CTAButton, Sticker, RichText, EntityCard } from "../components/ui";
import type { EntityCardProps } from "../components/ui";
import { formatDuoTitle } from "../lib/utils";
import { setPageMeta } from "../lib/meta";
import bannerImg from "../assets/images/banner.svg";

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
      nodes: [{ slug: "matthia-gremaud", title: "Matthia Gremaud", artistes: { presentation: LOREM } }],
    },
    entreprise: {
      nodes: [{ slug: "morand-construction", title: "Morand construction", partenaires: { presentation: LOREM } }],
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
            {text && <RichText html={text} className="duo-detail-hero-text" />}
          </div>
          <div className="duo-detail-hero-image">
            <img src={imageUrl ?? bannerImg} alt={imageAlt || title} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Helpers d'extraction (relations Artiste / Partenaire) ───────────────

function artisteCardProps(rel: { nodes: ArtisteNode[] } | null | undefined): EntityCardProps | null {
  const node = rel?.nodes?.[0];
  const name = node?.title?.trim();
  if (!name) return null;
  const f = node?.artistes;
  return {
    name,
    text:     f?.presentation ?? "",
    photoUrl: f?.logo?.node.sourceUrl ?? null,
    photoAlt: f?.logo?.node.altText ?? name,
    linkUrl:  f?.lien ?? null,
  };
}

function entrepriseCardProps(rel: { nodes: PartenaireNode[] } | null | undefined): EntityCardProps | null {
  const node = rel?.nodes?.[0];
  const name = node?.title?.trim();
  if (!name) return null;
  const f = node?.partenaires;
  return {
    name,
    text:     f?.presentation ?? "",
    photoUrl: f?.logo?.node.sourceUrl ?? null,
    photoAlt: f?.logo?.node.altText ?? name,
    linkUrl:  f?.lien ?? null,
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
              {artisteProps    && <EntityCard {...artisteProps} />}
              {entrepriseProps && <EntityCard {...entrepriseProps} />}
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
