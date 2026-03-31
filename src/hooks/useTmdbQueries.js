import { useQuery } from '@tanstack/react-query';
import {
  fetchAnime,
  fetchDetails,
  fetchDiscoverByGenres,
  fetchGenres,
  fetchRecommendations,
  fetchTrending,
  searchMulti
} from '../services/tmdb.js';

export const tmdbKeys = {
  trending: ['tmdb', 'trending'],
  search: query => ['tmdb', 'search', query],
  details: (type, id) => ['tmdb', 'details', type, id],
  recommendations: (type, id) => ['tmdb', 'recommendations', type, id],
  anime: ['tmdb', 'anime'],
  genres: type => ['tmdb', 'genres', type],
  discoverByGenres: (type, genreIds) => ['tmdb', 'discover', type, ...genreIds]
};

const LONG_STALE = 1000 * 60 * 10;
const MID_STALE = 1000 * 60 * 5;

export function useTrendingQuery() {
  return useQuery({
    queryKey: tmdbKeys.trending,
    queryFn: () => fetchTrending(),
    staleTime: MID_STALE,
    gcTime: LONG_STALE
  });
}

export function useSearchQuery(query) {
  return useQuery({
    queryKey: tmdbKeys.search(query),
    queryFn: () => searchMulti(query),
    enabled: Boolean(query?.trim()),
    staleTime: 1000 * 60 * 2,
    gcTime: LONG_STALE
  });
}

export function useDetailsQuery(type, id) {
  return useQuery({
    queryKey: tmdbKeys.details(type, id),
    queryFn: () => fetchDetails(type, id),
    enabled: Boolean(type && id),
    staleTime: MID_STALE,
    gcTime: LONG_STALE
  });
}

export function useRecommendationsQuery(type, id) {
  return useQuery({
    queryKey: tmdbKeys.recommendations(type, id),
    queryFn: () => fetchRecommendations(type, id),
    enabled: Boolean(type && id),
    staleTime: MID_STALE,
    gcTime: LONG_STALE
  });
}

export function useAnimeQuery() {
  return useQuery({
    queryKey: tmdbKeys.anime,
    queryFn: () => fetchAnime(),
    staleTime: MID_STALE,
    gcTime: LONG_STALE
  });
}

export function useGenresQuery(type) {
  return useQuery({
    queryKey: tmdbKeys.genres(type),
    queryFn: () => fetchGenres(type),
    enabled: Boolean(type),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60
  });
}

export function useDiscoverByGenresQuery(type, genreIds, enabled) {
  return useQuery({
    queryKey: tmdbKeys.discoverByGenres(type, genreIds),
    queryFn: () => fetchDiscoverByGenres(type, genreIds),
    enabled: Boolean(enabled && type && genreIds?.length),
    staleTime: MID_STALE,
    gcTime: LONG_STALE
  });
}

