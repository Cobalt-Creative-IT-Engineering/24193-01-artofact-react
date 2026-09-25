<div align="center">

 ![linkedin-shield] ![facebook-shield]  ![insta-shield]

</div>

<div align="center">
  <img src="https://avatars.githubusercontent.com/u/145210822?s=48&v=4" alt="Logo" width="80" height="80" />
  <h1 align="center">artofact-react</h1>
  <p align="center">
    Site web headless pour l'organisation <strong>Artofact</strong>
    <br />
    <a href=""><strong>Explorer la documentation</strong></a>
  </p>
</div>

<!--Add the pipeline running -->

<div align="center">

![React.js] ![TypeScript] ![Vite] ![Tailwind] ![wp.dev]

</div>

## À propos du projet

Site officiel de l'organisation **Artofact**, développé en **WordPress headless** avec un frontend **React + TypeScript**.

WordPress sert uniquement de source de contenu : l'application React récupère les données via l'API REST, ACF et WPGraphQL, puis se déploie sous forme de fichiers statiques sur un hébergement Apache (Infomaniak), dans le même web root que WordPress. Le design suit un template Figma dédié (à venir) et la structure du site comprend 11 pages — voir [doc/blueprint_summary.md](doc/blueprint_summary.md) pour le détail.

Ce projet est issu du blueprint interne Cobalt [`wp-react-headless-blueprint`](https://github.com/Cobalt-Creative-IT-Engineering/wp-react-headless-blueprint), puis customisé pour Artofact (suppression des éléments festival, neutralisation des assets, adaptation des schémas ACF).

> **Backend WordPress** : la procédure pour déployer une nouvelle instance WordPress côté backend est documentée en interne dans l'application [connaissance](https://cobalt-it.odoo.com/odoo/knowledge/150) — à suivre **avant** de configurer ce frontend.

## Stack technique

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [WordPress](https://wordpress.org/) (API REST + [ACF](https://www.advancedcustomfields.com/) + [WPGraphQL](https://www.wpgraphql.com/))

## Structure du projet

L'arborescence du projet est organisée comme suit :

```
.                               <- Racine du projet
├── index.html                  <- Point d'entrée HTML (Vite)
├── package.json                <- Dépendances et scripts npm
├── package-lock.json
├── vite.config.ts              <- Config Vite (proxy dev /wp-json et /graphql)
├── tsconfig.json               <- Options du compilateur TypeScript
├── tsconfig.node.json
├── tailwind.config.js          <- Configuration Tailwind
├── postcss.config.js
├── netlify.toml                <- Vestige Netlify, plus utilisé (voir Déploiement)
├── .env.example                <- Template d'environnement (à copier en .env.local)
├── README.md                   <- Ce fichier
├── CLAUDE.md                   <- Guide pour l'assistant Claude Code
├── doc/                        <- Documentation projet (blueprint, specs, …)
├── .github/
│   └── workflows/
│       └── ci.yml              <- CI GitHub Actions (typecheck, build, artefact dist)
├── public/                     <- Assets statiques servis tels quels (favicon, OG images, …)
│   ├── .htaccess               <- Fallback SPA, cache, compression, maintenance (Apache)
│   ├── .infomaniak-maintenance.html  <- Page affichée pendant la maintenance
│   ├── robots.txt              <- Exclut /wp-admin, pointe vers le sitemap
│   └── sitemap.xml             <- Routes du front, tenu à la main
└── src/
    ├── main.tsx                <- Point d'entrée Vite
    ├── App.tsx                 <- Shell de l'app + table de routage
    ├── index.css               <- Couches Tailwind, design tokens, blocs de thème
    ├── types/
    │   └── wordpress.ts        <- Toutes les interfaces TypeScript WP / ACF
    ├── lib/
    │   ├── wordpress.ts        <- Client REST + ACF + WPGraphQL
    │   └── meta.ts             <- Mise à jour des balises <title>, og:*, twitter:*
    ├── hooks/
    │   ├── useRoute.ts         <- Routing basé sur l'History API
    │   ├── useScrollSpy.ts
    │   └── useWordPress.ts     <- Hooks de données + couche de cache
    ├── config/
    │   ├── acf-schemas.ts      <- Schémas ACF (clé sémantique → slug WP)
    │   └── site.ts             <- Nom du site, items de navigation, thème actif
    ├── components/
    │   ├── acf/                <- ACFField / ACFRenderer / helpers acfReader
    │   ├── layout/             <- Nav, Footer
    │   └── ui/                 <- Primitives UI génériques (Skeleton, PostCard, …)
    ├── pages/                  <- Un fichier par route (11 pages — voir blueprint_summary)
    └── themes/                 <- Système de thèmes (Decorations + classes CSS)
```

## Mise en route rapide

Installation du projet dans votre environnement de **développement local**.

### Prérequis

Les outils suivants doivent être installés sur votre système :
- [Node.js](https://nodejs.org/) ≥ 18
- [npm](https://www.npmjs.com/) (livré avec Node) — ou `pnpm` / `yarn` selon votre préférence

Vous devez également avoir accès à l'instance WordPress Artofact configurée selon la section [Backend WordPress](#backend-wordpress) ci-dessous.

### Environnement

- Copiez `.env.example` en `.env.local` et renseignez `VITE_WP_URL` avec l'URL de l'instance WordPress Artofact (sans slash final).
- `VITE_COMING_SOON_UNTIL` (optionnel) : date jusqu'à laquelle la page d'attente est affichée (format `YYYY-MM-DDTHH:mm`, fuseau local).
- Lorsque vous ajoutez une nouvelle variable à `.env.local`, mettez à jour `.env.example` en conséquence et commitez-le pour que l'équipe ait toujours le template à jour.

### Installation

Installez les dépendances du projet :

```shell
npm install
```

### Backend WordPress

> **Déploiement d'une nouvelle instance** : suivez la [procédure](https://cobalt-it.odoo.com/odoo/knowledge/150) interne.

Les plugins suivants doivent être activés sur l'instance WordPress Artofact :

| Plugin | Rôle |
|---|---|
| Advanced Custom Fields (ACF) | Champs personnalisés |
| ACF to REST API | Expose les champs ACF sur `/wp-json/acf/v3/*` |
| WPGraphQL | Options pages et champs non exposés par REST |
| WPGraphQL for ACF | Expose les champs ACF dans le schéma GraphQL |
| WP REST API Menus (optionnel) | Uniquement si `getMenu()` est utilisé |

Le CORS doit être activé pour l'origine du frontend. Ajoutez ceci dans le `functions.php` du thème WordPress :

```php
add_action('init', function () {
    $origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = ['http://localhost:5173', 'https://artofact.ch'];

    if (in_array($origin, $allowed)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
});
```

> **REMARQUE** : en développement, Vite proxifie `/wp-json` et `/graphql` vers `VITE_WP_URL`, donc le CORS n'est strictement requis que pour les builds de production.

### Configuration

- `SITE_CONFIG` — nom du site, langue, description (utilisés comme valeurs par défaut pour les meta tags)
- `NAV_ITEMS` — items de navigation (`cta: true` pour afficher un item sous forme de bouton)
- `ACTIVE_THEME` — sélectionne le thème visuel actif (voir [src/themes/](src/themes/))
- `ACF schemas` — mapping clé sémantique → slug ACF, centralisé dans src/config/acf-schemas.ts.

> **ATTENTION** : ne jamais pointer un environnement de développement local vers la base WordPress de production d'Artofact.

### Lancer les tests

Aucun runner de tests n'est configuré pour le moment. En cas d'ajout, [Vitest](https://vitest.dev/) est recommandé pour rester aligné avec Vite.

### Lancer le projet

```shell
# Serveur de développement sur http://localhost:5173
npm run dev

# Build de production → dist/ (inclut un typecheck tsc)
npm run build

# Servir dist/ en local pour valider le build de production
npm run preview
```

### Vérifier la qualité du code

Le typecheck est intégré à la commande de build (`tsc && vite build`). Pour le lancer seul :

```shell
npx tsc --noEmit
```

Aucun linter ni formateur n'est préconfiguré.

## Intégration continue et déploiement

### CI (GitHub Actions)

Le workflow [.github/workflows/ci.yml](.github/workflows/ci.yml) se déclenche sur chaque push et chaque Pull Request vers `main`, ainsi qu'à la demande (`workflow_dispatch`). Il enchaîne :

1. `npm ci` sur Node 22 (cache npm activé)
2. Contrôle de la présence de `VITE_WP_URL` — sans elle, le build tomberait sur l'URL WordPress de démo et produirait un site sans contenu
3. `npm run build` (typecheck `tsc` puis `vite build`)
4. Contrôle du contenu de `dist/` (`.htaccess`, `.infomaniak-maintenance.html`)
5. Publication de `dist/` en artefact téléchargeable (`dist.zip`, conservé 30 jours)

Les variables `VITE_*` sont **inlinées dans le bundle au moment du build** : elles doivent donc être définies sur le runner, pas sur le serveur de destination. À renseigner dans **Settings → Secrets and variables → Actions → Variables** :

| Variable                 | Requise | Rôle                                                     |
| ------------------------ | ------- | -------------------------------------------------------- |
| `VITE_WP_URL`            | oui     | URL du WordPress source, sans slash final                  |
| `VITE_COMING_SOON_UNTIL` | non     | Affiche la page d'attente tant que la date n'est pas passée |

Le déclenchement manuel accepte un paramètre `wp_url` pour builder ponctuellement contre un WordPress de staging sans modifier la variable du repo.

### Déploiement

Le site est statique : il suffit de servir le contenu de `dist/`. Le routeur maison (History API) impose une règle de réécriture vers `index.html`, sans quoi un rafraîchissement sur une URL profonde (`/duos/mon-duo`) renvoie un 404.

**Cible unique : hébergement Apache / Infomaniak.** Déployer le contenu de l'artefact `dist.zip` dans le web root ; la réécriture, le cache, la compression et la bascule de maintenance viennent de [public/.htaccess](public/.htaccess). Le vhost doit avoir `AllowOverride All` et `mod_rewrite` actif, sans quoi Apache ignore le fichier **sans aucun message d'erreur**. Attention aussi : `.htaccess` et `.infomaniak-maintenance.html` sont des fichiers cachés, vérifiez qu'ils survivent à votre outil de transfert.

**Domaines (état au 25.09.2026)** : l'hébergement répond sur `artofact.cblt.ch`, domaine principal — c'est la valeur de `VITE_WP_URL`, en local comme dans la variable de dépôt. `admin.artofact.ch` a été abandonné. Le domaine définitif `artofact.ch` sera rattaché plus tard ; ce jour-là, mettre à jour les adresses dans Réglages › Général de WordPress, la variable de dépôt `VITE_WP_URL` (puis rebuild : elle est figée dans le bundle), les URL absolues de `sitemap.xml` et `robots.txt`, et décommenter la redirection canonique du `.htaccess`. Avant de supprimer un domaine chez Infomaniak, vérifier que le certificat SSL couvre bien ceux qui restent.

Netlify n'est plus une cible : `public/_redirects` a été supprimé, donc un déploiement Netlify servirait la home mais renverrait 404 sur toute URL profonde. `netlify.toml` n'a pas été supprimé mais ne sert plus à rien — le restaurer demanderait de remettre la règle de réécriture.

### Cohabitation avec WordPress dans le même web root

C'est le montage cible : le contenu de `dist/` est déposé **à côté** de l'installation WordPress (`index.html` voisin de `index.php`, `wp-admin/`, `wp-content/`, `wp-includes/`). Un seul domaine, un seul `.htaccess`, et le front devient *same-origin* avec l'API — plus de CORS ni de requête préflight. `VITE_WP_URL` vaut alors l'URL publique du site elle-même.

Le `.htaccess` du projet est la configuration de production validée sur un montage identique (Veveyse 2030), augmentée des blocs maintenance, canonique, cache et compression. Deux règles de fonctionnement en découlent :

- **Ce fichier remplace celui du serveur à chaque déploiement** (il est à la racine du `dist.zip`). Il doit donc rester un *sur-ensemble* de ce qui tourne en prod : sécurité, routes maison, bloc `# BEGIN WordPress` compris. Une règle présente sur le serveur mais absente d'ici disparaît silencieusement à la mise en ligne.
- **Wordfence peut écrire dans ce fichier.** Avant un déploiement, comparer avec la version réellement en place sur le serveur.

Ce que contient le fichier, dans l'ordre où Apache l'applique :

| Bloc | Rôle |
| ---- | ---- |
| Domaine indexable | `X-Robots-Tag: noindex, nofollow` sur tout hôte autre que `artofact.ch` / `www.artofact.ch` — donc sur tout le site tant que le domaine définitif n'est pas rattaché. Juste après, une redirection 301 vers `artofact.ch`, commentée, à activer une fois DNS et certificat en place |
| Sécurité | Pas de listing de répertoires, pas d'exécution PHP dans `uploads/`, accès refusé à `wp-config.php`, `xmlrpc.php`, `package.json`, `.env*`, `src/`, `node_modules/`, `.git/` |
| Routes maison | `/documents/*` → médiathèque WordPress, `/login` → `wp-login.php` |
| Maintenance | `touch .maintenance` coupe le site public en 503, le back-office et l'API restent joignables |
| Canonique | `/index.html` → `/` en 301 |
| Fallback SPA | Tout ce qui n'est ni fichier ni dossier part sur `index.html`, **sauf** les chemins WordPress |
| Cache / compression | `/assets/` immuable un an, `index.html` et page de maintenance jamais mis en cache, `favicon.svg` et `robots.txt` une heure |
| `# BEGIN WordPress` | Le bloc généré par WordPress, conservé tel quel : c'est lui qui sert `/wp-json` et `/graphql` |

Deux points à garder en tête :

- **Les exclusions du fallback SPA sont load-bearing.** `/wp-json` et `/graphql` sont des routes virtuelles, sans fichier derrière : sans ces exclusions elles renvoient `index.html`, et le front reçoit du HTML là où il attend du JSON. Le site s'affiche alors normalement mais reste vide, sans la moindre erreur réseau. Toute autre route virtuelle de WordPress (sitemap XML, flux RSS) subit le même sort tant qu'elle n'est pas ajoutée à la liste.
- **L'accueil dépend de l'ordre du `DirectoryIndex` du serveur**, puisque `index.html` et `index.php` cohabitent à la racine. Infomaniak sert `index.html` en premier — c'est vérifié en production sur ce montage. Le fichier ne force pas cet ordre, pour rester identique à la version testée ; en cas de doute sur un autre hébergeur, ajouter `DirectoryIndex index.html index.php`.

### Mode maintenance (Apache uniquement)

La bascule est un fichier drapeau à créer à la racine du site, à côté d'`index.html` — ni rebuild, ni redéploiement :

```shell
touch .maintenance    # tout le site renvoie la page de maintenance en HTTP 503
rm .maintenance       # retour à la normale
```

Par FTP ou via le gestionnaire de fichiers, il suffit de créer ou supprimer un fichier vide de ce nom.

Ce mécanisme est indépendant du mode maintenance du **Manager Infomaniak** (page de maintenance + liste d'IP autorisées), qui agit au niveau de l'hébergement. Les deux peuvent être actifs en même temps : vérifier les deux quand le site semble coupé.

- La page servie est [public/.infomaniak-maintenance.html](public/.infomaniak-maintenance.html), autonome (styles en ligne, aucune dépendance au bundle). Son nom commence par un point parce que c'est celui qu'attend Infomaniak dans le web root — ne pas le « corriger » en le renommant.
- Le drapeau est un fichier **séparé** et non une ligne à décommenter dans `.htaccess` : ce dernier fait partie du zip, donc il est écrasé à chaque déploiement et une bascule inscrite dedans serait silencieusement perdue.
- La réponse est un **503** et non un 200, pour éviter que les moteurs prennent la page de maintenance pour le contenu du site.
- Pour continuer à consulter le site pendant la maintenance, décommenter la ligne `RewriteCond %{REMOTE_ADDR}` du `.htaccess` et y mettre son IP publique.

### Référencement

Un hébergement statique répond **200 à n'importe quelle URL** : Apache sert `index.html` et c'est le routeur client qui décide s'il connaît la route. Sans précaution, une faute de frappe ou un lien périmé s'indexerait donc comme une page valide — un *soft 404*. Quatre pièces couvrent le sujet :

- **`resolvePage` dans [App.tsx](src/App.tsx)** est la table unique des routes valides. Quand elle ne trouve rien, `App` pose `<meta name="robots" content="noindex, follow">` en plus d'afficher la 404. La balise est retirée dès qu'on revient sur une route connue.
- **L'en-tête `X-Robots-Tag`** posé par le `.htaccess` désindexe tout hôte autre que `artofact.ch` (alias, adresse de recette), fichiers statiques compris. Il est écrit avec `<If>` + `Header set` : la variante `SetEnvIf` + `Header always set … env=!` n'émettait rien chez Infomaniak.
- **[public/robots.txt](public/robots.txt)** écarte `/wp-admin/` de l'index — WordPress partage le domaine — et déclare le sitemap.
- **[public/sitemap.xml](public/sitemap.xml)** liste les routes du **front**, pas les permaliens WordPress : le front WP est fermé et ses URL ne correspondent à aucune route React, donc `/wp-sitemap.xml` n'a rien à y faire.

Le sitemap est un fichier **statique, tenu à la main**, avec des URL absolues. À reprendre quand une route est ajoutée ou retirée dans `App.tsx`, et au passage sur le domaine définitif. Les pages de détail de duos (`/duos/:slug`) n'y sont volontairement pas : elles restent découvrables depuis `/duos`.

## Contribuer

Merci de ne pas travailler directement sur `master` ou `main`. Suivez les recommandations ci-dessous et créez une branche dédiée.

1. Cloner le projet
2. Créer une branche de feature (`git checkout -b feature/amazing_feature`)
3. Committer vos changements (`git commit -m '[VP] Add some amazing feature'`)
4. Pousser la branche (`git push origin feature/amazing_feature`)
5. Ouvrir une Pull Request et ajouter des reviewers

## Licence

Ce projet est sous licence BUSL 1.1 (Business Source License 1.1).

## Contact

Email : contact@cobalt-it.ch


<!-- MARKDOWN LINKS & IMAGES -->

<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
<!-- https://github.com/guidsribeiro/markdown-badges?tab=readme-ov-file -->


<!-- Social -->

[linkedin-shield]: https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white
[linkedin-url]: https://www.linkedin.com/company/cobalt-it-ch/
[facebook-shield]: https://img.shields.io/badge/Facebook-%231877F2.svg?style=for-the-badge&logo=Facebook&logoColor=white
[facebook-url]: https://www.facebook.com/CobaltIT?locale=fr_FR
[insta-shield]: https://img.shields.io/badge/Cobalt-%23E4405F.svg?style=for-the-badge&logo=Instagram&logoColor=white
[insta-url]: https://www.instagram.com/cobalt.it/

<!-- Framework -->

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[Tailwind]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[wp.dev]: https://img.shields.io/badge/WordPress-%23117AC9.svg?style=for-the-badge&logo=WordPress&logoColor=white
[wp-url]: https://wordpress.org/

<!-- Packages -->

[node-dev]: https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node-dot-js&logoColor=white
[node-url]: https://nodejs.org/

<!-- Infrastructure -->

[github-dev]: https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white

<!-- CI/CD -->

[githubactions-dev]: https://img.shields.io/badge/githubactions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white
[githubactions-url]: https://docs.github.com/fr/actions
