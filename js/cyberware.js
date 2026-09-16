// =========================================================
// ВЯЧЕСЛАВ OS: АНАТОМИЯ КИБОРГА И АУГМЕНТАЦИИ
// =========================================================

(function() {
    const SLOTS_CONFIG = [
        { id: 'brain', slotName: '🧠 Модуль Мозга', name: 'Нейро-Ускоритель XP', icon: '🧠', desc: '+50% бонусного опыта за все активности', price: 400, lvl: 1 },
        { id: 'eyes', slotName: '👁️ Оптика HUD', name: 'Сканнер Уязвимостей', icon: '👁️', desc: 'Удваивает награду за яблоки в Змейке', price: 550, lvl: 2 },
        { id: 'heart', slotName: '🫀 Квантовое Ядро', name: 'Нано-Майнер Pulse', icon: '⚡', desc: 'Авто-майнинг: +12 🪙 каждые 40 секунд онлайн', price: 800, lvl: 2 },
        { id: 'torso', slotName: '🛡️ Экзо-Торс', name: 'Нейро-Щит «Второе Дыхание»', icon: '🛡️', desc: 'Спасение от 1 смертельного столкновения за игру', price: 650, lvl: 1 },
        { id: 'arms', slotName: '🦾 Серво-Руки', name: 'Квантовый Чип Фортуны', icon: '🎰', desc: '+40% к монетам при открытии кейсов', price: 950, lvl: 3 },
        { id: 'legs', slotName: '🦿 Кибер-Ноги', name: 'Турбо-Стабилизаторы', icon: '🦿', desc: 'Повышенная манёвренность в рогалике и гонках', price: 500, lvl: 2 }
    ];

    let installed = JSON.parse(localStorage.getItem('v_installed_cyberware') || '[]');
    let shieldCharged = true;

    window.hasNeuroShieldActive = function() {
        return installed.includes('torso') && shieldCharged;
    };

    window.consumeNeuroShield = function() {
        if (window.hasNeuroShieldActive()) {
            shieldCharged = false;
            window.renderImplantsUI();
            if (window.notify) window.notify("🛡️ <b>Нейро-Щит Экзо-Торса поглотил урон!</b>", 3500);
            return true;
        }
        return false;
    };

    window.resetNeuroShield = function() {
        shieldCharged = true;
        window.renderImplantsUI();
    };

    setInterval(() => {
        if (installed.includes('heart')) {
            if (window.addCoins) {
                window.addCoins(12);
                if (window.notify && Math.random() < 0.25) {
                    window.notify("⚡ Квантовое Ядро намайнило <b>+12 🪙</b>!", 2000);
                }
            }
        }
    }, 40000);

    window.getCyberSyncPercent = function() {
        return Math.round((installed.length / SLOTS_CONFIG.length) * 100);
    };

    window.renderImplantsUI = function() {
        const wrap = document.getElementById('prof-implants-grid');
        const syncBar = document.getElementById('cyber-sync-bar');
        const syncPct = document.getElementById('cyber-sync-pct');
        const syncRank = document.getElementById('cyber-sync-rank');
        if (!wrap) return;

        const pLvl = window.playerLevel || 1;
        const pct = window.getCyberSyncPercent();

        if (syncBar) syncBar.style.width = pct + '%';
        if (syncPct) syncPct.innerText = pct + '%';
        if (syncRank) {
            let rName = 'Человек (0%)';
            if (pct >= 100) rName = '👑 Квантовый Андроид (100%)';
            else if (pct >= 66) rName = '⚡ Киборг Класса Альфа';
            else if (pct >= 33) rName = '🦾 Аугментированный';
            syncRank.innerText = rName;
        }

        wrap.innerHTML = SLOTS_CONFIG.map(slot => {
            const isOwned = installed.includes(slot.id);
            const canLvl = pLvl >= slot.lvl;

            let extraStatus = '';
            if (slot.id === 'torso' && isOwned) {
                extraStatus = shieldCharged 
                    ? '<span style="color:#10b981; font-size:9px; font-weight:bold;">[ЩИТ ЗАРЯЖЕН ⚡]</span>' 
                    : '<span style="color:#ef4444; font-size:9px; font-weight:bold;">[РАЗРЯЖЕН]</span>';
            }

            return `
                <div class="glass-card" style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; margin-bottom:8px; border-color:${isOwned ? 'var(--accent)' : 'var(--border)'}; background:${isOwned ? 'rgba(56,189,248,0.06)' : 'rgba(255,255,255,0.02)'};">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:28px;">${slot.icon}</span>
                        <div>
                            <div style="font-size:10px; color:var(--accent-warm); font-weight:700;">${slot.slotName}</div>
                            <div style="font-size:12px; font-weight:800; color:#fff;">${slot.name} ${extraStatus}</div>
                            <div style="font-size:10px; color:var(--text-dim); margin-top:2px;">${slot.desc}</div>
                        </div>
                    </div>
                    <div>
                        ${isOwned ? `
                            <span style="font-size:10px; font-weight:900; color:var(--success); padding:4px 8px; border-radius:6px; background:rgba(16,185,129,0.15);">УСТАНОВЛЕН ✓</span>
                        ` : `
                            <button class="p-btn" style="font-size:11px; font-weight:800; padding:6px 12px; ${canLvl ? 'background:var(--accent); color:#000;' : 'opacity:0.4;'}"
                                onclick="buyImplant('${slot.id}', ${slot.price}, ${slot.lvl})">
                                ${slot.price} 🪙
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    };

    window.buyImplant = function(id, price, reqLvl) {
        if ((window.playerLevel || 1) < reqLvl) {
            if (window.notify) window.notify(`❌ Требуется уровень ${reqLvl}!`);
            return;
        }
        if ((window.globalCoins || 0) < price) {
            if (window.notify) window.notify("❌ Недостаточно монет!");
            return;
        }

        if (window.addCoins) window.addCoins(-price);
        installed.push(id);
        localStorage.setItem('v_installed_cyberware', JSON.stringify(installed));
        if (window.notify) window.notify("🧬 Аугментация успешно имплантирована!");
        window.renderImplantsUI();
    };
})();
