import { UI } from './ui.js';
import { SteamAPI } from './steam.js';
import { EpicAPI } from './epic.js';

// Вставьте сюда URL вашего развернутого бэкенда после деплоя на Render
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? '' 
    : 'https://your-backend-url.onrender.com'; 

const App = {
    state: {
        steamId: null,
        epicId: null,
        games: [],
        filter: 'all',
        searchQuery: ''
    },

    async init() {
        this.bindEvents();
        this.loadFromStorage();
        this.handleUrlParams();
        this.updateUI();
        
        if (this.state.steamId || this.state.epicId) {
            await this.refreshGames();
        }
    },

    bindEvents() {
        document.getElementById('connect-steam').onclick = () => {
            window.location.href = `${API_BASE_URL}/api/steam/login`;
        };
        document.getElementById('connect-epic').onclick = () => {
            window.location.href = `${API_BASE_URL}/api/epic/login`;
        };
        
        const refreshBtn = document.getElementById('refresh-btn');
        refreshBtn.onclick = async () => {
            refreshBtn.classList.add('rotating');
            await this.refreshGames();
            refreshBtn.classList.remove('rotating');
        };

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.onclick = (e) => {
                document.querySelector('.filter-btn.active').classList.remove('active');
                e.target.classList.add('active');
                this.state.filter = e.target.dataset.filter;
                UI.updateFilterSlider(e.target);
                this.updateUI();
            };
        });

        const searchInput = document.getElementById('game-search');
        searchInput.oninput = (e) => {
            this.state.searchQuery = e.target.value.trim().toLowerCase();
            this.updateUI();
        };

        UI.updateFilterSlider(document.querySelector('.filter-btn.active'));
    },

    handleUrlParams() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('steamid')) {
            this.state.steamId = params.get('steamid');
            this.saveToStorage();
            UI.setAuthStatus('steam', true, 'Steam User');
            window.history.replaceState({}, document.title, "/");
        }
        if (params.has('epicid')) {
            this.state.epicId = params.get('epicid');
            this.saveToStorage();
            UI.setAuthStatus('epic', true, 'Epic User');
            window.history.replaceState({}, document.title, "/");
        }
        if (params.has('error')) {
            UI.showToast(`Ошибка: ${params.get('error')}`, 'error');
        }
    },

    async refreshGames() {
        UI.showSkeletons();
        let allGames = [];

        try {
            const steamPromise = this.state.steamId 
                ? SteamAPI.fetchGames(this.state.steamId, API_BASE_URL).then(res => res.games).catch(() => []) 
                : Promise.resolve([]);
                
            const epicPromise = this.state.epicId 
                ? EpicAPI.fetchGames(this.state.epicId, API_BASE_URL).then(res => res.games).catch(() => []) 
                : Promise.resolve([]);

            const [steamGames, epicGames] = await Promise.all([steamPromise, epicPromise]);
            
            allGames = [...steamGames, ...epicGames];
            this.state.games = allGames;
            this.saveToStorage();
            
            if (allGames.length === 0 && (this.state.steamId || this.state.epicId)) {
                UI.showToast('Библиотеки пусты или скрыты настройками приватности');
            }
            
            UI.showToast('Библиотека обновлена!');
        } catch (e) {
            UI.showToast('Ошибка при обновлении данных', 'error');
        } finally {
            this.updateUI();
        }
    },

    updateUI() {
        const filteredGames = this.state.games.filter(game => {
            const matchesStore = this.state.filter === 'all' || game.store === this.state.filter;
            const matchesSearch = game.title.toLowerCase().includes(this.state.searchQuery);
            return matchesStore && matchesSearch;
        });

        UI.renderGames(filteredGames);
        UI.setAuthStatus('steam', !!this.state.steamId);
        UI.setAuthStatus('epic', !!this.state.epicId);
    },

    saveToStorage() {
        localStorage.setItem('gamehub_state', JSON.stringify({
            steamId: this.state.steamId,
            epicId: this.state.epicId,
            games: this.state.games
        }));
    },

    loadFromStorage() {
        const saved = localStorage.getItem('gamehub_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.state.steamId = parsed.steamId;
            this.state.epicId = parsed.epicId;
            this.state.games = parsed.games || [];
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
