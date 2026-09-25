import { useEffect } from "react";
import { useRoute, navigate } from "./hooks/useRoute";
import { Nav, Footer } from "./components/layout";
import { HomePage }            from "./pages/HomePage";
import { ComingSoonPage }      from "./pages/ComingSoonPage";
import { ConceptPage }         from "./pages/ConceptPage";
import { DuosPage }            from "./pages/DuosPage";
import { DuoDetailPage }       from "./pages/DuoDetailPage";
import { PartenairesPage }     from "./pages/PartenairesPage";
import { ArtistesPage }        from "./pages/ArtistesPage";
import { NotFoundPage }        from "./pages/NotFoundPage";
import { ACTIVE_THEME, FORCE_COMING_SOON, COMING_SOON_UNTIL } from "./config/site";
import { THEMES }              from "./themes/index";
import { Decorations }         from "./themes/Decorations";
import { initMeta, setPageMeta } from "./lib/meta";

// ─── Application du thème ─────────────────────────────────────────────────────
const _theme = THEMES[ACTIVE_THEME];
document.documentElement.classList.add(_theme.cssClass);
if (_theme.fontsUrl) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = _theme.fontsUrl;
  document.head.appendChild(link);
}

// ─── Intercepteur de liens SPA (History API) ──────────────────────────────────
// Intercepte les clics sur <a href="/..."> internes pour éviter le rechargement.
document.addEventListener("click", (e) => {
  const a = (e.target as Element).closest("a");
  if (!a) return;
  const href = a.getAttribute("href");
  if (!href) return;
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
  if (a.getAttribute("target") === "_blank") return;
  if (a.getAttribute("download") != null) return;
  if (href.startsWith("#")) return; // ancres de page
  e.preventDefault();
  navigate(href);
});

const PAGE_LABELS: Record<string, string> = {
  "/concept":     "Le concept",
  "/duos":        "Les duos",
  "/partenaires": "Les partenaires",
  "/artistes":    "Les artistes",
};

function getPageLabel(route: string): string | undefined {
  if (route === "/" || route === "") return undefined;
  if (PAGE_LABELS[route]) return PAGE_LABELS[route];
  if (route.startsWith("/duos/")) return "Les duos";
  return undefined;
}

/** Retourne true tant que la page d'attente doit être affichée. */
function shouldShowComingSoon(): boolean {
  if (FORCE_COMING_SOON) return true;
  if (COMING_SOON_UNTIL && new Date() < COMING_SOON_UNTIL) return true;
  return false;
}

export default function App() {
  const { route, anchor } = useRoute();

  // Infos du site WordPress (une seule fois) → initialise le module meta.
  useEffect(() => {
    fetch("/wp-json/")
      .then((r) => r.json())
      .then((d) => { initMeta(d?.name ?? "", d?.description ?? ""); })
      .catch(() => {});
  }, []);

  // Meta par défaut selon la route (les pages de détail écrasent avec leurs propres infos).
  useEffect(() => {
    // L'hébergement statique répond 200 à toute URL inconnue : c'est le routeur
    // client qui tranche. Sans ce noindex, un lien périmé ou une faute de frappe
    // s'indexerait comme une page valide.
    const found = resolvePage(route) !== null;
    setPageMeta({
      title:   found ? getPageLabel(route) : "Page non trouvée",
      noindex: !found,
    });
  }, [route]);

  // Scroll : ancre si présente, sinon remonte en haut.
  useEffect(() => {
    if (anchor) {
      const t = setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [route, anchor]);

  if (shouldShowComingSoon()) return <ComingSoonPage />;

  return (
    <div className="app">
      <Decorations />
      <Nav />
      <PageView route={route} />
      <Footer />
    </div>
  );
}

/**
 * Résout une route vers sa page, ou null si aucune ne correspond.
 *
 * Table unique, volontairement : la garde noindex de App() s'appuie sur cette
 * même fonction. Une route ajoutée ici est donc automatiquement considérée
 * comme valide par les moteurs, sans second endroit à tenir à jour.
 */
function resolvePage(route: string) {
  if (route === "/" || route === "")  return <HomePage />;
  if (route === "/concept")           return <ConceptPage />;
  if (route === "/duos")              return <DuosPage />;
  if (route.startsWith("/duos/"))     return <DuoDetailPage slug={route.replace("/duos/", "")} />;
  if (route === "/partenaires")       return <PartenairesPage />;
  if (route === "/artistes")          return <ArtistesPage />;
  return null;
}

function PageView({ route }: { route: string }) {
  return resolvePage(route) ?? <NotFoundPage />;
}
