// =========================================================
// CYBER SURVIVORS 3.0: OVERDRIVE & TACTICAL DASH ENGINE
// =========================================================
window.initSurvivors = function(mount) {
    if (!mount) return;

    mount.innerHTML = `
        <div id="surv-container" style="position:relative; width:100%; max-width:360px; margin:0 auto; user-select:none; touch-action:none;">
            <!-- ВЕРХНИЙ СТАТУС-БАР -->
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:4px; font-size:11px; font-weight:800;">
                <span style="color:#ef4444;">HP: <b id="surv-hp-txt">100/100</b></span>
                <span style="color:var(--accent);">⏱ <b id="surv-time-txt">00:00</b></span>
                <span style="color:var(--accent-warm);">🪙 <b id="surv-coins-txt">0</b></span>
                <span style="color:#34d399;">LVL <b id="surv-lvl-txt">1</b></span>
            </div>

            <!-- ПОЛОСА ОПЫТА (XP) -->
            <div style="width:100%; height:5px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden; margin-bottom:6px;">
                <div id="surv-xp-bar" style="width:0%; height:100%; background:linear-gradient(90deg, #38bdf8, #a855f7); transition:width 0.1s;"></div>
            </div>

            <!-- ИГРОВОЙ ЭКРАН -->
            <div style="position:relative; width:100%; border-radius:14px; overflow:hidden; border:2px solid var(--border); box-shadow:0 8px 24px rgba(0,0,0,0.8);">
                <canvas id="surv-canvas" width="340" height="460" style="display:block; background:#040711; width:100%; height:auto;"></canvas>

                <!-- КНОПКИ АКТИВНЫХ НАВЫКОВ (ПОВЕРХ КАНВАСА) -->
                <div style="position:absolute; bottom:12px; right:12px; display:flex; flex-direction:column; gap:10px; z-index:30; pointer-events:auto;">
                    <!-- КНОПКА OVERDRIVE -->
                    <button id="surv-btn-ult" style="
                        width: 52px; height: 52px; border-radius: 50%;
                        background: rgba(168, 85, 247, 0.25);
                        border: 2px solid #a855f7; color: #fff;
                        font-size: 20px; font-weight: 900;
                        display: flex; align-items: center; justify-content: center;
                        box-shadow: 0 0 12px rgba(168, 85, 247, 0.4);
                        opacity: 0.45; cursor: pointer; transition: 0.15s;
                    ">💥</button>

                    <!-- КНОПКА DASH (РЫВОК) -->
                    <button id="surv-btn-dash" style="
                        width: 48px; height: 48px; border-radius: 50%;
                        background: rgba(56, 189, 248, 0.25);
                        border: 2px solid var(--accent); color: #fff;
                        font-size: 18px; font-weight: 900;
                        display: flex; align-items: center; justify-content: center;
                        box-shadow: 0 0 10px rgba(56, 189, 248, 0.35);
                        cursor: pointer; transition: 0.15s;
                    ">⚡</button>
                </div>

                <!-- МОДАЛКА ПРОКАЧКИ (LEVEL UP) -->
                <div id="surv-levelup-modal" style="display:none; position:absolute; inset:0; background:rgba(3,7,18,0.92); backdrop-filter:blur(8px); flex-direction:column; align-items:center; justify-content:center; padding:14px; z-index:50;">
                    <div style="font-size:16px; font-weight:900; color:#ffd700; margin-bottom:2px; text-shadow:0 0 10px #ffd700;">⚡ МОДЕРНИЗАЦИЯ ЯДРА ⚡</div>
                    <div style="font-size:11px; color:var(--text-dim); margin-bottom:12px;">Улучшите систему для выживания:</div>
                    <div id="surv-perks-list" style="display:flex; flex-direction:column; gap:8px; width:100%;"></div>
                </div>

                <!-- МОДАЛКА GAME OVER -->
                <div id="surv-gameover-modal" style="display:none; position:absolute; inset:0; background:rgba(3,7,18,0.94); backdrop-filter:blur(10px); flex-direction:column; align-items:center; justify-content:center; padding:16px; z-index:60; text-align:center;">
                    <div style="font-size:20px; font-weight:900; color:#ef4444; margin-bottom:6px;">СИСТЕМА РАЗРУШЕНА</div>
                    <div id="surv-over-stats" style="font-size:12px; color:var(--text-dim); margin-bottom:14px; line-height:1.6;"></div>
                    <button class="p-btn" style="background:var(--accent); color:#000; font-weight:900; padding:10px 24px; font-size:13px;" onclick="window.restartCurrentGame()">🔄 Запустить заново</button>
                </div>
            </div>

            <!-- ИНДИКАТОРЫ -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px; font-size:10px; color:var(--text-dim);">
                <span>Дроны: <b id="surv-drones-txt" style="color:#ffd700;">0</b> 🛡️</span>
                <span>Энергия: <b id="surv-ult-txt" style="color:#c084fc;">0%</b> ⚡</span>
                <span>Фраги: <b id="surv-kills-txt" style="color:#fff;">0</b> 💀</span>
            </div>
        </div>
    `;

    const canvas = document.getElementById('surv-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // WebAudio-синтезатор звуков
    const playSfx = (type) => {
        try {
            const actx = window.audioCtxInstance || (window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)());
            if (actx.state === 'suspended') actx.resume();
            const now = actx.currentTime;
            const osc = actx.createOscillator();
            const gain = actx.createGain();

            if (type === 'pew') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(640, now);
                osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.07);
                osc.connect(gain); gain.connect(actx.destination);
                osc.start(now); osc.stop(now + 0.07);
            } else if (type === 'dash') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.exponentialRampToValueAtTime(700, now + 0.14);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.14);
                osc.connect(gain); gain.connect(actx.destination);
                osc.start(now); osc.stop(now + 0.14);
            } else if (type === 'nuke') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(120, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
                osc.connect(gain); gain.connect(actx.destination);
                osc.start(now); osc.stop(now + 0.4);
            } else if (type === 'freeze') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(900, now);
                osc.frequency.linearRampToValueAtTime(350, now + 0.12);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
                osc.connect(gain); gain.connect(actx.destination);
                osc.start(now); osc.stop(now + 0.12);
            } else if (type === 'lvl') {
                [330, 440, 554, 659].forEach((f, i) => {
                    const o = actx.createOscillator();
                    const g = actx.createGain();
                    o.frequency.setValueAtTime(f, now + i * 0.06);
                    g.gain.setValueAtTime(0.07, now + i * 0.06);
                    g.gain.linearRampToValueAtTime(0.001, now + i * 0.06 + 0.18);
                    o.connect(g); g.connect(actx.destination);
                    o.start(now + i * 0.06); o.stop(now + i * 0.06 + 0.18);
                });
            }
        } catch (_) {}
    };

    // Параметры игрока
    const player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: 12,
        speed: 2.3,
        hp: 100,
        maxHp: 100,
        lvl: 1,
        xp: 0,
        nextXp: 12,
        kills: 0,
        coinsEarned: 0,
        magnetRadius: 70,
        // Оружие
        plasmaLvl: 1,
        plasmaTimer: 0,
        droneCount: 0,
        droneAngle: 0,
        empLvl: 0,
        empTimer: 0,
        mineLvl: 0,
        mineTimer: 0,
        // Рывок (Dash)
        dashCooldown: 0,
        isDashing: false,
        dashDuration: 0,
        dashVx: 0,
        dashVy: 0,
        ghosts: [],
        // Ультимейт (Overdrive)
        ultCharge: 0,
        maxUlt: 100
    };

    // Библиотека перков
    const ALL_PERKS = [
        { id: 'plasma', icon: '🔫', title: 'Гипер-Плазма', desc: 'Увеличивает урон и количество самонаводящихся зарядов', apply: () => { player.plasmaLvl++; } },
        { id: 'drone', icon: '🛡️', title: 'Орбитальный Дрон-Щит', desc: 'Призывает боевого дрона. На 3 уровне связываются лазером', apply: () => { player.droneCount++; document.getElementById('surv-drones-txt').innerText = player.droneCount; } },
        { id: 'mines', icon: '❄️', title: 'Крио-Мины', desc: 'Оставляет энерго-мины, замораживающие врагов на 2.5 сек', apply: () => { player.mineLvl++; } },
        { id: 'emp', icon: '⚡', title: 'EMP-Нова', desc: 'Периодический электрический разряд по всей площади арены', apply: () => { player.empLvl++; } },
        { id: 'magnet', icon: '🧲', title: 'Квантовый Магнит', desc: 'Притягивает сферы опыта и монеты издалека (+50%)', apply: () => { player.magnetRadius += 40; } },
        { id: 'speed', icon: '👟', title: 'Турбо-Приводы', desc: 'Скорость бега +20% и ускорение отката рывка', apply: () => { player.speed += 0.45; } },
        { id: 'heal', icon: '❤️', title: 'Нано-Ремонт', desc: 'Восстанавливает +50 HP и повышает макс. запас здоровья', apply: () => { player.maxHp += 25; player.hp = Math.min(player.maxHp, player.hp + 50); } }
    ];

    // Сущности
    let bullets = [];
    let enemies = [];
    let particles = [];
    let gems = [];
    let mines = [];
    let floatingTexts = [];

    let isPaused = false;
    let isGameOver = false;
    let gameTime = 0;
    let screenShake = 0;
    let bossSpawned = false;
    let animId = null;

    // Виртуальный аналоговый джойстик
    const joystick = {
        active: false,
        startX: 0, startY: 0,
        currX: 0, currY: 0,
        vx: 0, vy: 0,
        maxDist: 40
    };

    const keys = { w: false, a: false, s: false, d: false };

    // Обработчик сенсорного ввода
    canvas.addEventListener('pointerdown', (e) => {
        if (isPaused || isGameOver) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        joystick.startX = (e.clientX - rect.left) * scaleX;
        joystick.startY = (e.clientY - rect.top) * scaleY;
        joystick.currX = joystick.startX;
        joystick.currY = joystick.startY;
        joystick.active = true;
    });

    window.addEventListener('pointermove', (e) => {
        if (!joystick.active) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const curX = (e.clientX - rect.left) * scaleX;
        const curY = (e.clientY - rect.top) * scaleY;

        const dx = curX - joystick.startX;
        const dy = curY - joystick.startY;
        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
            const angle = Math.atan2(dy, dx);
            const clampedDist = Math.min(dist, joystick.maxDist);
            joystick.currX = joystick.startX + Math.cos(angle) * clampedDist;
            joystick.currY = joystick.startY + Math.sin(angle) * clampedDist;
            joystick.vx = (Math.cos(angle) * clampedDist) / joystick.maxDist;
            joystick.vy = (Math.sin(angle) * clampedDist) / joystick.maxDist;
        }
    });

    const endJoystick = () => {
        joystick.active = false;
        joystick.vx = 0;
        joystick.vy = 0;
    };
    window.addEventListener('pointerup', endJoystick);
    window.addEventListener('pointercancel', endJoystick);

    // Клавиатура (ПК)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'w' || e.key === 'ArrowUp') keys.w = true;
        if (e.key === 's' || e.key === 'ArrowDown') keys.s = true;
        if (e.key === 'a' || e.key === 'ArrowLeft') keys.a = true;
        if (e.key === 'd' || e.key === 'ArrowRight') keys.d = true;
        if (e.key === ' ' || e.key === 'Shift') triggerDash();
        if (e.key === 'e' || e.key === 'q') triggerOverdrive();
    });
    window.addEventListener('keyup', (e) => {
        if (e.key === 'w' || e.key === 'ArrowUp') keys.w = false;
        if (e.key === 's' || e.key === 'ArrowDown') keys.s = false;
        if (e.key === 'a' || e.key === 'ArrowLeft') keys.a = false;
        if (e.key === 'd' || e.key === 'ArrowRight') keys.d = false;
    });

    // АКТИВАЦИЯ РЫВКА (DASH)
    function triggerDash() {
        if (player.dashCooldown > 0 || player.isDashing || isPaused || isGameOver) return;
        let dx = joystick.vx;
        let dy = joystick.vy;
        if (keys.w) dy = -1;
        if (keys.s) dy = 1;
        if (keys.a) dx = -1;
        if (keys.d) dx = 1;

        if (dx === 0 && dy === 0) dy = -1; // Рывок вперёд по умолчанию
        const len = Math.hypot(dx, dy);

        player.dashVx = (dx / len) * (player.speed * 3.4);
        player.dashVy = (dy / len) * (player.speed * 3.4);
        player.isDashing = true;
        player.dashDuration = 14;
        player.dashCooldown = 150; // 2.5 сек
        playSfx('dash');

        try { if (navigator.vibrate) navigator.vibrate(25); } catch (_) {}
    }

    // АКТИВАЦИЯ УЛЬТИМЕЙТА (OVERDRIVE)
    function triggerOverdrive() {
        if (player.ultCharge < player.maxUlt || isPaused || isGameOver) return;
        player.ultCharge = 0;
        screenShake = 22;
        playSfx('nuke');

        floatingTexts.push({ x: canvas.width / 2, y: canvas.height / 2, txt: '💥 OVERDRIVE NUKE 💥', color: '#a855f7', ttl: 60 });

        // Урон всем врагам на арене
        enemies.forEach(en => {
            const dmg = 240;
            en.hp -= dmg;
            floatingTexts.push({ x: en.x, y: en.y - 12, txt: `-${dmg} ⚡`, color: '#ffd700', ttl: 35 });
            for (let i = 0; i < 6; i++) {
                particles.push({ x: en.x, y: en.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, color: '#c084fc', ttl: 25 });
            }
        });

        try { if (navigator.vibrate) navigator.vibrate([40, 30, 60]); } catch (_) {}
    }

    document.getElementById('surv-btn-dash').onclick = (e) => { e.stopPropagation(); triggerDash(); };
    document.getElementById('surv-btn-ult').onclick = (e) => { e.stopPropagation(); triggerOverdrive(); };

    // Спавн врагов
    let enemyTimer = 0;
    function spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        if (side === 0) { x = Math.random() * canvas.width; y = -20; }
        else if (side === 1) { x = canvas.width + 20; y = Math.random() * canvas.height; }
        else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 20; }
        else { x = -20; y = Math.random() * canvas.height; }

        const rand = Math.random();
        let type = 'drone', r = 9, hp = 16 + player.lvl * 3, speed = 1.7, color = '#ef4444';

        if (rand < 0.22) {
            type = 'tank';
            r = 16;
            hp = 50 + player.lvl * 9;
            speed = 0.9;
            color = '#f59e0b';
        } else if (rand < 0.38) {
            type = 'kamikaze';
            r = 10;
            hp = 10 + player.lvl * 2;
            speed = 2.4;
            color = '#ec4899';
        }

        enemies.push({ x, y, r, hp, maxHp: hp, speed, color, type, freezeTimer: 0 });
    }

    function spawnBoss() {
        bossSpawned = true;
        playSfx('nuke');
        floatingTexts.push({ x: canvas.width / 2, y: 130, txt: '⚠️ КВАНТОВЫЙ ТИТАН ⚠️', color: '#ff0055', ttl: 90 });
        enemies.push({
            x: canvas.width / 2,
            y: -50,
            r: 28,
            hp: 550,
            maxHp: 550,
            speed: 0.7,
            color: '#a855f7',
            type: 'boss',
            telegraphTimer: 0,
            chargeTimer: 0,
            aimAngle: 0,
            freezeTimer: 0
        });
    }

    function triggerLevelUp() {
        isPaused = true;
        playSfx('lvl');
        const modal = document.getElementById('surv-levelup-modal');
        const list = document.getElementById('surv-perks-list');
        if (!modal || !list) return;

        const shuffled = [...ALL_PERKS].sort(() => 0.5 - Math.random()).slice(0, 3);
        list.innerHTML = shuffled.map(p => `
            <div class="glass-card" style="display:flex; align-items:center; gap:10px; padding:10px; cursor:pointer; border-color:var(--accent); background:rgba(56,189,248,0.12);" onclick="window.choosePerk('${p.id}')">
                <span style="font-size:28px;">${p.icon}</span>
                <div style="flex:1;">
                    <b style="font-size:12px; color:#fff;">${p.title}</b>
                    <div style="font-size:10px; color:var(--text-dim); margin-top:2px;">${p.desc}</div>
                </div>
            </div>
        `).join('');

        window.choosePerk = (id) => {
            const perk = ALL_PERKS.find(x => x.id === id);
            if (perk) perk.apply();
            modal.style.display = 'none';
            isPaused = false;
        };

        modal.style.display = 'flex';
    }

    // ИГРОВОЙ ЦИКЛ
    function update() {
        if (isPaused || isGameOver) return;
        gameTime++;

        const sec = Math.floor(gameTime / 60);
        const mStr = String(Math.floor(sec / 60)).padStart(2, '0');
        const sStr = String(sec % 60).padStart(2, '0');
        document.getElementById('surv-time-txt').innerText = `${mStr}:${sStr}`;

        if (sec >= 60 && !bossSpawned) spawnBoss();

        // Обработка рывка
        if (player.dashCooldown > 0) player.dashCooldown--;
        if (player.isDashing) {
            player.x += player.dashVx;
            player.y += player.dashVy;
            player.dashDuration--;

            // Шлейф рывка (ghosts)
            player.ghosts.push({ x: player.x, y: player.y, ttl: 8 });

            if (player.dashDuration <= 0) player.isDashing = false;
        } else {
            // Обычное передвижение
            let mx = joystick.vx;
            let my = joystick.vy;
            if (keys.w) my = -1;
            if (keys.s) my = 1;
            if (keys.a) mx = -1;
            if (keys.d) mx = 1;

            if (mx !== 0 || my !== 0) {
                const len = Math.hypot(mx, my);
                player.x += (mx / len) * player.speed;
                player.y += (my / len) * player.speed;
            }
        }

        player.x = Math.max(player.r, Math.min(canvas.width - player.r, player.x));
        player.y = Math.max(player.r, Math.min(canvas.height - player.r, player.y));

        // Обновление шлейфа
        player.ghosts.forEach((g, idx) => {
            g.ttl--;
            if (g.ttl <= 0) player.ghosts.splice(idx, 1);
        });

        // 1. АВТО-СТРЕЛЬБА ПЛАЗМЫ
        player.plasmaTimer++;
        const fireRate = Math.max(10, 34 - player.plasmaLvl * 4);
        if (player.plasmaTimer >= fireRate && enemies.length > 0) {
            player.plasmaTimer = 0;
            // Ищем цели для выстрела
            let sorted = [...enemies].sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y));
            const shotsCount = Math.min(sorted.length, player.plasmaLvl >= 4 ? 3 : (player.plasmaLvl >= 2 ? 2 : 1));

            for (let s = 0; s < shotsCount; s++) {
                const target = sorted[s];
                const angle = Math.atan2(target.y - player.y, target.x - player.x) + (s - (shotsCount - 1) / 2) * 0.15;
                bullets.push({
                    x: player.x,
                    y: player.y,
                    vx: Math.cos(angle) * 8.2,
                    vy: Math.sin(angle) * 8.2,
                    damage: 16 + player.plasmaLvl * 5,
                    r: 4
                });
            }
            playSfx('pew');
        }

        // Полет пуль
        bullets.forEach((b, bIdx) => {
            b.x += b.vx;
            b.y += b.vy;
            if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
                bullets.splice(bIdx, 1);
            }
        });

        // 2. ДРОНЫ
        player.droneAngle += 0.045;

        // 3. КРИО-МИНЫ
        if (player.mineLvl > 0) {
            player.mineTimer++;
            if (player.mineTimer >= Math.max(60, 160 - player.mineLvl * 25)) {
                player.mineTimer = 0;
                mines.push({ x: player.x, y: player.y, r: 8, ttl: 400 });
            }
        }

        // Спавн волн
        enemyTimer++;
        const spawnDelay = Math.max(14, 48 - Math.floor(sec / 4));
        if (enemyTimer >= spawnDelay) {
            enemyTimer = 0;
            spawnEnemy();
        }

        // Поведение и коллизии врагов
        enemies.forEach((en, eIdx) => {
            if (en.freezeTimer > 0) {
                en.freezeTimer--;
            } else {
                if (en.type === 'boss') {
                    // Босс с телеграфом атаки
                    en.telegraphTimer++;
                    if (en.telegraphTimer > 180 && en.telegraphTimer < 240) {
                        en.aimAngle = Math.atan2(player.y - en.y, player.x - en.x);
                    } else if (en.telegraphTimer >= 240) {
                        // Таран
                        en.x += Math.cos(en.aimAngle) * (en.speed * 4);
                        en.y += Math.sin(en.aimAngle) * (en.speed * 4);
                        if (en.telegraphTimer >= 270) en.telegraphTimer = 0;
                    } else {
                        const angle = Math.atan2(player.y - en.y, player.x - en.x);
                        en.x += Math.cos(angle) * en.speed;
                        en.y += Math.sin(angle) * en.speed;
                    }
                } else {
                    const angle = Math.atan2(player.y - en.y, player.x - en.x);
                    en.x += Math.cos(angle) * en.speed;
                    en.y += Math.sin(angle) * en.speed;
                }
            }

            // Наступание на крио-мины
            mines.forEach((m, mIdx) => {
                if (Math.hypot(m.x - en.x, m.y - en.y) < en.r + m.r) {
                    en.hp -= 35;
                    en.freezeTimer = 150; // Заморозка на 2.5 сек
                    playSfx('freeze');
                    floatingTexts.push({ x: en.x, y: en.y - 10, txt: 'FREEZE ❄️', color: '#38bdf8', ttl: 30 });
                    mines.splice(mIdx, 1);
                }
            });

            // Попадание пуль
            bullets.forEach((b, bIdx) => {
                if (Math.hypot(b.x - en.x, b.y - en.y) < en.r + b.r) {
                    en.hp -= b.damage;
                    floatingTexts.push({ x: en.x, y: en.y - 8, txt: `${b.damage}`, color: '#fff', ttl: 22 });
                    bullets.splice(bIdx, 1);

                    for (let i = 0; i < 3; i++) {
                        particles.push({ x: en.x, y: en.y, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, color: en.color, ttl: 14 });
                    }
                }
            });

            // Урон от дронов
            for (let d = 0; d < player.droneCount; d++) {
                const dAngle = player.droneAngle + (d * (Math.PI * 2 / player.droneCount));
                const dx = player.x + Math.cos(dAngle) * 46;
                const dy = player.y + Math.sin(dAngle) * 46;
                if (Math.hypot(dx - en.x, dy - en.y) < en.r + 8) {
                    en.hp -= 2.5;
                    floatingTexts.push({ x: en.x, y: en.y - 8, txt: '10 🛡️', color: '#ffd700', ttl: 14 });
                }
            }

            // Контакт с игроком (во время Dash урон не наносится)
            if (!player.isDashing && Math.hypot(player.x - en.x, player.y - en.y) < player.r + en.r) {
                const dmg = en.type === 'kamikaze' ? 28 : (en.type === 'boss' ? 1.6 : 0.65);
                player.hp = Math.max(0, player.hp - dmg);
                screenShake = 6;
                if (en.type === 'kamikaze') en.hp = 0;
            }

            // Смерть врага
            if (en.hp <= 0) {
                player.kills++;
                document.getElementById('surv-kills-txt').innerText = player.kills;

                // Зарядка ультимейта
                player.ultCharge = Math.min(player.maxUlt, player.ultCharge + (en.type === 'boss' ? 35 : 4));

                gems.push({ x: en.x, y: en.y, val: en.type === 'boss' ? 60 : (en.type === 'tank' ? 8 : 2), type: 'xp' });

                if (en.type === 'boss' || Math.random() < 0.2) {
                    const cVal = en.type === 'boss' ? 100 : 5;
                    gems.push({ x: en.x + 8, y: en.y, val: cVal, type: 'coin' });
                }

                for (let i = 0; i < 8; i++) {
                    particles.push({ x: en.x, y: en.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, color: en.color, ttl: 20 });
                }

                enemies.splice(eIdx, 1);
            }
        });

        // Сбор кристаллов магнитом
        gems.forEach((g, gIdx) => {
            const dist = Math.hypot(player.x - g.x, player.y - g.y);
            if (dist < player.magnetRadius) {
                const angle = Math.atan2(player.y - g.y, player.x - g.x);
                g.x += Math.cos(angle) * 6.5;
                g.y += Math.sin(angle) * 6.5;
            }

            if (dist < player.r + 10) {
                if (g.type === 'xp') {
                    player.xp += g.val;
                    if (player.xp >= player.nextXp) {
                        player.xp -= player.nextXp;
                        player.lvl++;
                        player.nextXp = Math.floor(player.nextXp * 1.45);
                        triggerLevelUp();
                    }
                } else if (g.type === 'coin') {
                    player.coinsEarned += g.val;
                    if (window.addCoins) window.addCoins(g.val);
                    floatingTexts.push({ x: player.x, y: player.y - 12, txt: `+${g.val} 🪙`, color: '#ffd700', ttl: 30 });
                }
                gems.splice(gIdx, 1);
            }
        });

        // Обновление UI кнопок
        const ultBtn = document.getElementById('surv-btn-ult');
        const dashBtn = document.getElementById('surv-btn-dash');
        if (ultBtn) {
            const isReady = player.ultCharge >= player.maxUlt;
            ultBtn.style.opacity = isReady ? '1' : '0.45';
            ultBtn.style.boxShadow = isReady ? '0 0 20px #a855f7' : 'none';
        }
        if (dashBtn) {
            dashBtn.style.opacity = (player.dashCooldown === 0) ? '1' : '0.4';
        }

        document.getElementById('surv-hp-txt').innerText = `${Math.ceil(player.hp)}/${player.maxHp}`;
        document.getElementById('surv-lvl-txt').innerText = player.lvl;
        document.getElementById('surv-coins-txt').innerText = player.coinsEarned;
        document.getElementById('surv-ult-txt').innerText = `${Math.floor((player.ultCharge / player.maxUlt) * 100)}%`;
        document.getElementById('surv-xp-bar').style.width = `${Math.min(100, (player.xp / player.nextXp) * 100)}%`;

        if (player.hp <= 0 && !isGameOver) {
            isGameOver = true;
            document.getElementById('surv-gameover-modal').style.display = 'flex';
            document.getElementById('surv-over-stats').innerHTML = `
                Время в секторе: <b>${mStr}:${sStr}</b><br>
                Уничтожено ботов: <b>${player.kills}</b> 💀<br>
                Добыто монет: <b style="color:var(--accent-warm);">+${player.coinsEarned} 🪙</b>
            `;
        }

        particles.forEach((p, idx) => {
            p.x += p.vx; p.y += p.vy; p.ttl--;
            if (p.ttl <= 0) particles.splice(idx, 1);
        });
        floatingTexts.forEach((t, idx) => {
            t.y -= 0.6; t.ttl--;
            if (t.ttl <= 0) floatingTexts.splice(idx, 1);
        });
    }

    // РЕНДЕРИНГ
    function render() {
        ctx.save();
        if (screenShake > 0) {
            ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
            screenShake *= 0.88;
            if (screenShake < 0.5) screenShake = 0;
        }

        ctx.fillStyle = '#040711';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Сетка
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 30) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 30) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // Крио-мины
        mines.forEach(m => {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.stroke();
        });

        // Дроп (XP и монеты)
        gems.forEach(g => {
            ctx.fillStyle = g.type === 'coin' ? '#ffd700' : '#38bdf8';
            ctx.beginPath(); ctx.arc(g.x, g.y, g.type === 'coin' ? 5 : 4, 0, Math.PI * 2); ctx.fill();
        });

        // Снаряды
        ctx.fillStyle = '#00f0ff';
        bullets.forEach(b => {
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        });

        // Лазерные связи между дронами при уровне >= 3
        if (player.droneCount >= 3) {
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let d = 0; d < player.droneCount; d++) {
                const dAngle = player.droneAngle + (d * (Math.PI * 2 / player.droneCount));
                const dx = player.x + Math.cos(dAngle) * 46;
                const dy = player.y + Math.sin(dAngle) * 46;
                if (d === 0) ctx.moveTo(dx, dy);
                else ctx.lineTo(dx, dy);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Орбитальные дроны
        for (let d = 0; d < player.droneCount; d++) {
            const dAngle = player.droneAngle + (d * (Math.PI * 2 / player.droneCount));
            const dx = player.x + Math.cos(dAngle) * 46;
            const dy = player.y + Math.sin(dAngle) * 46;
            ctx.fillStyle = '#ffd700';
            ctx.beginPath(); ctx.arc(dx, dy, 6, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
        }

        // Враги и лазерный телеграф босса
        enemies.forEach(en => {
            if (en.type === 'boss' && en.telegraphTimer > 180 && en.telegraphTimer < 240) {
                // Предупреждающий красный лазерный прицел
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 6]);
                ctx.beginPath();
                ctx.moveTo(en.x, en.y);
                ctx.lineTo(en.x + Math.cos(en.aimAngle) * 500, en.y + Math.sin(en.aimAngle) * 500);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            ctx.fillStyle = en.freezeTimer > 0 ? '#38bdf8' : en.color;
            ctx.beginPath(); ctx.arc(en.x, en.y, en.r, 0, Math.PI * 2); ctx.fill();

            if (en.type === 'boss' || en.type === 'tank') {
                const bw = en.r * 2;
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(en.x - bw/2, en.y - en.r - 8, bw, 4);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(en.x - bw/2, en.y - en.r - 8, (en.hp / en.maxHp) * bw, 4);
            }
        });

        // Голографические фантомы рывка
        player.ghosts.forEach(g => {
            ctx.fillStyle = `rgba(56, 189, 248, ${g.ttl / 12})`;
            ctx.beginPath(); ctx.arc(g.x, g.y, player.r, 0, Math.PI * 2); ctx.fill();
        });

        // Игрок
        ctx.fillStyle = player.isDashing ? '#ffffff' : '#38bdf8';
        ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

        // Частицы
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 2.5, 2.5);
        });

        // Всплывающие надписи
        floatingTexts.forEach(t => {
            ctx.fillStyle = t.color;
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(t.txt, t.x, t.y);
        });

        // Аналоговый стик
        if (joystick.active) {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(joystick.startX, joystick.startY, joystick.maxDist, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
            ctx.beginPath();
            ctx.arc(joystick.currX, joystick.currY, 18, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function loop() {
        update();
        render();
        animId = requestAnimationFrame(loop);
    }

    loop();
};
