function initMinesweeper(mount) {
    document.getElementById('game-title').innerText = "Сапёр";

    const DIFFS = {
        easy: { name: "Новичок", rows: 8, cols: 8, mines: 10 },
        medium: { name: "Любитель", rows: 10, cols: 10, mines: 18 },
        hard: { name: "Эксперт", rows: 12, cols: 12, mines: 28 }
    };

    let curDiffKey = localStorage.getItem('ms_diff') || 'easy';
    if (!DIFFS[curDiffKey]) curDiffKey = 'easy';

    let diff = DIFFS[curDiffKey];
    let grid = [];
    let gameOver = false;
    let gameWon = false;
    let firstClick = true;
    let flagMode = false;
    let timerVal = 0;
    let timerId = null;

    mount.innerHTML = `
        <style>
            .ms-wrap { display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 360px; gap: 8px; }
            .ms-diff-bar { display: flex; gap: 6px; width: 100%; justify-content: center; }
            .ms-diff-btn {
                background: #121c2e; border: 1px solid var(--border); color: var(--text-dim);
                padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;
            }
            .ms-diff-btn.active { background: var(--surface); color: var(--accent); border-color: var(--accent); }
            
            .ms-header-bar {
                display: flex; justify-content: space-between; align-items: center; width: 100%;
                background: #0b1325; border: 1px solid var(--border); border-radius: 10px; padding: 8px 14px;
            }
            .ms-stat { font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 4px; }
            
            .ms-board-container {
                background: #070d18; border: 1px solid var(--border); border-radius: 10px;
                padding: 6px; display: flex; justify-content: center; align-items: center; overflow: hidden;
            }
            .ms-grid-table { display: grid; gap: 2px; user-select: none; touch-action: manipulation; }
            .ms-c {
                border-radius: 4px; display: flex; justify-content: center; align-items: center;
                font-weight: 800; cursor: pointer; background: #1e293b; color: #fff;
            }
            .ms-c.opened { background: #0c1424; }
            .ms-c.mine-hit { background: var(--danger) !important; }
            
            .ms-controls-row { display: flex; gap: 8px; width: 100%; justify-content: center; margin-top: 4px; }
            .ms-mode-btn {
                flex: 1; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 700;
                border: 1px solid var(--border); background: #121c2e; color: #fff; cursor: pointer;
            }
            .ms-mode-btn.flag-active {
                background: #f59e0b; color: #000; border-color: #f59e0b;
            }
        </style>

        <div class="ms-wrap">
            <div class="ms-diff-bar">
                <button class="ms-diff-btn ${curDiffKey==='easy'?'active':''}" onclick="window._setMsDiff('easy')">Новичок (8x8)</button>
                <button class="ms-diff-btn ${curDiffKey==='medium'?'active':''}" onclick="window._setMsDiff('medium')">Любитель (10x10)</button>
                <button class="ms-diff-btn ${curDiffKey==='hard'?'active':''}" onclick="window._setMsDiff('hard')">Эксперт (12x12)</button>
            </div>

            <div class="ms-header-bar">
                <div class="ms-stat" style="color:var(--danger)">💣 <span id="ms-mines-left">${diff.mines}</span></div>
                <button class="p-btn" style="padding:4px 10px; font-size:14px;" onclick="restartCurrentGame()" id="ms-face">🙂</button>
                <div class="ms-stat" style="color:var(--accent)">⏱️ <span id="ms-timer">000</span></div>
            </div>

            <div class="ms-board-container">
                <div class="ms-grid-table" id="ms-grid"></div>
            </div>

            <div class="ms-controls-row">
                <button class="ms-mode-btn" id="ms-toggle-mode" onclick="window._toggleMsMode()">
                    Режим: ⛏️ Копать
                </button>
                <button class="p-btn" style="padding:10px 14px;" onclick="restartCurrentGame()">Заново</button>
            </div>
        </div>
    `;

    const gridEl = document.getElementById('ms-grid');
    const minesLeftEl = document.getElementById('ms-mines-left');
    const timerEl = document.getElementById('ms-timer');
    const faceBtn = document.getElementById('ms-face');
    const modeBtn = document.getElementById('ms-toggle-mode');

    window._setMsDiff = function(k) {
        localStorage.setItem('ms_diff', k);
        initMinesweeper(mount);
    };

    window._toggleMsMode = function() {
        flagMode = !flagMode;
        if (flagMode) {
            modeBtn.classList.add('flag-active');
            modeBtn.innerText = "Режим: 🚩 Флажок";
        } else {
            modeBtn.classList.remove('flag-active');
            modeBtn.innerText = "Режим: ⛏️ Копать";
        }
    };

    function startTimer() {
        if (timerId) clearInterval(timerId);
        timerVal = 0;
        timerId = setInterval(() => {
            timerVal++;
            timerEl.innerText = String(Math.min(999, timerVal)).padStart(3, '0');
        }, 1000);
    }

    const cellPx = Math.floor(Math.min(window.innerWidth - 44, 320) / diff.cols);
    gridEl.style.gridTemplateColumns = `repeat(${diff.cols}, ${cellPx}px)`;

    function buildEmptyGrid() {
        grid = [];
        for (let r = 0; r < diff.rows; r++) {
            grid[r] = [];
            for (let c = 0; c < diff.cols; c++) {
                grid[r][c] = { r, c, mine: false, opened: false, flagged: false, count: 0 };
            }
        }
    }

    function plantMines(safeR, safeC) {
        let planted = 0;
        while (planted < diff.mines) {
            let r = Math.floor(Math.random() * diff.rows);
            let c = Math.floor(Math.random() * diff.cols);
            if (!grid[r][c].mine && !(Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1)) {
                grid[r][c].mine = true;
                planted++;
            }
        }
        for (let r = 0; r < diff.rows; r++) {
            for (let c = 0; c < diff.cols; c++) {
                if (!grid[r][c].mine) {
                    let cnt = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            let nr = r + dr, nc = c + dc;
                            if (nr >= 0 && nr < diff.rows && nc >= 0 && nc < diff.cols && grid[nr][nc].mine) {
                                cnt++;
                            }
                        }
                    }
                    grid[r][c].count = cnt;
                }
            }
        }
    }

    const NUM_COLORS = ['', '#38bdf8', '#22c55e', '#ef4444', '#a855f7', '#f59e0b', '#06b6d4', '#ec4899', '#ffffff'];

    function renderGrid() {
        gridEl.innerHTML = '';
        let flagsUsed = 0;

        for (let r = 0; r < diff.rows; r++) {
            for (let c = 0; c < diff.cols; c++) {
                const cell = grid[r][c];
                const div = document.createElement('div');
                div.className = 'ms-c';
                div.style.width = `${cellPx}px`;
                div.style.height = `${cellPx}px`;
                div.style.fontSize = `${Math.floor(cellPx * 0.55)}px`;

                if (cell.flagged) flagsUsed++;

                if (cell.opened) {
                    div.classList.add('opened');
                    if (cell.mine) {
                        div.innerText = '💣';
                        if (cell.hit) div.classList.add('mine-hit');
                    } else if (cell.count > 0) {
                        div.innerText = cell.count;
                        div.style.color = NUM_COLORS[cell.count] || '#fff';
                    }
                } else if (cell.flagged) {
                    div.innerText = '🚩';
                }

                div.onpointerdown = (e) => {
                    e.preventDefault();
                    handleCellClick(cell);
                };

                gridEl.appendChild(div);
            }
        }

        minesLeftEl.innerText = Math.max(0, diff.mines - flagsUsed);
    }

    function reveal(r, c) {
        if (r < 0 || r >= diff.rows || c < 0 || c >= diff.cols) return;
        const cell = grid[r][c];
        if (cell.opened || cell.flagged) return;

        cell.opened = true;
        if (cell.count === 0 && !cell.mine) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    reveal(r + dr, c + dc);
                }
            }
        }
    }

    function checkWin() {
        let allNonMinesOpened = true;
        for (let r = 0; r < diff.rows; r++) {
            for (let c = 0; c < diff.cols; c++) {
                if (!grid[r][c].mine && !grid[r][c].opened) allNonMinesOpened = false;
            }
        }
        if (allNonMinesOpened) {
            gameWon = true;
            clearInterval(timerId);
            faceBtn.innerText = '😎';
            notify(`🎉 Победа на сложности «${diff.name}» за ${timerVal}с!`);
        }
    }

    function handleCellClick(cell) {
        if (gameOver || gameWon) return;

        if (flagMode) {
            if (!cell.opened) {
                cell.flagged = !cell.flagged;
                if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate(12);
                renderGrid();
            }
            return;
        }

        if (cell.flagged) return;

        if (firstClick) {
            firstClick = false;
            plantMines(cell.r, cell.c);
            startTimer();
        }

        if (cell.mine) {
            cell.hit = true;
            gameOver = true;
            clearInterval(timerId);
            faceBtn.innerText = '😵';
            // Открываем все мины
            for (let r = 0; r < diff.rows; r++) {
                for (let c = 0; c < diff.cols; c++) {
                    if (grid[r][c].mine) grid[r][c].opened = true;
                }
            }
            if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate(40);
            notify("Взрыв! Игра окончена");
        } else {
            reveal(cell.r, cell.c);
            if (window.appSettings?.vibration && navigator.vibrate) navigator.vibrate(8);
            checkWin();
        }

        renderGrid();
    }

    buildEmptyGrid();
    renderGrid();
}
