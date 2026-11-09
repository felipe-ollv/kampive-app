import { createApiClient } from './client';
import { API_BASE_URL } from './config';
export * from './client';
// Public build-time configuration; never put credentials in EXPO_PUBLIC_* variables.
export const api = createApiClient(API_BASE_URL);
