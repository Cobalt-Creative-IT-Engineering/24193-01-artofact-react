import { useEffect } from "react";
import { useDuoBySlug } from "../hooks/useWordPress";
import type { DuoNode } from "../config/acf-schemas";
import { MemberCard } from "../components/ui";
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
    artiste:     "Matthia Gremaud",
    entreprise:  "Morand construction",
    description: LOREM,
    lien:        null,
    image:       null,
  },
};

// ─── Hero détail ─────────────────────────────────────────────────────────

type DuoDetailHeroProps = {
  title: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  lien: string | null;
};

function DuoDetailHero({ title, description, imageUrl, imageAlt, lien }: DuoDetailHeroProps) {
  return (
    <section className="duo-detail-hero" aria-label={title}>
      <div className="duo-detail-hero-content">
        <h1 className="duo-detail-hero-title">{formatDuoTitle(title)}</h1>
        {description && <p className="duo-detail-hero-text">{description}</p>}
        {lien && (
          <div>
            <a href={lien} target="_blank" rel="noopener noreferrer" className="btn-cta">
              En savoir plus
            </a>
          </div>
        )}
      </div>
      <div className="duo-detail-hero-image">
        <img src={imageUrl ?? bannerImg} alt={imageAlt || title} />
      </div>
    </section>
  );
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
  const artiste       = fields.artiste ?? "";
  const entreprise    = fields.entreprise ?? "";
  const description   = fields.description ?? "";
  const lien          = fields.lien ?? null;
  const heroImageUrl  = fields.image?.node.sourceUrl ?? null;
  const heroImageAlt  = fields.image?.node.altText ?? "";

  useEffect(() => {
    if (!titleRendered) return;
    setPageMeta({ title: titleRendered });
  }, [titleRendered]);

  if (!duo) return null;

  return (
    <main className="duo-detail-main">
      <DuoDetailHero
        title={titleRendered}
        description={description}
        imageUrl={heroImageUrl}
        imageAlt={heroImageAlt}
        lien={lien}
      />

      {(artiste || entreprise) && (
        <section className="duo-detail-members">
          <div className="duo-detail-members-inner">
            <h2 className="duo-detail-members-title">Les membres du duo</h2>
            <div className="duo-detail-members-grid">
              {artiste && (
                <MemberCard
                  name={artiste}
                  photoUrl={null}
                  photoAlt={artiste}
                  text=""
                />
              )}
              {entreprise && (
                <MemberCard
                  name={entreprise}
                  photoUrl={null}
                  photoAlt={entreprise}
                  text=""
                />
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
