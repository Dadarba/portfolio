function initFlappy(mount) {
    document.getElementById('game-title').innerText = "Flappy Bird PRO";
    const w = Math.min(window.innerWidth - 32, 340);
    const h = 420;

    const SKINS = {
        classic: { name: "🐥 Классик", body: "#fbbf24", wing: "#f59e0b", beak: "#ef4444", eye: "#fff" },
        cyber: { name: "🤖 Кибер", body: "#00f5ff", wing: "#0284c7", beak: "#ff007f", eye: "#fff" },
        phoenix: { name: "🔥 Феникс", body: "#f97316", wing: "#b91c1c", beak: "#ffd700", eye: "#fff" },
        bat: { name: "🦇 Бэт-Бёрд", body: "#334155", wing: "#0f172a", beak: "#94a3b8", eye: "#ef4444" }
    };

    const skinKeys = Object.keys(SKINS);
    let curSkinKey = localStorage.getItem('flappy_skin') || 'classic';
    if (!SKINS[curSkinKey]) curSkinKey = 'classic';

    mount.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%; user-select:none;">
            <div style="display:flex; justify-content:space-between; width:${w}px; font-size:13px; font-weight:700; margin-bottom:6px;">
                <span>Счёт: <b id="fl-score" style="color:var(--accent); font-size:16px;">0</b></span>
                <span id="fl-coins-txt" style="color:var(--accent-warm);">🪙 0</span>
                <span>Рекорд: <b id="fl-best" style="color:var(--accent-warm);">0</b></span>
            </div>

            <canvas id="fl-canvas" width="${w}" height="${h}" style="background:#070f1e; border:2px solid var(--border); border-radius:14px; touch-action:none; display:block; box-shadow:0 6px 24px rgba(0,0,0,0.5);"></canvas>

            <div style="display:flex; gap:8px; margin-top:8px; width:${w}px; justify-content:space-between;">
                <button class="p-btn" style="padding:6px 12px; font-size:11px;" id="fl-skin-btn" onclick="window._cycleFlappySkin()">Скин: ${SKINS[curSkinKey].name}</button>
                <button class="p-btn" style="padding:6px 14px; font-size:11px;" onclick="restartCurrentGame()">Заново</button>
            </div>
        </div>
    `;

    const canvas = document.getElementById('fl-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('fl-score');
    const coinsEl = document.getElementById('fl-coins-txt');
    const bestEl = document.getElementById('fl-best');
    const skinBtn = document.getElementById('fl-skin-btn');

    let best = parseInt(localStorage.getItem('flappy_best') || '0');
    bestEl.innerText = best;

    let score = 0;
    let coinsCollected = 0;
    let isGameOver = false;
    let isStarted = false;
    let animId = null;

    let bird = { x: 55, y: h / 2, vy: 0, r: 13, angle: 0, wingFlap: 0 };
    const gravity = 0.38;
    const jump = -6.2;
    const pipeGap = 115;
    const pipeW = 44;

    let pipes = [];
    let coins = [];
    let feathers = [];
    let pipeTick = 0;
    let groundX = 0;

    window._cycleFlappySkin = function() {
        let idx = skinKeys.indexOf(curSkinKey);
        curSkinKey = skinKeys[(idx + 1) % skinKeys.length];
        localStorage.setItem('flappy_skin', curSkinKey);
        skinBtn.innerText = `Скин: ${SKINS[curSkinKey].name}`;
    };

    function flap() {
        if (isGameOver) {
            restartCurrentGame();
            return;
        }
        if (!isStarted) isStarted = true;
        bird.vy = jump;
        bird.wingFlap = 12;
        if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate(10);
    }

    canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); flap(); });

    function spawnPipe() {
        const minH = 40;
        const maxH = h - pipeGap - minH - 30; // 30px под землю
        const topH = Math.floor(Math.random() * (maxH - minH)) + minH;
        pipes.push({
            x: w + 10,
            top: topH,
            bottom: h - topH - pipeGap - 30,
            passed: false
        });

        // 40% шанс генерации монеты в просвете
        if (Math.random() < 0.45) {
            coins.push({
                x: w + 10 + pipeW / 2,
                y: topH + pipeGap / 2,
                collected: false
            });
        }
    }

    function createFeathers(x, y, color) {
        for (let i = 0; i < 16; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1.5;
            feathers.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color, alpha: 1, size: Math.random() * 4 + 2
            });
        }
    }

    function loop(time) {
        ctx.clearRect(0, 0, w, h);

        // 1. Параллакс заднего фона
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h - 30);

        // Городские силуэты
        ctx.fillStyle = '#1e293b';
        for (let bx = 0; bx < w; bx += 32) {
            const bh = 50 + (bx % 40);
            ctx.fillRect(bx, h - 30 - bh, 28, bh);
        }

        // 2. Логика игры
        if (isStarted && !isGameOver) {
            bird.vy += gravity;
            bird.y += bird.vy;
            bird.angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.vy * 0.08));

            pipeTick++;
            if (pipeTick % 82 === 0) spawnPipe();

            groundX = (groundX - 2.2) % 18;

            // Движение труб
            for (let i = pipes.length - 1; i >= 0; i--) {
                const p = pipes[i];
                p.x -= 2.2;

                if (!p.passed && p.x + pipeW < bird.x) {
                    p.passed = true;
                    score++;
                    scoreEl.innerText = score;
                    if (score > best) {
                        best = score;
                        localStorage.setItem('flappy_best', best);
                        bestEl.innerText = best;
                    }
                    if (typeof window.checkGameAchievements === 'function') {
                        window.checkGameAchievements('flappy', score);
                    }
                }

                // Коллизия с трубой
                if (bird.x + bird.r > p.x && bird.x - bird.r < p.x + pipeW) {
                    if (bird.y - bird.r < p.top || bird.y + bird.r > h - 30 - p.bottom) {
                        killBird();
                    }
                }

                if (p.x < -60) pipes.splice(i, 1);
            }

            // Движение монет
            for (let i = coins.length - 1; i >= 0; i--) {
                const c = coins[i];
                c.x -= 2.2;
                if (!c.collected && Math.hypot(bird.x - c.x, bird.y - c.y) < bird.r + 9) {
                    c.collected = true;
                    coinsCollected++;
                    score += 3;
                    scoreEl.innerText = score;
                    coinsEl.innerText = `🪙 ${coinsCollected}`;
                    if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate([10, 20]);
                }
                if (c.x < -20 || c.collected) coins.splice(i, 1);
            }

            // Удар о землю или потолок
            if (bird.y + bird.r >= h - 30 || bird.y - bird.r <= 0) {
                killBird();
            }
        }

        // 3. Отрисовка труб с неоновой текстурой
        pipes.forEach(p => {
            // Верхняя труба
            const gTop = ctx.createLinearGradient(p.x, 0, p.x + pipeW, 0);
            gTop.addColorStop(0, '#10b981');
            gTop.addColorStop(0.5, '#34d399');
            gTop.addColorStop(1, '#047857');
            ctx.fillStyle = gTop;
            ctx.fillRect(p.x, 0, pipeW, p.top);
            ctx.fillStyle = '#065f46';
            ctx.fillRect(p.x - 3, p.top - 12, pipeW + 6, 12);

            // Нижняя труба
            const botY = h - 30 - p.bottom;
            ctx.fillStyle = gTop;
            ctx.fillRect(p.x, botY, pipeW, p.bottom);
            ctx.fillStyle = '#065f46';
            ctx.fillRect(p.x - 3, botY, pipeW + 6, 12);
        });

        // 4. Отрисовка монет
        coins.forEach(c => {
            ctx.save();
            ctx.translate(c.x, c.y);
            const scaleX = Math.sin(time * 0.008);
            ctx.scale(scaleX, 1);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2; ctx.stroke();
            ctx.restore();
        });

        // 5. Отрисовка птицы
        const skin = SKINS[curSkinKey];
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(bird.angle);

        // Тело
        ctx.fillStyle = skin.body;
        ctx.beginPath();
        ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
        ctx.fill();

        // Крыло (анимируется)
        const wingY = (bird.wingFlap > 0) ? -4 : 1;
        if (bird.wingFlap > 0) bird.wingFlap--;
        ctx.fillStyle = skin.wing;
        ctx.beginPath();
        ctx.ellipse(-4, wingY, 6, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Глаз
        ctx.fillStyle = skin.eye;
        ctx.beginPath(); ctx.arc(5, -4, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(6, -4, 2, 0, Math.PI * 2); ctx.fill();

        // Клюв
        ctx.fillStyle = skin.beak;
        ctx.beginPath();
        ctx.moveTo(8, -2); ctx.lineTo(16, 2); ctx.lineTo(8, 6);
        ctx.fill();
        ctx.restore();

        // 6. Перья
        for (let i = feathers.length - 1; i >= 0; i--) {
            const f = feathers[i];
            f.x += f.vx; f.y += f.vy; f.alpha -= 0.04;
            if (f.alpha <= 0) { feathers.splice(i, 1); continue; }
            ctx.save();
            ctx.globalAlpha = f.alpha;
            ctx.fillStyle = f.color;
            ctx.beginPath(); ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        // 7. Земля
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, h - 30, w, 6);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, h - 24, w, 24);
        ctx.fillStyle = '#92400e';
        for (let x = groundX; x < w; x += 18) {
            ctx.fillRect(x, h - 20, 10, 4);
        }

        // 8. Оверлеи
        if (!isStarted) {
            ctx.fillStyle = 'rgba(5, 10, 20, 0.7)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('ТАПНИТЕ ДЛЯ ВЗЛЁТА 🐦', w / 2, h / 2 - 14);
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('Собирайте монеты 🪙 и бейте рекорды', w / 2, h / 2 + 12);
        } else if (isGameOver) {
            ctx.fillStyle = 'rgba(5, 10, 20, 0.85)';
            ctx.fillRect(0, 0, w, h);

            let medal = '🥉 Бронза';
            if (score >= 100) medal = '💎 Платина';
            else if (score >= 50) medal = '🥇 Золото';
            else if (score >= 25) medal = '🥈 Серебро';
            else if (score < 10) medal = 'Нет медали';

            ctx.fillStyle = 'var(--danger)';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('КРАШ!', w / 2, h / 2 - 36);

            ctx.fillStyle = '#fff';
            ctx.font = '15px sans-serif';
            ctx.fillText(`Счёт: ${score}  |  Рекорд: ${best}`, w / 2, h / 2 - 8);

            ctx.fillStyle = 'var(--accent-warm)';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(`Медаль: ${medal}`, w / 2, h / 2 + 18);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px sans-serif';
            ctx.fillText('Тапните для рестарта', w / 2, h / 2 + 42);
        }

        animId = requestAnimationFrame(loop);
    }

    function killBird() {
        if (isGameOver) return;
        isGameOver = true;
        createFeathers(bird.x, bird.y, SKINS[curSkinKey].body);
        if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate([60, 40, 80]);
    }

    animId = requestAnimationFrame(loop);
}
