function initRunner(mount) {
    document.getElementById('game-title').innerText = "Cyber Runner 2D";
    const w = Math.min(window.innerWidth - 32, 340);
    const h = 400;

    mount.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%; user-select:none;">
            <div style="display:flex; justify-content:space-between; width:${w}px; font-size:13px; font-weight:700; margin-bottom:6px;">
                <span>Дистанция: <b id="rn-dist" style="color:var(--accent); font-size:16px;">0</b> m</span>
                <span style="color:var(--accent-warm);">🪙 <b id="rn-coins">0</b></span>
                <span>Рекорд: <b id="rn-best" style="color:var(--accent-warm);">0</b></span>
            </div>

            <canvas id="rn-canvas" width="${w}" height="${h}" style="background:#070b14; border:2px solid var(--border); border-radius:14px; touch-action:none; display:block; box-shadow:0 6px 24px rgba(0,0,0,0.6);"></canvas>

            <div style="display:flex; gap:8px; width:${w}px; margin-top:8px;">
                <button class="p-btn" style="flex:1; padding:12px 0; font-size:15px; background:rgba(56,189,248,0.2); color:var(--accent); font-weight:800;" id="rn-btn-jump">▲ ПРЫЖОК</button>
                <button class="p-btn" style="flex:1; padding:12px 0; font-size:15px; background:rgba(245,158,11,0.2); color:var(--accent-warm); font-weight:800;" id="rn-btn-slide">▼ ПОДКАТ</button>
            </div>
        </div>
    `;

    const canvas = document.getElementById('rn-canvas');
    const ctx = canvas.getContext('2d');
    const distEl = document.getElementById('rn-dist');
    const coinsEl = document.getElementById('rn-coins');
    const bestEl = document.getElementById('rn-best');

    let best = parseInt(localStorage.getItem('runner_best') || '0');
    bestEl.innerText = best;

    let dist = 0;
    let coins = 0;
    let isGameOver = false;
    let started = false;

    const groundY = h - 60;
    let hero = {
        x: 45, y: groundY - 32, w: 22, h: 32,
        vy: 0, onGround: true, sliding: false, slideTimer: 0
    };

    let obstacles = [];
    let pickupCoins = [];
    let speed = 4.2;
    let tick = 0;

    function jump() {
        if (isGameOver) { restartCurrentGame(); return; }
        if (!started) started = true;
        if (hero.onGround && !hero.sliding) {
            hero.vy = -9.2;
            hero.onGround = false;
            if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate(10);
        }
    }

    function slide() {
        if (isGameOver) { restartCurrentGame(); return; }
        if (!started) started = true;
        if (hero.onGround && !hero.sliding) {
            hero.sliding = true;
            hero.h = 16;
            hero.y = groundY - 16;
            hero.slideTimer = 35;
            if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate(12);
        }
    }

    document.getElementById('rn-btn-jump').onclick = jump;
    document.getElementById('rn-btn-slide').onclick = slide;

    canvas.addEventListener('pointerdown', (e) => {
        const r = canvas.getBoundingClientRect();
        if ((e.clientY - r.top) < h / 2) jump();
        else slide();
    });

    function spawnHazard() {
        const isHigh = Math.random() > 0.5;
        if (isHigh) {
            // Летающий лазерный дрон — нужно проскользить под ним
            obstacles.push({ x: w + 20, y: groundY - 42, w: 26, h: 18, type: 'drone' });
        } else {
            // Наземный барьер — нужно перепрыгнуть
            obstacles.push({ x: w + 20, y: groundY - 26, w: 18, h: 26, type: 'barrier' });
        }

        // Монеты
        if (Math.random() < 0.6) {
            pickupCoins.push({ x: w + 60, y: groundY - (isHigh ? 12 : 55), taken: false });
        }
    }

    function loop() {
        ctx.clearRect(0, 0, w, h);

        // Фон: неоновые полосы
        ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(0, i * 65, w, 2);
        }

        // Земля
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, groundY, w, h - groundY);
        ctx.fillStyle = 'var(--accent)';
        ctx.fillRect(0, groundY, w, 3);

        if (started && !isGameOver) {
            tick++;
            dist += Math.floor(speed * 0.25);
            distEl.innerText = dist;
            speed += 0.0008;

            if (dist > best) {
                best = dist;
                localStorage.setItem('runner_best', best);
                bestEl.innerText = best;
            }

            // Физика прыжка
            if (!hero.onGround) {
                hero.vy += 0.45;
                hero.y += hero.vy;
                if (hero.y >= groundY - 32) {
                    hero.y = groundY - 32;
                    hero.vy = 0;
                    hero.onGround = true;
                }
            }

            // Таймер подката
            if (hero.sliding) {
                hero.slideTimer--;
                if (hero.slideTimer <= 0) {
                    hero.sliding = false;
                    hero.h = 32;
                    hero.y = groundY - 32;
                }
            }

            if (tick % Math.floor(110 / (speed * 0.22)) === 0) {
                spawnHazard();
            }

            // Препятствия
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const ob = obstacles[i];
                ob.x -= speed;

                // Коллизия
                if (hero.x < ob.x + ob.w &&
                    hero.x + hero.w > ob.x &&
                    hero.y < ob.y + ob.h &&
                    hero.y + hero.h > ob.y) {
                    isGameOver = true;
                    if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate([60, 40, 80]);
                }

                if (ob.x < -40) obstacles.splice(i, 1);
            }

            // Монеты
            for (let i = pickupCoins.length - 1; i >= 0; i--) {
                const c = pickupCoins[i];
                c.x -= speed;

                if (!c.taken && Math.hypot((hero.x + hero.w / 2) - c.x, (hero.y + hero.h / 2) - c.y) < 22) {
                    c.taken = true;
                    coins++;
                    coinsEl.innerText = coins;
                    if (typeof window.addGlobalCoins === 'function') window.addGlobalCoins(2);
                    if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate(10);
                }

                if (c.x < -20 || c.taken) pickupCoins.splice(i, 1);
            }
        }

        // Отрисовка препятствий
        obstacles.forEach(ob => {
            if (ob.type === 'drone') {
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
                ctx.fillStyle = '#ff0055';
                ctx.fillRect(ob.x - 3, ob.y + ob.h / 2 - 2, ob.w + 6, 4);
            } else {
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.moveTo(ob.x, ob.y + ob.h);
                ctx.lineTo(ob.x + ob.w / 2, ob.y);
                ctx.lineTo(ob.x + ob.w, ob.y + ob.h);
                ctx.fill();
            }
        });

        // Отрисовка монет
        pickupCoins.forEach(c => {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath(); ctx.arc(c.x, c.y, 7, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#b45309'; ctx.lineWidth = 1.5; ctx.stroke();
        });

        // Отрисовка героя
        ctx.save();
        ctx.fillStyle = 'var(--accent)';
        ctx.shadowColor = 'var(--accent)';
        ctx.shadowBlur = 10;
        ctx.fillRect(hero.x, hero.y, hero.w, hero.h);

        // Очки героя
        ctx.fillStyle = '#fff';
        ctx.fillRect(hero.x + hero.w - 7, hero.y + 4, 6, 5);
        ctx.restore();

        if (!started) {
            ctx.fillStyle = 'rgba(5, 10, 20, 0.75)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('CYBER RUNNER 2D', w / 2, h / 2 - 12);
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('Тапните или жмите кнопки внизу', w / 2, h / 2 + 12);
        } else if (isGameOver) {
            ctx.fillStyle = 'rgba(5, 10, 20, 0.85)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = 'var(--danger)';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('СТОЛКНОВЕНИЕ!', w / 2, h / 2 - 14);
            ctx.fillStyle = '#fff';
            ctx.font = '14px sans-serif';
            ctx.fillText(`Дистанция: ${dist} m | Монеты: ${coins}`, w / 2, h / 2 + 14);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px sans-serif';
            ctx.fillText('Тапните, чтобы начать заново', w / 2, h / 2 + 38);
        }

        requestAnimationFrame(loop);
    }

    loop();
}
