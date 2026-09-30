// ─── Gestion des balises meta (SEO + Open Graph + Twitter Card) ───────────────

import { SITE_CONFIG } from "../config/site";

// Nom et description viennent de SITE_CONFIG. Ils étaient auparavant lus sur
// /wp-json/ au boot : ~280 Ko et ~0,8 s de PHP à chaque chargement, en
// concurrence avec les requêtes de contenu, pour les deux mêmes chaînes.
const _siteName: string = SITE_CONFIG.name;
const _siteDesc: string = SITE_CONFIG.description;

export interface PageMeta {
  /** Label de la page (sans le nom du site). Ex : "À propos" */
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  /**
   * Retire la page de l'index des moteurs.
   * Indispensable sur la route 404 : l'hébergement statique renvoie 200 pour
   * toute URL inconnue (le serveur sert index.html et c'est le routeur client
   * qui décide), donc sans ce drapeau un lien périmé ou une faute de frappe
   * s'indexe comme une page valide — un "soft 404".
   */
  noindex?: boolean;
}

/**
 * Met à jour toutes les balises meta de la page :
 * <title>, description, og:*, twitter:*
 */
export function setPageMeta(meta: PageMeta = {}) {
  const pageLabel   = meta.title || null;
  const fullTitle   = pageLabel ? `${_siteName} - ${pageLabel}` : _siteName;
  const description = meta.description || _siteDesc || _siteName;
  const type        = meta.type || "website";
  const url         = window.location.href;

  document.title = fullTitle;

  setMeta("name",     "description",        description);
  setMeta("property", "og:title",           fullTitle);
  setMeta("property", "og:description",     description);
  setMeta("property", "og:type",            type);
  setMeta("property", "og:site_name",       _siteName);
  setMeta("property", "og:url",             url);
  setMeta("name",     "twitter:card",       meta.image ? "summary_large_image" : "summary");
  setMeta("name",     "twitter:title",      fullTitle);
  setMeta("name",     "twitter:description",description);

  if (meta.image) {
    setMeta("property", "og:image",    meta.image);
    setMeta("name",     "twitter:image", meta.image);
  } else {
    removeMeta("property", "og:image");
    removeMeta("name",     "twitter:image");
  }

  // Toujours repositionné à chaque changement de route : sans le retrait
  // explicite, une page valide atteinte depuis la 404 resterait désindexée.
  if (meta.noindex) {
    setMeta("name", "robots", "noindex, follow");
  } else {
    removeMeta("name", "robots");
  }
}

function setMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

function removeMeta(attr: "name" | "property", key: string) {
  document.querySelector(`meta[${attr}="${key}"]`)?.remove();
}
