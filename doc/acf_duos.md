# Fiche technique ACF — Pages Duos Artofact

Ce document décrit **exactement** ce qu'il faut créer côté WordPress (Custom Post Type + Advanced Custom Fields) pour alimenter les pages `/duos` et `/duos/:slug` du site Artofact.

Les noms de champs et les noms GraphQL doivent être respectés à l'identique — ils sont référencés dans [src/config/acf-schemas.ts](../src/config/acf-schemas.ts) et dans les queries GraphQL côté React.

> ⚠️ **Important — voie GraphQL** : contrairement aux pages d'accueil et concept (qui passent par les Options Pages REST/ACF), les duos sont lus côté React **via GraphQL** (WPGraphQL + WPGraphQL for ACF). La voie REST n'est **pas** utilisée. Voir [src/hooks/useWordPress.ts](../src/hooks/useWordPress.ts) — fonctions `useDuosList` et `useDuoBySlug`.

---

## 1. Prérequis WordPress

- **Advanced Custom Fields (ACF PRO)**
- **WPGraphQL** (active la query `duos`, type `Duo`, etc.)
- **WPGraphQL for ACF** (expose les champs ACF dans le schéma GraphQL)

---

## 2. Custom Post Type `duo`

### 2.1 Création (UI ou programmatique)

Voie programmatique dans `functions.php` :

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
        'show_in_graphql'      => true,
        'graphql_single_name'  => 'duo',
        'graphql_plural_name'  => 'duos',
        'supports'     => ['title', 'editor', 'thumbnail'],
        'has_archive'  => false,
        'menu_icon'    => 'dashicons-groups',
    ]);
});
```

### 2.2 Paramètres GraphQL critiques

Si tu utilises l'UI WordPress (Réglages → Type de publication → Duos → onglet GraphQL) :

| Champ | Valeur |
|---|---|
| Show in GraphQL | activé |
| GraphQL Single Name | `duo` |
| GraphQL Plural Name | `duos` |

⚠️ Le **Single Name** ne doit jamais être identique au nom d'un type ACF (sinon collision de schéma → l'OBJECT du groupe ACF reste orphelin).

---

## 3. Groupe de champs ACF "Duos"

### 3.1 Champs

**Emplacement (Location Rules)** : `Type de publication` est égal à `Duo`.

| Slug (Field Name) | Label | Type | Notes |
|---|---|---|---|
| `artiste` | Artiste | Texte | Ex : "Matthia Gremaud" |
| `entreprise` | Entreprise | Texte | Ex : "Morand construction" |
| `description` | Description | Zone de texte | Paragraphe descriptif |
| `image` | Image | Image | Return Format : **Image Array** ou **Image URL** |
| `lien` | Lien | URL | Lien externe optionnel (vers le site du duo) |

### 3.2 Paramètres GraphQL du groupe

Sur l'écran d'édition du groupe → onglet **GraphQL** :

| Champ | Valeur |
|---|---|
| Show in GraphQL | activé |
| **GraphQL Type Name** | `duoFields` ⚠️ |
| Manually Set GraphQL Types for Field Group | activé |
| GraphQL Types to Show the Field Group On | cocher **Duo (Post Type)** |

⚠️ Le **GraphQL Type Name** doit être différent du Single Name du CPT (`duo`) ET du Plural Name (`duos`) pour éviter une collision de schéma. La convention adoptée est `duoFields`.

### 3.3 Vérification après modif

À chaque changement de la config GraphQL d'un groupe ACF ou d'un CPT, **purger le cache du schéma WPGraphQL** :

- **Réglages → Permaliens → Enregistrer les modifications** (sans rien changer)

Sans cette purge, le schéma GraphQL conserve l'ancienne version et les modifs ne remontent pas.

---

## 4. Query GraphQL utilisée côté React

### 4.1 Liste des duos (`/duos`)

```graphql
query GetDuosList {
  duos(first: 100) {
    nodes {
      slug
      title
      duoFields {
        artiste
        entreprise
        description
        lien
        image { node { sourceUrl altText } }
      }
    }
  }
}
```

### 4.2 Duo unique par slug (`/duos/:slug`)

```graphql
query GetDuoBySlug($slug: ID!) {
  duo(id: $slug, idType: SLUG) {
    slug
    title
    duoFields {
      artiste
      entreprise
      description
      lien
      image { node { sourceUrl altText } }
    }
  }
}
```

### 4.3 Forme de la réponse

```json
{
  "data": {
    "duo": {
      "slug": "matthia-gremaud-x-morand-construction",
      "title": "Matthia Gremaud x Morand construction",
      "duoFields": {
        "artiste": "Matthia Gremaud",
        "entreprise": "Morand construction",
        "description": "...",
        "lien": null,
        "image": {
          "node": {
            "sourceUrl": "https://artofact.cblt.ch/documents/banner-scaled.webp",
            "altText": "banner"
          }
        }
      }
    }
  }
}
```

---

## 5. Côté React (référence)

```ts
// src/config/acf-schemas.ts
export type DuoFields = {
  artiste?:     string | null;
  entreprise?:  string | null;
  description?: string | null;
  lien?:        string | null;
  image?:       { node: { sourceUrl: string; altText?: string | null } } | null;
};

export type DuoNode = {
  slug:       string;
  title:      string;
  duoFields?: DuoFields | null;
};
```

Hooks dans [src/hooks/useWordPress.ts](../src/hooks/useWordPress.ts) :

- `useDuosList()` → liste de `DuoNode[]`, GraphQL
- `useDuoBySlug(slug)` → `DuoNode | null`, GraphQL

Composants :

- [src/pages/DuosPage.tsx](../src/pages/DuosPage.tsx) — page liste
- [src/pages/DuoDetailPage.tsx](../src/pages/DuoDetailPage.tsx) — page détail (hero + 2 cards artiste/entreprise)

---

## 6. Évolutions possibles

- Page d'attente Options page `duos-listing` (hero éditorial Title + Intro) — encore en place côté code mais lue en REST/ACF (`useACFOptionsPage("duos-listing")`). Si tout doit passer en GraphQL, migrer aussi cette options page.
- Ajout de champs supplémentaires côté duo (date, ville, fichiers, photos individuelles artiste/entreprise) : ajouter le champ dans le groupe ACF, puis l'inclure dans le fragment GraphQL `duoFields` côté React.
- Filtrage / pagination : `duos(first: N, after: $cursor)` est dispo nativement.
