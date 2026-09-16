// =========================================================
// ЗМЕЙКА HARDCORE: КЛАССИЧЕСКИЕ СТЕНЫ, БАРЬЕРЫ И СКОРОСТЬ
// =========================================================
window.initSnake = function(mount) {
    if (!mount) return;

    mount.innerHTML = `
        <div id="snake-wrap" style="display:flex; flex-direction:column; align-items:center; width:100%; max-width:350px; margin:0 auto; user-select:none; touch-action:none;">
            <!-- ВЕРХНЯЯ ПАНЕЛЬ -->
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:6px; font-size:11px; font-weight:800;">
                <span>Счёт: <b id="snk-score" style="color:var(--accent);">0</b></span>
                <span id="snk-speed-indicator" style="color:#ff0055; font-family:monospace;">СКОРОСТЬ: 1x</span>
                <span>Рекорд: <b id="snk-best" style="color:#10b981;">0</b></span>
            </div>

            <!-- СКИНЫ -->
            <div style="display:flex; gap:6px; width:100%; margin-bottom:6px; overflow-x:auto; padding-bottom:2px;">
                <button class="p-btn snk-skin-btn active" id="sskin-neon" style="flex:1; padding:4px 6px; font-size:10px;" onclick="setSnakeSkin('neon')">⚡ Неон</button>
                <button class="p-btn snk-skin-btn" id="sskin-gold" style="flex:1; padding:4px 6px; font-size:10px; color:#ffd700;" onclick="setSnakeSkin('gold')">👑 Золото</button>
                <button class="p-btn snk-skin-btn" id="sskin-rainbow" style="flex:1; padding:4px 6px; font-size:10px; color:#ec4899;" onclick="setSnakeSkin('rainbow')">🌈 Радуга</button>
                <button class="p-btn snk-skin-btn" id="sskin-matrix" style="flex:1; padding:4px 6px; font-size:10px; color:#10b981;" onclick="setSnakeSkin('matrix')">💻 Матрица</button>
                <button class="p-btn snk-skin-btn" id="sskin-sakura" style="flex:1; padding:4px 6px; font-size:10px; color:#f472b6;" onclick="setSnakeSkin('sakura')">🌸 Сакура</button>
            </div>

            <!-- ИГРОВОЙ ХОЛСТ С КРАСНЫМ БАРЬЕРОМ СМЕРТИ -->
            <div style="position:relative; width:100%; border-radius:12px; overflow:hidden; border:3px solid #ef4444; box-shadow:0 0 16px rgba(239, 68, 68, 0.45);">
                <canvas id="snake-canvas" width="320" height="320" style="display:block; background:#040711; width:100%; height:auto;"></canvas>

                <!-- ОВЕРЛЕЙ GAME OVER -->
                <div id="snk-over-overlay" style="display:none; position:absolute; inset:0; background:rgba(3,7,18,0.94); backdrop-filter:blur(6px); flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:16px;">
                    <div style="font-size:22px; font-weight:900; color:#ef4444; margin-bottom:4px;">КРАШ СИСТЕМЫ 💀</div>
                    <div id="snk-over-info" style="font-size:12px; color:var(--text-dim); margin-bottom:14px; line-height:1.5;"></div>
                    <button class="p-btn" style="background:var(--accent); color:#000; font-weight:900; padding:8px 24px; font-size:12px;" onclick="window.restartSnakeGame()">🔄 Начать заново</button>
                </div>
            </div>

            <!-- D-PAD ДЛЯ МОБИЛОК -->
            <div style="display:grid; grid-template-columns:repeat(3, 52px); grid-template-rows:repeat(3, 44px); gap:6px; margin-top:10px; justify-content:center;">
                <div></div>
                <button class="p-btn" id="snk-btn-up" style="font-size:18px; padding:0; display:flex; align-items:center; justify-content:center;">▲</button>
                <div></div>
                <button class="p-btn" id="snk-btn-left" style="font-size:18px; padding:0; display:flex; align-items:center; justify-content:center;">◄</button>
                <div style="display:flex; align-items:center; justify-content:center; font-size:11px; color:#ef4444; font-weight:bold;">WALL</div>
                <button class="p-btn" id="snk-btn-right" style="font-size:18px; padding:0; display:flex; align-items:center; justify-content:center;">►</button>
                <div></div>
                <button class="p-btn" id="snk-btn-down" style="font-size:18px; padding:0; display:flex; align-items:center; justify-content:center;">▼</button>
                <div></div>
            </div>
        </div>
    `;

    const canvas = document.getElementById('snake-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const GRID = 20;
    const CELL = canvas.width / GRID; // 16px

    let snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    let dir = { x: 1, y: 0 };
    let nextDir = { x: 1, y: 0 };
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('snake_best') || '0', 10);
    document.getElementById('snk-best').innerText = bestScore;

    let food = { x: 15, y: 10, type: 'apple', ttl: 0 };
    let obstacles = []; // Барьеры смерти
    let activeSkin = 'neon';
    let particles = [];
    let isGameOver = false;
    let lastTickTime = 0;
    let animId = null;

    // Звуковой синтезатор
    const playSfx = (type) => {
        try {
            const actx = window.audioCtxInstance || (window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)());
            if (actx.state === 'suspended') actx.resume();
            const now = actx.currentTime;
            const osc = actx.createOscillator();
            const gain = actx.createGain();

            if (type === 'eat') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(520, now);
                osc.frequency.exponentialRampToValueAtTime(1040, now + 0.07);
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.07);
                osc.connect(gain); gain.connect(actx.destination);
                osc.start(now); osc.stop(now + 0.07);
            } else if (type === 'gold') {
                [587.3, 739.9, 880.0, 1174.6].forEach((f, i) => {
                    const o = actx.createOscillator();
                    const g = actx.createGain();
                    o.frequency.setValueAtTime(f, now + i * 0.04);
                    g.gain.setValueAtTime(0.06, now + i * 0.04);
                    g.gain.linearRampToValueAtTime(0.001, now + i * 0.04 + 0.12);
                    o.connect(g); g.connect(actx.destination);
                    o.start(now + i * 0.04); o.stop(now + i * 0.04 + 0.12);
                });
            } else if (type === 'crash') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.linearRampToValueAtTime(40, now + 0.3);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
                osc.connect(gain); gain.connect(actx.destination);
                osc.start(now); osc.stop(now + 0.3);
            }
        } catch (_) {}
    };

    window.setSnakeSkin = function(skin) {
        activeSkin = skin;
        document.querySelectorAll('.snk-skin-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById('sskin-' + skin);
        if (btn) btn.classList.add('active');
    };

    function spawnFood() {
        let attempts = 0;
        while (attempts < 120) {
            const rx = Math.floor(Math.random() * GRID);
            const ry = Math.floor(Math.random() * GRID);

            const onSnake = snake.some(s => s.x === rx && s.y === ry);
            const onObs = obstacles.some(o => o.x === rx && o.y === ry);

            if (!onSnake && !onObs) {
                const isGold = Math.random() < 0.22;
                food = {
                    x: rx,
                    y: ry,
                    type: isGold ? 'gold' : 'apple',
                    ttl: isGold ? 70 : 0 // Золотое яблоко исчезает через ~6-7 сек
                };
                break;
            }
            attempts++;
        }
    }

    function addObstacle() {
        let attempts = 0;
        while (attempts < 60) {
            const rx = Math.floor(Math.random() * (GRID - 4)) + 2;
            const ry = Math.floor(Math.random() * (GRID - 4)) + 2;

            const onSnake = snake.some(s => Math.hypot(s.x - rx, s.y - ry) < 3);
            const onFood = (food.x === rx && food.y === ry);
            const onObs = obstacles.some(o => o.x === rx && o.y === ry);

            if (!onSnake && !onFood && !onObs) {
                obstacles.push({ x: rx, y: ry });
                break;
            }
            attempts++;
        }
    }

    function setDirection(dx, dy) {
        if (dir.x + dx === 0 && dir.y + dy === 0) return;
        nextDir = { x: dx, y: dy };
    }

    document.getElementById('snk-btn-up').onpointerdown = (e) => { e.preventDefault(); setDirection(0, -1); };
    document.getElementById('snk-btn-down').onpointerdown = (e) => { e.preventDefault(); setDirection(0, 1); };
    document.getElementById('snk-btn-left').onpointerdown = (e) => { e.preventDefault(); setDirection(-1, 0); };
    document.getElementById('snk-btn-right').onpointerdown = (e) => { e.preventDefault(); setDirection(1, 0); };

    window.onkeydown = (e) => {
        if (e.key === 'ArrowUp' || e.key === 'w') setDirection(0, -1);
        if (e.key === 'ArrowDown' || e.key === 's') setDirection(0, 1);
        if (e.key === 'ArrowLeft' || e.key === 'a') setDirection(-1, 0);
        if (e.key === 'ArrowRight' || e.key === 'd') setDirection(1, 0);
    };

    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.hypot(dx, dy) > 20) {
            if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? 1 : -1, 0);
            else setDirection(0, dy > 0 ? 1 : -1);
        }
    }, { passive: true });

    // Прогрессивная скорость: от 95мс до 42мс
    function getCurrentTickDelay() {
        return Math.max(42, 95 - Math.floor(score / 8) * 4);
    }

    function tick() {
        if (isGameOver) return;
        dir = { ...nextDir };

        let head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        // 1. СТОЛКНОВЕНИЕ СО СТЕНОЙ (КЛАССИКА - GAME OVER)
        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {

        if (window.consumeNeuroShield && window.consumeNeuroShield()) {
            // Спасение щитом: отталкиваемся от стены
            if (head.x < 0) head.x = 0;
            if (head.x >= GRID) head.x = GRID - 1;
            if (head.y < 0) head.y = 0;
            if (head.y >= GRID) head.y = GRID - 1;
            if (snake.length > 3) snake.pop();
            return;
        }
            triggerGameOver('Врезались в ограждение арены!');
            return;
        }

        // 2. СТОЛКНОВЕНИЕ С ХВОСТОМ
        if (snake.some(s => s.x === head.x && s.y === head.y)) {
            triggerGameOver('Змейка укусила собственный хвост!');
            return;
        }

        // 3. СТОЛКНОВЕНИЕ С ПРЕПЯТСТВИЕМ
        if (obstacles.some(o => o.x === head.x && o.y === head.y)) {
            triggerGameOver('Столкновение со статическим барьером!');
            return;
        }

        snake.unshift(head);

        // Поедание яблока
        if (head.x === food.x && head.y === food.y) {
            if (food.type === 'gold') {
                score += 50;
                if (window.addCoins) window.addCoins(3);
                playSfx('gold');
                if (window.notify) window.notify("⭐ Золотое яблоко: <b>+3 🪙</b>!", 2000);
            } else {
                score += 10;
                playSfx('eat');
            }

            document.getElementById('snk-score').innerText = score;
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('snake_best', bestScore);
                document.getElementById('snk-best').innerText = bestScore;
            }

            // Добавление барьера каждые 40 очков (до 6 штук максимум)
            if (score > 0 && score % 40 === 0 && obstacles.length < 6) {
                addObstacle();
            }

            // Частицы
            for (let i = 0; i < 7; i++) {
                particles.push({
                    x: (head.x + 0.5) * CELL,
                    y: (head.y + 0.5) * CELL,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    color: food.type === 'gold' ? '#ffd700' : '#ef4444',
                    ttl: 16
                });
            }

            spawnFood();
        } else {
            snake.pop();
        }

        // Таймер исчезновения золотого яблока
        if (food.type === 'gold') {
            food.ttl--;
            if (food.ttl <= 0) spawnFood(); // Не успели — превращается в обычное
        }

        // Обновление индикатора скорости
        const curDelay = getCurrentTickDelay();
        const speedMultiplier = (95 / curDelay).toFixed(1);
        const speedEl = document.getElementById('snk-speed-indicator');
        if (speedEl) speedEl.innerText = `СКОРОСТЬ: ${speedMultiplier}x`;
    }

    function triggerGameOver(reason) {
        isGameOver = true;
        playSfx('crash');
        try { if (navigator.vibrate) navigator.vibrate([60, 40, 60]); } catch (_) {}

        const ov = document.getElementById('snk-over-overlay');
        const info = document.getElementById('snk-over-info');
        if (ov && info) {
            ov.style.display = 'flex';
            info.innerHTML = `
                <span style="color:#ef4444; font-weight:bold;">${reason}</span><br>
                Итоговый счёт: <b>${score}</b> очков<br>
                Длина змейки: <b>${snake.length}</b> узлов
            `;
        }
    }

    window.restartSnakeGame = function() {
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        dir = { x: 1, y: 0 };
        nextDir = { x: 1, y: 0 };
        score = 0;
        obstacles = [];
        isGameOver = false;
        document.getElementById('snk-score').innerText = 0;
        document.getElementById('snk-over-overlay').style.display = 'none';
        spawnFood();
    };

    // РЕНДЕРИНГ
    let frameCount = 0;
    function render() {
        frameCount++;
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Кибер-сетка
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= canvas.width; i += CELL) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
        }

        // Препятствия (Смертельные монолиты)
        obstacles.forEach(o => {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(o.x * CELL + 1, o.y * CELL + 1, CELL - 2, CELL - 2);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(o.x * CELL + 2, o.y * CELL + 2, CELL - 4, CELL - 4);
        });

        // Еда
        const fx = (food.x + 0.5) * CELL;
        const fy = (food.y + 0.5) * CELL;
        ctx.beginPath();
        if (food.type === 'gold') {
            // Пульсация золотого яблока
            const pulse = 1 + Math.sin(frameCount * 0.2) * 0.15;
            ctx.fillStyle = '#ffd700';
            ctx.arc(fx, fy, (CELL * 0.4) * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
        } else {
            ctx.fillStyle = '#ef4444';
            ctx.arc(fx, fy, CELL * 0.38, 0, Math.PI * 2);
            ctx.fill();
        }

        // Змейка со скинами
        snake.forEach((s, idx) => {
            let segColor = '#38bdf8';
            if (activeSkin === 'gold') segColor = '#ffd700';
            else if (activeSkin === 'rainbow') segColor = `hsl(${(idx * 16 + frameCount * 3) % 360}, 100%, 55%)`;
            else if (activeSkin === 'matrix') segColor = '#10b981';
            else if (activeSkin === 'sakura') segColor = idx % 2 === 0 ? '#f472b6' : '#fb7185';

            ctx.fillStyle = segColor;
            ctx.beginPath();
            ctx.roundRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, idx === 0 ? 4 : 2);
            ctx.fill();

            // Глаза
            if (idx === 0) {
                ctx.fillStyle = '#000';
                const eyeX = s.x * CELL + (dir.x === 1 ? 10 : (dir.x === -1 ? 2 : 5));
                const eyeY = s.y * CELL + (dir.y === 1 ? 10 : (dir.y === -1 ? 2 : 5));
                ctx.fillRect(eyeX, eyeY, 3, 3);
            }
        });

        // Частицы
        particles.forEach((p, i) => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 2, 2);
            p.x += p.vx;
            p.y += p.vy;
            p.ttl--;
            if (p.ttl <= 0) particles.splice(i, 1);
        });
    }

    function loop(now) {
        const currentDelay = getCurrentTickDelay();
        if (now - lastTickTime > currentDelay) {
            tick();
            lastTickTime = now;
        }
        render();
        animId = requestAnimationFrame(loop);
    }

    spawnFood();
    animId = requestAnimationFrame(loop);
};
