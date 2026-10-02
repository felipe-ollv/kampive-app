export type ApiUser = {
  uuid: string;
  name: string;
  email: string;
  countryUuid: string | null;
  adventurerStyleUuid: string | null;
  photoUrl: string | null;
  bio: string | null;
  notificationsEnabled: boolean;
  emailVerified: boolean;
};
export type Continent = { uuid: string; name: string };
export type Country = {
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
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetcher(`${base}/api/v1${path}`, {
        method,
        credentials: 'include',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...(csrf ? { [csrf.headerName]: csrf.token } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (!response.ok) {
        const messages: Record<number, string> = {
          400: 'Confira os dados informados e os documentos aceitos.',
          401:
            path === '/auth/login'
              ? 'E-mail ou senha inválidos.'
              : 'Sua sessão expirou. Entre novamente.',
          403: 'A sessão de segurança expirou. Tente novamente.',
          404: 'Não encontramos este conteúdo.',
          409: 'Não foi possível cadastrar com esses dados. Confira-os ou tente entrar na sua conta.',
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
  function post<T>(path: string, body?: unknown): Promise<T> {
    const operation = pending
      .catch(() => undefined)
      .then(async () => {
        const csrf = await request<{ headerName: string; token: string }>('/auth/csrf');
        if (csrf.headerName !== 'X-CSRF-TOKEN' || typeof csrf.token !== 'string' || !csrf.token)
          throw new ApiError(0, 'Não foi possível preparar uma sessão segura.');
        return request<T>(path, 'POST', body, csrf);
      });
    pending = operation;
    return operation;
  }
  return {
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
