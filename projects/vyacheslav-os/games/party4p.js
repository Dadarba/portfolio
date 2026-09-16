function initParty4P(mount) {
    document.getElementById('game-title').innerText = "Cyber Gliders 4P 🎮";
    const w = Math.min(window.innerWidth - 32, 340);
    const h = 470;

    mount.innerHTML = `
        <style>
            .tanks-wrap {
                display: flex; flex-direction: column; align-items: center; width: 100%;
                user-select: none; touch-action: none; -webkit-user-select: none;
            }
            .tanks-board-box {
                position: relative; width: ${w}px; height: ${h}px;
                border-radius: 16px; overflow: hidden; border: 2px solid var(--border-glow);
                background: #030712; box-shadow: 0 8px 32px rgba(0,0,0,0.85);
            }
            .tanks-ctrl-btn {
                position: absolute; width: 56px; height: 56px; border-radius: 14px;
                display: flex; flex-direction: column; justify-content: center; align-items: center;
                font-size: 11px; font-weight: 900; color: #fff; cursor: pointer;
                touch-action: none; z-index: 10; border: 2px solid rgba(255,255,255,0.4);
            }
            .tanks-ctrl-btn:active { transform: scale(0.92); }
            .btn-p1 { top: 8px; left: 8px; background: rgba(56, 189, 248, 0.35); border-color: #38bdf8; color: #38bdf8; }
            .btn-p2 { top: 8px; right: 8px; background: rgba(239, 68, 68, 0.35); border-color: #ef4444; color: #ef4444; }
            .btn-p3 { bottom: 8px; left: 8px; background: rgba(34, 197, 94, 0.35); border-color: #22c55e; color: #22c55e; }
            .btn-p4 { bottom: 8px; right: 8px; background: rgba(234, 179, 8, 0.35); border-color: #eab308; color: #eab308; }
            .tanks-hud {
                position: absolute; top: 12px; left: 0; right: 0; text-align: center;
                font-size: 11px; font-weight: 800; color: var(--text-dim); pointer-events: none; z-index: 5;
            }
        </style>

        <div class="tanks-wrap">
            <div class="tanks-board-box" id="tanks-box">
                <div class="tanks-hud" id="tanks-scores">P1: 0 | P2: 0 | P3: 0 | P4: 0</div>
                <canvas id="tanks-canvas" width="${w}" height="${h}"></canvas>

                <button class="tanks-ctrl-btn btn-p1" id="ctrl-p1">P1<br>🚀</button>
                <button class="tanks-ctrl-btn btn-p2" id="ctrl-p2">P2<br>🚀</button>
                <button class="tanks-ctrl-btn btn-p3" id="ctrl-p3">P3<br>🚀</button>
                <button class="tanks-ctrl-btn btn-p4" id="ctrl-p4">P4<br>🚀</button>

                <div id="tanks-win-modal" style="position:absolute; inset:0; background:rgba(3,7,18,0.92); backdrop-filter:blur(10px); display:none; flex-direction:column; justify-content:center; align-items:center; z-index:30;">
                    <b id="tanks-winner-title" style="font-size:20px; color:#ffd700; margin-bottom:8px;">ПОБЕДА ИГРОКА!</b>
                    <button class="p-btn" style="background:var(--accent); color:#000; font-weight:800; padding:10px 24px;" onclick="restartCurrentGame()">Следующий раунд ➔</button>
                </div>
            </div>
            <div style="font-size:10px; color:var(--text-dim); margin-top:6px;">Зажмите угол: манёвр разворота. Отпустите: сдвоенный лазер ⚡</div>
        </div>
    `;

    const canvas = document.getElementById('tanks-canvas');
    const ctx = canvas.getContext('2d');
    const scoresEl = document.getElementById('tanks-scores');
    const winModal = document.getElementById('tanks-win-modal');
    const winTitle = document.getElementById('tanks-winner-title');

    let animId = null;
    let isGameOver = false;
    let scores = [0, 0, 0, 0];

    const GLIDERS = [
        { id: 0, name: "P1 Синий", color: "#38bdf8", x: 45, y: 80, angle: 0.8, alive: true, turning: false, cooldown: 0, shield: false },
        { id: 1, name: "P2 Красный", color: "#ef4444", x: w - 45, y: 80, angle: 2.3, alive: true, turning: false, cooldown: 0, shield: false },
        { id: 2, name: "P3 Зелёный", color: "#22c55e", x: 45, y: h - 80, angle: -0.8, alive: true, turning: false, cooldown: 0, shield: false },
        { id: 3, name: "P4 Жёлтый", color: "#eab308", x: w - 45, y: h - 80, angle: -2.3, alive: true, turning: false, cooldown: 0, shield: false }
    ];

    let bullets = [];
    let particles = [];
    let powerups = [];

    function bindGliderButton(btnId, idx) {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        const onDown = (e) => {
            e.preventDefault();
            if (!GLIDERS[idx].alive) return;
            GLIDERS[idx].turning = true;
        };

        const onUp = (e) => {
            e.preventDefault();
            if (!GLIDERS[idx].alive) return;
            GLIDERS[idx].turning = false;
            fireWingLasers(GLIDERS[idx]);
        };

        btn.addEventListener('pointerdown', onDown);
        btn.addEventListener('pointerup', onUp);
        btn.addEventListener('pointercancel', onUp);
    }

    bindGliderButton('ctrl-p1', 0);
    bindGliderButton('ctrl-p2', 1);
    bindGliderButton('ctrl-p3', 2);
    bindGliderButton('ctrl-p4', 3);

    // Сдвоенный залп с законцовок крыльев
    function fireWingLasers(ship) {
        if (ship.cooldown > 0) return;
        ship.cooldown = 22;

        const wingOffsets = [-8, 8];
        wingOffsets.forEach(offsetY => {
            const spawnX = ship.x + Math.cos(ship.angle) * 12 - Math.sin(ship.angle) * offsetY;
            const spawnY = ship.y + Math.sin(ship.angle) * 12 + Math.cos(ship.angle) * offsetY;

            bullets.push({
                owner: ship.id,
                x: spawnX,
                y: spawnY,
                vx: Math.cos(ship.angle) * 6.0,
                vy: Math.sin(ship.angle) * 6.0,
                color: ship.color,
                bounces: 2,
                life: 160
            });
        });

        if (typeof playSfx === 'function') playSfx('tap');
    }

    function addExplosion(x, y, color) {
        for (let i = 0; i < 16; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color,
                life: 20
            });
        }
    }

    setInterval(() => {
        if (isGameOver || powerups.length >= 2) return;
        powerups.push({
            x: 40 + Math.random() * (w - 80),
            y: 90 + Math.random() * (h - 180),
            type: Math.random() > 0.5 ? 'shield' : 'laser',
            icon: Math.random() > 0.5 ? '🛡️' : '⚡'
        });
    }, 8000);

    function loop() {
        if (!isGameOver) {
            GLIDERS.forEach(t => {
                if (!t.alive) return;
                if (t.cooldown > 0) t.cooldown--;

                if (t.turning) {
                    t.angle += 0.085;
                } else {
                    t.x += Math.cos(t.angle) * 1.75;
                    t.y += Math.sin(t.angle) * 1.75;
                }

                const margin = 18;
                if (t.x < margin) { t.x = margin; t.angle = Math.PI - t.angle; }
                if (t.x > w - margin) { t.x = w - margin; t.angle = Math.PI - t.angle; }
                if (t.y < margin + 15) { t.y = margin + 15; t.angle = -t.angle; }
                if (t.y > h - margin - 15) { t.y = h - margin - 15; t.angle = -t.angle; }

                for (let i = powerups.length - 1; i >= 0; i--) {
                    const pw = powerups[i];
                    if (Math.hypot(t.x - pw.x, t.y - pw.y) < 20) {
                        if (pw.type === 'shield') t.shield = true;
                        powerups.splice(i, 1);
                        if (typeof playSfx === 'function') playSfx('coin');
                    }
                }
            });

            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.x += b.vx;
                b.y += b.vy;
                b.life--;

                if (b.x <= 8 || b.x >= w - 8) { b.vx = -b.vx; b.bounces--; }
                if (b.y <= 8 || b.y >= h - 8) { b.vy = -b.vy; b.bounces--; }

                for (let j = 0; j < GLIDERS.length; j++) {
                    const t = GLIDERS[j];
                    if (t.alive && Math.hypot(b.x - t.x, b.y - t.y) < 14) {
                        if (t.shield) {
                            t.shield = false;
                            addExplosion(t.x, t.y, '#38bdf8');
                        } else {
                            t.alive = false;
                            addExplosion(t.x, t.y, t.color);
                            if (typeof playSfx === 'function') playSfx('gold_drop');
                        }
                        bullets.splice(i, 1);
                        break;
                    }
                }

                if (b.bounces < 0 || b.life <= 0) {
                    bullets.splice(i, 1);
                }
            }

            const aliveShips = GLIDERS.filter(t => t.alive);
            if (aliveShips.length <= 1) {
                isGameOver = true;
                const winner = aliveShips[0] || { name: "Ничья" };
                if (aliveShips[0]) scores[aliveShips[0].id]++;
                scoresEl.innerText = `P1: ${scores[0]} | P2: ${scores[1]} | P3: ${scores[2]} | P4: ${scores[3]}`;
                winTitle.innerText = `ПОБЕДИЛ ${winner.name}! 🏆`;
                winModal.style.display = 'flex';
                if (typeof addGlobalCoins === 'function') addGlobalCoins(60);
            }
        }

        // ================= ОТРИСОВКА =================
        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 26) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += 26) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

        powerups.forEach(pw => {
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pw.icon, pw.x, pw.y);
        });

        bullets.forEach(b => {
            ctx.fillStyle = b.color;
            ctx.shadowColor = b.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        for (let i = particles.length - 1; i >= 0; i--) {
            const pt = particles[i];
            pt.x += pt.vx; pt.y += pt.vy;
            pt.life--;
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.0, 0, Math.PI * 2);
            ctx.fill();
            if (pt.life <= 0) particles.splice(i, 1);
        }

        // ГЛАЙДЕР: СТРЕЛОВИДНЫЙ ДЕЛЬТА-КОРАБЛЬ (100% СТЕЛС-ГЕОМЕТРИЯ)
        GLIDERS.forEach(t => {
            if (!t.alive) return;

            ctx.save();
            ctx.translate(t.x, t.y);
            ctx.rotate(t.angle);

            // 1. Кормовой плазменный след (двойной выхлоп двигателей)
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.fillRect(-14, -7, 4, 3);
            ctx.fillRect(-14, 4, 4, 3);

            // 2. Стреловидный дельта-корпус (клин)
            ctx.fillStyle = t.color;
            ctx.beginPath();
            ctx.moveTo(15, 0);       // Острый футуристичный нос
            ctx.lineTo(-11, -11);    // Левая законцовка крыла
            ctx.lineTo(-7, 0);       // Вырез кормы
            ctx.lineTo(-11, 11);     // Правая законцовка крыла
            ctx.closePath();
            ctx.fill();

            // 3. Бортовая неоновая бронеполоса
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-5, -6);
            ctx.moveTo(10, 0);
            ctx.lineTo(-5, 6);
            ctx.stroke();

            // 4. Кабина пилота — узкий ромбовидный визор
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(3, 0);
            ctx.lineTo(-2, -3);
            ctx.lineTo(-5, 0);
            ctx.lineTo(-2, 3);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

            if (t.shield) {
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.arc(t.x, t.y, 18, 0, Math.PI * 2);
                ctx.stroke();
            }
        });

        if (!isGameOver) {
            animId = requestAnimationFrame(loop);
        }
    }

    loop();
}
