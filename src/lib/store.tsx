import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api, ApiError, errorMessage } from './api';
import { useAuth } from './auth';

type Store = {
  saved: string[];
  savedLoading: boolean;
  savedError: string;
  saving: boolean;
  refreshSaved: () => Promise<void>;
  toggleSaved: (id: string) => Promise<void>;
  unreadCount: number;
  refreshUnread: () => Promise<void>;
};
const Context = createContext<Store | null>(null);

// A new account gets a new provider immediately: no local data or previous account's requests leak.
export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <AccountStore key={user?.uuid || 'guest'} actor={user?.uuid}>
      {children}
    </AccountStore>
  );
}
function AccountStore({ children, actor }: { children: ReactNode; actor?: string }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [savedLoading, setSavedLoading] = useState(!!actor);
  const [savedError, setSavedError] = useState('');
  const [saving, setSaving] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const alive = useRef(true);
  const version = useRef(0);
  const unreadVersion = useRef(0);
  const lock = useRef(false);
  const refreshSaved = useCallback(async () => {
    if (!actor || lock.current) return;
    const current = ++version.current;
    setSavedLoading(true);
    setSavedError('');
    try {
      const result = await api.favorites();
      if (alive.current && current === version.current) setSaved(result);
    } catch (e) {
      if (alive.current && current === version.current) setSavedError(errorMessage(e));
    } finally {
      if (alive.current && current === version.current) setSavedLoading(false);
    }
  }, [actor]);
  const refreshUnread = useCallback(async () => {
    if (!actor) return;
    const current = ++unreadVersion.current;
    try {
      const result = await api.notifications(0, 'all', 1);
      if (alive.current && current === unreadVersion.current) setUnreadCount(result.unreadCount);
    } catch {
      // Unknown count is not presented as a stale badge. The inbox exposes its own retryable error.
      if (alive.current && current === unreadVersion.current) setUnreadCount(0);
    }
  }, [actor]);
  useEffect(() => {
    const lifecycle = version;
    const unreadLifecycle = unreadVersion;
    alive.current = true;
    void refreshSaved();
    void refreshUnread();
    return () => {
      alive.current = false;
      lifecycle.current++;
      unreadLifecycle.current++;
    };
  }, [refreshSaved, refreshUnread]);
  async function toggleSaved(id: string) {
    if (!actor) throw new ApiError(401, 'Entre na sua conta para salvar campings.');
    if (lock.current || savedLoading) return;
    if (savedError) throw new ApiError(0, 'Atualize seus favoritos antes de alterar a lista.');
    lock.current = true;
    version.current++;
    setSaving(true);
    const removing = saved.includes(id);
    try {
      if (removing) await api.removeFavorite(id);
      else await api.saveFavorite(id);
      if (alive.current)
        setSaved((previous) =>
          removing
            ? previous.filter((item) => item !== id)
            : [id, ...previous.filter((item) => item !== id)],
        );
    } finally {
      lock.current = false;
      if (alive.current) setSaving(false);
    }
  }
  return (
    <Context.Provider
      value={{
        saved,
        savedLoading,
        savedError,
        saving,
        refreshSaved,
        toggleSaved,
        unreadCount,
        refreshUnread,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error('StoreProvider ausente');
  return store;
}
