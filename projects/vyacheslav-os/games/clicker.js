function initClicker(mount) {
    document.getElementById('game-title').innerText = "Мульти-Кликер";

    if (window._clickerTimer) clearInterval(window._clickerTimer);

    const THEMES = {
        diamond: {
            id: 'diamond', name: '💎 Алмазы', cur: '💎', icon: '💎', accent: '#38bdf8',
            btnGrad: 'linear-gradient(135deg, #0284c7, #0f172a)',
            upgrades: [
                { id: 'u1', title: '⚡ Сила тапа', baseCost: 15, grow: 1.22, type: 'click', power: 1 },
                { id: 'u2', title: '🤖 Бур-робот', baseCost: 60, grow: 1.22, type: 'auto', power: 2 },
                { id: 'u3', title: '🌱 Кристальная грядка', baseCost: 320, grow: 1.25, type: 'auto', power: 10 },
                { id: 'u4', title: '⛏️ Карьер добычи', baseCost: 1500, grow: 1.28, type: 'auto', power: 45 }
            ]
        },
        roblox: {
            id: 'roblox', name: '🟥 Roblox', cur: 'R$', icon: '🪙', accent: '#ef4444',
            btnGrad: 'linear-gradient(135deg, #b91c1c, #0f172a)',
            upgrades: [
                { id: 'u1', title: '⚡ Клик Robux', baseCost: 15, grow: 1.22, type: 'click', power: 1 },
                { id: 'u2', title: '🎟️ VIP Gamepass', baseCost: 50, grow: 1.22, type: 'auto', power: 2 },
                { id: 'u3', title: '🧱 Тайкун-бизнес', baseCost: 300, grow: 1.25, type: 'auto', power: 9 },
                { id: 'u4', title: '👑 Сервер доната', baseCost: 1400, grow: 1.28, type: 'auto', power: 40 }
            ]
        },
        minecraft: {
            id: 'minecraft', name: '🟩 Minecraft', cur: '❇️', icon: '⛏️', accent: '#22c55e',
            btnGrad: 'linear-gradient(135deg, #15803d, #0f172a)',
            upgrades: [
                { id: 'u1', title: '⚡ Алмазная кирка', baseCost: 15, grow: 1.22, type: 'click', power: 1 },
                { id: 'u2', title: '🧟 Авто-ферма мобов', baseCost: 55, grow: 1.22, type: 'auto', power: 2 },
                { id: 'u3', title: '🤖 Фабрика големов', baseCost: 290, grow: 1.25, type: 'auto', power: 9 },
                { id: 'u4', title: '💎 Незеритовый бур', baseCost: 1350, grow: 1.28, type: 'auto', power: 38 }
            ]
        },
        hamster: {
            id: 'hamster', name: '🐹 Хомяк', cur: '🪙', icon: '🐹', accent: '#f59e0b',
            btnGrad: 'linear-gradient(135deg, #b45309, #0f172a)',
            upgrades: [
                { id: 'u1', title: '⚡ Тап за монету', baseCost: 15, grow: 1.22, type: 'click', power: 1 },
                { id: 'u2', title: '📢 Стрим на YouTube', baseCost: 50, grow: 1.22, type: 'auto', power: 2 },
                { id: 'u3', title: '🃏 Комбо-карты', baseCost: 280, grow: 1.25, type: 'auto', power: 8 },
                { id: 'u4', title: '🚀 Листинг токена', baseCost: 1250, grow: 1.28, type: 'auto', power: 35 }
            ]
        },
        csgo: {
            id: 'csgo', name: '🔫 CS Кейсы', cur: '💵', icon: '📦', accent: '#a855f7',
            btnGrad: 'linear-gradient(135deg, #7e22ce, #0f172a)',
            upgrades: [
                { id: 'u1', title: '⚡ Быстрый клик', baseCost: 20, grow: 1.22, type: 'click', power: 1 },
                { id: 'u2', title: '🤖 Трейд-бот', baseCost: 75, grow: 1.22, type: 'auto', power: 3 },
                { id: 'u3', title: '📊 Маркетплейс', baseCost: 350, grow: 1.25, type: 'auto', power: 12 },
                { id: 'u4', title: '🎰 Рулетка скинов', baseCost: 1600, grow: 1.28, type: 'auto', power: 50 }
            ]
        },
        hacker: {
            id: 'hacker', name: '💻 Кибер-Хакер', cur: '₿', icon: '💻', accent: '#00ff66',
            btnGrad: 'linear-gradient(135deg, #047857, #022c22)',
            upgrades: [
                { id: 'u1', title: '⚡ Скрипт клика', baseCost: 15, grow: 1.22, type: 'click', power: 1 },
                { id: 'u2', title: '👾 Ботнет-сеть', baseCost: 65, grow: 1.22, type: 'auto', power: 3 },
                { id: 'u3', title: '⛏️ Майнинг-ферма', baseCost: 340, grow: 1.25, type: 'auto', power: 11 },
                { id: 'u4', title: '🧠 ИИ-ядро', baseCost: 1550, grow: 1.28, type: 'auto', power: 48 }
            ]
        }
    };

    const themeKeys = Object.keys(THEMES);
    let curThemeId = localStorage.getItem('cl_active_theme') || 'diamond';
    if (!THEMES[curThemeId]) curThemeId = 'diamond';

    function loadThemeData(id) {
        const raw = localStorage.getItem(`cl_save_${id}`);
        if (raw) {
            try { return JSON.parse(raw); } catch (e) {}
        }
        return { balance: 0, upgrades: { u1: 1, u2: 0, u3: 0, u4: 0 }, extra: {} };
    }

    let state = loadThemeData(curThemeId);

    function saveCurrentTheme() {
        localStorage.setItem(`cl_save_${curThemeId}`, JSON.stringify(state));
        localStorage.setItem('cl_active_theme', curThemeId);
    }

    function getTheme() { return THEMES[curThemeId]; }

    function getClickPower() {
        const u1Lvl = state.upgrades.u1 || 1;
        let base = u1Lvl;
        if (curThemeId === 'minecraft' && state.extra.enchLvl) base *= (1 + state.extra.enchLvl * 0.5);
        if (curThemeId === 'hacker' && state.extra.ddosActive) base *= 10;
        if (curThemeId === 'roblox' && state.extra.spinMultiplier) base *= state.extra.spinMultiplier;
        return Math.max(1, Math.round(base));
    }

    function getPerSec() {
        const t = getTheme();
        let sum = 0;
        t.upgrades.forEach(u => {
            if (u.type === 'auto') {
                sum += (state.upgrades[u.id] || 0) * u.power;
            }
        });
        if (curThemeId === 'csgo' && state.extra.skinBoost) sum += state.extra.skinBoost;
        // Учет спидхака из админки
        if (window._adminSpeedhack) sum *= 10;
        return sum;
    }

    function getUpgradeCost(u) {
        const lvl = (u.type === 'click') ? ((state.upgrades[u.id] || 1) - 1) : (state.upgrades[u.id] || 0);
        return Math.floor(u.baseCost * Math.pow(u.grow, lvl));
    }

    mount.innerHTML = `
        <style>
            .cl-root { width: 100%; max-width: 380px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
            .cl-tabs-scroll { width: 100%; display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }
            .cl-tabs-scroll::-webkit-scrollbar { display: none; }
            .cl-tab-btn {
                background: #121c2e; border: 1px solid var(--border); color: var(--text-dim);
                padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; flex-shrink: 0;
            }
            .cl-tab-btn.active { background: var(--surface); color: #fff; border-color: var(--accent); }
            
            .cl-stats-card {
                width: 100%; background: #0b1325; border: 1px solid var(--border); border-radius: 12px; padding: 10px 14px; text-align: center;
            }
            .cl-balance-line { font-size: 28px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 6px; }
            
            /* ОГРОМНАЯ ЗОНА ДЛЯ СПАМ-КЛИКА МУЛЬТИТАЧЕМ */
            .cl-huge-pad {
                width: 100%; height: 175px; border-radius: 16px; border: 2px solid var(--border);
                display: flex; flex-direction: column; justify-content: center; align-items: center;
                cursor: pointer; user-select: none; position: relative; overflow: hidden;
                touch-action: none; -webkit-touch-callout: none;
                box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            }
            .cl-huge-pad:active { transform: scale(0.985); }
            .cl-pad-icon { font-size: 58px; pointer-events: none; }
            .cl-pad-hint { font-size: 11px; font-weight: 600; opacity: 0.6; margin-top: 4px; pointer-events: none; }

            .cl-fly-number {
                position: absolute; pointer-events: none; font-size: 17px; font-weight: 800;
                animation: clFlyUp 0.5s ease-out forwards;
            }
            @keyframes clFlyUp {
                0% { opacity: 1; transform: translateY(0) scale(1); }
                100% { opacity: 0; transform: translateY(-42px) scale(1.3); }
            }

            .cl-upg-grid { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
            .cl-upg-tile {
                background: #121c2e; border: 1px solid var(--border); border-radius: 10px; padding: 8px;
                display: flex; flex-direction: column; justify-content: space-between;
            }
        </style>

        <div class="cl-root">
            <div class="cl-tabs-scroll" id="cl-theme-tabs"></div>

            <div class="cl-stats-card">
                <div class="cl-balance-line" id="cl-score-display">
                    <span id="cl-bal">0</span> <span id="cl-cur-sym">💎</span>
                </div>
                <div style="display:flex; justify-content:space-around; font-size:12px; color:var(--text-dim); margin-top:4px;">
                    <span>За клик: <b id="cl-click-val">+1</b></span>
                    <span>В сек: <b id="cl-sec-val" style="color:var(--success);">+0</b></span>
                </div>
            </div>

            <div id="cl-feature-box" style="width:100%;"></div>

            <!-- Огромный сенсорный коврик под 2-4 пальца -->
            <div class="cl-huge-pad" id="cl-huge-tap">
                <div class="cl-pad-icon" id="cl-pad-ico">💎</div>
                <div class="cl-pad-hint">Тапайте любым количеством пальцев</div>
            </div>

            <div class="cl-upg-grid" id="cl-upgrades-list"></div>
        </div>
    `;

    const tabsContainer = document.getElementById('cl-theme-tabs');
    const elBal = document.getElementById('cl-bal');
    const elCurSym = document.getElementById('cl-cur-sym');
    const elClickVal = document.getElementById('cl-click-val');
    const elSecVal = document.getElementById('cl-sec-val');
    const tapPad = document.getElementById('cl-huge-tap');
    const padIco = document.getElementById('cl-pad-ico');
    const featureBox = document.getElementById('cl-feature-box');
    const upgradesBox = document.getElementById('cl-upgrades-list');

    function renderTabs() {
        tabsContainer.innerHTML = themeKeys.map(k => `
            <button class="cl-tab-btn ${k === curThemeId ? 'active' : ''}" onclick="window._switchTheme('${k}')">
                ${THEMES[k].name}
            </button>
        `).join('');
    }

    window._switchTheme = function(newId) {
        if (newId === curThemeId) return;
        saveCurrentTheme();
        curThemeId = newId;
        state = loadThemeData(curThemeId);
        renderAll();
    };

    function renderFeature() {
        const t = getTheme();
        if (curThemeId === 'roblox') {
            const mult = state.extra.spinMultiplier || 1;
            featureBox.innerHTML = `
                <div style="display:flex; justify-content:space-between; background:#121c2e; border:1px solid var(--border); padding:6px 10px; border-radius:8px; align-items:center;">
                    <span style="font-size:11px;">🎰 Спин: <b>${mult > 1 ? `Буст x${mult}!` : 'Готов'}</b></span>
                    <button class="p-btn" style="padding:3px 8px; font-size:10px; background:${t.accent}; color:#000;" onclick="window._robloxSpin()">Крутить</button>
                </div>
            `;
        } else if (curThemeId === 'hamster') {
            state.extra.energy = state.extra.energy !== undefined ? state.extra.energy : 1000;
            featureBox.innerHTML = `
                <div style="display:flex; justify-content:space-between; background:#121c2e; border:1px solid var(--border); padding:6px 10px; border-radius:8px; align-items:center;">
                    <span style="font-size:11px;">⚡ Энергия: <b>${Math.floor(state.extra.energy)}/1000</b></span>
                    <button class="p-btn" style="padding:3px 8px; font-size:10px; background:${t.accent}; color:#000;" onclick="window._hamsterRefill()">Буст ⚡</button>
                </div>
            `;
        } else {
            featureBox.innerHTML = '';
        }
    }

    window._robloxSpin = function() {
        const roll = Math.random() > 0.6 ? 3 : 2;
        state.extra.spinMultiplier = roll;
        notify(`🎰 Буст x${roll} активирован на 15 сек!`);
        setTimeout(() => { state.extra.spinMultiplier = 1; renderAll(); }, 15000);
        saveCurrentTheme();
        renderAll();
    };

    window._hamsterRefill = function() {
        state.extra.energy = 1000;
        notify("⚡ Энергия хомяка восполнена");
        saveCurrentTheme();
        renderAll();
    };

    function renderUpgrades() {
        const t = getTheme();
        upgradesBox.innerHTML = t.upgrades.map(u => {
            const cost = getUpgradeCost(u);
            const lvl = (u.type === 'click') ? (state.upgrades[u.id] || 1) : (state.upgrades[u.id] || 0);
            const canAfford = state.balance >= cost;
            const boostStr = (u.type === 'click') ? `+${u.power} к тапу` : `+${u.power}/с`;

            return `
                <div class="cl-upg-tile">
                    <div>
                        <div style="font-size:12px; font-weight:700;">${u.title}</div>
                        <div style="font-size:10px; color:var(--text-dim);">Ур. ${lvl} (${boostStr})</div>
                    </div>
                    <button class="p-btn" style="margin-top:6px; font-size:11px; padding:5px; ${canAfford ? `background:${t.accent}; color:#000; font-weight:700;` : 'color:#888;'}" onclick="window._buyUpg('${u.id}')">
                        ${cost.toLocaleString()} ${t.cur}
                    </button>
                </div>
            `;
        }).join('');
    }

    function renderAll() {
        const t = getTheme();
        renderTabs();
        elBal.innerText = Math.floor(state.balance).toLocaleString('ru-RU');
        elCurSym.innerText = t.cur;
        document.getElementById('cl-score-display').style.color = t.accent;
        elClickVal.innerText = `+${getClickPower()}`;
        elClickVal.style.color = t.accent;
        elSecVal.innerText = `+${getPerSec()}/с`;

        padIco.innerText = t.icon;
        tapPad.style.background = t.btnGrad;
        tapPad.style.borderColor = t.accent;

        renderFeature();
        renderUpgrades();
    }

    // МУЛЬТИТАЧ ОБРАБОТЧИК: обрабатывает каждый палец индивидуально
    function triggerSingleHit(clientX, clientY) {
        const t = getTheme();
        let gain = getClickPower();

        if (curThemeId === 'hamster') {
            if (state.extra.energy <= 0) return;
            state.extra.energy--;
        }

        let isCrit = (curThemeId === 'diamond' && Math.random() < 0.15);
        if (isCrit) gain *= 5;

        state.balance += gain;

        // Всплывающее число в месте касания
        const rect = tapPad.getBoundingClientRect();
        const p = document.createElement('span');
        p.className = 'cl-fly-number';
        p.style.color = isCrit ? '#fbbf24' : t.accent;
        p.innerText = isCrit ? `x5! +${gain}` : `+${gain}`;
        p.style.left = `${Math.min(Math.max((clientX - rect.left) - 15, 10), rect.width - 40)}px`;
        p.style.top = `${Math.min(Math.max((clientY - rect.top) - 20, 10), rect.height - 30)}px`;
        tapPad.appendChild(p);
        setTimeout(() => p.remove(), 450);

        if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate(10);
    }

    tapPad.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            triggerSingleHit(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
        }
        saveCurrentTheme();
        renderAll();
    }, { passive: false });

    tapPad.addEventListener('mousedown', (e) => {
        triggerSingleHit(e.clientX, e.clientY);
        saveCurrentTheme();
        renderAll();
    });

    window._buyUpg = function(uid) {
        const t = getTheme();
        const u = t.upgrades.find(x => x.id === uid);
        if (!u) return;
        const cost = getUpgradeCost(u);
        if (state.balance >= cost) {
            state.balance -= cost;
            state.upgrades[uid] = (state.upgrades[uid] || (u.type === 'click' ? 1 : 0)) + 1;
            saveCurrentTheme();
            renderAll();
        }
    };

    window._clickerTimer = setInterval(() => {
        const ps = getPerSec();
        if (ps > 0) {
            state.balance += (ps / 10);
            saveCurrentTheme();
            elBal.innerText = Math.floor(state.balance).toLocaleString('ru-RU');
        }
        if (curThemeId === 'hamster' && state.extra.energy < 1000) {
            state.extra.energy = Math.min(1000, state.extra.energy + 1);
            renderFeature();
        }
    }, 100);

    renderAll();
}
