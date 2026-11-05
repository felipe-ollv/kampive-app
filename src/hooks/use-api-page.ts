import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage, type PageResult } from '../lib/api';
export function useApiPage<T extends { uuid: string }>(
  loader: (page: number) => Promise<PageResult<T>>,
  automatic = true,
) {
  const [data, setData] = useState<PageResult<T> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const version = useRef(0);
  const busy = useRef(false);
  const load = useCallback(
    async (page = 0) => {
      const id = ++version.current;
      busy.current = true;
      setLoading(true);
      setError('');
      try {
        const result = await loader(page);
        if (id !== version.current) return;
        setData((previous) =>
          page === 0
            ? result
            : {
                ...result,
                items: [...(previous?.items || []), ...result.items].filter(
                  (item, index, items) =>
                    items.findIndex((other) => other.uuid === item.uuid) === index,
                ),
              },
        );
      } catch (e) {
        if (id === version.current) setError(errorMessage(e));
      } finally {
        if (id === version.current) {
          busy.current = false;
          setLoading(false);
        }
      }
    },
    [loader],
  );
  useEffect(() => {
    const lifecycle = version;
    setData(null);
    if (automatic) void load();
    return () => {
      lifecycle.current++;
    };
  }, [load, automatic]);
  return {
    data,
    error,
    loading,
    reload: load,
    loadMore: () => {
      if (!busy.current && data && data.page + 1 < data.totalPages) void load(data.page + 1);
    },
  };
}
