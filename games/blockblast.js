// =========================================================
// BLOCK BLAST ULTRA 2.0: NEON COMBO PUZZLE
// =========================================================
window.initBlockBlast = function(mount) {
    if (!mount) return;

    mount.innerHTML = `
        <div id="bb-wrap" style="display:flex; flex-direction:column; align-items:center; width:100%; max-width:350px; margin:0 auto; user-select:none; touch-action:manipulation;">
            <!-- ВЕРХНЯЯ ПАНЕЛЬ -->
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:8px; font-size:12px; font-weight:800;">
                <span>Счёт: <b id="bb-score" style="color:var(--accent);">0</b></span>
                <span id="bb-combo-badge" style="color:#ff007f; display:none; animation:pulse 0.4s infinite alternate;">COMBO x2! 🔥</span>
                <span>Рекорд: <b id="bb-best" style="color:#10b981;">0</b></span>
            </div>

            <!-- ИГРОВОЕ ПОЛЕ 8x8 -->
            <div id="bb-board" style="
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                gap: 4px;
                width: 100%;
                aspect-ratio: 1 / 1;
                background: #030712;
                padding: 8px;
                border-radius: 16px;
                border: 2px solid var(--border);
                box-shadow: 0 8px 30px rgba(0,0,0,0.7);
                position: relative;
            "></div>

            <!-- СЛОТЫ ДЛЯ 3 ФИГУР -->
            <div id="bb-pieces-dock" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                margin-top: 14px;
                gap: 8px;
                min-height: 80px;
            "></div>

            <!-- ПОДСКАЗКА -->
            <div style="font-size:10px; color:var(--text-dim); margin-top:8px; text-align:center;">
                Тапните на фигуру внизу, затем на поле для установки
            </div>
        </div>
    `;

    const boardEl = document.getElementById('bb-board');
    const dockEl = document.getElementById('bb-pieces-dock');
    const scoreEl = document.getElementById('bb-score');
    const bestEl = document.getElementById('bb-best');
    const comboEl = document.getElementById('bb-combo-badge');

    const GRID_SIZE = 8;
    let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('blockblast_best') || '1420', 10);
    bestEl.innerText = bestScore;

    let comboStreak = 0;
    let activePieceIndex = null;
    let currentPieces = [];

    // Библиотека фигур полиомино
    const SHAPES = [
        { name: 'dot', matrix: [[1]], color: '#38bdf8' },
        { name: 'line2h', matrix: [[1, 1]], color: '#10b981' },
        { name: 'line2v', matrix: [[1], [1]], color: '#10b981' },
        { name: 'line3h', matrix: [[1, 1, 1]], color: '#6366f1' },
        { name: 'line3v', matrix: [[1], [1], [1]], color: '#6366f1' },
        { name: 'square', matrix: [[1, 1], [1, 1]], color: '#ffd700' },
        { name: 'cornerTL', matrix: [[1, 1], [1, 0]], color: '#f59e0b' },
        { name: 'cornerBR', matrix: [[0, 1], [1, 1]], color: '#f59e0b' },
        { name: 'tShape', matrix: [[1, 1, 1], [0, 1, 0]], color: '#ec4899' },
        { name: 'line4h', matrix: [[1, 1, 1, 1]], color: '#00f0ff' }
    ];

    // Звуки через WebAudio
    const playChord = (multiplier) => {
        try {
            const actx = window.audioCtxInstance || (window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)());
            if (actx.state === 'suspended') actx.resume();
            const now = actx.currentTime;
            const freqs = [261.6, 329.6, 392.0, 523.2, 659.2];
            const baseFreq = freqs[Math.min(multiplier, freqs.length - 1)];

            [baseFreq, baseFreq * 1.25].forEach((f, i) => {
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now + i * 0.04);
                gain.gain.setValueAtTime(0.08, now + i * 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.25);
                osc.connect(gain); gain.connect(actx.destination);
                osc.start(now + i * 0.04); osc.stop(now + i * 0.04 + 0.25);
            });
        } catch (_) {}
    };

    function renderBoard() {
        boardEl.innerHTML = '';
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = document.createElement('div');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.style.borderRadius = '6px';
                cell.style.transition = 'background 0.12s, transform 0.1s';

                if (grid[r][c]) {
                    cell.style.backgroundColor = grid[r][c];
                    cell.style.boxShadow = `inset 0 0 6px rgba(255,255,255,0.4), 0 0 8px ${grid[r][c]}66`;
                } else {
                    cell.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    cell.style.border = '1px solid rgba(255,255,255,0.05)';
                }

                cell.onpointerdown = (e) => {
                    e.preventDefault();
                    if (activePieceIndex !== null) tryPlacePiece(r, c);
                };

                boardEl.appendChild(cell);
            }
        }
    }

    function generatePieces() {
        currentPieces = [];
        for (let i = 0; i < 3; i++) {
            const p = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            currentPieces.push({ ...p, used: false });
        }
        activePieceIndex = null;
        renderDock();
        checkGameOver();
    }

    function renderDock() {
        dockEl.innerHTML = '';
        currentPieces.forEach((piece, idx) => {
            const slot = document.createElement('div');
            slot.style.flex = '1';
            slot.style.height = '84px';
            slot.style.background = (activePieceIndex === idx) ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.03)';
            slot.style.border = (activePieceIndex === idx) ? '2px solid var(--accent)' : '1px solid var(--border)';
            slot.style.borderRadius = '14px';
            slot.style.display = 'flex';
            slot.style.alignItems = 'center';
            slot.style.justifyContent = 'center';
            slot.style.cursor = piece.used ? 'default' : 'pointer';
            slot.style.opacity = piece.used ? '0.15' : '1';
            slot.style.transition = '0.15s';

            if (!piece.used) {
                const matrix = piece.matrix;
                const rows = matrix.length;
                const cols = matrix[0].length;
                const miniGrid = document.createElement('div');
                miniGrid.style.display = 'grid';
                miniGrid.style.gridTemplateColumns = `repeat(${cols}, 14px)`;
                miniGrid.style.gridTemplateRows = `repeat(${rows}, 14px)`;
                miniGrid.style.gap = '2px';

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const b = document.createElement('div');
                        if (matrix[r][c]) {
                            b.style.backgroundColor = piece.color;
                            b.style.borderRadius = '3px';
                            b.style.boxShadow = `0 0 5px ${piece.color}`;
                        }
                        miniGrid.appendChild(b);
                    }
                }
                slot.appendChild(miniGrid);

                slot.onpointerdown = (e) => {
                    e.preventDefault();
                    activePieceIndex = (activePieceIndex === idx) ? null : idx;
                    renderDock();
                };
            }
            dockEl.appendChild(slot);
        });
    }

    function canPlace(r, c, matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        if (r + rows > GRID_SIZE || c + cols > GRID_SIZE) return false;

        for (let ro = 0; ro < rows; ro++) {
            for (let co = 0; co < cols; co++) {
                if (matrix[ro][co] && grid[r + ro][c + co]) return false;
            }
        }
        return true;
    }

    function tryPlacePiece(r, c) {
        if (activePieceIndex === null) return;
        const piece = currentPieces[activePieceIndex];
        if (!piece || piece.used) return;

        if (!canPlace(r, c, piece.matrix)) {
            if (window.notify) window.notify("Не помещается!");
            return;
        }

        // Фиксация фигуры на сетке
        const rows = piece.matrix.length;
        const cols = piece.matrix[0].length;
        let placedBlocks = 0;

        for (let ro = 0; ro < rows; ro++) {
            for (let co = 0; co < cols; co++) {
                if (piece.matrix[ro][co]) {
                    grid[r + ro][c + co] = piece.color;
                    placedBlocks++;
                }
            }
        }

        piece.used = true;
        activePieceIndex = null;
        score += placedBlocks * 10;

        clearFullLines();
        renderBoard();
        renderDock();

        if (currentPieces.every(p => p.used)) {
            generatePieces();
        } else {
            checkGameOver();
        }
    }

    function clearFullLines() {
        const fullRows = [];
        const fullCols = [];

        // Проверка строк
        for (let r = 0; r < GRID_SIZE; r++) {
            if (grid[r].every(val => val !== 0)) fullRows.push(r);
        }
        // Проверка столбцов
        for (let c = 0; c < GRID_SIZE; c++) {
            let full = true;
            for (let r = 0; r < GRID_SIZE; r++) {
                if (grid[r][c] === 0) { full = false; break; }
            }
            if (full) fullCols.push(c);
        }

        const totalCleared = fullRows.length + fullCols.length;

        if (totalCleared > 0) {
            comboStreak++;
            const pts = totalCleared * 100 * comboStreak;
            score += pts;

            // Начисление монет за комбо
            if (comboStreak >= 2 && window.addCoins) {
                const bonusCoins = comboStreak * 5;
                window.addCoins(bonusCoins);
                if (window.notify) window.notify(`💥 КОМБО x${comboStreak}! <b>+${bonusCoins} 🪙</b>`, 2000);
            }

            comboEl.innerText = `COMBO x${comboStreak}! 🔥`;
            comboEl.style.display = 'inline-block';
            playChord(comboStreak);

            // Очистка ячеек
            fullRows.forEach(r => {
                for (let c = 0; c < GRID_SIZE; c++) grid[r][c] = 0;
            });
            fullCols.forEach(c => {
                for (let r = 0; r < GRID_SIZE; r++) grid[r][c] = 0;
            });
        } else {
            comboStreak = 0;
            comboEl.style.display = 'none';
        }

        scoreEl.innerText = score;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('blockblast_best', bestScore);
            bestEl.innerText = bestScore;
        }
    }

    function checkGameOver() {
        const availablePieces = currentPieces.filter(p => !p.used);
        if (availablePieces.length === 0) return;

        let hasValidMove = false;
        for (const piece of availablePieces) {
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (canPlace(r, c, piece.matrix)) {
                        hasValidMove = true;
                        break;
                    }
                }
                if (hasValidMove) break;
            }
            if (hasValidMove) break;
        }

        if (!hasValidMove) {
            setTimeout(() => {
                alert(`ИГРА ОКОНЧЕНА!\nВаш счёт: ${score}\nРекорд: ${bestScore}`);
                grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
                score = 0;
                comboStreak = 0;
                scoreEl.innerText = 0;
                comboEl.style.display = 'none';
                generatePieces();
                renderBoard();
            }, 300);
        }
    }

    renderBoard();
    generatePieces();
};
