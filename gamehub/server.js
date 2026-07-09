require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ 
    secret: 'gamehub-secret-key', 
    resave: false, 
    saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport Session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Steam Strategy
passport.use(new SteamStrategy({
    returnURL: `${process.env.REDIRECT_URI || 'http://localhost:3000'}/api/steam/callback`,
    apiKey: process.env.STEAM_API_KEY
}, (identifier, profile, done) => {
    return done(null, profile);
}));

// --- ENDPOINTS ---

// Steam Login
app.get('/api/steam/login', passport.authenticate('steam'));

// Steam Callback
app.get('/api/steam/callback', 
    passport.authenticate('steam', { failureRedirect: '/' }), 
    (req, res) => {
        res.redirect('/?steamid=' + req.user.id);
    }
);

// Unified Steam Games Fetcher
app.get('/api/steam/games', async (req, res) => {
    const { steamid, apikey } = req.query;
    const key = apikey || process.env.STEAM_API_KEY;

    if (!steamid || !key) {
        return res.status(400).json({ error: 'Missing SteamID or API Key' });
    }

    try {
        const response = await axios.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/`, {
            params: {
                key: key,
                steamid: steamid,
                format: 'json',
                include_appinfo: true
            }
        });

        const games = (response.data.response.games || []).map(game => ({
            id: game.appid,
            title: game.name,
            image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_600x900.jpg`,
            store: 'steam',
            url: `https://store.steampowered.com/app/${game.appid}`
        }));

        res.json({ games });
    } catch (error) {
        console.error('Steam API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch Steam games' });
    }
});

// Epic Games Mock/Proxy Implementation
// Since Epic's API requires a very complex OAuth2 PKCE flow and specific Client IDs,
// this implementation provides the structure and a simulated response for the demo,
// while showing where the real API calls would go.
app.get('/api/epic/login', (req, res) => {
    const epicAuthUrl = `https://www.epicgames.com/id/login?clientId=${process.env.EPIC_CLIENT_ID}&redirectUri=${process.env.REDIRECT_URI}/api/epic/callback`;
    res.redirect(epicAuthUrl);
});

app.get('/api/epic/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect('/?error=epic_auth_failed');
    
    // In a real implementation, we would exchange 'code' for an access_token here
    // and save the accountId to the session.
    res.redirect('/?epicid=mock_epic_id_123');
});

app.get('/api/epic/games', async (req, res) => {
    const { accountId } = req.query;
    if (!accountId) return res.status(400).json({ error: 'Missing Epic Account ID' });

    try {
        // This is where you would call: GET https://api.epicgames.dev/epic/games/v1/library
        // For the sake of the architectural demo, we provide high-quality mock data
        const mockEpicGames = [
            { id: '1', title: 'Fortnite', image: 'https://cdn1.epicgames.com/offer/...', store: 'epic', url: 'https://store.epicgames.com/p/fortnite' },
            { id: '2', title: 'Rocket League', image: 'https://cdn1.epicgames.com/offer/...', store: 'epic', url: 'https://store.epicgames.com/p/rocket-league' },
            { id: '3', title: 'Alan Wake 2', image: 'https://cdn1.epicgames.com/offer/...', store: 'epic', url: 'https://store.epicgames.com/p/alan-wake-2' }
        ];
        
        // To make it look real, we'll use a few real-looking cover images
        const games = mockEpicGames.map((g, i) => ({
            ...g,
            image: `https://picsum.photos/seed/${i+100}/600/900` // Using picsum for high quality placeholders
        }));

        res.json({ games });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Epic games' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 GameHub server running on http://localhost:${PORT}`);
});
