import { useParams } from 'react-router-dom';
import Loader from '../components/Loader.jsx';
import MovieCard from '../components/MovieCard.jsx';
import { useDetailsQuery, useRecommendationsQuery } from '../hooks/useTmdbQueries.js';
import { useGlobal } from '../context/GlobalContext.jsx';
import {
  getMediaKey,
  getMediaRuntime,
  getMediaTitle,
  getMediaYear,
  isSupportedMediaType,
  normalizeMediaType
} from '../utils/media.js';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

function MovieDetails() {
  const { id, type } = useParams();
  const mediaType = normalizeMediaType(type);
  const isValidType = isSupportedMediaType(type);
  const isValidId = Number.isInteger(Number(id)) && Number(id) > 0;
  const queryType = isValidType ? type : null;
  const queryId = isValidId ? id : null;
  const { isFavorite, toggleFavorite, isWatched, toggleWatched } = useGlobal();

  const detailsQuery = useDetailsQuery(queryType, queryId);
  const recommendationsQuery = useRecommendationsQuery(queryType, queryId);

  if (!isValidType || !isValidId) {
    return (
      <div className="container-fluid app-container py-4">
        <div className="alert alert-warning" role="alert">
          <h1 className="h5 mb-1">Некорректная ссылка</h1>
          <p className="mb-0 small">Проверьте тип контента и идентификатор в URL.</p>
        </div>
      </div>
    );
  }

  if (detailsQuery.isLoading) {
    return (
      <div className="container-fluid app-container py-4">
        <Loader count={6} />
      </div>
    );
  }

  if (detailsQuery.isError) {
    return (
      <div className="container-fluid app-container py-4">
        <div className="alert alert-danger" role="alert">
          <h1 className="h5 mb-1">Не удалось загрузить детали</h1>
          <p className="mb-0 small">{detailsQuery.error?.message || 'Ошибка TMDB'}</p>
        </div>
      </div>
    );
  }

  const mediaItem = detailsQuery.data;
  if (!mediaItem) {
    return null;
  }

  const title = getMediaTitle(mediaItem);
  const rating = Math.round((mediaItem.vote_average || 0) * 10);
  const year = getMediaYear(mediaItem);
  const runtime = getMediaRuntime(mediaItem, mediaType);
  const favorite = isFavorite(mediaItem.id, mediaType);
  const watched = isWatched(mediaItem.id, mediaType);
  const recommendations = (recommendationsQuery.data?.results ?? []).map(item => ({
    ...item,
    media_type: mediaType
  }));

  return (
    <div className="pb-4">
      {mediaItem.backdrop_path && (
        <div
          className="position-relative"
          style={{
            maxHeight: '420px',
            overflow: 'hidden'
          }}
        >
          <img
            src={`${BACKDROP_BASE}${mediaItem.backdrop_path}`}
            alt={title}
            className="w-100"
            style={{ objectFit: 'cover', filter: 'brightness(0.35)' }}
          />
          <div className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              background:
                'linear-gradient(180deg, rgba(3,7,18,0.2) 0%, rgba(3,7,18,0.95) 80%, #020617 100%)'
            }}
          />
        </div>
      )}

      <div className="container-fluid app-container mt-n5 position-relative">
        <div className="row g-4">
          <div className="col-12 col-md-auto">
            {mediaItem.poster_path && (
              <img
                src={`${IMAGE_BASE}${mediaItem.poster_path}`}
                alt={title}
                className="rounded-4 shadow-lg"
                style={{ maxWidth: '260px', width: '100%', marginTop: '-140px' }}
              />
            )}
          </div>

          <div className="col">
            <h1 className="h3 mb-1">
              {title}{' '}
              {year && <span className="text-muted small">({year})</span>}
            </h1>
            {mediaItem.tagline && (
              <p className="fst-italic text-muted small mb-2">{mediaItem.tagline}</p>
            )}

            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span className="badge bg-success-subtle text-success-emphasis rating-badge">
                Оценка пользователей: {rating ? `${rating}%` : 'NR'}
              </span>
              {runtime && (
                <span className="badge bg-dark badge-chip">
                  {runtime} мин
                </span>
              )}
              {mediaItem.genres && mediaItem.genres.length > 0 && (
                <span className="text-muted small">
                  {mediaItem.genres.map(g => g.name).join(', ')}
                </span>
              )}
            </div>

            <div className="d-flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                className={`btn btn-sm ${favorite ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => toggleFavorite({ ...mediaItem, media_type: mediaType })}
                aria-pressed={favorite}
              >
                {favorite ? 'В избранном' : 'Добавить в избранное'}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${watched ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => toggleWatched({ ...mediaItem, media_type: mediaType })}
                aria-pressed={watched}
              >
                {watched ? 'Отмечено как просмотренное' : 'Отметить просмотренным'}
              </button>
            </div>

            <div className="mb-3">
              <h2 className="h6">Описание</h2>
              <p className="small text-light-emphasis mb-0">
                {mediaItem.overview || 'Описание отсутствует.'}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="h5 mb-0">Похожие</h2>
            {recommendations.length > 0 && (
              <span className="text-muted small">
                Найдено: {recommendations.length}
              </span>
            )}
          </div>

          {recommendationsQuery.isLoading && <Loader count={6} />}

          {recommendationsQuery.isError && !recommendationsQuery.isLoading && (
            <div className="alert alert-secondary small py-2" role="alert">
              Не удалось загрузить похожие материалы.
            </div>
          )}

          {!recommendationsQuery.isLoading && !recommendationsQuery.isError && recommendations.length > 0 && (
            <div className="row g-3 g-md-4">
              {recommendations.map(item => (
                <MovieCard key={getMediaKey(item)} item={item} />
              ))}
            </div>
          )}

          {!recommendationsQuery.isLoading && !recommendationsQuery.isError && recommendations.length === 0 && (
            <p className="text-muted small mb-0">Похожие материалы не найдены.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default MovieDetails;

