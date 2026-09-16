// =========================================================
// ОСНОВНОЕ ЯДРО СИСТЕМЫ И ПАСХАЛОК
// =========================================================

window.EGGS_CONFIG = [
    { id: "sigma_rus", title: "🪖 Военный Сигма", desc: "Армейский марш защиты", hint: "Наберите 1945 в калькуляторе или тапните 5 раз по аватару", reward: 350 },
    { id: "sigma", title: "🗿 Сигма Бой", desc: "Секретный код 52", hint: "Наберите 52 и нажмите = в калькуляторе", reward: 250 },
    { id: "67", title: "🎧 Газан — 67", desc: "Секретный хит", hint: "Наберите 67 и нажмите = в калькуляторе", reward: 250 },
    { id: "nezabudka", title: "🌸 Незабудка", desc: "Любимый цветок", hint: "Наберите 100 в калькуляторе", reward: 300 },
    { id: "matrix", title: "💻 Матрица", desc: "Цифровой поток", hint: "Тапните 5 раз подряд по часам в шапке", reward: 500 }
];

var eggAudioMap = {
    'sigma_rus': 'sounds/sigma_rus.mp3',
    'sigma': 'sounds/sigma.mp3',
    '67': 'sounds/67.mp3',
    'nezabudka': 'sounds/nezabudka.mp3'
};

var activeAudioInstance = null;

window.stopEggMusic = function() {
    if (activeAudioInstance) {
        try { activeAudioInstance.pause(); activeAudioInstance.currentTime = 0; } catch (_) {}
        activeAudioInstance = null;
    }
    document.querySelectorAll('.egg-music-btn').forEach(function(b) {
        b.innerText = '🎵 Трек';
        b.style.background = '';
    });
};

window.playEggMusic = function(id) {
    window.stopEggMusic();
    var btn = document.getElementById('egg-music-btn-' + id);
    if (btn) {
        btn.innerText = '⏹ Стоп';
        btn.style.background = 'var(--accent-warm)';
    }

    var path = eggAudioMap[id];
    if (path) {
        var audio = new Audio(path);
        activeAudioInstance = audio;
        audio.volume = 0.8;
        audio.play().then(function() {
            if (window.notify) window.notify('🎶 Играет оригинальный трек!', 3000);
            audio.onended = function() { window.stopEggMusic(); };
        }).catch(function() {
            // Если mp3 не найден - включается синт
            playFallbackSynth(id);
        });
    } else {
        playFallbackSynth(id);
    }
};

function playFallbackSynth(id) {
    try {
        var actx = window.audioCtxInstance || (window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)());
        if (actx.state === 'suspended') actx.resume();
        var osc = actx.createOscillator();
        var g = actx.createGain();
        osc.frequency.setValueAtTime(id === 'sigma_rus' ? 220 : 440, actx.currentTime);
        g.gain.setValueAtTime(0.2, actx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 2.5);
        osc.connect(g); g.connect(actx.destination);
        osc.start(); osc.stop(actx.currentTime + 2.5);
    } catch (_) {}
}

// РАЗБЛОКИРОВКА ПАСХАЛКИ (ПОЯВЛЕНИЕ ВКЛАДКИ ТОЛЬКО ПОСЛЕ >= 1 ПАСХАЛКИ)
window.unlockEgg = function(id) {
    var unlocked = JSON.parse(localStorage.getItem('v_modular_eggs_v2') || '[]');
    var isFirst = (unlocked.length === 0);

    if (!unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem('v_modular_eggs_v2', JSON.stringify(unlocked));
        var egg = window.EGGS_CONFIG.find(function(e) { return e.id === id; });
        var rew = egg ? egg.reward : 350;
        window.addCoins(rew);

        if (isFirst) {
            if (window.notify) window.notify('✨ <b>СЕКРЕТ РАСКРЫТ:</b> В меню открылась секретная вкладка <b>🥚 Пасхалки</b>! (+' + rew + ' 🪙)', 6000);
        } else {
            if (window.notify) window.notify('🎉 <b>ПАСХАЛКА:</b> ' + (egg ? egg.title : id) + '! (+' + rew + ' 🪙)', 4000);
        }
    }

    if (typeof window.checkEggsTabVisibility === 'function') window.checkEggsTabVisibility();
    window.playEggMusic(id);
    if (typeof window.renderEggs === 'function') window.renderEggs();
};

window.triggerMilitarySigmaEgg = function() {
    var aTxt = document.getElementById('avatar-icon-txt');
    if (aTxt) aTxt.innerText = '🪖';
    window.unlockEgg('sigma_rus');
};

var avatarClicks = 0;
window.handleAvatarEggClick = function() {
    avatarClicks++;
    if (avatarClicks >= 5) {
        avatarClicks = 0;
        window.triggerMilitarySigmaEgg();
    }
};

var clockClicks = 0;
window.handleClockEggClick = function() {
    clockClicks++;
    if (clockClicks >= 5) {
        clockClicks = 0;
        if (typeof window.setLiveWallpaper === 'function') window.setLiveWallpaper('matrix');
        window.unlockEgg('matrix');
    }
};

window.renderEggs = function() {
    var c = document.getElementById('eggs-container');
    var cnt = document.getElementById('egg-count');
    var unlocked = JSON.parse(localStorage.getItem('v_modular_eggs_v2') || '[]');

    if (cnt) cnt.innerText = unlocked.length + ' / ' + window.EGGS_CONFIG.length;
    if (!c) return;

    c.innerHTML = window.EGGS_CONFIG.map(function(e) {
        var isOpen = unlocked.includes(e.id);
        return '<div class="glass-card" style="display:flex; justify-content:space-between; align-items:center; padding:12px; margin-bottom:8px; border-color:' + (isOpen ? '#ffd700' : 'var(--border)') + '; background:' + (isOpen ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)') + ';">' +
            '<div><div style="font-size:13px; font-weight:800; color:' + (isOpen ? '#ffd700' : '#fff') + ';">' + (isOpen ? e.title : '🔒 Секретная пасхалка') + '</div>' +
            '<div style="font-size:10px; color:var(--text-dim); margin-top:2px;">' + (isOpen ? e.desc : 'Подсказка: ' + e.hint) + '</div></div>' +
            '<div style="display:flex; align-items:center; gap:6px;">' +
            (isOpen ? '<button class="p-btn egg-music-btn" id="egg-music-btn-' + e.id + '" style="padding:4px 9px; font-size:11px;" onclick="playEggMusic(\'' + e.id + '\')">🎵 Трек</button>' : '<span style="font-size:11px; color:var(--accent-warm); font-weight:bold;">+' + e.reward + ' 🪙</span>') +
            '</div></div>';
    }).join('');
};
