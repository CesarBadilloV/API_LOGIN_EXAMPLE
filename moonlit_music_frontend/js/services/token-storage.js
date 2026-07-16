import { CONFIG } from "../config.js";

/**
 * TokenStorage
 * Owns *where* and *how* the JWT is persisted. Everything else in the
 * app should only ever talk to AuthService — if we ever swap localStorage
 * for an httpOnly cookie issued by the backend, this is the only file
 * that would change.
 */
export class TokenStorage {
  constructor(storage = window.localStorage) {
    this._storage = storage;
  }

  save(token, username) {
    const expiresAt = Date.now() + CONFIG.TOKEN_TTL_MS;
    this._storage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
    this._storage.setItem(CONFIG.STORAGE_KEYS.TOKEN_EXPIRY, String(expiresAt));
    if (username) this._storage.setItem(CONFIG.STORAGE_KEYS.USERNAME, username);
  }

  getToken() {
    return this._storage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
  }

  getUsername() {
    return this._storage.getItem(CONFIG.STORAGE_KEYS.USERNAME);
  }

  /** True if a token exists and hasn't passed its locally-tracked expiry. */
  hasValidToken() {
    const token = this.getToken();
    const expiryRaw = this._storage.getItem(CONFIG.STORAGE_KEYS.TOKEN_EXPIRY);
    if (!token || !expiryRaw) return false;
    return Date.now() < Number(expiryRaw);
  }

  clear() {
    this._storage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    this._storage.removeItem(CONFIG.STORAGE_KEYS.TOKEN_EXPIRY);
    this._storage.removeItem(CONFIG.STORAGE_KEYS.USERNAME);
  }
}
