MOONLIT FRONTEND
Gothic music website with a login that redirects directly to the home page.

FILES
- index.html
- styles.css
- app.js

MAIN FEATURES
- Dark gothic and romantic visual design.
- Login and registration.
- Successful login redirects directly to Home.
- Sidebar navigation.
- Home, Discover, Library and Daily Rituals sections.
- Interactive music player.
- Search filter.
- Visible success and error messages.
- Responsive design for desktop, tablet and mobile.
- JWT or cookie authentication support.
- Optional demo mode.

CONNECT TO YOUR BACKEND

Open app.js and edit:

const API_BASE_URL = "http://localhost:3000/api";

Then update these routes if necessary:

const ENDPOINTS = {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    profile: "/auth/me"
};

AUTHENTICATION TYPE

For JWT:
const AUTH_MODE = "token";

For session cookies:
const AUTH_MODE = "cookie";

EXPECTED JWT LOGIN RESPONSE

{
    "token": "YOUR_TOKEN",
    "user": {
        "username": "moonchild"
    }
}

The frontend also recognizes:
- accessToken
- access_token
- jwt

DEMO WITHOUT BACKEND

To test only the frontend, change:

const DEMO_MODE = true;

Then any username and a password with at least 8 characters will open Home.

RUN WITH VISUAL STUDIO CODE

1. Open the moonlit_music_frontend folder.
2. Install the Live Server extension.
3. Right-click index.html.
4. Select "Open with Live Server".

IMPORTANT

If the frontend and backend use different ports, the backend must allow CORS
from the frontend address, for example:

http://127.0.0.1:5500
or
http://localhost:5500
