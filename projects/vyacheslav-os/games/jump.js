// =========================================================
// CYBER JUMP PRO 2.0: НОВАЯ ФИЗИКА, МОНЕТЫ И СУПЕР-ПРЫЖКИ
// =========================================================
window.initJump = function(mount) {
    mount.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%; max-width:340px;">
            <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:6px; font-size:12px; font-weight:800;">
                <span>Высота: <b id="jump-score" style="color:var(--accent);">0</b> м</span>
                <span>🪙 <b id="jump-coins" style="color:var(--accent-warm);">0</b></span>
                <span>Рекорд: <b id="jump-best" style="color:#10b981;">0</b></span>
            </div>
            <canvas id="jump-canvas" width="320" height="460" style="background:#050a14; border:2px solid var(--border); border-radius:14px; box-shadow:0 6px 20px rgba(0,0,0,0.6); touch-action:none; display:block;"></canvas>
            
            <div style="display:flex; gap:10px; width:100%; margin-top:8px;">
                <button class="p-btn" id="jump-btn-left" style="flex:1; padding:12px; font-size:18px;">◄ Влево</button>
                <button class="p-btn" id="jump-btn-right" style="flex:1; padding:12px; font-size:18px;">Вправо ►</button>
            </div>
        </div>
    `;

    const canvas = document.getElementById('jump-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let player = {
        x: 145, y: 350, w: 26, h: 26,
        vx: 0, vy: -9,
        color: '#38bdf8'
    };

    let gravity = 0.32;
    let jumpImpulse = -9.2;
    let platforms = [];
    let coins = [];
    let score = 0;
    let sessionCoins = 0;
    let bestScore = parseInt(localStorage.getItem('jump_best') || '0', 10);
    document.getElementById('jump-best').innerText = bestScore;

    let keys = { left: false, right: false };
    let isGameOver = false;
    let animId = null;

    // Генерация стартовых платформ
    function initPlatforms() {
        platforms = [];
        coins = [];
        platforms.push({ x: 120, y: 430, w: 80, h: 10, type: 'normal' });

        for (let y = 370; y > 0; y -= 55) {
            spawnPlatform(y);
        }
    }

    function spawnPlatform(y) {
        const rand = Math.random();
        let type = 'normal';
        if (rand < 0.2) type = 'moving';
        else if (rand < 0.35) type = 'spring';
        else if (rand < 0.48) type = 'fragile';

        const w = type === 'spring' ? 60 : (type === 'fragile' ? 50 : 65);
        const x = Math.random() * (canvas.width - w);
        const p = { x, y, w, h: 10, type, vx: type === 'moving' ? (Math.random() > 0.5 ? 1.5 : -1.5) : 0 };
        platforms.push(p);

        // Шанс появления монеты над платформой
        if (Math.random() < 0.35 && type !== 'fragile') {
            coins.push({ x: x + w / 2, y: y - 16, r: 6, collected: false });
        }
    }

    initPlatforms();

    // Обработчики сенсорных кнопок и тапов
    const btnL = document.getElementById('jump-btn-left');
    const btnR = document.getElementById('jump-btn-right');

    const handleL = (down) => { keys.left = down; };
    const handleR = (down) => { keys.right = down; };

    btnL.onpointerdown = (e) => { e.preventDefault(); handleL(true); };
    btnL.onpointerup = () => handleL(false);
    btnR.onpointerdown = (e) => { e.preventDefault(); handleR(true); };
    btnR.onpointerup = () => handleR(false);

    // Управление тапом прямо по сторонам холста
    canvas.onpointerdown = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width / 2) keys.left = true;
        else keys.right = true;
    };
    canvas.onpointerup = () => { keys.left = false; keys.right = false; };

    function update() {
        if (isGameOver) return;

        // Движение по горизонтали
        if (keys.left) player.vx = -4.5;
        else if (keys.right) player.vx = 4.5;
        else player.vx *= 0.82;

        player.x += player.vx;
        if (player.x < -player.w) player.x = canvas.width;
        if (player.x > canvas.width) player.x = -player.w;

        // Гравитация
        player.vy += gravity;
        player.y += player.vy;

        // Движение платформ
        platforms.forEach(p => {
            if (p.type === 'moving') {
                p.x += p.vx;
                if (p.x <= 0 || p.x + p.w >= canvas.width) p.vx *= -1;
            }
        });

        // Прыжок от платформы (только при падении вниз)
        if (player.vy > 0) {
            platforms.forEach(p => {
                if (
                    player.x + player.w > p.x &&
                    player.x < p.x + p.w &&
                    player.y + player.h >= p.y &&
                    player.y + player.h <= p.y + 12
                ) {
                    if (p.type === 'fragile') {
                        // Ломается и исчезает
                        p.broken = true;
                        player.vy = jumpImpulse * 0.9;
                    } else if (p.type === 'spring') {
                        // Супер-прыжок
                        player.vy = jumpImpulse * 1.55;
                    } else {
                        player.vy = jumpImpulse;
                    }
                }
            });
        }

        // Очистка сломанных платформ
        platforms = platforms.filter(p => !p.broken);

        // Прокрутка мира вверх при подъёме игрока
        if (player.y < 200) {
            const diff = 200 - player.y;
            player.y = 200;
            score += Math.floor(diff);
            document.getElementById('jump-score').innerText = score;

            platforms.forEach(p => {
                p.y += diff;
            });
            coins.forEach(c => {
                c.y += diff;
            });

            // Удаление платформ снизу и спавн сверху
            platforms = platforms.filter(p => p.y < canvas.height);
            coins = coins.filter(c => c.y < canvas.height);

            while (platforms.length < 8) {
                const highestY = Math.min(...platforms.map(p => p.y));
                spawnPlatform(highestY - 55);
            }
        }

        // Сбор монет
        coins.forEach(c => {
            if (!c.collected && Math.hypot(player.x + player.w/2 - c.x, player.y + player.h/2 - c.y) < 18) {
                c.collected = true;
                sessionCoins++;
                if (window.addCoins) window.addCoins(1);
                document.getElementById('jump-coins').innerText = sessionCoins;
            }
        });

        // Проигрыш (падение вниз)
        if (player.y > canvas.height) {
            isGameOver = true;
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('jump_best', bestScore);
                document.getElementById('jump-best').innerText = bestScore;
            }
        }
    }

    function render() {
        ctx.fillStyle = '#050a14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Отрисовка платформ
        platforms.forEach(p => {
            if (p.type === 'spring') ctx.fillStyle = '#ffd700';
            else if (p.type === 'moving') ctx.fillStyle = '#38bdf8';
            else if (p.type === 'fragile') ctx.fillStyle = '#ef4444';
            else ctx.fillStyle = '#10b981';

            ctx.beginPath();
            ctx.roundRect(p.x, p.y, p.w, p.h, 4);
            ctx.fill();

            if (p.type === 'spring') {
                ctx.fillStyle = '#ff007f';
                ctx.fillRect(p.x + p.w/2 - 5, p.y - 4, 10, 4);
            }
        });

        // Отрисовка монет
        coins.forEach(c => {
            if (!c.collected) {
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });

        // Отрисовка игрока (кибер-робот)
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.roundRect(player.x, player.y, player.w, player.h, 6);
        ctx.fill();

        // Глаза игрока
        ctx.fillStyle = '#fff';
        const eyeOffset = player.vx > 0 ? 4 : (player.vx < 0 ? -4 : 0);
        ctx.fillRect(player.x + 6 + eyeOffset, player.y + 6, 4, 4);
        ctx.fillRect(player.x + 16 + eyeOffset, player.y + 6, 4, 4);

        // Экран конца игры
        if (isGameOver) {
            ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('ИГРА ОКОНЧЕНА', canvas.width / 2, 190);

            ctx.fillStyle = '#fff';
            ctx.font = '14px sans-serif';
            ctx.fillText(`Счёт: ${score} м | Монеты: +${sessionCoins}`, canvas.width / 2, 225);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('Нажмите, чтобы начать заново', canvas.width / 2, 270);
        }
    }

    function loop() {
        update();
        render();
        animId = requestAnimationFrame(loop);
    }

    canvas.onclick = () => {
        if (isGameOver) {
            player.x = 145;
            player.y = 350;
            player.vx = 0;
            player.vy = jumpImpulse;
            score = 0;
            sessionCoins = 0;
            document.getElementById('jump-score').innerText = 0;
            document.getElementById('jump-coins').innerText = 0;
            initPlatforms();
            isGameOver = false;
        }
    };

    loop();
};
