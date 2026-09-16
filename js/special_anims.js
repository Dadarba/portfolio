// =========================================================
// ВЯЧЕСЛАВ OS: НЕПРЕРЫВНЫЕ СПЕЦ-АНИМАЦИИ (LOOP EFFECTS)
// =========================================================

(function() {
    const activeEffects = new Set();
    let animFrameId = null;
    let canvas = null;
    let ctx = null;

    let stars = [];
    let matrixDrops = [];
    let embers = [];

    function initCanvas() {
        canvas = document.getElementById('special-fx-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
    }

    function resize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }

    function initParticles() {
        if (!canvas) return;
        const w = canvas.width;
        const h = canvas.height;

        stars = [];
        for (let i = 0; i < 140; i++) {
            stars.push({
                x: (Math.random() - 0.5) * w * 2,
                y: (Math.random() - 0.5) * h * 2,
                z: Math.random() * w
            });
        }

        const columns = Math.floor(w / 18);
        matrixDrops = [];
        for (let i = 0; i < columns; i++) {
            matrixDrops[i] = Math.floor(Math.random() * -50);
        }

        embers = [];
        for (let i = 0; i < 45; i++) {
            embers.push({
                x: Math.random() * w,
                y: h + Math.random() * 80,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -(1.5 + Math.random() * 2.5),
                size: 2 + Math.random() * 3.5,
                alpha: 0.4 + Math.random() * 0.6
            });
        }
    }

    function renderLoop() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height;

        if (activeEffects.has('warp')) {
            ctx.fillStyle = '#ffffff';
            const cx = w / 2;
            const cy = h / 2;

            stars.forEach(s => {
                s.z -= 16;
                if (s.z <= 0) {
                    s.z = w;
                    s.x = (Math.random() - 0.5) * w * 2;
                    s.y = (Math.random() - 0.5) * h * 2;
                }
                const k = 140 / s.z;
                const px = s.x * k + cx;
                const py = s.y * k + cy;

                if (px >= 0 && px <= w && py >= 0 && py <= h) {
                    const size = Math.max(1, (1 - s.z / w) * 3.5);
                    ctx.beginPath();
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        if (activeEffects.has('matrix')) {
            ctx.fillStyle = '#10b981';
            ctx.font = '14px monospace';
            const chars = '0123456789ABCDEF$#@%&*';

            matrixDrops.forEach((y, i) => {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i * 18;
                ctx.fillText(char, x, y * 18);

                if (y * 18 > h && Math.random() > 0.975) {
                    matrixDrops[i] = 0;
                }
                matrixDrops[i]++;
            });
        }

        if (activeEffects.has('embers')) {
            embers.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.y < -10) {
                    p.y = h + 10;
                    p.x = Math.random() * w;
                }
                ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        const hasCanvasFx = activeEffects.has('warp') || activeEffects.has('matrix') || activeEffects.has('embers');
        if (hasCanvasFx) {
            animFrameId = requestAnimationFrame(renderLoop);
        } else {
            canvas.style.display = 'none';
            animFrameId = null;
        }
    }

    function updateHudPill() {
        const pill = document.getElementById('fx-active-hud-pill');
        const txt = document.getElementById('fx-active-hud-txt');
        if (!pill) return;

        if (activeEffects.size > 0) {
            pill.style.display = 'flex';
            if (txt) txt.innerText = `🌀 Активно эффектов: ${activeEffects.size} [Стоп ⏹]`;
        } else {
            pill.style.display = 'none';
        }

        document.querySelectorAll('.anim-toggle-btn').forEach(btn => {
            const id = btn.getAttribute('data-anim-id');
            const isActive = activeEffects.has(id);
            btn.classList.toggle('active', isActive);
            btn.style.boxShadow = isActive ? '0 0 12px var(--accent)' : '';
        });
    }

    window.toggleSpecialAnimation = function(name) {
        if (!canvas) initCanvas();

        const cssFx = {
            'crt': 'anim-crt',
            'zerog': 'anim-zerog',
            'rainbow': 'anim-rainbow-border'
        };

        if (activeEffects.has(name)) {
            activeEffects.delete(name);
            if (cssFx[name]) document.body.classList.remove(cssFx[name]);
            if (window.notify) window.notify(`Эффект <b>${name}</b> выключен ⏹`);
        } else {
            activeEffects.add(name);
            if (cssFx[name]) document.body.classList.add(cssFx[name]);
            if (window.notify) window.notify(`⚡ Эффект <b>${name}</b> активирован!`);
        }

        const hasCanvasFx = activeEffects.has('warp') || activeEffects.has('matrix') || activeEffects.has('embers');
        if (hasCanvasFx) {
            if (canvas) canvas.style.display = 'block';
            if (!animFrameId) {
                initParticles();
                renderLoop();
            }
        }

        updateHudPill();
    };

    window.stopAllSpecialAnimations = function() {
        activeEffects.clear();
        document.body.classList.remove('anim-crt', 'anim-zerog', 'anim-rainbow-border');
        
        const canvas = document.getElementById('special-fx-canvas');
        if (canvas) {
            canvas.style.display = 'none';
            const c = canvas.getContext('2d');
            if (c) c.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }

        const pill = document.getElementById('fx-active-hud-pill');
        if (pill) pill.style.display = 'none';

        document.querySelectorAll('.anim-toggle-btn').forEach(b => {
            b.classList.remove('active');
            b.style.boxShadow = '';
        });

        if (window.notify) window.notify("⏹ Все спец-анимации остановлены!");
    };

    document.addEventListener('DOMContentLoaded', initCanvas);
})();
