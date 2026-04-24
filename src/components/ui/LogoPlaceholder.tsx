type Props = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Placeholder SVG du logo Artofact.
 * À remplacer par le vrai logo SVG quand il sera fourni.
 * Reprend la structure "arto / fact" sur 2 lignes visible dans la maquette.
 */
export function LogoPlaceholder({ className, style }: Props) {
  return (
    <svg
      viewBox="0 0 80 36"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Artofact"
      role="img"
      fill="currentColor"
      className={className}
      style={style}
    >
      <text
        x="0"
        y="16"
        fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="16"
        letterSpacing="-0.5"
      >
        art-ō
      </text>
      <text
        x="0"
        y="34"
        fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="16"
        letterSpacing="-0.5"
      >
        FacT
      </text>
    </svg>
  );
}
