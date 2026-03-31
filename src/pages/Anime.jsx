import MovieCard from '../components/MovieCard.jsx';
import Loader from '../components/Loader.jsx';
import { useAnimeQuery } from '../hooks/useTmdbQueries.js';
import { getMediaKey } from '../utils/media.js';

function Anime() {
  const animeQuery = useAnimeQuery();
  const animeItems = (animeQuery.data?.results ?? []).map(item => ({
    ...item,
    media_type: 'tv'
  }));

  return (
    <div className="container-fluid app-container py-3">
      <div className="mb-4">
        <h1 className="h4 mb-1">Аниме</h1>
        <p className="text-muted small mb-0">
          Подборка из TMDB Discover: анимация из Японии (genre=16, country=JP).
        </p>
      </div>

      {animeQuery.isLoading && <Loader />}

      {animeQuery.isError && !animeQuery.isLoading && (
        <div className="alert alert-danger" role="alert">
          <h2 className="h6 mb-1">Ошибка загрузки аниме</h2>
          <p className="mb-0 small">{animeQuery.error?.message || 'Не удалось получить список аниме.'}</p>
        </div>
      )}

      {!animeQuery.isLoading && !animeQuery.isError && animeItems.length === 0 && (
        <div className="alert alert-secondary small" role="alert">
          По текущим параметрам аниме не найдено.
        </div>
      )}

      {!animeQuery.isLoading && !animeQuery.isError && animeItems.length > 0 && (
        <div className="row g-3 g-md-4">
          {animeItems.map(item => (
            <MovieCard key={getMediaKey(item)} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Anime;

