// =========================================================
// ВЯЧЕСЛАВ OS: CYBER CLI (СИНТАКСИЧЕСКИ ЧИСТЫЙ МОДУЛЬ)
// =========================================================

(function() {
    const COMMANDS = [
        { cmd: 'notify <текст>', desc: 'Показать системное уведомление' },
        { cmd: 'broadcast <текст>', desc: 'Глобальная тревога с сиреной на весь экран' },
        { cmd: 'nuke', desc: 'Светошумовая вспышка Flashbang с ослеплением' },
        { cmd: 'bugs [кол-во]', desc: 'Нашествие тараканов по всему экрану' },
        { cmd: 'vortex', desc: 'Гравитационный водоворот Black Hole' },
        { cmd: 'airhorn', desc: 'Оглушительный MLG Эйрхорн' },
        { cmd: 'slippy [сек]', desc: 'Скользкие убегающие кнопки меню' },
        { cmd: 'tax', desc: 'Налоговый рейд с взломом сейфа' },
        { cmd: 'boss [hp]', desc: 'Призвать Мирового Рейд-Босса прямо на экран' },
        { cmd: 'airdrop', desc: 'Сбросить 3 контейнера AirDrop с монетами' },
        { cmd: 'fever [x] [сек]', desc: 'Лихорадка наград x3-x5 ко всем монетам' },
        { cmd: 'jackpot', desc: 'Спин Колеса Фортуны (до 10 000 🪙)' },
        { cmd: 'flip', desc: 'Антигравитация (переворот 180° с наградами)' },
        { cmd: 'coinrain [кол-во]', desc: 'Золотой дождь из интерактивных монет' },
        { cmd: 'freeze [сек]', desc: 'Заморозить экран и управление' },
        { cmd: 'unfreeze', desc: 'Снять заморозку экрана' },
        { cmd: 'lockdown', desc: 'Красная тревога с воздушной сиреной' },
        { cmd: 'disco', desc: 'Переключить RGB-диско стробоскоп' },
        { cmd: 'shake [сек]', desc: 'Землетрясение экрана' },
        { cmd: 'slap', desc: 'Звуковая оплеуха с наклоном камеры' },
        { cmd: 'bsod', desc: 'Синий экран смерти ядра (BSOD)' },
        { cmd: 'rewardall', desc: 'Выдать эксклюзивный титул и монеты' },
        { cmd: 'anim <тип>', desc: 'Спец-анимация: crt, zerog, rainbow, warp, matrix, embers, stop' },
        { cmd: 'coins <кол-во>', desc: 'Добавить/снять монеты (напр. coins 5000)' },
        { cmd: 'xp <кол-во>', desc: 'Добавить опыт XP (напр. xp 1000)' },
        { cmd: 'level <число>', desc: 'Установить уровень (напр. level 50)' },
        { cmd: 'pump <тикер> <%>', desc: 'Памп/дамп акций (напр. pump GAS 50)' },
        { cmd: 'price <тикер> <цена>', desc: 'Задать цену акции (напр. price BANK 1000)' },
        { cmd: 'score <игра> <очки>', desc: 'Задать рекорд (snake, jump, blockblast, racer, 2048)' },
        { cmd: 'cases <кол-во>', desc: 'Выдать кейсы каждого вида (напр. cases 20)' },
        { cmd: 'unlock <all|eggs|implants>', desc: 'Разблокировать всё, пасхалки или импланты' },
        { cmd: 'backup create', desc: 'Создать точку восстановления' },
        { cmd: 'backup purge', desc: 'Очистить все старые бэкапы до актуального' },
        { cmd: 'theme <название>', desc: 'Сменить тему (gold, black, emerald, cyberpunk...)' },
        { cmd: 'ui <стиль>', desc: 'Сменить дизайн (default, beta, glass, scifi, neumorph...)' },
        { cmd: 'clear', desc: 'Очистить экран консоли' },
        { cmd: 'help', desc: 'Показать все доступные команды' }
    ];

    let history = [];
    let historyIndex = -1;

    function escapeHtml(str) {
        return (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function printLog(text, type) {
        type = type || 'info';
        const out = document.getElementById('admin-cli-output');
        if (!out) return;
        const line = document.createElement('div');
        line.className = 'cli-line cli-' + type;
        const time = new Date().toLocaleTimeString();

        if (type === 'cmd') {
            line.innerHTML = '<span style="color:var(--text-dim);">[' + time + ']</span> <b style="color:var(--accent);">$</b> ' + escapeHtml(text);
        } else if (type === 'err') {
            line.innerHTML = '<span style="color:#ef4444;">[ОШИБКА]</span> ' + text;
        } else if (type === 'ok') {
            line.innerHTML = '<span style="color:#10b981;">[УСПЕХ]</span> ' + text;
        } else {
            line.innerHTML = text;
        }

        out.appendChild(line);
        out.scrollTop = out.scrollHeight;
    }

    window.runAdminCliCommand = function(rawCmd) {
        const input = document.getElementById('admin-cli-input');
        const text = (rawCmd !== undefined ? rawCmd : (input ? input.value : '')).trim();
        if (!text) return;

        if (input) {
            input.value = '';
            window.updateCliSuggestions('');
        }

        history.push(text);
        historyIndex = history.length;
        printLog(text, 'cmd');

        const parts = text.split(/\s+/);
        const action = parts[0].toLowerCase();
        const argsStr = text.slice(action.length).trim();
        const arg1 = parts[1];
        const arg2 = parts[2];

        try {
            switch(action) {
                case 'notify': {
                    if (!argsStr) { printLog('Использование: notify &lt;сообщение&gt;', 'err'); return; }
                    if (window.notify) window.notify('🔔 ' + escapeHtml(argsStr), 3500);
                    printLog('Уведомление показано: "' + escapeHtml(argsStr) + '"', 'ok');
                    break;
                }
                case 'broadcast':
                case 'alert': {
                    const bMsg = argsStr || "ВНИМАНИЕ: СЕРВЕРНОЕ СООБЩЕНИЕ АДМИНИСТРАЦИИ!";
                    if (window.adminTriggerBroadcast) window.adminTriggerBroadcast(bMsg);
                    printLog('Глобальная тревога запущена: "' + escapeHtml(bMsg) + '"', 'ok');
                    break;
                }
                
                case 'nuke':
                case 'flashbang': {
                    if (window.adminTriggerFlashbang) window.adminTriggerFlashbang();
                    printLog('Светошумовой Flashbang детонирован!', 'ok');
                    break;
                }
                case 'bugs':
                case 'cockroaches': {
                    const bCount = parseInt(arg1, 10) || 28;
                    if (window.adminTriggerCockroaches) window.adminTriggerCockroaches(bCount);
                    printLog('Нашествие ' + bCount + ' тараканов запущено!', 'ok');
                    break;
                }
                case 'vortex':
                case 'blackhole': {
                    if (window.adminTriggerVortex) window.adminTriggerVortex();
                    printLog('Чёрная дыра активирована!', 'ok');
                    break;
                }
                case 'airhorn': {
                    if (window.adminTriggerAirhorn) window.adminTriggerAirhorn();
                    printLog('MLG Airhorn запущен!', 'ok');
                    break;
                }
                case 'slippy': {
                    const sSec = parseInt(arg1, 10) || 10;
                    if (window.adminTriggerSlippyButtons) window.adminTriggerSlippyButtons(sSec);
                    printLog('Скользкие кнопки включены на ' + sSec + ' сек!', 'ok');
                    break;
                }
                case 'tax': {
                    if (window.adminTriggerTaxRaid) window.adminTriggerTaxRaid();
                    printLog('Налоговый рейд начат!', 'ok');
                    break;
                }

                case 'boss': {
                    const bHp = parseInt(arg1, 10) || 5000;
                    if (window.adminSpawnWorldBoss) window.adminSpawnWorldBoss(bHp);
                    printLog('Мировой босс призван (' + bHp + ' HP)!', 'ok');
                    break;
                }
                case 'airdrop': {
                    if (window.adminTriggerAirDrop) window.adminTriggerAirDrop();
                    printLog('Королевский AirDrop сброшен на экран!', 'ok');
                    break;
                }
                case 'fever':
                case 'boost': {
                    const feverMult = parseInt(arg1, 10) || 5;
                    const feverDuration = parseInt(arg2, 10) || 45;
                    if (window.adminTriggerFeverMultiplier) window.adminTriggerFeverMultiplier(feverMult, feverDuration);
                    printLog('Лихорадка x' + feverMult + ' запущена на ' + feverDuration + ' сек!', 'ok');
                    break;
                }
                case 'wheel':
                case 'jackpot': {
                    if (window.adminTriggerJackpotWheel) window.adminTriggerJackpotWheel();
                    printLog('Колесо Джекпота прокручено!', 'ok');
                    break;
                }
                case 'flip': {
                    if (window.adminTriggerScreenFlip) window.adminTriggerScreenFlip();
                    printLog('Антигравитация переключена!', 'ok');
                    break;
                }
                case 'rewardall': {
                    if (window.adminGrantExclusiveTitle) window.adminGrantExclusiveTitle();
                    printLog('Титул и награды успешно выданы!', 'ok');
                    break;
                }
                case 'coinrain':
                case 'rain': {
                    const rCount = parseInt(arg1, 10) || 25;
                    if (window.adminTriggerCoinRain) window.adminTriggerCoinRain(rCount);
                    printLog('Запущен дождь монет (' + rCount + ' шт)!', 'ok');
                    break;
                }
                case 'freeze': {
                    const freezeDuration = parseInt(arg1, 10) || 6;
                    if (window.adminTriggerFreeze) window.adminTriggerFreeze(freezeDuration);
                    printLog('Экран заморожен на ' + freezeDuration + ' сек!', 'ok');
                    break;
                }
                case 'unfreeze': {
                    if (window.adminTriggerUnfreeze) window.adminTriggerUnfreeze();
                    printLog('Заморозка досрочно снята!', 'ok');
                    break;
                }
                case 'lockdown': {
                    if (window.adminTriggerLockdown) window.adminTriggerLockdown();
                    printLog('Красная тревога переключена!', 'ok');
                    break;
                }
                case 'disco': {
                    if (window.adminTriggerDisco) window.adminTriggerDisco();
                    printLog('RGB-диско переключен!', 'ok');
                    break;
                }
                case 'shake': {
                    const sSec = parseInt(arg1, 10) || 3;
                    if (window.adminTriggerShake) window.adminTriggerShake(sSec);
                    printLog('Землетрясение экрана: ' + sSec + ' сек!', 'ok');
                    break;
                }
                case 'slap': {
                    if (window.adminTriggerSlap) window.adminTriggerSlap();
                    printLog('Оплеуха выдана!', 'ok');
                    break;
                }
                case 'bsod':
                case 'crash': {
                    if (window.adminTriggerBSOD) window.adminTriggerBSOD();
                    printLog('BSOD симулирован!', 'ok');
                    break;
                }
                case 'anim':
                case 'fx': {
                    const fxName = (arg1 || '').toLowerCase();
                    if (fxName === 'stop' || fxName === 'off') {
                        if (window.stopAllSpecialAnimations) window.stopAllSpecialAnimations();
                        printLog('Все спец-анимации остановлены!', 'ok');
                    } else if (window.toggleSpecialAnimation) {
                        window.toggleSpecialAnimation(fxName);
                        printLog('Спец-анимация: ' + fxName + '!', 'ok');
                    }
                    break;
                }
                case 'coins': {
                    const amt = parseInt(arg1, 10);
                    if (isNaN(amt)) { printLog('Использование: coins &lt;кол-во&gt;', 'err'); return; }
                    if (window.addCoins) window.addCoins(amt);
                    printLog('Баланс изменен на ' + (amt >= 0 ? '+' : '') + amt + ' 🪙', 'ok');
                    break;
                }
                case 'xp': {
                    const xpAmt = parseInt(arg1, 10);
                    if (isNaN(xpAmt)) { printLog('Использование: xp &lt;кол-во&gt;', 'err'); return; }
                    if (window.addXp) window.addXp(xpAmt);
                    printLog('Добавлено +' + xpAmt + ' XP!', 'ok');
                    break;
                }
                case 'level': {
                    const lvl = parseInt(arg1, 10);
                    if (isNaN(lvl) || lvl < 1) { printLog('Использование: level &lt;число&gt;', 'err'); return; }
                    window.playerLevel = lvl;
                    localStorage.setItem('v_player_level', lvl);
                    if (window.renderProfile) window.renderProfile();
                    printLog('Уровень установлен на: ' + lvl + '!', 'ok');
                    break;
                }
                case 'pump': {
                    const stock = (arg1 || '').toUpperCase();
                    const pct = parseFloat(arg2);
                    if (!stock || isNaN(pct)) { printLog('Использование: pump &lt;ТИКЕР&gt; &lt;%&gt;', 'err'); return; }
                    if (window.adminPumpStock) {
                        window.adminPumpStock(stock, 1 + (pct / 100));
                        printLog('Памп/дамп ' + stock + ' на ' + pct + '%!', 'ok');
                    }
                    break;
                }
                case 'price': {
                    const pStock = (arg1 || '').toUpperCase();
                    const pVal = parseInt(arg2, 10);
                    if (!pStock || isNaN(pVal) || pVal <= 0) { printLog('Использование: price &lt;ТИКЕР&gt; &lt;ЦЕНА&gt;', 'err'); return; }
                    if (window.adminSetStockPrice) {
                        window.adminSetStockPrice(pStock, pVal);
                        printLog('Цена ' + pStock + ' установлена на ' + pVal + ' 🪙!', 'ok');
                    }
                    break;
                }
                case 'score': {
                    const gMap = { 'snake': 'snake_best', 'jump': 'jump_best', 'blockblast': 'blockblast_best', 'racer': 'racer_best', '2048': 'best2048' };
                    const gKey = gMap[arg1 ? arg1.toLowerCase() : ''] || arg1;
                    const scoreVal = parseInt(arg2, 10);
                    if (!gKey || isNaN(scoreVal)) { printLog('Использование: score &lt;игра&gt; &lt;очки&gt;', 'err'); return; }
                    localStorage.setItem(gKey, scoreVal);
                    if (window.renderProfile) window.renderProfile();
                    printLog('Рекорд [' + gKey + '] = ' + scoreVal + '!', 'ok');
                    break;
                }
                case 'cases': {
                    const cAmt = parseInt(arg1, 10) || 10;
                    let userCases = JSON.parse(localStorage.getItem('v_user_cases') || '{"case_wood":0,"case_neon":0,"case_pro":0}');
                    userCases['case_wood'] = (userCases['case_wood'] || 0) + cAmt;
                    userCases['case_neon'] = (userCases['case_neon'] || 0) + cAmt;
                    userCases['case_pro'] = (userCases['case_pro'] || 0) + cAmt;
                    localStorage.setItem('v_user_cases', JSON.stringify(userCases));
                    if (window.renderCases) window.renderCases();
                    printLog('Выдано +' + cAmt + ' кейсов каждого вида!', 'ok');
                    break;
                }
                case 'unlock': {
                    const target = (arg1 || '').toLowerCase();
                    if (target === 'all' || target === 'eggs') {
                        ['nezabudka', '67', 'sigma', 'sigma_rus', 'matrix'].forEach(e => { if (window.unlockEgg) window.unlockEgg(e); });
                        printLog('Все пасхалки открыты!', 'ok');
                    }
                    if (target === 'all' || target === 'implants') {
                        if (window.adminUnlockAllCyberwareAction) window.adminUnlockAllCyberwareAction();
                        printLog('Все импланты установлены (100%)!', 'ok');
                    }
                    break;
                }
                case 'backup': {
                    const sub = (arg1 || '').toLowerCase();
                    if (sub === 'create') {
                        if (window.adminCreateNewBackupSnapshot) window.adminCreateNewBackupSnapshot();
                    } else if (sub === 'purge' || sub === 'clean') {
                        if (window.adminDeleteAllOldBackups) window.adminDeleteAllOldBackups();
                    } else {
                        printLog('Использование: backup [create | purge]', 'err');
                    }
                    break;
                }
                case 'theme': {
                    if (!arg1) { printLog('Укажите тему: gold, black, emerald, cyberpunk, sakura, default', 'err'); return; }
                    if (window.setGlobalTheme) window.setGlobalTheme(arg1.toLowerCase());
                    printLog('Тема: ' + arg1 + '!', 'ok');
                    break;
                }
                case 'ui': {
                    if (!arg1) { printLog('Укажите стиль: default, beta, glass, scifi, neumorph, tetris', 'err'); return; }
                    if (window.setUiDesign) window.setUiDesign(arg1.toLowerCase());
                    printLog('Дизайн: ' + arg1 + '!', 'ok');
                    break;
                }
                case 'clear': {
                    const out = document.getElementById('admin-cli-output');
                    if (out) out.innerHTML = '<div style="color:var(--text-dim);">Консоль очищена. Введите <b>help</b> для справки.</div>';
                    break;
                }
                case 'help': {
                    let helpTxt = '<div style="color:var(--accent); font-weight:800; margin:4px 0;">КОМАНДЫ CYBER CLI:</div>';
                    COMMANDS.forEach(c => {
                        helpTxt += '<div style="padding:1px 0;"><b style="color:#fff;">' + escapeHtml(c.cmd) + '</b> <span style="color:var(--text-dim);">&mdash; ' + escapeHtml(c.desc) + '</span></div>';
                    });
                    printLog(helpTxt, 'info');
                    break;
                }
                default: {
                    printLog('Неизвестная команда: "' + escapeHtml(action) + '". Введите <b>help</b>.', 'err');
                    break;
                }
            }
        } catch (err) {
            printLog('Исключение выполнения: ' + err.message, 'err');
        }
    };

    window.updateCliSuggestions = function(val) {
        const wrap = document.getElementById('admin-cli-suggestions');
        if (!wrap) return;

        const query = (val || '').trim().toLowerCase();
        if (!query) {
            wrap.innerHTML = '';
            wrap.style.display = 'none';
            return;
        }

        const matches = COMMANDS.filter(c => c.cmd.toLowerCase().startsWith(query) || c.cmd.toLowerCase().includes(query));
        if (matches.length === 0) {
            wrap.innerHTML = '';
            wrap.style.display = 'none';
            return;
        }

        wrap.style.display = 'flex';
        wrap.innerHTML = matches.slice(0, 6).map(m => `
            <div class="cli-sugg-item" onclick="insertCliCommand('${m.cmd.split(' ')[0]} ')">
                <b>${escapeHtml(m.cmd)}</b>
                <span>${escapeHtml(m.desc)}</span>
            </div>
        `).join('');
    };

    window.insertCliCommand = function(cmd) {
        const inp = document.getElementById('admin-cli-input');
        if (!inp) return;
        inp.value = cmd;
        inp.focus();
        window.updateCliSuggestions(cmd);
    };

    window.renderCliCheatsheet = function() {
        const cheatWrap = document.getElementById('admin-cli-cheatsheet');
        if (!cheatWrap) return;

        cheatWrap.innerHTML = COMMANDS.map(c => `
            <div class="cli-cheat-item" onclick="insertCliCommand('${c.cmd.split(' ')[0]} ')">
                <code>${escapeHtml(c.cmd)}</code>
                <small>${escapeHtml(c.desc)}</small>
            </div>
        `).join('');
    };

    window.bindCliEvents = function() {
        const inp = document.getElementById('admin-cli-input');
        if (!inp || inp.dataset.bound === 'true') return;
        inp.dataset.bound = 'true';

        inp.addEventListener('input', (e) => {
            window.updateCliSuggestions(e.target.value);
        });

        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                window.runAdminCliCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    inp.value = history[historyIndex] || '';
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < history.length - 1) {
                    historyIndex++;
                    inp.value = history[historyIndex] || '';
                } else {
                    historyIndex = history.length;
                    inp.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const q = inp.value.trim().toLowerCase();
                const match = COMMANDS.find(c => c.cmd.toLowerCase().startsWith(q));
                if (match) {
                    inp.value = match.cmd.split(' ')[0] + ' ';
                    window.updateCliSuggestions(inp.value);
                }
            }
        });
    };

    window.initAdminCli = function() {
        window.renderCliCheatsheet();
        window.bindCliEvents();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initAdminCli);
    } else {
        window.initAdminCli();
    }
})();
