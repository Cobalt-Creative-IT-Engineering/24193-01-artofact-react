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

WordPress sert uniquement de source de contenu : l'application React récupère les données via l'API REST, ACF et WPGraphQL, puis se déploie sous forme de fichiers statiques sur Netlify. Le design suit un template Figma dédié (à venir) et la structure du site comprend 11 pages — voir [doc/blueprint_summary.md](doc/blueprint_summary.md) pour le détail.

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
├── netlify.toml                <- Configuration de build/deploy Netlify
├── .env.example                <- Template d'environnement (à copier en .env.local)
├── README.md                   <- Ce fichier
├── CLAUDE.md                   <- Guide pour l'assistant Claude Code
├── doc/                        <- Documentation projet (blueprint, specs, …)
├── public/                     <- Assets statiques servis tels quels (favicon, OG images, …)
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
[netlify-dev]: https://img.shields.io/badge/netlify-%23000000.svg?style=for-the-badge&logo=netlify&logoColor=#00C7B7
[netlify-url]: https://www.netlify.com/

<!-- CI/CD -->

[githubactions-dev]: https://img.shields.io/badge/githubactions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white
[githubactions-url]: https://docs.github.com/fr/actions
