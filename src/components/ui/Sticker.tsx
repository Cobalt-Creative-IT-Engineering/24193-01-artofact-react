import type { CSSProperties } from "react";
import sticker01 from "../../assets/images/stickers/artofact_sticker_01.svg";
import sticker02 from "../../assets/images/stickers/artofact_sticker_02.svg";
import sticker03 from "../../assets/images/stickers/artofact_sticker_03.svg";
import sticker04 from "../../assets/images/stickers/artofact_sticker_04.svg";

const STICKER_MAP: Record<"01" | "02" | "03" | "04", string> = {
  "01": sticker01,
  "02": sticker02,
  "03": sticker03,
  "04": sticker04,
};

type StickerName = keyof typeof STICKER_MAP;

type StickerProps = {
  name: StickerName;
  className?: string;
  style?: CSSProperties;
  /** Texte alternatif — si absent, le sticker est masqué aux lecteurs d'écran */
  alt?: string;
};

/**
 * Affiche un sticker SVG Artofact via un <img> statique.
 * Les imports SVG sont résolus par Vite en URL au build.
 */
export function Sticker({ name, className, style, alt }: StickerProps) {
  return (
    <img
      src={STICKER_MAP[name]}
      alt={alt ?? ""}
      aria-hidden={!alt}
      className={className}
      style={style}
    />
  );
}
