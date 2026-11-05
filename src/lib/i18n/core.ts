export const languages = ['pt', 'en', 'fr', 'es'] as const;
export type Language = (typeof languages)[number];
export type LanguagePreference = Language | 'auto';
export const languageNames: Record<Language, string> = {
  pt: 'Português',
  en: 'English',
  fr: 'Français',
  es: 'Español',
};
export const languageLocales: Record<Language, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  fr: 'fr-FR',
  es: 'es-ES',
};
export function isLanguage(value: unknown): value is Language {
  return languages.some((language) => language === value);
}
export function isLanguagePreference(value: unknown): value is LanguagePreference {
  return value === 'auto' || isLanguage(value);
}
// A country can have several languages. For these countries, prefer a matching
// device language; otherwise use the first supported language listed here.
const countryLanguages: Record<string, readonly Language[]> = {};
for (const code of 'BR PT AO MZ CV GW ST TL'.split(' ')) countryLanguages[code] = ['pt'];
for (const code of 'ES MX AR BO CL CO CR CU DO EC SV GQ GT HN NI PA PY PE PR UY VE'.split(' '))
  countryLanguages[code] = ['es'];
for (const code of 'FR MC BJ BF BI CD CG CI DJ GA GN HT ML NE SN TG'.split(' '))
  countryLanguages[code] = ['fr'];
for (const code of 'US GB AU NZ IE NG GH LR SL GM ZM ZW BW NA ZA KE UG TZ IN PK PH SG JM TT BB BS BZ GY AG DM GD KN LC VC'.split(
  ' ',
))
  countryLanguages[code] = ['en'];
for (const code of 'CA CM RW SC MU VU'.split(' ')) countryLanguages[code] = ['en', 'fr'];
for (const code of 'BE CH LU'.split(' ')) countryLanguages[code] = ['fr', 'en'];
export function deviceLanguage(tags: readonly string[]): Language {
  for (const tag of tags) {
    const code = tag.toLowerCase().split(/[-_]/)[0];
    if (isLanguage(code)) return code;
  }
  return 'en';
}
export function resolveLanguage(
  preference: LanguagePreference,
  countryCode: string | null | undefined,
  deviceTags: readonly string[],
): Language {
  if (preference !== 'auto') return preference;
  const country = countryCode?.trim().toUpperCase();
  if (!country) return deviceLanguage(deviceTags);
  const candidates = countryLanguages[country];
  // Countries with no matching supported language use English.
  if (!candidates) return 'en';
  for (const tag of deviceTags) {
    const code = tag.toLowerCase().split(/[-_]/)[0];
    if (isLanguage(code) && candidates.includes(code)) return code;
  }
  return candidates[0];
}
export function preferenceStorageKey(userUuid: string): string {
  return `kampive:language:${userUuid}`;
}
export type Messages = Record<string, { en: string; es: string; fr: string }>;
export function translate(
  messages: Messages,
  language: Language,
  key: string,
  values: Record<string, string | number> = {},
): string {
  const message = language === 'pt' ? key : (messages[key]?.[language] ?? key);
  return message.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match,
  );
}
