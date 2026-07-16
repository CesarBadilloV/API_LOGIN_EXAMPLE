/**
 * config.js
 * Single source of truth for environment-level constants.
 * Nothing else in the app should hardcode URLs, keys or timings.
 */
export const CONFIG = Object.freeze({
  API_BASE_URL: "http://127.0.0.1:8000",
  REQUEST_TIMEOUT_MS: 10000,

  // Matches the backend's 30 minute JWT expiration (see README "Seguridad Implementada").
  TOKEN_TTL_MS: 30 * 60 * 1000,

  STORAGE_KEYS: {
    TOKEN: "moonlit.access_token",
    TOKEN_EXPIRY: "moonlit.token_expiry",
    USERNAME: "moonlit.username",
  },
});
