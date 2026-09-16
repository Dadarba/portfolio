function initRacer(mount) {
    document.getElementById('game-title').innerText = "Кибер-Гонки 🏎️";
    const w = Math.min(window.innerWidth - 32, 330);
    const h = 420;

    mount.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%; user-select:none;">
            <div style="display:flex; justify-content:space-between; width:${w}px; font-size:13px; font-weight:700; margin-bottom:6px;">
                <span>Дистанция: <b id="rc-score" style="color:var(--accent); font-size:16px;">0</b> m</span>
                <span id="rc-speed" style="color:var(--accent-warm);">120 km/h</span>
                <span>Рекорд: <b id="rc-best" style="color:var(--accent-warm);">0</b> m</span>
            </div>

            <canvas id="rc-canvas" width="${w}" height="${h}" style="background:#050a14; border:2px solid var(--border); border-radius:14px; touch-action:none; display:block; box-shadow:0 6px 24px rgba(0,0,0,0.6);"></canvas>

            <div style="display:flex; gap:6px; width:${w}px; margin-top:8px;">
                <button class="p-btn" style="flex:1; padding:12px 0; font-size:15px;" id="rc-btn-left">◄ ВЛЕВО</button>
                <button class="p-btn" style="flex:1; padding:12px 0; font-size:15px; background:var(--accent); color:#000; font-weight:800;" id="rc-btn-nitro">🚀 НИТРО</button>
                <button class="p-btn" style="flex:1; padding:12px 0; font-size:15px;" id="rc-btn-right">ВПРАВО ►</button>
            </div>
        </div>
    `;

    const canvas = document.getElementById('rc-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('rc-score');
    const speedEl = document.getElementById('rc-speed');
    const bestEl = document.getElementById('rc-best');

    let best = parseInt(localStorage.getItem('racer_best') || '0');
    bestEl.innerText = best;

    let score = 0;
    let isGameOver = false;
    let started = false;
    let animId = null;

    // 3 полосы движения
    const laneWidth = w / 3;
    const laneCenters = [laneWidth * 0.5, laneWidth * 1.5, laneWidth * 2.5];
    let currentLane = 1; // 0, 1, 2

    let player = {
        x: laneCenters[1],
        targetX: laneCenters[1],
        y: h - 70,
        w: 26,
        h: 46,
        shield: false,
        nitroTime: 0
    };

    let baseSpeed = 4.5;
    let roadOffset = 0;
    let enemies = [];
    let pickups = []; // { x, y, type: 'coin' | 'nitro' | 'shield' }
    let particles = [];
    let tick = 0;

    function switchLane(dir) {
        if (isGameOver) { restartCurrentGame(); return; }
        if (!started) started = true;

        if (dir === 'left' && currentLane > 0) currentLane--;
        else if (dir === 'right' && currentLane < 2) currentLane++;
        player.targetX = laneCenters[currentLane];

        if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate(8);
    }

    function activateNitro() {
        if (!started) started = true;
        if (player.nitroTime <= 0) {
            player.nitroTime = 160;
            notify("🚀 НИТРО-УСКОРЕНИЕ x2!");
            if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate([15, 30]);
        }
    }

    document.getElementById('rc-btn-left').onclick = () => switchLane('left');
    document.getElementById('rc-btn-right').onclick = () => switchLane('right');
    document.getElementById('rc-btn-nitro').onclick = activateNitro;

    // Управление касанием по левой / правой половине экрана
    canvas.addEventListener('pointerdown', (e) => {
        const r = canvas.getBoundingClientRect();
        const touchX = e.clientX - r.left;
        if (touchX < w / 2) switchLane('left');
        else switchLane('right');
    });

    function spawnTraffic() {
        const lane = Math.floor(Math.random() * 3);
        const colors = ['#ef4444', '#f59e0b', '#c084fc', '#10b981'];
        enemies.push({
            x: laneCenters[lane],
            y: -60,
            w: 24,
            h: 44,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 1.5 + 2
        });

        // Шанс бонуса
        if (Math.random() < 0.45) {
            const freeLane = (lane + 1 + Math.floor(Math.random() * 2)) % 3;
            const types = ['coin', 'coin', 'nitro', 'shield'];
            pickups.push({
                x: laneCenters[freeLane],
                y: -50,
                type: types[Math.floor(Math.random() * types.length)]
            });
        }
    }

    function addExplosion(x, y, color) {
        for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 5 + 1.5;
            particles.push({
                x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                color, size: Math.random() * 4 + 2, alpha: 1
            });
        }
    }

    function loop() {
        ctx.clearRect(0, 0, w, h);

        const curSpeed = (player.nitroTime > 0 ? baseSpeed * 1.8 : baseSpeed);

        // 1. Анимация дороги и разделительных полос
        roadOffset = (roadOffset + curSpeed) % 40;
        ctx.fillStyle = '#060b17';
        ctx.fillRect(0, 0, w, h);

        // Обочины
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fillRect(0, 0, 4, h);
        ctx.fillRect(w - 4, 0, 4, h);

        // Разделители полос
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 3;
        ctx.setLineDash([20, 20]);
        ctx.lineDashOffset = -roadOffset;

        ctx.beginPath();
        ctx.moveTo(laneWidth, 0); ctx.lineTo(laneWidth, h);
        ctx.moveTo(laneWidth * 2, 0); ctx.lineTo(laneWidth * 2, h);
        ctx.stroke();
        ctx.setLineDash([]);

        if (started && !isGameOver) {
            tick++;
            score += Math.floor(curSpeed * 0.25);
            scoreEl.innerText = score;
            speedEl.innerText = `${Math.floor(curSpeed * 26)} km/h`;
            baseSpeed += 0.0007;

            if (score > best) {
                best = score;
                localStorage.setItem('racer_best', best);
                bestEl.innerText = best;
            }

            if (player.nitroTime > 0) player.nitroTime--;

            // Плавное перестроение машины
            player.x += (player.targetX - player.x) * 0.25;

            // Спавн трафика
            if (tick % Math.max(35, Math.floor(65 - baseSpeed * 2)) === 0) {
                spawnTraffic();
            }

            // Движение трафика
            for (let i = enemies.length - 1; i >= 0; i--) {
                const en = enemies[i];
                en.y += (curSpeed - en.speed);

                // Коллизия с машиной игрока
                if (Math.abs(player.x - en.x) < 22 && Math.abs(player.y - en.y) < 40) {
                    if (player.nitroTime > 0 || player.shield) {
                        addExplosion(en.x, en.y, en.color);
                        enemies.splice(i, 1);
                        if (player.shield) {
                            player.shield = false;
                            notify("🛡️ Щит спас при столкновении!");
                        }
                    } else {
                        addExplosion(player.x, player.y, '#38bdf8');
                        isGameOver = true;
                        if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate([60, 40, 90]);
                    }
                }

                if (en.y > h + 70) enemies.splice(i, 1);
            }

            // Движение бонусов
            for (let i = pickups.length - 1; i >= 0; i--) {
                const it = pickups[i];
                it.y += curSpeed;

                if (Math.hypot(player.x - it.x, player.y - it.y) < 28) {
                    if (it.type === 'coin') {
                        if (typeof window.addGlobalCoins === 'function') window.addGlobalCoins(2);
                        notify("🪙 +2 Монеты!");
                    } else if (it.type === 'nitro') {
                        player.nitroTime = 160;
                        notify("🚀 НИТРО!");
                    } else if (it.type === 'shield') {
                        player.shield = true;
                        notify("🛡️ ЩИТ АКТИВИРОВАН!");
                    }
                    pickups.splice(i, 1);
                    if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate(15);
                } else if (it.y > h + 40) {
                    pickups.splice(i, 1);
                }
            }
        }

        // Отрисовка бонусов
        pickups.forEach(it => {
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let ico = '🪙';
            if (it.type === 'nitro') ico = '🚀';
            if (it.type === 'shield') ico = '🛡️';
            ctx.fillText(ico, it.x, it.y);
        });

        // Отрисовка врагов
        enemies.forEach(en => {
            ctx.save();
            ctx.translate(en.x, en.y);
            ctx.fillStyle = en.color;
            ctx.beginPath();
            ctx.roundRect(-en.w / 2, -en.h / 2, en.w, en.h, 5);
            ctx.fill();

            // Фары
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(-en.w / 2 + 2, -en.h / 2, 4, 3);
            ctx.fillRect(en.w / 2 - 6, -en.h / 2, 4, 3);
            // Стоп-сигналы
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-en.w / 2 + 2, en.h / 2 - 3, 4, 3);
            ctx.fillRect(en.w / 2 - 6, en.h / 2 - 3, 4, 3);
            ctx.restore();
        });

        // Отрисовка машины игрока
        ctx.save();
        ctx.translate(player.x, player.y);

        // Эффект нитро / реактивного пламени
        if (player.nitroTime > 0) {
            ctx.fillStyle = Math.random() > 0.5 ? '#00f5ff' : '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(-7, player.h / 2);
            ctx.lineTo(0, player.h / 2 + 18 + Math.random() * 8);
            ctx.lineTo(7, player.h / 2);
            ctx.fill();
        }

        // Корпус спорткара
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(-player.w / 2, -player.h / 2, player.w, player.h, 6);
        ctx.fill();

        // Лобовое стекло
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-player.w / 2 + 3, -player.h / 2 + 10, player.w - 6, 12);

        // Фары
        ctx.fillStyle = '#fff';
        ctx.fillRect(-player.w / 2 + 2, -player.h / 2, 5, 3);
        ctx.fillRect(player.w / 2 - 7, -player.h / 2, 5, 3);

        // Щит
        if (player.shield) {
            ctx.strokeStyle = '#00f5ff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, 26, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        // Частицы
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy; p.alpha -= 0.035;
            if (p.alpha <= 0) { particles.splice(i, 1); continue; }
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;

        if (!started) {
            ctx.fillStyle = 'rgba(5, 10, 20, 0.75)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('КИБЕР-ГОНКИ 🏎️', w / 2, h / 2 - 12);
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('Тапайте экран или кнопки внизу', w / 2, h / 2 + 12);
        } else if (isGameOver) {
            ctx.fillStyle = 'rgba(5, 10, 20, 0.85)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = 'var(--danger)';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('АВАРИЯ НА ТРАССЕ!', w / 2, h / 2 - 16);
            ctx.fillStyle = '#fff';
            ctx.font = '15px sans-serif';
            ctx.fillText(`Дистанция: ${score} m`, w / 2, h / 2 + 12);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px sans-serif';
            ctx.fillText('Тапните для рестарта', w / 2, h / 2 + 38);
        }

        animId = requestAnimationFrame(loop);
    }

    loop();
}
