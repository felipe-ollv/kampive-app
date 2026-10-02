import { createApiClient } from './client';
export * from './client';
// Public build-time configuration; never put credentials in EXPO_PUBLIC_* variables.
export const api = createApiClient(process.env.EXPO_PUBLIC_API_URL || 'https://localhost:8443');
