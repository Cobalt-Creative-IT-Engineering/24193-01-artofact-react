# Fiche technique ACF — ConceptPage Artofact

Ce document décrit **exactement** ce qu'il faut créer côté WordPress (plugin Advanced Custom Fields) pour alimenter la page `/concept` du site Artofact.

Les noms de champs (slug ACF) doivent être respectés à l'identique — ils sont référencés dans `src/config/acf-schemas.ts` côté React.

---

## 1. Prérequis WordPress

Les plugins suivants doivent être actifs sur l'instance Artofact :

- **Advanced Custom Fields (ACF PRO)** — création des groupes de champs et Options Pages
- **ACF to REST API** — expose les champs ACF sur `/wp-json/acf/v3/*`

> Si ACF PRO n'est pas dispo, les **Options Pages** ne sont pas supportées. Dans ce cas, attacher le groupe de champs à la Page WP correspondante à la place.

---

## 2. Options Page "Concept"

La page concept est alimentée par une **Options Sub-Page** ACF (même pattern que l'accueil), pour qu'elle soit éditable via un écran dédié dans l'admin.

### Création de l'Options Page

Dans le `functions.php` du thème WordPress (ou dans un plugin dédié) :

```php
if (function_exists('acf_add_options_sub_page')) {
    acf_add_options_sub_page([
        'page_title'  => 'Concept',
        'menu_title'  => 'Concept',
        'parent_slug' => 'options-general.php', // ou null pour top-level
        'menu_slug'   => 'concept',
        'capability'  => 'edit_posts',
    ]);
}
```

Le slug `concept` est **important** : il est utilisé côté React par `useACFOptionsPage("concept")`.

### Exposition REST

Pour que la Options Page soit lisible via REST API (`/wp-json/acf/v3/options/concept`), ajouter :

```php
add_filter('acf/rest_api/options_pages', function ($pages) {
    $pages[] = [
        'slug' => 'concept',
        'name' => 'Concept',
    ];
    return $pages;
});
```

> Selon la version d'ACF to REST API, ce filtre peut varier. Tester l'URL `/wp-json/acf/v3/options/concept` avant de passer à la suite — elle doit renvoyer un JSON (même vide).

---

## 3. Groupe de champs "Concept"

**Nom du groupe** : `Concept`
**Emplacement (Location Rules)** : `Options Page` est égal à `Concept`

### 3.1 Section Hero

| Slug (name) | Label | Type | Instructions |
|---|---|---|---|
| `concept_hero_title` | Hero — Titre | Text | Titre principal affiché en grand à gauche (ex : "Le concept"). |
| `concept_hero_text` | Hero — Texte | Textarea | Paragraphe descriptif affiché à droite du titre. Pas d'image dans le hero. |

### 3.2 Sections de contenu (Repeater)

| Slug (name) | Label | Type | Instructions | Options |
|---|---|---|---|---|
| `concept_sections` | Sections de contenu | Repeater | Blocs image+texte+CTA alternés. | Min : 1, Max : 8. Layout : Block. |

**Sous-champs du repeater `concept_sections`** :

| Slug (name) | Label | Type | Instructions | Options |
|---|---|---|---|---|
| `title` | Titre | Text | Titre de la section (ex : "Mêler art et industrie"). | — |
| `text` | Texte | Textarea | Paragraphe descriptif de la section. | — |
| `cta_label` | Libellé du bouton | Text | Ex : "Découvrir". Laisser vide pour ne pas afficher de CTA. | — |
| `cta_url` | URL du bouton | URL | Ex : `/duos`. | — |
| `image` | Image | Image | Photo illustrant la section (format paysage recommandé). | Return Format : **Image Array** |
| `variant` | Variante de fond | Select | Pilote le fond et la couleur du texte de la section. | Choices : `dark` → Fond sombre, `light` → Fond clair, `accent` → Fond turquoise. Default : `dark`. |

---

## 4. Vérification

Une fois le groupe créé et quelques champs remplis côté WP, l'URL suivante doit renvoyer les valeurs en JSON :

```
GET {VITE_WP_URL}/wp-json/acf/v3/options/concept
```

Réponse attendue (format simplifié) :

```json
{
  "acf": {
    "concept_hero_title": "Le concept",
    "concept_hero_text": "Artofact mêle art et industrie...",
    "concept_sections": [
      {
        "title": "Mêler art et industrie",
        "text": "Lorem ipsum...",
        "cta_label": "Découvrir",
        "cta_url": "/duos",
        "image": { "url": "https://...", "alt": "..." },
        "variant": "dark"
      },
      {
        "title": "Des duos favorisant l'échange",
        "text": "Lorem ipsum...",
        "cta_label": "Découvrir",
        "cta_url": "/duos",
        "image": { "url": "https://...", "alt": "..." },
        "variant": "light"
      }
    ]
  }
}
```

---

## 5. Côté React (pour référence)

Une fois les ACF créés côté WP, le schéma déclaré dans `src/config/acf-schemas.ts` est :

```ts
export const ConceptACF = {
  heroTitle: "concept_hero_title",
  heroText:  "concept_hero_text",
  sections:  "concept_sections",
} as const;

export type ContentVariant = "dark" | "light" | "accent";

export type ConceptSectionItem = {
  title?:     string;
  text?:      string;
  cta_label?: string;
  cta_url?:   string;
  image?:     { url: string; alt?: string } | number | null;
  variant?:   ContentVariant;
};
```

L'appel se fait via `useACFOptionsPage("concept")` dans `src/pages/ConceptPage.tsx`.

Le champ `variant` est un Select ACF avec 3 choix (`dark`, `light`, `accent`). Si absent ou vide, le composant React applique un fallback : alternance `dark`/`light` selon l'index pair/impair de la section.
