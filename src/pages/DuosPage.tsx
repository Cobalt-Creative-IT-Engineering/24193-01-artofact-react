import { useState } from "react";
import { useDuosList } from "../hooks/useWordPress";
import type { DuoNode } from "../config/acf-schemas";
import { ContentSection, CTAButton, Sticker } from "../components/ui";
import { formatDuoTitle } from "../lib/utils";

// Nombre initial de duos affichés (incrémenté au clic sur « Les autres duos »)
const DUOS_INITIAL = 2;
const DUOS_STEP    = 1;

// ─── Textes d'exemple ─────────────────────────────────────────────────────

// Intro du hero : en dur (pas de champ ACF pour l'instant).
const HERO_INTRO = "Chaque duo réunit un artiste suisse et une entreprise du sud fribourgeois. Pendant plusieurs mois, ils partagent un atelier, des matériaux et des questions. De cette rencontre naît une œuvre originale, qui porte la trace des gestes, des savoir-faire et de l'identité de l'entreprise.";

// Texte des faux duos (affichés seulement si WP ne renvoie aucun duo).
const SAMPLE_DUO = "Un artiste et une entreprise fribourgeoise, réunis le temps d'une immersion. De leurs échanges naît une œuvre originale, façonnée à partir des matériaux et des gestes de l'atelier.";

// ─── Fake data (affiché si WP retourne 0 duos) ───────────────────────────

const FAKE_DUOS_LIST: DuoNode[] = [
  {
    slug:  "ecal-x-atelier-firmann",
    title: "Ecal x Atelier Firmann",
    duoFields: {
      titre: "Ecal x Atelier Firmann",
      texte: SAMPLE_DUO,
    },
  },
  {
    slug:  "matthia-gremaud-x-morand-construction",
    title: "Matthia Gremaud x Morand construction",
    duoFields: {
      titre: "Matthia Gremaud x Morand construction",
      texte: SAMPLE_DUO,
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

  // Pagination : démarre à DUOS_INITIAL, +DUOS_STEP à chaque clic.
  const [duosLimit, setDuosLimit] = useState(DUOS_INITIAL);
  const duosToShow  = duos.slice(0, duosLimit);
  const hasMoreDuos = duosLimit < duos.length;

  return (
    <main className="duos-main">
      <DuosHero title="Les duos" intro={HERO_INTRO} />

      {duosToShow.map((duo, i) => {
        const fields = duo.duoFields ?? {};
        return (
          <ContentSection
            key={duo.slug}
            titleNode={formatDuoTitle(duo.title)}
            title={duo.title}
            text={fields.texte ?? ""}
            imageUrl={fields.image?.node.sourceUrl ?? null}
            imageSrcSet={fields.image?.node.srcSet ?? null}
            imageAlt={fields.image?.node.altText ?? ""}
            ctaLabel="Découvrir le duo"
            ctaUrl={`/duos/${duo.slug}`}
            variant="dark"
            reversed={i % 2 !== 0}
          />
        );
      })}

      {hasMoreDuos && (
        <div className="duos-more">
          <CTAButton onClick={() => setDuosLimit((n) => n + DUOS_STEP)}>
            Les autres duos
          </CTAButton>
        </div>
      )}
    </main>
  );
}
