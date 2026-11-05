import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../lib/api';
// The loader must be memoized by the caller. Ignore responses from obsolete routes/filters.
export function useApiResource<T>(loader: () => Promise<T>, autoLoad = true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const id = ++generation.current;
    setLoading(true);
    setError('');
    try {
      const result = await loader();
      if (id === generation.current) setData(result);
    } catch (e) {
      if (id === generation.current) setError(errorMessage(e));
    } finally {
      if (id === generation.current) setLoading(false);
    }
  }, [loader]);
  useEffect(() => {
    const lifecycle = generation;
    setData(null);
    if (autoLoad) void reload();
    return () => {
      lifecycle.current++;
    };
  }, [reload, autoLoad]);
  return { data, error, loading, reload };
}
