function initSpace(mount) {
    document.getElementById('game-title').innerText = "Звёздный Защитник";
    const w = Math.min(window.innerWidth - 32, 340);
    const h = 420;

    mount.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%; user-select:none;">
            <div style="display:flex; justify-content:space-between; width:${w}px; font-size:13px; font-weight:700; margin-bottom:6px;">
                <span>Счёт: <b id="sp-score" style="color:var(--accent); font-size:16px;">0</b></span>
                <span id="sp-hp" style="color:var(--danger);">❤️❤️❤️</span>
                <span>Рекорд: <b id="sp-best" style="color:var(--accent-warm);">0</b></span>
            </div>

            <canvas id="sp-canvas" width="${w}" height="${h}" style="background:#030712; border:2px solid var(--border); border-radius:14px; touch-action:none; display:block; box-shadow:0 6px 24px rgba(0,0,0,0.6);"></canvas>

            <div style="display:flex; justify-content:space-between; width:${w}px; margin-top:8px; font-size:11px; color:var(--text-dim);">
                <span>Ведите пальцем по экрану для манёвров 🚀</span>
                <button class="p-btn" style="padding:4px 12px; font-size:11px;" onclick="restartCurrentGame()">Заново</button>
            </div>
        </div>
    `;

    const canvas = document.getElementById('sp-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('sp-score');
    const hpEl = document.getElementById('sp-hp');
    const bestEl = document.getElementById('sp-best');

    let best = parseInt(localStorage.getItem('space_best') || '0');
    bestEl.innerText = best;

    let score = 0;
    let hp = 3;
    let isGameOver = false;
    let started = false;

    let ship = { x: w / 2, y: h - 50, w: 26, h: 26, shield: false, rapid: 0 };
    let bullets = [];
    let enemies = [];
    let powerups = [];
    let particles = [];
    let stars = [];
    let tick = 0;

    for (let i = 0; i < 45; i++) {
        stars.push({ x: Math.random() * w, y: Math.random() * h, s: Math.random() * 2 + 0.5, speed: Math.random() * 1.5 + 0.5 });
    }

    function moveShip(cx, cy) {
        const r = canvas.getBoundingClientRect();
        ship.x = Math.max(16, Math.min(w - 16, cx - r.left));
        ship.y = Math.max(20, Math.min(h - 20, cy - r.top));
        if (!started) started = true;
    }

    canvas.addEventListener('pointerdown', (e) => moveShip(e.clientX, e.clientY));
    canvas.addEventListener('pointermove', (e) => {
        if (e.buttons > 0 || e.pointerType === 'touch') moveShip(e.clientX, e.clientY);
    });

    function addExplosion(x, y, color, count = 18) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 4 + 1;
            particles.push({
                x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                color, alpha: 1, size: Math.random() * 3 + 1.5
            });
        }
    }

    function spawnEnemy() {
        const types = [
            { hp: 1, color: '#ef4444', size: 16, speed: 2.2, pts: 15 },
            { hp: 2, color: '#f59e0b', size: 22, speed: 1.6, pts: 35 },
            { hp: 4, color: '#a855f7', size: 28, speed: 1.1, pts: 70 }
        ];
        const t = types[Math.random() < 0.6 ? 0 : (Math.random() < 0.8 ? 1 : 2)];
        enemies.push({
            x: Math.random() * (w - 40) + 20,
            y: -30,
            hp: t.hp,
            maxHp: t.hp,
            color: t.color,
            size: t.size,
            speed: t.speed,
            pts: t.pts
        });
    }

    function loop() {
        ctx.clearRect(0, 0, w, h);

        // Звёздный космос
        ctx.fillStyle = '#fff';
        stars.forEach(s => {
            s.y += s.speed;
            if (s.y > h) s.y = 0;
            ctx.globalAlpha = s.s / 2.5;
            ctx.fillRect(s.x, s.y, s.s, s.s);
        });
        ctx.globalAlpha = 1;

        if (started && !isGameOver) {
            tick++;
            if (ship.rapid > 0) ship.rapid--;

            // Стрельба
            const fireInterval = ship.rapid > 0 ? 6 : 12;
            if (tick % fireInterval === 0) {
                bullets.push({ x: ship.x - 7, y: ship.y - 12, speed: 7 });
                bullets.push({ x: ship.x + 7, y: ship.y - 12, speed: 7 });
            }

            if (tick % 48 === 0) spawnEnemy();

            // Движение пуль
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.y -= b.speed;
                if (b.y < -10) bullets.splice(i, 1);
            }

            // Движение врагов
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                e.y += e.speed;

                // Столкновение с пулями
                for (let j = bullets.length - 1; j >= 0; j--) {
                    const b = bullets[j];
                    if (Math.hypot(b.x - e.x, b.y - e.y) < e.size) {
                        bullets.splice(j, 1);
                        e.hp--;
                        if (e.hp <= 0) {
                            addExplosion(e.x, e.y, e.color, 15);
                            score += e.pts;
                            scoreEl.innerText = score;
                            if (score > best) {
                                best = score;
                                localStorage.setItem('space_best', best);
                                bestEl.innerText = best;
                            }
                            if (typeof window.checkGameAchievements === 'function') {
                                window.checkGameAchievements('space', score);
                            }

                            // Шанс дропа бонуса
                            if (Math.random() < 0.2) {
                                const pTypes = ['rapid', 'shield', 'bomb'];
                                powerups.push({ x: e.x, y: e.y, type: pTypes[Math.floor(Math.random() * 3)] });
                            }
                            enemies.splice(i, 1);
                            break;
                        }
                    }
                }

                // Столкновение с кораблем
                if (Math.hypot(ship.x - e.x, ship.y - e.y) < e.size + 12) {
                    addExplosion(e.x, e.y, '#ef4444', 20);
                    enemies.splice(i, 1);
                    if (ship.shield) {
                        ship.shield = false;
                        notify("🛡️ Щит поглотил урон!");
                    } else {
                        hp--;
                        hpEl.innerText = '❤️'.repeat(Math.max(0, hp));
                        if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate(50);
                        if (hp <= 0) isGameOver = true;
                    }
                }

                if (e.y > h + 30) enemies.splice(i, 1);
            }

            // Бонусы
            for (let i = powerups.length - 1; i >= 0; i--) {
                const p = powerups[i];
                p.y += 1.8;
                if (Math.hypot(ship.x - p.x, ship.y - p.y) < 22) {
                    if (p.type === 'rapid') { ship.rapid = 220; notify("⚡ Максимальный скорострел!"); }
                    if (p.type === 'shield') { ship.shield = true; notify("🛡️ Энергощит активен!"); }
                    if (p.type === 'bomb') {
                        enemies.forEach(en => addExplosion(en.x, en.y, '#ffd700', 10));
                        score += enemies.length * 25;
                        enemies = [];
                        notify("💣 Экран зачищен!");
                    }
                    powerups.splice(i, 1);
                } else if (p.y > h + 20) powerups.splice(i, 1);
            }
        }

        // Отрисовка пуль
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 8;
        bullets.forEach(b => ctx.fillRect(b.x - 2, b.y, 4, 10));
        ctx.shadowBlur = 0;

        // Отрисовка врагов
        enemies.forEach(e => {
            ctx.fillStyle = e.color;
            ctx.beginPath();
            ctx.moveTo(e.x, e.y + e.size);
            ctx.lineTo(e.x - e.size * 0.8, e.y - e.size * 0.6);
            ctx.lineTo(e.x + e.size * 0.8, e.y - e.size * 0.6);
            ctx.closePath();
            ctx.fill();
        });

        // Отрисовка бонусов
        powerups.forEach(p => {
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const ico = p.type === 'rapid' ? '⚡' : (p.type === 'shield' ? '🛡️' : '💣');
            ctx.fillText(ico, p.x, p.y);
        });

        // Отрисовка корабля игрока
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(-14, 12);
        ctx.lineTo(0, 7);
        ctx.lineTo(14, 12);
        ctx.closePath();
        ctx.fill();

        // Пламя двигателя
        ctx.fillStyle = Math.random() > 0.5 ? '#f59e0b' : '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-5, 9); ctx.lineTo(0, 16 + Math.random() * 6); ctx.lineTo(5, 9);
        ctx.fill();

        if (ship.shield) {
            ctx.strokeStyle = '#00f5ff';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();

        // Частицы взрывов
        for (let i = particles.length - 1; i >= 0; i--) {
            const pt = particles[i];
            pt.x += pt.vx; pt.y += pt.vy; pt.alpha -= 0.035;
            if (pt.alpha <= 0) { particles.splice(i, 1); continue; }
            ctx.globalAlpha = pt.alpha;
            ctx.fillStyle = pt.color;
            ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;

        if (!started) {
            ctx.fillStyle = 'rgba(5, 10, 20, 0.75)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('КОСМИЧЕСКАЯ ОБОРОНА 🚀', w / 2, h / 2 - 12);
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('Проведите пальцем для взлёта', w / 2, h / 2 + 12);
        } else if (isGameOver) {
            ctx.fillStyle = 'rgba(5, 10, 20, 0.85)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = 'var(--danger)';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('КОРАБЛЬ УНИЧТОЖЕН', w / 2, h / 2 - 20);
            ctx.fillStyle = '#fff';
            ctx.font = '14px sans-serif';
            ctx.fillText(`Счёт: ${score}  |  Рекорд: ${best}`, w / 2, h / 2 + 10);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px sans-serif';
            ctx.fillText('Тапните заново', w / 2, h / 2 + 35);
        }

        requestAnimationFrame(loop);
    }

    loop();
}
