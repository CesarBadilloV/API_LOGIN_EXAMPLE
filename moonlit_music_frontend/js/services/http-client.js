import { CONFIG } from "../config.js";
import { ApiError } from "./api-error.js";

/**
 * HttpClient
 * Small transport layer around fetch(). It knows nothing about auth,
 * tokens or business rules — its only job is: send a request, come back
 * with parsed JSON or a normalized ApiError. Every other service is
 * built on top of this instead of calling fetch() directly.
 */
export class HttpClient {
  /**
   * @param {string} baseURL
   * @param {number} timeoutMs
   */
  constructor(baseURL = CONFIG.API_BASE_URL, timeoutMs = CONFIG.REQUEST_TIMEOUT_MS) {
    this.baseURL = baseURL;
    this.timeoutMs = timeoutMs;
  }

  /**
   * @param {string} path            e.g. "/register"
   * @param {object} options
   * @param {"GET"|"POST"|"PUT"|"DELETE"} [options.method]
   * @param {object|URLSearchParams} [options.body]
   * @param {"json"|"form"} [options.bodyType]  How to serialize the body
   * @param {Record<string,string>} [options.headers]
   * @returns {Promise<any>} parsed JSON body (or null for 204 responses)
   */
  async request(path, { method = "GET", body, bodyType = "json", headers = {} } = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    const requestHeaders = { Accept: "application/json", ...headers };
    let requestBody;

    if (body !== undefined) {
      if (bodyType === "form") {
        requestBody = body instanceof URLSearchParams ? body : new URLSearchParams(body);
        requestHeaders["Content-Type"] = "application/x-www-form-urlencoded";
      } else {
        requestBody = JSON.stringify(body);
        requestHeaders["Content-Type"] = "application/json";
      }
    }

    let response;
    try {
      response = await fetch(`${this.baseURL}${path}`, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      });
    } catch (err) {
      const isAbort = err.name === "AbortError";
      throw new ApiError(
        isAbort
          ? "The server took too long to respond. Please try again."
          : "Could not reach the server. Check your connection and that the API is running.",
        null
      );
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 204) return null;

    const payload = await this._safeParseJson(response);

    if (!response.ok) {
      const message = payload?.detail ?? `Request failed with status ${response.status}.`;
      throw new ApiError(message, response.status, payload);
    }

    return payload;
  }

  get(path, options = {}) {
    return this.request(path, { ...options, method: "GET" });
  }

  post(path, body, options = {}) {
    return this.request(path, { ...options, method: "POST", body });
  }

  async _safeParseJson(response) {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { detail: text };
    }
  }
}
