import { useACFOptionsPage, useDuosList } from "../hooks/useWordPress";
import { acfReader } from "../components/acf";
import { HomeACF } from "../config/acf-schemas";
import type { DuoNode } from "../config/acf-schemas";
import { CTAButton, ContentSection, Sticker, WPContent } from "../components/ui";
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
    duoFields: { artiste: "Matthia Gremaud", entreprise: "Morand construction", description: LOREM_DUO, lien: null, image: null },
  },
  {
    slug:  "ecal-x-atelier-firmann",
    title: "Ecal x Atelier Firmann",
    duoFields: { artiste: "Ecal", entreprise: "Atelier Firmann", description: LOREM_DUO, lien: null, image: null },
  },
];

// Combien de duos affichés sur la home (les premiers retournés par GraphQL)
const HOME_DUOS_LIMIT = 2;

// ─── Hero ──────────────────────────────────────────────────────────────────

function HeroSection({ imageUrl, imageAlt }: { imageUrl: string | null; imageAlt: string }) {
  const src = imageUrl ?? bannerImg;
  return (
    <section className="home-hero" aria-label="Image d'introduction">
      <img src={src} alt={imageAlt} className="home-hero-image" />
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export function HomePage() {
  const { data, status } = useACFOptionsPage("accueil");
  const home = acfReader(data, HomeACF);

  const heroImage        = home.image("heroImage");
  const introTitle       = home.text("introTitle");
  const introText        = home.text("introText");
  const introCtaLabel    = home.text("introCtaLabel");
  const introCtaUrl      = home.text("introCtaUrl");
  const duosTitle        = home.text("duosTitle");
  const comptoirTitle    = home.text("comptoirTitle");
  const comptoirSubtitle = home.text("comptoirSubtitle");
  const comptoirText     = home.text("comptoirText");
  const comptoirCtaLabel = home.text("comptoirCtaLabel");
  const comptoirCtaUrl   = home.text("comptoirCtaUrl");

  // Duos affichés sur la home : on prend les premiers retournés par le CPT.
  // Si la liste est vide ou en cours de chargement, on affiche les fake en pré-prod.
  const { data: duosData, status: duosStatus } = useDuosList();
  const duosSource: DuoNode[] =
    duosStatus === "success" && duosData && duosData.length > 0
      ? duosData
      : duosStatus === "loading" && !duosData
      ? []
      : FAKE_DUOS_HOME;
  const duosToShow = duosSource.slice(0, HOME_DUOS_LIMIT);

  return (
    <main className="home-main">

      {/* ── Hero ── */}
      <HeroSection
        imageUrl={heroImage?.url ?? null}
        imageAlt={heroImage?.alt ?? ""}
      />

      {/* ── Section Intro ── */}
      <section className="home-intro" aria-label="Introduction">
        <Sticker name="01" className="home-intro-sticker" />

        <div className="home-intro-inner">
          <h2 className="home-intro-title">
            {introTitle || "Mêler art\net industrie"}
          </h2>

          {introText ? (
            <WPContent html={introText} className="home-intro-text" />
          ) : (
            status !== "loading" && (
              <p className="home-intro-text">{LOREM_INTRO}</p>
            )
          )}

          {introCtaLabel && introCtaUrl ? (
            <div>
              <CTAButton href={introCtaUrl}>{introCtaLabel}</CTAButton>
            </div>
          ) : (
            status !== "loading" && (
              <div>
                <CTAButton href="/concept">Découvrir le concept</CTAButton>
              </div>
            )
          )}
        </div>
      </section>

      <div className="section-separator"><hr /></div>

      {/* ── Section Duos ── */}
      <section className="home-duos" aria-label="Les duos">
        <Sticker name="02" className="home-duos-sticker" />

        <div className="home-duos-header">
          <h2 className="home-duos-title">{duosTitle || "Les duos"}</h2>
        </div>

        {duosToShow.map((duo, i) => {
          const fields = duo.duoFields ?? {};
          return (
            <ContentSection
              key={duo.slug}
              titleNode={formatDuoTitle(duo.title)}
              title={duo.title}
              text={fields.description ?? ""}
              imageUrl={fields.image?.node.sourceUrl ?? null}
              imageAlt={fields.image?.node.altText ?? ""}
              ctaLabel="Découvrir le duo"
              ctaUrl={`/duos/${duo.slug}`}
              variant="dark"
              reversed={i % 2 !== 0}
            />
          );
        })}
      </section>

      <div className="section-separator"><hr /></div>

      {/* ── Section Comptoir gruérien ── */}
      <section className="home-comptoir" aria-label="Comptoir gruérien">
        <div className="home-comptoir-inner">
          <h2 className="home-comptoir-title">
            {comptoirTitle || "Comptoir gruérien"}
          </h2>

          {comptoirSubtitle && (
            <p className="home-comptoir-subtitle">{comptoirSubtitle}</p>
          )}

          {comptoirText ? (
            <WPContent html={comptoirText} className="home-comptoir-text" />
          ) : (
            status !== "loading" && (
              <p className="home-comptoir-text">{LOREM_COMPTOIR}</p>
            )
          )}

          <div className="home-comptoir-cta-row">
            {comptoirCtaLabel && comptoirCtaUrl ? (
              <CTAButton href={comptoirCtaUrl}>{comptoirCtaLabel}</CTAButton>
            ) : (
              status !== "loading" && (
                <CTAButton href="/comptoir-gruerien">En savoir plus</CTAButton>
              )
            )}
          </div>
        </div>
      </section>

    </main>
  );
}
