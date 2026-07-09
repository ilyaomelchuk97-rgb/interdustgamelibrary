export const EpicAPI = {
    async login(baseUrl) {
        window.location.href = `${baseUrl}/api/epic/login`;
    },

    async fetchGames(accountId, baseUrl) {
        const url = `${baseUrl}/api/epic/games?accountId=${accountId}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка при получении игр Epic');
        return await response.json();
    }
};
