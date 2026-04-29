import { useHomeContent, useDuosList } from "../hooks/useWordPress";
import type { DuoNode, AcfLink } from "../config/acf-schemas";
import { CTAButton, ContentSection, Sticker } from "../components/ui";
import bannerImg from "../assets/images/banner.svg";
import { formatDuoTitle } from "../lib/utils";

// ─── Lorem ipsum (placeholders pré-prod tant que WP n'a pas de contenu) ───

const LOREM_INTRO = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.";

const LOREM_DUO = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus.";

const LOREM_COMPTOIR = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.";

// Fake data affichée si le CPT `duo` est vide en pré-prod
const FAKE_DUOS_HOME: DuoNode[] = [
  {
    slug:  "matthia-gremaud-x-morand-construction",
    title: "Matthia Gremaud x Morand construction",
    duoFields: {
      titre: "Matthia Gremaud x Morand construction",
      texte: LOREM_DUO,
    },
  },
  {
    slug:  "ecal-x-atelier-firmann",
    title: "Ecal x Atelier Firmann",
    duoFields: {
      titre: "Ecal x Atelier Firmann",
      texte: LOREM_DUO,
    },
  },
];

// Nombre initial de duos affichés sur la home (incrémenté au clic sur « Voir plus »)
const HOME_DUOS_INITIAL = 2;

// ─── Hero ──────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="home-hero" aria-label="Image d'introduction">
      <img src={bannerImg} alt="" className="home-hero-image" />
    </section>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function linkProps(lien: AcfLink | null | undefined): { href: string; label: string } | null {
  if (!lien?.url) return null;
  return { href: lien.url, label: lien.title || "Découvrir" };
}

// ─── Page ─────────────────────────────────────────────────────────────────

export function HomePage() {
  const { data: home, status } = useHomeContent();
  const enTete     = home?.enTete;
  const piedDePage = home?.piedDePage;

  const introTitle = enTete?.titre || "Mêler art\net industrie";
  const introText  = enTete?.texte || (status !== "loading" ? LOREM_INTRO : "");
  const introCta   = linkProps(enTete?.lien);

  const piedTitle    = piedDePage?.titre || "Comptoir gruérien";
  const piedSubtitle = piedDePage?.sousTitre ?? "";
  const piedText     = piedDePage?.texte || (status !== "loading" ? LOREM_COMPTOIR : "");
  const piedCta      = linkProps(piedDePage?.lien);

  // Duos affichés sur la home : on prend les premiers retournés par le CPT.
  // Pagination : démarre à HOME_DUOS_INITIAL, +1 à chaque clic sur « Voir plus ».
  const { data: duosData, status: duosStatus } = useDuosList();
  const duosSource: DuoNode[] =
    duosStatus === "success" && duosData && duosData.length > 0
      ? duosData
      : duosStatus === "loading" && !duosData
      ? []
      : FAKE_DUOS_HOME;

  const duosToShow = duosSource.slice(0, HOME_DUOS_INITIAL);
  const hasMoreDuos = duosSource.length > HOME_DUOS_INITIAL;

  return (
    <main className="home-main">

      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Section En-tête (ACF enTete) ── */}
      <section className="home-intro" aria-label="Introduction">
        <Sticker name="01" className="home-intro-sticker" />

        <div className="home-intro-inner">
          <h2 className="home-intro-title">{introTitle}</h2>
          <p className="home-intro-text">{introText}</p>
          {introCta && (
            <div>
              <CTAButton href={introCta.href}>{introCta.label}</CTAButton>
            </div>
          )}
        </div>
      </section>

      {/* ── Section Duos (CPT) ── */}
      <section className="home-duos" aria-label="Les duos">
        <Sticker name="02" className="home-duos-sticker" />

        <div className="home-duos-header">
          <h2 className="home-duos-title">Les duos</h2>
        </div>

        {duosToShow.map((duo, i) => {
          const fields = duo.duoFields ?? {};
          return (
            <ContentSection
              key={duo.slug}
              titleNode={formatDuoTitle(duo.title)}
              title={duo.title}
              text={fields.texte ?? ""}
              imageUrl={fields.image?.node.sourceUrl ?? null}
              imageAlt={fields.image?.node.altText ?? ""}
              ctaLabel="Découvrir le duo"
              ctaUrl={`/duos/${duo.slug}`}
              variant="dark"
              reversed={i % 2 !== 0}
            />
          );
        })}

        {hasMoreDuos && (
          <div className="home-duos-more">
            <CTAButton href="/duos">Les autres duos</CTAButton>
          </div>
        )}
      </section>

      {/* ── Section Pied de page (ACF piedDePage) ── */}
      <section className="home-comptoir" aria-label={piedTitle}>
        <div className="home-comptoir-inner">
          <h2 className="home-comptoir-title">{piedTitle}</h2>
          {piedSubtitle && <p className="home-comptoir-subtitle">{piedSubtitle}</p>}
          <p className="home-comptoir-text">{piedText}</p>
          <div className="home-comptoir-cta-row">
            {piedCta && <CTAButton href={piedCta.href}>{piedCta.label}</CTAButton>}
          </div>
        </div>
      </section>

    </main>
  );
}
