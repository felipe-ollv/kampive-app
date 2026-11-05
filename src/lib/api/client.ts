import type { ProfileInput, TravelStyle } from '../profile';
import type { CampsiteSuggestion } from '../campsite-suggestion';
import type {
  CampsiteContent,
  CampsiteDetail,
  CampsiteOptions,
  CampsiteQuery,
  CampsiteSummary,
  City,
  PageResult,
} from './campsite-types';
export type * from './campsite-types';
export type ApiUser = {
  uuid: string;
  name: string;
  email: string;
  countryUuid: string | null;
  cityUuid: string | null;
  cityName: string | null;
  divisionName: string | null;
  divisionUuid: string | null;
  countryName: string | null;
  travelStyles: TravelStyle[];
  adventurerStyleUuid: string | null;
  photoUrl: string | null;
  bio: string | null;
  notificationsEnabled: boolean;
  emailVerified: boolean;
};
export type RequestKind = 'suggestion' | 'claim';
export type MyRequest = {
  uuid: string;
  type: RequestKind;
  name: string;
  status: 'pending_review' | 'accepted' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt: string | null;
  publishedCampsiteUuid: string | null;
};
export type MyRequestDetail = {
  summary: MyRequest;
  instagramUrl: string | null;
  googleMapsUrl: string | null;
  contact: string | null;
  evidence: string | null;
  response: string | null;
};
export type AppNotification = {
  uuid: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  requestType?: RequestKind | null;
  requestUuid?: string | null;
};
export type NotificationPage = PageResult<AppNotification> & { unreadCount: number };
export type ReviewInput = {
  rating: number;
  text: string;
  campingMethodUuid: string | null;
  highlightUuids: string[];
  photos: string[];
};
export type ReviewItem = {
  uuid: string;
  campsiteUuid: string;
  campsiteName: string;
  authorName: string;
  rating: number;
  text: string;
  campingMethod: string | null;
  status: 'pending' | 'published' | 'hidden';
  date: string;
  highlights: string[];
  photos: string[];
};
export type ReviewOptions = {
  highlights: import('./campsite-types').CatalogOption[];
  campingMethods: import('./campsite-types').CatalogOption[];
};
export type Continent = { uuid: string; name: string };
export type Country = {
  currencyCode?: string | null;
  uuid: string;
  name: string;
  isoCode: string;
  imageUrl: string | null;
  continentUuid: string;
  continentName: string;
  campsiteCount: number;
};
export type CountryPage = {
  items: Country[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
export type LegalDocument = {
  uuid: string;
  type: string;
  version: string;
  contentUrl: string;
  publishedAt: string;
};
export type Registration = {
  name: string;
  email: string;
  password: string;
  countryUuid?: string;
  acceptedDocumentUuids: string[];
};
const expiredSessionListeners = new Set<() => void>();
export function onSessionExpired(listener: () => void) {
  expiredSessionListeners.add(listener);
  return () => {
    expiredSessionListeners.delete(listener);
  };
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
export function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Não foi possível concluir. Tente novamente.';
}
export function createApiClient(baseUrl: string, fetcher: typeof fetch = fetch) {
  if (!/^https:\/\//.test(baseUrl)) throw new Error('A API deve usar HTTPS.');
  const base = baseUrl.replace(/\/$/, '');
  async function request<T>(
    path: string,
    method = 'GET',
    body?: unknown,
    csrf?: { headerName: string; token: string },
  ): Promise<T> {
    const multipart = typeof FormData !== 'undefined' && body instanceof FormData;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), multipart ? 120000 : 15000);
    try {
      const response = await fetcher(`${base}/api/v1${path}`, {
        method,
        credentials: 'include',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(body === undefined || multipart ? {} : { 'Content-Type': 'application/json' }),
          ...(csrf ? { [csrf.headerName]: csrf.token } : {}),
        },
        ...(body === undefined
          ? {}
          : { body: multipart ? (body as FormData) : JSON.stringify(body) }),
      });
      if (!response.ok) {
        if (response.status === 401 && path !== '/auth/login') {
          expiredSessionListeners.forEach((listener) => listener());
        }
        let verificationRequired = false;
        if (response.status === 403) {
          try {
            verificationRequired = (await response.json()).code === 'EMAIL_VERIFICATION_REQUIRED';
          } catch {
            /* CSRF can return an empty body. */
          }
        }
        const messages: Record<number, string> = {
          400: 'Confira os dados informados e as opções selecionadas.',
          401:
            path === '/users/me' && method === 'DELETE'
              ? 'Não foi possível excluir. Confira sua senha e se a sessão ainda está ativa.'
              : path === '/auth/login'
                ? 'E-mail ou senha inválidos.'
                : 'Sua sessão expirou. Entre novamente.',
          403: verificationRequired
            ? 'Confirme seu e-mail para continuar. Acesse a verificação pelo aviso no topo do app.'
            : 'A sessão de segurança expirou. Tente novamente.',
          404: 'Não encontramos este conteúdo.',
          409: path.endsWith('/reviews')
            ? 'Você já enviou uma avaliação para este camping. Confira suas avaliações no perfil.'
            : path.startsWith('/campsites')
              ? 'O status deste camping mudou. Atualize a tela antes de tentar novamente.'
              : 'Não foi possível cadastrar com esses dados. Confira-os ou tente entrar na sua conta.',
          413: 'As fotos ultrapassam o limite de envio. Escolha arquivos de até 10 MB.',
          429: 'Muitas tentativas. Aguarde um minuto antes de tentar novamente.',
        };
        throw new ApiError(
          response.status,
          messages[response.status] || 'O serviço está indisponível. Tente novamente.',
        );
      }
      return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, 'Não foi possível conectar. Verifique sua conexão e tente novamente.');
    } finally {
      clearTimeout(timer);
    }
  }
  // A fresh CSRF token belongs to the network-managed cookie session. Never persist either in JS storage.
  // Serialize mutations to avoid login rotation racing another request. Never retry a POST automatically.
  let pending: Promise<unknown> = Promise.resolve();
  function post<T>(path: string, body?: unknown, method = 'POST'): Promise<T> {
    const operation = pending
      .catch(() => undefined)
      .then(async () => {
        const csrf = await request<{ headerName: string; token: string }>('/auth/csrf');
        if (csrf.headerName !== 'X-CSRF-TOKEN' || typeof csrf.token !== 'string' || !csrf.token)
          throw new ApiError(0, 'Não foi possível preparar uma sessão segura.');
        return request<T>(path, method, body, csrf);
      });
    pending = operation;
    return operation;
  }
  function queryString(options: object) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options))
      if (value !== undefined && value !== '') params.set(key, String(value));
    return params.toString();
  }
  return {
    verificationStatus: () =>
      request<{
        verified: boolean;
        contributionsAllowed: boolean;
        requiredAt: string | null;
        deliveryAvailable: boolean;
      }>('/auth/email-verification'),
    resendVerification: () => post<void>('/auth/email-verification/resend'),
    confirmEmail: (token: string) => post<void>('/auth/email-verification/confirm', { token }),
    favorites: () => request<string[]>('/users/me/favorites'),
    saveFavorite: (uuid: string) =>
      post<void>(`/users/me/favorites/${encodeURIComponent(uuid)}`, undefined, 'PUT'),
    removeFavorite: (uuid: string) =>
      post<void>(`/users/me/favorites/${encodeURIComponent(uuid)}`, undefined, 'DELETE'),
    myRequests: (page = 0) =>
      request<PageResult<MyRequest>>(`/users/me/requests?page=${page}&size=20`),
    myRequest: (type: RequestKind, uuid: string) =>
      request<MyRequestDetail>(
        `/users/me/requests/${encodeURIComponent(type)}/${encodeURIComponent(uuid)}`,
      ),
    notifications: (page = 0, filter: 'all' | 'read' | 'unread' = 'all', size = 20) =>
      request<NotificationPage>(`/users/me/notifications?${queryString({ page, size, filter })}`),
    setNotificationRead: (uuid: string, read: boolean) =>
      post<void>(`/users/me/notifications/${encodeURIComponent(uuid)}`, { read }, 'PUT'),
    readAllNotifications: () => post<void>('/users/me/notifications/read-all'),
    reviewOptions: () => request<ReviewOptions>('/review-options'),
    reviews: (uuid: string, page = 0) =>
      request<PageResult<ReviewItem>>(
        `/campsites/${encodeURIComponent(uuid)}/reviews?page=${page}&size=10`,
      ),
    myReviews: (page = 0) =>
      request<PageResult<ReviewItem>>(`/users/me/reviews?page=${page}&size=10`),
    myReview: (uuid: string) =>
      request<{ uuid: string; campsiteUuid: string; campsiteName: string; input: ReviewInput }>(
        `/users/me/reviews/${encodeURIComponent(uuid)}`,
      ),
    updateReview: (uuid: string, input: ReviewInput) =>
      post<{ uuid: string; status: string }>(
        `/users/me/reviews/${encodeURIComponent(uuid)}`,
        input,
        'PUT',
      ),
    deleteReview: (uuid: string) =>
      post<void>(`/users/me/reviews/${encodeURIComponent(uuid)}`, undefined, 'DELETE'),
    createReview: (uuid: string, input: ReviewInput) =>
      post<{ uuid: string; status: 'pending' }>(
        `/campsites/${encodeURIComponent(uuid)}/reviews`,
        input,
      ),
    campsiteOptions: () => request<CampsiteOptions>('/campsite-options'),
    cities: (
      options: { countryUuid?: string; query?: string; page?: number; size?: number } = {},
    ) => request<PageResult<City>>(`/cities?${queryString(options)}`),
    campsites: (options: CampsiteQuery = {}) =>
      request<PageResult<CampsiteSummary>>(`/campsites?${queryString(options)}`),
    campsite: (uuid: string) => request<CampsiteDetail>(`/campsites/${encodeURIComponent(uuid)}`),
    myCampsites: (page = 0) =>
      request<PageResult<CampsiteSummary>>(`/users/me/campsites?page=${page}&size=20`),
    ownedCampsite: (uuid: string) =>
      request<CampsiteDetail>(`/users/me/campsites/${encodeURIComponent(uuid)}`),
    registerCampsite: (content: CampsiteContent | FormData) =>
      post<{ uuid: string; status: 'pending_review' }>('/campsite-registrations', content),
    suggestCampsite: (input: CampsiteSuggestion) =>
      post<{ uuid: string; status: 'pending_review' }>('/campsite-suggestions', input),
    claimCampsite: (uuid: string, input: { contact: string; evidence: string }) =>
      post<{ uuid: string; status: 'pending_review' }>(
        `/campsites/${encodeURIComponent(uuid)}/claims`,
        input,
      ),
    updateCampsite: (uuid: string, content: CampsiteContent | FormData) =>
      post<CampsiteDetail>(`/campsites/${encodeURIComponent(uuid)}`, content, 'PUT'),
    submitCampsite: (uuid: string) =>
      post<CampsiteDetail>(`/campsites/${encodeURIComponent(uuid)}/submit`),
    archiveCampsite: (uuid: string) =>
      post<CampsiteDetail>(`/campsites/${encodeURIComponent(uuid)}/archive`),
    updateProfile: (input: ProfileInput) => post<ApiUser>('/users/me', input, 'PUT'),
    deleteAccount: (password: string) =>
      post<void>('/users/me', { password, confirmation: 'EXCLUIR' }, 'DELETE'),
    requestPasswordRecovery: (email: string) =>
      post<void>('/auth/password-recovery', { email: email.trim() }),
    resetPassword: (token: string, password: string) =>
      post<void>('/auth/password-reset', { token, password }),
    me: () => request<ApiUser>('/users/me'),
    login: (email: string, password: string) =>
      post<ApiUser>('/auth/login', { email: email.trim(), password }),
    register: (body: Registration) => post<ApiUser>('/auth/register', body),
    logout: () => post<void>('/auth/logout'),
    documents: () => request<LegalDocument[]>('/auth/legal-documents'),
    continents: () => request<Continent[]>('/continents'),
    country: (uuid: string) => request<Country>(`/countries/${encodeURIComponent(uuid)}`),
    countries: (
      options: { continentUuid?: string; query?: string; page?: number; size?: number } = {},
    ) => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(options))
        if (value !== undefined && value !== '') params.set(key, String(value));
      return request<CountryPage>(`/countries?${params}`);
    },
  };
}
