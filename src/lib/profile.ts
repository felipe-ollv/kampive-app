export const travelStyles = [
  { value: 'tent', label: 'Barraca' },
  { value: 'motorhome', label: 'Motorhome' },
  { value: 'trailer', label: 'Trailer' },
  { value: 'chalet', label: 'Chalé' },
] as const;
export type TravelStyle = (typeof travelStyles)[number]['value'];
export type ProfileInput = {
  name: string;
  countryUuid: string | null;
  cityUuid: string | null;
  bio: string;
  travelStyles: TravelStyle[];
  photoUrl: string | null;
};
export function hasProfileChanges(input: ProfileInput, saved: ProfileInput): boolean {
  return (
    input.name.trim() !== saved.name.trim() ||
    input.bio.trim() !== saved.bio.trim() ||
    input.countryUuid !== saved.countryUuid ||
    input.cityUuid !== saved.cityUuid ||
    input.photoUrl !== saved.photoUrl ||
    input.travelStyles.length !== saved.travelStyles.length ||
    input.travelStyles.some((style) => !saved.travelStyles.includes(style))
  );
}
export function validateProfile(input: ProfileInput) {
  if (input.name.trim().length < 3 || input.name.trim().length > 150)
    return 'Informe um nome entre 3 e 150 caracteres.';
  if (input.bio.length > 500) return 'Sua apresentação deve ter até 500 caracteres.';
  if (input.cityUuid && !input.countryUuid) return 'Selecione o país da cidade.';
  if (
    input.travelStyles.length > 4 ||
    new Set(input.travelStyles).size !== input.travelStyles.length ||
    input.travelStyles.some((value) => !travelStyles.some((style) => style.value === value))
  )
    return 'Confira os estilos de viagem selecionados.';
  return '';
}
export function profilePhoto(uri: string | null) {
  return uri &&
    (uri.startsWith('https://') ||
      uri.startsWith('data:image/jpeg;base64,') ||
      uri.startsWith('data:image/png;base64,'))
    ? uri
    : null;
}
