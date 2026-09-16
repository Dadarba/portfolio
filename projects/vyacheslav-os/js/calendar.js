// =========================================================
// ВЯЧЕСЛАВ OS: КАЛЕНДАРЬ СОБЫТИЙ
// =========================================================

(function() {
    let curDate = new Date();
    let selectedDateKey = null;
    let events = JSON.parse(localStorage.getItem('v_calendar_events') || '{}');

    const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    function getDateKey(y, m, d) {
        return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    window.renderCalendar = function() {
        const titleEl = document.getElementById('cal-month-title');
        const daysContainer = document.getElementById('cal-days-container');
        if (!titleEl || !daysContainer) return;

        const year = curDate.getFullYear();
        const month = curDate.getMonth();
        titleEl.innerText = `${MONTHS[month]} ${year}`;

        const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const prevLastDay = new Date(year, month, 0).getDate();

        const today = new Date();
        const todayKey = getDateKey(today.getFullYear(), today.getMonth(), today.getDate());

        if (!selectedDateKey) selectedDateKey = todayKey;

        let html = '';

        // Дни прошлого месяца
        for (let i = firstDayIndex; i > 0; i--) {
            html += `<div class="cal-day other-month">${prevLastDay - i + 1}</div>`;
        }

        // Дни текущего месяца
        for (let d = 1; d <= lastDay; d++) {
            const k = getDateKey(year, month, d);
            const isToday = (k === todayKey);
            const isSel = (k === selectedDateKey);
            const hasEvents = events[k] && events[k].length > 0;

            html += `
                <div class="cal-day ${isToday ? 'today' : ''} ${isSel ? 'selected' : ''} ${hasEvents ? 'has-event' : ''}" 
                     onclick="selectCalDay('${k}')">
                    <span>${d}</span>
                    ${hasEvents ? '<div class="cal-event-dot"></div>' : ''}
                </div>
            `;
        }

        daysContainer.innerHTML = html;
        renderDayEvents();
    };

    window.selectCalDay = function(key) {
        selectedDateKey = key;
        window.renderCalendar();
    };

    function renderDayEvents() {
        const listEl = document.getElementById('cal-events-list');
        const titleEl = document.getElementById('cal-selected-title');
        const countEl = document.getElementById('cal-events-count');
        if (!listEl || !titleEl) return;

        titleEl.innerText = `События: ${selectedDateKey || 'Сегодня'}`;
        const dayEvs = events[selectedDateKey] || [];
        if (countEl) countEl.innerText = `${dayEvs.length} записей`;

        if (dayEvs.length === 0) {
            listEl.innerHTML = '<div style="font-size:11px; color:var(--text-dim); padding:6px 0;">Нет запланированных дел</div>';
            return;
        }

        listEl.innerHTML = dayEvs.map((ev, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:8px; padding:6px 8px; font-size:11px;">
                <div style="display:flex; align-items:center; gap:6px;">
                    <span>${ev.cat || '📝'}</span>
                    <span style="color:#fff;">${ev.text}</span>
                </div>
                <button class="p-btn" style="padding:2px 6px; font-size:10px; color:var(--danger);" onclick="deleteCalEvent(${idx})">✕</button>
            </div>
        `).join('');
    }

    window.addCalEvent = function() {
        const inp = document.getElementById('cal-event-inp');
        const cat = document.getElementById('cal-event-cat')?.value || '📝';
        const txt = inp ? inp.value.trim() : '';
        if (!txt || !selectedDateKey) return;

        if (!events[selectedDateKey]) events[selectedDateKey] = [];
        events[selectedDateKey].push({ cat, text: txt });
        localStorage.setItem('v_calendar_events', JSON.stringify(events));

        if (inp) inp.value = '';
        window.renderCalendar();
        if (window.notify) window.notify("Событие сохранено!");
    };

    window.deleteCalEvent = function(idx) {
        if (!events[selectedDateKey]) return;
        events[selectedDateKey].splice(idx, 1);
        if (events[selectedDateKey].length === 0) delete events[selectedDateKey];
        localStorage.setItem('v_calendar_events', JSON.stringify(events));
        window.renderCalendar();
    };

    window.calPrevMonth = function() {
        curDate.setMonth(curDate.getMonth() - 1);
        window.renderCalendar();
    };
    window.calNextMonth = function() {
        curDate.setMonth(curDate.getMonth() + 1);
        window.renderCalendar();
    };
    window.calGoToday = function() {
        curDate = new Date();
        selectedDateKey = getDateKey(curDate.getFullYear(), curDate.getMonth(), curDate.getDate());
        window.renderCalendar();
    };

    document.addEventListener('DOMContentLoaded', window.renderCalendar);
})();
