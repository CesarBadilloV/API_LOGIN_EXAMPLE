import { HttpClient } from "./http-client.js";
import { TokenStorage } from "./token-storage.js";
import { ApiError } from "./api-error.js";

/**
 * AuthService
 * The only place in the app that knows the shape of the auth endpoints
 * (POST /register, POST /token, GET /users/me). UI code calls these
 * methods and only ever deals with plain JS values / ApiError — never
 * with fetch, headers or storage details.
 */
export class AuthService {
  /**
   * @param {HttpClient} httpClient
   * @param {TokenStorage} tokenStorage
   */
  constructor(httpClient = new HttpClient(), tokenStorage = new TokenStorage()) {
    this._http = httpClient;
    this._tokens = tokenStorage;
  }

  /**
   * POST /register
   * @returns {Promise<{username:string,email:string,disabled:boolean}>}
   */
  async register({ username, email, password }) {
    return this._http.post("/register", { username, email, password });
  }

  /**
   * POST /token — OAuth2 "password" flow, form-urlencoded per the API spec.
   * On success, persists the JWT and returns the authenticated username.
   * @returns {Promise<string>} username
   */
  async login({ username, password }) {
    const data = await this._http.post(
      "/token",
      { username, password },
      { bodyType: "form" }
    );
    this._tokens.save(data.access_token, username);
    return username;
  }

  /**
   * GET /users/me — also used on app boot to confirm a stored token is
   * still accepted by the server (not just "not yet expired locally").
   * @returns {Promise<{username:string,email:string,disabled:boolean}>}
   */
  async getCurrentUser() {
    const token = this._tokens.getToken();
    if (!token) throw new ApiError("Not authenticated.", 401);

    return this._http.get("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  logout() {
    this._tokens.clear();
  }

  /** Fast, local-only check — use before doing a network round trip. */
  hasStoredSession() {
    return this._tokens.hasValidToken();
  }

  getStoredUsername() {
    return this._tokens.getUsername();
  }
}
