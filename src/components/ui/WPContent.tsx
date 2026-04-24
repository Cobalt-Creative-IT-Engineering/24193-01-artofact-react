import type { CSSProperties } from "react";

/**
 * Rendu du HTML provenant de WordPress.
 * Les styles `.prose-custom` sont définis dans src/index.css.
 */
export function WPContent({
  html,
  className = "",
  style,
}: {
  html: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`prose-custom ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
