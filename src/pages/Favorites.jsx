import MovieCard from '../components/MovieCard.jsx';
import { useGlobal } from '../context/GlobalContext.jsx';
import { getMediaKey } from '../utils/media.js';

function Favorites() {
  const { favorites } = useGlobal();

  return (
    <div className="container-fluid app-container py-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4">
        <div>
          <h1 className="h4 mb-1">Избранное</h1>
          <p className="text-muted small mb-0">
            Список фильмов, сериалов и аниме, которые вы добавили в закладки.
          </p>
        </div>
        <span className="badge bg-secondary-subtle text-secondary-emphasis">
          Всего: {favorites.length}
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="alert alert-secondary" role="alert">
          <h2 className="h6 mb-1">Пока пусто</h2>
          <p className="mb-0 small">
            Добавляйте интересные тайтлы в избранное, чтобы быстро находить их позже.
          </p>
        </div>
      ) : (
        <div className="row g-3 g-md-4">
          {favorites.map(item => (
            <MovieCard key={getMediaKey(item)} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;

