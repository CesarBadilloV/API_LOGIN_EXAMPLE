import { qs, qsa, show, hide } from "./dom.js";
import { MusicPlayer } from "./music-player.js";

const ORACLE_SONGS = [
  { title: "Black Roses", artist: "Violet Saint" },
  { title: "Ocean Boulevard at 2AM", artist: "The Pale Cinema" },
  { title: "The Moon Knows", artist: "Arcana Bloom" },
  { title: "Crimson Honeymoon", artist: "Moonlit Radio" },
  { title: "Ultraviolet Dreams", artist: "Moonlit Radio" },
];

/**
 * AppView
 * Controller for the authenticated shell: sidebar navigation, search,
 * logout, and delegated click handling for every "play this song" style
 * control scattered across the home/library/rituals sections.
 */
export class AppView {
  /**
   * @param {import("../services/auth-service.js").AuthService} authService
   * @param {import("./toast.js").Toast} toast
   * @param {() => void} onLoggedOut
   */
  constructor(authService, toast, onLoggedOut) {
    this._auth = authService;
    this._toast = toast;
    this._onLoggedOut = onLoggedOut;
    this._player = new MusicPlayer();

    this._appView = qs("#appView");
    this._sidebar = qs("#sidebar");
    this._profileNameEl = qs("#profileName");

    this._bindEvents();
  }

  /** Call once the user is authenticated; shows the app and loads their profile. */
  async enter(username) {
    if (this._profileNameEl) this._profileNameEl.textContent = username || "Moon Child";
    show(this._appView);
    this._switchSection("home");
  }

  hide() {
    hide(this._appView);
  }

  _bindEvents() {
    qs("#logoutButton")?.addEventListener("click", () => this._handleLogout());
    qs("#menuButton")?.addEventListener("click", () => this._sidebar?.classList.toggle("open"));

    qsa(".nav-item").forEach((button) => {
      button.addEventListener("click", () => this._switchSection(button.dataset.section));
    });

    qs("#searchInput")?.addEventListener("input", (event) => this._filterCatalog(event.target.value));

    qs("#oracleButton")?.addEventListener("click", () => this._drawOracleSong());

    qs("#heroPlayButton")?.addEventListener("click", () =>
      this._player.play({ title: "Born to Listen After Midnight", artist: "Moonlit Radio", cover: "☾" })
    );

    // Delegated listeners cover every song trigger without one handler per button.
    this._appView?.addEventListener("click", (event) => this._handlePlayTrigger(event));
  }

  _switchSection(sectionName) {
    if (!sectionName) return;

    qsa(".nav-item").forEach((button) => {
      button.classList.toggle("active", button.dataset.section === sectionName);
    });

    qsa(".content-section").forEach((section) => {
      const isTarget = section.id === `${sectionName}Section`;
      section.classList.toggle("hidden", !isTarget);
    });

    this._sidebar?.classList.remove("open");
  }

  _handlePlayTrigger(event) {
    const quickCard = event.target.closest(".quick-card");
    if (quickCard) {
      this._player.play({ title: quickCard.dataset.song });
      return;
    }

    const albumPlay = event.target.closest(".album-play");
    if (albumPlay) {
      const album = albumPlay.closest(".album-card");
      if (album) this._player.play({ title: album.dataset.title, cover: "♬" });
      return;
    }

    const songRow = event.target.closest(".song-row");
    if (songRow) {
      this._player.play({ title: songRow.dataset.song, cover: "♬" });
      return;
    }

    const ritualPlay = event.target.closest(".ritual-play");
    if (ritualPlay) {
      this._player.play({ title: ritualPlay.dataset.song, cover: "☽" });
    }
  }

  _drawOracleSong() {
    const pick = ORACLE_SONGS[Math.floor(Math.random() * ORACLE_SONGS.length)];
    const oracleText = qs("#oracleText");
    if (oracleText) {
      oracleText.textContent = `The moon points to "${pick.title}" by ${pick.artist}. Trust it.`;
    }
    this._player.play(pick);
  }

  _filterCatalog(query) {
    const normalized = query.trim().toLowerCase();

    qsa(".quick-card").forEach((card) => {
      const matches = !normalized || card.dataset.song.toLowerCase().includes(normalized);
      card.style.display = matches ? "" : "none";
    });

    qsa(".album-card").forEach((card) => {
      const matches = !normalized || card.dataset.title.toLowerCase().includes(normalized);
      card.style.display = matches ? "" : "none";
    });

    qsa(".song-row").forEach((row) => {
      const matches = !normalized || row.dataset.song.toLowerCase().includes(normalized);
      row.style.display = matches ? "" : "none";
    });
  }

  _handleLogout() {
    this._auth.logout();
    this._toast.success("You've left Moonlit. See you after dark.");
    this.hide();
    this._onLoggedOut();
  }
}
