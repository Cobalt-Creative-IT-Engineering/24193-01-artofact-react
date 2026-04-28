# Design System Artofact

Source : [doc/design/design-system/](design/design-system/) (PNG exportés Figma).

Ce document est la **source de vérité** côté front. Toute évolution du DS doit être :
1. mise à jour ici,
2. répercutée dans [src/index.css](../src/index.css) (variables CSS sous `:root`),
3. propagée à [tailwind.config.js](../tailwind.config.js) (`theme.extend.colors`, `fontFamily`, etc.) si Tailwind doit y accéder.

---

## 1. Couleurs

Palette en 4 familles × 5 tons (100 → 900). Plus le numéro est élevé, plus la couleur est foncée.

### Neutral

| Token | Hex | Usage suggéré |
|---|---|---|
| `neutral-100` | `#FFFFFF` | Fond clair pur (rare) |
| `neutral-300` | `#E5E5E5` | Fond clair UI, séparateurs |
| `neutral-500` | `#8E9DA9` | Texte secondaire / icônes inactives |
| `neutral-700` | `#5B707F` | Texte secondaire renforcé |
| `neutral-900` | `#1F313D` | **Fond principal homepage** / texte sur fond clair |

### Primary (turquoise / teal)

| Token | Hex |
|---|---|
| `primary-100` | `#E3F4F7` |
| `primary-300` | `#8EE1EF` |
| `primary-500` | `#4EBBCA` |
| `primary-700` | `#448893` |
| `primary-900` | `#2F595F` |

### Secondary (vert pomme / olive)

| Token | Hex |
|---|---|
| `secondary-100` | `#F6FCEA` |
| `secondary-300` | `#D9F299` |
| `secondary-500` | `#B3CF5D` |
| `secondary-700` | `#8DA054` |
| `secondary-900` | `#464F2F` |

### Tertiary (beige / brun)

| Token | Hex |
|---|---|
| `tertiary-100` | `#F8F7F6` |
| `tertiary-300` | `#F5ECE5` |
| `tertiary-500` | `#F3E1D1` |
| `tertiary-700` | `#957D64` |
| `tertiary-900` | `#605244` |

> **Note** : valeurs extraites par pipetage automatique du PNG `color.png`. À confirmer si une source plus précise (Figma JSON) est dispo.

### Mapping sémantique appliqué

Les rôles UI sont déjà branchés sur les tokens DS dans [src/index.css](../src/index.css) :

| Token sémantique | Token DS | Usage |
|---|---|---|
| `--color-bg`           | `tertiary-300`  | Fond clair (page, cards light) |
| `--color-bg-dark`      | `neutral-900`   | Fond sombre (home, /duos, /concept) |
| `--color-text`         | `neutral-900`   | Texte sur fond clair |
| `--color-text-on-dark` | `tertiary-300`  | Texte sur fond sombre |
| `--color-accent`       | `secondary-300` | CTA (pill verte) |
| `--color-accent-hover` | `secondary-500` | CTA hover |
| `--color-secondary`    | `primary-500`   | Sous-titres, stickers |
| `--color-muted`        | `neutral-500`   | Texte secondaire |

Le variant `accent` (cards `concept-card`, `duo-member-card`) utilise `primary-300` directement.

---

## 2. Dimensions

Système de grille 3 breakpoints, basé sur des colonnes fixes + gutters/margins.

### Mobile (≤ 400 px)
- Container max-width : **400 px**
- Margin (padding latéral du container) : **16 px**
- Gutter (espace entre colonnes) : **16 px**
- Grille : **4 colonnes**
- Largeurs cumulées : 1 col 80 px · 2 cols 176 px · 3 cols 272 px · 4 cols 368 px

### Tablet (≤ 768 px)
- Container max-width : **768 px**
- Margin : **32 px**
- Gutter : **24 px**
- Grille : **8 colonnes**
- Largeurs : 1 col 67 px · 2 cols 158 px · 3 cols 249 px · 4 cols 340 px · 5 cols 431 px · 6 cols 522 px · 7 cols 613 px · 8 cols 704 px

### Desktop (≤ 1440 px)
- Container max-width : **1440 px**
- Margin : **88 px**
- Gutter : **32 px**
- Grille : **12 colonnes**
- Largeurs : 1 col 76 px · 2 cols 184 px · 3 cols 292 px · 4 cols 400 px · 5 cols 508 px · 6 cols 616 px · 7 cols 724 px · 8 cols 832 px · 9 cols 940 px · 10 cols 1048 px · 11 cols 1156 px · 12 cols 1264 px

### Mapping CSS appliqué

Le code utilise deux variables consolidées plutôt qu'un set par breakpoint :

```css
--container:   1264px;                     /* contenu max desktop = 1440 - 2 × 88 */
--content-px:  clamp(16px, 6vw, 88px);     /* margin gauche/droite : 16 mobile → 88 desktop */
```

Le `clamp()` interpole linéairement entre les valeurs mobile (16 px) et desktop (88 px) — pas besoin de breakpoints discrets pour les marges. La largeur de contenu est plafonnée à `1264 px` au-delà de 1440 px de viewport.

Les colonnes de la grille (4 / 8 / 12) ne sont pas exposées en variables CSS pour l'instant — les layouts utilisent `flex` ou `grid` au cas par cas.

---

## 3. Typographie

### Famille

**Work Sans** (Google Fonts) — variable font, weights 100 → 900, italique inclus.

- Fichiers : [src/assets/fonts/Work Sans/](../src/assets/fonts/Work%20Sans/)
  - `WorkSans-VariableFont_wght.ttf` — normal
  - `WorkSans-Italic-VariableFont_wght.ttf` — italique
- Déclaration `@font-face` dans [src/index.css](../src/index.css) (deux blocs, `font-display: swap`, `font-weight: 100 900`).
- Exposée via `--font-display` et `--font-body` (override dans `html.theme-base`).

### Hiérarchie des tokens (référence Figma)

| Famille | Tokens |
|---|---|
| **Display** | `display-lg`, `display-md`, `display-sm` |
| **Heading** | `heading-xl`, `heading-lg`, `heading-md`, `heading-sm` |
| **Body** | `body-lg`, `body-md`, `body-sm` |
| **Label** | `label-lg`, `label-md`, `label-sm` |
| **Caption** | `caption` |
| **Button** | `button-lg`, `button-md`, `button-sm` |
| **Nav** | `nav-lg`, `nav-md` |

### État actuel dans le code

Les tailles ne sont **pas tokenisées** — les composants utilisent des `font-size: clamp(...)` inline (cf. `.duos-hero-title`, `.content-section-title`, etc.). Voir §5 pour les valeurs à extraire et tokeniser.

---

## 4. Migration / état du code

L'intégration des couleurs et du layout DS est **terminée**. La typographie l'est partiellement (font-family OK, tailles à tokeniser).

| Variable CSS | Source DS | État |
|---|---|---|
| `--color-bg`           | `tertiary-300` (`#F5ECE5`)   | ✓ aligné |
| `--color-bg-dark`      | `neutral-900` (`#1F313D`)    | ✓ aligné |
| `--color-text`         | `neutral-900` (`#1F313D`)    | ✓ aligné |
| `--color-text-on-dark` | `tertiary-300` (`#F5ECE5`)   | ✓ aligné |
| `--color-accent`       | `secondary-300` (`#D9F299`)  | ✓ aligné |
| `--color-accent-hover` | `secondary-500` (`#B3CF5D`)  | ✓ aligné |
| `--color-secondary`    | `primary-500` (`#4EBBCA`)    | ✓ aligné |
| `--color-muted`        | `neutral-500` (`#8E9DA9`)    | ✓ aligné |
| `--container`          | 1264 px (desktop content)    | ✓ aligné |
| `--content-px`         | clamp(16, 6vw, 88) px        | ✓ aligné |
| `--font-display` / `--font-body` | Work Sans          | ✓ chargée via @font-face |
| Tokens typo (`display-lg`, `heading-xl`, …) | cf §3      | ✗ pas tokenisé (clamp inline) |

Aliases legacy (`--bg`, `--surface`, `--accent`, etc.) restent pour ne pas casser les anciens composants — à dégraisser progressivement.

---

## 5. À compléter / valider

1. **Typographie** : extraire les valeurs de chaque token (`font-size`, `line-height`, `font-weight`, `letter-spacing`) depuis Figma et créer des classes utilitaires ou variables CSS dédiées (en remplacement des `clamp()` inline)
2. **Couleurs** : confirmer que les hex extraits du PNG sont corrects à 100 %, ou fournir un export précis (JSON Figma Tokens)
3. **Confirmation breakpoints** : la valeur `400 px` pour mobile est inhabituelle (la plupart des design systems prennent `640 / 768` comme premier breakpoint) — à confirmer
