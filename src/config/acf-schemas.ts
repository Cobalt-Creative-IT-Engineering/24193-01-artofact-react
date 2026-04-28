/**
 * Schémas ACF par type de contenu.
 *
 * Chaque schéma mappe une clé sémantique TypeScript vers la vraie clé de
 * champ ACF dans WordPress. Mettez à jour ces valeurs quand vous renommez
 * un champ dans ACF — les composants ne référencent que les clés sémantiques
 * via `acfReader`, pas les noms ACF bruts.
 *
 * Usage :
 *   import { acfReader } from '../components/acf';
 *   import { HeroACF } from '../config/acf-schemas';
 *
 *   const hero  = acfReader(options, HeroACF);
 *   const title = hero.text('title');   // autocomplétion TypeScript sur les clés
 *   const logo  = hero.image('logo');
 */

// ─── Options globales (ACF Options Page) ─────────────────────────────────

export const HeroACF = {
  title:    "hero_title",
  subtitle: "hero_subtitle",
  cta:      "hero_cta_label",
  ctaUrl:   "hero_cta_url",
  image:    "hero_image",
} as const;

export const PartnersACF = {
  // Repeater ACF → sous-champs : logo (image), url (link), name (text)
  list: "partners",
} as const;

// ─── Options Page : "contact" ─────────────────────────────────────────────

export const ContactACF = {
  title:   "contact_title",
  intro:   "contact_intro",        // wysiwyg
  email:   "contact_email",
  phone:   "contact_phone",
  address: "contact_address",      // wysiwyg
  // Repeater → { platform, url }
  social:  "contact_social",
} as const;

// ─── Options Page : "about" ───────────────────────────────────────────────

export const AboutACF = {
  presentation: "about_presentation", // wysiwyg
  image:        "about_image",
  mission:      "about_mission",       // wysiwyg
  // Repeater → { name, role, photo }
  team:         "about_team",
} as const;

// ─── Page WP : slug "info" (ou similaire) ─────────────────────────────────

export const InfoACF = {
  // Repeater → { id, title, content }
  sections: "info_sections",
} as const;

// ─── Options Page : "accueil" (Homepage Artofact) ────────────────────────

export const HomeACF = {
  heroImage:        "home_hero_image",
  introTitle:       "home_intro_title",
  introText:        "home_intro_text",
  introCtaLabel:    "home_intro_cta_label",
  introCtaUrl:      "home_intro_cta_url",
  duosTitle:        "home_duos_title",
  comptoirTitle:    "home_comptoir_title",
  comptoirSubtitle: "home_comptoir_subtitle",
  comptoirText:     "home_comptoir_text",
  comptoirCtaLabel: "home_comptoir_cta_label",
  comptoirCtaUrl:   "home_comptoir_cta_url",
} as const;
// Note : la section "Les duos" de la homepage est désormais alimentée par le
// CPT `duo` via GraphQL (useDuosList) — l'ancien repeater home_duos_items et
// le type HomeDuoItem ne sont plus utilisés.

// ─── Options Page : "concept" ─────────────────────────────────────────────

export const ConceptACF = {
  heroTitle: "concept_hero_title",
  heroText:  "concept_hero_text",
  sections:  "concept_sections",
} as const;

export type ContentVariant = "dark" | "light" | "accent";

export type ConceptSectionItem = {
  title?:     string;
  text?:      string;
  cta_label?: string;
  cta_url?:   string;
  image?:     { url: string; alt?: string } | number | null;
  variant?:   ContentVariant;
};

// ─── Options Page : "duos-listing" ───────────────────────────────────────────

export const DuosListingACF = {
  heroTitle: "duos_hero_title",
  heroIntro: "duos_hero_intro",
} as const;

// ─── CPT : "duo" (champs ACF lus via GraphQL — groupe "duoFields") ──────────
//
// Côté WP : groupe ACF "Duos" avec GraphQL Type Name = "duoFields", attaché au
// CPT "Duo". Les valeurs remontent dans la query GraphQL sous `duoFields`.

export type DuoImageNode = {
  node: {
    sourceUrl: string;
    altText?: string | null;
  };
};

export type DuoFields = {
  artiste?:     string | null;
  entreprise?:  string | null;
  description?: string | null;
  lien?:        string | null;
  image?:       DuoImageNode | null;
};

export type DuoNode = {
  slug:        string;
  title:       string;
  duoFields?:  DuoFields | null;
};

// ─── Type utilitaire ──────────────────────────────────────────────────────

/** Type d'un schéma ACF générique */
export type ACFSchema = Record<string, string>;
