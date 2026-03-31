import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext.jsx';
import { tmdbKeys } from '../hooks/useTmdbQueries.js';
import { fetchDetails, fetchRecommendations } from '../services/tmdb.js';
import {
  getMediaLink,
  getMediaTitle,
  getMediaTypeLabel,
  getMediaYear,
  normalizeMediaType
} from '../utils/media.js';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

function MovieCard({ item }) {
  const queryClient = useQueryClient();
  const { isFavorite, toggleFavorite, isWatched, toggleWatched } = useGlobal();

  const {
    id,
    poster_path: posterPath,
    vote_average: voteAverage,
    media_type: rawType
  } = item;

  const mediaType = normalizeMediaType(rawType);
  const label = getMediaTitle(item);
  const year = getMediaYear(item);
  const rating = Math.round((voteAverage || 0) * 10);
  const typeLabel = getMediaTypeLabel(mediaType);
  const detailsPath = getMediaLink({ ...item, media_type: mediaType });

  const favorite = isFavorite(id, mediaType);
  const watched = isWatched(id, mediaType);

  const handlePrefetch = () => {
    queryClient.prefetchQuery({
      queryKey: tmdbKeys.details(mediaType, id),
      queryFn: () => fetchDetails(mediaType, id),
      staleTime: 1000 * 60 * 5
    });
    queryClient.prefetchQuery({
      queryKey: tmdbKeys.recommendations(mediaType, id),
      queryFn: () => fetchRecommendations(mediaType, id),
      staleTime: 1000 * 60 * 5
    });
  };

  return (
    <div className="col-6 col-sm-4 col-md-3 col-lg-2">
      <motion.div
        className="movie-card h-100 rounded-3 overflow-hidden d-flex flex-column"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        whileHover={{ y: -4, scale: 1.01 }}
      >
        <Link
          to={detailsPath}
          className="text-reset"
          onMouseEnter={handlePrefetch}
          onFocus={handlePrefetch}
          aria-label={`Открыть ${typeLabel.toLowerCase()}: ${label}`}
        >
          {posterPath ? (
            <img
              src={`${IMAGE_BASE}${posterPath}`}
              alt={label}
              className="movie-poster w-100"
              loading="lazy"
            />
          ) : (
            <div className="movie-poster d-flex align-items-center justify-content-center bg-secondary bg-opacity-25">
              <span className="text-muted small">Нет постера</span>
            </div>
          )}
        </Link>
        <div className="p-2 d-flex flex-column flex-grow-1">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="badge bg-primary badge-chip">{typeLabel}</span>
            {year && <span className="badge bg-dark text-muted badge-chip">{year}</span>}
          </div>
          <Link to={detailsPath} className="text-reset fw-semibold small mb-1 flex-grow-1">
            {label}
          </Link>

          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="badge bg-success-subtle text-success-emphasis rating-badge">
              {rating ? `${rating}%` : 'NR'}
            </span>
          </div>

          <div className="d-flex gap-1">
            <button
              type="button"
              className={`btn btn-sm flex-fill ${
                favorite ? 'btn-warning' : 'btn-outline-warning'
              }`}
              onClick={() => toggleFavorite(item)}
              aria-pressed={favorite}
            >
              {favorite ? 'В избранном' : 'В избранное'}
            </button>
            <button
              type="button"
              className={`btn btn-sm flex-fill ${
                watched ? 'btn-success' : 'btn-outline-success'
              }`}
              onClick={() => toggleWatched(item)}
              aria-pressed={watched}
            >
              {watched ? 'Просмотрено' : 'Просмотрел'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default MovieCard;

