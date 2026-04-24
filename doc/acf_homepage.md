# Fiche technique ACF — HomePage Artofact

Ce document décrit **exactement** ce qu'il faut créer côté WordPress (plugin Advanced Custom Fields) pour alimenter la page d'accueil du site Artofact.

Les noms de champs (slug ACF) doivent être respectés à l'identique — ils sont référencés dans [src/config/acf-schemas.ts](../src/config/acf-schemas.ts) côté React.

---

## 1. Prérequis WordPress

Les plugins suivants doivent être actifs sur l'instance Artofact :

- **Advanced Custom Fields (ACF PRO)** — création des groupes de champs
- **ACF to REST API** — expose les champs ACF sur `/wp-json/acf/v3/*`

> Si ACF PRO n'est pas dispo, les **Options Pages** ne sont pas supportées. Dans ce cas, attacher le groupe de champs à la Page WP d'accueil (front page) à la place.

---

## 2. Options Page "Accueil"

La page d'accueil du site est alimentée par une **Options Sub-Page** ACF (plutôt qu'une Page WP), pour qu'elle soit éditable via un écran dédié dans l'admin.

### Création de l'Options Page

Dans le `functions.php` du thème WordPress (ou dans un plugin dédié) :

```php
if (function_exists('acf_add_options_sub_page')) {
    acf_add_options_sub_page([
        'page_title'  => 'Accueil',
        'menu_title'  => 'Accueil',
        'parent_slug' => 'options-general.php', // ou null pour top-level
        'menu_slug'   => 'accueil',
        'capability'  => 'edit_posts',
    ]);
}
```

Le slug `accueil` est **important** : il est utilisé côté React par `useACFOptionsPage("accueil")`.

### Exposition REST

Pour que la Options Page soit lisible via REST API (`/wp-json/acf/v3/options/accueil`), ajouter :

```php
add_filter('acf/rest_api/options_pages', function ($pages) {
    $pages[] = [
        'slug' => 'accueil',
        'name' => 'Accueil',
    ];
    return $pages;
});
```

> Selon la version d'ACF to REST API, ce filtre peut varier. Tester l'URL `/wp-json/acf/v3/options/accueil` avant de passer à la suite — elle doit renvoyer un JSON (même vide).

---

## 3. Groupe de champs "Accueil"

**Nom du groupe** : `Accueil`
**Emplacement (Location Rules)** : `Options Page` est égal à `Accueil`

### 3.1 Section Hero (image plein écran)

| Slug (name) | Label | Type | Instructions | Options |
|---|---|---|---|---|
| `home_hero_image` | Hero — Image de fond | Image | Image plein écran (soudeur, etc.). Format paysage recommandé, min. 1920×1080. | Return Format : **Image Array** |

### 3.2 Section "Mêler art et industrie"

| Slug (name) | Label | Type | Instructions | Options |
|---|---|---|---|---|
| `home_intro_title` | Intro — Titre | Text | Titre principal (ex : "Mêler art et industrie"). | — |
| `home_intro_text` | Intro — Texte | WYSIWYG | Paragraphe descriptif. | Tabs : Visual & Text ; Toolbar : Basic |
| `home_intro_cta_label` | Intro — Libellé du bouton | Text | Ex : "En savoir plus". Laisser vide pour ne pas afficher le bouton. | — |
| `home_intro_cta_url` | Intro — URL du bouton | URL | Ex : `/concept`. | — |

### 3.3 Section "Les duos"

| Slug (name) | Label | Type | Instructions | Options |
|---|---|---|---|---|
| `home_duos_title` | Duos — Titre de section | Text | Ex : "Les duos". | — |
| `home_duos_items` | Duos — Liste | Repeater | 2 duos à afficher sur la home (les plus récents ou en mise en avant). | Min : 0, Max : 4. Layout : Block. |

**Sous-champs du repeater `home_duos_items`** :

| Slug (name) | Label | Type | Options |
|---|---|---|---|
| `title` | Titre du duo | Text | Ex : "Les duos" ou "Duo 1" |
| `subtitle` | Sous-titre | Text | Ex : "Matthia Gremaud x Morand construction" |
| `image` | Image | Image | Return Format : **Image Array** |
| `text` | Description | Textarea | Paragraphe. |
| `cta_label` | Libellé du bouton | Text | Ex : "Découvrir" |
| `cta_url` | URL du bouton | URL | Ex : `/duos/matthia-gremaud` (à terme lié au CPT duos) |

### 3.4 Section "Comptoir gruérien"

| Slug (name) | Label | Type | Instructions | Options |
|---|---|---|---|---|
| `home_comptoir_title` | Comptoir — Titre | Text | Ex : "Comptoir gruérien". | — |
| `home_comptoir_subtitle` | Comptoir — Sous-titre | Text | Ex : "Une magnifique vitrine". | — |
| `home_comptoir_text` | Comptoir — Texte | WYSIWYG | Paragraphe descriptif. | Toolbar : Basic |
| `home_comptoir_cta_label` | Comptoir — Libellé du bouton | Text | Ex : "En savoir plus". | — |
| `home_comptoir_cta_url` | Comptoir — URL du bouton | URL | Ex : `/comptoir-gruerien`. | — |

---

## 4. Vérification

Une fois le groupe créé et quelques champs remplis côté WP, l'URL suivante doit renvoyer les valeurs en JSON :

```
GET {VITE_WP_URL}/wp-json/acf/v3/options/accueil
```

Réponse attendue (format simplifié) :

```json
{
  "acf": {
    "home_hero_image": { "url": "...", "alt": "..." },
    "home_intro_title": "Mêler art et industrie",
    "home_intro_text": "<p>...</p>",
    "home_intro_cta_label": "En savoir plus",
    "home_intro_cta_url": "/concept",
    "home_duos_title": "Les duos",
    "home_duos_items": [
      {
        "title": "...",
        "subtitle": "Matthia Gremaud x Morand construction",
        "image": { "url": "...", "alt": "..." },
        "text": "...",
        "cta_label": "Découvrir",
        "cta_url": "/duos/matthia-gremaud"
      }
    ],
    "home_comptoir_title": "Comptoir gruérien",
    "home_comptoir_subtitle": "Une magnifique vitrine",
    "home_comptoir_text": "<p>...</p>",
    "home_comptoir_cta_label": "En savoir plus",
    "home_comptoir_cta_url": "/comptoir-gruerien"
  }
}
```

---

## 5. Côté React (pour référence)

Une fois les ACF créés côté WP, le schéma ajouté dans [src/config/acf-schemas.ts](../src/config/acf-schemas.ts) sera :

```ts
export const HomeACF = {
  heroImage:        "home_hero_image",
  introTitle:       "home_intro_title",
  introText:        "home_intro_text",
  introCtaLabel:    "home_intro_cta_label",
  introCtaUrl:      "home_intro_cta_url",
  duosTitle:        "home_duos_title",
  duosItems:        "home_duos_items",
  comptoirTitle:    "home_comptoir_title",
  comptoirSubtitle: "home_comptoir_subtitle",
  comptoirText:     "home_comptoir_text",
  comptoirCtaLabel: "home_comptoir_cta_label",
  comptoirCtaUrl:   "home_comptoir_cta_url",
} as const;
```

Et l'appel via `useACFOptionsPage("accueil")`.

---

## 6. Évolutions prévues (post-HomePage)

- Les items de `home_duos_items` deviendront à terme des **relations** vers un CPT `duo` (quand le CPT existera). Pour l'instant, on reste en repeater "autoportant" pour débloquer la home.
- Les options **Footer / Partenaires / Contact** feront l'objet de leurs propres fiches ACF dans des itérations ultérieures.
