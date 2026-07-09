/**
 * Rendu du HTML issu d'un champ WYSIWYG WordPress (`<p>`, `<ul>`, `<a>`, …).
 *
 * Contrairement à <WPContent> (classe `.prose-custom`, couleur foncée figée),
 * <RichText> n'impose aucune couleur : le texte hérite de celle du conteneur,
 * pour rester lisible aussi bien sur les sections claires que sombres.
 * Espacement des blocs enfants géré par `.rich-text` dans src/index.css.
 */
export function RichText({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={`rich-text ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
