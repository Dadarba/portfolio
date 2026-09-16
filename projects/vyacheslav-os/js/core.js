// =========================================================
// АВТОНОМНОЕ ЯДРО (STANDALONE VERCEL & LOCAL COMPATIBLE)
// =========================================================

// Автономная инициализация монет
if (!localStorage.getItem('v_coins')) {
    localStorage.setItem('v_coins', '5000');
}
window.globalCoins = parseInt(localStorage.getItem('v_coins') || '5000', 10);

window.updateBalanceDisplay = function() {
    const coins = window.globalCoins;
    const ids = ['user-balance-val', 'catalog-balance-val', 'hub-balance-val'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = coins;
    });
    document.querySelectorAll('.coin-display-val').forEach(el => el.innerText = coins);
};

window.addCoins = function(amt) {
    window.globalCoins = Math.max(0, (window.globalCoins || 0) + amt);
    localStorage.setItem('v_coins', window.globalCoins);
    window.updateBalanceDisplay();
};

// Живые часы и батарея (запуск БЕЗ ожидания событий)
window.initLiveStatusBar = function() {
    function tickClock() {
        const clockEl = document.getElementById('os-live-clock');
        if (!clockEl) return;
        const now = new Date();
        clockEl.innerText = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    tickClock();
    setInterval(tickClock, 1000);

    const battEl = document.getElementById('os-live-battery');
    if (battEl) {
        if (navigator.getBattery) {
            navigator.getBattery().then(b => {
                const upd = () => { battEl.innerText = Math.round(b.level * 100) + '%'; };
                upd();
                b.addEventListener('levelchange', upd);
            }).catch(() => { battEl.innerText = '100%'; });
        } else {
            battEl.innerText = '100%';
        }
    }
};

// Проверка видимости вкладки пасхалок (появляется только после >= 1 открытой)
window.checkEggsTabVisibility = function() {
    const unlocked = JSON.parse(localStorage.getItem('v_modular_eggs_v2') || '[]');
    const tabBtn = document.getElementById('btn-eggs');
    if (!tabBtn) return;
    tabBtn.style.display = (unlocked.length >= 1) ? 'inline-flex' : 'none';
};

// Автономная роль: на Vercel автоматически выдавать роль Владельца
window.isCurrentUserAdmin = function() {
    return true;
};

// Немедленный запуск статус-бара и баланса
setTimeout(() => {
    window.initLiveStatusBar();
    window.updateBalanceDisplay();
    window.checkEggsTabVisibility();
    
    // Переключение шапки в статус Владельца на Vercel
    const authBtn = document.getElementById('btn-auth-modal');
    if (authBtn) {
        authBtn.innerHTML = '👑 Вячеслав';
        authBtn.style.background = 'rgba(255,215,0,0.15)';
        authBtn.style.borderColor = '#ffd700';
        authBtn.style.color = '#ffd700';
    }
}, 50);


// =========================================================
// АВТОНОМНЫЙ СТАТУС-БАР, БАЛАНС И СИСТЕМА СКРЫТЫХ ПАСХАЛОК
// =========================================================

// 1. Монеты и баланс с сохранением в LocalStorage (работает на Vercel без сервера)
window.globalCoins = parseInt(localStorage.getItem('v_coins') || '5000', 10);

window.updateBalanceDisplay = function() {
    const b1 = document.getElementById('user-balance-val');
    const b2 = document.getElementById('catalog-balance-val');
    const allCoins = document.querySelectorAll('.coin-display-val');
    if (b1) b1.innerText = window.globalCoins;
    if (b2) b2.innerText = window.globalCoins;
    allCoins.forEach(el => el.innerText = window.globalCoins);
};

window.addCoins = function(amt) {
    window.globalCoins = Math.max(0, (window.globalCoins || 0) + amt);
    localStorage.setItem('v_coins', window.globalCoins);
    window.updateBalanceDisplay();
};

// 2. Живые часы и индикатор батареи
window.initLiveStatusBar = function() {
    function tickClock() {
        const clockEl = document.getElementById('os-live-clock');
        if (!clockEl) return;
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        clockEl.innerText = `${h}:${m}`;
    }
    tickClock();
    setInterval(tickClock, 1000);

    const battEl = document.getElementById('os-live-battery');
    if (navigator.getBattery) {
        navigator.getBattery().then(b => {
            const updateBatt = () => {
                if (battEl) battEl.innerText = Math.round(b.level * 100) + '%';
            };
            updateBatt();
            b.addEventListener('levelchange', updateBatt);
        }).catch(() => {});
    } else if (battEl) {
        battEl.innerText = '100%';
    }
};

// 3. Проверка видимости вкладки пасхалок (появляется только после >= 1 открытой)
window.checkEggsTabVisibility = function() {
    const unlocked = JSON.parse(localStorage.getItem('v_modular_eggs_v2') || '[]');
    const tabBtn = document.getElementById('btn-eggs');
    if (!tabBtn) return;

    if (unlocked.length >= 1) {
        tabBtn.style.display = 'inline-flex';
    } else {
        tabBtn.style.display = 'none';
    }
};

// 4. Разблокировка пасхалки с открытием секретной вкладки
window.unlockEgg = function(id) {
    let unlocked = JSON.parse(localStorage.getItem('v_modular_eggs_v2') || '[]');
    const isFirstEgg = (unlocked.length === 0);

    if (!unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem('v_modular_eggs_v2', JSON.stringify(unlocked));
        const egg = (window.EGGS_CONFIG || []).find(e => e.id === id);
        const rew = egg ? egg.reward : 350;
        window.addCoins(rew);

        if (isFirstEgg) {
            if (window.notify) notify(`✨ <b>СЕКРЕТ РАСКРЫТ:</b> Добавлена новая вкладка <b>🥚 Пасхалки</b> в верхнем меню! (+${rew} 🪙)`, 5000);
        } else {
            if (window.notify) notify(`🎉 <b>ПАСХАЛКА НАЙДЕНА:</b> ${egg ? egg.title : id}! (+${rew} 🪙)`, 4000);
        }
    }

    window.checkEggsTabVisibility();
    if (typeof window.playEggMusic === 'function') window.playEggMusic(id);
    if (typeof window.renderEggs === 'function') window.renderEggs();
};

// 5. Запуск ядра при старте страницы
document.addEventListener('DOMContentLoaded', () => {
    window.initLiveStatusBar();
    window.updateBalanceDisplay();
    window.checkEggsTabVisibility();
});


// =========================================================
// ВЯЧЕСЛАВ OS: МУЛЬТИ-ПРОФИЛИ & ДОСТУП К АДМИНКЕ
// =========================================================

// Инициализация структуры профилей
// Глобальные переменные сессии (управляются js/auth.js)
window.globalCoins = 5000;
window.playerXp = 0;
window.playerLevel = 1;
window.playerNick = 'Гость';
window.playerTitle = 'Гость';
window.playerAvatar = '👤';

function saveActiveProfile() {
    currentProfile.coins = window.globalCoins;
    currentProfile.xp = window.playerXp;
    currentProfile.level = window.playerLevel;
    currentProfile.nick = window.playerNick;
    currentProfile.title = window.playerTitle;
    currentProfile.avatar = window.playerAvatar;

    const idx = profilesList.findIndex(p => p.id === currentProfile.id);
    if (idx !== -1) profilesList[idx] = currentProfile;
    localStorage.setItem('v_os_profiles_v2', JSON.stringify(profilesList));
    localStorage.setItem('v_current_profile_id', currentProfile.id);
}

function addCoins(amt) {
    const mult = window.globalRewardMultiplier || 1;
    const actualAmt = (amt > 0 && mult > 1) ? Math.round(amt * mult) : amt;
    window.globalCoins = Math.max(0, window.globalCoins + actualAmt);
    if (window.syncUserDataToServer) window.syncUserDataToServer();
    updateAllCoinsUI();
}

function addXp(amt) {
    window.playerXp += amt;
    const nextLvl = window.playerLevel * 200;
    if (window.playerXp >= nextLvl) {
        window.playerXp -= nextLvl;
        window.playerLevel++;
        notify(`🎉 <b>НОВЫЙ УРОВЕНЬ: ${window.playerLevel}!</b>`, 3000);
    }
    if (window.syncUserDataToServer) window.syncUserDataToServer();
    renderProfile();
}

function updateAllCoinsUI() {
    ['hub-coins-val', 'cases-coins-val', 'shop-coin-count', 'prof-coins-val'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = window.globalCoins;
    });
}

// УПРАВЛЕНИЕ ERUDA (КОНСОЛЬЮ ОТЛАДКИ)
window.toggleErudaDevTools = function(enable) {
    localStorage.setItem('v_eruda_enabled', enable ? 'true' : 'false');
    if (enable) {
        if (!window.eruda) {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/eruda";
            script.onload = () => { if (window.eruda) window.eruda.init(); };
            document.head.appendChild(script);
        } else {
            window.eruda.init();
        }
        notify("🛠️ Консоль отладки Eruda включена!");
    } else {
        if (window.eruda) {
            try { window.eruda.destroy(); } catch (_) {}
        }
        notify("Консоль отладки скрыта ⏹");
    }
    const chk = document.getElementById('adm-toggle-eruda');
    if (chk) chk.checked = enable;
};

function initErudaOnLoad() {
    const isEnabled = localStorage.getItem('v_eruda_enabled') === 'true';
    const chk = document.getElementById('adm-toggle-eruda');
    if (chk) chk.checked = isEnabled;
    if (isEnabled) {
        window.toggleErudaDevTools(true);
    }
}

// ПРОВЕРКА И ОГРАНИЧЕНИЕ ДОСТУПА К АДМИНКЕ
function syncAdminTabAccess() {
    const adminBtn = document.getElementById('btn-admin');
    const isOwner = currentProfile.role === 'owner';

    if (adminBtn) {
        // Если аккаунт не владелец — кнопка админки полностью скрыта
        adminBtn.style.display = isOwner ? 'inline-flex' : 'none';
    }

    if (!isOwner) {
        const adminTab = document.getElementById('tab-admin');
        if (adminTab && adminTab.classList.contains('active')) {
            showTab('hub');
            notify("⛔ Доступ к Админке разрешён только Владельцу!");
        }
    }
}

// ПЕРЕКЛЮЧЕНИЕ ПРОФИЛЕЙ
window.switchProfile = function(profileId) {
    const target = profilesList.find(p => p.id === profileId);
    if (!target) return;

    if (target.role === 'owner') {
        const pass = prompt("Вход в аккаунт Владельца. Введите мастер-пароль:");
        if (pass !== 'admin777') {
            notify("❌ Неверный пароль владельца!");
            return;
        }
    }

    activeProfileId = target.id;
    currentProfile = target;
    window.currentProfile = currentProfile;
    window.globalCoins = currentProfile.coins;
    window.playerXp = currentProfile.xp;
    window.playerLevel = currentProfile.level;
    window.playerNick = currentProfile.nick;
    window.playerTitle = currentProfile.title;
    window.playerAvatar = currentProfile.avatar;

    localStorage.setItem('v_current_profile_id', activeProfileId);
    localStorage.setItem('v_user_cases', JSON.stringify(currentProfile.cases || {}));
    localStorage.setItem('v_installed_cyberware', JSON.stringify(currentProfile.implants || []));

    updateAllCoinsUI();
    renderProfile();
    renderProfilesManagerUI();
    syncAdminTabAccess();
    if (window.renderImplantsUI) window.renderImplantsUI();
    if (window.renderCases) window.renderCases();

    notify(`👤 Переключено на профиль: <b>${currentProfile.nick}</b>!`);
};

window.createNewUserProfile = function() {
    const name = prompt("Введите имя нового пользователя:");
    if (!name || !name.trim()) return;

    const newP = {
        id: 'user_' + Date.now(),
        nick: name.trim(),
        role: 'user',
        title: '🎮 Новичок',
        avatar: '👤',
        coins: 100,
        xp: 0,
        level: 1,
        cases: { "case_wood": 1, "case_neon": 0, "case_pro": 0 },
        implants: []
    };

    profilesList.push(newP);
    localStorage.setItem('v_os_profiles_v2', JSON.stringify(profilesList));
    renderProfilesManagerUI();
    notify(`Профиль <b>${newP.nick}</b> создан!`);
};

function renderProfilesManagerUI() {
    const wrap = document.getElementById('profiles-list-wrap');
    if (!wrap) return;

    wrap.innerHTML = profilesList.map(p => {
        const isCur = p.id === currentProfile.id;
        const isOwner = p.role === 'owner';
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid ${isCur ? 'var(--accent)' : 'var(--border)'}; border-radius:10px; padding:8px 10px; margin-bottom:6px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:24px;">${p.avatar || '👤'}</span>
                    <div>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <b style="font-size:12px; color:${isCur ? 'var(--accent)' : '#fff'};">${p.nick}</b>
                            <span class="${isOwner ? 'role-badge-owner' : 'role-badge-user'}">${isOwner ? 'ROOT' : 'USER'}</span>
                        </div>
                        <div style="font-size:10px; color:var(--text-dim);">Ур. ${p.level} • ${p.coins} 🪙</div>
                    </div>
                </div>
                <div>
                    ${isCur ? `
                        <span style="font-size:10px; font-weight:bold; color:var(--success);">АКТИВЕН ✓</span>
                    ` : `
                        <button class="p-btn" style="padding:4px 10px; font-size:10px;" onclick="switchProfile('${p.id}')">Войти</button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function initLiveSystemSensors() {
    const clockEl = document.getElementById('os-live-clock');
    const battEl = document.getElementById('os-live-battery');

    function updateTime() {
        if (!clockEl) return;
        const now = new Date();
        clockEl.innerText = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    updateTime();
    setInterval(updateTime, 1000);

    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            function updateBattery() {
                if (!battEl) return;
                battEl.innerText = `${Math.round(battery.level * 100)}% ${battery.charging ? '⚡' : '🔋'}`;
            }
            updateBattery();
            battery.addEventListener('levelchange', updateBattery);
            battery.addEventListener('chargingchange', updateBattery);
        }).catch(() => {});
    }
}

// ДИЗАЙНЫ ИНТЕРФЕЙСА
const UI_DESCRIPTIONS = {
    'default': '● Неон OS: классический сбалансированный стиль окон.',
    'beta': '● BETA 2.0: парящий нижний док и широкие кибер-баннеры.',
    'glass': '● Liquid Glass: глубокий акрил, размытие 18px и световые блики.',
    'scifi': '● Sci-Fi HUD: тактические скошенные углы 45° и кибер-контуры.',
    'neumorph': '● Neumorph 3D: глубокие мягкие тени и тактильный рельеф кнопок.',
    'tetris': '● Тетрис 8-Bit: блочная пиксельная геометрия и жёсткие тени.',
    'gameboy': '● GameBoy Classic: аркадные округлые формы ретро-консоли.',
    'cyberpunk': '● Киберпанк 2077: агрессивные углы и неоновые контуры.',
    'synthwave': '● Синтвейв 80-х: мягкий неон и парящие формы.',
    'oled': '● Чёрный OLED: минималистичные тонкие рамки без теней.'
};

window.setUiDesign = function(style) {
    document.body.classList.remove(
        'ui-beta', 'ui-glass', 'ui-scifi', 'ui-neumorph',
        'ui-tetris', 'ui-gameboy', 'ui-cyberpunk', 'ui-synthwave',
        'ui-oled'
    );
    if (style && style !== 'default') {
        document.body.classList.add('ui-' + style);
    }
    localStorage.setItem('v_ui_design_choice', style);
    const sel = document.getElementById('set-ui-style-select');
    if (sel) sel.value = style;
    const descEl = document.getElementById('ui-design-desc');
    if (descEl) descEl.innerText = UI_DESCRIPTIONS[style] || '● Дизайн интерфейса.';
    notify(`Дизайн: <b>${style}</b>!`);
};

window.setGlobalTheme = function(theme) {
    document.body.classList.remove('gold-mode', 'black-mode', 'emerald-mode', 'purple-mode', 'cyberpunk-mode', 'toxic-mode', 'sakura-mode');
    if (theme && theme !== 'default') {
        document.body.classList.add(theme + '-mode');
    }
    localStorage.setItem('v_theme_choice', theme);
    notify(`Цветовая тема: <b>${theme}</b>!`);
};

window.showTab = function(tabId, btn) {
    try {
        if (tabId === 'admin') {
            const isAdm = window.isCurrentUserAdmin && window.isCurrentUserAdmin();
            if (!isAdm) {
                if (window.notify) notify("⛔ Доступ к Админке разрешён только Владельцу (Вячеслав)!");
                if (window.openAuthModal) window.openAuthModal('login');
                return;
            }
        }

        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

        const target = document.getElementById('tab-' + tabId);
        if (target) {
            target.classList.add('active');
        } else {
            console.warn("Экран tab-" + tabId + " не найден в DOM!");
        }

        if (btn) {
            btn.classList.add('active');
        } else {
            const b = document.getElementById('btn-' + tabId);
            if (b) b.classList.add('active');
        }

        // Вызовы рендера для конкретных экранов
        if (tabId === 'eggs') {
            if (typeof window.renderEggs === 'function') window.renderEggs();
        } else if (tabId === 'admin') {
            const authCard = document.getElementById('admin-auth');
            const dashCard = document.getElementById('admin-dashboard');
            if (authCard) authCard.style.display = 'none';
            if (dashCard) dashCard.style.display = 'flex';
            if (typeof loadBackupVersionsList === 'function') loadBackupVersionsList();
            if (window.initAdminCli) window.initAdminCli();
        } else if (tabId === 'profile') {
            if (typeof window.renderProfile === 'function') window.renderProfile();
        }
    } catch (err) {
        console.error("Ошибка в showTab:", err);
    }
};

// ЗАПУСК ИГР
let activeGameId = null;
window.restartCurrentGame = function() {
    if (activeGameId) openGame(activeGameId);
};

window.openGame = function(id) {
    activeGameId = id;
    if (window.resetNeuroShield) window.resetNeuroShield();
    showTab('gameplay');

    const mount = document.getElementById('game-mount');
    const titleEl = document.getElementById('game-title');
    if (!mount) return;
    mount.innerHTML = '';

    const gameNames = {
        'survivors': 'Cyber Survivors ⚡',
        'jump': 'Cyber Jump PRO 🚀',
        'blockblast': 'Block Blast ULTRA 🧩',
        'party4p': 'Cyber Gliders 4P 🎮',
        'sumo4p': 'Сумо-Бот 4P 🛡️',
        'racer': 'Кибер-Гонки 🏎️',
        'game2048': '2048 Compact 🔢',
        'snake': 'Змейка 60FPS 🐍',
        'minesweeper': 'Сапёр 💣',
        'lights': 'Взлом 5x5 💡',
        'clicker': 'Кликер 💎'
    };
    if (titleEl) titleEl.innerText = gameNames[id] || 'Игра';

    const funcMap = {
        'survivors': window.initSurvivors,
        'jump': window.initJump,
        'blockblast': window.initBlockBlast,
        'party4p': window.initParty4P || window.initGliders,
        'sumo4p': window.initSumo4P || window.initSumo,
        'racer': window.initRacer,
        'game2048': window.init2048,
        'snake': window.initSnake,
        'minesweeper': window.initMinesweeper,
        'lights': window.initLights,
        'clicker': window.initClicker
    };

    const runner = funcMap[id];
    if (typeof runner === 'function') {
        try { runner(mount); } catch (err) {
            mount.innerHTML = `<div style="text-align:center; padding:24px; color:var(--danger);">Ошибка в игре: ${err.message}</div>`;
        }
    } else {
        mount.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-dim);">Скрипт games/${id}.js загружается...</div>`;
    }
};

// БЭКАПЫ
window.checkAdminPin = function() {
    const pin = document.getElementById('admin-pin').value;
    if (pin === 'admin777') {
        document.getElementById('admin-auth').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'flex';
        loadBackupVersionsList();
        if (window.initAdminCli) window.initAdminCli();
        notify("Доступ предоставлен ⚡");
    } else {
        notify("❌ Неверный пароль!");
    }
};

window.exitAdmin = function() {
    document.getElementById('admin-auth').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('admin-pin').value = '';
    showTab('hub');
};

window.loadBackupVersionsList = function() {
    const sel = document.getElementById('adm-backup-select');
    if (!sel) return;
    fetch('/api/backups')
        .then(r => r.json())
        .then(data => {
            let opts = '<option value="LATEST">⚡ АКТУАЛЬНАЯ ВЕРСИЯ</option>';
            if (data.versions) {
                data.versions.slice().reverse().forEach(v => {
                    const isCur = (data.active === v) ? 'selected' : '';
                    opts += `<option value="${v}" ${isCur}>${v}</option>`;
                });
            }
            sel.innerHTML = opts;
        }).catch(() => {});
};

window.adminRestoreSelectedVersion = function() {
    const sel = document.getElementById('adm-backup-select');
    const version = sel ? sel.value : 'LATEST';
    notify(`Загрузка ${version}...`);
    fetch(`/api/switch?version=${encodeURIComponent(version)}`)
        .then(r => r.json())
        .then(res => { if (res.success) location.reload(); })
        .catch(err => notify("Ошибка: " + err));
};

window.adminDeleteSelectedVersion = function() {
    const sel = document.getElementById('adm-backup-select');
    const version = sel ? sel.value : null;
    if (!version || version === 'LATEST') {
        notify("❌ Нельзя удалить актуальную версию!");
        return;
    }
    if (!confirm(`Удалить архивную копию ${version}?`)) return;

    fetch(`/api/delete_backup?version=${encodeURIComponent(version)}`)
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                notify(`🗑️ Копия <b>${version}</b> удалена!`);
                loadBackupVersionsList();
            } else {
                notify("❌ " + (res.error || "Ошибка"));
            }
        })
        .catch(err => notify("Ошибка: " + err.message));
};

window.adminDeleteAllOldBackups = function() {
    if (!confirm("Удалить ВСЕ старые копии до актуальной версии?")) return;
    notify("⏳ Очистка всех архивов...");
    fetch('/api/delete_all_backups')
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                notify(`🧹 Удалено: ${res.deleted_count}. Сохранена: <b>${res.kept}</b>!`, 4500);
                loadBackupVersionsList();
            } else {
                notify("❌ " + (res.error || "Ошибка"));
            }
        })
        .catch(err => notify("Ошибка: " + err.message));
};

window.adminCreateNewBackupSnapshot = function() {
    notify("⏳ Создание снимка файловой системы...");
    fetch('/api/create_backup')
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                notify(`💾 Снимок <b>${res.version}</b> зафиксирован!`, 4000);
                loadBackupVersionsList();
            }
        })
        .catch(err => notify("Ошибка: " + err));
};

// ЖИВЫЕ ОБОИ
let currentWallpaper = localStorage.getItem('v_live_wallpaper') || 'synthwave';
let bgAnimFrame = null;
let bgCanvas, bgCtx;
let bgParticles = [];

function initLiveWallpaperEngine() {
    bgCanvas = document.getElementById('live-bg-canvas');
    if (!bgCanvas) return;
    bgCtx = bgCanvas.getContext('2d');

    function resizeBg() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }
    resizeBg();
    window.addEventListener('resize', resizeBg);

    bgParticles = [];
    for (let i = 0; i < 50; i++) {
        bgParticles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vy: 0.5 + Math.random() * 2,
            char: String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
        });
    }

    let gridOffset = 0;
    function renderBgLoop() {
        if (!bgCtx) return;
        const w = bgCanvas.width;
        const h = bgCanvas.height;

        if (currentWallpaper === 'off') {
            bgCtx.clearRect(0, 0, w, h);
            return;
        }

        if (currentWallpaper === 'synthwave') {
            bgCtx.fillStyle = '#070c16';
            bgCtx.fillRect(0, 0, w, h);
            const horizon = h * 0.65;
            gridOffset = (gridOffset + 0.8) % 30;
            bgCtx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
            bgCtx.lineWidth = 1;

            for (let y = horizon; y < h; y += 14 + (y - horizon) * 0.2) {
                const yDraw = y + (gridOffset * (y - horizon) / h);
                if (yDraw < h) {
                    bgCtx.beginPath();
                    bgCtx.moveTo(0, yDraw);
                    bgCtx.lineTo(w, yDraw);
                    bgCtx.stroke();
                }
            }
            for (let x = -w * 0.5; x < w * 1.5; x += 45) {
                bgCtx.beginPath();
                bgCtx.moveTo(w / 2 + (x - w / 2) * 0.1, horizon);
                bgCtx.lineTo(x, h);
                bgCtx.stroke();
            }
        } else if (currentWallpaper === 'matrix') {
            bgCtx.fillStyle = 'rgba(7, 12, 22, 0.18)';
            bgCtx.fillRect(0, 0, w, h);
            bgCtx.fillStyle = '#10b981';
            bgCtx.font = '12px monospace';
            bgParticles.forEach(p => {
                bgCtx.fillText(p.char, p.x, p.y);
                p.y += p.vy * 3;
                if (p.y > h) { p.y = 0; p.x = Math.random() * w; }
            });
        }

        bgAnimFrame = requestAnimationFrame(renderBgLoop);
    }

    if (bgAnimFrame) cancelAnimationFrame(bgAnimFrame);
    renderBgLoop();
}

window.setLiveWallpaper = function(mode) {
    currentWallpaper = mode;
    localStorage.setItem('v_live_wallpaper', mode);
    notify(`Обои: <b>${mode}</b>!`);
    initLiveWallpaperEngine();
};

// СТРИК И КВЕСТЫ
let streakDay = parseInt(localStorage.getItem('v_streak_day') || '1', 10);
const streakRewards = [50, 100, 150, 200, 250, 300, '📦 КЕЙС'];

function renderStreak() {
    const wrap = document.getElementById('streak-days-wrap');
    if (!wrap) return;
    wrap.innerHTML = streakRewards.map((rew, idx) => {
        const dNum = idx + 1;
        const isCur = dNum === streakDay;
        return `
            <div style="flex:1; min-width:44px; background:#0b1220; border:1px solid ${isCur ? '#ffd700':'var(--border)'}; border-radius:8px; padding:6px 2px; text-align:center; font-size:9px;">
                <div style="color:var(--text-dim);">День ${dNum}</div>
                <div style="font-size:11px; font-weight:800; color:${isCur ? '#ffd700':'#fff'};">${rew}</div>
            </div>
        `;
    }).join('');
}

window.claimStreakDay = function() {
    addCoins(100);
    streakDay = (streakDay % 7) + 1;
    localStorage.setItem('v_streak_day', streakDay);
    renderStreak();
    notify("🎁 Награда за стрик получена!");
};

function renderQuests() {
    const wrap = document.getElementById('quests-list-wrap');
    if (!wrap) return;
    wrap.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:10px; padding:8px 10px;">
            <div>
                <div style="font-size:12px; font-weight:700;">Сыграть в любую игру</div>
                <div style="font-size:10px; color:var(--text-dim);">Награда: +100 🪙</div>
            </div>
            <button class="p-btn" style="background:var(--accent); color:#000; font-weight:800; padding:4px 10px;" onclick="addCoins(100); this.disabled=true; this.innerText='Забрано ✓';">Забрать</button>
        </div>
    `;
}

const CASES_LIST = [
    { id: 'case_wood', name: 'Деревянный Кейс', icon: '📦', price: 100, minC: 50, maxC: 250, color: '#94a3b8' },
    { id: 'case_neon', name: 'Неоновый Кейс', icon: '🧩', price: 250, minC: 150, maxC: 600, color: '#38bdf8' },
    { id: 'case_pro', name: 'Кибер-Кейс PRO', icon: '💼', price: 600, minC: 450, maxC: 1500, color: '#ffd700' }
];

function renderCases() {
    const grid = document.getElementById('cases-catalog-grid');
    if (!grid) return;
    const userCases = JSON.parse(localStorage.getItem('v_user_cases') || '{"case_wood":0,"case_neon":0,"case_pro":0}');

    grid.innerHTML = CASES_LIST.map(c => {
        const count = userCases[c.id] || 0;
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:10px; padding:8px 10px; margin-bottom:6px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:28px;">${c.icon}</span>
                    <div>
                        <b style="font-size:12px; color:${c.color};">${c.name}</b>
                        <div style="font-size:10px; color:var(--text-dim);">У вас: <b>${count} шт.</b></div>
                    </div>
                </div>
                <div style="display:flex; gap:4px;">
                    <button class="p-btn" style="padding:4px 8px; font-size:10px;" onclick="buyCase('${c.id}')">${c.price} 🪙</button>
                    <button class="p-btn" style="padding:4px 10px; font-size:10px; background:var(--accent); color:#000; font-weight:800;" ${count <= 0 ? 'disabled style="opacity:0.4;"':''} onclick="openCaseAction('${c.id}')">Открыть</button>
                </div>
            </div>
        `;
    }).join('');
}

window.buyCase = function(id) {
    const c = CASES_LIST.find(x => x.id === id);
    if (!c || window.globalCoins < c.price) { notify("❌ Недостаточно монет!"); return; }
    addCoins(-c.price);
    let u = JSON.parse(localStorage.getItem('v_user_cases') || '{}');
    u[id] = (u[id] || 0) + 1;
    localStorage.setItem('v_user_cases', JSON.stringify(u));
    renderCases();
    notify(`Куплен: <b>${c.name}</b>!`);
};

window.openCaseAction = function(id) {
    let u = JSON.parse(localStorage.getItem('v_user_cases') || '{}');
    if (!u[id] || u[id] <= 0) return;
    const c = CASES_LIST.find(x => x.id === id);
    u[id]--;
    localStorage.setItem('v_user_cases', JSON.stringify(u));
    renderCases();

    const win = Math.floor(c.minC + Math.random() * (c.maxC - c.minC));
    addCoins(win);
    notify(`🎁 Из кейса выпало: <b>+${win} 🪙</b>!`, 4000);
};

function renderShop() {
    const grid = document.getElementById('shop-dynamic-grid');
    if (!grid) return;
    grid.innerHTML = `
        <div class="glass-card" style="text-align:center; padding:12px;">
            <span style="font-size:32px;">👑</span>
            <div style="font-weight:800; font-size:12px; margin-top:4px;">Золотой Статус</div>
            <button class="p-btn" style="margin-top:8px; width:100%; background:var(--accent); color:#000; font-weight:800;" onclick="window.playerTitle='👑 Владелец OS'; saveActiveProfile(); notify('Статус обновлён!');">Активировать</button>
        </div>
    `;
}

function renderProfile() {
    const isAuth = !!window.currentUser && window.currentUser.role !== 'guest';
    const isOwner = isAuth && window.currentUser.role === 'admin';

    const n = document.getElementById('prof-name-val'); if (n) n.innerText = window.playerNick || 'Гость';
    const l = document.getElementById('prof-lvl-badge'); if (l) l.innerText = `Уровень ${window.playerLevel || 1}`;
    const x = document.getElementById('prof-xp-val'); if (x) x.innerText = `${window.playerXp || 0} / ${(window.playerLevel || 1) * 200}`;
    const b = document.getElementById('prof-xp-bar'); if (b) b.style.width = Math.min(100, ((window.playerXp || 0) / ((window.playerLevel || 1) * 200)) * 100) + '%';
    const a = document.getElementById('avatar-icon-txt'); if (a) a.innerText = window.playerAvatar || '👤';

    const roleBadge = document.getElementById('prof-role-badge');
    if (roleBadge) {
        if (!isAuth) {
            roleBadge.className = 'role-badge-user';
            roleBadge.innerText = 'ГОСТЬ / НЕ АВТОРИЗОВАН';
        } else if (isOwner) {
            roleBadge.className = 'role-badge-owner';
            roleBadge.innerText = '👑 ВЛАДЕЛЕЦ [ROOT]';
        } else {
            roleBadge.className = 'role-badge-user';
            roleBadge.innerText = 'ПОЛЬЗОВАТЕЛЬ';
        }
    }
}

window.switchProfSubTab = function(pane) {
    document.querySelectorAll('.prof-sub-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('psub-btn-' + pane);
    if (btn) btn.classList.add('active');
    ['stats', 'implants', 'profiles'].forEach(p => {
        const el = document.getElementById('prof-pane-' + p);
        if (el) el.style.display = (p === pane) ? 'block' : 'none';
    });
    if (pane === 'implants' && window.renderImplantsUI) window.renderImplantsUI();
    if (pane === 'profiles') renderProfilesManagerUI();
};

window.notify = function(txt, duration = 2400) {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const el = document.createElement('div');
    el.className = 'toast-msg';
    el.innerHTML = txt;
    c.appendChild(el);
    setTimeout(() => el.remove(), duration);
};

window.ensureAudioReady = function() {
    if (!window.audioCtxInstance) window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)();
    if (window.audioCtxInstance.state === 'suspended') window.audioCtxInstance.resume();
};

const EGGS_CONFIG = [
    { id: "nezabudka", title: "Незабудка", desc: "Секрет в 2048", action: () => notify("Пасхалка Незабудка!") },
    { id: "67", title: "Газан — 67", desc: "Калькулятор = 67", action: () => notify("Пасхалка 67!") },
    { id: "sigma", title: "Сигма Бой", desc: "Калькулятор = 52", action: () => notify("Пасхалка Сигма!") },
    { id: "sigma_rus", title: "Отечественный Сигма", desc: "Секретная каска", action: () => notify("Пасхалка Сигма Рус!") },
    { id: "matrix", title: "Матрица", desc: "Тапы по футеру", action: () => { setLiveWallpaper('matrix'); notify("Матрица активирована!"); } }
];

let unlockedEggs = JSON.parse(localStorage.getItem('v_modular_eggs_v2') || '[]');
window.unlockEgg = function(id) {
    if (!unlockedEggs.includes(id)) {
        unlockedEggs.push(id);
        localStorage.setItem('v_modular_eggs_v2', JSON.stringify(unlockedEggs));
        notify(`🎉 Пасхалка найдена: <b>${id}</b>!`);
    }
    renderEggs();
};

function renderEggs() {
    const c = document.getElementById('eggs-container');
    const cnt = document.getElementById('egg-count');
    if (cnt) cnt.innerText = `${unlockedEggs.length} / ${EGGS_CONFIG.length}`;
    if (!c) return;
    c.innerHTML = EGGS_CONFIG.map(e => `
        <div class="glass-card" style="margin-bottom:6px;">
            <b>${unlockedEggs.includes(e.id) ? e.title : '???'}</b>
            <div style="font-size:10px; color:var(--text-dim);">${e.desc}</div>
        </div>
    `).join('');
}

function bootApp() {
    updateAllCoinsUI();
    initLiveSystemSensors();
    initLiveWallpaperEngine();
    renderStreak();
    renderQuests();
    renderCases();
    renderProfile();
    renderProfilesManagerUI();
    syncAdminTabAccess();
    initErudaOnLoad();

    const savedUi = localStorage.getItem('v_ui_design_choice') || 'default';
    setUiDesign(savedUi);
    const savedTheme = localStorage.getItem('v_theme_choice');
    if (savedTheme) setGlobalTheme(savedTheme);

    const photoInp = document.getElementById('paint-photo-input');
    if (photoInp) photoInp.addEventListener('change', window.handlePhotoUpload);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootApp);
} else {
    bootApp();
}

// =========================================================
// ГИБРИДНЫЙ АУДИОПЛЕЕР ПАСХАЛОК (MP3 ОРИГИНАЛ + РЕЗЕРВНЫЙ СИНТ)
// =========================================================

let currentAudioObj = null;
let isEggMusicPlaying = false;
let activeEggTimers = [];

// Пути к реальным MP3 файлам в папке sounds/
const EGG_AUDIO_SOURCES = {
    '67': 'sounds/67.mp3',
    'sigma': 'sounds/sigma.mp3',
    'nezabudka': 'sounds/nezabudka.mp3',
    'sigma_rus': 'sounds/sigma_rus.mp3',
    'matrix': 'sounds/matrix.mp3'
};

window.stopEggMusic = function() {
    if (currentAudioObj) {
        currentAudioObj.pause();
        currentAudioObj.currentTime = 0;
        currentAudioObj = null;
    }
    activeEggTimers.forEach(t => clearTimeout(t));
    activeEggTimers = [];
    isEggMusicPlaying = false;

    document.querySelectorAll('.egg-music-btn').forEach(b => {
        b.innerText = '🎵 Трек';
        b.style.background = '';
    });
};

window.playEggMusic = function(id) {
    window.stopEggMusic();
    isEggMusicPlaying = true;

    const btn = document.getElementById('egg-music-btn-' + id);
    if (btn) {
        btn.innerText = '⏹ Стоп';
        btn.style.background = 'var(--accent-warm)';
    }

    const mp3Path = EGG_AUDIO_SOURCES[id];

    // Попытка 1: Воспроизвести настоящий MP3 файл
    if (mp3Path) {
        const audio = new Audio(mp3Path);
        currentAudioObj = audio;
        audio.volume = 0.7;

        audio.play().then(() => {
            notify(`🎶 Играет оригинальный трек: <b>${id}</b>!`, 3500);
            audio.onended = () => window.stopEggMusic();
        }).catch(() => {
            // Попытка 2: Если MP3 не найден (404), включается программный резерв
            console.warn(`[AUDIO] Файл ${mp3Path} не найден, запуск синтезатора-резерва`);
            playFallbackChiptune(id);
        });
    } else {
        playFallbackChiptune(id);
    }
};

// Программный резервный синтезатор (Web Audio)
function playFallbackChiptune(id) {
    const actx = window.audioCtxInstance || (window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)());
    if (actx.state === 'suspended') actx.resume();

    function note(freq, type, duration, timeOffset, vol = 0.22) {
        const tId = setTimeout(() => {
            if (!isEggMusicPlaying) return;
            try {
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, actx.currentTime);
                gain.gain.setValueAtTime(vol, actx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + duration);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start();
                osc.stop(actx.currentTime + duration);
            } catch (_) {}
        }, timeOffset * 1000);
        activeEggTimers.push(tId);
    }

    notify(`🔊 Играет резервный синтезатор (добавьте MP3 в sounds/${id}.mp3)`, 4000);

    if (id === '67') {
        const notes = [[130.81, 'sawtooth', 0.18, 0.0], [155.56, 'sawtooth', 0.25, 0.4], [174.61, 'sawtooth', 0.22, 0.7], [523.25, 'triangle', 0.2, 1.2], [622.25, 'triangle', 0.3, 1.6]];
        notes.forEach(p => note(p[0], p[1], p[2], p[3], 0.25));
        activeEggTimers.push(setTimeout(() => window.stopEggMusic(), 3500));
    } else if (id === 'sigma') {
        const notes = [[329.63, 0.2, 0.0], [392.0, 0.2, 0.25], [440.0, 0.22, 0.5], [493.88, 0.35, 0.75], [329.63, 0.4, 1.2]];
        notes.forEach(m => note(m[0], 'square', m[1], m[2], 0.2));
        activeEggTimers.push(setTimeout(() => window.stopEggMusic(), 3000));
    } else if (id === 'nezabudka') {
        const notes = [[329.63, 0.2, 0.0], [392.0, 0.2, 0.3], [440.0, 0.25, 0.6], [493.88, 0.35, 0.9], [329.63, 0.4, 1.3]];
        notes.forEach(m => note(m[0], 'sine', m[1], m[2], 0.25));
        activeEggTimers.push(setTimeout(() => window.stopEggMusic(), 3000));
    } else {
        const notes = [[110.0, 0.15, 0.0], [146.83, 0.2, 0.3], [220.0, 0.3, 0.6]];
        notes.forEach(m => note(m[0], 'sawtooth', m[1], m[2], 0.25));
        activeEggTimers.push(setTimeout(() => window.stopEggMusic(), 2500));
    }
}

window.unlockEgg = function(id) {
    let unlocked = JSON.parse(localStorage.getItem('v_modular_eggs_v2') || '[]');
    if (!unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem('v_modular_eggs_v2', JSON.stringify(unlocked));
        const egg = (window.EGGS_CONFIG || []).find(e => e.id === id);
        const rew = egg ? egg.reward : 250;
        if (window.addCoins) window.addCoins(rew);
        if (window.notify) window.notify(`🎉 <b>ПАСХАЛКА НАЙДЕНА:</b> ${egg ? egg.title : id}! (+${rew} 🪙)`, 4500);
    }
    // Автовоспроизведение трека найденной пасхалки
    window.playEggMusic(id);
    if (typeof window.renderEggs === 'function') window.renderEggs();
};

window.renderEggs = function() {
    const c = document.getElementById('eggs-container');
    const cnt = document.getElementById('egg-count');
    const unlocked = JSON.parse(localStorage.getItem('v_modular_eggs_v2') || '[]');

    if (cnt) cnt.innerText = `${unlocked.length} / ${window.EGGS_CONFIG.length}`;
    if (!c) return;

    c.innerHTML = window.EGGS_CONFIG.map(e => {
        const isOpen = unlocked.includes(e.id);
        return `
            <div class="glass-card" style="display:flex; justify-content:space-between; align-items:center; padding:12px; margin-bottom:8px; border-color:${isOpen ? '#ffd700' : 'var(--border)'}; background:${isOpen ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)'};">
                <div>
                    <div style="font-size:13px; font-weight:800; color:${isOpen ? '#ffd700' : '#fff'};">
                        ${isOpen ? e.title : '🔒 Секретная пасхалка'}
                    </div>
                    <div style="font-size:10px; color:var(--text-dim); margin-top:2px;">
                        ${isOpen ? e.desc : 'Подсказка: ' + e.hint}
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    ${isOpen ? `
                        <button class="p-btn egg-music-btn" id="egg-music-btn-${e.id}" style="padding:4px 9px; font-size:11px;" onclick="isEggMusicPlaying ? stopEggMusic() : playEggMusic('${e.id}')">🎵 Трек</button>
                        <span style="font-size:10px; font-weight:bold; color:#10b981; background:rgba(16,185,129,0.15); padding:3px 7px; border-radius:6px;">✓</span>
                    ` : `
                        <span style="font-size:11px; color:var(--accent-warm); font-weight:bold;">+${e.reward} 🪙</span>
                    `}
                </div>
            </div>
        `;
    }).join('');
};

// Интерактивные триггеры кликов для секретов
let avatarClickCounter = 0;
window.handleAvatarEggClick = function() {
    avatarClickCounter++;
    if (avatarClickCounter >= 7) {
        avatarClickCounter = 0;
        window.unlockEgg('sigma_rus');
    }
};

let clockClickCounter = 0;
window.handleClockEggClick = function() {
    clockClickCounter++;
    if (clockClickCounter >= 5) {
        clockClickCounter = 0;
        if (window.setLiveWallpaper) window.setLiveWallpaper('matrix');
        window.unlockEgg('matrix');
    }
};


// =========================================================
// СИСТЕМА ПАСХАЛОК И ВОЕННЫЙ СИГМА БОЙ (SIGMA_RUS.MP3)
// =========================================================

window.EGGS_CONFIG = [
    { id: "sigma_rus", title: "🪖 Военный Сигма (Отечественный)", desc: "Секретная армейская каска", hint: "Нажмите на военную каску 🪖 в профиле или наберите 1945 в калькуляторе", reward: 350 },
    { id: "sigma", title: "🗿 Сигма Бой (52 Дада)", desc: "Мемный трек Сигмы", hint: "Наберите 52 и нажмите = в калькуляторе", reward: 250 },
    { id: "67", title: "🎧 Газан — 67", desc: "Хит Газана", hint: "Наберите 67 и нажмите = в калькуляторе", reward: 250 },
    { id: "nezabudka", title: "🌸 Незабудка", desc: "Твой любимый цветок", hint: "Наберите 100 в калькуляторе или сыграйте в 2048", reward: 300 },
    { id: "matrix", title: "💻 Матричный Взлом", desc: "Цифровой дождь матрицы", hint: "Тапните 5 раз по часам в статус-баре", reward: 500 }
];

const EGG_AUDIO_SOURCES = {
    'sigma_rus': 'sounds/sigma_rus.mp3',
    'sigma': 'sounds/sigma.mp3',
    '67': 'sounds/67.mp3',
    'nezabudka': 'sounds/nezabudka.mp3',
    'matrix': 'sounds/matrix.mp3'
};

let currentAudioObj = null;
let isEggMusicPlaying = false;

window.stopEggMusic = function() {
    if (currentAudioObj) {
        try { currentAudioObj.pause(); currentAudioObj.currentTime = 0; } catch (_) {}
        currentAudioObj = null;
    }
    isEggMusicPlaying = false;
    document.querySelectorAll('.egg-music-btn').forEach(b => {
        b.innerText = '🎵 Трек';
        b.style.background = '';
    });
};

window.playEggMusic = function(id) {
    window.stopEggMusic();
    isEggMusicPlaying = true;

    const btn = document.getElementById('egg-music-btn-' + id);
    if (btn) {
        btn.innerText = '⏹ Стоп';
        btn.style.background = 'var(--accent-warm)';
    }

    const mp3Path = EGG_AUDIO_SOURCES[id];
    if (mp3Path) {
        const audio = new Audio(mp3Path);
        currentAudioObj = audio;
        audio.volume = 0.8;
        audio.play().then(() => {
            if (window.notify) notify(`🎶 Играет трек: <b>${id}</b>!`, 3500);
            audio.onended = () => window.stopEggMusic();
        }).catch((err) => {
            console.warn("MP3 play error:", err);
            if (window.notify) notify(`⚠️ Ошибка запуска ${mp3Path}, проверьте файл`, 3000);
        });
    }
};

window.unlockEgg = function(id) {
    let unlocked = JSON.parse(localStorage.getItem('v_modular_eggs_v2') || '[]');
    if (!unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem('v_modular_eggs_v2', JSON.stringify(unlocked));
        const egg = (window.EGGS_CONFIG || []).find(e => e.id === id);
        const rew = egg ? egg.reward : 350;
        if (window.addCoins) window.addCoins(rew);
        if (window.notify) window.notify(`🎉 <b>ПАСХАЛКА НАЙДЕНА:</b> ${egg ? egg.title : id}! (+${rew} 🪙)`, 4500);
    }
    window.playEggMusic(id);
    if (typeof window.renderEggs === 'function') window.renderEggs();
};

// АКТИВАЦИЯ ПАСХАЛКИ ВОЕННОГО СИГМЫ
window.triggerMilitarySigmaEgg = function() {
    const helmet = document.getElementById('prof-military-helmet');
    if (helmet) helmet.style.display = 'inline-block';
    window.playerAvatar = '🪖';
    window.playerTitle = '🪖 Военный Сигма';
    const aTxt = document.getElementById('avatar-icon-txt');
    if (aTxt) aTxt.innerText = '🪖';

    try { if (navigator.vibrate) navigator.vibrate([100, 50, 150]); } catch (_) {}
    window.unlockEgg('sigma_rus');
};

let avatarTaps = 0;
window.handleAvatarEggClick = function() {
    avatarTaps++;
    const aBox = document.querySelector('.prof-avatar-box');
    if (aBox) {
        aBox.style.transform = 'scale(0.88)';
        setTimeout(() => aBox.style.transform = '', 100);
    }
    if (avatarTaps >= 5) {
        avatarTaps = 0;
        window.triggerMilitarySigmaEgg();
    }
};

window.renderEggs = function() {
    const c = document.getElementById('eggs-container');
    const cnt = document.getElementById('egg-count');
    const unlocked = JSON.parse(localStorage.getItem('v_modular_eggs_v2') || '[]');

    if (cnt) cnt.innerText = `${unlocked.length} / ${window.EGGS_CONFIG.length}`;
    if (!c) return;

    c.innerHTML = window.EGGS_CONFIG.map(e => {
        const isOpen = unlocked.includes(e.id);
        return `
            <div class="glass-card" style="display:flex; justify-content:space-between; align-items:center; padding:12px; margin-bottom:8px; border-color:${isOpen ? '#ffd700' : 'var(--border)'}; background:${isOpen ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)'};">
                <div>
                    <div style="font-size:13px; font-weight:800; color:${isOpen ? '#ffd700' : '#fff'};">
                        ${isOpen ? e.title : '🔒 Секретная пасхалка'}
                    </div>
                    <div style="font-size:10px; color:var(--text-dim); margin-top:2px;">
                        ${isOpen ? e.desc : 'Подсказка: ' + e.hint}
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    ${isOpen ? `
                        <button class="p-btn egg-music-btn" id="egg-music-btn-${e.id}" style="padding:4px 9px; font-size:11px; background:rgba(255,215,0,0.15); border-color:#ffd700; color:#ffd700;" onclick="isEggMusicPlaying ? stopEggMusic() : playEggMusic('${e.id}')">🎵 Трек</button>
                        <span style="font-size:10px; font-weight:bold; color:#10b981; background:rgba(16,185,129,0.15); padding:3px 7px; border-radius:6px;">✓</span>
                    ` : `
                        <span style="font-size:11px; color:var(--accent-warm); font-weight:bold;">+${e.reward} 🪙</span>
                    `}
                </div>
            </div>
        `;
    }).join('');
};
