function initSumo4P(mount) {
    document.getElementById('game-title').innerText = "Сумо-Бот 4P 🥋";
    const w = Math.min(window.innerWidth - 32, 340);
    const h = 480;

    mount.innerHTML = `
        <style>
            .sumo-wrap {
                display: flex; flex-direction: column; align-items: center; width: 100%;
                user-select: none; touch-action: none; -webkit-user-select: none;
            }
            .sumo-top-bar {
                display: flex; justify-content: space-between; align-items: center;
                width: ${w}px; margin-bottom: 6px;
            }
            .sumo-box {
                position: relative; width: ${w}px; height: ${h}px;
                background: #030712; border: 2px solid var(--border-glow); border-radius: 16px;
                overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.85);
            }
            .sumo-ctrl-btn {
                position: absolute; width: 62px; height: 62px; border-radius: 16px;
                display: flex; flex-direction: column; justify-content: center; align-items: center;
                font-size: 11px; font-weight: 900; color: #fff; cursor: pointer;
                touch-action: none; z-index: 10; border: 2px solid rgba(255,255,255,0.4);
            }
            .sumo-ctrl-btn:active { transform: scale(0.92); }
            .sumo-btn-p1 { top: 8px; left: 8px; background: rgba(239, 68, 68, 0.35); border-color: #ef4444; color: #ef4444; }
            .sumo-btn-p2 { top: 8px; right: 8px; background: rgba(34, 197, 94, 0.35); border-color: #22c55e; color: #22c55e; }
            .sumo-btn-p3 { bottom: 8px; left: 8px; background: rgba(234, 179, 8, 0.35); border-color: #eab308; color: #eab308; }
            .sumo-btn-p4 { bottom: 8px; right: 8px; background: rgba(56, 189, 248, 0.35); border-color: #38bdf8; color: #38bdf8; }
            .sumo-hud {
                position: absolute; bottom: 80px; left: 0; right: 0; text-align: center;
                font-size: 11px; font-weight: 800; color: var(--text-dim); pointer-events: none; z-index: 5;
            }
        </style>

        <div class="sumo-wrap">
            <div class="sumo-top-bar">
                <div style="display:flex; gap:4px;">
                    <button class="p-btn" style="padding:4px 8px; font-size:10px;" onclick="setSumoPlayers(2)">2 Игрока</button>
                    <button class="p-btn" style="padding:4px 8px; font-size:10px;" onclick="setSumoPlayers(3)">3 Игрока</button>
                    <button class="p-btn" style="padding:4px 8px; font-size:10px; background:var(--accent); color:#000;" onclick="setSumoPlayers(4)">4 Игрока</button>
                </div>
                <button class="p-btn" style="padding:4px 8px; font-size:10px;" onclick="restartSumoRound()">Сброс</button>
            </div>

            <div class="sumo-box" id="sumo-arena-box">
                <div class="sumo-hud" id="sumo-score-txt">P1: 0 | P2: 0 | P3: 0 | P4: 0</div>
                <canvas id="sumo-canvas" width="${w}" height="${h}"></canvas>

                <!-- Кнопки управления углами -->
                <button class="sumo-ctrl-btn sumo-btn-p1" id="sumo-btn-0">🔴 P1<br>ТОЛЧОК</button>
                <button class="sumo-ctrl-btn sumo-btn-p2" id="sumo-btn-1">🟢 P2<br>ТОЛЧОК</button>
                <button class="sumo-ctrl-btn sumo-btn-p3" id="sumo-btn-2">🟡 P3<br>ТОЛЧОК</button>
                <button class="sumo-ctrl-btn sumo-btn-p4" id="sumo-btn-3">🔵 P4<br>ТОЛЧОК</button>

                <!-- Окно победителя раунда -->
                <div id="sumo-win-modal" style="position:absolute; inset:0; background:rgba(3,7,18,0.92); backdrop-filter:blur(10px); display:none; flex-direction:column; justify-content:center; align-items:center; z-index:30;">
                    <b id="sumo-winner-name" style="font-size:20px; color:#ffd700; margin-bottom:8px;">ПОБЕДА!</b>
                    <button class="p-btn" style="background:var(--accent); color:#000; font-weight:800; padding:10px 24px;" onclick="restartSumoRound()">Следующий раунд ➔</button>
                </div>
            </div>
            <div style="font-size:10px; color:var(--text-dim); margin-top:6px;">Нажмите кнопку своего угла, чтобы сделать резкий рывок вперед 💥</div>
        </div>
    `;

    const canvas = document.getElementById('sumo-canvas');
    const ctx = canvas.getContext('2d');
    const scoreTxt = document.getElementById('sumo-score-txt');
    const winModal = document.getElementById('sumo-win-modal');
    const winTitle = document.getElementById('sumo-winner-name');

    let animId = null;
    let isRoundOver = false;
    let playerCount = 4;
    let scores = [0, 0, 0, 0];

    const arenaRadius = Math.min(w, h) * 0.38;
    const arenaCenter = { x: w / 2, y: h / 2 };

    let bots = [];
    let particles = [];

    const BOT_CONFIGS = [
        { id: 0, name: "P1 Красный", color: "#ef4444" },
        { id: 1, name: "P2 Зелёный", color: "#22c55e" },
        { id: 2, name: "P3 Жёлтый", color: "#eab308" },
        { id: 3, name: "P4 Синий", color: "#38bdf8" }
    ];

    function spawnBots() {
        bots = [];
        for (let i = 0; i < playerCount; i++) {
            const angle = (i * (Math.PI * 2 / playerCount));
            const dist = arenaRadius * 0.55;
            bots.push({
                id: i,
                name: BOT_CONFIGS[i].name,
                color: BOT_CONFIGS[i].color,
                x: arenaCenter.x + Math.cos(angle) * dist,
                y: arenaCenter.y + Math.sin(angle) * dist,
                r: 16,
                angle: angle + Math.PI, // Смотрят в центр арены
                rotSpeed: 0.045,
                vx: 0,
                vy: 0,
                alive: true,
                pushCooldown: 0
            });
        }
    }
    spawnBots();

    window.setSumoPlayers = function(count) {
        playerCount = count;
        restartSumoRound();
    };

    window.restartSumoRound = function() {
        isRoundOver = false;
        winModal.style.display = 'none';
        spawnBots();
    };

    // Привязка кнопок толчка
    function bindPushButton(btnId, botIdx) {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        btn.onpointerdown = (e) => {
            e.preventDefault();
            if (isRoundOver) return;
            const b = bots.find(bot => bot.id === botIdx);
            if (!b || !b.alive || b.pushCooldown > 0) return;

            // Рывок вперед
            b.pushCooldown = 18;
            b.vx += Math.cos(b.angle) * 7.5;
            b.vy += Math.sin(b.angle) * 7.5;

            // Искры рывка
            for (let i = 0; i < 8; i++) {
                particles.push({
                    x: b.x - Math.cos(b.angle) * b.r,
                    y: b.y - Math.sin(b.angle) * b.r,
                    vx: (Math.random() - 0.5) * 3 - Math.cos(b.angle) * 2,
                    vy: (Math.random() - 0.5) * 3 - Math.sin(b.angle) * 2,
                    color: b.color,
                    life: 16
                });
            }

            if (typeof playSfx === 'function') playSfx('tap');
        };
    }

    bindPushButton('sumo-btn-0', 0);
    bindPushButton('sumo-btn-1', 1);
    bindPushButton('sumo-btn-2', 2);
    bindPushButton('sumo-btn-3', 3);

    function loop() {
        if (!isRoundOver) {
            // Физика роботов
            bots.forEach(b => {
                if (!b.alive) return;

                if (b.pushCooldown > 0) b.pushCooldown--;

                // Вращение на месте между толчками
                b.angle += b.rotSpeed;

                // Движение с трением
                b.x += b.vx;
                b.y += b.vy;
                b.vx *= 0.94;
                b.vy *= 0.94;

                // Проверка вылета за границу ринга
                const distToCenter = Math.hypot(b.x - arenaCenter.x, b.y - arenaCenter.y);
                if (distToCenter > arenaRadius + b.r) {
                    b.alive = false;
                    for (let i = 0; i < 20; i++) {
                        particles.push({
                            x: b.x, y: b.y,
                            vx: (Math.random() - 0.5) * 6,
                            vy: (Math.random() - 0.5) * 6,
                            color: b.color,
                            life: 25
                        });
                    }
                    if (typeof playSfx === 'function') playSfx('error');
                }
            });

            // Столкновения между роботами (упругий удар)
            for (let i = 0; i < bots.length; i++) {
                for (let j = i + 1; j < bots.length; j++) {
                    const b1 = bots[i], b2 = bots[j];
                    if (!b1.alive || !b2.alive) continue;

                    const dx = b2.x - b1.x;
                    const dy = b2.y - b1.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < b1.r + b2.r) {
                        const nx = dx / dist;
                        const ny = dy / dist;

                        const repulseForce = 4.5;
                        b1.vx -= nx * repulseForce;
                        b1.vy -= ny * repulseForce;
                        b2.vx += nx * repulseForce;
                        b2.vy += ny * repulseForce;

                        if (typeof playSfx === 'function') playSfx('coin');
                    }
                }
            }

            // Проверка победителя
            const aliveBots = bots.filter(b => b.alive);
            if (aliveBots.length <= 1) {
                isRoundOver = true;
                const winner = aliveBots[0];
                if (winner) {
                    scores[winner.id]++;
                    winTitle.innerText = `ПОБЕДИЛ ${winner.name}! 🏆`;
                } else {
                    winTitle.innerText = "НИЧЬЯ! ВСЕ ВЫЛЕТЕЛИ";
                }
                scoreTxt.innerText = `P1: ${scores[0]} | P2: ${scores[1]} | P3: ${scores[2]} | P4: ${scores[3]}`;
                winModal.style.display = 'flex';
                if (typeof addGlobalCoins === 'function') addGlobalCoins(40);
            }
        }

        // ================= ОТРИСОВКА =================
        ctx.clearRect(0, 0, w, h);

        // Внешняя зона падения
        ctx.fillStyle = '#05070e';
        ctx.fillRect(0, 0, w, h);

        // Ринг сумо (большой светящийся круг)
        ctx.fillStyle = '#101726';
        ctx.beginPath();
        ctx.arc(arenaCenter.x, arenaCenter.y, arenaRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Внутренний круг татами
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(arenaCenter.x, arenaCenter.y, arenaRadius * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // Частицы
        for (let i = particles.length - 1; i >= 0; i--) {
            const pt = particles[i];
            pt.x += pt.vx; pt.y += pt.vy;
            pt.life--;
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            if (pt.life <= 0) particles.splice(i, 1);
        }

        // РОБОТЫ-БАМПЕРЫ (КРУГЛЫЙ МЕТАЛЛИЧЕСКИЙ КОРПУС + ЗАЩИТНЫЙ ОБОД + ФАРЫ)
        bots.forEach(b => {
            if (!b.alive) return;

            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.angle);

            // 1. Внешний защитный резиновый бампер
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(0, 0, b.r + 2, 0, Math.PI * 2);
            ctx.fill();

            // 2. Основной цветной бронекорпус
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(0, 0, b.r - 2, 0, Math.PI * 2);
            ctx.fill();

            // 3. Центральный круглый блок питания
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();

            // 4. Неоновые стреловидные фары направления (показывают, куда направлен бот)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(b.r - 3, 0);
            ctx.lineTo(b.r - 8, -4);
            ctx.lineTo(b.r - 8, 4);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        });

        if (!isRoundOver) {
            animId = requestAnimationFrame(loop);
        }
    }

    loop();
}
