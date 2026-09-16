function initLights(mount) {
    document.getElementById('game-title').innerText = "Взлом 5x5";
    mount.innerHTML = `
        <div class="game-panel">
            <div class="game-header">
                <div style="font-weight:600; font-size:14px;">Взлом 5x5</div>
                <span style="font-size:12px; color:var(--text-dim);">Погасите все ячейки</span>
            </div>
            <div class="lo-grid" id="lo-grid"></div>
        </div>
    `;
    let grid = Array(5).fill().map(() => Array(5).fill(false));

    function toggle(r, c) {
        const dirs = [[0,0],[0,1],[0,-1],[1,0],[-1,0]];
        dirs.forEach(([dr, dc]) => {
            let nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) grid[nr][nc] = !grid[nr][nc];
        });
    }

    for (let i = 0; i < 6; i++) {
        toggle(Math.floor(Math.random() * 5), Math.floor(Math.random() * 5));
    }

    function render() {
        const g = document.getElementById('lo-grid');
        g.innerHTML = '';
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const cell = document.createElement('div');
                cell.className = `lo-cell ${grid[r][c] ? 'active' : ''}`;
                cell.onclick = () => {
                    toggle(r, c);
                    render();
                    let any = grid.some(row => row.some(val => val));
                    if (!any) notify("Все ячейки отключены!");
                };
                g.appendChild(cell);
            }
        }
    }
    render();
}
