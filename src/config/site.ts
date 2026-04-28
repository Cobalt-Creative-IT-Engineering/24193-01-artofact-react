// ─── Thème actif ──────────────────────────────────────────────────────────────
// Changer cette valeur et rebuilder pour changer l'identité visuelle du site.
// Le blueprint fournit uniquement le thème "base". Ajoutez vos propres thèmes
// dans src/themes/ (voir src/themes/index.ts).
import type { ThemeName } from "../themes/index";
export const ACTIVE_THEME: ThemeName = "base";

// ─── Coming Soon / Page d'attente ─────────────────────────────────────────
// Deux leviers pour afficher une page d'attente avant l'ouverture du site :
//   1. FORCE_COMING_SOON=true  → toujours afficher
//   2. VITE_COMING_SOON_UNTIL=YYYY-MM-DDTHH:mm  → afficher tant que la date
//      n'est pas atteinte (fuseau local du navigateur)

export const FORCE_COMING_SOON = false;

export const COMING_SOON_UNTIL: Date | null = (() => {
  const raw = import.meta.env.VITE_COMING_SOON_UNTIL;
  if (typeof raw !== "string" || !raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
})();

// ─── Site Configuration ───────────────────────────────────────────────────
// Centralise le nom du site, la langue et les éléments de navigation.

export const SITE_CONFIG = {
  name:        "Artofact",
  lang:        "fr",
  description: "Mêler art et industrie",
} as const;

// ─── Réseaux sociaux ──────────────────────────────────────────────────────────
// À renseigner avec les vrais liens Artofact
export const SOCIAL_LINKS = {
  instagram: "",
  linkedin:  "",
  youtube:   "",
} as const;

// ─── Types de navigation ──────────────────────────────────────────────────────

export type NavChildItem = { id: number; title: string; url: string };
export type NavItem = {
  id: number;
  title: string;
  url: string;
  cta: boolean;
  children?: readonly NavChildItem[];
};

// cta: true → s'affiche à droite du nav en style bouton
// cta: false → lien standard (dans le menu full-screen)
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 1, title: "Concept",            url: "/concept",           cta: false },
  { id: 2, title: "Organisation",       url: "/organisation",      cta: false },
  { id: 3, title: "Comptoir gruérien",  url: "/comptoir-gruerien", cta: false },
  { id: 4, title: "Partenaires",        url: "/partenaires",       cta: false },
  { id: 5, title: "Les duos",           url: "/duos",              cta: true,
    children: [
      { id: 51, title: "Matthia Gremaud × Morand construction", url: "/duos/matthia-gremaud" },
      { id: 52, title: "ECAL × Ateliers Firmann",               url: "/duos/ecal" },
    ],
  },
];
