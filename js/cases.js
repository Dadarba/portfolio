const CASES_DATA = [
    { id: "case_starter", name: "Стартовый Кейс", icon: "📦", price: 150, color: "#f8fafc" },
    { id: "case_bb", name: "Аркадный Кейс", icon: "🧩", price: 350, color: "#38bdf8" },
    { id: "case_elite", name: "Кибер-Кейс PRO", icon: "💼", price: 750, color: "#ffd700" }
];
let userCaseInventory = JSON.parse(localStorage.getItem('v_cases_inv') || '{"case_starter": 2, "case_bb": 0, "case_elite": 0}');

window.renderCasesUI = function() {
    const box = document.getElementById('cases-market-list');
    if (!box) return;
    
    // Заголовок секции рулетки
    let html = `<div style="margin-bottom:10px;"><b style="font-size:13px; color:var(--accent-warm);">📦 Рулетка Кейсов (Монеты & Карточки)</b></div>`;
    
    html += CASES_DATA.map(c => {
        const count = userCaseInventory[c.id] || 0;
        return `
            <div class="glass-card" style="padding:14px 16px; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:14px;">
                    <span style="font-size:36px;">${c.icon}</span>
                    <div>
                        <b style="font-size:14px; color:${c.color};">${c.name}</b>
                        <div style="font-size:11px; color:var(--text-dim); margin-top:2px;">У вас: <b>${count} шт.</b></div>
                    </div>
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="p-btn" style="padding:10px 14px;">${c.price} 🪙</button>
                    <button class="p-btn primary" style="padding:10px 18px;" onclick="alert('Открываем ${c.name}!')">Открыть</button>
                </div>
            </div>
        `;
    }).join('');
    
    box.innerHTML = html;
};

if (typeof window.renderCasesUI === 'function') window.renderCasesUI();
