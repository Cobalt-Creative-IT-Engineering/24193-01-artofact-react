import { useDuosList } from "../hooks/useWordPress";
import type { DuoNode } from "../config/acf-schemas";
import { ContentSection, Sticker } from "../components/ui";
import { formatDuoTitle } from "../lib/utils";

// ─── Lorem ipsum placeholder ──────────────────────────────────────────────

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.";

// ─── Fake data (affiché si WP retourne 0 duos) ───────────────────────────

const FAKE_DUOS_LIST: DuoNode[] = [
  {
    slug:  "ecal-x-atelier-firmann",
    title: "Ecal x Atelier Firmann",
    duoFields: {
      titre: "Ecal x Atelier Firmann",
      texte: LOREM,
    },
  },
  {
    slug:  "matthia-gremaud-x-morand-construction",
    title: "Matthia Gremaud x Morand construction",
    duoFields: {
      titre: "Matthia Gremaud x Morand construction",
      texte: LOREM,
    },
  },
];

// ─── Hero (composant local) ───────────────────────────────────────────────

function DuosHero({ title, intro }: { title: string; intro: string }) {
  return (
    <section className="duos-hero" aria-label="Les duos">
      <Sticker name="03" className="duos-hero-sticker" />
      <div className="duos-hero-inner">
        <h1 className="duos-hero-title">{title}</h1>
        <p className="duos-hero-text">{intro}</p>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export function DuosPage() {
  const { data: duosData, status: duosStatus } = useDuosList();

  // Si WP retourne une liste vide ou indisponible, on utilise le fake.
  // Si loading sans donnée encore disponible, on n'affiche rien (pas de flash).
  const duos: DuoNode[] =
    duosStatus === "success" && duosData && duosData.length > 0
      ? duosData
      : duosStatus === "loading" && !duosData
      ? []
      : FAKE_DUOS_LIST;

  return (
    <main className="duos-main">
      <DuosHero title="Les duos" intro={LOREM} />

      {duos.map((duo, i) => {
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
    </main>
  );
}
