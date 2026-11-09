import type { CampsiteStatus, CampsiteSummary } from './api';
import { API_BASE_URL } from './api/config';
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
    const source = /^\/api\/v1\/campsite-photos\/[0-9a-f-]{36}\.jpg$/.test(url || '')
      ? API_BASE_URL + url
      : url;
    const parsed = new URL(source || '');
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password
      ? parsed.href
      : null;
  } catch {
    return null;
  }
}
