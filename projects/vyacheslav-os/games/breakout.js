function initBreakout(mount) {
    document.getElementById('game-title').innerText = "Арканоид";
    const w = Math.min(window.innerWidth - 32, 340);
    const h = 390;

    mount.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
            <div style="display:flex; justify-content:space-between; width:${w}px; font-size:13px; margin-bottom:8px;">
                <span>Счёт: <b id="bo-score" style="color:var(--accent)">0</b></span>
                <span>Жизни: <b id="bo-lives" style="color:var(--danger)">❤️❤️❤️</b></span>
                <span>Рекорд: <b id="bo-best" style="color:var(--accent-warm)">0</b></span>
            </div>
            <canvas id="bo-canvas" width="${w}" height="${h}" style="background:#070d18; border:1px solid var(--border); border-radius:10px; touch-action:none; display:block;"></canvas>
            <div style="display:flex; gap:8px; margin-top:10px;">
                <button class="p-btn" style="padding:6px 14px; font-size:12px;" onclick="restartCurrentGame()">Заново</button>
            </div>
        </div>
    `;

    const canvas = document.getElementById('bo-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('bo-score');
    const livesEl = document.getElementById('bo-lives');
    const bestEl = document.getElementById('bo-best');

    let best = parseInt(localStorage.getItem('breakout_best') || '0');
    bestEl.innerText = best;

    let score = 0;
    let lives = 3;
    let isGameOver = false;
    let isWon = false;
    let started = false;

    const paddle = {
        w: 68,
        h: 10,
        x: (w - 68) / 2,
        y: h - 22,
        color: '#38bdf8'
    };

    const ball = {
        x: w / 2,
        y: h - 35,
        r: 6,
        dx: 2.8 * (Math.random() > 0.5 ? 1 : -1),
        dy: -3.2,
        speed: 3.8
    };

    // Параметры кирпичей
    const rows = 5;
    const cols = 6;
    const brickPadding = 5;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 12;
    const brickW = Math.floor((w - brickOffsetLeft * 2 - (cols - 1) * brickPadding) / cols);
    const brickH = 15;

    const rowColors = ['#ef4444', '#f59e0b', '#10b981', '#38bdf8', '#a855f7'];
    let bricks = [];

    function resetBricks() {
        bricks = [];
        for (let r = 0; r < rows; r++) {
            bricks[r] = [];
            for (let c = 0; c < cols; c++) {
                bricks[r][c] = { x: 0, y: 0, status: 1, color: rowColors[r], pts: (rows - r) * 10 };
            }
        }
    }
    resetBricks();

    function movePaddle(clientX) {
        const rect = canvas.getBoundingClientRect();
        let targetX = clientX - rect.left - paddle.w / 2;
        paddle.x = Math.max(0, Math.min(w - paddle.w, targetX));
        if (!started) {
            started = true;
        }
    }

    canvas.addEventListener('pointerdown', (e) => movePaddle(e.clientX));
    canvas.addEventListener('pointermove', (e) => {
        if (e.buttons > 0 || e.pointerType === 'touch') movePaddle(e.clientX);
    });

    function resetBall() {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - 12;
        ball.dx = 2.8 * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = -3.2;
        started = false;
    }

    function update() {
        if (!started || isGameOver || isWon) return;

        ball.x += ball.dx;
        ball.y += ball.dy;

        // Отскок от стен
        if (ball.x + ball.r > w) { ball.x = w - ball.r; ball.dx = -ball.dx; }
        if (ball.x - ball.r < 0) { ball.x = ball.r; ball.dx = -ball.dx; }
        if (ball.y - ball.r < 0) { ball.y = ball.r; ball.dy = -ball.dy; }

        // Отскок от платформы
        if (ball.y + ball.r >= paddle.y && ball.y - ball.r <= paddle.y + paddle.h) {
            if (ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
                ball.dy = -Math.abs(ball.dy);
                let hitRatio = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
                ball.dx = hitRatio * 4.2;
                if (navigator.vibrate) navigator.vibrate(10);
            }
        }

        // Падение вниз
        if (ball.y - ball.r > h) {
            lives--;
            livesEl.innerText = '❤️'.repeat(Math.max(0, lives));
            if (lives <= 0) {
                isGameOver = true;
            } else {
                resetBall();
            }
            return;
        }

        // Проверка столкновений с блоками
        let allCleared = true;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let b = bricks[r][c];
                if (b.status === 1) {
                    allCleared = false;
                    if (ball.x > b.x && ball.x < b.x + brickW && ball.y > b.y && ball.y < b.y + brickH) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        score += b.pts;
                        scoreEl.innerText = score;
                        if (score > best) {
                            best = score;
                            localStorage.setItem('breakout_best', best);
                            bestEl.innerText = best;
                        }
                    }
                }
            }
        }

        if (allCleared) {
            isWon = true;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        // Кирпичи
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (bricks[r][c].status === 1) {
                    const bx = c * (brickW + brickPadding) + brickOffsetLeft;
                    const by = r * (brickH + brickPadding) + brickOffsetTop;
                    bricks[r][c].x = bx;
                    bricks[r][c].y = by;

                    ctx.fillStyle = bricks[r][c].color;
                    ctx.beginPath();
                    ctx.roundRect(bx, by, brickW, brickH, 3);
                    ctx.fill();
                }
            }
        }

        // Платформа
        ctx.fillStyle = paddle.color;
        ctx.beginPath();
        ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 5);
        ctx.fill();

        // Мяч
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();

        // Статус
        if (!started && !isGameOver && !isWon) {
            ctx.fillStyle = 'rgba(11, 19, 41, 0.6)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Проведите пальцем для старта 🧱', w / 2, h / 2 + 30);
        } else if (isGameOver) {
            ctx.fillStyle = 'rgba(11, 19, 41, 0.85)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Игра окончена!', w / 2, h / 2 - 10);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '13px sans-serif';
            ctx.fillText(`Итоговый счёт: ${score}`, w / 2, h / 2 + 16);
        } else if (isWon) {
            ctx.fillStyle = 'rgba(11, 19, 41, 0.85)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Победа! Все блоки разбиты 🎉', w / 2, h / 2 - 10);
            ctx.fillStyle = '#f8fafc';
            ctx.font = '13px sans-serif';
            ctx.fillText(`Счёт: ${score}`, w / 2, h / 2 + 16);
        }

        update();
        requestAnimationFrame(draw);
    }

    draw();
}
