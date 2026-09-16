// ==========================================
// МОДУЛЬ ПРОФИЛЯ: ИНВЕНТАРЬ, РЕКОРДЫ, ВИЗИТКА
// ==========================================
let activeProfSubTab = 'stats';

window.switchProfSubTab = function(tab) {
    activeProfSubTab = tab;
    if (typeof playSfx === 'function') playSfx('tap');
    document.querySelectorAll('.prof-sub-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`psub-btn-${tab}`);
    if (btn) btn.classList.add('active');

    const sPane = document.getElementById('prof-pane-stats');
    const iPane = document.getElementById('prof-pane-inv');
    const cPane = document.getElementById('prof-pane-card');

    if (sPane) sPane.style.display = tab === 'stats' ? 'block' : 'none';
    if (iPane) iPane.style.display = tab === 'inv' ? 'block' : 'none';
    if (cPane) cPane.style.display = tab === 'card' ? 'block' : 'none';

    if (tab === 'stats') renderProfileRecords();
    if (tab === 'inv') renderProfileInventory();
    if (tab === 'card') generateGamerCard();
};

window.changePlayerNickname = function() {
    if (typeof playSfx === 'function') playSfx('tap');
    const current = localStorage.getItem('v_user_nickname') || 'Вячеслав';
    const next = prompt("Введите ваш игровой никнейм:", current);
    if (next && next.trim().length > 0) {
        const clean = next.trim().slice(0, 16);
        localStorage.setItem('v_user_nickname', clean);
        const nameEl = document.getElementById('prof-name-val');
        if (nameEl) nameEl.innerText = clean;
        notify(`Ник изменён на: <b>${clean}</b>`);
        generateGamerCard();
    }
};

window.changePlayerTitle = function(val) {
    if (typeof playSfx === 'function') playSfx('tap');
    localStorage.setItem('v_user_title', val);
    notify(`Титул обновлён: ${val}`);
    generateGamerCard();
};

window.renderProfileRecords = function() {
    const c = document.getElementById('prof-records-container');
    if (!c) return;

    const GAMES_LIST = [
        { name: "Block Blast", icon: "🧩", key: "blockblast_best", unit: "pts" },
        { name: "Кибер-Гонки", icon: "🏎️", key: "racer_best", unit: "m" },
        { name: "Cyber Jump", icon: "🚀", key: "jump_best", unit: "m" },
        { name: "2048 Compact", icon: "🔢", key: "best2048", unit: "pts" },
        { name: "Тетрис PRO", icon: "🕹️", key: "tetris_best", unit: "pts" },
        { name: "Змейка 60FPS", icon: "🐍", key: "snake_v2_best", unit: "pts" },
        { name: "Flappy Bird", icon: "🐦", key: "flappy_best", unit: "pts" },
        { name: "Звёздный Защитник", icon: "🛸", key: "space_best", unit: "pts" },
        { name: "Cyber Runner", icon: "🏃", key: "runner_best", unit: "m" },
        { name: "Арканоид", icon: "🧱", key: "breakout_best", unit: "pts" }
    ];

    c.innerHTML = GAMES_LIST.map(g => {
        const val = parseInt(localStorage.getItem(g.key) || '0');
        return `
            <div class="record-box">
                <span style="font-size:10px; color:var(--text);">${g.icon} ${g.name}</span>
                <b style="color:var(--accent-warm); font-size:11px;">${val.toLocaleString()} ${g.unit}</b>
            </div>
        `;
    }).join('');
};

window.renderProfileInventory = function() {
    const c = document.getElementById('prof-inventory-container');
    const countEl = document.getElementById('inv-count-txt');
    if (!c) return;

    let inv = JSON.parse(localStorage.getItem('v_user_inventory') || '[]');
    if (inv.length === 0) {
        inv = [{ id: 1, name: "Кот-кодер", icon: "🐱", color: "#b0c3d9" }];
        localStorage.setItem('v_user_inventory', JSON.stringify(inv));
    }

    if (countEl) countEl.innerText = `${inv.length} предметов`;

    c.innerHTML = inv.map(it => {
        const sellPrice = it.color === '#ffd700' ? 350 : (it.color === '#eb4b4b' ? 180 : 40);
        return `
            <div class="inv-item" style="border-color:${it.color || 'var(--border)'};">
                <span style="font-size:26px;">${it.icon}</span>
                <b style="font-size:10px; color:${it.color || '#fff'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${it.name}</b>
                <div class="inv-actions">
                    <button class="p-btn" style="padding:2px 4px; font-size:9px; flex:1; background:var(--accent); color:#000;" onclick="equipFromInventory('${it.icon}')">Надеть</button>
                    <button class="p-btn" style="padding:2px 4px; font-size:9px; flex:1; color:var(--accent-warm);" onclick="sellInventoryItem(${it.id}, ${sellPrice})">+${sellPrice}🪙</button>
                </div>
            </div>
        `;
    }).join('');
};

window.equipFromInventory = function(icon) {
    if (typeof playSfx === 'function') playSfx('tap');
    localStorage.setItem('v_active_avatar', icon);
    const avTxt = document.getElementById('avatar-icon-txt');
    if (avTxt) avTxt.innerText = icon;
    notify(`Аватар экипирован: ${icon}`);
    generateGamerCard();
};

window.sellInventoryItem = function(id, price) {
    if (typeof playSfx === 'function') playSfx('coin');
    let inv = JSON.parse(localStorage.getItem('v_user_inventory') || '[]');
    if (inv.length <= 1) {
        notify("Нельзя продать единственный предмет!");
        return;
    }
    inv = inv.filter(x => x.id !== id);
    localStorage.setItem('v_user_inventory', JSON.stringify(inv));
    if (typeof addGlobalCoins === 'function') addGlobalCoins(price);
    renderProfileInventory();
    notify(`Предмет продан за +${price} 🪙!`);
};

window.generateGamerCard = function() {
    const cvs = document.getElementById('gamer-card-canvas');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const w = cvs.width;
    const h = cvs.height;

    const nick = localStorage.getItem('v_user_nickname') || 'Вячеслав';
    const title = localStorage.getItem('v_user_title') || '🎮 Киберспортсмен';
    const avatar = localStorage.getItem('v_active_avatar') || '👤';
    const xp = parseInt(localStorage.getItem('v_player_xp') || '0');
    const lvl = Math.floor(xp / 100) + 1;
    const coins = parseInt(localStorage.getItem('v_global_coins') || '0');

    const bgColor = document.getElementById('card-bg-sel')?.value || '#0f1c33';
    const borderColor = document.getElementById('card-border-sel')?.value || '#38bdf8';

    // Фон
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    // Рамка
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    // Аватар слева
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(52, 58, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(avatar, 52, 60);

    // Ник и титул
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(nick, 102, 42);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(title, 102, 64);

    // Уровень и монеты
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`LVL: ${lvl}`, 102, 88);

    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`🪙 ${coins.toLocaleString()}`, 190, 88);

    // Линия
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(16, 110);
    ctx.lineTo(w - 16, 110);
    ctx.stroke();

    // Топ-3 рекорда
    const bbBest = localStorage.getItem('blockblast_best') || '0';
    const rcBest = localStorage.getItem('racer_best') || '0';
    const jpBest = localStorage.getItem('jump_best') || '0';

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`🧩 BlockBlast:`, 18, 134);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`${parseInt(bbBest).toLocaleString()} pts`, 18, 154);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`🏎️ Гонки:`, 148, 134);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`${parseInt(rcBest).toLocaleString()} m`, 148, 154);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`🚀 CyberJump:`, 278, 134);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`${parseInt(jpBest).toLocaleString()} m`, 278, 154);

    // Копирайт
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText("VYATCHESLAV OS • 2026", w - 16, 186);
};

window.downloadGamerCard = function() {
    if (typeof playSfx === 'function') playSfx('tap');
    const cvs = document.getElementById('gamer-card-canvas');
    if (!cvs) return;
    const nick = localStorage.getItem('v_user_nickname') || 'Vyacheslav';
    const dl = document.createElement('a');
    dl.download = `${nick}_GamerCard_HD_2026.png`;
    dl.href = cvs.toDataURL('image/png');
    dl.click();
    notify("HD-визитка игрока скачана!");
};

window.renderProfile = function() {
    const nick = localStorage.getItem('v_user_nickname') || 'Вячеслав';
    const nameEl = document.getElementById('prof-name-val');
    if (nameEl) nameEl.innerText = nick;

    const titleSel = document.getElementById('prof-title-select');
    if (titleSel) titleSel.value = localStorage.getItem('v_user_title') || '🎮 Киберспортсмен';

    const avIcon = document.getElementById('avatar-icon-txt');
    if (avIcon) avIcon.innerText = localStorage.getItem('v_active_avatar') || '👤';

    const xp = parseInt(localStorage.getItem('v_player_xp') || '0');
    const lvl = Math.floor(xp / 100) + 1;
    const prog = xp % 100;

    const RANKS = ["Новичок", "Любитель", "Профи", "Ас", "Мастер", "Элита", "Грандмастер", "Легенда OS"];
    const rankName = RANKS[Math.min(RANKS.length - 1, Math.floor((lvl - 1) / 2))];

    const rEl = document.getElementById('prof-rank-name');
    if (rEl) rEl.innerText = rankName;

    const barEl = document.getElementById('prof-xp-bar');
    if (barEl) barEl.style.width = `${prog}%`;

    const xpVal = document.getElementById('prof-xp-val');
    if (xpVal) xpVal.innerText = `${xp} (${100 - prog} XP до ур. ${lvl + 1})`;

    if (activeProfSubTab === 'stats') renderProfileRecords();
    if (activeProfSubTab === 'inv') renderProfileInventory();
    if (activeProfSubTab === 'card') generateGamerCard();
};
