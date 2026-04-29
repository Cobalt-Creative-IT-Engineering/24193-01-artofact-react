/**
 * Schémas ACF par type de contenu (résolus via GraphQL).
 *
 * Côté WP, chaque groupe ACF est exposé via WPGraphQL :
 *   - Options Page « Page d'accueil »  → query `pageAccueilContent.pageDAccueil`
 *   - Options Page « Page concept »    → query `pageConceptContent.pageConcept`
 *   - CPT « Duo » groupe « Duos »       → query `duo.duoFields`
 *   - CPT « Partenaire » groupe « Partenaires » → query `partenaire.partenaires`
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

export type HomePiedDePage = {
  titre?:     string | null;
  sousTitre?: string | null;
  texte?:     string | null;
  lien?:      AcfLink | null;
};

export type HomeContent = {
  enTete?:     PageSectionTextOnly | null;
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

// ─── CPT « Duo » — duoFields ─────────────────────────────────────────────
//
// Structure : titre / sousTitre / texte / image au top-level, plus deux
// sous-groupes `artiste` et `entreprise` avec chacun leur nom, description,
// image et lien (les sous-champs portent un suffixe `Artiste` / `Entreprise`
// car ACF distingue les noms de sous-champs).

export type DuoArtiste = {
  nom?:                string | null;
  descriptionArtiste?: string | null;
  imageArtiste?:       AcfMediaEdge | null;
  lienArtiste?:        AcfLink | null;
};

export type DuoEntreprise = {
  nom?:                   string | null;
  descriptionEntreprise?: string | null;
  imageEntreprise?:       AcfMediaEdge | null;
  lienEntreprise?:        AcfLink | null;
};

export type DuoFields = {
  titre?:      string | null;
  sousTitre?:  string | null;
  texte?:      string | null;
  image?:      AcfMediaEdge | null;
  artiste?:    DuoArtiste | null;
  entreprise?: DuoEntreprise | null;
};

export type DuoNode = {
  slug:       string;
  title:      string;
  duoFields?: DuoFields | null;
};

// ─── CPT « Partenaire » — partenaires ────────────────────────────────────

export type PartenaireFields = {
  logo?:                 AcfMediaEdge | null;
  lien?:                 string | null;
  categorieDuPartenaire?: {
    nodes: { id: string; name: string; slug: string }[];
  } | null;
};

export type PartenaireNode = {
  slug:        string;
  title:       string;
  partenaires?: PartenaireFields | null;
};

// ─── Variants ContentSection (utilisés par <ContentSection>) ─────────────

export type ContentVariant = "dark" | "light" | "accent";
