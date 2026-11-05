import type { ProfileInput } from './profile';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api, ApiError, errorMessage, onSessionExpired, type ApiUser } from './api';

type Auth = {
  user: ApiUser | null;
  loading: boolean;
  busy: boolean;
  error: string;
  refresh: () => Promise<void>;
  clearSession: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: ProfileInput) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
};
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const lock = useRef(false);
  const refresh = useCallback(async () => {
    if (lock.current) return;
    const current = ++generation.current;
    setLoading(true);
    try {
      const profile = await api.me();
      if (current === generation.current) {
        setUser(profile);
        setError('');
      }
    } catch (e) {
      if (current !== generation.current) return;
      if (e instanceof ApiError && e.status === 401) {
        setUser(null);
        setError('');
      } else setError(errorMessage(e));
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const lifecycle = generation;
    // A new app session starts at login, even when the API cookie still exists.
    return () => {
      lifecycle.current++;
    };
  }, []);
  const clearSession = useCallback(() => {
    generation.current++;
    setUser(null);
    setError('');
    setLoading(false);
  }, []);
  useEffect(() => onSessionExpired(clearSession), [clearSession]);
  async function login(email: string, password: string) {
    if (lock.current) return;
    lock.current = true;
    const current = ++generation.current;
    setBusy(true);
    setError('');
    try {
      const account = await api.login(email, password);
      if (current === generation.current) setUser(account);
    } finally {
      lock.current = false;
      setBusy(false);
      setLoading(false);
    }
  }
  async function logout() {
    if (lock.current) return;
    lock.current = true;
    generation.current++;
    setBusy(true);
    try {
      try {
        await api.logout();
      } catch (e) {
        if (!(e instanceof ApiError && e.status === 401)) throw e;
      }
      setUser(null);
      setError('');
    } finally {
      lock.current = false;
      setBusy(false);
      setLoading(false);
    }
  }
  async function updateProfile(input: ProfileInput) {
    if (lock.current) throw new Error('Aguarde a operação atual.');
    lock.current = true;
    generation.current++;
    setBusy(true);
    try {
      setUser(await api.updateProfile(input));
      setError('');
    } finally {
      lock.current = false;
      setBusy(false);
      setLoading(false);
    }
  }
  async function deleteAccount(password: string) {
    if (lock.current) throw new Error('Aguarde a operação atual.');
    lock.current = true;
    generation.current++;
    setBusy(true);
    try {
      await api.deleteAccount(password);
      setUser(null);
      setError('');
    } finally {
      lock.current = false;
      setBusy(false);
      setLoading(false);
    }
  }
  return (
    <Context.Provider
      value={{
        user,
        loading,
        busy,
        error,
        refresh,
        clearSession,
        login,
        logout,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const auth = useContext(Context);
  if (!auth) throw new Error('AuthProvider ausente');
  return auth;
}
