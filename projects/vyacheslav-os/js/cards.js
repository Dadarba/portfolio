const CARDS_DATABASE = [
    { id: "c_battery", name: "Неоновый Аккум", rarity: "common", icon: "🔋", desc: "+15% монет во всех играх", stats: { coinMult: 0.15 } },
    { id: "c_chip", name: "Микрочип V1", rarity: "common", icon: "💾", desc: "+20% к опыту профиля", stats: { xpMult: 0.20 } },
    { id: "c_magnet", name: "Ферромагнит", rarity: "common", icon: "🧲", desc: "Слегка притягивает монеты", stats: { magnet: true } },
    { id: "r_plasma", name: "Плазменный Контур", rarity: "rare", icon: "⚡", desc: "+30% урона в Survivors", stats: { dmgMult: 0.30 } },
    { id: "r_shield", name: "Нано-Барьер", rarity: "rare", icon: "🛡️", desc: "Дает щит на старте", stats: { startShield: true } },
    { id: "r_spring", name: "Турбо-Пружина", rarity: "rare", icon: "🌀", desc: "+25% высоты прыжков в Jump", stats: { jumpMult: 0.25 } },
    { id: "e_laser", name: "Квантовый Фокус", rarity: "epic", icon: "✨", desc: "+60% очков за комбо", stats: { comboMult: 0.60 } },
    { id: "e_drone", name: "Автономный Дрон", rarity: "epic", icon: "🤖", desc: "Дрон-помощник (косметика)", stats: { droneAlly: true } },
    { id: "e_overdrive", name: "Овердрайв Ядра", rarity: "epic", icon: "🔥", desc: "+25% скорости в аркадах", stats: { speedMult: 0.25 } },
    { id: "l_glitch", name: "Глитч Пространства", rarity: "legendary", icon: "🌌", desc: "Пассивный уворот 15%", stats: { dodge: 0.15 } },
    { id: "l_titan", name: "Протокол «Титан»", rarity: "legendary", icon: "🦾", desc: "+60% урона", stats: { dmgMult: 0.60 } },
    { id: "l_matrix", name: "Код Матрицы", rarity: "legendary", icon: "👑", desc: "+50% монет и лута", stats: { coinMult: 0.50 } }
];

let ownedCards = JSON.parse(localStorage.getItem('v_owned_cards') || '["c_battery", "c_chip"]');
let activeDeck = JSON.parse(localStorage.getItem('v_active_deck') || '["c_battery"]');

window.getCardById = function(id) { return CARDS_DATABASE.find(c => c.id === id); };

window.getActiveDeckStats = function() {
    let stats = { coinMult: 0, dmgMult: 0, speedMult: 0 };
    activeDeck.forEach(cId => {
        const c = getCardById(cId);
        if (c && c.stats) {
            if (c.stats.coinMult) stats.coinMult += c.stats.coinMult;
            if (c.stats.dmgMult) stats.dmgMult += c.stats.dmgMult;
            if (c.stats.speedMult) stats.speedMult += c.stats.speedMult;
        }
    });
    return stats;
};

window.addCardToCollection = function(cardId) {
    if (!ownedCards.includes(cardId)) {
        ownedCards.push(cardId);
        localStorage.setItem('v_owned_cards', JSON.stringify(ownedCards));
    }
    const card = getCardById(cardId);
    if (card && typeof notify === 'function') notify(`🃏 Получена карта: <b>${card.icon} ${card.name}</b>!`, 3500);
    if (typeof renderCardsUI === 'function') renderCardsUI();
};

window.toggleCardInDeck = function(cardId) {
    const idx = activeDeck.indexOf(cardId);
    if (idx !== -1) {
        activeDeck.splice(idx, 1);
    } else {
        if (activeDeck.length >= 3) {
            if (typeof notify === 'function') notify("В колоде может быть максимум 3 карты!");
            return;
        }
        activeDeck.push(cardId);
    }
    localStorage.setItem('v_active_deck', JSON.stringify(activeDeck));
    if (typeof playSfx === 'function') playSfx('tap');
    renderCardsUI();
};

window.renderCardsUI = function() {
    const deckBox = document.getElementById('active-deck-slots');
    const catalogBox = document.getElementById('cards-catalog-grid');
    if (!deckBox || !catalogBox) return;

    deckBox.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const c = activeDeck[i] ? getCardById(activeDeck[i]) : null;
        deckBox.innerHTML += c ? `
            <div style="flex:1; background:rgba(15,23,42,0.8); border:1px solid var(--border); border-radius:12px; padding:6px; text-align:center;">
                <div style="font-size:24px;">${c.icon}</div>
                <b style="font-size:9px;">${c.name}</b>
                <button class="p-btn" style="padding:2px 6px; font-size:8px; margin-top:4px; width:100%;" onclick="toggleCardInDeck('${c.id}')">Снять</button>
            </div>
        ` : `<div style="flex:1; border:1px dashed var(--border); border-radius:12px; display:flex; align-items:center; justify-content:center; opacity:0.5; font-size:10px;">Слот пуст</div>`;
    }

    catalogBox.innerHTML = CARDS_DATABASE.map(c => {
        const isOwned = ownedCards.includes(c.id);
        const inDeck = activeDeck.includes(c.id);
        return `
            <div class="cyber-card-item ${c.rarity} ${isOwned ? '' : 'locked'}">
                <span class="card-rarity-badge">${c.rarity}</span>
                <div style="font-size:32px;">${c.icon}</div>
                <b style="font-size:11px; margin:4px 0;">${c.name}</b>
                <div style="font-size:9px; color:var(--text-dim); text-align:center; flex-grow:1;">${c.desc}</div>
                <button class="p-btn" style="width:100%; font-size:9px; padding:4px 0; margin-top:6px; ${inDeck ? 'background:var(--success);' : ''}" 
                    ${!isOwned ? 'disabled' : ''} onclick="toggleCardInDeck('${c.id}')">
                    ${!isOwned ? '🔒' : (inDeck ? 'В колоде' : 'Экипировать')}
                </button>
            </div>
        `;
    }).join('');
};

window.rollCardDrop = function(caseType) {
    let pool = CARDS_DATABASE.filter(c => c.rarity === 'common' || c.rarity === 'rare');
    if (caseType === 'case_bb') pool = CARDS_DATABASE.filter(c => c.rarity === 'rare' || c.rarity === 'epic');
    if (caseType === 'case_elite') pool = CARDS_DATABASE.filter(c => c.rarity === 'epic' || c.rarity === 'legendary');
    
    const drop = pool[Math.floor(Math.random() * pool.length)];
    if (drop) addCardToCollection(drop.id);
    return drop;
};
