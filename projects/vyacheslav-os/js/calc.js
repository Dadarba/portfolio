function cIn(v) {
    const display = document.getElementById('calc-display');
    if (!display) return;
    if (display.value === '0' && !isNaN(v)) {
        display.value = v;
    } else {
        display.value += v;
    }
}

function cClear() {
    const display = document.getElementById('calc-display');
    if (display) display.value = '0';
}

function cDel() {
    const display = document.getElementById('calc-display');
    if (!display) return;
    display.value = display.value.slice(0, -1) || '0';
}

function cEval() {
    try {
        const display = document.getElementById('calc-display');
        const expr = String(display.value).trim();

        // Секретные коды пасхалок
        if (expr === '1945' || expr === '777') {
            if (window.triggerMilitarySigmaEgg) window.triggerMilitarySigmaEgg();
        } else if (expr === '52') {
            if (window.unlockEgg) window.unlockEgg('sigma');
        } else if (expr === '67') {
            if (window.unlockEgg) window.unlockEgg('67');
        } else if (expr === '100') {
            if (window.unlockEgg) window.unlockEgg('nezabudka');
        }

        display.value = eval(display.value);
    } catch (e) {
        const d = document.getElementById('calc-display');
        if (d) d.value = 'Ошибка';
    }
}
