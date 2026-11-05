import type { MyRequest } from './api';
export const requestTypeLabel = {
  suggestion: 'Indicação de camping',
  claim: 'Vínculo de proprietário',
};
export const requestStatusLabel: Record<MyRequest['status'], string> = {
  pending_review: 'Em análise',
  accepted: 'Indicação aceita',
  approved: 'Vínculo aprovado',
  rejected: 'Não aprovada',
};
export function requestDate(value: string, locale = 'pt-BR') {
  return new Date(value).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
