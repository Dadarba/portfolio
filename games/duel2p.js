function initDuel2P(mount) {
    document.getElementById('game-title').innerText = "Дуэль Реакции (2 Игрока) ⚡";
    const w = Math.min(window.innerWidth - 32, 340);
    const h = 420;

    mount.innerHTML = `
        <style>
            .duel-box {
                display: flex; flex-direction: column; width: ${w}px; height: ${h}px;
                border: 2px solid var(--border); border-radius: 16px; overflow: hidden;
                box-shadow: 0 8px 30px rgba(0,0,0,0.7); position: relative; user-select: none;
            }
            .duel-half {
                flex: 1; display: flex; flex-direction: column; justify-content: center;
                align-items: center; cursor: pointer; transition: background 0.15s;
                touch-action: manipulation; position: relative;
            }
            .duel-half:active { filter: brightness(1.2); }
            .duel-top {
                background: #1a0b12; border-bottom: 2px dashed rgba(255,255,255,0.15);
                transform: rotate(180deg); /* ПЕРЕВЁРНУТО ДЛЯ ВЕРХНЕГО ИГРОКА */
            }
            .duel-bot {
                background: #091322;
            }
            .duel-center-divider {
                position: absolute; top: 50%; left: 0; right: 0; transform: translateY(-50%);
                display: flex; justify-content: space-between; align-items: center;
                padding: 0 12px; z-index: 10; pointer-events: none;
            }
            .duel-score-badge {
                font-size: 13px; font-weight: 800; background: rgba(0,0,0,0.85);
                border: 1px solid var(--border); padding: 3px 10px; border-radius: 20px;
            }
        </style>

        <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
            <div style="display:flex; justify-content:space-between; width:${w}px; margin-bottom:6px; font-size:11px; color:var(--text-dim);">
                <span>Положите телефон на стол между собой ⚔️</span>
                <button class="p-btn" style="padding:2px 8px; font-size:10px;" onclick="restartCurrentGame()">Сброс</button>
            </div>

            <div class="duel-box" id="duel-arena">
                <!-- Верхняя половина (Игрок 1 - Красный) -->
                <div class="duel-half duel-top" id="duel-p1">
                    <span style="font-size:26px;" id="p1-icon">⏳</span>
                    <b style="font-size:15px; color:#ef4444; margin-top:4px;" id="p1-text">ЖДИ СИГНАЛА...</b>
                    <span style="font-size:11px; color:var(--text-dim);" id="p1-sub">За фальстарт — поражение!</span>
                </div>

                <div class="duel-center-divider">
                    <span class="duel-score-badge" style="color:#ef4444;" id="duel-s1">P1: 0</span>
                    <span class="duel-score-badge" style="color:#ffd700;" id="duel-signal-txt">ПРИГОТОВИТЬСЯ</span>
                    <span class="duel-score-badge" style="color:#38bdf8;" id="duel-s2">P2: 0</span>
                </div>

                <!-- Нижняя половина (Игрок 2 - Синий) -->
                <div class="duel-half duel-bot" id="duel-p2">
                    <span style="font-size:26px;" id="p2-icon">⏳</span>
                    <b style="font-size:15px; color:#38bdf8; margin-top:4px;" id="p2-text">ЖДИ СИГНАЛА...</b>
                    <span style="font-size:11px; color:var(--text-dim);" id="p2-sub">Тапни первым на ОГОНЬ</span>
                </div>
            </div>
        </div>
    `;

    let score1 = 0, score2 = 0;
    let roundState = 'WAITING'; // 'WAITING', 'FIRE', 'ENDED'
    let fireTimeout = null;

    const p1El = document.getElementById('duel-p1');
    const p2El = document.getElementById('duel-p2');
    const s1El = document.getElementById('duel-s1');
    const s2El = document.getElementById('duel-s2');
    const p1Txt = document.getElementById('p1-text');
    const p2Txt = document.getElementById('p2-text');
    const p1Ico = document.getElementById('p1-icon');
    const p2Ico = document.getElementById('p2-icon');
    const sigTxt = document.getElementById('duel-signal-txt');

    function startDuelRound() {
        if (fireTimeout) clearTimeout(fireTimeout);
        roundState = 'WAITING';

        p1El.style.background = '#1a0b12';
        p2El.style.background = '#091322';

        p1Txt.innerText = "ЖДИ СИГНАЛА...";
        p2Txt.innerText = "ЖДИ СИГНАЛА...";
        p1Ico.innerText = "⏳";
        p2Ico.innerText = "⏳";
        sigTxt.innerText = "ЖДИТЕ...";
        sigTxt.style.color = 'var(--text-dim)';

        // Случайная задержка от 2.0 до 5.0 секунд
        const delay = Math.random() * 3000 + 2000;
        fireTimeout = setTimeout(() => {
            if (roundState !== 'WAITING') return;
            roundState = 'FIRE';

            p1El.style.background = '#450a0a';
            p2El.style.background = '#082f49';

            p1Txt.innerText = "🔥 СТРЕЛЯЙ!";
            p2Txt.innerText = "🔥 СТРЕЛЯЙ!";
            p1Ico.innerText = "⚡";
            p2Ico.innerText = "⚡";
            sigTxt.innerText = "ВЫСТРЕЛ!";
            sigTxt.style.color = '#ffd700';

            if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate(30);
        }, delay);
    }

    function handleTap(player) {
        if (roundState === 'ENDED') return;

        if (roundState === 'WAITING') {
            // ФАЛЬСТАРТ! Кто нажал раньше времени — проигрывает раунд
            roundState = 'ENDED';
            if (fireTimeout) clearTimeout(fireTimeout);

            if (player === 1) {
                score2++;
                notify("❌ Фальстарт Игрока 1! Очко Игроку 2");
            } else {
                score1++;
                notify("❌ Фальстарт Игрока 2! Очко Игроку 1");
            }
            updateDuelScores();
            setTimeout(startDuelRound, 1800);
            return;
        }

        if (roundState === 'FIRE') {
            // ЧЕСТНАЯ ПОБЕДА
            roundState = 'ENDED';
            if (player === 1) {
                score1++;
                p1El.style.background = '#166534';
                p1Txt.innerText = "🏆 ПОБЕДА!";
                p2Txt.innerText = "💀 ПОРАЖЕНИЕ";
                notify("Игрок 1 был быстрее!");
            } else {
                score2++;
                p2El.style.background = '#166534';
                p2Txt.innerText = "🏆 ПОБЕДА!";
                p1Txt.innerText = "💀 ПОРАЖЕНИЕ";
                notify("Игрок 2 был быстрее!");
            }

            if (typeof window.addGlobalCoins === 'function') window.addGlobalCoins(10);
            if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate([20, 40]);
            updateDuelScores();
            setTimeout(startDuelRound, 2000);
        }
    }

    function updateDuelScores() {
        s1El.innerText = `P1: ${score1}`;
        s2El.innerText = `P2: ${score2}`;

        if (score1 >= 5 || score2 >= 5) {
            const winner = score1 >= 5 ? 'Игрок 1' : 'Игрок 2';
            notify(`🎉 МАТЧ ОКОНЧЕН! Победитель: ${winner}!`, 4000);
            score1 = 0; score2 = 0;
            setTimeout(updateDuelScores, 2200);
        }
    }

    p1El.addEventListener('pointerdown', (e) => { e.preventDefault(); handleTap(1); });
    p2El.addEventListener('pointerdown', (e) => { e.preventDefault(); handleTap(2); });

    startDuelRound();
}
