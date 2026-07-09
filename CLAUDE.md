# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commandes

```shell
npm run dev        # Serveur de dev sur http://localhost:5173 (proxy /wp-json et /graphql → VITE_WP_URL)
npm run build      # tsc --noEmit puis vite build → dist/
npm run preview    # Sert dist/ localement
npx tsc --noEmit   # Typecheck seul (sans build)
```

Aucun runner de tests, linter ou formateur n'est configuré. Le typecheck fait partie de `build`. `strict: true`, `noUnusedLocals: true` et `noUnusedParameters: true` sont actifs — la compilation échoue sur un import ou paramètre inutilisé.

Pour démarrer : copier `.env.example` en `.env.local`, renseigner `VITE_WP_URL` (sans slash final). En dev, Vite proxifie donc le CORS n'a pas besoin d'être configuré côté WordPress.

## Architecture

Headless WordPress + React 18 + TypeScript + Vite + Tailwind. WordPress est source de contenu uniquement ; le front se déploie en statique (Netlify via `netlify.toml`).

### Couche de données ([src/lib/wordpress.ts](src/lib/wordpress.ts), [src/hooks/useWordPress.ts](src/hooks/useWordPress.ts))

- REST (`/wp-json/wp/v2` + `/wp-json/acf/v3`) et GraphQL (`/graphql`, optionnel) coexistent. Préférer REST ; utiliser GraphQL seulement pour les cas que REST n'expose pas (connexions MediaItem, Options pages typées). Un exemple commenté `useGraphQLSiteSettings` sert de modèle.
- `WP_BASE_URL` est `""` en dev (Vite proxifie) et l'URL complète en prod — ne pas hardcoder l'URL.
- `parsePost` / `parsePage` normalisent les réponses WP `_embed` (featured media + terms) vers des types plats dans [src/types/wordpress.ts](src/types/wordpress.ts). Passer par ces parsers plutôt que de lire `_embedded` directement.
- Cache double niveau dans `useFetch` : `Map` en mémoire (stale 60s) + `sessionStorage` (stale 30min, préfixe `wp:`). Les `Map<K, V>` sont sérialisées via un wrapper `{ __map: true, entries }`. Toute donnée contenant des Map doit utiliser ce chemin ou casser au reload.
- Les hooks retournent `FetchState<T>` (`{ status, data, error, isFetching, refetch }`). `data` est conservé pendant les refetchs pour éviter les flashs de loading.
- `getACFOptionsPage(slug)` normalise deux formats ACF v3 (`{ id, acf: {...} }` vs `{...}`) via `normalizeACFResponse`. Utiliser ce helper pour toute Options Sub-Page.
- `prefetchCPTItems` est fire-and-forget pour pré-remplir le cache depuis une page de listing (skip les entrées déjà en cache).

### Schémas ACF ([src/config/acf-schemas.ts](src/config/acf-schemas.ts), [src/components/acf/helpers.ts](src/components/acf/helpers.ts))

Les noms de champs ACF WordPress sont **toujours** accédés via un schéma. Ne jamais référencer un slug ACF brut (`"hero_title"`) dans un composant — passer par `acfReader(data, Schema).text('title')`. Quand un champ est renommé dans ACF, seul `acf-schemas.ts` est modifié ; les composants, typés sur `keyof Schema`, tombent en panne à la compilation s'ils référencent une clé absente.

Helpers : `text`, `image` (gère objet ACF, string URL, ou ID d'attachment résolu via `mediaMap`), `bool`, `repeater<T>`, `raw`, `first(...keys)`.

### Routing ([src/hooks/useRoute.ts](src/hooks/useRoute.ts), [src/App.tsx](src/App.tsx))

Routeur home-made basé sur l'History API — **pas de react-router**. Un handler global de `click` dans `App.tsx` intercepte tous les `<a href="/...">` internes et appelle `navigate()` qui `pushState` + dispatche un `popstate`. Les liens externes, `mailto:`, `tel:`, `target=_blank`, `download`, et ancres `#` sont laissés au navigateur.

Table de routage dans `PageView` (App.tsx:98) : `/` → HomePage, `/concept` → ConceptPage, `/duos` → DuosPage, `/duos/:slug` → DuoDetailPage, sinon NotFoundPage. Ajouter une page = ajouter un `if` ici + le label dans `PAGE_LABELS` (App.tsx:40) pour le `<title>`. Attention : `NAV_ITEMS` référence des routes (`/organisation`, `/comptoir-gruerien`, `/partenaires`) qui ne sont pas encore branchées dans `PageView` et tombent donc sur NotFoundPage.

Migration legacy automatique : les URLs en `#/xxx` sont réécrites en `/xxx` au chargement (useRoute.ts:24).

Le dev server a `historyApiFallback: true` dans [vite.config.ts](vite.config.ts) — nécessaire pour que le refresh sur `/duos/foo` renvoie `index.html` au lieu d'un 404. À conserver si on touche au proxy.

### Thèmes annuels ([src/themes/](src/themes/))

`ACTIVE_THEME` est typé comme littéral (`ThemeName = "base"`) pour que Rollup tree-shake les thèmes inactifs. Ajouter un thème `"2027"` = étendre le type, ajouter l'entrée dans `THEMES`, créer `src/themes/2027/Decorations.tsx`, dispatcher dans `src/themes/Decorations.tsx`, ajouter le bloc CSS `html.theme-2027 { ... }` dans `src/index.css`. Le thème est appliqué au boot en ajoutant la classe sur `<html>` (App.tsx:16-23) ; si le thème définit `fontsUrl`, un `<link>` est injecté (le thème `base` charge Work Sans localement via `@font-face` dans `index.css`, donc `fontsUrl` est null).

### Coming Soon

Deux leviers dans [src/config/site.ts](src/config/site.ts) :
- `FORCE_COMING_SOON = true` → toujours affiché
- `VITE_COMING_SOON_UNTIL=YYYY-MM-DDTHH:mm` (env, fuseau local) → affiché tant que la date n'est pas atteinte

`shouldShowComingSoon()` court-circuite tout le rendu dans App.tsx:86.

### Meta tags ([src/lib/meta.ts](src/lib/meta.ts))

Module stateful. `initMeta()` est appelé une fois au boot avec les infos de `/wp-json/` root. `setPageMeta({ title })` est appelé à chaque changement de route ; les pages de détail qui ont un titre/image propres (ex. DuoDetailPage) écrasent avec leurs propres infos. Pas de react-helmet — manipulation DOM directe sur les balises meta.

### Design system ([doc/design_system.md](doc/design_system.md))

`doc/design_system.md` est la **source de vérité** (couleurs, typo, breakpoints, exportés de Figma). Une évolution du DS doit être répercutée dans les trois endroits : ce doc → variables CSS `:root` dans [src/index.css](src/index.css) → [tailwind.config.js](tailwind.config.js) si Tailwind doit y accéder.

Gotchas Tailwind (config fortement customisée, pas les valeurs par défaut) :
- **Breakpoints non-standard** : `sm=400px`, `md=768px`, `lg=1440px` (et pas de `xl`/`2xl`). `sm:` ne veut pas dire 640px ici.
- **Palette** : 4 familles `neutral` / `primary` (turquoise) / `secondary` (vert) / `tertiary` (beige), chacune en tons `100`→`900` (100 = clair, 900 = foncé). Pas de gris Tailwind par défaut — utiliser `neutral-*`. Fond principal du site : `neutral-900`.
- Utilitaires custom : `max-w-container` (1264px), `rounded-pill`.

### Configuration centralisée

- [src/config/site.ts](src/config/site.ts) : `SITE_CONFIG`, `NAV_ITEMS` (avec flag `cta` pour le dernier item en bouton), `SOCIAL_LINKS`, `ACTIVE_THEME`, flags Coming Soon.
- `Nav` et `Footer` lisent uniquement ces constantes — pas de duplication de la navigation ailleurs.

## Conventions

- Pas de dépendances runtime hors `react` / `react-dom`. Ajouter une lib = justifier (poids bundle, alternative home-made, tree-shaking).
- Nouveau champ ACF → mettre à jour `acf-schemas.ts` **avant** d'écrire le composant.
- Nouvelle variable d'env → ajouter la ligne dans `.env.example` et committer.
- Nouvelle page WP-backed → utiliser `usePage(slug)` / `useACFOptionsPage(slug)` ; ne pas appeler `fetch` direct dans un composant.

## Blueprint source

Ce projet est issu du blueprint Cobalt `wp-react-headless-blueprint`. [doc/blueprint_summary.md](doc/blueprint_summary.md) liste les éléments festival retirés lors de la customisation initiale (pages, stickers, GraphQL queries, thème 2026) — utile pour comprendre pourquoi certains dossiers sont vides ou neutres.
