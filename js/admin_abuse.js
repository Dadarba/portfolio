// =========================================================
// АДМИН-АБЬЮЗ И ГЛОБАЛЬНАЯ КРОСС-ОКОННАЯ СИНХРОНИЗАЦИЯ
// =========================================================

var abuseChannel = null;
try {
    if (typeof BroadcastChannel !== 'undefined') {
        abuseChannel = new BroadcastChannel('vyacheslav_abuse_bus');
    }
} catch (_) {}

window.emitGlobalAbuse = function(action, data) {
    var payload = { action: action, data: data || {}, timestamp: Date.now() };
    if (abuseChannel) {
        try { abuseChannel.postMessage(payload); } catch (_) {}
    }
    if (window.parent && window.parent !== window) {
        try { window.parent.postMessage({ type: 'VYACHESLAV_GLOBAL_ABUSE', action: action, data: data }, '*'); } catch (_) {}
    }
    try {
        localStorage.setItem('v_abuse_event', JSON.stringify(payload));
    } catch (_) {}
};

function handleIncomingAbuse(action, data) {
    if (action === 'flashbang') {
        if (typeof window.adminTriggerFlashbangInternal === 'function') window.adminTriggerFlashbangInternal();
    } else if (action === 'shake') {
        if (typeof window.adminTriggerShakeInternal === 'function') window.adminTriggerShakeInternal(data.intensity);
    } else if (action === 'broadcast') {
        if (typeof window.adminTriggerBroadcastInternal === 'function') window.adminTriggerBroadcastInternal(data.text);
    }
}

if (abuseChannel) {
    abuseChannel.onmessage = function(e) {
        if (e.data && e.data.action) handleIncomingAbuse(e.data.action, e.data.data || {});
    };
}

window.addEventListener('storage', function(e) {
    if (e.key === 'v_abuse_event' && e.newValue) {
        try {
            var ev = JSON.parse(e.newValue);
            if (Date.now() - ev.timestamp < 3000) {
                handleIncomingAbuse(ev.action, ev.data || {});
            }
        } catch (_) {}
    }
});

// 1. СВЕТОШУМОВАЯ ВСПЫШКА (FLASHBANG)
window.adminTriggerFlashbang = function() {
    window.emitGlobalAbuse('flashbang');
    window.adminTriggerFlashbangInternal();
};

window.adminTriggerFlashbangInternal = function() {
    var flash = document.getElementById('abuse-flashbang-overlay');
    if (!flash) {
        flash = document.createElement('div');
        flash.id = 'abuse-flashbang-overlay';
        document.body.appendChild(flash);
    }
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

    try {
        var actx = window.audioCtxInstance || (window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)());
        if (actx.state === 'suspended') actx.resume();
        var osc = actx.createOscillator();
        var gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3200, actx.currentTime);
        gain.gain.setValueAtTime(0.35, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 3.5);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start();
        osc.stop(actx.currentTime + 3.5);
    } catch (_) {}

    try { if (navigator.vibrate) navigator.vibrate([100, 40, 250]); } catch (_) {}
    void flash.offsetWidth;
    flash.style.transition = 'opacity 3.5s cubic-bezier(0.1, 0.9, 0.2, 1)';
    flash.style.opacity = '0';
    setTimeout(function() { flash.style.display = 'none'; }, 3600);
    if (window.notify) window.notify('💥 <b>FLASHBANG:</b> Ослепляющая вспышка!', 3500);
};

// 2. ТРЯСКА ЭКРАНА
window.adminTriggerShake = function(intensity) {
    window.emitGlobalAbuse('shake', { intensity: intensity });
    window.adminTriggerShakeInternal(intensity);
};

window.adminTriggerShakeInternal = function(intensity) {
    var val = intensity || 0.5;
    document.body.style.animation = 'adminScreenShake ' + (0.3 + val * 0.3) + 's ease-in-out';
    setTimeout(function() { document.body.style.animation = ''; }, 600);
};

// 3. СИРЕНА И ОПОВЕЩЕНИЕ
window.adminTriggerBroadcast = function(text) {
    window.emitGlobalAbuse('broadcast', { text: text });
    window.adminTriggerBroadcastInternal(text);
};

window.adminTriggerBroadcastInternal = function(text) {
    var msg = text || 'ВНИМАНИЕ ВСЕМ СИСТЕМАМ!';
    if (window.notify) window.notify('🚨 <b>ТРЕВОГА:</b> ' + msg, 5000);
};
