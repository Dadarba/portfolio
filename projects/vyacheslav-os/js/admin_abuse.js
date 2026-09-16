// =========================================================
// ГЛОБАЛЬНАЯ ШИНА АДМИН-АБЬЮЗА (CROSS-WINDOW SYNC BUS)
// =========================================================
const abuseChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('vyacheslav_abuse_bus') : null;

window.emitGlobalAbuse = function(action, data = {}) {
    const payload = { action, data, timestamp: Date.now() };
    
    // 1. Отправка соседям через BroadcastChannel
    if (abuseChannel) {
        try { abuseChannel.postMessage(payload); } catch (_) {}
    }
    // 2. Отправка родителю (если открыто во фрейме портфолио)
    if (window.parent && window.parent !== window) {
        try { window.parent.postMessage({ type: 'VYACHESLAV_GLOBAL_ABUSE', action, data }, '*'); } catch (_) {}
    }
    // 3. Резервная синхронизация через localStorage
    try {
        localStorage.setItem('v_abuse_event', JSON.stringify(payload));
    } catch (_) {}
};

// Приём команд от других окон или родительского хаба
function handleIncomingAbuse(action, data) {
    if (action === 'flashbang') {
        if (typeof window.adminTriggerFlashbangInternal === 'function') window.adminTriggerFlashbangInternal();
    } else if (action === 'shake') {
        if (typeof window.adminTriggerShakeInternal === 'function') window.adminTriggerShakeInternal(data.intensity);
    } else if (action === 'broadcast') {
        if (typeof window.adminTriggerBroadcastInternal === 'function') window.adminTriggerBroadcastInternal(data.text);
    } else if (action === 'bugs') {
        if (typeof window.adminTriggerBugsInternal === 'function') window.adminTriggerBugsInternal(data.count);
    } else if (action === 'vortex') {
        if (typeof window.adminTriggerVortexInternal === 'function') window.adminTriggerVortexInternal();
    } else if (action === 'matrix') {
        if (typeof window.setLiveWallpaper === 'function') window.setLiveWallpaper('matrix');
    }
}

if (abuseChannel) {
    abuseChannel.onmessage = (e) => {
        if (e.data && e.data.action) handleIncomingAbuse(e.data.action, e.data.data || {});
    };
}

window.addEventListener('storage', (e) => {
    if (e.key === 'v_abuse_event' && e.newValue) {
        try {
            const ev = JSON.parse(e.newValue);
            if (Date.now() - ev.timestamp < 3000) {
                handleIncomingAbuse(ev.action, ev.data || {});
            }
        } catch (_) {}
    }
});

// =========================================================
// ВЯЧЕСЛАВ OS: АДМИН-АБЬЮЗ ЭКСТРИМ
// =========================================================

(function() {
    window.globalRewardMultiplier = 1;

    function playTone(freq, type = 'sine', duration = 0.2, gainVal = 0.1) {
        try {
            const actx = window.audioCtxInstance || (window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)());
            if (actx.state === 'suspended') actx.resume();
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, actx.currentTime);
            gain.gain.setValueAtTime(gainVal, actx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + duration);
            osc.connect(gain);
            gain.connect(actx.destination);
            osc.start();
            osc.stop(actx.currentTime + duration);
        } catch (_) {}
    }

    function playSiren() {
        try {
            const actx = window.audioCtxInstance || (window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)());
            if (actx.state === 'suspended') actx.resume();
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(450, actx.currentTime);
            osc.frequency.linearRampToValueAtTime(850, actx.currentTime + 0.35);
            osc.frequency.linearRampToValueAtTime(450, actx.currentTime + 0.7);
            gain.gain.setValueAtTime(0.12, actx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, actx.currentTime + 0.8);
            osc.connect(gain);
            gain.connect(actx.destination);
            osc.start();
            osc.stop(actx.currentTime + 0.8);
        } catch (_) {}
    }

    // 1. КИБЕР-СКРИМЕР (JUMPSCARE)
    window.adminTriggerJumpscare = function() {
        const sc = document.getElementById('abuse-jumpscare-overlay');
        if (!sc) return;
        sc.style.display = 'flex';
        playTone(180, 'sawtooth', 1.2, 0.5);
        try { if (navigator.vibrate) navigator.vibrate([200, 100, 300]); } catch (_) {}
        setTimeout(() => { sc.style.display = 'none'; }, 1500);
    };

    // 2. СЛУЧАЙНЫЕ ОКНА ВИРУСОВ (VIRUS STORM)
    window.adminTriggerVirusAttack = function(count = 7) {
        playTone(320, 'square', 0.4, 0.2);
        if (window.notify) window.notify("⚠️ <b>КРИТИЧЕСКАЯ АТАКА:</b> Система заражена! Закрывайте окна!", 4000);

        const titles = ["КРИТИЧЕСКИЙ СБОЙ", "ТРОЯН В ПАМЯТИ", "ВЯЧЕСЛАВ OS // HACK", "ОШИБКА 0x000000FF"];
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const win = document.createElement('div');
                win.className = 'abuse-virus-window';
                win.style.left = (15 + Math.random() * (window.innerWidth - 240)) + 'px';
                win.style.top = (60 + Math.random() * (window.innerHeight - 200)) + 'px';

                win.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #ef4444; padding-bottom:3px; margin-bottom:6px;">
                        <span style="color:#ef4444; font-weight:bold; font-size:10px;">${titles[i % titles.length]}</span>
                        <button style="background:#ef4444; color:#fff; border:none; border-radius:3px; padding:1px 6px; cursor:pointer;" onclick="this.parentElement.parentElement.remove(); if(window.addCoins) window.addCoins(10);">✕</button>
                    </div>
                    <div style="font-size:10px; color:#cbd5e1; margin-bottom:6px;">Обнаружено повреждение системных файлов админом!</div>
                    <button class="p-btn" style="width:100%; font-size:10px; background:var(--accent); color:#000; font-weight:bold;" onclick="this.parentElement.remove(); if(window.addCoins) window.addCoins(10);">Очистить (+10 🪙)</button>
                `;
                document.body.appendChild(win);
                playTone(400 + i * 50, 'square', 0.1, 0.1);
            }, i * 220);
        }
    };

    // 3. БЛЭКАУТ / РЕЖИМ ФОНАРИКА (BLIND)
    let isBlindActive = false;
    window.adminTriggerFlashlightBlind = function(seconds = 8) {
        const blind = document.getElementById('abuse-blind-overlay');
        if (!blind) return;
        blind.style.display = 'block';
        playTone(110, 'sawtooth', 0.5, 0.3);
        if (window.notify) window.notify(`🔦 <b>ПОЛНЫЙ МРАК!</b> Фонарик следует за вашим пальцем (${seconds}с)!`, 3500);

        const trackMove = (e) => {
            const x = (e.touches ? e.touches[0].clientX : e.clientX);
            const y = (e.touches ? e.touches[0].clientY : e.clientY);
            blind.style.setProperty('--fx-x', x + 'px');
            blind.style.setProperty('--fx-y', y + 'px');
        };

        window.addEventListener('pointermove', trackMove);
        window.addEventListener('touchmove', trackMove);

        setTimeout(() => {
            blind.style.display = 'none';
            window.removeEventListener('pointermove', trackMove);
            window.removeEventListener('touchmove', trackMove);
            if (window.notify) window.notify("Свет восстановлен 💡");
        }, seconds * 1000);
    };

    // 4. ВРАЩЕНИЕ ЭКРАНА 360 (SPIN)
    let isSpinning = false;
    window.adminTriggerSpin = function() {
        isSpinning = !isSpinning;
        document.body.classList.toggle('abuse-spinning', isSpinning);
        playTone(550, 'triangle', 0.4, 0.2);
        if (window.notify) window.notify(isSpinning ? "🌀 <b>РЕЖИМ ШТОПОРА 360° АКТИВЕН!</b>" : "Вращение остановлено");
    };

    // 5. ФЕЙКОВЫЙ ПЕРМАБАН (FAKE BAN)
    window.adminTriggerFakeBan = function() {
        const ban = document.getElementById('abuse-fakeban-overlay');
        const timerEl = document.getElementById('abuse-ban-countdown');
        if (!ban) return;
        ban.style.display = 'flex';
        playTone(90, 'sawtooth', 0.8, 0.4);

        let left = 7;
        if (timerEl) timerEl.innerText = left;
        const int = setInterval(() => {
            left--;
            if (timerEl) timerEl.innerText = left;
            if (left <= 0) {
                clearInterval(int);
                ban.style.display = 'none';
                if (window.notify) window.notify("🛡️ <b>Шутка!</b> Администратор помиловал ваш аккаунт!", 4000);
            }
        }, 1000);
    };

    // 6. СТАНДАРТНЫЕ МЕТОДЫ (МИРОВОЙ БОСС, AIRDROP, FEVER, COINRAIN)
    let bossHp = 5000;
    let bossMaxHp = 5000;
    window.adminSpawnWorldBoss = function(hp = 5000) {
        const widget = document.getElementById('abuse-boss-widget');
        const hpBar = document.getElementById('abuse-boss-hp-bar');
        const hpTxt = document.getElementById('abuse-boss-hp-txt');
        if (!widget) return;
        bossHp = hp;
        bossMaxHp = hp;
        if (hpBar) hpBar.style.width = '100%';
        if (hpTxt) hpTxt.innerText = `${bossHp} / ${bossMaxHp}`;
        widget.style.display = 'block';
        playTone(150, 'sawtooth', 0.6, 0.3);
        if (window.notify) window.notify(`🚨 Админ призвал <b>Квантового Левиафана</b> (${hp} HP)! Тапайте!`, 5000);
    };

    window.hitWorldBoss = function(e) {
        if (bossHp <= 0) return;
        const dmg = Math.floor(40 + Math.random() * 80);
        bossHp = Math.max(0, bossHp - dmg);
        playTone(300 + Math.random() * 200, 'square', 0.08, 0.1);
        if (window.addCoins) window.addCoins(3);

        const hpBar = document.getElementById('abuse-boss-hp-bar');
        const hpTxt = document.getElementById('abuse-boss-hp-txt');
        if (hpBar) hpBar.style.width = Math.max(0, (bossHp / bossMaxHp) * 100) + '%';
        if (hpTxt) hpTxt.innerText = `${bossHp} / ${bossMaxHp}`;

        if (e) {
            const floatEl = document.createElement('div');
            floatEl.className = 'abuse-floating-dmg';
            floatEl.innerText = `-${dmg} 💥 (+3 🪙)`;
            floatEl.style.left = (e.clientX - 20) + 'px';
            floatEl.style.top = (e.clientY - 20) + 'px';
            document.body.appendChild(floatEl);
            setTimeout(() => floatEl.remove(), 600);
        }

        if (bossHp <= 0) {
            const widget = document.getElementById('abuse-boss-widget');
            if (widget) widget.style.display = 'none';
            playTone(800, 'triangle', 0.8, 0.4);
            if (window.addCoins) window.addCoins(1500);
            if (window.addXp) window.addXp(500);
            window.playerTitle = '👑 Истребитель Боссов';
            localStorage.setItem('v_player_title', window.playerTitle);
            if (window.renderProfile) window.renderProfile();
            if (window.notify) window.notify(`🎉 <b>РЕЙД-БОСС УНИЧТОЖЕН!</b> Награда: +1500 🪙!`, 6000);
        }
    };

    window.adminTriggerAirDrop = function() {
        playTone(520, 'sine', 0.5, 0.2);
        if (window.notify) window.notify("📦 <b>AIRDROP:</b> С неба сброшены ящики!", 4000);
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const crate = document.createElement('div');
                crate.className = 'abuse-airdrop-crate';
                crate.innerHTML = '🪂';
                crate.style.left = (20 + Math.random() * (window.innerWidth - 80)) + 'px';
                let posY = -70;
                let speed = 1.4 + Math.random() * 1.6;
                document.body.appendChild(crate);
                crate.onpointerdown = (e) => {
                    e.stopPropagation();
                    const win = Math.floor(150 + Math.random() * 350);
                    playTone(880, 'triangle', 0.3, 0.25);
                    if (window.addCoins) window.addCoins(win);
                    crate.innerHTML = `🎁 +${win} 🪙`;
                    crate.style.color = '#38bdf8';
                    setTimeout(() => crate.remove(), 600);
                };
                const int = setInterval(() => {
                    posY += speed;
                    crate.style.top = posY + 'px';
                    if (posY > window.innerHeight) { clearInterval(int); crate.remove(); }
                }, 16);
            }, i * 700);
        }
    };

    let feverTimer = null;
    window.adminTriggerFeverMultiplier = function(mult = 5, durationSec = 45) {
        window.globalRewardMultiplier = mult;
        const banner = document.getElementById('abuse-fever-banner');
        const txt = document.getElementById('abuse-fever-txt');
        if (banner && txt) {
            txt.innerText = `🔥 ЛИХОРАДКА x${mult} К МОНЕТАМ АКТИВНА (${durationSec}с)`;
            banner.style.display = 'block';
        }
        playTone(660, 'square', 0.4, 0.2);
        if (window.notify) window.notify(`🔥 <b>АДМИН ВКЛЮЧИЛ x${mult} МУЛЬТИПЛИКАТОР!</b>`, 4000);
        let left = durationSec;
        clearInterval(feverTimer);
        feverTimer = setInterval(() => {
            left--;
            if (txt) txt.innerText = `🔥 ЛИХОРАДКА x${mult} К МОНЕТАМ АКТИВНА (${left}с)`;
            if (left <= 0) {
                clearInterval(feverTimer);
                window.globalRewardMultiplier = 1;
                if (banner) banner.style.display = 'none';
                if (window.notify) window.notify("Лихорадка наград завершилась ⏹");
            }
        }, 1000);
    };

    window.adminTriggerJackpotWheel = function() {
        const prizes = [500, 1000, 2000, 5000, 10000];
        const win = prizes[Math.floor(Math.random() * prizes.length)];
        playTone(750, 'triangle', 0.5, 0.3);
        if (window.addCoins) window.addCoins(win);
        if (window.notify) window.notify(`🎰 <b>СЕРВЕРНЫЙ ДЖЕКПОТ!</b> Вы сорвали <b>+${win} 🪙</b>!`, 6000);
    };

    let isFlipped = false;
    let flipRewardTimer = null;
    window.adminTriggerScreenFlip = function() {
        isFlipped = !isFlipped;
        document.body.classList.toggle('abuse-flipped', isFlipped);
        playTone(220, 'sawtooth', 0.4, 0.2);
        if (isFlipped) {
            if (window.notify) window.notify("🙃 <b>АНТИГРАВИТАЦИЯ!</b> +15 🪙 за стойкость каждые 2с!", 4000);
            flipRewardTimer = setInterval(() => { if (window.addCoins) window.addCoins(15); }, 2000);
        } else {
            clearInterval(flipRewardTimer);
            if (window.notify) window.notify("Гравитация восстановлена 🟢");
        }
    };

    window.adminGrantExclusiveTitle = function() {
        window.playerTitle = '⚡ Фаворит Хаоса';
        localStorage.setItem('v_player_title', window.playerTitle);
        if (window.addCoins) window.addCoins(777);
        if (window.renderProfile) window.renderProfile();
        playTone(880, 'sine', 0.5, 0.2);
        if (window.notify) window.notify("👑 Титул «⚡ Фаворит Хаоса» и +777 🪙!", 5000);
    };

    window.adminTriggerBroadcast = function(msg) {
        const overlay = document.getElementById('abuse-broadcast-overlay');
        const txtEl = document.getElementById('abuse-broadcast-txt');
        if (!overlay || !txtEl) return;
        txtEl.innerText = msg || "ВНИМАНИЕ ВСЕМ ИГРОКАМ: АДМИНИСТРАТОР В СЕТИ!";
        overlay.style.display = 'block';
        playSiren();
        setTimeout(() => overlay.style.display = 'none', 5500);
    };

    window.adminTriggerCoinRain = function(count = 25) {
        playTone(600, 'triangle', 0.4, 0.15);
        if (window.notify) window.notify(`🪙 Дождь из ${count} монет! Ловите тапом!`, 3000);
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const coin = document.createElement('div');
                coin.className = 'abuse-falling-coin';
                coin.innerText = '🪙';
                coin.style.left = Math.random() * (window.innerWidth - 40) + 'px';
                let posY = -50;
                let speed = 2.5 + Math.random() * 4;
                document.body.appendChild(coin);
                coin.onpointerdown = (e) => {
                    e.stopPropagation();
                    playTone(880, 'sine', 0.1, 0.15);
                    if (window.addCoins) window.addCoins(15);
                    coin.innerText = '+15 🪙';
                    setTimeout(() => coin.remove(), 300);
                };
                const int = setInterval(() => {
                    posY += speed;
                    coin.style.top = posY + 'px';
                    if (posY > window.innerHeight) { clearInterval(int); coin.remove(); }
                }, 16);
            }, i * 130);
        }
    };

    window.adminTriggerFreeze = function(seconds = 6) {
        const ov = document.getElementById('abuse-freeze-overlay');
        const cd = document.getElementById('abuse-freeze-countdown');
        if (!ov) return;
        ov.style.display = 'flex';
        playTone(200, 'sawtooth', 0.5, 0.2);
        let left = seconds;
        if (cd) cd.innerText = left;
        const timer = setInterval(() => {
            left--;
            if (cd) cd.innerText = left;
            if (left <= 0) { clearInterval(timer); ov.style.display = 'none'; }
        }, 1000);
    };

    window.adminTriggerUnfreeze = function() {
        const ov = document.getElementById('abuse-freeze-overlay');
        if (ov) ov.style.display = 'none';
    };

    let isDiscoActive = false;
    window.adminTriggerDisco = function() {
        isDiscoActive = !isDiscoActive;
        document.body.classList.toggle('abuse-disco', isDiscoActive);
        if (window.notify) window.notify(isDiscoActive ? "🪩 ДИСКО-ХАОС ВКЛЮЧЁН!" : "Диско выключено");
    };

    let isLockdownActive = false;
    let lockTimer = null;
    window.adminTriggerLockdown = function() {
        isLockdownActive = !isLockdownActive;
        document.body.classList.toggle('abuse-lockdown', isLockdownActive);
        if (isLockdownActive) {
            playSiren();
            lockTimer = setInterval(playSiren, 1400);
            if (window.notify) window.notify("🚨 КРАСНАЯ ТРЕВОГА!", 3000);
        } else {
            clearInterval(lockTimer);
            if (window.notify) window.notify("Отбой тревоги 🟢");
        }
    };

    window.adminTriggerShake = function(seconds = 3) {
        document.body.classList.add('abuse-shaking');
        playTone(80, 'sawtooth', seconds, 0.25);
        setTimeout(() => document.body.classList.remove('abuse-shaking'), seconds * 1000);
    };

    window.adminTriggerSlap = function() {
        playTone(140, 'square', 0.15, 0.3);
        document.body.style.transition = 'transform 0.08s ease';
        document.body.style.transform = 'rotate(4deg) scale(0.96)';
        setTimeout(() => {
            document.body.style.transform = 'rotate(-3deg) scale(0.98)';
            setTimeout(() => document.body.style.transform = '', 100);
        }, 80);
    };

    window.adminTriggerBSOD = function() {
        const bsod = document.getElementById('abuse-bsod-overlay');
        if (!bsod) return;
        bsod.style.display = 'flex';
        playTone(100, 'sawtooth', 0.8, 0.3);
        let prog = 0;
        const progEl = document.getElementById('abuse-bsod-prog');
        const int = setInterval(() => {
            prog += Math.floor(15 + Math.random() * 25);
            if (progEl) progEl.innerText = Math.min(100, prog) + '%';
            if (prog >= 100) {
                clearInterval(int);
                setTimeout(() => { bsod.style.display = 'none'; if (window.notify) window.notify("⚡ Ядро перезагружено!", 3000); }, 600);
            }
        }, 400);
    };
})();

// =========================================================
// ЭКСТРИМ-АБЬЮЗ: FLASHBANG, ТАРАКАНЫ, ВОДОВОРОТ, ЭЙРХОРН, НАЛОГ
// =========================================================

// 1. СВЕТОШУМОВАЯ ВСПЫШКА (FLASHBANG NUKE)
window.adminTriggerFlashbangInternal = function() {
};
window.adminTriggerFlashbang = function() {
    window.emitGlobalAbuse("flashbang");
    window.adminTriggerFlashbangInternal();
};
window.adminTriggerFlashbangInternal = function() {
    let flash = document.getElementById('abuse-flashbang-overlay');
    if (!flash) {
        flash = document.createElement('div');
        flash.id = 'abuse-flashbang-overlay';
        document.body.appendChild(flash);
    }

    // Принудительные стили поверх всех окон
    flash.style.display = 'block';
    flash.style.position = 'fixed';
    flash.style.inset = '0';
    flash.style.width = '100vw';
    flash.style.height = '100vh';
    flash.style.backgroundColor = '#ffffff';
    flash.style.zIndex = '999999';
    flash.style.pointerEvents = 'none';
    flash.style.opacity = '1';
    flash.style.transition = 'none';

    // Звук оглушающей контузии (Tinnitus 3200Hz)
    try {
        const actx = window.audioCtxInstance || (window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)());
        if (actx.state === 'suspended') actx.resume();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3200, actx.currentTime);
        gain.gain.setValueAtTime(0.35, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 3.8);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start();
        osc.stop(actx.currentTime + 3.8);
    } catch (_) {}

    try { if (navigator.vibrate) navigator.vibrate([100, 40, 250]); } catch (_) {}
    if (window.adminTriggerShake) window.adminTriggerShake(0.6);

    // Принудительный рефлоу для запуска CSS-анимации затухания
    void flash.offsetWidth;

    flash.style.transition = 'opacity 3.5s cubic-bezier(0.1, 0.9, 0.2, 1)';
    flash.style.opacity = '0';

    setTimeout(() => {
        flash.style.display = 'none';
    }, 3600);

    if (window.notify) window.notify("💥 <b>FLASHBANG:</b> Ослепляющая вспышка!", 3500);
};

// 2. НАШЕСТВИЕ ТАРАКАНОВ (COCKROACH INVASION)
window.adminTriggerCockroaches = function(count = 28) {
    if (window.notify) window.notify(`🪳 <b>НАШЕСТВИЕ:</b> По экрану бегают ${count} тараканов! Давите их тапом (+25 🪙)!`, 4500);

    for (let i = 0; i < count; i++) {
        const roach = document.createElement('div');
        roach.className = 'abuse-cockroach';
        roach.innerText = '🪳';

        let x = Math.random() * (window.innerWidth - 40);
        let y = Math.random() * (window.innerHeight - 40);
        let angle = Math.random() * Math.PI * 2;
        let speed = 4 + Math.random() * 5;

        roach.style.left = x + 'px';
        roach.style.top = y + 'px';
        document.body.appendChild(roach);

        roach.onpointerdown = (e) => {
            e.stopPropagation();
            clearInterval(moveInterval);
            roach.innerText = '💥';
            try {
                const actx = window.audioCtxInstance || (window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)());
                const osc = actx.createOscillator();
                const g = actx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(140, actx.currentTime);
                g.gain.setValueAtTime(0.2, actx.currentTime);
                g.gain.linearRampToValueAtTime(0.001, actx.currentTime + 0.1);
                osc.connect(g); g.connect(actx.destination);
                osc.start(); osc.stop(actx.currentTime + 0.1);
            } catch (_) {}

            if (window.addCoins) window.addCoins(25);
            setTimeout(() => roach.remove(), 250);
        };

        const moveInterval = setInterval(() => {
            x += Math.cos(angle) * speed;
            y += Math.sin(angle) * speed;

            if (x < 10 || x > window.innerWidth - 40) { angle = Math.PI - angle; }
            if (y < 40 || y > window.innerHeight - 40) { angle = -angle; }

            roach.style.left = x + 'px';
            roach.style.top = y + 'px';
            roach.style.transform = `rotate(${angle + Math.PI/2}rad)`;
        }, 30);

        setTimeout(() => {
            clearInterval(moveInterval);
            if (roach.parentNode) roach.remove();
        }, 12000);
    }
};

// 3. ГРАВИТАЦИОННЫЙ ВОДОВОРОТ (BLACK HOLE)
window.adminTriggerVortex = function() {
    document.body.classList.add('abuse-vortex');
    try {
        const actx = window.audioCtxInstance || (window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)());
        const osc = actx.createOscillator();
        const g = actx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(350, actx.currentTime + 2.2);
        osc.frequency.exponentialRampToValueAtTime(60, actx.currentTime + 4.5);
        g.gain.setValueAtTime(0.3, actx.currentTime);
        g.gain.linearRampToValueAtTime(0.001, actx.currentTime + 4.5);
        osc.connect(g); g.connect(actx.destination);
        osc.start(); osc.stop(actx.currentTime + 4.5);
    } catch (_) {}

    if (window.notify) window.notify("🌀 <b>ЧЁРНАЯ ДЫРА:</b> Гравитационное искажение пространства!", 4500);

    setTimeout(() => {
        document.body.classList.remove('abuse-vortex');
    }, 4600);
};

// 4. MLG ЭЙРХОРН (AIRHORN)
window.adminTriggerAirhorn = function() {
    try {
        const actx = window.audioCtxInstance || (window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)());
        if (actx.state === 'suspended') actx.resume();
        const notes = [466.16, 466.16, 466.16, 466.16, 622.25];
        const times = [0, 0.12, 0.24, 0.36, 0.52];
        const durs  = [0.1, 0.1,  0.1,  0.1,  0.4];

        notes.forEach((freq, i) => {
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, actx.currentTime + times[i]);
            gain.gain.setValueAtTime(0.35, actx.currentTime + times[i]);
            gain.gain.linearRampToValueAtTime(0.001, actx.currentTime + times[i] + durs[i]);
            osc.connect(gain); gain.connect(actx.destination);
            osc.start(actx.currentTime + times[i]);
            osc.stop(actx.currentTime + times[i] + durs[i]);
        });
    } catch (_) {}

    if (window.adminTriggerShake) window.adminTriggerShake(1);
    if (window.notify) window.notify("📯 <b>MLG AIRHORN!</b>", 2000);
};

// 5. СКОЛЬЗКИЕ КНОПКИ (SLIPPERY BUTTONS)
let isSlippyActive = false;
window.adminTriggerSlippyButtons = function(seconds = 10) {
    isSlippyActive = true;
    document.body.classList.add('abuse-slippy');
    if (window.notify) window.notify(`🧈 <b>СКОЛЬЗКИЕ КНОПКИ:</b> Попробуйте попасть по меню (${seconds}с)!`, 4000);

    const evade = (e) => {
        if (!isSlippyActive) return;
        const target = e.target.closest('.nav-btn, .p-btn');
        if (!target) return;
        const randX = (Math.random() - 0.5) * 140;
        const randY = (Math.random() - 0.5) * 80;
        target.style.transform = `translate(${randX}px, ${randY}px)`;
        setTimeout(() => { if (target) target.style.transform = ''; }, 800);
    };

    document.addEventListener('pointerover', evade);

    setTimeout(() => {
        isSlippyActive = false;
        document.body.classList.remove('abuse-slippy');
        document.removeEventListener('pointerover', evade);
        if (window.notify) window.notify("Кнопки зафиксированы 🟢");
    }, seconds * 1000);
};

// 6. НАЛОГОВЫЙ РЕЙД (TAX AUDIT EVENT)
let safeHp = 15;
window.adminTriggerTaxRaid = function() {
    const modal = document.getElementById('abuse-tax-modal');
    const hpTxt = document.getElementById('abuse-tax-safe-hp');
    const timerTxt = document.getElementById('abuse-tax-timer');
    if (!modal) return;

    safeHp = 15;
    if (hpTxt) hpTxt.innerText = safeHp;

    const taxAmount = Math.max(50, Math.floor((window.globalCoins || 500) * 0.15));
    if (window.addCoins) window.addCoins(-taxAmount);

    modal.style.display = 'flex';
    let timeLeft = 6;
    if (timerTxt) timerTxt.innerText = timeLeft;

    const int = setInterval(() => {
        timeLeft--;
        if (timerTxt) timerTxt.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(int);
            modal.style.display = 'none';
            if (window.notify) window.notify(`💼 Налоговая удержала <b>-${taxAmount} 🪙</b>!`, 4000);
        }
    }, 1000);

    window.hitTaxSafe = function() {
        safeHp--;
        if (hpTxt) hpTxt.innerText = safeHp;
        if (safeHp <= 0) {
            clearInterval(int);
            modal.style.display = 'none';
            const jackpot = taxAmount * 2;
            if (window.addCoins) window.addCoins(jackpot);
            if (window.notify) window.notify(`🎉 <b>СЕЙФ ВЗЛОМАН!</b> Вы вернули свои монеты с кушем: <b>+${jackpot} 🪙</b>!`, 5000);
        }
    };
};
