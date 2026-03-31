import axios from 'axios';
import { normalizeMediaType } from '../utils/media.js';

const apiKey = import.meta.env.VITE_TMDB_API_KEY;

export const tmdbClient = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: apiKey,
    language: 'ru-RU'
  },
  timeout: 10000
});

tmdbClient.interceptors.response.use(
  response => response,
  error => {
    const normalized = {
      status: error.response?.status ?? null,
      message:
        error.response?.data?.status_message ||
        error.message ||
        'Произошла ошибка при запросе к TMDB'
    };
    return Promise.reject(normalized);
  }
);

export async function fetchTrending(params = {}) {
  const response = await tmdbClient.get('/trending/all/week', { params });
  return response.data;
}

export async function searchMulti(query, params = {}) {
  const response = await tmdbClient.get('/search/multi', {
    params: { query, include_adult: false, ...params }
  });
  const normalizedResults = (response.data?.results ?? [])
    .map(item => {
      const inferredType = item.media_type || (item.title ? 'movie' : item.name ? 'tv' : null);
      if (!inferredType || inferredType === 'person') {
        return null;
      }
      return {
        ...item,
        media_type: normalizeMediaType(inferredType)
      };
    })
    .filter(Boolean);

  return {
    ...response.data,
    results: normalizedResults
  };
}

export async function fetchDetails(type, id, params = {}) {
  const mediaType = normalizeMediaType(type);
  const response = await tmdbClient.get(`/${mediaType}/${id}`, {
    params: { append_to_response: 'videos,credits', ...params }
  });
  return response.data;
}

export async function fetchRecommendations(type, id, params = {}) {
  const mediaType = normalizeMediaType(type);
  const response = await tmdbClient.get(`/${mediaType}/${id}/recommendations`, { params });
  return response.data;
}

export async function fetchAnime(params = {}) {
  const response = await tmdbClient.get('/discover/tv', {
    params: {
      with_genres: 16,
      with_origin_country: 'JP',
      sort_by: 'popularity.desc',
      ...params
    }
  });
  return response.data;
}

export async function fetchDiscoverByGenres(type, genreIds = [], params = {}) {
  const mediaType = normalizeMediaType(type);
  const response = await tmdbClient.get(`/discover/${mediaType}`, {
    params: {
      with_genres: genreIds.join(','),
      sort_by: 'popularity.desc',
      ...params
    }
  });
  return response.data;
}

export async function fetchGenres(type) {
  const mediaType = normalizeMediaType(type);
  const response = await tmdbClient.get(`/genre/${mediaType}/list`);
  return response.data;
}

