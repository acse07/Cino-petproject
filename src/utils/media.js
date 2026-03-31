export function normalizeMediaType(type) {
  return type === 'tv' ? 'tv' : 'movie';
}

export function isSupportedMediaType(type) {
  return type === 'movie' || type === 'tv';
}

export function getMediaTitle(item) {
  return item?.title || item?.name || 'Без названия';
}

export function getMediaDate(item) {
  return item?.release_date || item?.first_air_date || '';
}

export function getMediaYear(item) {
  return getMediaDate(item).slice(0, 4);
}

export function getMediaRuntime(item, type) {
  if (type === 'tv') {
    return item?.episode_run_time?.[0] || null;
  }
  return item?.runtime || null;
}

export function getMediaTypeLabel(type) {
  return type === 'tv' ? 'Сериал' : 'Фильм';
}

export function getMediaKey(item) {
  return `${normalizeMediaType(item?.media_type)}:${item?.id}`;
}

export function getMediaLink(item) {
  return `/${normalizeMediaType(item?.media_type)}/${item?.id}`;
}

