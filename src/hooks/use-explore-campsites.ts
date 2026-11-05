import { useCallback, useEffect, useRef, useState } from 'react';
import { api, errorMessage, type CampsiteQuery, type CampsiteSummary } from '../lib/api';

// Keep the existing page API: page 0 x 20, then page 2 x 10, 3 x 10, ...
export function useExploreCampsites(filters: CampsiteQuery, enabled: boolean) {
  const key = JSON.stringify(filters);
  const generation = useRef(0);
  const busy = useRef(false);
  const nextPage = useRef(0);
  const more = useRef(false);
  const failed = useRef(false);
  const [items, setItems] = useState<CampsiteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const load = useCallback(
    async (reset: boolean) => {
      if (!enabled || (!reset && (busy.current || !more.current))) return;
      const id = reset ? ++generation.current : generation.current;
      const page = reset ? 0 : nextPage.current;
      const size = reset ? 20 : 10;
      busy.current = true;
      failed.current = false;
      setError('');
      if (reset) {
        nextPage.current = 0;
        setItems([]);
        setLoading(true);
        setLoadingMore(false);
        more.current = false;
        setHasMore(false);
      } else setLoadingMore(true);
      try {
        const result = await api.campsites({ ...JSON.parse(key), page, size });
        if (id !== generation.current) return;
        setItems((previous) => {
          const merged = reset ? result.items : [...previous, ...result.items];
          return [...new Map(merged.map((item) => [item.uuid, item])).values()];
        });
        nextPage.current = reset ? 2 : page + 1;
        more.current =
          result.items.length > 0 && page * size + result.items.length < result.totalElements;
        setHasMore(more.current);
      } catch (e) {
        if (id === generation.current) {
          setError(errorMessage(e));
          failed.current = true;
        }
      } finally {
        if (id === generation.current) {
          busy.current = false;
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [key, enabled],
  );
  useEffect(() => {
    const lifecycle = generation;
    if (enabled) {
      void load(true);
    } else {
      setItems([]);
      setError('');
      setLoading(false);
      setLoadingMore(false);
      setHasMore(false);
      more.current = false;
      failed.current = false;
      nextPage.current = 0;
      busy.current = false;
    }
    return () => {
      lifecycle.current++;
    };
  }, [load, enabled]);
  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    reload: useCallback(() => load(true), [load]),
    retry: () => load(nextPage.current === 0),
    loadMore: () => {
      if (!failed.current) void load(false);
    },
  };
}
