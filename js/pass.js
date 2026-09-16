// ==========================================
// МОДУЛЬ BATTLE PASS 2.0 (25 УРОВНЕЙ) & ДОНАТ
// ==========================================
let bpLevel = parseInt(localStorage.getItem('v_bp_level') || '1');
let bpXp = parseInt(localStorage.getItem('v_bp_xp') || '0');
let isVipActive = localStorage.getItem('v_vip_active') === 'true';
let hasGoldPass = localStorage.getItem('v_has_gold_pass') === 'true';

const BP_TIERS = [
    { lvl: 1, xpNeeded: 100, free: "50 🪙", gold: "150 🪙", rewCoinsFree: 50, rewCoinsGold: 150 },
    { lvl: 2, xpNeeded: 250, free: "Стартовый кейс 📦", gold: "Кейс Блокбаст 🧩", isCaseFree: 'case_starter', isCaseGold: 'case_bb' },
    { lvl: 3, xpNeeded: 450, free: "100 🪙", gold: "Аватар Призрак 👻", rewCoinsFree: 100, rewAvatarGold: '👻' },
    { lvl: 4, xpNeeded: 700, free: "150 🪙", gold: "Обои Неон Ливень 🌧️", rewCoinsFree: 150 },
    { lvl: 5, xpNeeded: 1000, free: "Кейс Блокбаст 🧩", gold: "Элитный Кибер-Кейс 💼", isCaseFree: 'case_bb', isCaseGold: 'case_elite' },
    { lvl: 6, xpNeeded: 1400, free: "200 🪙", gold: "Рамка Огненная 🔥", rewCoinsFree: 200 },
    { lvl: 7, xpNeeded: 1900, free: "300 🪙", gold: "1,000 🪙", rewCoinsFree: 300, rewCoinsGold: 1000 },
    { lvl: 8, xpNeeded: 2500, free: "Стартовый кейс x2", gold: "Аватар Дракон 🐲", rewAvatarGold: '🐲' },
    { lvl: 9, xpNeeded: 3200, free: "400 🪙", gold: "1,500 🪙", rewCoinsFree: 400, rewCoinsGold: 1500 },
    { lvl: 10, xpNeeded: 4000, free: "★ Золотой Титул", gold: "★ Клинки Авроры ⚔️", rewCoinsFree: 500, rewCoinsGold: 2500 },
    // НОВЫЕ ЭЛИТНЫЕ УРОВНИ 11-25
    { lvl: 11, xpNeeded: 5000, free: "600 🪙", gold: "2,000 🪙", rewCoinsFree: 600, rewCoinsGold: 2000 },
    { lvl: 12, xpNeeded: 6200, free: "Элитный кейс 💼", gold: "Чип Ускорения ⚡", isCaseFree: 'case_elite' },
    { lvl: 13, xpNeeded: 7500, free: "800 🪙", gold: "3,000 🪙", rewCoinsFree: 800, rewCoinsGold: 3000 },
    { lvl: 14, xpNeeded: 9000, free: "Обои Плазма 🌈", gold: "Аватар Владыка 🪐", rewAvatarGold: '🪐' },
    { lvl: 15, xpNeeded: 11000, free: "1,000 🪙", gold: "Элитный кейс x3 💼", rewCoinsFree: 1000, isCaseGold: 'case_elite' },
    { lvl: 16, xpNeeded: 13500, free: "1,200 🪙", gold: "4,000 🪙", rewCoinsFree: 1200, rewCoinsGold: 4000 },
    { lvl: 17, xpNeeded: 16500, free: "Стартовый кейс x5", gold: "Рамка Киберщит 🛡️", isCaseFree: 'case_starter' },
    { lvl: 18, xpNeeded: 20000, free: "1,500 🪙", gold: "5,000 🪙", rewCoinsFree: 1500, rewCoinsGold: 5000 },
    { lvl: 19, xpNeeded: 24000, free: "2,000 🪙", gold: "★ Керамбит Золотой 🗡️", rewCoinsFree: 2000 },
    { lvl: 20, xpNeeded: 29000, free: "Кейс Блокбаст x3", gold: "Титул «Кибер-Бог» ⚡" },
    { lvl: 21, xpNeeded: 35000, free: "2,500 🪙", gold: "7,500 🪙", rewCoinsFree: 2500, rewCoinsGold: 7500 },
    { lvl: 22, xpNeeded: 42000, free: "Обои Чёрная Дыра 🕳️", gold: "Элитный кейс x5 💼" },
    { lvl: 23, xpNeeded: 50000, free: "3,000 🪙", gold: "10,000 🪙", rewCoinsFree: 3000, rewCoinsGold: 10000 },
    { lvl: 24, xpNeeded: 60000, free: "Титул «Легенда 2.0»", gold: "★ Анимированная Неоновая Рамка 💎" },
    { lvl: 25, xpNeeded: 75000, free: "5,000 🪙", gold: "🦾 ПИТОМЕЦ: МЕХА-ТИТАН (+100% ДОХОД)", rewCoinsFree: 5000, rewTitan: true }
];

let claimedFreeTiers = JSON.parse(localStorage.getItem('v_claimed_free_tiers') || '[]');
let claimedGoldTiers = JSON.parse(localStorage.getItem('v_claimed_gold_tiers') || '[]');

window.addBattlePassXp = function(amt) {
    if (isVipActive) amt = Math.round(amt * 1.5);
    bpXp += amt;

    let leveledUp = false;
    while (bpLevel < BP_TIERS.length && bpXp >= BP_TIERS[bpLevel - 1].xpNeeded) {
        bpLevel++;
        leveledUp = true;
    }

    localStorage.setItem('v_bp_level', bpLevel);
    localStorage.setItem('v_bp_xp', bpXp);

    if (leveledUp) {
        notify(`🎖️ Новый уровень Battle Pass: <b>Уровень ${bpLevel}</b>!`, 3000);
        if (typeof playSfx === 'function') playSfx('gold_drop');
    }
    renderBattlePassUI();
};

window.claimPassReward = function(lvl, type) {
    if (lvl > bpLevel) {
        notify("Уровень ещё не открыт! Играйте в игры для прокачки XP.");
        return;
    }

    if (type === 'free') {
        if (claimedFreeTiers.includes(lvl)) {
            notify("Бесплатная награда уже забрана!");
            return;
        }
        claimedFreeTiers.push(lvl);
        localStorage.setItem('v_claimed_free_tiers', JSON.stringify(claimedFreeTiers));

        const tier = BP_TIERS[lvl - 1];
        if (tier.rewCoinsFree && typeof addGlobalCoins === 'function') addGlobalCoins(tier.rewCoinsFree);
        if (tier.isCaseFree && typeof addCaseToInventory === 'function') addCaseToInventory(tier.isCaseFree);
        notify(`Забрана Free награда за ${lvl} уровень!`);
    } else {
        if (!hasGoldPass) {
            notify("Для этой награды нужен <b>Gold Pass</b>!");
            return;
        }
        if (claimedGoldTiers.includes(lvl)) {
            notify("Gold награда уже забрана!");
            return;
        }
        claimedGoldTiers.push(lvl);
        localStorage.setItem('v_claimed_gold_tiers', JSON.stringify(claimedGoldTiers));

        const tier = BP_TIERS[lvl - 1];
        if (tier.rewCoinsGold && typeof addGlobalCoins === 'function') addGlobalCoins(tier.rewCoinsGold);
        if (tier.isCaseGold && typeof addCaseToInventory === 'function') addCaseToInventory(tier.isCaseGold);
        if (tier.rewTitan) {
            let owned = JSON.parse(localStorage.getItem('v_owned_pets') || '[]');
            if (!owned.includes('pet_titan')) owned.push('pet_titan');
            localStorage.setItem('v_owned_pets', JSON.stringify(owned));
            notify("🦾 ЛЕГЕНДАРНЫЙ МЕХА-ТИТАН ТЕПЕРЬ ВАШ ПИТОМЕЦ!", 4000);
        }
        notify(`🏆 Забрана Gold награда за ${lvl} уровень!`);
    }

    renderBattlePassUI();
};

window.renderBattlePassUI = function() {
    const list = document.getElementById('bp-tiers-list');
    const lvlEl = document.getElementById('bp-current-lvl');
    const xpEl = document.getElementById('bp-xp-txt');
    const fillEl = document.getElementById('bp-progress-fill');
    const passStatusBadge = document.getElementById('bp-pass-status');

    if (lvlEl) lvlEl.innerText = `${bpLevel}/25`;
    if (passStatusBadge) {
        passStatusBadge.innerText = hasGoldPass ? "GOLD PASS АКТИВЕН 👑" : "БЕСПЛАТНЫЙ ПРОПУСК";
        passStatusBadge.style.color = hasGoldPass ? "#ffd700" : "var(--text-dim)";
    }

    const curTierNeeded = bpLevel <= BP_TIERS.length ? BP_TIERS[bpLevel - 1].xpNeeded : BP_TIERS[BP_TIERS.length - 1].xpNeeded;
    if (xpEl) xpEl.innerText = `${bpXp.toLocaleString()} / ${curTierNeeded.toLocaleString()} XP`;
    if (fillEl) fillEl.style.width = `${Math.min(100, Math.round((bpXp / curTierNeeded) * 100))}%`;

    if (!list) return;

    list.innerHTML = BP_TIERS.map(t => {
        const isUnlocked = bpLevel >= t.lvl;
        const freeDone = claimedFreeTiers.includes(t.lvl);
        const goldDone = claimedGoldTiers.includes(t.lvl);

        return `
            <div class="bp-tier-card ${isUnlocked ? 'unlocked' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <b style="font-size:12px; color:${isUnlocked ? 'var(--accent)' : 'var(--text-dim)'};">Уровень ${t.lvl}</b>
                    <span style="font-size:10px; color:var(--text-dim);">${t.xpNeeded.toLocaleString()} XP</span>
                </div>

                <div class="bp-track-row">
                    <span style="font-size:11px;">Free: <b>${t.free}</b></span>
                    <button class="p-btn" style="padding:2px 8px; font-size:10px; ${freeDone ? 'opacity:0.4;' : (isUnlocked ? 'background:var(--accent); color:#000;' : '')}" onclick="claimPassReward(${t.lvl}, 'free')">
                        ${freeDone ? 'Взято ✓' : (isUnlocked ? 'Забрать' : 'Заперто 🔒')}
                    </button>
                </div>

                <div class="bp-track-row gold">
                    <span style="font-size:11px; color:#ffd700;">Gold: <b>${t.gold}</b></span>
                    <button class="p-btn" style="padding:2px 8px; font-size:10px; ${goldDone ? 'opacity:0.4;' : (hasGoldPass && isUnlocked ? 'background:#ffd700; color:#000;' : '')}" onclick="claimPassReward(${t.lvl}, 'gold')">
                        ${goldDone ? 'Взято ✓' : (hasGoldPass ? (isUnlocked ? 'Забрать' : 'Заперто') : 'Нужен Gold 👑')}
                    </button>
                </div>
            </div>
        `;
    }).join('');
};

window.buyDonatePack = function(packType) {
    if (typeof playSfx === 'function') playSfx('coin');

    if (packType === 'gold_pass') {
        if (hasGoldPass) {
            notify("Gold Pass уже куплен и активен!");
            return;
        }
        if (window.globalCoins < 800) {
            notify("Для покупки Gold Pass нужно 800 🪙!");
            return;
        }
        window.globalCoins -= 800;
        hasGoldPass = true;
        localStorage.setItem('v_has_gold_pass', 'true');
        notify("🎉 <b>Gold Pass на 25 уровней</b> успешно активирован!");
    } else if (packType === 'vip') {
        if (isVipActive) {
            notify("VIP-статус уже активен!");
            return;
        }
        if (window.globalCoins < 1200) {
            notify("Для покупки VIP нужно 1,200 🪙!");
            return;
        }
        window.globalCoins -= 1200;
        isVipActive = true;
        localStorage.setItem('v_vip_active', 'true');
        localStorage.setItem('v_coin_doubler', 'true');
        notify("👑 Вы получили <b>VIP-статус</b> и x2 ко всем монетам!");
    }
    if (typeof updateCoinsUI === 'function') updateCoinsUI();
    renderBattlePassUI();
};

window.applyPromoCode = function() {
    const input = document.getElementById('promo-input');
    if (!input) return;
    const code = input.value.trim().toUpperCase();

    const usedCodes = JSON.parse(localStorage.getItem('v_used_promos') || '[]');
    if (usedCodes.includes(code)) {
        notify("Этот промокод уже был активирован!");
        return;
    }

    if (code === 'CYBER2026' || code === 'REBIRTH') {
        usedCodes.push(code);
        localStorage.setItem('v_used_promos', JSON.stringify(usedCodes));
        addGlobalCoins(2000);
        addBattlePassXp(1200);
        notify("🎁 Промокод активирован: <b>+2,000 🪙 и +1,200 BP XP</b>!");
    } else if (code === 'FREEPASS') {
        usedCodes.push(code);
        localStorage.setItem('v_used_promos', JSON.stringify(usedCodes));
        hasGoldPass = true;
        localStorage.setItem('v_has_gold_pass', 'true');
        notify("👑 Промокод принят: <b>Gold Pass открыт бесплатно!</b>");
    } else {
        notify("Неверный промокод!");
    }

    input.value = '';
    renderBattlePassUI();
};
