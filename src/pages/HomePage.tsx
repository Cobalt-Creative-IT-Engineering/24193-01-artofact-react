import { useACFOptionsPage } from "../hooks/useWordPress";
import { acfReader } from "../components/acf";
import { HomeACF } from "../config/acf-schemas";
import type { HomeDuoItem } from "../config/acf-schemas";
import { CTAButton, HalfCircleDecoration, CircleDecoration, WPContent } from "../components/ui";

function HeroSection({ imageUrl, imageAlt }: { imageUrl: string | null; imageAlt: string }) {
  return (
    <section className="home-hero" aria-label="Image d'introduction">
      {imageUrl ? (
        <img src={imageUrl} alt={imageAlt} className="home-hero-image" />
      ) : (
        <div className="home-hero-placeholder">
          <span className="home-hero-placeholder-text">Image à venir</span>
        </div>
      )}
    </section>
  );
}

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

  return (
    <div
      className={`flex flex-col ${reversed ? "md:flex-row-reverse" : "md:flex-row"} gap-0 overflow-hidden`}
    >
      <div className="md:w-1/2 relative" style={{ minHeight: "320px" }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "#2A3A4A" }} />
        )}
      </div>

      <div
        className="md:w-1/2 flex flex-col justify-center p-10 md:p-16"
        style={{ color: "#E8E6E1", textAlign: "right" }}
      >
        {item.subtitle && (
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#50B6B0" }}
          >
            {item.subtitle}
          </p>
        )}
        {item.title && (
          <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {item.title}
          </h3>
        )}
        {item.text && (
          <p className="text-base leading-relaxed mb-6 opacity-80">
            {item.text}
          </p>
        )}
        {item.cta_label && item.cta_url && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <CTAButton href={item.cta_url}>{item.cta_label}</CTAButton>
          </div>
        )}
      </div>
    </div>
  );
}

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
      <section
        className="relative overflow-hidden"
        style={{ padding: "5rem var(--content-px)" }}
        aria-label="Introduction"
      >
        <HalfCircleDecoration
          className="absolute"
          style={{
            right: "-3rem",
            top: "50%",
            transform: "translateY(-50%)",
            width: "8rem",
            height: "auto",
            zIndex: 1,
          }}
        />

        <div
          className="relative grid md:grid-cols-2 gap-12 items-start"
          style={{ maxWidth: "var(--container)", margin: "0 auto", zIndex: 2 }}
        >
          <div>
            <h2
              className="font-bold leading-none"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "-0.03em", color: "#E8E6E1" }}
            >
              {introTitle || "Mêler art\net industrie"}
            </h2>
          </div>

          <div className="flex flex-col gap-8 justify-center">
            {introText ? (
              <WPContent html={introText} className="text-base leading-relaxed" style={{ color: "#E8E6E1" }} />
            ) : (
              status !== "loading" && (
                <p className="text-base leading-relaxed" style={{ color: "rgba(232,230,225,0.6)" }}>
                  Contenu à venir.
                </p>
              )
            )}
            {introCtaLabel && introCtaUrl ? (
              <div>
                <CTAButton href={introCtaUrl}>{introCtaLabel}</CTAButton>
              </div>
            ) : (
              status !== "loading" && (
                <div>
                  <CTAButton href="/concept">En savoir plus</CTAButton>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Section Duos ── */}
      <section aria-label="Les duos" style={{ position: "relative" }}>
        <div
          style={{
            maxWidth: "var(--container)",
            margin: "0 auto",
            padding: "4rem var(--content-px) 2rem",
            textAlign: "right",
          }}
        >
          <h2
            className="font-bold"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "#E8E6E1", letterSpacing: "-0.03em", lineHeight: 1 }}
          >
            {duosTitle || "Les duos"}
          </h2>
        </div>

        {duosItems.length === 0 ? (
          <div style={{ padding: "2rem var(--content-px) 4rem", maxWidth: "var(--container)", margin: "0 auto", textAlign: "right" }}>
            <p style={{ color: "rgba(232,230,225,0.5)" }}>2 duos seront affichés ici.</p>
          </div>
        ) : (
          duosItems.map((item, i) => (
            <div key={i} style={{ position: "relative" }}>
              <DuoCard item={item} reversed={i % 2 === 0} />
              {i < duosItems.length - 1 && (
                <CircleDecoration
                  style={{
                    position: "absolute",
                    bottom: "-2rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "4rem",
                    height: "4rem",
                    zIndex: 5,
                  }}
                />
              )}
            </div>
          ))
        )}
      </section>

      {/* ── Section Comptoir gruérien ── */}
      <section
        style={{ padding: "5rem var(--content-px)" }}
        aria-label="Comptoir gruérien"
      >
        <div style={{ maxWidth: "var(--container)", margin: "0 auto", textAlign: "right" }}>
          <h2
            className="font-bold mb-3"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "#E8E6E1", letterSpacing: "-0.03em", lineHeight: 1 }}
          >
            {comptoirTitle || "Comptoir gruérien"}
          </h2>

          {comptoirSubtitle && (
            <p
              className="font-semibold mb-8"
              style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)", color: "#50B6B0" }}
            >
              {comptoirSubtitle}
            </p>
          )}

          {comptoirText ? (
            <WPContent
              html={comptoirText}
              className="mb-10"
              style={{ color: "#E8E6E1", maxWidth: "44rem", marginLeft: "auto" }}
            />
          ) : (
            status !== "loading" && (
              <p className="mb-10" style={{ color: "rgba(232,230,225,0.6)", maxWidth: "44rem", marginLeft: "auto" }}>
                Contenu à venir.
              </p>
            )
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
