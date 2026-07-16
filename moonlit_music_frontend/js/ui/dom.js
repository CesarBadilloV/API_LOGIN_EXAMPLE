/** Query a single element, scoped optionally to a root (defaults to document). */
export const qs = (selector, root = document) => root.querySelector(selector);

/** Query all matching elements as a real array. */
export const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export const show = (el) => el?.classList.remove("hidden");
export const hide = (el) => el?.classList.add("hidden");

export function setLoading(button, isLoading, loadingLabel = "Please wait…") {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalContent = button.innerHTML;
    button.innerHTML = `<span>${loadingLabel}</span>`;
    button.disabled = true;
  } else {
    if (button.dataset.originalContent) {
      button.innerHTML = button.dataset.originalContent;
      delete button.dataset.originalContent;
    }
    button.disabled = false;
  }
}
