import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { initialNotifications, type AppNotification } from '../data/notifications';

export type Review = {
  id: string;
  campsiteId: string;
  rating: number;
  text: string;
  photos: string[];
  date: string;
};
export type Space = {
  id: string;
  name: string;
  category: string;
  address: string;
  instagram: string;
  maps: string;
  whatsapp: string;
  website?: string;
  price?: number;
  amenities: string[];
  photos: string[];
};
export type Profile = { name: string; country: string; outdoor: string; photo?: string };
type Data = {
  saved: string[];
  reviews: Review[];
  spaces: Space[];
  profile: Profile;
  notifications: boolean;
  inbox: AppNotification[];
};
const initial: Data = {
  saved: [],
  reviews: [],
  spaces: [],
  profile: { name: 'Explorador', country: 'Brasil', outdoor: 'Selvagem' },
  notifications: false,
  inbox: initialNotifications,
};
type Store = Data & {
  ready: boolean;
  storageError: boolean;
  toggleSaved: (id: string) => void;
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  addSpace: (space: Omit<Space, 'id'>) => void;
  setProfile: (profile: Profile) => void;
  setNotifications: (value: boolean) => void;
  setNotificationRead: (id: string, read: boolean) => void;
  markAllNotificationsRead: () => void;
  signedIn: boolean;
  setSignedIn: (value: boolean) => void;
};
const Context = createContext<Store | null>(null);
const key = 'kampive.layout.v1';
export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initial);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            Array.isArray(parsed.saved) &&
            Array.isArray(parsed.reviews) &&
            Array.isArray(parsed.spaces) &&
            parsed.profile?.name
          )
            setData({ ...initial, ...parsed });
        }
      })
      .catch(() => setStorageError(true))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready)
      writes.current = writes.current
        .then(() => AsyncStorage.setItem(key, JSON.stringify(data)))
        .catch(() => setStorageError(true));
  }, [data, ready]);
  const value: Store = {
    ...data,
    ready,
    storageError,
    signedIn,
    setSignedIn,
    toggleSaved: (id) =>
      setData((d) => ({
        ...d,
        saved: d.saved.includes(id) ? d.saved.filter((x) => x !== id) : [...d.saved, id],
      })),
    addReview: (review) =>
      setData((d) => ({
        ...d,
        reviews: [
          {
            ...review,
            photos: review.photos.slice(0, 3),
            id: `${Date.now()}`,
            date: new Date().toISOString(),
          },
          ...d.reviews,
        ],
      })),
    addSpace: (space) =>
      setData((d) => ({ ...d, spaces: [{ ...space, id: `${Date.now()}` }, ...d.spaces] })),
    setProfile: (profile) => setData((d) => ({ ...d, profile })),
    setNotifications: (notifications) => setData((d) => ({ ...d, notifications })),
    setNotificationRead: (id, read) =>
      setData((d) => ({
        ...d,
        inbox: d.inbox.map((item) => (item.id === id ? { ...item, read } : item)),
      })),
    markAllNotificationsRead: () =>
      setData((d) => ({ ...d, inbox: d.inbox.map((item) => ({ ...item, read: true })) })),
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error('StoreProvider ausente');
  return store;
}
