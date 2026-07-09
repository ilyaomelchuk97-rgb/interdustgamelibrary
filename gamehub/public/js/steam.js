export const SteamAPI = {
    async login(baseUrl) {
        window.location.href = `${baseUrl}/api/steam/login`;
    },

    async fetchGames(steamid, baseUrl, apikey = null) {
        const url = `${baseUrl}/api/steam/games?steamid=${steamid}${apikey ? `&apikey=${apikey}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка при получении игр Steam');
        return await response.json();
    }
};
