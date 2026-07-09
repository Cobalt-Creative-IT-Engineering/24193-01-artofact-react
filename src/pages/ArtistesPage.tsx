import { useState } from "react";
import { useArtistesList } from "../hooks/useWordPress";
import type { ArtisteNode } from "../config/acf-schemas";
import { Sticker, EntityCard, EntityDetailModal, RichText } from "../components/ui";

// ─── Contenu statique de l'en-tête (pas d'ACF « page artistes » côté WP) ───

const HERO_TITLE = "Les artistes";
const HERO_SUBTITLE = "Tout comme les entreprises, les artistes sont au cœur du projet ArtÔfact.";
const HERO_TEXT = `
<p>Issus de la scène artistique suisse et pour la plupart fribourgeoise, ils apportent un regard singulier sur le monde industriel et artisanal. Invités à plonger au cœur des entreprises, ils découvrent des univers techniques, des gestes précis et des savoir-faire souvent méconnus.</p>
<p>Cette immersion devient le point de départ d’un processus créatif inédit. Au contact des équipes, des matériaux et des environnements de production, les artistes développent une œuvre originale, en dialogue direct avec l’identité de l’entreprise.</p>
<p>Leur rôle dépasse celui de créateur :</p>
<ul>
<li>Ils observent, questionnent et interprètent</li>
<li>Ils traduisent la matière et le geste en langage artistique,</li>
<li>Ils proposent un nouveau regard sur l’industrie, sensible et accessible.</li>
</ul>
<p>À travers ArtÔfact, les artistes participent à une rencontre rare entre deux mondes, où la création naît de l’échange, de l’expérimentation et du partage.</p>
`;

// ─── Hero (composant local) ───────────────────────────────────────────────

function ArtistesHero() {
  return (
    <section className="artistes-hero" aria-label="Les artistes">
      <Sticker name="01" className="artistes-hero-sticker" />
      <div className="artistes-hero-inner">
        <h1 className="artistes-hero-title">{HERO_TITLE}</h1>
        <p className="artistes-hero-subtitle">{HERO_SUBTITLE}</p>
        <RichText html={HERO_TEXT} className="artistes-hero-text" />
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export function ArtistesPage() {
  const { data, status } = useArtistesList();
  const [selected, setSelected] = useState<ArtisteNode | null>(null);

  // Loading sans donnée → rien (pas de flash) ; sinon la liste (ou vide).
  const artistes: ArtisteNode[] =
    status === "loading" && !data ? [] : (data ?? []);

  const sel = selected?.artistes;
  const selLogo = sel?.logo?.node;

  return (
    <main className="artistes-main">
      <ArtistesHero />

      <section className="artistes-group" aria-label="Liste des artistes">
        <div className="artistes-grid">
          {artistes.map((item) => {
            const f = item.artistes;
            const hasText = !!f?.presentation?.trim();
            return (
              <EntityCard
                key={item.slug}
                name={item.title}
                text={f?.presentation ?? undefined}
                photoUrl={f?.logo?.node.sourceUrl ?? null}
                photoAlt={f?.logo?.node.altText ?? item.title}
                linkUrl={f?.lien ?? undefined}
                small
                onOpenDetail={hasText ? () => setSelected(item) : undefined}
              />
            );
          })}
        </div>
      </section>

      {selected && (
        <EntityDetailModal
          name={selected.title}
          text={sel?.presentation ?? undefined}
          photoUrl={selLogo?.sourceUrl}
          photoAlt={selLogo?.altText ?? selected.title}
          linkUrl={sel?.lien}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  );
}
