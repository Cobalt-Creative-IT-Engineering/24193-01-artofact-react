# Fiche technique ACF — Pages Duos Artofact

Ce document décrit **exactement** ce qu'il faut créer côté WordPress (Custom Post Type + Advanced Custom Fields) pour alimenter les pages `/duos` et `/duos/:slug` du site Artofact.

Les noms de champs (slug ACF) doivent être respectés à l'identique — ils sont référencés dans `src/config/acf-schemas.ts` côté React.

---

## 1. Prérequis WordPress

Les plugins suivants doivent être actifs sur l'instance Artofact :

- **Advanced Custom Fields (ACF PRO)** — création des groupes de champs, Options Pages et Repeaters
- **ACF to REST API** — expose les champs ACF sur `/wp-json/acf/v3/*`

> Si ACF PRO n'est pas dispo, les **Options Pages** ne sont pas supportées. Dans ce cas, attacher le groupe de champs à une Page WP "Duos listing" à la place.

---

## 2. Enregistrement du CPT `duo`

Dans le `functions.php` du thème WordPress (ou dans un plugin dédié) :

```php
add_action('init', function () {
    register_post_type('duo', [
        'labels' => [
            'name'          => 'Duos',
            'singular_name' => 'Duo',
            'add_new_item'  => 'Ajouter un duo',
            'edit_item'     => 'Modifier le duo',
        ],
        'public'       => true,
        'show_in_rest' => true,
        'rest_base'    => 'duos',
        'supports'     => ['title', 'thumbnail'],
        'has_archive'  => false,
        'menu_icon'    => 'dashicons-groups',
    ]);
});
```

Points importants :
- `rest_base` = `"duos"` — l'endpoint REST sera `/wp-json/wp/v2/duos`
- `supports` inclut `thumbnail` — la featured media est utilisée comme image hero (page détail) ET comme image dans la card liste. **Pas de champ ACF image séparé.**
- `show_in_rest` = `true` — obligatoire pour que le CPT soit exposé via REST API

---

## 3. Options Sub-Page `duos-listing`

Cette Options Sub-Page alimente le hero de la page liste `/duos`.

### Création dans `functions.php`

```php
if (function_exists('acf_add_options_sub_page')) {
    acf_add_options_sub_page([
        'page_title'  => 'Duos — Listing',
        'menu_title'  => 'Duos listing',
        'parent_slug' => 'options-general.php',
        'menu_slug'   => 'duos-listing',
        'capability'  => 'edit_posts',
    ]);
}
```

### Exposition REST

```php
add_filter('acf/rest_api/options_pages', function ($pages) {
    $pages[] = [
        'slug' => 'duos-listing',
        'name' => 'Duos listing',
    ];
    return $pages;
});
```

### Champs ACF de l'Options Page

**Nom du groupe** : `Duos — Hero listing`
**Emplacement** : `Options Page` est égal à `Duos listing`

| Slug (name) | Label | Type | Instructions |
|---|---|---|---|
| `duos_hero_title` | Titre du hero | Text | Ex : "Les duos". Fallback React : "Les duos". |
| `duos_hero_intro` | Texte intro | Textarea | Paragraphe affiché à droite du titre dans le hero. |

---

## 4. Groupe ACF "Duo"

**Nom du groupe** : `Duo`
**Emplacement** : `Type de post` est égal à `Duo`

### 4.1 Champs principaux

| Slug (name) | Label | Type | Instructions |
|---|---|---|---|
| `duo_subtitle` | Sous-titre | Text | Ex : "Un duo gravé dans le métal". Affiché sous le titre dans le hero détail. |
| `duo_intro_text` | Texte intro | Textarea | Paragraphe descriptif. Utilisé dans la card liste ET dans le hero détail. |

### 4.2 Repeater `duo_members`

| Slug (name) | Label | Type | Options |
|---|---|---|---|
| `duo_members` | Membres du duo | Repeater | Min : 2, Max : 2. Layout : Block. |

**Sous-champs du repeater `duo_members`** :

| Slug (name) | Label | Type | Instructions |
|---|---|---|---|
| `member_name` | Nom | Text | Prénom + Nom ou nom de l'entité (ex : "Matthia Gremaud"). |
| `member_photo` | Photo | Image | Return Format : **Image Array**. Photo portrait ou paysage de l'artiste/structure. |
| `member_text` | Texte | Textarea | Description du membre, de son travail ou de son rôle dans le duo. |
| `member_cta_label` | Libellé du bouton | Text | Ex : "Découvrir le duo". Laisser vide pour ne pas afficher de CTA. |
| `member_cta_url` | URL du bouton | URL | URL externe (site de l'artiste, portfolio…). Le lien s'ouvre dans `target="_blank"`. |

> **Note** : `member_cta_url` est une URL externe — le composant React détecte automatiquement les URLs commençant par `http` et ajoute `target="_blank" rel="noopener noreferrer"`.

---

## 5. Vérification REST

Une fois le CPT enregistré et quelques duos créés côté WP, les URLs suivantes doivent renvoyer du JSON :

### Liste des duos (avec médias embarqués)

```
GET {VITE_WP_URL}/wp-json/wp/v2/duos?_embed=1&per_page=100
```

Réponse attendue (format simplifié) :

```json
[
  {
    "id": 42,
    "slug": "ecal-ateliers-firmann",
    "title": { "rendered": "ECAL x Ateliers Firmann" },
    "acf": {
      "duo_subtitle": "Un duo gravé dans le métal",
      "duo_intro_text": "Lorem ipsum…",
      "duo_members": [...]
    },
    "_embedded": {
      "wp:featuredmedia": [
        { "source_url": "https://…/photo.jpg", "alt_text": "" }
      ]
    }
  }
]
```

### Duo par slug

```
GET {VITE_WP_URL}/wp-json/wp/v2/duos?slug=ecal-ateliers-firmann&_embed=1
```

Retourne un tableau avec 0 ou 1 élément.

### Options Sub-Page duos-listing

```
GET {VITE_WP_URL}/wp-json/acf/v3/options/duos-listing
```

Réponse attendue :

```json
{
  "acf": {
    "duos_hero_title": "Les duos",
    "duos_hero_intro": "Lorem ipsum…"
  }
}
```

---

## 6. Côté React (référence des schémas TS)

Une fois les ACF créés côté WP, les schémas déclarés dans `src/config/acf-schemas.ts` sont :

```ts
// Options Sub-Page "duos-listing"
export const DuosListingACF = {
  heroTitle: "duos_hero_title",
  heroIntro: "duos_hero_intro",
} as const;

// CPT "duo"
export const DuoACF = {
  subtitle:  "duo_subtitle",
  introText: "duo_intro_text",
  members:   "duo_members",
} as const;

export type DuoMemberItem = {
  member_name?:      string;
  member_photo?:     { url: string; alt?: string } | number | null;
  member_text?:      string;
  member_cta_label?: string;
  member_cta_url?:   string;
};
```

Les appels React :

- **Page liste** : `useACFOptionsPage("duos-listing")` + `useCPT<RawDuo>("duos", { perPage: 100, embed: true })`
- **Page détail** : `useCPTBySlug<RawDuo>("duos", slug)` — retourne l'item ou `null`
- **Image** : `featured_media` WP uniquement (accessible via `_embedded["wp:featuredmedia"][0].source_url`). Pas de champ ACF image séparé.
