import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  getPosts,
  getPostBySlug,
  getPageBySlug,
  getACFOptions,
  getACFForPost,
  getCPT,
  getCategories,
  getTaxonomyTerms,
  getMediaByIds,
  getACFOptionsPage,
  graphqlFetch,
} from "../lib/wordpress";
import type {
  WPPost,
  WPPage,
  ACFOptions,
  QueryParams,
  WPTaxonomyTerm,
  FetchState,
  UsePostsOptions,
} from "../types/wordpress";

// Re-export des types utiles
export type { WPPost, WPPage, ACFOptions, QueryParams, WPTaxonomyTerm, FetchState, UsePostsOptions };

// ─── Cache en mémoire ─────────────────────────────────────────────────────

const memoryCache = new Map<string, { data: unknown; updatedAt: number }>();
const DEFAULT_STALE_MS = 60_000;
const SESSION_STALE_MS = 30 * 60_000; // 30 min pour sessionStorage
const SESSION_PREFIX   = "wp:";

// ─── Sérialisation sessionStorage (gère les Maps) ─────────────────────────

function sessionWrite(key: string, data: unknown): void {
  try {
    const value = data instanceof Map
      ? { __map: true, entries: Array.from((data as Map<unknown, unknown>).entries()) }
      : data;
    sessionStorage.setItem(
      SESSION_PREFIX + key,
      JSON.stringify({ v: value, t: Date.now() })
    );
  } catch { /* quota exceeded ou private mode : on ignore */ }
}

function sessionRead<T>(key: string, staleMs = SESSION_STALE_MS): T | null {
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + key);
    if (!raw) return null;
    const { v, t } = JSON.parse(raw) as { v: unknown; t: number };
    if (Date.now() - t > staleMs) return null;
    if (v && typeof v === "object" && (v as Record<string, unknown>).__map === true) {
      return new Map((v as { entries: [unknown, unknown][] }).entries) as unknown as T;
    }
    return v as T;
  } catch { return null; }
}

// ─── Hook interne useFetch ────────────────────────────────────────────────

function useFetch<T>(
  fetcher: () => Promise<T>,
  options: { cacheKey?: string; staleMs?: number; persist?: boolean; persistStaleMs?: number } = {}
) {
  const cacheKey       = options.cacheKey;
  const staleMs        = options.staleMs ?? DEFAULT_STALE_MS;
  const persist        = options.persist ?? false;
  const persistStaleMs = options.persistStaleMs;
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const initialCached = useMemo(() => {
    if (!cacheKey) return null;
    const mem = memoryCache.get(cacheKey);
    if (mem) return mem.data as T;
    if (persist) return sessionRead<T>(cacheKey, persistStaleMs);
    return null;
  }, [cacheKey, persist, persistStaleMs]);

  const [state, setState] = useState<FetchState<T>>({
    status:     initialCached ? "success" : "loading",
    data:       initialCached,
    error:      null,
    isFetching: !initialCached,
  });

  const load = useCallback(
    async (force = false) => {
      const now = Date.now();
      if (!force && cacheKey) {
        const cached = memoryCache.get(cacheKey);
        if (cached && now - cached.updatedAt < staleMs) {
          setState({ status: "success", data: cached.data as T, error: null, isFetching: false });
          return;
        }
      }

      setState((prev) => ({
        status:     prev.data ? "success" : "loading",
        data:       prev.data,
        error:      null,
        isFetching: true,
      }));

      try {
        const data = await fetcherRef.current();
        if (cacheKey) {
          memoryCache.set(cacheKey, { data, updatedAt: Date.now() });
          if (persist) sessionWrite(cacheKey, data);
        }
        setState({ status: "success", data, error: null, isFetching: false });
      } catch (e) {
        setState((prev) => ({
          status:     prev.data ? "success" : "error",
          data:       prev.data,
          error:      prev.data ? null : (e as Error).message,
          isFetching: false,
        }));
      }
    },
    [cacheKey, staleMs, persist]
  );

  useEffect(() => {
    void load();
  }, [load, cacheKey, staleMs]);

  return { ...state, refetch: () => load(true) };
}

// ─── Hooks publics — REST ─────────────────────────────────────────────────

export function usePosts(options: UsePostsOptions = {}) {
  const { enabled = true, ...params } = options;
  const [page, setPage] = useState(params.page ?? 1);

  const state = useFetch(
    () =>
      enabled
        ? getPosts({ ...params, page })
        : Promise.resolve({ posts: [], total: 0, totalPages: 0 }),
    { cacheKey: `posts:${JSON.stringify({ ...params, page, enabled })}`, persist: true }
  );

  return {
    ...state,
    posts:      state.data?.posts ?? [],
    total:      state.data?.total ?? 0,
    totalPages: state.data?.totalPages ?? 0,
    page,
    setPage,
  };
}

export function usePost(slug: string) {
  return useFetch<WPPost | null>(
    () => (slug ? getPostBySlug(slug) : Promise.resolve(null)),
    { cacheKey: `post:${slug}`, persist: true }
  );
}

export function usePage(slug: string) {
  return useFetch<WPPage | null>(
    () => (slug ? getPageBySlug(slug) : Promise.resolve(null)),
    { cacheKey: `page:${slug}`, persist: true }
  );
}

export function useACFOptions() {
  return useFetch<ACFOptions>(
    () => getACFOptions(),
    { cacheKey: "acf-options", staleMs: 120_000, persist: true }
  );
}

export function useACFPost(postId: number | null) {
  return useFetch<Record<string, unknown>>(
    () => (postId ? getACFForPost(postId) : Promise.resolve({})),
    { cacheKey: `acf-post:${postId ?? "none"}` }
  );
}

export function useCPT<T extends Record<string, unknown>>(
  cptSlug: string,
  params: QueryParams = {}
) {
  return useFetch<T[]>(
    () => (cptSlug ? getCPT<T>(cptSlug, params) : Promise.resolve([])),
    { cacheKey: `cpt:${cptSlug}:${JSON.stringify(params)}`, persist: true }
  );
}

/**
 * Charge un item CPT unique par son slug WP.
 * Retourne `null` si aucun item ne correspond (404 ou tableau vide).
 * Active automatiquement `_embed` pour inclure la featured media.
 */
export function useCPTBySlug<T extends Record<string, unknown>>(
  cptSlug: string,
  slug: string
): FetchState<T | null> & { refetch: () => void } {
  return useFetch<T | null>(
    () =>
      slug
        ? getCPT<T>(cptSlug, { slug, perPage: 1, embed: true }).then(
            (r) => r[0] ?? null
          )
        : Promise.resolve(null),
    { cacheKey: `cpt:${cptSlug}:slug:${slug}`, persist: true }
  );
}

export function useCategories() {
  return useFetch(() => getCategories(), { cacheKey: "categories", persist: true });
}

/**
 * Résout une liste d'IDs d'attachments WP en Map<id, { url, alt }>.
 * Fait un seul appel batch à /wp/v2/media.
 */
export function useMediaBatch(ids: number[]) {
  const key = [...ids].sort((a, b) => a - b).join(",");
  return useFetch<Map<number, { url: string; alt: string }>>(
    () => getMediaByIds(ids),
    { cacheKey: `media:${key}`, persist: true }
  );
}

export function useTaxonomyTerms(taxonomy: string, params: QueryParams = {}) {
  return useFetch<WPTaxonomyTerm[]>(
    () => (taxonomy ? getTaxonomyTerms(taxonomy, params) : Promise.resolve([])),
    { cacheKey: `taxonomy:${taxonomy}:${JSON.stringify(params)}`, persist: true }
  );
}

/**
 * Lit les champs ACF d'une Options Sub-Page enregistrée dans WP via
 * acf_add_options_sub_page(['menu_slug' => $slug]).
 * Endpoint : /wp-json/acf/v3/options/{slug}
 */
export function useACFOptionsPage(slug: string) {
  return useFetch<Record<string, unknown>>(
    () => (slug ? getACFOptionsPage(slug) : Promise.resolve({})),
    { cacheKey: `acf-options-page:${slug}`, staleMs: 120_000, persist: true }
  );
}

// ─── Prefetch ─────────────────────────────────────────────────────────────

/**
 * Pré-remplit le cache mémoire pour une liste d'entrées CPT + leurs médias.
 * À appeler en arrière-plan (fire & forget) quand la liste est chargée.
 * Les requêtes sont parallèles ; si une entrée est déjà en cache, on la skippe.
 */
export async function prefetchCPTItems(
  cptSlug: string,
  items: { slug: string; photoIds?: number[] }[]
): Promise<void> {
  await Promise.all(
    items.map(async ({ slug, photoIds = [] }) => {
      const entryKey = `cpt:${cptSlug}:${JSON.stringify({ slug, perPage: 1 })}`;
      const entryFetch = memoryCache.has(entryKey)
        ? Promise.resolve()
        : getCPT(cptSlug, { slug, perPage: 1 }).then((data) =>
            memoryCache.set(entryKey, { data, updatedAt: Date.now() })
          ).catch(() => {});

      const validIds = photoIds.filter((id) => id > 0);
      const mediaKey = `media:${[...validIds].sort((a, b) => a - b).join(",")}`;
      const mediaFetch = !validIds.length || memoryCache.has(mediaKey)
        ? Promise.resolve()
        : getMediaByIds(validIds).then((data) =>
            memoryCache.set(mediaKey, { data, updatedAt: Date.now() })
          ).catch(() => {});

      await Promise.all([entryFetch, mediaFetch]);
    })
  );
}

// ─── GraphQL — fragments partagés ────────────────────────────────────────

const GQL_LINK_FRAGMENT = `url title target`;
const GQL_IMAGE_EDGE = `node { sourceUrl altText }`;

// ─── GraphQL — Duos (CPT + ACF) ──────────────────────────────────────────

import type {
  DuoNode,
  PartenaireNode,
  HomeContent,
  HomeContentResponse,
  ConceptContent,
  ConceptContentResponse,
} from "../config/acf-schemas";

const GQL_DUO_FIELDS_FRAGMENT = `
  slug
  title
  duoFields {
    titre
    sousTitre
    texte
    image { ${GQL_IMAGE_EDGE} }
    lien { ${GQL_LINK_FRAGMENT} }
    artiste {
      nodes {
        ... on Artiste {
          slug
          title
          artistes { logo { ${GQL_IMAGE_EDGE} } lien presentation }
        }
      }
    }
    entreprise {
      nodes {
        ... on Partenaire {
          slug
          title
          partenaires { logo { ${GQL_IMAGE_EDGE} } lien presentation }
        }
      }
    }
  }
`;

const GQL_DUOS_LIST = `
  query GetDuosList {
    duos(first: 100) {
      nodes { ${GQL_DUO_FIELDS_FRAGMENT} }
    }
  }
`;

const GQL_DUO_BY_SLUG = `
  query GetDuoBySlug($slug: ID!) {
    duo(id: $slug, idType: SLUG) { ${GQL_DUO_FIELDS_FRAGMENT} }
  }
`;

type GqlDuosListResponse = { duos: { nodes: DuoNode[] } };
type GqlDuoBySlugResponse = { duo: DuoNode | null };

export function useDuosList() {
  return useFetch<DuoNode[]>(
    () => graphqlFetch<GqlDuosListResponse>(GQL_DUOS_LIST).then(r => r.duos?.nodes ?? []),
    { cacheKey: "gql:duos:list", staleMs: 60_000, persist: true }
  );
}

export function useDuoBySlug(slug: string) {
  return useFetch<DuoNode | null>(
    () =>
      slug
        ? graphqlFetch<GqlDuoBySlugResponse>(GQL_DUO_BY_SLUG, { slug }).then(r => r.duo ?? null)
        : Promise.resolve(null),
    { cacheKey: `gql:duo:${slug}`, persist: true }
  );
}

// ─── GraphQL — Partenaires (CPT + ACF) ───────────────────────────────────

const GQL_PARTENAIRE_FIELDS_FRAGMENT = `
  slug
  title
  partenaires {
    logo { ${GQL_IMAGE_EDGE} }
    lien
    presentation
    categorieDuPartenaire
  }
`;

const GQL_PARTENAIRES_LIST = `
  query GetPartenairesList {
    partenaires(first: 100) {
      nodes { ${GQL_PARTENAIRE_FIELDS_FRAGMENT} }
    }
  }
`;

type GqlPartenairesListResponse = { partenaires: { nodes: PartenaireNode[] } };

export function usePartenairesList() {
  return useFetch<PartenaireNode[]>(
    () => graphqlFetch<GqlPartenairesListResponse>(GQL_PARTENAIRES_LIST).then(r => r.partenaires?.nodes ?? []),
    { cacheKey: "gql:partenaires:list", staleMs: 120_000, persist: true }
  );
}

// ─── GraphQL — Page d'accueil (Options Page) ─────────────────────────────

const GQL_HOME_CONTENT = `
  query GetHomeContent {
    pageAccueilContent {
      pageDAccueil {
        enTete     { titre sousTitre texte lien { ${GQL_LINK_FRAGMENT} } }
        piedDePage { titre sousTitre texte lien { ${GQL_LINK_FRAGMENT} } }
      }
    }
  }
`;

export function useHomeContent() {
  return useFetch<HomeContent>(
    () =>
      graphqlFetch<HomeContentResponse>(GQL_HOME_CONTENT).then(
        r => r.pageAccueilContent?.pageDAccueil ?? {}
      ),
    { cacheKey: "gql:home", staleMs: 120_000, persist: true }
  );
}

// ─── GraphQL — Page concept (Options Page) ───────────────────────────────

const GQL_CONCEPT_SECTION = `
  titre
  texte
  lien { ${GQL_LINK_FRAGMENT} }
  image { ${GQL_IMAGE_EDGE} }
`;

const GQL_CONCEPT_CONTENT = `
  query GetConceptContent {
    pageConceptContent {
      pageConcept {
        introduction
        enTete     { ${GQL_CONCEPT_SECTION} }
        zoneGrise  { ${GQL_CONCEPT_SECTION} }
        carte      { titre texte lien { ${GQL_LINK_FRAGMENT} } }
        piedDePage { ${GQL_CONCEPT_SECTION} }
      }
    }
  }
`;

export function useConceptContent() {
  return useFetch<ConceptContent>(
    () =>
      graphqlFetch<ConceptContentResponse>(GQL_CONCEPT_CONTENT).then(
        r => r.pageConceptContent?.pageConcept ?? {}
      ),
    { cacheKey: "gql:concept", staleMs: 120_000, persist: true }
  );
}

// ─── GraphQL — exemple documenté ──────────────────────────────────────────
//
// `graphqlFetch` est aussi dispo pour d'autres cas où REST ne suffit pas
// (connexions MediaItem, options pages typées, etc.).

/**
 * Exemple : charge une Options page nommée `siteSettings` via GraphQL.
 * Adaptez la query selon votre schéma WPGraphQL.
 * Échoue silencieusement (retourne `{}`) si la query n'aboutit pas — pratique
 * pour ne pas casser l'app quand le champ n'est pas encore configuré côté WP.
 */
const GQL_SITE_SETTINGS = `
  query GetSiteSettings {
    siteSettings {
      settings {
        tagline
        announcement
      }
    }
  }
`;

export function useGraphQLSiteSettings<T = Record<string, unknown>>() {
  return useFetch<T>(
    () => graphqlFetch<T>(GQL_SITE_SETTINGS).catch(() => ({} as T)),
    { cacheKey: "gql-site-settings", staleMs: 120_000, persist: true }
  );
}
