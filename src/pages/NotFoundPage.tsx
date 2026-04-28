import { useEffect } from "react";
import { setPageMeta } from "../lib/meta";
import { CTAButton } from "../components/ui";

export function NotFoundPage() {
  useEffect(() => {
    setPageMeta({ title: "Page non trouvée" });
  }, []);

  return (
    <main className="not-found">
      <div className="not-found-inner">
        <p className="not-found-code">404</p>
        <h1 className="not-found-title">Page introuvable</h1>
        <p className="not-found-text">
          La page que vous cherchez n'existe pas (encore) ou a été déplacée.
        </p>
        <div className="not-found-cta">
          <CTAButton href="/">Retour à l'accueil</CTAButton>
        </div>
      </div>
    </main>
  );
}
