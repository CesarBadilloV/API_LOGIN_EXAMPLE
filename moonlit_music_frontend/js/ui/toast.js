import { qs } from "./dom.js";

/**
 * Toast
 * Very small wrapper around the single #toast element in the DOM.
 * Call show() from anywhere; it manages its own timers.
 */
export class Toast {
  constructor(elementId = "toast") {
    this._el = qs(`#${elementId}`);
    this._hideTimer = null;
  }

  /**
   * @param {string} message
   * @param {"info"|"success"|"error"} type
   * @param {number} durationMs
   */
  show(message, type = "info", durationMs = 3500) {
    if (!this._el) return;

    clearTimeout(this._hideTimer);
    this._el.textContent = message;
    this._el.classList.remove("hidden", "toast-info", "toast-success", "toast-error");
    this._el.classList.add(`toast-${type}`);

    this._hideTimer = setTimeout(() => this._el.classList.add("hidden"), durationMs);
  }

  success(message) {
    this.show(message, "success");
  }

  error(message) {
    this.show(message, "error");
  }
}
