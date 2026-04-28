import { useACFOptionsPage } from "../hooks/useWordPress";
import { acfReader } from "../components/acf";
import { HomeACF } from "../config/acf-schemas";
import type { HomeDuoItem } from "../config/acf-schemas";
import { CTAButton, Sticker, WPContent } from "../components/ui";
import bannerImg from "../assets/images/banner.svg";
import { formatDuoTitle } from "../lib/utils";

// ─── Lorem ipsum (placeholders pré-prod tant que WP n'a pas de contenu) ───

const LOREM_INTRO = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.";

const LOREM_DUO = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus.";

const LOREM_COMPTOIR = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.";

const FAKE_DUOS: HomeDuoItem[] = [
  {
    title:     "Matthia Gremaud x Morand construction",
    subtitle:  "Duo 1",
    image:     null,
    text:      LOREM_DUO,
    cta_label: "Découvrir le concept",
    cta_url:   "/duos/matthia-gremaud",
  },
  {
    title:     "ECAL x Ateliers Firmann",
    subtitle:  "Duo 2",
    image:     null,
    text:      LOREM_DUO,
    cta_label: "Découvrir le concept",
    cta_url:   "/duos/ecal",
  },
];

// ─── Hero ──────────────────────────────────────────────────────────────────

function HeroSection({ imageUrl, imageAlt }: { imageUrl: string | null; imageAlt: string }) {
  const src = imageUrl ?? bannerImg;
  return (
    <section className="home-hero" aria-label="Image d'introduction">
      <img src={src} alt={imageAlt} className="home-hero-image" />
    </section>
  );
}

// ─── Duo card ─────────────────────────────────────────────────────────────

type DuoCardProps = {
  item: HomeDuoItem;
  reversed: boolean;
};

function DuoCard({ item, reversed }: DuoCardProps) {
  const imageUrl = item.image && typeof item.image === "object" && "url" in item.image
    ? item.image.url
    : null;
  const imageAlt = item.image && typeof item.image === "object" && "alt" in item.image
    ? (item.image.alt ?? "")
    : "";

  const contentAlign = reversed ? "duo-card-content--right" : "duo-card-content--left";
  const cardDirection = reversed ? "duo-card--reversed" : "duo-card--normal";

  return (
    <div className={`duo-card ${cardDirection}`}>
      <div className="duo-card-image">
        <img src={imageUrl ?? bannerImg} alt={imageAlt} />
      </div>

      <div className={`duo-card-content ${contentAlign}`}>
        {item.subtitle && (
          <p className="duo-card-subtitle">{item.subtitle}</p>
        )}
        {item.title && (
          <h3 className="duo-card-title">{formatDuoTitle(item.title)}</h3>
        )}
        {item.text && (
          <p className="duo-card-text">{item.text}</p>
        )}
        {item.cta_label && item.cta_url && (
          <div className="duo-card-cta-row">
            <CTAButton href={item.cta_url}>{item.cta_label}</CTAButton>
          </div>
        )}
      </div>
    </div>
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
  const duosItems        = home.repeater<HomeDuoItem>("duosItems");
  const comptoirTitle    = home.text("comptoirTitle");
  const comptoirSubtitle = home.text("comptoirSubtitle");
  const comptoirText     = home.text("comptoirText");
  const comptoirCtaLabel = home.text("comptoirCtaLabel");
  const comptoirCtaUrl   = home.text("comptoirCtaUrl");

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

        {(duosItems.length > 0 ? duosItems : FAKE_DUOS).map((item, i) => (
          <DuoCard key={i} item={item} reversed={i % 2 !== 0} />
        ))}
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
