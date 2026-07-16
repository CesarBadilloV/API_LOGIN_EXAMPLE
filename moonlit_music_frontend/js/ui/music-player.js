import { qs } from "./dom.js";

const DEFAULT_TRACK_DURATION_SECONDS = 3 * 60 + 48; // 3:48, matches the static markup

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

/**
 * MusicPlayer
 * The backend in this project only handles authentication — there is no
 * catalog/streaming API. This module simulates transport (play/pause,
 * progress, next/previous) purely in the UI so the player footer is
 * fully interactive. Swapping this for a real player later only means
 * replacing `_tick` with real <audio> events.
 */
export class MusicPlayer {
  constructor() {
    this._currentSongEl = qs("#currentSong");
    this._currentArtistEl = qs("#currentArtist");
    this._playerCoverEl = qs("#playerCover");
    this._playButton = qs("#mainPlayButton");
    this._likeButton = qs("#likeButton");
    this._previousButton = qs("#previousButton");
    this._nextButton = qs("#nextButton");
    this._progressBar = qs("#progressBar");
    this._progressFill = qs("#progressFill");
    this._currentTimeEl = qs("#currentTime");

    this._queue = [];
    this._queueIndex = 0;
    this._elapsedSeconds = 0;
    this._durationSeconds = DEFAULT_TRACK_DURATION_SECONDS;
    this._isPlaying = false;
    this._isLiked = false;
    this._timerId = null;

    this._bindEvents();
  }

  /** Load a track (and optional queue of upcoming tracks) and start playing. */
  play({ title, artist = "Moonlit Radio", cover = "☾" }, queue = null) {
    if (queue) {
      this._queue = queue;
      this._queueIndex = Math.max(0, queue.findIndex((t) => t.title === title));
    } else {
      this._queue = [{ title, artist, cover }];
      this._queueIndex = 0;
    }

    this._loadCurrentTrack();
    this._setPlaying(true);
  }

  toggle() {
    if (this._queue.length === 0) return;
    this._setPlaying(!this._isPlaying);
  }

  next() {
    if (this._queue.length === 0) return;
    this._queueIndex = (this._queueIndex + 1) % this._queue.length;
    this._loadCurrentTrack();
    this._setPlaying(true);
  }

  previous() {
    if (this._queue.length === 0) return;
    this._queueIndex = (this._queueIndex - 1 + this._queue.length) % this._queue.length;
    this._loadCurrentTrack();
    this._setPlaying(true);
  }

  _bindEvents() {
    this._playButton?.addEventListener("click", () => this.toggle());
    this._nextButton?.addEventListener("click", () => this.next());
    this._previousButton?.addEventListener("click", () => this.previous());
    this._likeButton?.addEventListener("click", () => this._toggleLike());
    this._progressBar?.addEventListener("click", (event) => this._seek(event));
  }

  _loadCurrentTrack() {
    const track = this._queue[this._queueIndex];
    if (!track) return;

    this._elapsedSeconds = 0;
    this._durationSeconds = track.durationSeconds ?? DEFAULT_TRACK_DURATION_SECONDS;

    if (this._currentSongEl) this._currentSongEl.textContent = track.title;
    if (this._currentArtistEl) this._currentArtistEl.textContent = track.artist ?? "Moonlit Radio";
    if (this._playerCoverEl) this._playerCoverEl.textContent = track.cover ?? "☾";

    this._isLiked = false;
    this._updateLikeUI();
    this._renderProgress();
  }

  _setPlaying(shouldPlay) {
    this._isPlaying = shouldPlay;
    if (this._playButton) this._playButton.textContent = shouldPlay ? "❚❚" : "▶";

    clearInterval(this._timerId);
    if (shouldPlay) {
      this._timerId = setInterval(() => this._tick(), 1000);
    }
  }

  _tick() {
    this._elapsedSeconds += 1;
    if (this._elapsedSeconds >= this._durationSeconds) {
      this.next();
      return;
    }
    this._renderProgress();
  }

  _renderProgress() {
    if (this._currentTimeEl) this._currentTimeEl.textContent = formatTime(this._elapsedSeconds);
    if (this._progressFill) {
      const percent = (this._elapsedSeconds / this._durationSeconds) * 100;
      this._progressFill.style.width = `${Math.min(percent, 100)}%`;
    }
  }

  _seek(event) {
    if (!this._progressBar) return;
    const rect = this._progressBar.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    this._elapsedSeconds = Math.floor(ratio * this._durationSeconds);
    this._renderProgress();
  }

  _toggleLike() {
    this._isLiked = !this._isLiked;
    this._updateLikeUI();
  }

  _updateLikeUI() {
    if (!this._likeButton) return;
    this._likeButton.textContent = this._isLiked ? "♥" : "♡";
    this._likeButton.classList.toggle("liked", this._isLiked);
  }
}
