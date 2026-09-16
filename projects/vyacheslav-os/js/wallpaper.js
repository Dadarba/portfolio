// ===================================================
// УНИКАЛЬНЫЙ ДВИЖОК 35 ЖИВЫХ ОБОЕВ (CANVAS 60 FPS)
// ===================================================
const bgCanvas = document.getElementById('live-bg-canvas');
let bgAnimId = null;

function resizeLiveCanvas() {
    if (!bgCanvas) return;
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeLiveCanvas);

window.initLiveWallpaper = function(type) {
    if (!bgCanvas) return;
    const bgCtx = bgCanvas.getContext('2d');
    if (bgAnimId) {
        cancelAnimationFrame(bgAnimId);
        bgAnimId = null;
    }
    resizeLiveCanvas();
    const w = bgCanvas.width;
    const h = bgCanvas.height;
    bgCtx.clearRect(0, 0, w, h);

    if (!type || type === 'wp_none') return;

    let tick = 0;

    // 1. Звёзды
    if (type === 'wp_stars' || type === 'wp_meteors') {
        let stars = Array.from({length: 80}, () => ({ x: Math.random()*w, y: Math.random()*h, s: Math.random()*2+0.5, speed: Math.random()*0.4+0.1 }));
        function loopStars() {
            bgCtx.clearRect(0, 0, w, h);
            bgCtx.fillStyle = '#fff';
            stars.forEach(st => {
                st.y += st.speed; if (st.y > h) st.y = 0;
                bgCtx.fillRect(st.x, st.y, st.s, st.s);
            });
            bgAnimId = requestAnimationFrame(loopStars);
        }
        loopStars();
    }
    // 2. Матрица (Зеленая / Красная / Синяя)
    else if (type === 'wp_matrix' || type === 'wp_matrix_red' || type === 'wp_matrix_blue') {
        const colSize = 14;
        const cols = Math.floor(w / colSize);
        const drops = Array(cols).fill(1);
        const color = type === 'wp_matrix_red' ? '#ef4444' : (type === 'wp_matrix_blue' ? '#00f5ff' : '#00ff66');
        function loopMatrix() {
            bgCtx.fillStyle = 'rgba(5, 10, 20, 0.09)';
            bgCtx.fillRect(0, 0, w, h);
            bgCtx.fillStyle = color;
            bgCtx.font = '12px monospace';
            drops.forEach((y, i) => {
                const txt = String.fromCharCode(Math.floor(Math.random()*94)+33);
                bgCtx.fillText(txt, i*colSize, y*colSize);
                if (y*colSize > h && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            });
            bgAnimId = requestAnimationFrame(loopMatrix);
        }
        loopMatrix();
    }
    // 3. Ретро-сетка 80s (Векторная перспектива)
    else if (type === 'wp_grid') {
        let offset = 0;
        function loopGrid() {
            bgCtx.clearRect(0, 0, w, h);
            bgCtx.strokeStyle = 'rgba(255, 0, 127, 0.25)';
            bgCtx.lineWidth = 1.5;
            offset = (offset + 0.8) % 30;

            const horizon = h * 0.45;
            // Горизонтальные бегущие линии
            for (let y = horizon; y <= h; y += 15) {
                const scaledY = y + offset * ((y - horizon) / (h - horizon));
                if (scaledY > h) continue;
                bgCtx.beginPath(); bgCtx.moveTo(0, scaledY); bgCtx.lineTo(w, scaledY); bgCtx.stroke();
            }
            // Лучи перспективы
            for (let x = -w; x <= w * 2; x += 45) {
                bgCtx.beginPath(); bgCtx.moveTo(w / 2, horizon); bgCtx.lineTo(x, h); bgCtx.stroke();
            }
            bgAnimId = requestAnimationFrame(loopGrid);
        }
        loopGrid();
    }
    // 4. Неоновый ливень (Rain)
    else if (type === 'wp_rain') {
        let drops = Array.from({length: 60}, () => ({ x: Math.random()*w, y: Math.random()*h, l: Math.random()*16+8, s: Math.random()*6+8 }));
        function loopRain() {
            bgCtx.clearRect(0, 0, w, h);
            bgCtx.strokeStyle = '#38bdf8';
            bgCtx.lineWidth = 1.2;
            drops.forEach(d => {
                bgCtx.beginPath(); bgCtx.moveTo(d.x, d.y); bgCtx.lineTo(d.x, d.y + d.l); bgCtx.stroke();
                d.y += d.s; if (d.y > h) d.y = -20;
            });
            bgAnimId = requestAnimationFrame(loopRain);
        }
        loopRain();
    }
    // 5. Тлеющие угли (Embers / Fire)
    else if (type === 'wp_embers') {
        let embers = Array.from({length: 45}, () => ({ x: Math.random()*w, y: h + Math.random()*20, r: Math.random()*3+1, vy: -(Math.random()*2+1), vx: (Math.random()-0.5)*1.5, alpha: 1 }));
        function loopEmbers() {
            bgCtx.clearRect(0, 0, w, h);
            embers.forEach(e => {
                e.y += e.vy; e.x += e.vx; e.alpha -= 0.007;
                if (e.alpha <= 0 || e.y < 0) { e.y = h; e.x = Math.random()*w; e.alpha = 1; }
                bgCtx.fillStyle = `rgba(249, 115, 22, ${e.alpha})`;
                bgCtx.beginPath(); bgCtx.arc(e.x, e.y, e.r, 0, Math.PI*2); bgCtx.fill();
            });
            bgAnimId = requestAnimationFrame(loopEmbers);
        }
        loopEmbers();
    }
    // 6. Кибер-соты (Hex)
    else if (type === 'wp_hex') {
        function loopHex() {
            bgCtx.clearRect(0, 0, w, h);
            tick += 0.015;
            const r = 24;
            const dy = r * 1.5;
            const dx = r * Math.sqrt(3);

            bgCtx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
            bgCtx.lineWidth = 1;

            for (let y = 0; y < h + r; y += dy) {
                let row = Math.floor(y / dy);
                let xOffset = (row % 2 === 0) ? 0 : dx / 2;
                for (let x = 0; x < w + dx; x += dx) {
                    const cx = x + xOffset;
                    const glow = Math.sin(tick + (cx + y) * 0.01) > 0.7;
                    bgCtx.strokeStyle = glow ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.04)';
                    bgCtx.beginPath();
                    for (let a = 0; a < 6; a++) {
                        const angle = (Math.PI / 3) * a;
                        const px = cx + r * Math.cos(angle);
                        const py = y + r * Math.sin(angle);
                        if (a === 0) bgCtx.moveTo(px, py); else bgCtx.lineTo(px, py);
                    }
                    bgCtx.closePath();
                    bgCtx.stroke();
                }
            }
            bgAnimId = requestAnimationFrame(loopHex);
        }
        loopHex();
    }
    // 7. Синтвейв Закат (Retro Sun)
    else if (type === 'wp_retro_sun') {
        function loopSun() {
            bgCtx.clearRect(0, 0, w, h);
            tick += 0.02;
            const cx = w / 2, cy = h * 0.45, radius = 55;

            // Солнце
            const sunGrad = bgCtx.createLinearGradient(cx, cy - radius, cx, cy + radius);
            sunGrad.addColorStop(0, '#ffd700');
            sunGrad.addColorStop(1, '#ff007f');
            bgCtx.fillStyle = sunGrad;
            bgCtx.beginPath(); bgCtx.arc(cx, cy, radius, 0, Math.PI*2); bgCtx.fill();

            // Полосы на солнце
            bgCtx.fillStyle = '#0d021a';
            for (let y = cy - radius; y < cy + radius; y += 9) {
                const barH = 2 + (y - (cy - radius)) * 0.06;
                bgCtx.fillRect(cx - radius - 5, y, (radius + 5) * 2, barH);
            }
            bgAnimId = requestAnimationFrame(loopSun);
        }
        loopSun();
    }
    // 8. ДНК Спираль
    else if (type === 'wp_dna') {
        function loopDNA() {
            bgCtx.clearRect(0, 0, w, h);
            tick += 0.03;
            for (let y = 0; y < h; y += 22) {
                const off = y * 0.05 + tick;
                const x1 = (w / 2) + Math.sin(off) * 45;
                const x2 = (w / 2) - Math.sin(off) * 45;
                bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                bgCtx.beginPath(); bgCtx.moveTo(x1, y); bgCtx.lineTo(x2, y); bgCtx.stroke();
                bgCtx.fillStyle = '#38bdf8';
                bgCtx.beginPath(); bgCtx.arc(x1, y, 3, 0, Math.PI*2); bgCtx.fill();
                bgCtx.fillStyle = '#c084fc';
                bgCtx.beginPath(); bgCtx.arc(x2, y, 3, 0, Math.PI*2); bgCtx.fill();
            }
            bgAnimId = requestAnimationFrame(loopDNA);
        }
        loopDNA();
    }
    // 9. Северное сияние / Аврора (Плазма)
    else if (type === 'wp_aurora' || type === 'wp_plasma') {
        function loopAurora() {
            bgCtx.clearRect(0, 0, w, h);
            tick += 0.015;
            for (let i = 0; i < 3; i++) {
                const grad = bgCtx.createLinearGradient(0, 0, w, h);
                grad.addColorStop(0, i === 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)');
                grad.addColorStop(1, 'transparent');
                bgCtx.fillStyle = grad;
                bgCtx.beginPath();
                bgCtx.moveTo(0, h * 0.3 + Math.sin(tick + i) * 40);
                bgCtx.bezierCurveTo(w * 0.3, h * 0.1 + Math.cos(tick) * 50, w * 0.7, h * 0.5 + Math.sin(tick) * 40, w, h * 0.2);
                bgCtx.lineTo(w, h); bgCtx.lineTo(0, h);
                bgCtx.fill();
            }
            bgAnimId = requestAnimationFrame(loopAurora);
        }
        loopAurora();
    }
    // Дефолтные неоновые частицы для остальных тем
    else {
        let items = Array.from({length: 40}, () => ({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*3+1, vx: (Math.random()-0.5)*1.2, vy: (Math.random()-0.5)*1.2, color: type.includes('red')?'#ef4444':(type.includes('green')?'#10b981':'#38bdf8') }));
        function loopDefault() {
            bgCtx.clearRect(0, 0, w, h);
            items.forEach(it => {
                it.y += it.vy; it.x += it.vx;
                if (it.y > h) it.y = 0; if (it.y < 0) it.y = h;
                if (it.x > w) it.x = 0; if (it.x < 0) it.x = w;
                bgCtx.fillStyle = it.color;
                bgCtx.globalAlpha = 0.4;
                bgCtx.beginPath(); bgCtx.arc(it.x, it.y, it.r, 0, Math.PI*2); bgCtx.fill();
            });
            bgCtx.globalAlpha = 1;
            bgAnimId = requestAnimationFrame(loopDefault);
        }
        loopDefault();
    }
};
