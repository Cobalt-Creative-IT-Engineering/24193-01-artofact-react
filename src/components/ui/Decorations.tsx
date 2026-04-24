import type { CSSProperties } from "react";

type DecorProps = {
  className?: string;
  style?: CSSProperties;
};

/** Demi-cercle turquoise — décoration positionnée en absolute par le parent. */
export function HalfCircleDecoration({ className = "", style }: DecorProps) {
  return (
    <svg
      viewBox="0 0 100 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={{ overflow: "visible", ...style }}
    >
      <path
        d="M100,0 A100,100 0 0,0 100,200 Z"
        fill="#50B6B0"
      />
    </svg>
  );
}

/** Cercle plein vert pomme — décoration positionnée en absolute par le parent. */
export function CircleDecoration({ className = "", style }: DecorProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <circle cx="50" cy="50" r="50" fill="#C6E85E" />
    </svg>
  );
}
