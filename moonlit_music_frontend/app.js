// =========================================================
// BACKEND CONFIGURATION
// Change only this section to match your backend.
// =========================================================

const API_BASE_URL = "http://localhost:3000/api";

const ENDPOINTS = {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    profile: "/auth/me"
};

// Use "token" for JWT or "cookie" for server sessions.
const AUTH_MODE = "token";

// Set to true only when you want to demonstrate the frontend
// without connecting the backend.
const DEMO_MODE = false;

// =========================================================
// ELEMENTS
// =========================================================

const loginView = document.getElementById("loginView");
const registerView = document.getElementById("registerView");
const appView = document.getElementById("appView");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

const showRegisterButton = document.getElementById("showRegister");
const showLoginButton = document.getElementById("showLogin");
const logoutButton = document.getElementById("logoutButton");

const togglePasswordButton = document.getElementById("togglePassword");
const loginPassword = document.getElementById("loginPassword");

const toast = document.getElementById("toast");
const profileName = document.getElementById("profileName");

const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");

const navItems = document.querySelectorAll(".nav-item");
const sections = {
    home: document.getElementById("homeSection"),
    discover: document.getElementById("discoverSection"),
    library: document.getElementById("librarySection"),
    rituals: document.getElementById("ritualsSection")
};

const searchInput = document.getElementById("searchInput");

const currentSong = document.getElementById("currentSong");
const currentArtist = document.getElementById("currentArtist");
const mainPlayButton = document.getElementById("mainPlayButton");
const heroPlayButton = document.getElementById("heroPlayButton");
const likeButton = document.getElementById("likeButton");
const progressFill = document.getElementById("progressFill");
const currentTime = document.getElementById("currentTime");

const oracleButton = document.getElementById("oracleButton");
const oracleText = document.getElementById("oracleText");

// =========================================================
// AUTHENTICATION STORAGE
// =========================================================

function getToken() {
    return localStorage.getItem("moonlitToken");
}

function saveToken(token, remember) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("moonlitToken", token);
}

function findStoredToken() {
    return (
        localStorage.getItem("moonlitToken") ||
        sessionStorage.getItem("moonlitToken")
    );
}

function clearSession() {
    localStorage.removeItem("moonlitToken");
    sessionStorage.removeItem("moonlitToken");
    localStorage.removeItem("moonlitUsername");
    sessionStorage.removeItem("moonlitUsername");
    sessionStorage.removeItem("moonlitCookieSession");
}

function isAuthenticated() {
    if (DEMO_MODE) {
        return sessionStorage.getItem("moonlitDemo") === "true";
    }

    if (AUTH_MODE === "cookie") {
        return sessionStorage.getItem("moonlitCookieSession") === "true";
    }

    return Boolean(findStoredToken());
}

function saveUsername(username, remember = false) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("moonlitUsername", username);
}

function getUsername() {
    return (
        sessionStorage.getItem("moonlitUsername") ||
        localStorage.getItem("moonlitUsername") ||
        "Moon Child"
    );
}

// =========================================================
// API
// =========================================================

function createHeaders(hasBody = false) {
    const headers = {
        Accept: "application/json"
    };

    if (hasBody) {
        headers["Content-Type"] = "application/json";
    }

    const token = findStoredToken();

    if (AUTH_MODE === "token" && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...createHeaders(Boolean(options.body)),
            ...(options.headers || {})
        },
        credentials: AUTH_MODE === "cookie" ? "include" : "same-origin"
    });

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `Server error (${response.status})`
        );
    }

    return data;
}

// =========================================================
// VIEWS
// =========================================================

function showLogin() {
    loginView.classList.remove("hidden");
    registerView.classList.add("hidden");
    appView.classList.add("hidden");
    document.body.style.overflow = "";
    window.location.hash = "login";
}

function showRegister() {
    loginView.classList.add("hidden");
    registerView.classList.remove("hidden");
    appView.classList.add("hidden");
    document.body.style.overflow = "";
    window.location.hash = "register";
}

function showApp() {
    loginView.classList.add("hidden");
    registerView.classList.add("hidden");
    appView.classList.remove("hidden");
    document.body.style.overflow = "";
    profileName.textContent = getUsername();
    showSection("home");
    window.location.hash = "home";
}

function showSection(sectionName) {
    Object.values(sections).forEach((section) => {
        section.classList.add("hidden");
    });

    sections[sectionName]?.classList.remove("hidden");

    navItems.forEach((item) => {
        item.classList.toggle(
            "active",
            item.dataset.section === sectionName
        );
    });

    if (window.innerWidth <= 900) {
        sidebar.classList.remove("open");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// =========================================================
// NOTIFICATIONS
// =========================================================

let toastTimeout;

function showToast(message, type = "success") {
    clearTimeout(toastTimeout);

    toast.textContent = message;
    toast.className = `toast ${type}`;

    toastTimeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, 3500);
}

function setButtonLoading(button, loading, normalText) {
    button.disabled = loading;

    if (loading) {
        button.innerHTML = "<span>Opening the portal...</span><span>✦</span>";
    } else {
        button.innerHTML = `<span>${normalText}</span><span>→</span>`;
    }
}

// =========================================================
// LOGIN
// =========================================================

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document
        .getElementById("loginUsername")
        .value
        .trim();

    const password = loginPassword.value;
    const remember = document
        .getElementById("rememberMe")
        .checked;

    setButtonLoading(loginButton, true, "Enter Moonlit");

    try {
        if (DEMO_MODE) {
            await new Promise((resolve) => setTimeout(resolve, 650));
            sessionStorage.setItem("moonlitDemo", "true");
            saveUsername(username || "Moon Child", remember);
        } else {
            const data = await apiRequest(ENDPOINTS.login, {
                method: "POST",
                body: JSON.stringify({
                    username,
                    password
                })
            });

            if (AUTH_MODE === "token") {
                const token =
                    data.token ||
                    data.accessToken ||
                    data.access_token ||
                    data.jwt;

                if (!token) {
                    throw new Error(
                        "The backend accepted the login but did not return a token."
                    );
                }

                saveToken(token, remember);
            } else {
                sessionStorage.setItem(
                    "moonlitCookieSession",
                    "true"
                );
            }

            const returnedUsername =
                data.user?.username ||
                data.user?.name ||
                data.username ||
                data.name ||
                username;

            saveUsername(returnedUsername, remember);
        }

        loginForm.reset();

        // This sends the user directly to the website home page.
        showApp();

        showToast(
            `Welcome back, ${getUsername()}. The night is yours.`,
            "success"
        );

        loadProfile();
    } catch (error) {
        showToast(error.message, "error");
    } finally {
        setButtonLoading(loginButton, false, "Enter Moonlit");
    }
});

// =========================================================
// REGISTER
// =========================================================

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document
        .getElementById("registerUsername")
        .value
        .trim();

    const password = document
        .getElementById("registerPassword")
        .value;

    setButtonLoading(registerButton, true, "Create account");

    try {
        if (DEMO_MODE) {
            await new Promise((resolve) => setTimeout(resolve, 650));
        } else {
            await apiRequest(ENDPOINTS.register, {
                method: "POST",
                body: JSON.stringify({
                    username,
                    password
                })
            });
        }

        registerForm.reset();
        showLogin();

        showToast(
            "Your account was created. You may now enter Moonlit.",
            "success"
        );
    } catch (error) {
        showToast(error.message, "error");
    } finally {
        setButtonLoading(registerButton, false, "Create account");
    }
});

// =========================================================
// PROFILE AND LOGOUT
// =========================================================

async function loadProfile() {
    if (DEMO_MODE) {
        profileName.textContent = getUsername();
        return;
    }

    try {
        const data = await apiRequest(ENDPOINTS.profile);

        const username =
            data.user?.username ||
            data.user?.name ||
            data.username ||
            data.name;

        if (username) {
            profileName.textContent = username;
        }
    } catch {
        profileName.textContent = getUsername();
    }
}

logoutButton.addEventListener("click", async () => {
    try {
        if (!DEMO_MODE) {
            await apiRequest(ENDPOINTS.logout, {
                method: "POST"
            });
        }
    } catch {
        // The local session is still cleared if the backend logout fails.
    }

    clearSession();
    sessionStorage.removeItem("moonlitDemo");
    showLogin();
    showToast("You left the night safely.", "success");
});

// =========================================================
// NAVIGATION
// =========================================================

showRegisterButton.addEventListener("click", showRegister);
showLoginButton.addEventListener("click", showLogin);

navItems.forEach((item) => {
    item.addEventListener("click", () => {
        const section = item.dataset.section;
        showSection(section);
        window.location.hash = section;
    });
});

menuButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

document.addEventListener("click", (event) => {
    if (
        window.innerWidth <= 900 &&
        sidebar.classList.contains("open") &&
        !sidebar.contains(event.target) &&
        event.target !== menuButton
    ) {
        sidebar.classList.remove("open");
    }
});

// =========================================================
// PASSWORD VISIBILITY
// =========================================================

togglePasswordButton.addEventListener("click", () => {
    const shouldShow = loginPassword.type === "password";

    loginPassword.type = shouldShow ? "text" : "password";
    togglePasswordButton.textContent = shouldShow ? "Hide" : "Show";
    togglePasswordButton.setAttribute(
        "aria-label",
        shouldShow ? "Hide password" : "Show password"
    );
});

// =========================================================
// MUSIC PLAYER DEMO
// =========================================================

const playlist = [
    {
        title: "Midnight in Bloom",
        artist: "Moonlit Radio"
    },
    {
        title: "Black Roses",
        artist: "Violet Saint"
    },
    {
        title: "Ocean Boulevard at 2AM",
        artist: "The Pale Cinema"
    },
    {
        title: "The Moon Knows",
        artist: "Arcana Bloom"
    }
];

let currentTrackIndex = 0;
let isPlaying = false;
let progress = 18;
let playerInterval = null;

function setSong(title, artist = "Moonlit Selection") {
    currentSong.textContent = title;
    currentArtist.textContent = artist;
    progress = 0;
    progressFill.style.width = "0%";
    currentTime.textContent = "0:00";
    startPlayback();
    showToast(`Now playing: ${title}`, "success");
}

function updatePlayButtons() {
    mainPlayButton.textContent = isPlaying ? "❚❚" : "▶";
    heroPlayButton.innerHTML = isPlaying
        ? "<span>❚❚</span><span>Pause</span>"
        : "<span>▶</span><span>Play</span>";
}

function startPlayback() {
    isPlaying = true;
    updatePlayButtons();
    clearInterval(playerInterval);

    playerInterval = setInterval(() => {
        if (!isPlaying) {
            return;
        }

        progress = Math.min(progress + 0.45, 100);
        progressFill.style.width = `${progress}%`;

        const totalSeconds = Math.round((228 * progress) / 100);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = String(totalSeconds % 60).padStart(2, "0");

        currentTime.textContent = `${minutes}:${seconds}`;

        if (progress >= 100) {
            playNext();
        }
    }, 1000);
}

function togglePlayback() {
    isPlaying = !isPlaying;
    updatePlayButtons();

    if (isPlaying) {
        startPlayback();
    }
}

function playNext() {
    currentTrackIndex =
        (currentTrackIndex + 1) % playlist.length;

    const track = playlist[currentTrackIndex];
    setSong(track.title, track.artist);
}

function playPrevious() {
    currentTrackIndex =
        (currentTrackIndex - 1 + playlist.length) %
        playlist.length;

    const track = playlist[currentTrackIndex];
    setSong(track.title, track.artist);
}

mainPlayButton.addEventListener("click", togglePlayback);
heroPlayButton.addEventListener("click", togglePlayback);

document
    .getElementById("nextButton")
    .addEventListener("click", playNext);

document
    .getElementById("previousButton")
    .addEventListener("click", playPrevious);

document
    .querySelectorAll("[data-song]")
    .forEach((element) => {
        element.addEventListener("click", () => {
            setSong(element.dataset.song);
        });
    });

document
    .querySelectorAll(".album-card")
    .forEach((album) => {
        album.addEventListener("click", () => {
            setSong(album.dataset.title);
        });
    });

document
    .querySelectorAll(".ritual-play")
    .forEach((button) => {
        button.addEventListener("click", () => {
            setSong(button.dataset.song, "Moonlit Ritual");
        });
    });

likeButton.addEventListener("click", () => {
    const liked = likeButton.textContent === "♥";
    likeButton.textContent = liked ? "♡" : "♥";
    likeButton.style.color = liked ? "" : "#c98698";
});

document
    .getElementById("progressBar")
    .addEventListener("click", (event) => {
        const bar = event.currentTarget;
        const rectangle = bar.getBoundingClientRect();

        progress = Math.max(
            0,
            Math.min(
                100,
                ((event.clientX - rectangle.left) /
                    rectangle.width) *
                    100
            )
        );

        progressFill.style.width = `${progress}%`;
    });

// =========================================================
// ORACLE
// =========================================================

const oracleMessages = [
    "Tonight belongs to slow guitars, velvet vocals and one dramatic chorus.",
    "Your current phase calls for dream pop, rain sounds and a window seat.",
    "The cards suggest a cinematic ballad with absolutely unnecessary emotional damage.",
    "A forgotten love song is waiting for you after midnight.",
    "Listen to something that sounds like old Hollywood, black lace and expensive sadness."
];

oracleButton.addEventListener("click", () => {
    const randomMessage =
        oracleMessages[
            Math.floor(Math.random() * oracleMessages.length)
        ];

    oracleText.textContent = randomMessage;
    showToast("The oracle has chosen your atmosphere.", "success");
});

// =========================================================
// SEARCH
// =========================================================

searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value
        .trim()
        .toLowerCase();

    document
        .querySelectorAll(".album-card")
        .forEach((card) => {
            const text = card.textContent.toLowerCase();
            card.style.display =
                !searchValue || text.includes(searchValue)
                    ? ""
                    : "none";
        });

    if (searchValue) {
        showSection("home");
    }
});

// =========================================================
// INITIALIZATION
// =========================================================

function initialize() {
    const route = window.location.hash.replace("#", "");

    if (isAuthenticated()) {
        showApp();

        if (sections[route]) {
            showSection(route);
        }

        loadProfile();
        return;
    }

    if (route === "register") {
        showRegister();
    } else {
        showLogin();
    }
}

window.addEventListener("hashchange", () => {
    if (!isAuthenticated()) {
        return;
    }

    const route = window.location.hash.replace("#", "");

    if (sections[route]) {
        showSection(route);
    }
});

initialize();
