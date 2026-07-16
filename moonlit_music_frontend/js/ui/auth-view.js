import { qs, show, hide, setLoading } from "./dom.js";
import { ApiError } from "../services/api-error.js";

/**
 * AuthView
 * Owns everything about the login/register screens: switching between
 * them, validating input, calling AuthService, and reporting the result.
 * It knows nothing about the rest of the app — on a successful login it
 * simply calls the `onAuthenticated` callback it was given.
 */
export class AuthView {
  /**
   * @param {import("../services/auth-service.js").AuthService} authService
   * @param {import("./toast.js").Toast} toast
   * @param {(username: string) => void} onAuthenticated
   */
  constructor(authService, toast, onAuthenticated) {
    this._auth = authService;
    this._toast = toast;
    this._onAuthenticated = onAuthenticated;

    this._loginView = qs("#loginView");
    this._registerView = qs("#registerView");
    this._loginForm = qs("#loginForm");
    this._registerForm = qs("#registerForm");
    this._loginButton = qs("#loginButton");
    this._registerButton = qs("#registerButton");
    this._togglePasswordButton = qs("#togglePassword");
    this._loginPasswordInput = qs("#loginPassword");

    this._bindEvents();
  }

  showLogin() {
    hide(this._registerView);
    show(this._loginView);
  }

  showRegister() {
    hide(this._loginView);
    show(this._registerView);
  }

  _bindEvents() {
    qs("#showRegister")?.addEventListener("click", () => this.showRegister());
    qs("#showLogin")?.addEventListener("click", () => this.showLogin());

    this._togglePasswordButton?.addEventListener("click", () => this._togglePasswordVisibility());

    this._loginForm?.addEventListener("submit", (event) => this._handleLogin(event));
    this._registerForm?.addEventListener("submit", (event) => this._handleRegister(event));
  }

  _togglePasswordVisibility() {
    const isHidden = this._loginPasswordInput.type === "password";
    this._loginPasswordInput.type = isHidden ? "text" : "password";
    this._togglePasswordButton.textContent = isHidden ? "Hide" : "Show";
    this._togglePasswordButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  }

  async _handleLogin(event) {
    event.preventDefault();
    if (!this._loginForm.checkValidity()) {
      this._loginForm.reportValidity();
      return;
    }

    const formData = new FormData(this._loginForm);
    const username = formData.get("username")?.toString().trim();
    const password = formData.get("password")?.toString();

    setLoading(this._loginButton, true, "Entering…");
    try {
      await this._auth.login({ username, password });
      this._toast.success(`Welcome back, ${username}.`);
      this._loginForm.reset();
      this._onAuthenticated(username);
    } catch (error) {
      this._reportError(error, "Could not log in.");
    } finally {
      setLoading(this._loginButton, false);
    }
  }

  async _handleRegister(event) {
    event.preventDefault();
    if (!this._registerForm.checkValidity()) {
      this._registerForm.reportValidity();
      return;
    }

    const formData = new FormData(this._registerForm);
    const username = formData.get("username")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    setLoading(this._registerButton, true, "Creating…");
    try {
      await this._auth.register({ username, email, password });
      this._toast.success("Account created. You can log in now.");
      this._registerForm.reset();
      this.showLogin();
      qs("#loginUsername").value = username;
    } catch (error) {
      this._reportError(error, "Could not create the account.");
    } finally {
      setLoading(this._registerButton, false);
    }
  }

  _reportError(error, fallbackMessage) {
    if (error instanceof ApiError) {
      this._toast.error(error.message || fallbackMessage);
    } else {
      this._toast.error(fallbackMessage);
      console.error(error);
    }
  }
}
