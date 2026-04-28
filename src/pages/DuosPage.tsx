import { useACFOptionsPage, useCPT } from "../hooks/useWordPress";
import { acfReader } from "../components/acf";
import { DuosListingACF } from "../config/acf-schemas";
import { ContentSection } from "../components/ui";
import { formatDuoTitle } from "../lib/utils";

// ─── Lorem ipsum placeholder ──────────────────────────────────────────────

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.";

// ─── Types internes ───────────────────────────────────────────────────────

type RawDuo = {
  slug: string;
  title: { rendered: string };
  acf: { duo_intro_text?: string };
  _embedded?: Record<string, unknown>;
};

// ─── Fake data (affiché si WP retourne 0 duos) ───────────────────────────

const FAKE_DUOS_LIST: RawDuo[] = [
  {
    slug:  "ecal-ateliers-firmann",
    title: { rendered: "ECAL x Ateliers Firmann" },
    acf:   { duo_intro_text: LOREM },
  },
  {
    slug:  "matthia-gremaud-morand-construction",
    title: { rendered: "Matthia Gremaud x Morand construction" },
    acf:   { duo_intro_text: LOREM },
  },
];

// ─── Helper : extrait l'URL de la featured media depuis _embedded ─────────

function getFeaturedMediaUrl(duo: RawDuo): string | null {
  const media = duo._embedded?.["wp:featuredmedia"];
  if (!Array.isArray(media) || !media[0]) return null;
  const m = media[0] as Record<string, unknown>;
  return typeof m.source_url === "string" ? m.source_url : null;
}

// ─── Hero (composant local) ───────────────────────────────────────────────

function DuosHero({ title, intro }: { title: string; intro: string }) {
  return (
    <section className="duos-hero" aria-label="Les duos">
      <h1 className="duos-hero-title">{title}</h1>
      <p className="duos-hero-text">{intro}</p>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export function DuosPage() {
  const { data: optionsData, status: optionsStatus } = useACFOptionsPage("duos-listing");
  const listing = acfReader(optionsData, DuosListingACF);

  const heroTitle = listing.text("heroTitle") || "Les duos";
  const heroIntro =
    listing.text("heroIntro") ||
    (optionsStatus !== "loading" ? LOREM : "");

  const { data: duosData, status: duosStatus } = useCPT<RawDuo>("duos", {
    perPage: 100,
    embed: true,
  });

  // Si WP retourne une liste vide (status success mais 0 duos), on utilise le fake.
  // Si loading sans donnée encore disponible, on n'affiche rien (pas de flash).
  const duos: RawDuo[] =
    duosStatus === "success" && duosData && duosData.length > 0
      ? duosData
      : duosStatus === "loading" && !duosData
      ? []
      : FAKE_DUOS_LIST;

  return (
    <main className="duos-main">
      <DuosHero title={heroTitle} intro={heroIntro} />

      {duos.map((duo, i) => (
        <ContentSection
          key={duo.slug}
          titleNode={formatDuoTitle(duo.title.rendered)}
          title={duo.title.rendered}
          text={duo.acf.duo_intro_text ?? ""}
          imageUrl={getFeaturedMediaUrl(duo)}
          ctaLabel="Découvrir le duo"
          ctaUrl={`/duos/${duo.slug}`}
          variant="dark"
          reversed={i % 2 !== 0}
        />
      ))}
    </main>
  );
}
