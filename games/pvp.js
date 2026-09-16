function initPvp(mount) {
    document.getElementById('game-title').innerText = "Неоновый Хоккей (2 Игрока)";
    const w = Math.min(window.innerWidth - 32, 340);
    const h = 460;

    mount.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%; user-select:none;">
            <div style="display:flex; justify-content:space-between; width:${w}px; font-size:14px; font-weight:800; margin-bottom:6px;">
                <span style="color:#ef4444;">Игрок 1 (Верх): <b id="pvp-s1">0</b></span>
                <span style="color:#38bdf8;">Игрок 2 (Низ): <b id="pvp-s2">0</b></span>
            </div>

            <canvas id="pvp-canvas" width="${w}" height="${h}" style="background:#050914; border:2px solid var(--border); border-radius:14px; touch-action:none; display:block; box-shadow:0 6px 24px rgba(0,0,0,0.6);"></canvas>

            <div style="display:flex; justify-content:space-between; width:${w}px; margin-top:8px;">
                <span style="font-size:11px; color:var(--text-dim); align-self:center;">Управление пальцами на своих половинах</span>
                <button class="p-btn" style="padding:4px 12px; font-size:11px;" onclick="restartCurrentGame()">Сброс</button>
            </div>
        </div>
    `;

    const canvas = document.getElementById('pvp-canvas');
    const ctx = canvas.getContext('2d');
    const s1El = document.getElementById('pvp-s1');
    const s2El = document.getElementById('pvp-s2');

    let score1 = 0, score2 = 0;
    const goalWidth = w * 0.44;
    const goalLeft = (w - goalWidth) / 2;

    let p1 = { x: w / 2, y: 55, r: 22, color: '#ef4444', touchId: null };
    let p2 = { x: w / 2, y: h - 55, r: 22, color: '#38bdf8', touchId: null };
    let puck = { x: w / 2, y: h / 2, vx: 0, vy: 0, r: 12 };

    function resetPuck(toPlayer) {
        puck.x = w / 2;
        puck.y = h / 2;
        puck.vx = (Math.random() - 0.5) * 4;
        puck.vy = toPlayer === 1 ? -4 : 4;
    }
    resetPuck(Math.random() > 0.5 ? 1 : 2);

    function handleTouches(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        for (let i = 0; i < e.touches.length; i++) {
            const t = e.touches[i];
            const tx = t.clientX - rect.left;
            const ty = t.clientY - rect.top;

            // Верхний игрок
            if (ty < h / 2) {
                p1.x = Math.max(p1.r, Math.min(w - p1.r, tx));
                p1.y = Math.max(p1.r, Math.min(h / 2 - p1.r - 2, ty));
            } 
            // Нижний игрок
            else {
                p2.x = Math.max(p2.r, Math.min(w - p2.r, tx));
                p2.y = Math.max(h / 2 + p2.r + 2, Math.min(h - p2.r, ty));
            }
        }
    }

    canvas.addEventListener('touchstart', handleTouches, { passive: false });
    canvas.addEventListener('touchmove', handleTouches, { passive: false });

    function collide(paddle) {
        const dx = puck.x - paddle.x;
        const dy = puck.y - paddle.y;
        const dist = Math.hypot(dx, dy);

        if (dist < puck.r + paddle.r) {
            const angle = Math.atan2(dy, dx);
            const speed = Math.max(7, Math.hypot(puck.vx, puck.vy) * 1.05);
            puck.vx = Math.cos(angle) * speed;
            puck.vy = Math.sin(angle) * speed;
            puck.x = paddle.x + Math.cos(angle) * (puck.r + paddle.r + 1);
            puck.y = paddle.y + Math.sin(angle) * (puck.r + paddle.r + 1);

            if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate(12);
        }
    }

    let animId = null;
    function loop() {
        // Движение шайбы
        puck.x += puck.vx;
        puck.y += puck.vy;
        puck.vx *= 0.992;
        puck.vy *= 0.992;

        // Отскоки от левого и правого бортов
        if (puck.x - puck.r <= 0) { puck.x = puck.r; puck.vx = -puck.vx; }
        if (puck.x + puck.r >= w) { puck.x = w - puck.r; puck.vx = -puck.vx; }

        // Отскоки от верхнего и нижнего бортов вне ворот
        if (puck.y - puck.r <= 0) {
            if (puck.x < goalLeft || puck.x > goalLeft + goalWidth) {
                puck.y = puck.r; puck.vy = -puck.vy;
            } else if (puck.y < -puck.r) {
                // Гол нижнему игроку (Игрок 2 забил)
                score2++;
                s2El.innerText = score2;
                if (typeof window.addGlobalCoins === 'function') window.addGlobalCoins(25);
                notify("⚽ Гол забил Игрок 2 (Низ)!");
                resetPuck(1);
            }
        }

        if (puck.y + puck.r >= h) {
            if (puck.x < goalLeft || puck.x > goalLeft + goalWidth) {
                puck.y = h - puck.r; puck.vy = -puck.vy;
            } else if (puck.y > h + puck.r) {
                // Гол верхнему игроку (Игрок 1 забил)
                score1++;
                s1El.innerText = score1;
                if (typeof window.addGlobalCoins === 'function') window.addGlobalCoins(25);
                notify("⚽ Гол забил Игрок 1 (Верх)!");
                resetPuck(2);
            }
        }

        collide(p1);
        collide(p2);

        // Отрисовка
        ctx.clearRect(0, 0, w, h);

        // Разметка поля
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 2;

        // Центральная линия и круг
        ctx.beginPath();
        ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 40, 0, Math.PI * 2);
        ctx.stroke();

        // Ворота
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.fillRect(goalLeft, 0, goalWidth, 6);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fillRect(goalLeft, h - 6, goalWidth, 6);

        // Игроки
        [p1, p2].forEach(p => {
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 12;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.45, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });

        // Шайба
        ctx.save();
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(puck.x, puck.y, puck.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        animId = requestAnimationFrame(loop);
    }

    loop();
}
