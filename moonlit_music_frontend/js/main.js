import { HttpClient } from "./services/http-client.js";
import { TokenStorage } from "./services/token-storage.js";
import { AuthService } from "./services/auth-service.js";
import { Toast } from "./ui/toast.js";
import { AuthView } from "./ui/auth-view.js";
import { AppView } from "./ui/app-view.js";
import { hide } from "./ui/dom.js";
import { qs } from "./ui/dom.js";

/**
 * Composition root.
 * This is the only file that constructs concrete instances and wires
 * them together — every other module receives its dependencies through
 * its constructor, which keeps the whole app easy to test in isolation.
 */
function bootstrap() {
  const httpClient = new HttpClient();
  const tokenStorage = new TokenStorage();
  const authService = new AuthService(httpClient, tokenStorage);
  const toast = new Toast();

  const appView = new AppView(authService, toast, () => authView.showLogin());
  const authView = new AuthView(authService, toast, (username) => appView.enter(username));

  restoreSession(authService, authView, appView);
}

/**
 * On page load, if a token is stored and still looks unexpired locally,
 * confirm it with the server (GET /users/me) before trusting it — a
 * token can be revoked or expired server-side even if our local clock
 * thinks otherwise.
 */
async function restoreSession(authService, authView, appView) {
  if (!authService.hasStoredSession()) {
    authView.showLogin();
    return;
  }

  try {
    const user = await authService.getCurrentUser();
    hide(qs("#loginView"));
    hide(qs("#registerView"));
    await appView.enter(user.username);
  } catch {
    authService.logout();
    authView.showLogin();
  }
}

document.addEventListener("DOMContentLoaded", bootstrap);
