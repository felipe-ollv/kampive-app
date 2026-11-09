// Public build-time configuration shared by requests and relative photo URLs.
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL
).replace(/\/$/, '');
