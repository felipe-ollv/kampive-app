import { useCallback, useEffect, useRef, useState } from 'react';
import { api, errorMessage, type CountryPage } from '../lib/api';
export function useCountries(continentUuid?: string, query = '') {
  const [data, setData] = useState<CountryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const version = useRef(0);
  const busy = useRef(false);
  const load = useCallback(
    async (page = 0) => {
      const id = ++version.current;
      busy.current = true;
      setLoading(true);
      setError('');
      try {
        const result = await api.countries({ continentUuid, query, page, size: 20 });
        if (id !== version.current) return;
        setData((previous) =>
          page === 0 ? result : { ...result, items: [...(previous?.items || []), ...result.items] },
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
    [continentUuid, query],
  );
  useEffect(() => {
    const lifecycle = version;
    setData(null);
    void load();
    return () => {
      lifecycle.current++;
    };
  }, [load]);
  return {
    data,
    loading,
    error,
    reload: () => load(),
    loadMore: () => {
      if (!busy.current && data && data.page + 1 < data.totalPages) void load(data.page + 1);
    },
  };
}
