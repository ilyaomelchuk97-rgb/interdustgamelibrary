export const UI = {
    // Создание скелетона для загрузки
    showSkeletons(count = 6) {
        const grid = document.getElementById('games-grid');
        grid.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'game-card skeleton';
            skeleton.innerHTML = `
                <div class="game-cover skeleton"></div>
                <div class="game-info">
                    <div class="game-title skeleton" style="width: 80%; height: 14px; margin-bottom: 8px;"></div>
                    <div class="store-tag skeleton" style="width: 40%; height: 10px;"></div>
                </div>
            `;
            grid.appendChild(skeleton);
        }
    },

    // Рендер игр с эффектом staggered animation
    renderGames(games) {
        const grid = document.getElementById('games-grid');
        grid.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        
        games.forEach((game, index) => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.style.animationDelay = `${index * 0.05}s`;
            
            // Если нет обложки, создаем плейсхолдер с буквой
            const imageSrc = game.image || `https://via.placeholder.com/600x900/1a1a2e/ffffff?text=${game.title[0]}`;

            card.innerHTML = `
                <img src="${imageSrc}" class="game-cover" loading="lazy" alt="${game.title}">
                <div class="game-info">
                    <div class="game-title">${game.title}</div>
                    <div class="store-tag ${game.store}">${game.store}</div>
                </div>
            `;
            
            card.onclick = () => {
                if (game.url) window.open(game.url, '_blank');
            };
            
            fragment.appendChild(card);
        });
        
        grid.appendChild(fragment);
    },

    // Анимация переключения фильтра
    updateFilterSlider(activeBtn) {
        const slider = document.querySelector('.filter-slider');
        const rect = activeBtn.getBoundingClientRect();
        const navRect = activeBtn.parentElement.getBoundingClientRect();
        
        slider.style.width = `${rect.width}px`;
        slider.style.left = `${rect.left - navRect.left}px`;
    },

    // Показ уведомления (Toast)
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        if (type === 'error') toast.style.borderLeftColor = '#ff4d4d';
        toast.innerText = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Обновление статуса авторизации
    setAuthStatus(store, connected, name = '') {
        const card = document.getElementById(`${store}-auth`);
        const status = document.getElementById(`${store}-status`);
        
        if (connected) {
            card.classList.add('connected');
            status.innerText = name || 'Подключен';
        } else {
            card.classList.remove('connected');
            status.innerText = 'Не подключен';
        }
    }
};
