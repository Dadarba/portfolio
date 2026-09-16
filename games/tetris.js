function initTetris(mount) {
    document.getElementById('game-title').innerText = "Тетрис PRO";
    const COLS = 10;
    const ROWS = 18;
    const BLOCK = Math.floor(Math.min(window.innerWidth - 100, 220) / COLS);
    const W = BLOCK * COLS;
    const H = BLOCK * ROWS;

    mount.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
            <div style="display:flex; justify-content:space-between; width:${W + 80}px; font-size:12px; margin-bottom:6px;">
                <span>Счёт: <b id="t-score" style="color:var(--accent)">0</b></span>
                <span>Уровень: <b id="t-level" style="color:var(--accent-warm)">1</b></span>
                <span>Рекорд: <b id="t-best">0</b></span>
            </div>

            <!-- Игровое поле + Боковая панель (Next Piece) -->
            <div style="display:flex; gap:8px; align-items:flex-start;">
                <canvas id="tetris-cvs" width="${W}" height="${H}" style="background:#070d18; border:2px solid var(--border); border-radius:8px; display:block;"></canvas>

                <div style="display:flex; flex-direction:column; gap:8px; width:72px;">
                    <div style="background:#0b1325; border:1px solid var(--border); border-radius:8px; padding:6px; text-align:center;">
                        <span style="font-size:10px; color:var(--text-dim);">Далее:</span>
                        <canvas id="t-next-cvs" width="60" height="60" style="display:block; margin:4px auto 0;"></canvas>
                    </div>
                    <div style="background:#0b1325; border:1px solid var(--border); border-radius:8px; padding:6px; text-align:center;">
                        <span style="font-size:10px; color:var(--text-dim);">Линий:</span>
                        <div id="t-lines" style="font-size:14px; font-weight:800; color:var(--success);">0</div>
                    </div>
                </div>
            </div>

            <!-- Кнопки управления для смартфонов -->
            <div style="display:flex; flex-direction:column; gap:6px; margin-top:10px; width:${W + 80}px;">
                <div style="display:flex; justify-content:space-between; gap:6px;">
                    <button class="p-btn" style="flex:1; padding:11px 0; font-size:15px;" id="t-rot">↻ Поворот</button>
                    <button class="p-btn" style="flex:1; padding:11px 0; font-size:15px; background:#0284c7; color:#fff;" id="t-drop">⏬ Вниз</button>
                </div>
                <div style="display:flex; justify-content:space-between; gap:6px;">
                    <button class="p-btn" style="flex:1; padding:12px 0; font-size:18px;" id="t-left">◄</button>
                    <button class="p-btn" style="flex:1; padding:12px 0; font-size:18px;" id="t-down">▼</button>
                    <button class="p-btn" style="flex:1; padding:12px 0; font-size:18px;" id="t-right">►</button>
                </div>
            </div>
            
            <button class="p-btn" style="padding:4px 12px; font-size:11px; margin-top:6px;" onclick="restartCurrentGame()">Заново</button>
        </div>
    `;

    const canvas = document.getElementById('tetris-cvs');
    const ctx = canvas.getContext('2d');
    const nextCanvas = document.getElementById('t-next-cvs');
    const nextCtx = nextCanvas.getContext('2d');

    const scoreEl = document.getElementById('t-score');
    const levelEl = document.getElementById('t-level');
    const linesEl = document.getElementById('t-lines');
    const bestEl = document.getElementById('t-best');

    let best = parseInt(localStorage.getItem('tetris_best') || '0');
    bestEl.innerText = best;

    const SHAPES = [
        [[1,1,1,1]], // I
        [[1,1],[1,1]], // O
        [[0,1,0],[1,1,1]], // T
        [[1,0,0],[1,1,1]], // L
        [[0,0,1],[1,1,1]], // J
        [[0,1,1],[1,1,0]], // S
        [[1,1,0],[0,1,1]]  // Z
    ];
    const COLORS = ['#38bdf8', '#fbbf24', '#a855f7', '#ea580c', '#3b82f6', '#22c55e', '#ef4444'];

    let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    let score = 0;
    let lines = 0;
    let level = 1;
    let gameOver = false;
    let currentPiece = null;
    let nextPieceIdx = Math.floor(Math.random() * SHAPES.length);
    let dropTimer = null;

    function getDropInterval() {
        return Math.max(140, 600 - (level - 1) * 45);
    }

    function resetTimer() {
        if (dropTimer) clearInterval(dropTimer);
        dropTimer = setInterval(moveDown, getDropInterval());
    }

    function spawnNext() {
        const idx = nextPieceIdx;
        nextPieceIdx = Math.floor(Math.random() * SHAPES.length);

        currentPiece = {
            shape: SHAPES[idx],
            color: COLORS[idx],
            x: Math.floor(COLS / 2) - Math.floor(SHAPES[idx][0].length / 2),
            y: 0
        };

        if (collides(currentPiece.x, currentPiece.y, currentPiece.shape)) {
            gameOver = true;
            clearInterval(dropTimer);
            notify("Игра окончена! Счёт: " + score);
        }

        drawNextPiece();
    }

    function collides(nx, ny, shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    let px = nx + c;
                    let py = ny + r;
                    if (px < 0 || px >= COLS || py >= ROWS) return true;
                    if (py >= 0 && grid[py][px]) return true;
                }
            }
        }
        return false;
    }

    function rotate(shape) {
        return shape[0].map((_, i) => shape.map(row => row[i]).reverse());
    }

    // Расчёт тени (проекции падения)
    function getGhostY() {
        if (!currentPiece) return 0;
        let gy = currentPiece.y;
        while (!collides(currentPiece.x, gy + 1, currentPiece.shape)) {
            gy++;
        }
        return gy;
    }

    function mergePiece() {
        for (let r = 0; r < currentPiece.shape.length; r++) {
            for (let c = 0; c < currentPiece.shape[r].length; c++) {
                if (currentPiece.shape[r][c]) {
                    grid[currentPiece.y + r][currentPiece.x + c] = currentPiece.color;
                }
            }
        }

        let cleared = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (grid[r].every(val => val !== 0)) {
                grid.splice(r, 1);
                grid.unshift(Array(COLS).fill(0));
                cleared++;
                r++;
            }
        }

        if (cleared > 0) {
            lines += cleared;
            score += [0, 100, 300, 700, 1500][cleared] * level;
            level = Math.floor(lines / 8) + 1;

            linesEl.innerText = lines;
            scoreEl.innerText = score;
            levelEl.innerText = level;

            if (score > best) {
                best = score;
                localStorage.setItem('tetris_best', best);
                bestEl.innerText = best;
            }
            resetTimer();
        }

        spawnNext();
    }

    function moveDown() {
        if (gameOver) return;
        if (!collides(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
            currentPiece.y++;
        } else {
            mergePiece();
        }
        draw();
    }

    function dropInstant() {
        if (gameOver) return;
        while (!collides(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
            currentPiece.y++;
        }
        mergePiece();
        draw();
    }

    function drawNextPiece() {
        nextCtx.clearRect(0, 0, 60, 60);
        const shape = SHAPES[nextPieceIdx];
        const color = COLORS[nextPieceIdx];
        const sz = 12;
        const offX = Math.floor((60 - shape[0].length * sz) / 2);
        const offY = Math.floor((60 - shape.length * sz) / 2);

        nextCtx.fillStyle = color;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    nextCtx.fillRect(offX + c * sz, offY + r * sz, sz - 1, sz - 1);
                }
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Зафиксированные блоки
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c]) {
                    ctx.fillStyle = grid[r][c];
                    ctx.fillRect(c * BLOCK, r * BLOCK, BLOCK - 1, BLOCK - 1);
                } else {
                    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                    ctx.strokeRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);
                }
            }
        }

        if (currentPiece && !gameOver) {
            // ТЕНЬ (ПРОЕКЦИЯ)
            const ghostY = getGhostY();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            for (let r = 0; r < currentPiece.shape.length; r++) {
                for (let c = 0; c < currentPiece.shape[r].length; c++) {
                    if (currentPiece.shape[r][c]) {
                        ctx.fillRect((currentPiece.x + c) * BLOCK, (ghostY + r) * BLOCK, BLOCK - 1, BLOCK - 1);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.strokeRect((currentPiece.x + c) * BLOCK, (ghostY + r) * BLOCK, BLOCK - 1, BLOCK - 1);
                    }
                }
            }

            // САМА ДЕТАЛЬ
            ctx.fillStyle = currentPiece.color;
            for (let r = 0; r < currentPiece.shape.length; r++) {
                for (let c = 0; c < currentPiece.shape[r].length; c++) {
                    if (currentPiece.shape[r][c]) {
                        ctx.fillRect((currentPiece.x + c) * BLOCK, (currentPiece.y + r) * BLOCK, BLOCK - 1, BLOCK - 1);
                    }
                }
            }
        }

        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = 'var(--danger)';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('ИГРА ОКОНЧЕНА', W / 2, H / 2);
        }
    }

    document.getElementById('t-left').onclick = () => {
        if (!gameOver && !collides(currentPiece.x - 1, currentPiece.y, currentPiece.shape)) {
            currentPiece.x--; draw();
        }
    };
    document.getElementById('t-right').onclick = () => {
        if (!gameOver && !collides(currentPiece.x + 1, currentPiece.y, currentPiece.shape)) {
            currentPiece.x++; draw();
        }
    };
    document.getElementById('t-down').onclick = () => moveDown();
    document.getElementById('t-rot').onclick = () => {
        if (gameOver) return;
        const rotated = rotate(currentPiece.shape);
        if (!collides(currentPiece.x, currentPiece.y, rotated)) {
            currentPiece.shape = rotated; draw();
        }
    };
    document.getElementById('t-drop').onclick = () => dropInstant();

    spawnNext();
    draw();
    resetTimer();
}
