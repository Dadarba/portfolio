// ==========================================
// КИБЕР-ПИТОМЦЫ 2.0: ТАЛАНТЫ, ЧИПЫ И ЭКСПЕДИЦИИ
// ==========================================
const PETS_DATA = [
    { id: "pet_cat", name: "Кибер-Кот", icon: "🐱", bonus: "+15% монет в играх", cost: 300, mult: 1.15 },
    { id: "pet_dog", name: "Меха-Пёс", icon: "🐶", bonus: "+20% опыта XP", cost: 500, mult: 1.20 },
    { id: "pet_drone", name: "Квантовый Дрон", icon: "🤖", bonus: "Авто-сбор монет и лута", cost: 800, mult: 1.30 },
    { id: "pet_dragon", name: "Неоновый Дракон", icon: "🐲", bonus: "+50% монет и шанс крита", cost: 1500, mult: 1.50 },
    { id: "pet_titan", name: "Меха-Титан", icon: "🦾", bonus: "+100% монет и щит в Survivors", cost: 3500, mult: 2.00 }
];

let activePetId = localStorage.getItem('v_active_pet') || 'pet_cat';
let petLevel = parseInt(localStorage.getItem('v_pet_lvl') || '1');
let petEnergy = parseInt(localStorage.getItem('v_pet_energy') || '100');
let petSkillPoints = parseInt(localStorage.getItem('v_pet_sp') || '0');
let ownedPets = JSON.parse(localStorage.getItem('v_owned_pets') || '["pet_cat"]');

// Таланты питомца
let petTalents = JSON.parse(localStorage.getItem('v_pet_talents') || '{"magnet": 0, "crit": 0, "haste": 0}');

// Экспедиция
let expeditionData = JSON.parse(localStorage.getItem('v_pet_expedition') || 'null');

window.feedPet = function() {
    if (typeof playSfx === 'function') playSfx('coin');
    if (window.globalCoins < 25) {
        notify("Для энергоблока ⚡ нужно 25 🪙!");
        return;
    }
    window.globalCoins -= 25;
    petEnergy = Math.min(100, petEnergy + 25);
    petLevel += 1;
    petSkillPoints += 1;

    localStorage.setItem('v_pet_energy', petEnergy);
    localStorage.setItem('v_pet_lvl', petLevel);
    localStorage.setItem('v_pet_sp', petSkillPoints);

    if (typeof updateCoinsUI === 'function') updateCoinsUI();
    notify(`Питомец покормлен! Уровень: <b>${petLevel}</b> (+1 Очко Талантов)! ⚡`);
    renderPetsUI();
};

window.upgradePetTalent = function(talentKey) {
    if (petSkillPoints <= 0) {
        notify("Нет свободных очков талантов (кормите питомца)!");
        return;
    }
    if (petTalents[talentKey] >= 5) {
        notify("Талант прокачан до максимума!");
        return;
    }
    petSkillPoints--;
    petTalents[talentKey]++;
    localStorage.setItem('v_pet_sp', petSkillPoints);
    localStorage.setItem('v_pet_talents', JSON.stringify(petTalents));
    if (typeof playSfx === 'function') playSfx('coin');
    notify(`Талант улучшен до уровня ${petTalents[talentKey]}! 🌟`);
    renderPetsUI();
};

window.startPetExpedition = function(minutes) {
    if (expeditionData && Date.now() < expeditionData.endTime) {
        notify("Питомец уже находится в экспедиции!");
        return;
    }
    const endTime = Date.now() + minutes * 60 * 1000;
    expeditionData = { minutes, endTime, rewardCoins: minutes * 60 };
    localStorage.setItem('v_pet_expedition', JSON.stringify(expeditionData));
    if (typeof playSfx === 'function') playSfx('tap');
    notify(`Питомец отправился в экспедицию на ${minutes} мин! 🚀`);
    renderPetsUI();
};

window.claimExpeditionReward = function() {
    if (!expeditionData) return;
    if (Date.now() < expeditionData.endTime) {
        const leftSec = Math.ceil((expeditionData.endTime - Date.now()) / 1000);
        notify(`Экспедиция завершится через ${leftSec} сек!`);
        return;
    }
    const rew = expeditionData.rewardCoins;
    expeditionData = null;
    localStorage.removeItem('v_pet_expedition');
    if (typeof addGlobalCoins === 'function') addGlobalCoins(rew);
    if (typeof addBattlePassXp === 'function') addBattlePassXp(Math.floor(rew * 0.5));
    notify(`🎁 Питомец вернулся с хабаром: <b>+${rew} 🪙</b> и опыт!`, 3000);
    renderPetsUI();
};

window.buyPet = function(id) {
    const pet = PETS_DATA.find(p => p.id === id);
    if (!pet) return;
    if (ownedPets.includes(id)) {
        activePetId = id;
        localStorage.setItem('v_active_pet', id);
        notify(`Активный питомец: <b>${pet.name}</b>!`);
        renderPetsUI();
        return;
    }
    if (window.globalCoins < pet.cost) {
        notify(`Недостаточно монет (нужно ${pet.cost} 🪙)!`);
        return;
    }
    window.globalCoins -= pet.cost;
    ownedPets.push(id);
    activePetId = id;
    localStorage.setItem('v_owned_pets', JSON.stringify(ownedPets));
    localStorage.setItem('v_active_pet', id);
    if (typeof updateCoinsUI === 'function') updateCoinsUI();
    notify(`🎉 Питомец <b>${pet.name}</b> разблокирован!`);
    renderPetsUI();
};

window.renderPetsUI = function() {
    const list = document.getElementById('pets-cards-list');
    const curPet = PETS_DATA.find(p => p.id === activePetId) || PETS_DATA[0];

    const iconEl = document.getElementById('active-pet-icon');
    const nameEl = document.getElementById('active-pet-name');
    const lvlEl = document.getElementById('active-pet-lvl');
    const bonusEl = document.getElementById('active-pet-bonus');
    const energyEl = document.getElementById('active-pet-energy');
    const spEl = document.getElementById('pet-sp-count');

    if (iconEl) iconEl.innerText = curPet.icon;
    if (nameEl) nameEl.innerText = curPet.name;
    if (lvlEl) lvlEl.innerText = `Ур. ${petLevel}`;
    if (bonusEl) bonusEl.innerText = curPet.bonus;
    if (energyEl) energyEl.innerText = `${petEnergy}%`;
    if (spEl) spEl.innerText = petSkillPoints;

    // Отрисовка талантов
    const tMagnet = document.getElementById('talent-val-magnet');
    const tCrit = document.getElementById('talent-val-crit');
    const tHaste = document.getElementById('talent-val-haste');
    if (tMagnet) tMagnet.innerText = `${petTalents.magnet}/5 (Магнит +${petTalents.magnet * 10}%)`;
    if (tCrit) tCrit.innerText = `${petTalents.crit}/5 (Крит монет +${petTalents.crit * 8}%)`;
    if (tHaste) tHaste.innerText = `${petTalents.haste}/5 (Опыт игр +${petTalents.haste * 12}%)`;

    // Экспедиции
    const expStatusEl = document.getElementById('expedition-status-box');
    if (expStatusEl) {
        if (!expeditionData) {
            expStatusEl.innerHTML = `
                <div style="font-size:11px; color:var(--text-dim); margin-bottom:6px;">Отправить питомца на поиск ресурсов:</div>
                <div style="display:flex; gap:6px;">
                    <button class="p-btn" style="flex:1; font-size:10px;" onclick="startPetExpedition(3)">⏱️ 3 мин (+180🪙)</button>
                    <button class="p-btn" style="flex:1; font-size:10px;" onclick="startPetExpedition(10)">⏱️ 10 мин (+600🪙)</button>
                </div>
            `;
        } else if (Date.now() < expeditionData.endTime) {
            const leftMin = Math.ceil((expeditionData.endTime - Date.now()) / 60000);
            expStatusEl.innerHTML = `
                <div style="font-size:11px; color:var(--accent);">🚀 Питомец на задании... Осталось ~${leftMin} мин</div>
            `;
        } else {
            expStatusEl.innerHTML = `
                <button class="p-btn" style="width:100%; background:var(--success); color:#000; font-weight:800;" onclick="claimExpeditionReward()">
                    🎁 Забрать добычу экспедиции (+${expeditionData.rewardCoins} 🪙)!
                </button>
            `;
        }
    }

    if (!list) return;
    list.innerHTML = PETS_DATA.map(p => {
        const isOwned = ownedPets.includes(p.id);
        const isActive = activePetId === p.id;
        return `
            <div class="glass-card" style="margin-bottom:6px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:28px;">${p.icon}</span>
                    <div>
                        <b style="font-size:12px;">${p.name}</b>
                        <div style="font-size:10px; color:var(--accent);">${p.bonus}</div>
                    </div>
                </div>
                <button class="p-btn" style="padding:4px 10px; font-size:11px; ${isActive ? 'background:var(--success); color:#000;' : ''}" onclick="buyPet('${p.id}')">
                    ${isActive ? 'Активен ✓' : (isOwned ? 'Выбрать' : `${p.cost} 🪙`)}
                </button>
            </div>
        `;
    }).join('');
};
