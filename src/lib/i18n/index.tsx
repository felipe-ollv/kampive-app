import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocales } from 'expo-localization';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../api';
import { useAuth } from '../auth';
import messages from './messages.json';
import {
  isLanguagePreference,
  languageLocales,
  preferenceStorageKey,
  resolveLanguage,
  translate,
  type LanguagePreference,
} from './core';
export { languages, languageNames } from './core';
export type { Language, LanguagePreference } from './core';
const defaultLanguage = 'pt';
const defaultValue = {
  language: defaultLanguage as import('./core').Language,
  locale: languageLocales[defaultLanguage],
  preference: 'auto' as LanguagePreference,
  ready: false,
  saving: false,
  countryError: false,
  t: (key: string, values?: Record<string, string | number>) =>
    translate(messages, defaultLanguage, key, values),
  setPreference: async (_preference: LanguagePreference): Promise<void> => {
    throw new Error('LanguageProvider ausente');
  },
};
const Context = createContext(defaultValue);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const locales = useLocales();
  const uuid = user?.uuid;
  const countryUuid = user?.countryUuid;
  const [stored, setStored] = useState<{ uuid: string; preference: LanguagePreference } | null>(
    null,
  );
  const [country, setCountry] = useState<{ uuid: string; isoCode: string } | null>(null);
  const [countryError, setCountryError] = useState(false);
  const [saving, setSaving] = useState(false);
  const pendingWrite = useRef(false);
  const identity = useRef(uuid);
  identity.current = uuid;
  useEffect(() => {
    let active = true;
    if (!uuid) return;
    AsyncStorage.getItem(preferenceStorageKey(uuid))
      .then((value) => {
        if (active) setStored({ uuid, preference: isLanguagePreference(value) ? value : 'auto' });
      })
      .catch(() => {
        if (active) setStored({ uuid, preference: 'auto' });
      });
    return () => {
      active = false;
    };
  }, [uuid]);
  useEffect(() => {
    let active = true;
    setCountryError(false);
    if (!countryUuid) return;
    api
      .country(countryUuid)
      .then((value) => {
        if (active) setCountry({ uuid: countryUuid, isoCode: value.isoCode });
      })
      .catch(() => {
        if (active) setCountryError(true);
      });
    return () => {
      active = false;
    };
  }, [countryUuid]);
  const preference = stored && stored.uuid === uuid ? stored.preference : 'auto';
  const language = resolveLanguage(
    preference,
    country && country.uuid === countryUuid ? country.isoCode : undefined,
    locales.map((locale) => locale.languageTag),
  );
  const ready = !uuid || stored?.uuid === uuid;
  const setPreference = useCallback(
    async (value: LanguagePreference) => {
      if (!uuid || !ready || pendingWrite.current) return;
      if (!isLanguagePreference(value)) throw new Error('Invalid language');
      pendingWrite.current = true;
      setSaving(true);
      try {
        await AsyncStorage.setItem(preferenceStorageKey(uuid), value);
        if (identity.current === uuid) setStored({ uuid, preference: value });
      } finally {
        pendingWrite.current = false;
        setSaving(false);
      }
    },
    [uuid, ready],
  );
  const value = useMemo(
    () => ({
      language,
      locale: languageLocales[language],
      preference,
      ready,
      saving,
      countryError,
      setPreference,
      t: (key: string, values?: Record<string, string | number>) =>
        translate(messages, language, key, values),
    }),
    [language, preference, ready, saving, countryError, setPreference],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useTranslation() {
  return useContext(Context);
}
