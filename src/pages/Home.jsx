import { useSearchParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import MovieCard from '../components/MovieCard.jsx';
import Loader from '../components/Loader.jsx';
import { useGlobal } from '../context/GlobalContext.jsx';
import {
  useDiscoverByGenresQuery,
  useGenresQuery,
  useSearchQuery,
  useTrendingQuery
} from '../hooks/useTmdbQueries.js';
import { getMediaKey, isSupportedMediaType, normalizeMediaType } from '../utils/media.js';

function getTopGenresFromFavorites(favorites) {
  const map = new Map();

  favorites.forEach(item => {
    const ids =
      item.genre_ids ||
      item.genres?.map(genre => genre.id).filter(Boolean) ||
      [];
    ids.forEach(id => {
      map.set(id, (map.get(id) || 0) + 1);
    });
  });

  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);
}

function Home() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const { favorites } = useGlobal();

  const [filters, setFilters] = useState({
    mediaType: 'all',
    year: '',
    genre: ''
  });

  const trendingQuery = useTrendingQuery();
  const searchQuery = useSearchQuery(query);
  const activeQuery = query.trim() ? searchQuery : trendingQuery;
  const results = (activeQuery.data?.results ?? [])
    .map(item => {
      if (!item || !item.id) return null;
      const normalizedType = normalizeMediaType(item.media_type);
      return { ...item, media_type: normalizedType };
    })
    .filter(item => item && isSupportedMediaType(item.media_type));

  const genreType = filters.mediaType === 'all' ? 'movie' : filters.mediaType;
  const genresQuery = useGenresQuery(genreType);
  const genres = genresQuery.data?.genres ?? [];

  const topGenres = useMemo(() => getTopGenresFromFavorites(favorites), [favorites]);
  const favoriteDominantType = useMemo(() => {
    const tvCount = favorites.filter(item => normalizeMediaType(item.media_type) === 'tv').length;
    const movieCount = favorites.length - tvCount;
    return tvCount > movieCount ? 'tv' : 'movie';
  }, [favorites]);

  const recommendedQuery = useDiscoverByGenresQuery(
    favoriteDominantType,
    topGenres,
    favorites.length > 0 && topGenres.length > 0
  );
  const recommendedItems = (recommendedQuery.data?.results ?? [])
    .filter(item => item && item.id)
    .map(item => ({ ...item, media_type: favoriteDominantType }))
    .slice(0, 6);

  const filtered = results.filter(item => {
    const type = item.media_type;
    if (filters.mediaType !== 'all' && type !== filters.mediaType) {
      return false;
    }

    if (filters.year) {
      const year = (item.release_date || item.first_air_date || '').slice(0, 4);
      if (year !== filters.year) return false;
    }

    if (filters.genre && item.genre_ids && item.genre_ids.length > 0) {
      const genreId = Number(filters.genre);
      if (!item.genre_ids.includes(genreId)) return false;
    }

    return true;
  });

  const handleFilterChange = event => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container-fluid app-container py-3">
      <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h4 mb-1">
            {query ? 'Результаты поиска' : 'В тренде сейчас'}
          </h1>
          <p className="text-muted small mb-0">
            {query
              ? `По запросу «${query}» найдено: ${results.length}`
              : 'Популярные фильмы, сериалы и аниме за неделю.'}
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <select
            name="mediaType"
            className="form-select form-select-sm bg-dark text-light border-secondary"
            value={filters.mediaType}
            onChange={handleFilterChange}
            aria-label="Фильтр по типу"
          >
            <option value="all">Все типы</option>
            <option value="movie">Фильмы</option>
            <option value="tv">Сериалы</option>
          </select>

          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            name="year"
            className="form-control form-control-sm bg-dark text-light border-secondary"
            placeholder="Год"
            value={filters.year}
            onChange={handleFilterChange}
            aria-label="Фильтр по году"
          />

          <select
            name="genre"
            className="form-select form-select-sm bg-dark text-light border-secondary"
            value={filters.genre}
            onChange={handleFilterChange}
            aria-label="Фильтр по жанру"
          >
            <option value="">Все жанры</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {favorites.length > 0 && (
        <section className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="h5 mb-0">Рекомендовано для вас</h2>
            <span className="text-muted small">На основе вашего избранного</span>
          </div>
          {recommendedQuery.isLoading && <Loader count={6} />}
          {!recommendedQuery.isLoading && recommendedItems.length > 0 && (
            <div className="row g-3 g-md-4">
              {recommendedItems.map(item => (
                <MovieCard key={getMediaKey(item)} item={item} />
              ))}
            </div>
          )}
          {!recommendedQuery.isLoading && recommendedItems.length === 0 && (
            <div className="alert alert-secondary small" role="alert">
              Для текущего набора избранного рекомендации пока не найдены.
            </div>
          )}
        </section>
      )}

      {activeQuery.isLoading && <Loader />}

      {activeQuery.isError && !activeQuery.isLoading && (
        <div className="alert alert-danger" role="alert">
          <h2 className="h6 mb-1">Ошибка загрузки</h2>
          <p className="mb-0 small">
            {activeQuery.error?.message || 'Не удалось загрузить данные с TMDB.'}
          </p>
        </div>
      )}

      {!activeQuery.isLoading && !activeQuery.isError && filtered.length === 0 && (
        <div className="alert alert-secondary" role="alert">
          <h2 className="h6 mb-1">Ничего не найдено</h2>
          <p className="mb-0 small">
            Попробуйте изменить запрос или фильтры.
          </p>
        </div>
      )}

      {!activeQuery.isLoading && !activeQuery.isError && filtered.length > 0 && (
        <div className="row g-3 g-md-4">
          {filtered.map(item => (
            <MovieCard key={getMediaKey(item)} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;

