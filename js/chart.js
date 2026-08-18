// ============================================================
// CHART ENGINE & REPLAY
// ============================================================
let chartData = [];
let chartCanvas, chartCtx;
let replayState = { candles: [], currentIndex: 0, playing: false, interval: null, guess: null, result: 'tp' };

function initChart() {
    chartCanvas = document.getElementById('mainChart');
    chartCtx = chartCanvas.getContext('2d');
    resizeChart();
    chartData = MockData.generateCandles(AppState.chartTimeframe, 60);
    drawChart();
    
    // Chart interactions
    chartCanvas.addEventListener('mousemove', handleChartHover);
    chartCanvas.addEventListener('mouseleave', () => {
        document.getElementById('chartTooltip').classList.add('hidden');
    });
    
    window.addEventListener('resize', () => {
        resizeChart();
        drawChart();
    });
}

function resizeChart() {
    const container = chartCanvas.parentElement;
    chartCanvas.width = container.clientWidth;
    chartCanvas.height = container.clientHeight;
}

function drawChart() {
    if (!chartCtx || chartData.length === 0) return;
    
    const w = chartCanvas.width;
    const h = chartCanvas.height;
    const padding = { top: 20, right: 60, bottom: 30, left: 10 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    
    chartCtx.clearRect(0, 0, w, h);
    
    // Background
    chartCtx.fillStyle = '#0a0d14';
    chartCtx.fillRect(0, 0, w, h);
    
    const visibleData = chartData.slice(Math.max(0, chartData.length - 40 - AppState.chartOffset));
    if (visibleData.length === 0) return;
    
    // Calculate price range
    let minPrice = Infinity, maxPrice = -Infinity;
    visibleData.forEach(c => {
        minPrice = Math.min(minPrice, c.low);
        maxPrice = Math.max(maxPrice, c.high);
    });
    const priceRange = maxPrice - minPrice;
    minPrice -= priceRange * 0.1;
    maxPrice += priceRange * 0.1;
    
    const candleWidth = chartW / visibleData.length;
    const bodyWidth = candleWidth * 0.6;
    
    // Grid lines
    chartCtx.strokeStyle = '#1a1f2e';
    chartCtx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartH / 5) * i;
        chartCtx.beginPath();
        chartCtx.moveTo(padding.left, y);
        chartCtx.lineTo(w - padding.right, y);
        chartCtx.stroke();
        
        // Price labels
        const price = maxPrice - ((maxPrice - minPrice) / 5) * i;
        chartCtx.fillStyle = '#6B7280';
        chartCtx.font = '10px monospace';
        chartCtx.textAlign = 'left';
        chartCtx.fillText(price.toFixed(2), w - padding.right + 5, y + 3);
    }
    
    // EMA21
    const ema21 = calculateEMA(visibleData.map(c => c.close), 21);
    chartCtx.strokeStyle = '#FBBF24';
    chartCtx.lineWidth = 1.5;
    chartCtx.beginPath();
    ema21.forEach((val, i) => {
        if (val === null) return;
        const x = padding.left + i * candleWidth + candleWidth / 2;
        const y = padding.top + ((maxPrice - val) / (maxPrice - minPrice)) * chartH;
        if (i === 0 || ema21[i-1] === null) chartCtx.moveTo(x, y);
        else chartCtx.lineTo(x, y);
    });
    chartCtx.stroke();
    
    // EMA50
    const ema50 = calculateEMA(visibleData.map(c => c.close), Math.min(50, visibleData.length));
    chartCtx.strokeStyle = '#60A5FA';
    chartCtx.lineWidth = 1.5;
    chartCtx.beginPath();
    ema50.forEach((val, i) => {
        if (val === null) return;
        const x = padding.left + i * candleWidth + candleWidth / 2;
        const y = padding.top + ((maxPrice - val) / (maxPrice - minPrice)) * chartH;
        if (i === 0 || ema50[i-1] === null) chartCtx.moveTo(x, y);
        else chartCtx.lineTo(x, y);
    });
    chartCtx.stroke();
    
    // Candles
    visibleData.forEach((candle, i) => {
        const x = padding.left + i * candleWidth + candleWidth / 2;
        const isGreen = candle.close >= candle.open;
        
        // Wick
        chartCtx.strokeStyle = isGreen ? '#22C55E' : '#F43F5E';
        chartCtx.lineWidth = 1;
        chartCtx.beginPath();
        const highY = padding.top + ((maxPrice - candle.high) / (maxPrice - minPrice)) * chartH;
        const lowY = padding.top + ((maxPrice - candle.low) / (maxPrice - minPrice)) * chartH;
        chartCtx.moveTo(x, highY);
        chartCtx.lineTo(x, lowY);
        chartCtx.stroke();
        
        // Body
        const openY = padding.top + ((maxPrice - candle.open) / (maxPrice - minPrice)) * chartH;
        const closeY = padding.top + ((maxPrice - candle.close) / (maxPrice - minPrice)) * chartH;
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
        
        chartCtx.fillStyle = isGreen ? '#22C55E' : '#F43F5E';
        chartCtx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
    });
    
    // Volume bars
    const maxVol = Math.max(...visibleData.map(c => c.volume));
    visibleData.forEach((candle, i) => {
        const x = padding.left + i * candleWidth + candleWidth / 2;
        const volHeight = (candle.volume / maxVol) * 30;
        const isGreen = candle.close >= candle.open;
        chartCtx.fillStyle = isGreen ? 'rgba(34,197,94,0.2)' : 'rgba(244,63,94,0.2)';
        chartCtx.fillRect(x - bodyWidth / 2, h - padding.bottom - volHeight, bodyWidth, volHeight);
    });
    
    // Signal marker (last candle)
    const lastCandle = visibleData[visibleData.length - 1];
    const lastX = padding.left + (visibleData.length - 1) * candleWidth + candleWidth / 2;
    const signalY = padding.top + ((maxPrice - lastCandle.close) / (maxPrice - minPrice)) * chartH;
    
    // Buy/Sell marker
    chartCtx.fillStyle = '#22C55E';
    chartCtx.beginPath();
    chartCtx.moveTo(lastX, signalY + 15);
    chartCtx.lineTo(lastX - 5, signalY + 22);
    chartCtx.lineTo(lastX + 5, signalY + 22);
    chartCtx.closePath();
    chartCtx.fill();
    
    // SL/TP lines
    if (AppState.currentTrade) {
        const trade = AppState.currentTrade;
        drawHorizontalLine(chartCtx, trade.entry, minPrice, maxPrice, padding, chartH, w, '#F0B90B', 'Entry');
        drawHorizontalLine(chartCtx, trade.sl, minPrice, maxPrice, padding, chartH, w, '#F43F5E', 'SL');
        drawHorizontalLine(chartCtx, trade.tp, minPrice, maxPrice, padding, chartH, w, '#22C55E', 'TP');
    }
    
    // Current price line
    const currentPriceY = padding.top + ((maxPrice - AppState.currentPrice) / (maxPrice - minPrice)) * chartH;
    chartCtx.setLineDash([4, 4]);
    chartCtx.strokeStyle = '#F0B90B';
    chartCtx.lineWidth = 1;
    chartCtx.beginPath();
    chartCtx.moveTo(padding.left, currentPriceY);
    chartCtx.lineTo(w - padding.right, currentPriceY);
    chartCtx.stroke();
    chartCtx.setLineDash([]);
    
    // Price label
    chartCtx.fillStyle = '#F0B90B';
    chartCtx.fillRect(w - padding.right, currentPriceY - 8, 55, 16);
    chartCtx.fillStyle = '#000';
    chartCtx.font = 'bold 9px monospace';
    chartCtx.textAlign = 'left';
    chartCtx.fillText(AppState.currentPrice.toFixed(2), w - padding.right + 3, currentPriceY + 3);
}

function drawHorizontalLine(ctx, price, minP, maxP, padding, chartH, w, color, label) {
    const y = padding.top + ((maxP - price) / (maxP - minP)) * chartH;
    if (y < padding.top || y > padding.top + chartH) return;
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(w - padding.right, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = color;
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${label}: ${price.toFixed(2)}`, w - padding.right - 5, y - 4);
}

function calculateEMA(data, period) {
    const ema = [];
    const multiplier = 2 / (period + 1);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            sum += data[i];
            ema.push(null);
        } else if (i === period - 1) {
            sum += data[i];
            ema.push(sum / period);
        } else {
            ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
        }
    }
    return ema;
}

function handleChartHover(e) {
    const rect = chartCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const padding = { left: 10, right: 60, top: 20, bottom: 30 };
    const chartW = chartCanvas.width - padding.left - padding.right;
    const visibleData = chartData.slice(Math.max(0, chartData.length - 40 - AppState.chartOffset));
    const candleWidth = chartW / visibleData.length;
    
    const candleIndex = Math.floor((x - padding.left) / candleWidth);
    if (candleIndex >= 0 && candleIndex < visibleData.length) {
        const candle = visibleData[candleIndex];
        const tooltip = document.getElementById('chartTooltip');
        tooltip.classList.remove('hidden');
        tooltip.innerHTML = `
            <div class="text-[10px] space-y-0.5">
                <div>O: <span class="font-mono">${candle.open.toFixed(2)}</span></div>
                <div>H: <span class="font-mono">${candle.high.toFixed(2)}</span></div>
                <div>L: <span class="font-mono">${candle.low.toFixed(2)}</span></div>
                <div>C: <span class="font-mono">${candle.close.toFixed(2)}</span></div>
                <div>Vol: <span class="font-mono">${candle.volume}</span></div>
            </div>
        `;
        tooltip.style.left = Math.min(x + 10, chartCanvas.width - 120) + 'px';
        tooltip.style.top = Math.max(y - 60, 5) + 'px';
    }
}

function switchTimeframe(tf) {
    AppState.chartTimeframe = tf;
    AppState.chartOffset = 0;
    document.querySelectorAll('.tf-btn').forEach(btn => {
        btn.className = 'tf-btn px-3 py-1 text-xs rounded-md bg-card-secondary border border-border-primary text-gray-400 hover:text-gold hover:border-gold transition-all';
    });
    document.getElementById(`tf-${tf}`).className = 'tf-btn px-3 py-1 text-xs rounded-md bg-gold/10 border border-gold/30 text-gold transition-all';
    chartData = MockData.generateCandles(tf, 60);
    drawChart();
}

function chartScrollLeft() {
    AppState.chartOffset = Math.min(AppState.chartOffset + 5, chartData.length - 10);
    drawChart();
}

function chartGoLatest() {
    AppState.chartOffset = 0;
    drawChart();
}

function drawEquityCurve(data) {
    const canvas = document.getElementById('equityCurve');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    const w = canvas.width;
    const h = canvas.height;
    const padding = { top: 10, right: 50, bottom: 20, left: 10 };
    
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, w, h);
    
    if (!data || data.length === 0) return;
    
    const minVal = Math.min(...data) * 0.99;
    const maxVal = Math.max(...data) * 1.01;
    const range = maxVal - minVal;
    
    const stepX = (w - padding.left - padding.right) / (data.length - 1);
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, 'rgba(34,197,94,0.2)');
    gradient.addColorStop(1, 'rgba(34,197,94,0)');
    
    ctx.beginPath();
    ctx.moveTo(padding.left, h - padding.bottom);
    data.forEach((val, i) => {
        const x = padding.left + i * stepX;
        const y = padding.top + ((maxVal - val) / range) * (h - padding.top - padding.bottom);
        ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + (data.length - 1) * stepX, h - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.beginPath();
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 2;
    data.forEach((val, i) => {
        const x = padding.left + i * stepX;
        const y = padding.top + ((maxVal - val) / range) * (h - padding.top - padding.bottom);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    ctx.fillStyle = '#6B7280';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('$' + maxVal.toFixed(0), w - padding.right + 5, padding.top + 10);
    ctx.fillText('$' + minVal.toFixed(0), w - padding.right + 5, h - padding.bottom - 5);
}

// Replay functions (initReplayChart, drawReplayChart, replayStep, etc.) are kept identical
function initReplayChart() {
    const canvas = document.getElementById('replayCanvas');
    if (!canvas) return;
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    replayState.candles = MockData.generateCandles('M5', 30);
    replayState.currentIndex = 15;
    replayState.result = Math.random() > 0.4 ? 'tp' : 'sl';
    drawReplayChart();
}

function drawReplayChart() {
    const canvas = document.getElementById('replayCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, w, h);
    
    const visible = replayState.candles.slice(0, replayState.currentIndex + 1);
    if (visible.length === 0) return;
    
    const padding = { top: 10, right: 40, bottom: 15, left: 5 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    
    let minP = Infinity, maxP = -Infinity;
    visible.forEach(c => { minP = Math.min(minP, c.low); maxP = Math.max(maxP, c.high); });
    const range = maxP - minP || 1;
    minP -= range * 0.1;
    maxP += range * 0.1;
    
    const candleW = chartW / Math.max(visible.length, 1);
    
    visible.forEach((candle, i) => {
        const x = padding.left + i * candleW + candleW / 2;
        const isGreen = candle.close >= candle.open;
        ctx.strokeStyle = isGreen ? '#22C55E' : '#F43F5E';
        ctx.lineWidth = 1;
        const highY = padding.top + ((maxP - candle.high) / (maxP - minP)) * chartH;
        const lowY = padding.top + ((maxP - candle.low) / (maxP - minP)) * chartH;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();
        
        const openY = padding.top + ((maxP - candle.open) / (maxP - minP)) * chartH;
        const closeY = padding.top + ((maxP - candle.close) / (maxP - minP)) * chartH;
        ctx.fillStyle = isGreen ? '#22C55E' : '#F43F5E';
        ctx.fillRect(x - candleW * 0.3, Math.min(openY, closeY), candleW * 0.6, Math.max(Math.abs(closeY - openY), 1));
    });
}

function replayStep() {
    if (replayState.currentIndex < replayState.candles.length - 1) {
        replayState.currentIndex++;
        drawReplayChart();
    } else {
        showReplayResult();
    }
}

function replayPlay() {
    if (replayState.playing) {
        clearInterval(replayState.interval);
        replayState.playing = false;
        document.getElementById('replayPlayBtn').textContent = '▶ تشغيل';
        return;
    }
    replayState.playing = true;
    document.getElementById('replayPlayBtn').textContent = '⏸ إيقاف';
    replayState.interval = setInterval(() => {
        if (replayState.currentIndex < replayState.candles.length - 1) {
            replayState.currentIndex++;
            drawReplayChart();
        } else {
            clearInterval(replayState.interval);
            replayState.playing = false;
            document.getElementById('replayPlayBtn').textContent = '▶ تشغيل';
            showReplayResult();
        }
    }, 500);
}

function replayReset() {
    clearInterval(replayState.interval);
    replayState.playing = false;
    replayState.currentIndex = 15;
    replayState.guess = null;
    document.getElementById('replayPlayBtn').textContent = '▶ تشغيل';
    document.getElementById('replayResult').classList.add('hidden');
    drawReplayChart();
}

function replayGuess(guess) {
    replayState.guess = guess;
    replayState.currentIndex = replayState.candles.length - 1;
    drawReplayChart();
    showReplayResult();
}

function showReplayResult() {
    const resultEl = document.getElementById('replayResult');
    if (!resultEl) return;
    resultEl.classList.remove('hidden');
    
    if (replayState.guess) {
        const correct = replayState.guess === replayState.result;
        resultEl.innerHTML = correct 
            ? '<span class="text-profit font-bold">✓ توقعك صحيح! 🎯</span>'
            : '<span class="text-loss font-bold">✗ توقعك خاطئ</span>';
    } else {
        resultEl.innerHTML = `<span class="text-gold">النتيجة: ${replayState.result === 'tp' ? '🎯 وصل للهدف' : '🛑 ضرب الوقف'}</span>`;
    }
}
