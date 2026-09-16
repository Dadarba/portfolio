// ==========================================
// МОДУЛЬ АДМИН-ПАНЕЛИ (GOD-MODE V4.0)
// ==========================================

window.checkAdminPin = function() {
    const pin = document.getElementById('admin-pin')?.value;
    if (pin === 'admin777') {
        const authBox = document.getElementById('admin-auth');
        const dashBox = document.getElementById('admin-dashboard');
        if (authBox) authBox.style.display = 'none';
        if (dashBox) dashBox.style.display = 'flex';
        admLog("Авторизация успешна. Режим разработчика активен.");
        notify("Доступ администратора открыт ⚡", 2000);
        renderStorageViewer();
    } else {
        notify("Неверный пароль администратора!");
    }
};

function admLog(msg) {
    const box = document.getElementById('adm-console-logs');
    if (!box) return;
    const time = new Date().toLocaleTimeString();
    box.innerHTML += `[${time}] ${msg}\n`;
    box.scrollTop = box.scrollHeight;
}

// 1. ДЕМОНСТРАЦИЯ ИНТРО И СБРОС ДАННЫХ
window.adminReplayIntroClean = function() {
    localStorage.removeItem('v_migrated_to_v2');
    notify("Перезагрузка для показа интро 2.0...", 1500);
    setTimeout(() => location.reload(), 600);
};

window.adminFactoryReset = function() {
    if (confirm("Вы уверены? Это полностью сотрет весь прогресс, монеты и рекорды в LocalStorage!")) {
        localStorage.clear();
        sessionStorage.clear();
        alert("LocalStorage полностью очищен! Сейчас запустится чистый старт 2.0.");
        location.reload();
    }
};

// 2. БАЛАНС, УРОВЕНЬ И BATTLE PASS
window.adminSetCoinsPreset = function(amt) {
    if (amt === 0) window.globalCoins = 0;
    else window.globalCoins += amt;
    localStorage.setItem('v_global_coins', window.globalCoins);
    if (typeof updateCoinsUI === 'function') updateCoinsUI();
    admLog(`Монеты изменены: ${window.globalCoins}`);
    notify(`Монеты: <b>${window.globalCoins.toLocaleString()} 🪙</b>`);
};

window.adminSetLevelPreset = function(lvl) {
    window.playerXP = (lvl - 1) * 100;
    localStorage.setItem('v_player_xp', window.playerXP);
    if (typeof renderProfile === 'function') renderProfile();
    admLog(`Уровень выставлен на ${lvl}`);
    notify(`Уровень профиля: <b>${lvl}</b>`);
};

window.adminSetBpTier = function(tier) {
    localStorage.setItem('v_bp_level', tier);
    localStorage.setItem('v_bp_xp', (tier - 1) * 350);
    if (typeof renderBattlePassUI === 'function') renderBattlePassUI();
    admLog(`Battle Pass уровень: ${tier}`);
    notify(`Battle Pass установлен на <b>Уровень ${tier}</b>!`);
};

// 3. СПАВНЕР ПИТОМЦЕВ И ЛЕГЕНДАРНЫХ ПРЕДМЕТОВ
window.adminUnlockPet = function(petId) {
    let owned = JSON.parse(localStorage.getItem('v_owned_pets') || '["pet_cat"]');
    if (!owned.includes(petId)) owned.push(petId);
    localStorage.setItem('v_owned_pets', JSON.stringify(owned));
    localStorage.setItem('v_active_pet', petId);
    if (typeof renderPetsUI === 'function') renderPetsUI();
    admLog(`Выдан питомец: ${petId}`);
    notify(`Питомец <b>${petId}</b> разблокирован и выбран!`);
};

window.adminGiveSpecialItem = function(name, icon, color) {
    let inv = JSON.parse(localStorage.getItem('v_user_inventory') || '[]');
    inv.push({ id: Date.now(), name: name, icon: icon, color: color });
    localStorage.setItem('v_user_inventory', JSON.stringify(inv));
    if (typeof renderProfileInventory === 'function') renderProfileInventory();
    admLog(`В инвентарь добавлен предмет: ${name}`);
    notify(`Получен предмет: <b>${icon} ${name}</b>!`);
};

// 4. ТУМБЛЕРЫ ЧИТОВ
window.adminMaxAllScores = function() {
    const games = [
        'blockblast_best', 'racer_best', 'jump_best', 'best2048',
        'tetris_best', 'snake_v2_best', 'flappy_best', 'space_best',
        'runner_best', 'breakout_best'
    ];
    games.forEach(g => localStorage.setItem(g, 99999));
    admLog("Все рекорды установлены на 99,999");
    notify("Все рекорды увеличены до 99,999! 🏆");
    if (typeof renderProfileRecords === 'function') renderProfileRecords();
};

window.adminUnlockEverything = function() {
    if (typeof SHOP_CATALOG !== 'undefined') {
        window.purchasedItems = SHOP_CATALOG.map(x => x.id);
        localStorage.setItem('v_purchased_items', JSON.stringify(window.purchasedItems));
    }
    localStorage.setItem('v_coin_doubler', 'true');
    localStorage.setItem('v_vip_active', 'true');
    localStorage.setItem('v_has_gold_pass', 'true');

    // Открываем всех питомцев
    localStorage.setItem('v_owned_pets', JSON.stringify(["pet_cat", "pet_dog", "pet_drone", "pet_dragon"]));

    admLog("Разблокирован весь контент: VIP, Gold Pass, питомцы, магазин!");
    notify("Всё разблокировано (VIP, Pass, Питомцы, Магазин)! 👑");
    if (typeof renderShopGrid === 'function') renderShopGrid();
    if (typeof renderPetsUI === 'function') renderPetsUI();
    if (typeof renderBattlePassUI === 'function') renderBattlePassUI();
};

// 5. ИНСПЕКТОР LOCALSTORAGE
window.renderStorageViewer = function() {
    const list = document.getElementById('adm-storage-list');
    if (!list) return;
    list.innerHTML = '';

    const keys = Object.keys(localStorage);
    if (keys.length === 0) {
        list.innerHTML = '<div style="color:var(--text-dim); font-size:10px;">LocalStorage пуст</div>';
        return;
    }

    keys.forEach(k => {
        const val = localStorage.getItem(k);
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:4px 6px; border-radius:6px; font-size:10px; font-family:monospace; margin-bottom:3px; gap:4px;';
        row.innerHTML = `
            <span style="color:var(--accent); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:120px;" title="${k}">${k}</span>
            <span style="color:#cbd5e1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; text-align:right;" title="${val}">${val}</span>
            <button class="p-btn" style="padding:1px 5px; font-size:9px; color:var(--danger);" onclick="adminDeleteStorageKey('${k}')">✕</button>
        `;
        list.appendChild(row);
    });
};

window.adminDeleteStorageKey = function(key) {
    localStorage.removeItem(key);
    admLog(`Удален ключ: ${key}`);
    renderStorageViewer();
    notify(`Ключ <b>${key}</b> удалён!`);
};

// 6. JS ТЕРМИНАЛ
window.adminRunTerminal = function() {
    const code = document.getElementById('adm-js-code')?.value;
    if (!code) return;
    try {
        const res = eval(code);
        admLog(`> ${code}\n< ${res !== undefined ? JSON.stringify(res) : 'OK'}`);
    } catch(err) {
        admLog(`! Ошибка: ${err.message}`);
    }
};

window.adminClearLogs = function() {
    const box = document.getElementById('adm-console-logs');
    if (box) box.innerHTML = '';
};

// Проверка наличия всех скриптов и экранов
window.adminCheckSystemIntegrity = function() {
    admLog("--- ДИАГНОСТИКА СИСТЕМЫ ---");
    
    const modules = [
        { name: "cards.js", check: typeof window.renderCardsUI === 'function' },
        { name: "cases.js", check: typeof window.renderCasesUI === 'function' },
        { name: "pets.js", check: typeof window.renderPetsUI === 'function' },
        { name: "pass.js", check: typeof window.renderBattlePassUI === 'function' },
        { name: "shop.js", check: typeof window.renderShopGrid === 'function' }
    ];
    
    modules.forEach(m => {
        if (m.check) {
            admLog(`✓ Модуль ${m.name}: <span style="color:#10b981;">АКТИВЕН</span>`);
        } else {
            admLog(`✕ Модуль ${m.name}: <span style="color:#ef4444; font-weight:800;">НЕ ЗАГРУЖЕН / СБОЙ</span>`);
        }
    });

    const screens = ['tab-games', 'tab-cases', 'tab-cards', 'tab-pets', 'tab-shop'];
    screens.forEach(s => {
        const el = document.getElementById(s);
        if (el) {
            admLog(`✓ Экран #${s}: <span style="color:#10b981;">В DOM</span>`);
        } else {
            admLog(`✕ Экран #${s}: <span style="color:#ef4444;">ОТСУТСТВУЕТ В HTML</span>`);
        }
    });

    if (window.systemErrorsLog && window.systemErrorsLog.length > 0) {
        admLog(`<span style="color:#ef4444;">Поймано ошибок (${window.systemErrorsLog.length}):</span>`);
        window.systemErrorsLog.forEach(e => admLog(`! ${e}`));
    } else {
        admLog("Ошибок выполнения не зафиксировано.");
    }
};
