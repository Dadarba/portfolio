// ==========================================
// ПЕРЕРАБОТАННЫЙ МОДУЛЬ МАГАЗИНА V2
// ==========================================
const SHOP_CATALOG = [
    // Темы (включая Синтвейв и Космос)
    { id: "synthwave", cat: "themes", name: "Синтвейв 80s", icon: "🌆", price: 150, rarity: "epic" },
    { id: "void", cat: "themes", name: "Глубокий Космос", icon: "🌌", price: 120, rarity: "rare" },
    { id: "gold", cat: "themes", name: "Золото", icon: "👑", price: 0, rarity: "legendary" },
    { id: "default", cat: "themes", name: "Тёмно-синий", icon: "🪐", price: 0, rarity: "rare" },
    { id: "black", cat: "themes", name: "Чёрный OLED", icon: "🖤", price: 0, rarity: "rare" },
    { id: "cyberpunk", cat: "themes", name: "Киберпанк", icon: "⚡", price: 80, rarity: "legendary" },
    { id: "emerald", cat: "themes", name: "Изумруд", icon: "❇️", price: 40, rarity: "rare" },
    { id: "ruby", cat: "themes", name: "Рубин", icon: "💎", price: 60, rarity: "epic" },
    { id: "blood", cat: "themes", name: "Кровавая луна", icon: "🩸", price: 90, rarity: "epic" },

    // Аватары
    { id: "av_sigma", cat: "avatars", name: "Гигачад", icon: "🗿", price: 300, rarity: "legendary" },
    { id: "av_titan", cat: "avatars", name: "Меха-Титан", icon: "🦾", price: 250, rarity: "legendary" },
    { id: "av_dragon", cat: "avatars", name: "Дракон", icon: "🐲", price: 150, rarity: "epic" },
    { id: "av_bot", cat: "avatars", name: "Андроид", icon: "🤖", price: 80, rarity: "rare" },
    { id: "av_cat", cat: "avatars", name: "Кот-кодер", icon: "🐱", price: 40, rarity: "rare" },
    { id: "av_dog", cat: "avatars", name: "Кибер-пёс", icon: "🐶", price: 40, rarity: "rare" },
    { id: "av_ghost", cat: "avatars", name: "Призрак", icon: "👻", price: 70, rarity: "rare" },

    // Обои
    { id: "wp_retro_sun", cat: "wallpapers", name: "Синтвейв Закат", icon: "🌅", price: 120, rarity: "legendary" },
    { id: "wp_stars", cat: "wallpapers", name: "Звёзды", icon: "✨", price: 40, rarity: "rare" },
    { id: "wp_matrix", cat: "wallpapers", name: "Матрица", icon: "🟩", price: 50, rarity: "epic" },
    { id: "wp_matrix_red", cat: "wallpapers", name: "Матрица Инферно", icon: "🟥", price: 60, rarity: "epic" },
    { id: "wp_plasma", cat: "wallpapers", name: "Хрома-Плазма", icon: "🌈", price: 90, rarity: "legendary" },
    { id: "wp_none", cat: "wallpapers", name: "Без обоев", icon: "🚫", price: 0, rarity: "rare" },

    // Рамки
    { id: "frame_neon", cat: "frames", name: "Неоновый круг", icon: "⚡", price: 80, rarity: "epic" },
    { id: "frame_gold", cat: "frames", name: "Королевское Золото", icon: "👑", price: 180, rarity: "legendary" },
    { id: "frame_fire", cat: "frames", name: "Огненный щит", icon: "🔥", price: 120, rarity: "epic" }
];

let purchasedItems = JSON.parse(localStorage.getItem('v_purchased_items') || '["gold","default","black","wp_none"]');
let activeShopTab = "themes";

window.setShopCategory = function(cat) {
    activeShopTab = cat;
    document.querySelectorAll('.shop-cat-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`cat-btn-${cat}`);
    if (btn) btn.classList.add('active');
    if (typeof playSfx === 'function') playSfx('tap');
    renderShopGrid();
};

window.renderShopGrid = function() {
    const grid = document.getElementById('shop-dynamic-grid');
    if (!grid) return;
    const items = SHOP_CATALOG.filter(it => it.cat === activeShopTab);

    const activeAv = localStorage.getItem('v_active_avatar') || '👤';
    const activeTh = localStorage.getItem('v_theme') || 'gold';
    const activeFr = localStorage.getItem('v_active_frame') || 'none';
    const activeWp = localStorage.getItem('v_active_wp') || 'wp_none';

    grid.className = 'shop-v2-grid';
    grid.innerHTML = items.map(it => {
        const isBought = purchasedItems.includes(it.id) || it.price === 0;
        let isEquipped = false;
        if (it.cat === 'avatars') isEquipped = (activeAv === it.icon);
        else if (it.cat === 'themes') isEquipped = (activeTh === it.id);
        else if (it.cat === 'frames') isEquipped = (activeFr === it.id);
        else if (it.cat === 'wallpapers') isEquipped = (activeWp === it.id);

        let actionBtn = '';
        if (isEquipped) {
            actionBtn = `<button class="p-btn" style="padding:5px 8px; font-size:10px; width:100%; border-color:var(--success); color:var(--success); font-weight:800;">Надето ✓</button>`;
        } else if (isBought) {
            actionBtn = `<button class="p-btn" style="padding:5px 8px; font-size:10px; width:100%; background:var(--accent); color:#000; font-weight:800;" onclick="equipShopItem('${it.id}')">Применить</button>`;
        } else {
            actionBtn = `<button class="p-btn" style="padding:5px 8px; font-size:10px; width:100%; font-weight:800;" onclick="buyShopCatalogItem('${it.id}')">${it.price} 🪙</button>`;
        }

        return `
            <div class="shop-v2-card ${isEquipped ? 'equipped' : ''}">
                <span class="shop-v2-badge ${it.rarity}">${it.rarity}</span>
                <div class="shop-v2-icon-wrap">${it.icon}</div>
                <b style="font-size:12px; margin-top:2px;">${it.name}</b>
                ${actionBtn}
            </div>
        `;
    }).join('');
};

window.buyShopCatalogItem = function(id) {
    const item = SHOP_CATALOG.find(x => x.id === id);
    if (!item) return;
    if (window.globalCoins >= item.price) {
        window.globalCoins -= item.price;
        localStorage.setItem('v_global_coins', window.globalCoins);
        purchasedItems.push(item.id);
        localStorage.setItem('v_purchased_items', JSON.stringify(purchasedItems));
        if (typeof playSfx === 'function') playSfx('coin');
        equipShopItem(id);
        if (typeof updateCoinsUI === 'function') updateCoinsUI();
        notify(`Куплено: <b>${item.name}</b>!`);
    } else {
        notify("Недостаточно монет 🪙!");
    }
};

window.equipShopItem = function(id) {
    const item = SHOP_CATALOG.find(x => x.id === id);
    if (!item) return;

    if (item.cat === 'avatars') {
        localStorage.setItem('v_active_avatar', item.icon);
        if (typeof renderProfile === 'function') renderProfile();
    } else if (item.cat === 'themes') {
        setGlobalTheme(item.id);
    } else if (item.cat === 'frames') {
        localStorage.setItem('v_active_frame', item.id);
        if (typeof renderProfile === 'function') renderProfile();
    } else if (item.cat === 'wallpapers') {
        localStorage.setItem('v_active_wp', item.id);
        if (typeof initLiveWallpaper === 'function') initLiveWallpaper(item.id);
    }
    renderShopGrid();
    notify(`Применено: <b>${item.name}</b>`);
};
