function init2048(mount) {
    document.getElementById('game-title').innerText = "2048 Compact 🌸";

    let gridSize = parseInt(localStorage.getItem('g2048_size') || '4');
    if (gridSize !== 3 && gridSize !== 4) gridSize = 4;

    mount.innerHTML = `
        <style>
            .g2048-wrap {
                display: flex; flex-direction: column; align-items: center;
                width: 100%; max-width: 320px; gap: 6px; user-select: none; touch-action: none;
            }
            .g2048-top {
                display: flex; justify-content: space-between; align-items: center; width: 246px;
            }
            .g2048-scores {
                display: flex; gap: 6px;
            }
            .g2048-sbox {
                background: #0b1325; border: 1px solid var(--border); border-radius: 8px;
                padding: 4px 8px; text-align: center; min-width: 65px;
            }
            .g2048-board {
                position: relative; width: 246px; height: 246px;
                background: #070d18; border: 2px solid var(--border); border-radius: 12px;
                padding: 6px; display: grid; gap: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            }
            .g2048-cell {
                border-radius: 6px; background: rgba(255, 255, 255, 0.04);
                display: flex; justify-content: center; align-items: center;
                font-weight: 800; transition: transform 0.1s, background 0.15s;
            }
            .g2048-controls {
                display: flex; justify-content: space-between; align-items: center; width: 246px; margin-top: 2px;
            }
            .g2048-dpad {
                display: grid; grid-template-columns: repeat(3, 44px); gap: 4px; margin-top: 2px;
            }
        </style>

        <div class="g2048-wrap">
            <div class="g2048-top">
                <div style="display:flex; align-items:center; gap:4px;">
                    <span style="font-size:18px; cursor:pointer;" onclick="window.unlockEgg('nezabudka')" title="Секрет Незабудки">🌸</span>
                    <button class="p-btn" style="padding:3px 7px; font-size:10px;" id="g2048-size-btn" onclick="window._toggle2048Size()">Поле: ${gridSize}x${gridSize}</button>
                </div>
                <div class="g2048-scores">
                    <div class="g2048-sbox">
                        <div style="font-size:9px; color:var(--text-dim);">СЧЁТ</div>
                        <b id="g2048-score" style="color:var(--accent); font-size:13px;">0</b>
                    </div>
                    <div class="g2048-sbox">
                        <div style="font-size:9px; color:var(--text-dim);">РЕКОРД</div>
                        <b id="g2048-best" style="color:var(--accent-warm); font-size:13px;">0</b>
                    </div>
                </div>
            </div>

            <div class="g2048-board" id="g2048-grid"></div>

            <div class="g2048-controls">
                <button class="p-btn" style="padding:4px 10px; font-size:11px;" onclick="window._undo2048()">↩ Назад</button>
                <span style="font-size:10px; color:var(--text-dim);">Свайп или стрелки</span>
                <button class="p-btn" style="padding:4px 10px; font-size:11px;" onclick="restartCurrentGame()">Заново</button>
            </div>

            <!-- Компактные кнопки стрелок -->
            <div class="g2048-dpad">
                <div></div>
                <button class="p-btn" style="padding:6px 0; font-size:13px;" onclick="window._move2048('up')">▲</button>
                <div></div>
                <button class="p-btn" style="padding:6px 0; font-size:13px;" onclick="window._move2048('left')">◄</button>
                <button class="p-btn" style="padding:6px 0; font-size:13px;" onclick="window._move2048('down')">▼</button>
                <button class="p-btn" style="padding:6px 0; font-size:13px;" onclick="window._move2048('right')">►</button>
            </div>
        </div>
    `;

    const boardEl = document.getElementById('g2048-grid');
    const scoreEl = document.getElementById('g2048-score');
    const bestEl = document.getElementById('g2048-best');

    let best = parseInt(localStorage.getItem('best2048') || '0');
    bestEl.innerText = best;

    let grid = [];
    let score = 0;
    let history = []; // Для отмены хода

    const COLORS = {
        2: { bg: '#0284c7', color: '#fff' },
        4: { bg: '#2563eb', color: '#fff' },
        8: { bg: '#059669', color: '#fff' },
        16: { bg: '#10b981', color: '#fff' },
        32: { bg: '#d97706', color: '#fff' },
        64: { bg: '#ea580c', color: '#fff' },
        128: { bg: '#e11d48', color: '#fff' },
        256: { bg: '#db2777', color: '#fff' },
        512: { bg: '#9333ea', color: '#fff' },
        1024: { bg: '#7c3aed', color: '#fff' },
        2048: { bg: '#ffd700', color: '#000', glow: '0 0 16px #ffd700' }
    };

    window._toggle2048Size = function() {
        gridSize = gridSize === 4 ? 3 : 4;
        localStorage.setItem('g2048_size', gridSize);
        init2048(mount);
        notify(gridSize === 3 ? "Включено компактное поле 3x3!" : "Включено классическое поле 4x4");
    };

    function initBoard() {
        grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
        score = 0;
        history = [];
        scoreEl.innerText = '0';
        boardEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        spawnTile();
        spawnTile();
        render();
    }

    function spawnTile() {
        let empty = [];
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (grid[r][c] === 0) empty.push({ r, c });
            }
        }
        if (empty.length > 0) {
            const spot = empty[Math.floor(Math.random() * empty.length)];
            grid[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    function render() {
        boardEl.innerHTML = '';
        const fontSize = gridSize === 3 ? '22px' : '17px';

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const val = grid[r][c];
                const cell = document.createElement('div');
                cell.className = 'g2048-cell';
                cell.style.fontSize = fontSize;

                if (val > 0) {
                    const style = COLORS[val] || { bg: '#00f5ff', color: '#000' };
                    cell.innerText = val === 2048 ? '🌸' : val;
                    cell.style.background = style.bg;
                    cell.style.color = style.color;
                    if (style.glow) cell.style.boxShadow = style.glow;
                }
                boardEl.appendChild(cell);
            }
        }
    }

    function slideRow(row) {
        let arr = row.filter(x => x !== 0);
        let gained = 0;
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                gained += arr[i];
                arr[i + 1] = 0;
                i++;
            }
        }
        arr = arr.filter(x => x !== 0);
        while (arr.length < gridSize) arr.push(0);
        return { row: arr, score: gained };
    }

    window._move2048 = function(dir) {
        // Сохраняем для Undo
        const prevGrid = JSON.stringify(grid);
        const prevScore = score;

        let totalGained = 0;
        let nextGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

        if (dir === 'left') {
            for (let r = 0; r < gridSize; r++) {
                const res = slideRow(grid[r]);
                nextGrid[r] = res.row;
                totalGained += res.score;
            }
        } else if (dir === 'right') {
            for (let r = 0; r < gridSize; r++) {
                const res = slideRow([...grid[r]].reverse());
                nextGrid[r] = res.row.reverse();
                totalGained += res.score;
            }
        } else if (dir === 'up') {
            for (let c = 0; c < gridSize; c++) {
                let col = [];
                for (let r = 0; r < gridSize; r++) col.push(grid[r][c]);
                const res = slideRow(col);
                for (let r = 0; r < gridSize; r++) nextGrid[r][c] = res.row[r];
                totalGained += res.score;
            }
        } else if (dir === 'down') {
            for (let c = 0; c < gridSize; c++) {
                let col = [];
                for (let r = 0; r < gridSize; r++) col.push(grid[r][c]);
                const res = slideRow(col.reverse());
                res.row.reverse();
                for (let r = 0; r < gridSize; r++) nextGrid[r][c] = res.row[r];
                totalGained += res.score;
            }
        }

        // Проверяем, сдвинулись ли плитки
        if (JSON.stringify(nextGrid) !== prevGrid) {
            history.push({ grid: JSON.parse(prevGrid), score: prevScore });
            if (history.length > 5) history.shift();

            grid = nextGrid;
            score += totalGained;
            scoreEl.innerText = score;

            if (score > best) {
                best = score;
                localStorage.setItem('best2048', best);
                bestEl.innerText = best;
            }

            if (totalGained > 0 && typeof window.addGlobalCoins === 'function') {
                window.addGlobalCoins(Math.floor(totalGained / 16));
            }

            // Проверка на пасхалку Незабудки
            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    if (grid[r][c] >= 2048) {
                        window.unlockEgg('nezabudka');
                    }
                }
            }

            spawnTile();
            render();
            checkGameOver();
            if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate(8);
        }
    };

    window._undo2048 = function() {
        if (history.length > 0) {
            const last = history.pop();
            grid = last.grid;
            score = last.score;
            scoreEl.innerText = score;
            render();
            notify("Ход отменён");
        } else {
            notify("Нет ходов для отмены");
        }
    };

    function checkGameOver() {
        // Есть ли нули
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (grid[r][c] === 0) return;
            }
        }
        // Есть ли соседние одинаковые
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const val = grid[r][c];
                if (r < gridSize - 1 && grid[r + 1][c] === val) return;
                if (c < gridSize - 1 && grid[r][c + 1] === val) return;
            }
        }
        notify(`Конец игры! Итоговый счёт: ${score}`, 4000);
        if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate([60, 40, 80]);
    }

    // Свайпы пальцем
    let startX = 0, startY = 0;
    boardEl.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
    }, { passive: true });

    boardEl.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 24) {
                window._move2048(dx > 0 ? 'right' : 'left');
            } else if (Math.abs(dy) > 24) {
                window._move2048(dy > 0 ? 'down' : 'up');
            }
        }
    }, { passive: true });

    // Стрелочки на клавиатуре
    function handleKey(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ф') window._move2048('left');
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'в') window._move2048('right');
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'ц') window._move2048('up');
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'ы') window._move2048('down');
    }
    window.addEventListener('keydown', handleKey);

    initBoard();
}
