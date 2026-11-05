import type { CampsiteStatus, CampsiteSummary } from './api';
export const campsiteStatus: Record<CampsiteStatus, string> = {
  draft: 'Rascunho',
  pending_review: 'Em análise',
  published: 'Publicado',
  rejected: 'Requer ajustes',
  archived: 'Arquivado',
};
export function campsitePrice(c: CampsiteSummary, locale = 'pt-BR') {
  if (c.startingPricePerNight === null || !c.currencyCode) return 'Preço não informado';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: c.currencyCode }).format(
      c.startingPricePerNight,
    );
  } catch {
    return `${c.currencyCode} ${c.startingPricePerNight.toFixed(2)}`;
  }
}
export function httpsPhoto(url: string | null | undefined): string | null {
  try {
    const base = (process.env.EXPO_PUBLIC_API_URL || 'https://localhost:8443').replace(/\/$/, '');
    const source = /^\/api\/v1\/campsite-photos\/[0-9a-f-]{36}\.jpg$/.test(url || '')
      ? base + url
      : url;
    const parsed = new URL(source || '');
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password
      ? parsed.href
      : null;
  } catch {
    return null;
  }
}
