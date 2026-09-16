function cInput(val) {
    var d = document.getElementById('calc-display');
    if (!d) return;
    if (d.value === '0' || d.value === 'Ошибка') d.value = '';
    d.value += val;
}

function cClear() {
    var d = document.getElementById('calc-display');
    if (d) d.value = '';
}

function cEval() {
    var d = document.getElementById('calc-display');
    if (!d) return;
    var expr = String(d.value).trim();

    // Активация пасхалок
    if (expr === '1945' || expr === '777') {
        if (typeof window.triggerMilitarySigmaEgg === 'function') window.triggerMilitarySigmaEgg();
        else if (typeof window.unlockEgg === 'function') window.unlockEgg('sigma_rus');
    } else if (expr === '52') {
        if (typeof window.unlockEgg === 'function') window.unlockEgg('sigma');
    } else if (expr === '67') {
        if (typeof window.unlockEgg === 'function') window.unlockEgg('67');
    } else if (expr === '100') {
        if (typeof window.unlockEgg === 'function') window.unlockEgg('nezabudka');
    }

    try {
        d.value = eval(expr);
    } catch (e) {
        d.value = 'Ошибка';
    }
}
