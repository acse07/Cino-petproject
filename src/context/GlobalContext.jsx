import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMediaKey, normalizeMediaType } from '../utils/media.js';

const GlobalContext = createContext(null);

const STORAGE_KEYS = {
  favorites: 'cino_favorites',
  watched: 'cino_watched'
};

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function normalizeStoredList(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter(item => item && typeof item.id !== 'undefined')
    .map(item => ({ ...item, media_type: normalizeMediaType(item.media_type) }));
}

export function GlobalProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === 'undefined') return [];
    const stored = window.localStorage.getItem(STORAGE_KEYS.favorites);
    return stored ? normalizeStoredList(safeParse(stored, [])) : [];
  });

  const [watched, setWatched] = useState(() => {
    if (typeof window === 'undefined') return [];
    const stored = window.localStorage.getItem(STORAGE_KEYS.watched);
    return stored ? normalizeStoredList(safeParse(stored, [])) : [];
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
    } catch {
      // ignore storage errors
    }
  }, [favorites]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.watched, JSON.stringify(watched));
    } catch {
      // ignore storage errors
    }
  }, [watched]);

  const toggleFavorite = item => {
    const nextItem = { ...item, media_type: normalizeMediaType(item.media_type) };
    const key = getMediaKey(nextItem);
    setFavorites(prev => {
      const exists = prev.some(i => getMediaKey(i) === key);
      if (exists) {
        return prev.filter(i => getMediaKey(i) !== key);
      }
      return [...prev, nextItem];
    });
  };

  const toggleWatched = item => {
    const nextItem = { ...item, media_type: normalizeMediaType(item.media_type) };
    const key = getMediaKey(nextItem);
    setWatched(prev => {
      const exists = prev.some(i => getMediaKey(i) === key);
      if (exists) {
        return prev.filter(i => getMediaKey(i) !== key);
      }
      return [...prev, nextItem];
    });
  };

  const isFavorite = (id, type) =>
    favorites.some(i => getMediaKey(i) === `${normalizeMediaType(type)}:${id}`);
  const isWatched = (id, type) =>
    watched.some(i => getMediaKey(i) === `${normalizeMediaType(type)}:${id}`);

  const value = useMemo(
    () => ({
      favorites,
      watched,
      toggleFavorite,
      toggleWatched,
      isFavorite,
      isWatched
    }),
    [favorites, watched]
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export function useGlobal() {
  const ctx = useContext(GlobalContext);
  if (!ctx) {
    throw new Error('useGlobal must be used within GlobalProvider');
  }
  return ctx;
}

