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

Headless WordPress + React 18 + TypeScript + Vite + Tailwind. WordPress est source de contenu uniquement ; le front se déploie en statique sur Apache/Infomaniak, dans le même web root que WordPress (voir « Déploiement & CI »).

### Couche de données ([src/lib/wordpress.ts](src/lib/wordpress.ts), [src/hooks/useWordPress.ts](src/hooks/useWordPress.ts))

- REST (`/wp-json/wp/v2` + `/wp-json/acf/v3`) et GraphQL (`/graphql`, optionnel) coexistent. Préférer REST ; utiliser GraphQL seulement pour les cas que REST n'expose pas (connexions MediaItem, Options pages typées). Un exemple commenté `useGraphQLSiteSettings` sert de modèle.
- `WP_BASE_URL` est `""` en dev (Vite proxifie) et l'URL complète en prod — ne pas hardcoder l'URL.
- `parsePost` / `parsePage` normalisent les réponses WP `_embed` (featured media + terms) vers des types plats dans [src/types/wordpress.ts](src/types/wordpress.ts). Passer par ces parsers plutôt que de lire `_embedded` directement.
- Cache double niveau dans `useFetch` : `Map` en mémoire (stale 60s) + `sessionStorage` (conservé 30min, préfixe `wp:`). Au premier rendu, l'entrée `sessionStorage` sert d'affichage immédiat ; elle évite aussi la requête si elle a moins de `staleMs`. Les requêtes en cours sont partagées par clé (`inflight`) : deux composants montés ensemble sur la même clé ne font qu'un appel. Les `Map<K, V>` sont sérialisées via un wrapper `{ __map: true, entries }`. Toute donnée contenant des Map doit utiliser ce chemin ou casser au reload.
- Images WP : `GQL_IMAGE_EDGE` demande `srcSet` en plus de `sourceUrl`. Tout `<img>` d'image WordPress doit recevoir `srcSet` + un `sizes` adapté à sa largeur rendue, sinon le navigateur charge l'original (jusqu'à >1 Mo). Images sous la ligne de flottaison en `loading="lazy"`, jamais l'image principale d'une page.
- Les hooks retournent `FetchState<T>` (`{ status, data, error, isFetching, refetch }`). `data` est conservé pendant les refetchs pour éviter les flashs de loading.
- `getACFOptionsPage(slug)` normalise deux formats ACF v3 (`{ id, acf: {...} }` vs `{...}`) via `normalizeACFResponse`. Utiliser ce helper pour toute Options Sub-Page.
- `prefetchCPTItems` est fire-and-forget pour pré-remplir le cache depuis une page de listing (skip les entrées déjà en cache).

### Schémas ACF ([src/config/acf-schemas.ts](src/config/acf-schemas.ts), [src/components/acf/helpers.ts](src/components/acf/helpers.ts))

Les noms de champs ACF WordPress sont **toujours** accédés via un schéma. Ne jamais référencer un slug ACF brut (`"hero_title"`) dans un composant — passer par `acfReader(data, Schema).text('title')`. Quand un champ est renommé dans ACF, seul `acf-schemas.ts` est modifié ; les composants, typés sur `keyof Schema`, tombent en panne à la compilation s'ils référencent une clé absente.

Helpers : `text`, `image` (gère objet ACF, string URL, ou ID d'attachment résolu via `mediaMap`), `bool`, `repeater<T>`, `raw`, `first(...keys)`.

### Routing ([src/hooks/useRoute.ts](src/hooks/useRoute.ts), [src/App.tsx](src/App.tsx))

Routeur home-made basé sur l'History API — **pas de react-router**. Un handler global de `click` dans `App.tsx` intercepte tous les `<a href="/...">` internes et appelle `navigate()` qui `pushState` + dispatche un `popstate`. Les liens externes, `mailto:`, `tel:`, `target=_blank`, `download`, et ancres `#` sont laissés au navigateur.

Table de routage dans `resolvePage` (App.tsx) : `/` → HomePage, `/concept` → ConceptPage, `/duos` → DuosPage, `/duos/:slug` → DuoDetailPage, `/partenaires` → PartenairesPage, `/artistes` → ArtistesPage, `null` sinon. `PageView` se contente de `resolvePage(route) ?? <NotFoundPage />`.

`resolvePage` est **la** source de vérité des routes valides : `App()` s'en sert aussi comme garde SEO (`noindex` quand elle retourne `null`, cf. section Meta tags). Une route ajoutée ailleurs que dans cette fonction serait donc servie mais marquée non indexable.

Ajouter une page = quatre endroits : un `if` dans `resolvePage`, le label dans `PAGE_LABELS` (App.tsx:42) pour le `<title>`, une entrée dans [public/sitemap.xml](public/sitemap.xml), qui est un fichier statique tenu à la main, et — si la page attend des données WP — sa classe `*-main` dans la règle anti-CLS `min-height: 100vh` de `index.css` (sous `.app`). Sans elle, le footer remonte dans l'écran pendant le chargement puis saute à l'arrivée du contenu (CLS mesuré jusqu'à 0,41 sur mobile). Toutes les routes internes de `NAV_ITEMS` sont branchées (« Comptoir gruérien » pointe vers un site externe).

Migration legacy automatique : les URLs en `#/xxx` sont réécrites en `/xxx` au chargement (useRoute.ts:24).

Le dev server a `historyApiFallback: true` dans [vite.config.ts](vite.config.ts) — nécessaire pour que le refresh sur `/duos/foo` renvoie `index.html` au lieu d'un 404. À conserver si on touche au proxy. En prod, le même fallback vient de `public/.htaccess`, copié dans `dist/` par vite build — le CI vérifie sa présence.

### Déploiement & CI ([.github/workflows/ci.yml](.github/workflows/ci.yml), [public/.htaccess](public/.htaccess))

Le CI (push/PR sur `main` + `workflow_dispatch`) fait `npm ci`, vérifie que `VITE_WP_URL` n'est pas vide, lance `npm run build` puis publie `dist/` en artefact. Deux réglages à ne pas casser : `VITE_WP_URL` vient d'une **variable de dépôt** (elle est inlinée dans le bundle au build, la définir sur le serveur n'a aucun effet), et `include-hidden-files: true` sur `upload-artifact`, sans quoi `.htaccess` et `.infomaniak-maintenance.html` sont exclus du zip.

Cible de déploiement : Apache/Infomaniak, **WordPress et le build React dans le même web root** (`index.html` à côté de `index.php`, `wp-admin/`, `wp-content/`). Dans ce montage `VITE_WP_URL` est l'URL publique du site lui-même, donc tout est same-origin. Apache est la seule cible : le `_redirects` de Netlify a été supprimé.

Domaines : l'hébergement répond sur **`artofact.cblt.ch`** (domaine principal, domaine indexable déclaré dans le `.htaccess`, et valeur de `VITE_WP_URL`). `admin.artofact.ch` a été abandonné. Le domaine définitif `artofact.ch` n'est pas encore rattaché ; à la bascule, reprendre : réglages d'URL WordPress, variable de dépôt `VITE_WP_URL`, hôte canonique du `.htaccess`, URL absolues de `sitemap.xml` / `robots.txt`, et décommenter la redirection canonique du `.htaccess`.

Conséquences pour [public/.htaccess](public/.htaccess) :

- Il part dans `dist/` et **remplace celui du serveur à chaque déploiement** : il doit rester un sur-ensemble de la config de prod (sécurité, routes maison `/login` et `/documents`, bloc `# BEGIN WordPress`). Ne rien y retirer sans vérifier ce qui tourne sur le serveur — Wordfence peut aussi y écrire.
- Les exclusions du fallback SPA (`wp-admin|wp-content|wp-includes|wp-json|wp-login\.php|xmlrpc\.php|graphql`) sont **load-bearing** : sans elles, `/wp-json` renvoie `index.html` et le front reçoit du HTML au lieu de JSON, sans erreur réseau. Toute nouvelle route virtuelle WP doit être ajoutée à cette liste.
- Bloc « Un seul domaine indexable » : `X-Robots-Tag: noindex, nofollow` sur tout hôte autre que `artofact.cblt.ch` / `www.artofact.cblt.ch`. Il est écrit `<If "%{HTTP_HOST} …">` + `Header set`. **Ne pas revenir** à `SetEnvIf` + `Header always set … env=!` : cette variante, valide sur un Apache standard, n'émettait aucun en-tête chez Infomaniak (constaté en prod).
- Le mode maintenance est un fichier drapeau `.maintenance` posé à la racine du site (hors zip, donc il survit aux déploiements) : 503 + `.infomaniak-maintenance.html`, back-office et API exclus de la coupure.

Un fichier ajouté dans `public/` part tel quel en production — y compris les fichiers cachés. Ce n'est pas un dossier de brouillons.

SEO : [public/robots.txt](public/robots.txt) écarte `/wp-admin/` de l'index (WordPress partage le domaine) et pointe vers [public/sitemap.xml](public/sitemap.xml). Ce sitemap est **statique et tenu à la main** : il liste les routes du front, pas les permaliens WordPress, et ses URL sont absolues — à reprendre à chaque route ajoutée et au passage sur le domaine définitif. Les détails de duos (`/duos/:slug`) n'y figurent pas, un fichier statique ne pouvant pas suivre les publications.

### Thèmes annuels ([src/themes/](src/themes/))

`ACTIVE_THEME` est typé comme littéral (`ThemeName = "base"`) pour que Rollup tree-shake les thèmes inactifs. Ajouter un thème `"2027"` = étendre le type, ajouter l'entrée dans `THEMES`, créer `src/themes/2027/Decorations.tsx`, dispatcher dans `src/themes/Decorations.tsx`, ajouter le bloc CSS `html.theme-2027 { ... }` dans `src/index.css`. Le thème est appliqué au boot en ajoutant la classe sur `<html>` (App.tsx:16-23) ; si le thème définit `fontsUrl`, un `<link>` est injecté (le thème `base` charge Work Sans localement via `@font-face` dans `index.css`, donc `fontsUrl` est null).

### Coming Soon

Deux leviers dans [src/config/site.ts](src/config/site.ts) :
- `FORCE_COMING_SOON = true` → toujours affiché
- `VITE_COMING_SOON_UNTIL=YYYY-MM-DDTHH:mm` (env, fuseau local) → affiché tant que la date n'est pas atteinte

`shouldShowComingSoon()` court-circuite tout le rendu dans App.tsx:86.

### Meta tags ([src/lib/meta.ts](src/lib/meta.ts))

Nom et description du site viennent de `SITE_CONFIG` (plus d'appel à `/wp-json/` au boot : ~280 Ko et ~0,8 s de PHP pour les deux mêmes chaînes). `setPageMeta({ title })` est appelé par `App` dans un **`useLayoutEffect`** à chaque changement de route ; les pages qui ont un titre propre (DuoDetailPage, NotFoundPage) l'écrasent dans leur `useEffect`. L'ordre compte : les effets des enfants passent avant ceux du parent, donc un `useEffect` dans `App` écraserait le titre d'un duo servi depuis le cache. Conséquence : une page qui appelle `setPageMeta` doit repasser elle-même `noindex` si elle en a besoin (NotFoundPage le fait). Pas de react-helmet — manipulation DOM directe sur les balises meta.

Le drapeau `noindex` traite le **soft 404** : l'hébergement statique répond 200 à n'importe quelle URL (Apache sert `index.html`, c'est le routeur client qui tranche), donc sans `<meta name="robots" content="noindex, follow">` une faute de frappe ou un lien périmé s'indexerait comme une page valide. `setPageMeta` **retire** la balise quand `noindex` est absent — indispensable, sinon une page valide atteinte depuis la 404 resterait désindexée.

### Design system ([doc/design_system.md](doc/design_system.md))

`doc/design_system.md` est la **source de vérité** (couleurs, typo, breakpoints, exportés de Figma). Une évolution du DS doit être répercutée dans les trois endroits : ce doc → variables CSS `:root` dans [src/index.css](src/index.css) → [tailwind.config.js](tailwind.config.js) si Tailwind doit y accéder.

Gotchas Tailwind (config fortement customisée, pas les valeurs par défaut) :
- **Breakpoints non-standard** : `sm=400px`, `md=768px`, `lg=1440px` (et pas de `xl`/`2xl`). `sm:` ne veut pas dire 640px ici.
- **Palette** : 4 familles `neutral` / `primary` (turquoise) / `secondary` (vert) / `tertiary` (beige), chacune en tons `100`→`900` (100 = clair, 900 = foncé). Pas de gris Tailwind par défaut — utiliser `neutral-*`. Fond principal du site : `neutral-900`.
- Utilitaires custom : `max-w-container` (1264px), `rounded-pill`.

Stickers ([Sticker.tsx](src/components/ui/Sticker.tsx), SVG décoratifs en `position: absolute` décalés de 50 % hors du bord) : leur taille suit le viewport **sans plancher** (`min(Nvw, Xrem)`, jamais `clamp(<min>, …)`), et ceux des heros sont en plus bornés par la hauteur du hero via `--sticker-hero-bound` pour ne jamais déborder sur la section suivante. Quand un texte occupe toute la largeur du container, un `padding-right` réserve un couloir à la moitié visible du sticker (bloc « Couloir réservé aux stickers » avant le footer dans `index.css`). Masqués sous 768px.

### Configuration centralisée

- [src/config/site.ts](src/config/site.ts) : `SITE_CONFIG`, `NAV_ITEMS` (avec flag `cta` pour le dernier item en bouton), `SOCIAL_LINKS`, `ACTIVE_THEME`, flags Coming Soon.
- `Nav` et `Footer` lisent uniquement ces constantes — pas de duplication de la navigation ailleurs.

## Conventions

- Pas de dépendances runtime hors `react` / `react-dom`. Ajouter une lib = justifier (poids bundle, alternative home-made, tree-shaking).
- Nouveau champ ACF → mettre à jour `acf-schemas.ts` **avant** d'écrire le composant.
- Nouvelle variable d'env → ajouter la ligne dans `.env.example` et committer.
- Nouvelle page WP-backed → utiliser `usePage(slug)` / `useACFOptionsPage(slug)` ; ne pas appeler `fetch` direct dans un composant.
- Pas de lorem ipsum dans le code. Les contenus de secours (champ ACF vide, ou WP qui ne répond pas → faux duos / partenaires) sont des textes d'exemple crédibles nommés `SAMPLE_*`, qui n'affirment rien de précis sur des personnes ou entreprises réelles.
- Images dans `src/assets/` : raster en WebP. Pas d'export Figma en SVG qui embarque une image bitmap — `banner.svg` pesait 1,8 Mo pour une image de 65 kB en WebP et faisait monter le LCP mobile à ~10 s.

## Blueprint source

Ce projet est issu du blueprint Cobalt `wp-react-headless-blueprint`. [doc/blueprint_summary.md](doc/blueprint_summary.md) liste les éléments festival retirés lors de la customisation initiale (pages, stickers, GraphQL queries, thème 2026) — utile pour comprendre pourquoi certains dossiers sont vides ou neutres.
