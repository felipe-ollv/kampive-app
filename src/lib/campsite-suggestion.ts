export type CampsiteSuggestion = { name: string; instagramUrl: string; googleMapsUrl: string };

export function validSuggestionUrl(value: string, kind: 'instagram' | 'maps') {
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.hash ||
      url.port ||
      /\s/.test(value)
    )
      return false;
    const host = url.hostname.toLowerCase();
    if (kind === 'instagram') {
      const profile = url.pathname.match(/^\/([A-Za-z0-9._]{1,30})\/?$/)?.[1];
      return (
        (host === 'instagram.com' || host === 'www.instagram.com') &&
        !!profile &&
        !['p', 'reel', 'reels', 'stories', 'explore', 'accounts', 'direct'].includes(
          profile.toLowerCase(),
        )
      );
    }
    return (
      (host === 'maps.app.goo.gl' && url.pathname.length > 1) ||
      (host === 'goo.gl' && url.pathname.startsWith('/maps/')) ||
      (['google.com', 'www.google.com', 'google.com.br', 'www.google.com.br'].includes(host) &&
        /^\/maps(?:\/|$)/.test(url.pathname)) ||
      (['maps.google.com', 'maps.google.com.br'].includes(host) &&
        (url.pathname.length > 1 || !!url.search))
    );
  } catch {
    return false;
  }
}

export function validateSuggestion(input: CampsiteSuggestion) {
  if (input.name.trim().length < 3 || input.name.length > 180)
    return 'Informe o nome do camping (de 3 a 180 caracteres).';
  if (input.instagramUrl.length > 500 || !validSuggestionUrl(input.instagramUrl, 'instagram'))
    return 'Informe a URL HTTPS do perfil do camping no Instagram.';
  if (input.googleMapsUrl.length > 2000 || !validSuggestionUrl(input.googleMapsUrl, 'maps'))
    return 'Informe um link HTTPS de localização do Google Maps.';
  return '';
}
