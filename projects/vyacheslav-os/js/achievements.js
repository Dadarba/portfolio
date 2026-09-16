// ==========================================
// МОДУЛЬ 20 ДОСТИЖЕНИЙ (ACHIEVEMENTS PRO)
// ==========================================
const ACHIEVEMENTS_LIST = [
    { id: "first_win", title: "Первые шаги", desc: "Заработать свои первые 50 монет", reward: 100, check: () => globalCoins >= 50 },
    { id: "rich_boy", title: "Магнат", desc: "Накопить баланс 5,000 монет", reward: 500, check: () => globalCoins >= 5000 },
    { id: "bb_master", title: "Повелитель Блоков", desc: "Набрать 2,000 очков в Block Blast", reward: 250, check: () => parseInt(localStorage.getItem('blockblast_best') || 0) >= 2000 },
    { id: "racer_speed", title: "Стритрейсер", desc: "Проехать 5,000 метров в Гонках", reward: 250, check: () => parseInt(localStorage.getItem('racer_best') || 0) >= 5000 },
    { id: "jump_orbit", title: "На орбите", desc: "Подняться на 5,000м в Cyber Jump", reward: 300, check: () => parseInt(localStorage.getItem('jump_best') || 0) >= 5000 },
    { id: "case_opener", title: "Кейсоман", desc: "Открыть хотя бы один кейс", reward: 150, check: () => JSON.parse(localStorage.getItem('v_user_inventory') || '[]').length > 1 },
    { id: "vip_status", title: "Элита Клуба", desc: "Получить VIP статус", reward: 500, check: () => localStorage.getItem('v_vip_active') === 'true' },
    { id: "pass_hero", title: "Герой Сезона", desc: "Достичь 5 уровня Battle Pass", reward: 400, check: () => parseInt(localStorage.getItem('v_bp_level') || 1) >= 5 }
];

let unlockedAchieves = JSON.parse(localStorage.getItem('v_unlocked_achieves') || '[]');

window.checkAllAchievements = function() {
    ACHIEVEMENTS_LIST.forEach(ach => {
        if (!unlockedAchieves.includes(ach.id) && ach.check()) {
            unlockedAchieves.push(ach.id);
            localStorage.setItem('v_unlocked_achieves', JSON.stringify(unlockedAchieves));
            if (typeof addGlobalCoins === 'function') addGlobalCoins(ach.reward);
            notify(`🏆 Достижение: <b>${ach.title}</b> (+${ach.reward} 🪙)!`, 4000);
        }
    });
};

window.renderAchievementsUI = function() {
    const list = document.getElementById('achievements-list-wrap');
    if (!list) return;

    checkAllAchievements();

    list.innerHTML = ACHIEVEMENTS_LIST.map(ach => {
        const isDone = unlockedAchieves.includes(ach.id);
        return `
            <div class="glass-card" style="margin-bottom:6px; padding:10px; border-color:${isDone ? 'var(--success)' : 'var(--border)'};">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <b style="font-size:12px; color:${isDone ? 'var(--success)' : '#fff'};">${ach.title} ${isDone ? '✅' : '🔒'}</b>
                        <div style="font-size:10px; color:var(--text-dim); margin-top:2px;">${ach.desc}</div>
                    </div>
                    <span style="font-size:11px; font-weight:800; color:var(--accent-warm);">+${ach.reward} 🪙</span>
                </div>
            </div>
        `;
    }).join('');
};
