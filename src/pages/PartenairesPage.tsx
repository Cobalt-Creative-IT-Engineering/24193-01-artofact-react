import { usePartenairesList } from "../hooks/useWordPress";
import type { PartenaireNode } from "../config/acf-schemas";
import { Sticker } from "../components/ui";
import mobiliereLogo from "../assets/images/partners/mobiliere.svg";
import fpeLogo from "../assets/images/partners/fpe.svg";

// ─── Lorem ipsum placeholder ──────────────────────────────────────────────

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus.";

// ─── Fake data (affiché si WP retourne 0 partenaire) ─────────────────────

const FAKE_PARTENAIRES: PartenaireNode[] = [
  {
    slug:  "la-mobiliere",
    title: "la Mobilière",
    partenaires: {
      logo: { node: { sourceUrl: mobiliereLogo, altText: "la Mobilière" } },
      lien: "https://www.mobiliere.ch",
      categorieDuPartenaire: "Presenting partners",
    },
  },
  {
    slug:  "fpe",
    title: "FPE",
    partenaires: {
      logo: { node: { sourceUrl: fpeLogo, altText: "FPE — Fédération Patronale et Économique" } },
      lien: "https://www.fpe-cifa.ch",
      categorieDuPartenaire: "Presenting partners",
    },
  },
];

// ─── Hero (composant local) ───────────────────────────────────────────────

function PartenairesHero({ title, intro }: { title: string; intro: string }) {
  return (
    <section className="partenaires-hero" aria-label="Les partenaires">
      <Sticker name="02" className="partenaires-hero-sticker" />
      <div className="partenaires-hero-inner">
        <h1 className="partenaires-hero-title">{title}</h1>
        <p className="partenaires-hero-text">{intro}</p>
      </div>
    </section>
  );
}

// ─── Regroupement par catégorie (ordre de première apparition) ───────────

const DEFAULT_CATEGORY = "Partenaires";

type PartenaireGroup = { category: string; items: PartenaireNode[] };

function groupByCategory(partenaires: PartenaireNode[]): PartenaireGroup[] {
  const groups: PartenaireGroup[] = [];
  const index = new Map<string, PartenaireGroup>();

  for (const p of partenaires) {
    const category = p.partenaires?.categorieDuPartenaire?.trim() || DEFAULT_CATEGORY;
    let group = index.get(category);
    if (!group) {
      group = { category, items: [] };
      index.set(category, group);
      groups.push(group);
    }
    group.items.push(p);
  }
  return groups;
}

// ─── Logo (lien externe si `lien` fourni, sinon simple image) ────────────

function PartenaireLogo({ item }: { item: PartenaireNode }) {
  const logo = item.partenaires?.logo?.node;
  if (!logo?.sourceUrl) return null;

  const img = (
    <img
      src={logo.sourceUrl}
      alt={logo.altText || item.title}
      className="partenaire-logo-img"
    />
  );

  const lien = item.partenaires?.lien;
  if (!lien) return <div className="partenaire-logo">{img}</div>;

  return (
    <a
      href={lien}
      className="partenaire-logo"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.title}
    >
      {img}
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export function PartenairesPage() {
  const { data, status } = usePartenairesList();

  // WP vide/indisponible → fake ; loading sans donnée → rien (pas de flash).
  const partenaires: PartenaireNode[] =
    status === "success" && data && data.length > 0
      ? data
      : status === "loading" && !data
      ? []
      : FAKE_PARTENAIRES;

  const groups = groupByCategory(partenaires);

  return (
    <main className="partenaires-main">
      <PartenairesHero title="Partenaires" intro={LOREM} />

      {groups.map((group) => (
        <section key={group.category} className="partenaires-group" aria-label={group.category}>
          <h2 className="partenaires-group-title">{group.category}</h2>
          <div className="partenaires-grid">
            {group.items.map((item) => (
              <PartenaireLogo key={item.slug} item={item} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
