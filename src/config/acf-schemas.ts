/**
 * Schémas ACF par type de contenu (résolus via GraphQL).
 *
 * Côté WP, chaque groupe ACF est exposé via WPGraphQL :
 *   - Options Page « Page d'accueil »  → query `pageAccueilContent.pageDAccueil`
 *   - Options Page « Page concept »    → query `pageConceptContent.pageConcept`
 *   - CPT « Duo » groupe « Duos »       → query `duo.duoFields`
 *   - CPT « Artiste » groupe « Artistes »       → query `artiste.artistes`
 *   - CPT « Partenaire » groupe « Partenaires » → query `partenaire.partenaires`
 *
 * Le CPT Duo relie un Artiste et un Partenaire via des champs « relationship »
 * (`duoFields.artiste.nodes` / `duoFields.entreprise.nodes`), et non plus des
 * sous-groupes inline.
 *
 * Les anciens schémas REST (`HomeACF`, `ConceptACF`, `DuosListingACF` ACF v3)
 * sont supprimés — toutes les nouvelles options pages ne sont accessibles
 * qu'en GraphQL.
 */

// ─── Types primitifs partagés (réponses WPGraphQL ACF) ───────────────────

export type AcfLink = {
  url?:    string | null;
  title?:  string | null;
  target?: string | null;
};

export type AcfImage = {
  node: {
    sourceUrl: string;
    altText?:  string | null;
  };
};

export type AcfMediaEdge = {
  node: {
    sourceUrl: string;
    altText?:  string | null;
  };
};

// ─── Sections génériques (titre / texte / lien [/ image]) ────────────────

export type PageSection = {
  titre?: string | null;
  texte?: string | null;
  lien?:  AcfLink | null;
  image?: AcfMediaEdge | null;
};

export type PageSectionTextOnly = {
  titre?: string | null;
  texte?: string | null;
  lien?:  AcfLink | null;
};

// ─── Page d'accueil — pageAccueilContent.pageDAccueil ────────────────────

export type HomeEnTete = {
  titre?:     string | null;
  sousTitre?: string | null;
  texte?:     string | null;
  lien?:      AcfLink | null;
};

export type HomePiedDePage = {
  titre?:     string | null;
  sousTitre?: string | null;
  texte?:     string | null;
  lien?:      AcfLink | null;
};

export type HomeContent = {
  enTete?:     HomeEnTete | null;
  piedDePage?: HomePiedDePage | null;
};

export type HomeContentResponse = {
  pageAccueilContent?: {
    pageDAccueil?: HomeContent | null;
  } | null;
};

// ─── Page concept — pageConceptContent.pageConcept ───────────────────────

export type ConceptContent = {
  enTete?:     PageSection | null;
  zoneGrise?:  PageSection | null;
  carte?:      PageSectionTextOnly | null;
  piedDePage?: PageSection | null;
};

export type ConceptContentResponse = {
  pageConceptContent?: {
    pageConcept?: ConceptContent | null;
  } | null;
};

// ─── CPT « Partenaire » — partenaires ────────────────────────────────────

export type PartenaireFields = {
  logo?:                  AcfMediaEdge | null;
  lien?:                  string | null;
  presentation?:          string | null; // HTML WYSIWYG
  categorieDuPartenaire?: string | null;  // champ texte ACF (ex. "Partenaires")
};

export type PartenaireNode = {
  slug:         string;
  title:        string;
  partenaires?: PartenaireFields | null;
};

// ─── CPT « Artiste » — artistes ──────────────────────────────────────────
// Même forme que Partenaire (logo / lien / présentation + catégorie).

export type ArtisteFields = {
  logo?:         AcfMediaEdge | null;
  lien?:         string | null;
  presentation?: string | null; // HTML WYSIWYG
};

export type ArtisteNode = {
  slug:      string;
  title:     string;
  artistes?: ArtisteFields | null;
};

// ─── CPT « Duo » — duoFields ─────────────────────────────────────────────
//
// Structure : titre / sousTitre / texte / image au top-level. `artiste` et
// `entreprise` sont désormais des RELATIONS (champs ACF « relationship ») vers
// respectivement le CPT Artiste et le CPT Partenaire — plus des sous-groupes
// inline. Chaque relation expose `nodes` (0 ou 1 élément en pratique).

export type DuoFields = {
  titre?:      string | null;
  sousTitre?:  string | null;
  texte?:      string | null;
  image?:      AcfMediaEdge | null;
  lien?:       AcfLink | null;
  artiste?:    { nodes: ArtisteNode[] } | null;
  entreprise?: { nodes: PartenaireNode[] } | null;
};

export type DuoNode = {
  slug:       string;
  title:      string;
  duoFields?: DuoFields | null;
};

// ─── Variants ContentSection (utilisés par <ContentSection>) ─────────────

export type ContentVariant = "dark" | "light" | "accent";
