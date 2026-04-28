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

> **Note** : valeurs extraites par pipetage automatique du PNG `color.png` (script `/tmp/extract_colors.py`). À confirmer si une source plus précise (Figma JSON) est dispo.

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

### Mapping CSS variables (proposition)

```css
:root {
  --container-mobile:  400px;
  --container-tablet:  768px;
  --container-desktop: 1440px;
  --margin-mobile:      16px;
  --margin-tablet:      32px;
  --margin-desktop:     88px;
  --gutter-mobile:      16px;
  --gutter-tablet:      24px;
  --gutter-desktop:     32px;
}
```

> Le projet utilisait jusqu'ici `--container: 72rem (= 1152 px)` et `--content-px: clamp(1.25rem, 5vw, 3rem)`. À harmoniser avec ce DS — voir §4 "Migration".

---

## 3. Typographie

Hiérarchie des tokens (lue dans `typo.png`) :

| Famille | Tokens |
|---|---|
| **Display** | `display-lg`, `display-md`, `display-sm` |
| **Heading** | `heading-xl`, `heading-lg`, `heading-md`, `heading-sm` |
| **Body** | `body-lg`, `body-md`, `body-sm` |
| **Label** | `label-lg`, `label-md`, `label-sm` |
| **Caption** | `caption` |
| **Button** | `button-lg`, `button-md`, `button-sm` |
| **Nav** | `nav-lg`, `nav-md` |

### À fournir pour chaque token

- `font-family` (la police affichée dans `typo.png` est une sans-serif géométrique — **nom à confirmer**)
- `font-size` (en px ou rem)
- `line-height` (en px, rem ou unitless)
- `font-weight` (400 / 500 / 600 / 700 / …)
- `letter-spacing` (le cas échéant)

### Fichiers de fonts

- À placer dans [src/assets/fonts/](../src/assets/fonts/) (dossier déjà créé, vide).
- Format préféré : `.woff2` (taille + compatibilité optimales).
- Déclaration `@font-face` à ajouter dans [src/index.css](../src/index.css).

---

## 4. Migration / mapping vers le code actuel

État avant intégration du DS (à mettre à jour quand le DS est appliqué) :

| Variable CSS actuelle | Valeur actuelle | Token DS correspondant |
|---|---|---|
| `--color-bg`        | `#E8E6E1` | aucun direct — proche de `tertiary-300` (`#F5ECE5`) ? À trancher |
| `--color-bg-dark`   | `#1F313D` | `neutral-900` ✓ |
| `--color-text`      | `#1A2A3A` | proche de `neutral-900` — à aligner exactement sur `#1F313D` ? |
| `--color-accent`    | `#C6E85E` | proche de `secondary-300/500` (entre `#D9F299` et `#B3CF5D`) — à choisir |
| `--color-secondary` | `#50B6B0` | proche de `primary-500` (`#4EBBCA`) — à aligner |
| `--color-muted`     | `#8A8A85` | proche de `neutral-500` (`#8E9DA9`) — à aligner |
| `--container`       | `72rem` (1152 px) | non aligné DS — DS prévoit `1440px` desktop avec marges 88px → contenu 1264px |
| `--content-px`      | `clamp(1.25rem, 5vw, 3rem)` | non aligné DS — DS prévoit margins fixes 16/32/88 selon breakpoint |

---

## 5. À compléter / valider

Pour finaliser l'intégration du DS, il faut :

1. **Typographie** :
   - Nom de la font-family (et fichiers `.woff2` si custom)
   - Pour chaque token (`display-lg`, `heading-xl`, `body-md`, `button-md`, `nav-lg`, etc.) : `font-size`, `line-height`, `font-weight`, et `letter-spacing` éventuel
2. **Couleurs** : confirmer que les hex extraits ci-dessus sont corrects à 100 %, ou fournir un export précis (JSON Figma Tokens, doc Figma, etc.)
3. **Mapping sémantique** : pour chaque rôle UI (texte primaire, texte secondaire, fond CTA, bordure, etc.), désigner le token DS à utiliser
4. **Confirmation breakpoints** : la valeur `400 px` pour mobile est inhabituelle (la plupart des design systems prennent `640 / 768` comme premier breakpoint) — à confirmer
