import { useState } from "react";
import { usePartenairesList } from "../hooks/useWordPress";
import type { PartenaireNode } from "../config/acf-schemas";
import { Sticker, EntityCard, EntityDetailModal, RichText } from "../components/ui";
import mobiliereLogo from "../assets/images/partners/mobiliere.svg";
import fpeLogo from "../assets/images/partners/fpe.svg";
import etatFrLogo from "../assets/images/partners/etat-fr.webp";

// ─── Contenu statique de l'en-tête (pas d'ACF « page partenaires » côté WP) ─

const HERO_TITLE = "Les entreprises partenaires";
const HERO_SUBTITLE = "Les entreprises sont au cœur d’ArtÔfact.";
const HERO_TEXT = `
<p>Issues du tissu économique fribourgeois, elles représentent la richesse, la diversité et l’innovation du territoire. En participant au projet, elles ouvrent les portes de leur univers à des artistes, partageant leurs métiers, leurs gestes et leurs savoir-faire.</p>
<p>Leur engagement va bien au-delà d’un soutien :</p>
<ul>
<li>Elles accueillent les artistes en immersion,</li>
<li>Participent activement à la création,</li>
<li>Mettent à disposition ressources, matériaux et compétences,</li>
<li>Et deviennent co-auteurs d’une œuvre unique.</li>
</ul>
`;

// ─── Fake data (affiché si WP retourne 0 partenaire) ─────────────────────

const FAKE_PARTENAIRES: PartenaireNode[] = [
  {
    slug:  "la-mobiliere",
    title: "la Mobilière",
    partenaires: {
      logo: { node: { sourceUrl: mobiliereLogo, altText: "la Mobilière" } },
      lien: "https://www.mobiliere.ch",
      categorieDuPartenaire: "Partenaire",
    },
  },
  {
    slug:  "fpe",
    title: "FPE",
    partenaires: {
      logo: { node: { sourceUrl: fpeLogo, altText: "FPE — Fédération Patronale et Économique" } },
      lien: "https://www.fpe-cifa.ch",
      categorieDuPartenaire: "Partenaire",
    },
  },
  {
    slug:  "etat-de-fribourg",
    title: "État de Fribourg",
    partenaires: {
      logo: { node: { sourceUrl: etatFrLogo, altText: "État de Fribourg" } },
      lien: "https://www.fr.ch",
      categorieDuPartenaire: "Partenaire",
    },
  },
];

// ─── Hero (composant local) ───────────────────────────────────────────────

function PartenairesHero() {
  return (
    <section className="partenaires-hero" aria-label="Les partenaires">
      <Sticker name="02" className="partenaires-hero-sticker" />
      <div className="partenaires-hero-inner">
        <h1 className="partenaires-hero-title">{HERO_TITLE}</h1>
        <p className="partenaires-hero-subtitle">{HERO_SUBTITLE}</p>
        <RichText html={HERO_TEXT} className="partenaires-hero-text" />
      </div>
    </section>
  );
}

// ─── Regroupement par catégorie (ordre imposé) ───────────────────────────

// Sections affichées de haut en bas. `key` = valeur du champ ACF
// « catégorie du partenaire » une fois normalisée (cf. normalizeCategory) ;
// `title` = titre affiché. Une catégorie inconnue est ajoutée à la fin, sous
// son libellé brut, pour ne jamais faire disparaître un partenaire.
const CATEGORY_ORDER: { key: string; title: string }[] = [
  { key: "partenaire",       title: "Presenting partner" },
  { key: "autre partenaire", title: "Autres partenaires" },
  { key: "media",            title: "Médias" },
  { key: "entreprise",       title: "Entreprises" },
];

// Catégorie vide → première section (partenaires principaux).
const DEFAULT_CATEGORY_KEY = CATEGORY_ORDER[0].key;

/** Tolère casse, accents, espaces et pluriels : « Médias » ≡ « media ». */
function normalizeCategory(value: string): string {
  return value
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/s$/, ""))
    .join(" ");
}

type PartenaireGroup = { category: string; items: PartenaireNode[] };

function groupByCategory(partenaires: PartenaireNode[]): PartenaireGroup[] {
  const known = new Map(CATEGORY_ORDER.map(({ key, title }) => [key, { category: title, items: [] as PartenaireNode[] }]));
  const unknown = new Map<string, PartenaireGroup>();

  for (const p of partenaires) {
    const raw = p.partenaires?.categorieDuPartenaire?.trim() ?? "";
    const key = raw ? normalizeCategory(raw) : DEFAULT_CATEGORY_KEY;
    let group = known.get(key) ?? unknown.get(key);
    if (!group) {
      group = { category: raw, items: [] };
      unknown.set(key, group);
    }
    group.items.push(p);
  }
  return [...known.values(), ...unknown.values()].filter((g) => g.items.length > 0);
}

// ─── Page ─────────────────────────────────────────────────────────────────

export function PartenairesPage() {
  const { data, status } = usePartenairesList();
  const [selected, setSelected] = useState<PartenaireNode | null>(null);

  // WP vide/indisponible → fake ; loading sans donnée → rien (pas de flash).
  const partenaires: PartenaireNode[] =
    status === "success" && data && data.length > 0
      ? data
      : status === "loading" && !data
      ? []
      : FAKE_PARTENAIRES;

  const groups = groupByCategory(partenaires);

  const selPresentation = selected?.partenaires?.presentation ?? "";
  const selLogo = selected?.partenaires?.logo?.node;
  const selLien = selected?.partenaires?.lien;

  return (
    <main className="partenaires-main">
      <PartenairesHero />

      {groups.map((group) => (
        <section key={group.category} className="partenaires-group" aria-label={group.category}>
          <h2 className="partenaires-group-title">{group.category}</h2>
          <div className="partenaires-grid">
            {group.items.map((item) => {
              const f = item.partenaires;
              const hasText = !!f?.presentation?.trim();
              return (
                <EntityCard
                  key={item.slug}
                  name={item.title}
                  text={f?.presentation ?? undefined}
                  photoUrl={f?.logo?.node.sourceUrl ?? null}
                  photoSrcSet={f?.logo?.node.srcSet ?? null}
                  photoAlt={f?.logo?.node.altText ?? item.title}
                  linkUrl={f?.lien ?? undefined}
                  small
                  // Popup + extrait uniquement s'il y a du contenu texte.
                  onOpenDetail={hasText ? () => setSelected(item) : undefined}
                />
              );
            })}
          </div>
        </section>
      ))}

      {selected && (
        <EntityDetailModal
          name={selected.title}
          text={selPresentation}
          photoUrl={selLogo?.sourceUrl}
          photoAlt={selLogo?.altText ?? selected.title}
          linkUrl={selLien}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  );
}
