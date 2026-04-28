import { useEffect } from "react";
import { useCPTBySlug } from "../hooks/useWordPress";
import { acfReader } from "../components/acf";
import { DuoACF } from "../config/acf-schemas";
import type { DuoMemberItem } from "../config/acf-schemas";
import { MemberCard } from "../components/ui";
import { formatDuoTitle } from "../lib/utils";
import { setPageMeta } from "../lib/meta";
import bannerImg from "../assets/images/banner.svg";

// ─── Lorem ipsum placeholder ──────────────────────────────────────────────

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.";

// ─── Types internes ───────────────────────────────────────────────────────

type RawDuo = {
  slug: string;
  title: { rendered: string };
  acf: {
    duo_subtitle?:   string;
    duo_intro_text?: string;
    duo_members?:    DuoMemberItem[];
  };
  _embedded?: Record<string, unknown>;
};

// ─── Fake data (affiché si WP retourne null) ──────────────────────────────

const FAKE_DUO_DETAIL: RawDuo = {
  slug:  "matthia-gremaud",
  title: { rendered: "Matthia Gremaud x Ateliers Firmann" },
  acf: {
    duo_subtitle:   "Un duo gravé dans le métal",
    duo_intro_text: LOREM,
    duo_members: [
      {
        member_name:      "Matthia Gremaud",
        member_photo:     null,
        member_text:      LOREM,
        member_cta_label: "Découvrir le duo",
        member_cta_url:   "#",
      },
      {
        member_name:      "Morand construction",
        member_photo:     null,
        member_text:      LOREM,
        member_cta_label: "Découvrir le duo",
        member_cta_url:   "#",
      },
    ],
  },
};

// ─── Helpers : résolution photo membre ────────────────────────────────────

function resolveMemberPhotoUrl(
  photo: DuoMemberItem["member_photo"]
): string | null {
  if (!photo) return null;
  if (typeof photo === "object" && "url" in photo) return photo.url;
  return null;
}

function resolveMemberPhotoAlt(
  photo: DuoMemberItem["member_photo"]
): string {
  if (!photo) return "";
  if (typeof photo === "object" && "alt" in photo) return photo.alt ?? "";
  return "";
}

// ─── Helper : extrait l'URL de la featured media depuis _embedded ─────────

function getFeaturedMediaUrl(duo: RawDuo): string | null {
  const media = duo._embedded?.["wp:featuredmedia"];
  if (!Array.isArray(media) || !media[0]) return null;
  const m = media[0] as Record<string, unknown>;
  return typeof m.source_url === "string" ? m.source_url : null;
}

// ─── Hero détail (composant local) ───────────────────────────────────────

type DuoDetailHeroProps = {
  title: string;
  subtitle: string;
  introText: string;
  imageUrl: string | null;
};

function DuoDetailHero({
  title,
  subtitle,
  introText,
  imageUrl,
}: DuoDetailHeroProps) {
  return (
    <section className="duo-detail-hero" aria-label={title}>
      <div className="duo-detail-hero-content">
        <h1 className="duo-detail-hero-title">{formatDuoTitle(title)}</h1>
        {subtitle && (
          <p className="duo-detail-hero-subtitle">{subtitle}</p>
        )}
        {introText && (
          <p className="duo-detail-hero-text">{introText}</p>
        )}
      </div>
      <div className="duo-detail-hero-image">
        <img src={imageUrl ?? bannerImg} alt={title} />
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export function DuoDetailPage({ slug }: { slug: string }) {
  const { data, status } = useCPTBySlug<RawDuo>("duos", slug);

  // Si loading sans donnée en cache, on ne rend rien (pas de flash fake → réel).
  // Si status success mais data null, on utilise le fake.
  const duo: RawDuo | null =
    status === "loading" && !data
      ? null
      : (data ?? FAKE_DUO_DETAIL);

  const reader = acfReader(duo?.acf ?? null, DuoACF);
  const titleRendered = duo?.title.rendered ?? "";
  const subtitle      = reader.text("subtitle");
  const introText     = reader.text("introText");
  const members       = reader.repeater<DuoMemberItem>("members");
  const heroImageUrl  = duo ? getFeaturedMediaUrl(duo) : null;

  useEffect(() => {
    if (!titleRendered) return;
    setPageMeta({ title: titleRendered });
  }, [titleRendered]);

  if (!duo) return null;

  return (
    <main className="duo-detail-main">
      <DuoDetailHero
        title={titleRendered}
        subtitle={subtitle}
        introText={introText}
        imageUrl={heroImageUrl}
      />

      {members.length > 0 && (
        <section className="duo-detail-members">
          <div className="duo-detail-members-inner">
            <h2 className="duo-detail-members-title">Les membres du duo</h2>
            <div className="duo-detail-members-grid">
              {members.map((m, i) => (
                <MemberCard
                  key={i}
                  name={m.member_name ?? ""}
                  photoUrl={resolveMemberPhotoUrl(m.member_photo)}
                  photoAlt={resolveMemberPhotoAlt(m.member_photo)}
                  text={m.member_text ?? ""}
                  ctaLabel={m.member_cta_label}
                  ctaUrl={m.member_cta_url}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
