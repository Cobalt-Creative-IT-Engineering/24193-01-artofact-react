import type { ReactNode } from "react";

/**
 * Découpe le titre d'un duo sur " x " et retourne un ReactNode avec les
 * parties séparées par <br/> "x" <br/>. Si la chaîne ne contient pas " x ",
 * retourne la string telle quelle.
 *
 * Exemple : "Matthia Gremaud x Morand construction"
 *   → "Matthia Gremaud" <br/> "x" <br/> "Morand construction"
 */
export function formatDuoTitle(title: string): ReactNode {
  const parts = title.split(" x ");
  if (parts.length === 1) return title;
  return parts.flatMap((p, i) =>
    i === 0
      ? [p]
      : [<br key={i * 2} />, "x", <br key={i * 2 + 1} />, p]
  );
}
