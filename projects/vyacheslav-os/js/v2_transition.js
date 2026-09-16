// ==========================================
// СИСТЕМА ПЕРЕХОДА ИЗ ВЕРСИИ 1.0 В ВЕРСИЮ 2.0
// ==========================================
const V2_MIGRATION_KEY = 'v_migrated_to_v2';

window.triggerV2Transition = function(force = false) {
    if (!force && localStorage.getItem(V2_MIGRATION_KEY) === 'true') {
        return; // Уже обновлено, не показываем повторно
    }

    const overlay = document.getElementById('v2-transition-overlay');
    const fill = document.getElementById('v2-progress-fill');
    const log = document.getElementById('v2-console-log');
    if (!overlay || !fill || !log) return;

    overlay.style.display = 'flex';
    fill.style.width = '0%';

    const steps = [
        { pct: 15, text: "Чтение ядра Вячеслав OS v1.0..." },
        { pct: 35, text: "Инъекция модульной архитектуры Next-Gen..." },
        { pct: 55, text: "Генерация боевого пропуска «Cyber Genesis»..." },
        { pct: 75, text: "Синхронизация кибер-питомцев и арсенала..." },
        { pct: 90, text: "Финальная оптимизация 60 FPS..." },
        { pct: 100, text: "ГОТОВО! ДОБРО ПОЖАЛОВАТЬ В 2.0!" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            fill.style.width = `${steps[currentStep].pct}%`;
            log.innerText = steps[currentStep].text;
            if (typeof playSfx === 'function') playSfx('tick');
            currentStep++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.4s ease';
                setTimeout(() => {
                    overlay.style.display = 'none';
                    overlay.style.opacity = '1';
                    localStorage.setItem(V2_MIGRATION_KEY, 'true');
                    if (typeof playSfx === 'function') playSfx('gold_drop');
                    showWelcomeV2Modal();
                }, 400);
            }, 600);
        }
    }, 450);
};

window.showWelcomeV2Modal = function() {
    const modal = document.getElementById('v2-welcome-modal');
    if (modal) modal.style.display = 'flex';
};

window.claimV2StarterPack = function() {
    if (typeof playSfx === 'function') playSfx('coin');
    const modal = document.getElementById('v2-welcome-modal');
    if (modal) modal.style.display = 'none';

    // Стартовый подарок за переход во 2-ю часть:
    if (typeof addGlobalCoins === 'function') addGlobalCoins(2500);
    if (typeof addBattlePassXp === 'function') addBattlePassXp(600);
    if (typeof addCaseToInventory === 'function') addCaseToInventory('case_elite');

    // Бесплатный VIP статус
    localStorage.setItem('v_vip_active', 'true');
    localStorage.setItem('v_coin_doubler', 'true');

    notify("🎉 <b>Стартовый набор 2.0 получен!</b> (+2,500 🪙, Кейс, VIP и опыт)", 4000);
};

// Запуск проверки перехода при загрузке
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        triggerV2Transition(false);
    }, 1200);
});
