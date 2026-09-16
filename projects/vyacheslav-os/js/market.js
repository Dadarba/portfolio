// =========================================================
// ВЯЧЕСЛАВ OS: КИБЕР-БИРЖА (БАНКИ, БЕНЗИН, IT, БИО, МАРЖА)
// =========================================================

(function() {
    const ASSETS = {
        'BANK': { name: 'СберКибер Банк', symbol: '$BANK', sector: 'banks', price: 420, prevPrice: 420, history: [], min: 80, max: 3200, color: '#10b981', desc: 'Банковский сектор. Стабильные дивиденды.' },
        'GAS': { name: 'Неоновый Бензин & Нефть', symbol: '$GAS', sector: 'energy', price: 180, prevPrice: 180, history: [], min: 30, max: 1900, color: '#f59e0b', desc: 'Топливный синдикат. Высокая волатильность.' },
        'VOS': { name: 'Vyacheslav OS Tech', symbol: '$VOS', sector: 'tech', price: 310, prevPrice: 310, history: [], min: 50, max: 2800, color: '#38bdf8', desc: 'Флагманский технологический сектор OS.' },
        'BIO': { name: 'Нейро-Фарма & Импланты', symbol: '$BIO', sector: 'bio', price: 95, prevPrice: 95, history: [], min: 15, max: 850, color: '#ec4899', desc: 'Био-модули и нано-аугментации.' },
        'MINE': { name: 'Квантовая Руда', symbol: '$MINE', sector: 'energy', price: 35, prevPrice: 35, history: [], min: 5, max: 320, color: '#c084fc', desc: 'Добыча редких кристаллов.' }
    };

    let activeSymbol = 'BANK';
    let currentFilter = 'all';
    let chartType = 'candles';
    let leverage = 1;
    let portfolio = JSON.parse(localStorage.getItem('v_crypto_portfolio') || '{}');
    let openPositions = JSON.parse(localStorage.getItem('v_crypto_positions') || '[]');

    for (let sym in ASSETS) {
        const a = ASSETS[sym];
        let p = a.price;
        for (let i = 0; i < 24; i++) {
            const open = p;
            const delta = (Math.random() - 0.48) * (p * 0.07);
            const close = Math.max(a.min, Math.min(a.max, Math.round(open + delta)));
            const high = Math.round(Math.max(open, close) + Math.random() * (p * 0.025));
            const low = Math.round(Math.min(open, close) - Math.random() * (p * 0.025));
            a.history.push({ open, close, high, low });
            p = close;
        }
        a.price = a.history[a.history.length - 1].close;
        a.prevPrice = a.history[a.history.length - 2]?.close || a.price;
    }

    function savePortfolio() {
        localStorage.setItem('v_crypto_portfolio', JSON.stringify(portfolio));
        localStorage.setItem('v_crypto_positions', JSON.stringify(openPositions));
    }

    window.filterMarketSector = function(sector) {
        currentFilter = sector;
        document.querySelectorAll('.m-sector-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById('msec-' + sector);
        if (btn) btn.classList.add('active');
        renderAssetSelectorButtons();
    };

    function renderAssetSelectorButtons() {
        const wrap = document.getElementById('market-assets-tabs');
        if (!wrap) return;

        const filtered = Object.keys(ASSETS).filter(k => currentFilter === 'all' || ASSETS[k].sector === currentFilter);
        if (!filtered.includes(activeSymbol)) activeSymbol = filtered[0] || 'BANK';

        wrap.innerHTML = filtered.map(sym => {
            const a = ASSETS[sym];
            const isCur = activeSymbol === sym;
            return `
                <button class="p-btn market-tab-btn ${isCur ? 'active' : ''}" id="mtab-${sym}" 
                    style="flex:1; min-width:68px; padding:6px 2px; font-size:11px; color:${a.color}; border-color:${isCur ? a.color : 'var(--border)'};" 
                    onclick="selectMarketAsset('${sym}')">
                    ${a.symbol}
                </button>
            `;
        }).join('');
    }

    window.toggleMarketProMode = function(enable) {
        const terminal = document.getElementById('market-pro-terminal');
        if (!terminal) return;
        terminal.style.display = enable ? 'flex' : 'none';
        document.body.style.overflow = enable ? 'hidden' : '';
        if (enable) {
            window.renderMarketProChart();
            renderOrderBook();
            renderPositionsList();
        } else {
            window.renderMarketChart();
        }
    };

    window.setMarketChartType = function(type) {
        chartType = type;
        document.querySelectorAll('.m-chart-type-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById('btn-chart-' + type);
        if (btn) btn.classList.add('active');
        window.renderMarketProChart();
        window.renderMarketChart();
    };

    window.setMarketLeverage = function(lev) {
        leverage = lev;
        document.querySelectorAll('.m-lev-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById('btn-lev-' + lev);
        if (btn) btn.classList.add('active');
        if (window.notify) window.notify(`Плечо: <b>x${lev}</b>!`);
    };

    window.renderMarketProChart = function() {
        const cv = document.getElementById('market-pro-canvas');
        if (!cv) return;
        const ctx = cv.getContext('2d');
        const w = cv.width;
        const h = cv.height;
        ctx.clearRect(0, 0, w, h);

        const asset = ASSETS[activeSymbol];
        const data = asset.history;
        if (!data || data.length < 2) return;

        let allP = [];
        data.forEach(c => allP.push(c.high, c.low));
        const minVal = Math.min(...allP) * 0.96;
        const maxVal = Math.max(...allP) * 1.04;
        const range = maxVal - minVal || 1;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let y = 20; y < h; y += 35) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        const stepX = w / data.length;

        if (chartType === 'candles') {
            data.forEach((c, i) => {
                const x = i * stepX + stepX * 0.2;
                const candleW = Math.max(3, stepX * 0.6);
                const yOpen = h - ((c.open - minVal) / range) * (h - 30) - 15;
                const yClose = h - ((c.close - minVal) / range) * (h - 30) - 15;
                const yHigh = h - ((c.high - minVal) / range) * (h - 30) - 15;
                const yLow = h - ((c.low - minVal) / range) * (h - 30) - 15;

                const color = (c.close >= c.open) ? '#10b981' : '#ef4444';
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x + candleW / 2, yHigh);
                ctx.lineTo(x + candleW / 2, yLow);
                ctx.stroke();

                ctx.fillStyle = color;
                ctx.fillRect(x, Math.min(yOpen, yClose), candleW, Math.max(2, Math.abs(yClose - yOpen)));
            });
        } else {
            ctx.beginPath();
            data.forEach((c, i) => {
                const x = i * stepX + stepX / 2;
                const y = h - ((c.close - minVal) / range) * (h - 30) - 15;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.strokeStyle = asset.color;
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }
    };

    window.renderMarketChart = function() {
        const cv = document.getElementById('market-canvas-chart');
        if (!cv) return;
        const ctx = cv.getContext('2d');
        const w = cv.width;
        const h = cv.height;
        ctx.clearRect(0, 0, w, h);

        const asset = ASSETS[activeSymbol];
        const data = asset.history;
        if (!data || data.length < 2) return;

        const prices = data.map(d => d.close);
        const minVal = Math.min(...prices) * 0.96;
        const maxVal = Math.max(...prices) * 1.04;
        const range = maxVal - minVal || 1;

        const stepX = w / (prices.length - 1);
        ctx.beginPath();
        prices.forEach((val, i) => {
            const x = i * stepX;
            const y = h - ((val - minVal) / range) * (h - 20) - 10;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, asset.color + '33');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        prices.forEach((val, i) => {
            const x = i * stepX;
            const y = h - ((val - minVal) / range) * (h - 20) - 10;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = asset.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    function renderOrderBook() {
        const bookEl = document.getElementById('market-order-book');
        if (!bookEl) return;
        const p = ASSETS[activeSymbol].price;

        let html = '<div style="font-size:10px; font-weight:700; color:var(--text-dim); margin-bottom:4px;">СТАКАН ЗАЯВОК</div>';
        for (let i = 3; i >= 1; i--) {
            const askP = Math.round(p + i * (p * 0.008));
            html += `<div style="display:flex; justify-content:space-between; font-size:10px; color:#ef4444;"><span>${askP} 🪙</span><span>${Math.floor(10 + Math.random()*35)} шт</span></div>`;
        }
        html += `<div style="text-align:center; font-weight:900; font-size:12px; color:var(--accent); padding:2px 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border);">${p} 🪙</div>`;
        for (let i = 1; i <= 3; i++) {
            const bidP = Math.round(p - i * (p * 0.008));
            html += `<div style="display:flex; justify-content:space-between; font-size:10px; color:#10b981;"><span>${bidP} 🪙</span><span>${Math.floor(12 + Math.random()*40)} шт</span></div>`;
        }
        bookEl.innerHTML = html;
    }

    window.openMarginPosition = function(side) {
        const asset = ASSETS[activeSymbol];
        const userCoins = window.globalCoins || 0;
        const cost = 100;
        if (userCoins < cost) {
            if (window.notify) window.notify("❌ Требуется минимум 100 🪙 залога!");
            return;
        }
        if (window.addCoins) window.addCoins(-cost);
        openPositions.push({
            id: Date.now(),
            symbol: activeSymbol,
            side: side,
            entryPrice: asset.price,
            margin: cost,
            leverage: leverage
        });
        savePortfolio();
        renderPositionsList();
        if (window.notify) window.notify(`Позиция <b>${side.toUpperCase()} ${asset.symbol} x${leverage}</b> открыта!`);
    };

    window.closeMarginPosition = function(id) {
        const idx = openPositions.findIndex(x => x.id === id);
        if (idx === -1) return;
        const pos = openPositions[idx];
        const curPrice = ASSETS[pos.symbol].price;
        const diffPct = (curPrice - pos.entryPrice) / pos.entryPrice;
        const pnlPct = (pos.side === 'long' ? diffPct : -diffPct) * pos.leverage;
        const returnAmount = Math.max(0, Math.round(pos.margin * (1 + pnlPct)));

        openPositions.splice(idx, 1);
        savePortfolio();
        if (window.addCoins) window.addCoins(returnAmount);
        renderPositionsList();
        const profit = returnAmount - pos.margin;
        if (window.notify) window.notify(`Позиция закрыта! ${profit >= 0 ? '+' : ''}${profit} 🪙`);
    };

    function renderPositionsList() {
        const wrap = document.getElementById('market-positions-wrap');
        if (!wrap) return;
        if (openPositions.length === 0) {
            wrap.innerHTML = '<div style="font-size:10px; color:var(--text-dim); text-align:center; padding:6px;">Нет открытых сделок</div>';
            return;
        }
        wrap.innerHTML = openPositions.map(pos => {
            const curP = ASSETS[pos.symbol].price;
            const diffPct = (curP - pos.entryPrice) / pos.entryPrice;
            const pnlPct = (pos.side === 'long' ? diffPct : -diffPct) * pos.leverage;
            const pnlCoins = Math.round(pos.margin * pnlPct);
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:8px; padding:6px 8px; margin-bottom:4px; font-size:10px;">
                    <div>
                        <b style="color:${pos.side === 'long' ? '#10b981' : '#ef4444'};">${pos.side.toUpperCase()} ${pos.symbol} x${pos.leverage}</b>
                        <div style="color:var(--text-dim);">Вход: ${pos.entryPrice} 🪙 | Сейчас: ${curP} 🪙</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:900; color:${pnlCoins >= 0 ? '#10b981' : '#ef4444'};">${pnlCoins >= 0 ? '+' : ''}${pnlCoins} 🪙</div>
                        <button class="p-btn" style="padding:2px 6px; font-size:9px;" onclick="closeMarginPosition(${pos.id})">Закрыть</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.updateMarketUI = function() {
        const asset = ASSETS[activeSymbol];
        ['market-cur-price', 'market-pro-price'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = `${asset.price} 🪙`;
        });
        const titleEl = document.getElementById('market-asset-name');
        const proTitle = document.getElementById('market-pro-symbol');
        const descEl = document.getElementById('market-asset-desc');
        if (titleEl) titleEl.innerText = `${asset.name} (${asset.symbol})`;
        if (proTitle) proTitle.innerText = `${asset.name} (${asset.symbol})`;
        if (descEl) descEl.innerText = asset.desc;

        const ownedEl = document.getElementById('market-owned-amount');
        if (ownedEl) ownedEl.innerText = `${portfolio[activeSymbol] || 0} шт.`;

        const totalValEl = document.getElementById('market-total-val');
        if (totalValEl) {
            let total = 0;
            for (let s in portfolio) total += (portfolio[s] || 0) * (ASSETS[s]?.price || 0);
            totalValEl.innerText = `${total} 🪙`;
        }

        window.renderMarketChart();
        window.renderMarketProChart();
        renderOrderBook();
        renderPositionsList();
    };

    window.selectMarketAsset = function(sym) {
        if (!ASSETS[sym]) return;
        activeSymbol = sym;
        renderAssetSelectorButtons();
        window.updateMarketUI();
    };

    window.buyCrypto = function(amt) {
        const asset = ASSETS[activeSymbol];
        const userCoins = window.globalCoins || 0;
        let buyCount = (amt === 'max') ? Math.floor(userCoins / asset.price) : amt;
        if (!buyCount || buyCount <= 0 || userCoins < buyCount * asset.price) {
            if (window.notify) window.notify("❌ Недостаточно монет!");
            return;
        }
        const cost = buyCount * asset.price;
        if (window.addCoins) window.addCoins(-cost);
        portfolio[activeSymbol] = (portfolio[activeSymbol] || 0) + buyCount;
        savePortfolio();
        window.updateMarketUI();
        if (window.notify) window.notify(`Куплено: <b>+${buyCount} ${asset.symbol}</b>!`);
    };

    window.sellCrypto = function(amt) {
        const asset = ASSETS[activeSymbol];
        const owned = portfolio[activeSymbol] || 0;
        let sellCount = (amt === 'all') ? owned : amt;
        if (!sellCount || sellCount <= 0 || owned < sellCount) {
            if (window.notify) window.notify("Нечего продавать!");
            return;
        }
        const gain = sellCount * asset.price;
        portfolio[activeSymbol] -= sellCount;
        savePortfolio();
        if (window.addCoins) window.addCoins(gain);
        window.updateMarketUI();
        if (window.notify) window.notify(`Продано: <b>${sellCount} ${asset.symbol}</b> (+${gain} 🪙)!`);
    };

    window.adminPumpStock = function(sym, factor) {
        if (!ASSETS[sym]) return;
        const oldP = ASSETS[sym].price;
        ASSETS[sym].price = Math.max(ASSETS[sym].min, Math.min(ASSETS[sym].max, Math.round(oldP * factor)));
        ASSETS[sym].history.push({ open: oldP, close: ASSETS[sym].price, high: Math.max(oldP, ASSETS[sym].price), low: Math.min(oldP, ASSETS[sym].price) });
        window.updateMarketUI();
        if (window.notify) window.notify(`⚡ <b>АДМИН-МАНИПУЛЯЦИЯ:</b> ${sym} изменен на ${factor > 1 ? '+' : ''}${Math.round((factor-1)*100)}%!`);
    };

    window.adminSetStockPrice = function(sym, val) {
        if (!ASSETS[sym] || !val) return;
        ASSETS[sym].price = parseInt(val, 10);
        ASSETS[sym].history.push({ open: val, close: val, high: val, low: val });
        window.updateMarketUI();
        if (window.notify) window.notify(`Цена ${sym} = ${val} 🪙`);
    };

    setInterval(() => {
        for (let sym in ASSETS) {
            const a = ASSETS[sym];
            a.prevPrice = a.price;
            const delta = (Math.random() - 0.49) * (a.price * 0.05);
            const newClose = Math.max(a.min, Math.min(a.max, Math.round(a.price + delta)));
            const high = Math.round(Math.max(a.price, newClose) + Math.random() * (a.price * 0.02));
            const low = Math.round(Math.min(a.price, newClose) - Math.random() * (a.price * 0.02));

            a.history.push({ open: a.price, close: newClose, high, low });
            if (a.history.length > 28) a.history.shift();
            a.price = newClose;
        }

        const tab = document.getElementById('tab-market');
        const term = document.getElementById('market-pro-terminal');
        if ((tab && tab.classList.contains('active')) || (term && term.style.display !== 'none')) {
            window.updateMarketUI();
        }
    }, 3500);

    window.initMarket = function() {
        renderAssetSelectorButtons();
        window.updateMarketUI();
    };
})();
