import type { CampsiteContent } from './api';
export function blankCampsite(): CampsiteContent {
  return {
    name: '',
    description: '',
    categoryUuid: '',
    cityUuid: null,
    cityName: '',
    streetAddress: '',
    addressNumber: '',
    addressComplement: '',
    neighborhood: '',
    postalCode: '',
    locationNotes: '',
    latitude: null,
    longitude: null,
    altitudeMeters: null,
    startingPricePerNight: null,
    currencyUuid: null,
    amenityUuids: [],
    settingUuids: [],
    contacts: [],
    photos: [],
  };
}
export function decimalInput(
  text: string,
  min: number,
  max: number,
  decimals: number,
): number | null {
  if (!text.trim()) return null;
  const normalized = text.trim().replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(normalized) || (normalized.split('.')[1]?.length || 0) > decimals)
    throw new Error('Confira o formato dos valores numéricos.');
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < min || value > max)
    throw new Error('Há um valor numérico fora do intervalo permitido.');
  return value;
}
export function validateCampsite(
  c: CampsiteContent,
  submit: boolean,
  localPhotos: string[] = [],
): string {
  if (c.name.trim().length < 3 || c.name.length > 180 || !c.categoryUuid)
    return 'Informe um nome de 3 a 180 caracteres e selecione a categoria.';
  if ((c.latitude === null) !== (c.longitude === null))
    return 'Informe latitude e longitude juntas.';
  if ((c.startingPricePerNight === null) !== (c.currencyUuid === null))
    return 'Informe a diária e a moeda juntas, ou deixe ambas vazias.';
  if (c.photos.length > 9 || new Set(c.photos.map((p) => p.url)).size !== c.photos.length)
    return 'Adicione no máximo 9 fotos diferentes.';
  for (const p of c.photos) {
    if (
      localPhotos.includes(p.url) ||
      /^\/api\/v1\/campsite-photos\/[0-9a-f-]{36}\.jpg$/.test(p.url)
    )
      continue;
    try {
      const u = new URL(p.url);
      if (u.protocol !== 'https:' || u.username || u.password || u.hash || p.url.length > 2048)
        return 'As fotos precisam de links HTTPS válidos, sem credenciais ou fragmentos.';
    } catch {
      return 'Confira os links das fotos.';
    }
  }
  if (
    submit &&
    ((!c.cityUuid && !c.cityName?.trim()) ||
      !c.streetAddress.trim() ||
      !c.description.trim() ||
      !c.contacts.length ||
      !c.photos.length)
  )
    return 'Para enviar para análise, preencha cidade, endereço, descrição, um contato e pelo menos uma foto.';
  return '';
}
