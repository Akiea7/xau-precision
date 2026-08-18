// ============================================================
// UI UPDATES & EVENT HANDLERS
// ============================================================
function updatePriceUI() {
    document.getElementById('headerPrice').textContent = `$${AppState.currentPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    const changeEl = document.getElementById('headerChange');
    if (AppState.priceChange >= 0) {
        changeEl.textContent = `+${AppState.priceChange.toFixed(2)}%`;
        changeEl.className = 'text-xs text-profit';
    } else {
        changeEl.textContent = `${AppState.priceChange.toFixed(2)}%`;
        changeEl.className = 'text-xs text-loss';
    }
}

function updateConnectionUI() {
    const el = document.getElementById('headerConnection');
    switch (AppState.connectionStatus) {
        case 'connected':
            el.innerHTML = '<span class="w-2 h-2 rounded-full bg-profit"></span><span class="text-profit">متصل</span>';
            break;
        case 'connecting':
            el.innerHTML = '<span class="w-2 h-2 rounded-full bg-gold pulse-gold"></span><span class="text-gold">جاري الاتصال</span>';
            break;
        default:
            el.innerHTML = '<span class="w-2 h-2 rounded-full bg-loss"></span><span class="text-loss">غير متصل</span>';
    }
}

function updateTime() {
    const now = new Date();
    document.getElementById('headerTime').textContent = now.toLocaleTimeString('en-US', { hour12: false });
}

function switchTab(tabName) {
    AppState.currentTab = tabName;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    const tabEl = document.getElementById(`tab-${tabName}`);
    if (tabEl) {
        tabEl.classList.remove('hidden');
        tabEl.classList.add('fade-in');
    }
    
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.remove('tab-active');
        btn.classList.add('text-gray-400');
    });
    const activeBtn = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('tab-active');
        activeBtn.classList.remove('text-gray-400');
    }
    
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        btn.classList.remove('text-gold');
        btn.classList.add('text-gray-500');
    });
    const mobileBtn = document.querySelector(`.mobile-nav-btn[data-tab="${tabName}"]`);
    if (mobileBtn) {
        mobileBtn.classList.add('text-gold');
        mobileBtn.classList.remove('text-gray-500');
    }
    
    if (tabName === 'live') {
        setTimeout(() => { resizeChart(); drawChart(); }, 50);
    }
}

// Toasts
function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const icons = { success: '✔', warning: '⚠️', error: '🔴', info: 'ℹ️' };
    const colors = { success: 'border-profit/30 bg-profit/5', warning: 'border-gold/30 bg-gold/5', error: 'border-loss/30 bg-loss/5', info: 'border-border-secondary bg-card-primary' };
    const textColors = { success: 'text-profit', warning: 'text-gold', error: 'text-loss', info: 'text-gray-300' };
    
    toast.className = `toast-enter flex items-center gap-2 px-4 py-3 rounded-lg border ${colors[type]} backdrop-blur-sm`;
    toast.innerHTML = `<span class="text-sm">${icons[type]}</span><span class="text-xs ${textColors[type]}">${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Modals
function openModal(content, options = {}) {
    const container = document.getElementById('modalContainer');
    container.classList.remove('hidden');
    container.innerHTML = `
        <div class="modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50" onclick="if(event.target===this)closeModal()">
            <div class="glass-card rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto slide-up" onclick="event.stopPropagation()">
                <div class="flex items-center justify-between p-4 border-b border-border-primary">
                    <h3 class="text-sm font-bold text-gold">${options.title || ''}</h3>
                    <button onclick="closeModal()" class="w-7 h-7 rounded-lg bg-card-secondary flex items-center justify-center text-gray-400 hover:text-white transition-colors">✕</button>
                </div>
                <div class="p-4">${content}</div>
            </div>
        </div>
    `;
    document.addEventListener('keydown', handleEscKey);
}

function closeModal() {
    const container = document.getElementById('modalContainer');
    container.classList.add('hidden');
    container.innerHTML = '';
    document.removeEventListener('keydown', handleEscKey);
}

function handleEscKey(e) { if (e.key === 'Escape') closeModal(); }

// Journal Logic
function renderJournal(trades) {
    const tbody = document.getElementById('journalTable');
    if (!trades || trades.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-gray-500 text-xs">لا توجد صفقات</td></tr>`;
        return;
    }
    tbody.innerHTML = trades.map(t => `
        <tr class="border-b border-border-primary/50 hover:bg-card-secondary/50 cursor-pointer" onclick='openTradeDetailModal(${JSON.stringify(t).replace(/'/g, "\\'")})'>
            <td class="py-2 px-2 text-gray-400 text-[11px]">${t.time}</td>
            <td class="py-2 px-2"><span class="px-1.5 py-0.5 rounded text-[10px] ${t.side === 'BUY' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}">${t.side}</span></td>
            <td class="py-2 px-2 font-mono text-[11px]">${t.entry}</td>
            <td class="py-2 px-2 font-mono text-[11px] text-loss">${t.sl}</td>
            <td class="py-2 px-2 font-mono text-[11px] text-profit">${t.tp}</td>
            <td class="py-2 px-2 font-mono text-[11px]">${t.exit || '-'}</td>
            <td class="py-2 px-2"><span class="px-1.5 py-0.5 rounded text-[10px] ${t.status === 'TP' ? 'bg-profit/10 text-profit' : t.status === 'SL' ? 'bg-loss/10 text-loss' : 'bg-gold/10 text-gold'}">${t.status}</span></td>
            <td class="py-2 px-2 font-mono text-[11px] ${t.pnl > 0 ? 'text-profit' : t.pnl < 0 ? 'text-loss' : 'text-gray-400'}">${t.pnl > 0 ? '+' : ''}$${t.pnl}</td>
        </tr>
    `).join('');
}

function filterJournal(filter) {
    AppState.journalFilter = filter;
    document.querySelectorAll('.journal-filter').forEach(btn => {
        btn.className = 'journal-filter px-2.5 py-1 rounded-md text-[10px] bg-card-secondary border border-border-primary text-gray-400';
    });
    event.target.className = 'journal-filter px-2.5 py-1 rounded-md text-[10px] bg-gold/10 border border-gold/30 text-gold';
    
    let filtered = [...MockData.journalTrades];
    switch (filter) {
        case 'buy': filtered = filtered.filter(t => t.side === 'BUY'); break;
        case 'sell': filtered = filtered.filter(t => t.side === 'SELL'); break;
        case 'tp': filtered = filtered.filter(t => t.status === 'TP'); break;
        case 'sl': filtered = filtered.filter(t => t.status === 'SL'); break;
        case 'open': filtered = filtered.filter(t => t.status === 'OPEN'); break;
    }
    renderJournal(filtered);
}

function searchJournal() {
    const query = document.getElementById('journalSearch').value.toLowerCase();
    let filtered = [...MockData.journalTrades];
    
    if (AppState.journalFilter !== 'all') {
        switch (AppState.journalFilter) {
            case 'buy': filtered = filtered.filter(t => t.side === 'BUY'); break;
            case 'sell': filtered = filtered.filter(t => t.side === 'SELL'); break;
            case 'tp': filtered = filtered.filter(t => t.status === 'TP'); break;
            case 'sl': filtered = filtered.filter(t => t.status === 'SL'); break;
            case 'open': filtered = filtered.filter(t => t.status === 'OPEN'); break;
        }
    }
    
    if (query) {
        filtered = filtered.filter(t => t.time.includes(query) || t.side.toLowerCase().includes(query) || t.status.toLowerCase().includes(query) || String(t.entry).includes(query));
    }
    renderJournal(filtered);
}

function filterJournalDate() {
    const date = document.getElementById('journalDate').value;
    let filtered = [...MockData.journalTrades];
    if (date) filtered = filtered.filter(t => t.time.startsWith(date));
    renderJournal(filtered);
}

// Backtest functions
async function runBacktest() {
    if (AppState.backtestRunning) return;
    AppState.backtestRunning = true;
    showToast('info', 'جاري تشغيل Backtest...');
    
    document.getElementById('btEmpty').innerHTML = `
        <div class="text-4xl mb-3 animate-spin">⏳</div>
        <h4 class="text-sm font-semibold text-gray-300 mb-1">جاري التحليل...</h4><p class="text-xs text-gray-500">يرجى الانتظار</p>`;
    
    try {
        const result = await ApiService.runBacktest({});
        const trades = MockData.generateBacktestTrades();
        const equityCurve = MockData.generateEquityCurve();
        
        document.getElementById('btEmpty').classList.add('hidden');
        document.getElementById('btResults').classList.remove('hidden');
        
        document.getElementById('btTradeTable').innerHTML = trades.map(t => `
            <tr class="border-b border-border-primary/50 hover:bg-card-secondary/50 cursor-pointer" onclick="openTradeDetailModal(${JSON.stringify(t).replace(/"/g, '&quot;')})">
                <td class="py-2 px-2 text-gray-400">${t.id}</td>
                <td class="py-2 px-2 text-gray-400">${t.time}</td>
                <td class="py-2 px-2"><span class="px-1.5 py-0.5 rounded text-[10px] ${t.side === 'BUY' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}">${t.side}</span></td>
                <td class="py-2 px-2 font-mono">${t.entry}</td>
                <td class="py-2 px-2 font-mono text-loss">${t.sl}</td>
                <td class="py-2 px-2 font-mono text-profit">${t.tp}</td>
                <td class="py-2 px-2 font-mono">${t.exit}</td>
                <td class="py-2 px-2"><span class="px-1.5 py-0.5 rounded text-[10px] ${t.status === 'TP' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}">${t.status}</span></td>
                <td class="py-2 px-2 font-mono ${t.pnl >= 0 ? 'text-profit' : 'text-loss'}">${t.pnl >= 0 ? '+' : ''}$${t.pnl}</td>
                <td class="py-2 px-2 font-mono ${t.r >= 0 ? 'text-profit' : 'text-loss'}">${t.r >= 0 ? '+' : ''}${t.r}R</td>
            </tr>
        `).join('');
        
        setTimeout(() => drawEquityCurve(equityCurve), 100);
        showToast('success', 'تم تشغيل Backtest بنجاح');
    } catch (err) {
        showToast('error', 'حدث خطأ أثناء تشغيل Backtest');
    }
    AppState.backtestRunning = false;
}

function resetBacktest() {
    document.getElementById('btResults').classList.add('hidden');
    document.getElementById('btEmpty').classList.remove('hidden');
    document.getElementById('btEmpty').innerHTML = `<div class="text-4xl mb-3">📈</div><h4 class="text-sm font-semibold text-gray-300 mb-1">لا توجد نتائج</h4><p class="text-xs text-gray-500">اضبط الإعدادات ثم اضغط "تشغيل Backtest"</p>`;
    showToast('info', 'تم إعادة ضبط Backtest');
}

// Lab functions
async function runLabAnalysis() {
    if (AppState.labRunning) return;
    AppState.labRunning = true;
    showToast('info', 'جاري تشغيل التحليل...');
    document.getElementById('labEmpty').innerHTML = `<div class="text-4xl mb-3 animate-spin">⏳</div><h4 class="text-sm font-semibold text-gray-300 mb-1">جاري التحليل...</h4><p class="text-xs text-gray-500">يرجى الانتظار</p>`;
    
    try {
        const result = await ApiService.runLab({});
        document.getElementById('labEmpty').classList.add('hidden');
        document.getElementById('labResults').classList.remove('hidden');
        
        document.getElementById('labRegimeResults').innerHTML = result.byRegime.map(r => `
            <div class="flex items-center justify-between bg-card-secondary rounded-lg p-3">
                <div class="flex items-center gap-3"><span class="text-xs font-medium w-24">${r.regime}</span><span class="text-[10px] text-gray-500">${r.trades} صفقة</span></div>
                <div class="flex items-center gap-4">
                    <div class="text-center"><div class="text-[10px] text-gray-500">Win Rate</div><div class="text-xs font-bold ${r.winRate >= 60 ? 'text-profit' : r.winRate >= 50 ? 'text-gold' : 'text-loss'}">${r.winRate}%</div></div>
                    <div class="text-center"><div class="text-[10px] text-gray-500">P&L</div><div class="text-xs font-bold ${r.pnl >= 0 ? 'text-profit' : 'text-loss'}">${r.pnl >= 0 ? '+' : ''}$${r.pnl}</div></div>
                    <div class="text-center"><div class="text-[10px] text-gray-500">Avg R</div><div class="text-xs font-bold ${r.avgR >= 0 ? 'text-profit' : 'text-loss'}">${r.avgR >= 0 ? '+' : ''}${r.avgR}R</div></div>
                </div>
            </div>`).join('');
            
        document.getElementById('labSessionResults').innerHTML = result.bySession.map(s => `<div class="bg-card-secondary rounded-lg p-3 text-center"><div class="text-xs font-bold mb-2">${s.session}</div><div class="text-lg font-bold ${s.pnl >= 0 ? 'text-profit' : 'text-loss'}">${s.pnl >= 0 ? '+' : ''}$${s.pnl}</div><div class="text-[10px] text-gray-500 mt-1">Win: ${s.winRate}% | ${s.trades} صفقة | Avg: ${s.avgR}R</div></div>`).join('');
        
        document.getElementById('labTFResults').innerHTML = result.byTimeframe.map(t => `<div class="bg-card-secondary rounded-lg p-3 text-center"><div class="text-xs font-bold mb-2">${t.tf}</div><div class="text-lg font-bold ${t.pnl >= 0 ? 'text-profit' : 'text-loss'}">${t.pnl >= 0 ? '+' : ''}$${t.pnl}</div><div class="text-[10px] text-gray-500 mt-1">Win: ${t.winRate}% | ${t.trades} صفقة | Avg: ${t.avgR}R</div></div>`).join('');
        
        document.getElementById('labQualityResults').innerHTML = result.byQuality.map(q => `<div class="bg-card-secondary rounded-lg p-3 text-center"><div class="text-xs font-bold mb-2">${q.quality}</div><div class="text-lg font-bold ${q.pnl >= 0 ? 'text-profit' : 'text-loss'}">${q.pnl >= 0 ? '+' : ''}$${q.pnl}</div><div class="text-[10px] text-gray-500 mt-1">Win: ${q.winRate}% | ${q.trades} صفقة | Avg: ${q.avgR}R</div></div>`).join('');
        
        showToast('success', 'تم تحليل الأداء بنجاح');
    } catch (err) { showToast('error', 'حدث خطأ أثناء التحليل'); }
    AppState.labRunning = false;
}

function resetLab() {
    document.getElementById('labResults').classList.add('hidden');
    document.getElementById('labEmpty').classList.remove('hidden');
    document.getElementById('labEmpty').innerHTML = `<div class="text-4xl mb-3">🔬</div><h4 class="text-sm font-semibold text-gray-300 mb-1">المختبر جاهز</h4><p class="text-xs text-gray-500">اضغط "تشغيل التحليل" لبدء تحليل أداء الاستراتيجية</p>`;
    showToast('info', 'تم إعادة ضبط المختبر');
}

// Modal implementations (openCloseTradeModal, confirmCloseTrade, etc)
function openCloseTradeModal() {
    openModal(`
        <div class="text-center">
            <div class="text-3xl mb-3">⚠️</div>
            <p class="text-sm text-gray-300 mb-4">هل أنت متأكد من إغلاق الصفقة الحالية؟</p>
            <div class="bg-card-secondary rounded-lg p-3 mb-4">
                <div class="flex justify-between text-xs mb-1"><span class="text-gray-400">الصفقة:</span><span class="text-profit font-bold">BUY</span></div>
                <div class="flex justify-between text-xs mb-1"><span class="text-gray-400">Entry:</span><span class="font-mono">3348.50</span></div>
                <div class="flex justify-between text-xs mb-1"><span class="text-gray-400">P&L الحالي:</span><span class="text-profit font-mono">+$27.00</span></div>
            </div>
            <div class="flex gap-2">
                <button onclick="confirmCloseTrade()" class="flex-1 py-2 rounded-lg bg-loss/20 border border-loss/30 text-loss text-xs font-bold hover:bg-loss/30 transition-all">تأكيد الإغلاق</button>
                <button onclick="closeModal()" class="flex-1 py-2 rounded-lg btn-outline text-xs">إلغاء</button>
            </div>
        </div>
    `, { title: 'إغلاق الصفقة' });
}

function confirmCloseTrade() { closeModal(); showToast('success', 'تم إغلاق الصفقة بنجاح'); }

function openSignalDetailsModal() {
    openModal(`
        <div class="space-y-3">
            <div class="bg-card-secondary rounded-lg p-3">
                <div class="text-xs font-semibold text-gold mb-2">تفاصيل الإشارة</div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div><span class="text-gray-500">الاتجاه:</span> <span class="text-profit font-bold">BUY</span></div>
                    <div><span class="text-gray-500">الثقة:</span> <span class="text-gold font-bold">82%</span></div>
                    <div><span class="text-gray-500">Entry:</span> <span class="font-mono">3348.50</span></div>
                    <div><span class="text-gray-500">SL:</span> <span class="font-mono text-loss">3342.00</span></div>
                    <div><span class="text-gray-500">TP:</span> <span class="font-mono text-profit">3361.50</span></div>
                    <div><span class="text-gray-500">R:R:</span> <span class="font-bold">1:2.0</span></div>
                </div>
            </div>
            <div class="bg-card-secondary rounded-lg p-3">
                <div class="text-xs font-semibold text-gold mb-2">شروط الدخول</div>
                <div class="space-y-1.5">
                    <div class="flex items-center gap-2 text-xs"><span class="text-profit">✓</span> H1 سياق صاعد</div>
                    <div class="flex items-center gap-2 text-xs"><span class="text-profit">✓</span> M15 الاتجاه يؤكد</div>
                    <div class="flex items-center gap-2 text-xs"><span class="text-profit">✓</span> M15 البنية إيجابية (HH/HL)</div>
                    <div class="flex items-center gap-2 text-xs"><span class="text-profit">✓</span> تصحيح لمنطقة الإعداد</div>
                    <div class="flex items-center gap-2 text-xs"><span class="text-profit">✓</span> استئناف فوق EMA21</div>
                    <div class="flex items-center gap-2 text-xs"><span class="text-profit">✓</span> شمعة تأكيد M5</div>
                    <div class="flex items-center gap-2 text-xs"><span class="text-profit">✓</span> زخم RSI M5 = 61</div>
                    <div class="flex items-center gap-2 text-xs"><span class="text-profit">✓</span> التقلب 1.12× (ضمن النطاق)</div>
                    <div class="flex items-center gap-2 text-xs"><span class="text-profit">✓</span> الجلسة: لندن</div>
                </div>
            </div>
            <div class="bg-card-secondary rounded-lg p-3">
                <div class="text-xs font-semibold text-gold mb-2">Regime</div>
                <div class="text-xs">UP - اتجاه صاعد</div>
            </div>
        </div>
    `, { title: '📌 تفاصيل الإشارة' });
}

function openFullAnalysisModal() {
    openModal(`
        <div class="space-y-3">
            <div class="bg-card-secondary rounded-lg p-3">
                <div class="text-xs font-semibold text-gold mb-2">تحليل H1 - السياق</div><div class="text-xs text-gray-300">الاتجاه العام صاعد مع تكوين قمم وقيعان صاعدة (HH/HL). السعر فوق EMA21 و EMA50. الزخم إيجابي.</div>
            </div>
            <div class="bg-card-secondary rounded-lg p-3">
                <div class="text-xs font-semibold text-gold mb-2">تحليل M15 - الإعداد</div><div class="text-xs text-gray-300">البنية إيجابية مع وجود Pivot High. السعر قام بتصحيح إلى منطقة الطلب (Demand Zone) عند 3348.00-3349.00.</div>
            </div>
            <div class="bg-card-secondary rounded-lg p-3">
                <div class="text-xs font-semibold text-gold mb-2">تحليل M5 - التنفيذ</div><div class="text-xs text-gray-300">شمعة Bullish Engulfing تؤكد الدخول. RSI عند 61 (منطقة صعودية بدون تشبع). Volume مرتفع يؤكد الحركة.</div>
            </div>
            <div class="bg-card-secondary rounded-lg p-3">
                <div class="text-xs font-semibold text-gold mb-2">مستويات مهمة</div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div>مقاومة 1: <span class="font-mono text-loss">3365.00</span></div><div>مقاومة 2: <span class="font-mono text-loss">3372.00</span></div>
                    <div>دعم 1: <span class="font-mono text-profit">3342.00</span></div><div>دعم 2: <span class="font-mono text-profit">3335.00</span></div>
                </div>
            </div>
        </div>
    `, { title: '📊 تحليل كامل' });
}

function openReplayModal() {
    openModal(`
        <div class="space-y-4">
            <div class="bg-card-secondary rounded-lg p-4 text-center">
                <div class="text-2xl mb-2">🎬</div><div class="text-xs text-gray-400 mb-3">Replay - أعد مشاهدة الحركة السعرية</div>
                <div class="bg-bg-primary rounded-lg" style="height: 180px;" id="replayChartArea"><canvas id="replayCanvas" class="w-full h-full"></canvas></div>
            </div>
            <div class="flex items-center justify-center gap-2">
                <button onclick="replayStep()" class="px-3 py-2 rounded-lg btn-outline text-xs">⏭ شمعة</button>
                <button onclick="replayPlay()" id="replayPlayBtn" class="px-3 py-2 rounded-lg btn-gold text-xs">▶ تشغيل</button>
                <button onclick="replayReset()" class="px-3 py-2 rounded-lg btn-outline text-xs">↺ إعادة</button>
            </div>
            <div class="bg-card-secondary rounded-lg p-3">
                <div class="text-xs text-gray-400 text-center mb-2">🧠 خمّن قبل الكشف:</div>
                <div class="flex gap-2">
                    <button onclick="replayGuess('tp')" class="flex-1 py-2 rounded-lg bg-profit/10 border border-profit/30 text-profit text-xs font-bold hover:bg-profit/20 transition-all">🎯 سيصل للهدف</button>
                    <button onclick="replayGuess('sl')" class="flex-1 py-2 rounded-lg bg-loss/10 border border-loss/30 text-loss text-xs font-bold hover:bg-loss/20 transition-all">🛑 سيضرب الوقف</button>
                </div>
                <div id="replayResult" class="hidden mt-2 text-center text-xs"></div>
            </div>
        </div>
    `, { title: '🎬 Replay' });
    setTimeout(initReplayChart, 100);
}

function openNoteModal() {
    openModal(`
        <div class="space-y-3">
            <div><label class="text-xs text-gray-400 block mb-1">العنوان</label><input type="text" id="noteTitle" placeholder="عنوان الملاحظة..." class="w-full px-3 py-2 rounded-lg text-xs"></div>
            <div><label class="text-xs text-gray-400 block mb-1">الملاحظة</label><textarea id="noteContent" rows="4" placeholder="اكتب ملاحظتك هنا..." class="w-full px-3 py-2 rounded-lg text-xs resize-none"></textarea></div>
            <div><label class="text-xs text-gray-400 block mb-1">التصنيف</label><select id="noteCategory" class="w-full px-3 py-2 rounded-lg text-xs"><option>ملاحظة عامة</option><option>تحليل سوق</option><option>درس مستفاد</option><option>خطة تداول</option></select></div>
            <button onclick="saveNote()" class="w-full btn-gold py-2 rounded-lg text-xs">💾 حفظ الملاحظة</button>
        </div>
    `, { title: '📝 تسجيل ملاحظة' });
}

function saveNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    if (!title || !content) { showToast('warning', 'يرجى ملء جميع الحقول'); return; }
    closeModal();
    showToast('success', 'تم حفظ الملاحظة بنجاح');
}

function openTradeDetailModal(trade) {
    openModal(`
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <span class="px-2 py-1 rounded text-xs font-bold ${trade.side === 'BUY' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}">${trade.side}</span>
                <span class="px-2 py-1 rounded text-xs ${trade.status === 'TP' ? 'bg-profit/10 text-profit' : trade.status === 'SL' ? 'bg-loss/10 text-loss' : 'bg-gold/10 text-gold'}">${trade.status}</span>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div class="bg-card-secondary rounded-lg p-2.5"><div class="text-[10px] text-gray-500">Entry</div><div class="text-xs font-mono font-bold">${trade.entry}</div></div>
                <div class="bg-card-secondary rounded-lg p-2.5"><div class="text-[10px] text-gray-500">Exit</div><div class="text-xs font-mono font-bold">${trade.exit || '-'}</div></div>
                <div class="bg-card-secondary rounded-lg p-2.5"><div class="text-[10px] text-gray-500">SL</div><div class="text-xs font-mono font-bold text-loss">${trade.sl}</div></div>
                <div class="bg-card-secondary rounded-lg p-2.5"><div class="text-[10px] text-gray-500">TP</div><div class="text-xs font-mono font-bold text-profit">${trade.tp}</div></div>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div class="bg-card-secondary rounded-lg p-2.5"><div class="text-[10px] text-gray-500">P&L</div><div class="text-sm font-bold ${trade.pnl > 0 ? 'text-profit' : trade.pnl < 0 ? 'text-loss' : 'text-gray-400'}">${trade.pnl > 0 ? '+' : ''}$${trade.pnl}</div></div>
                <div class="bg-card-secondary rounded-lg p-2.5"><div class="text-[10px] text-gray-500">R Multiple</div><div class="text-sm font-bold ${trade.r > 0 ? 'text-profit' : trade.r < 0 ? 'text-loss' : 'text-gray-400'}">${trade.r > 0 ? '+' : ''}${trade.r}R</div></div>
            </div>
            ${trade.regime ? `<div class="bg-card-secondary rounded-lg p-2.5"><div class="text-[10px] text-gray-500">Regime</div><div class="text-xs font-bold">${trade.regime}</div></div>` : ''}
            ${trade.session ? `<div class="bg-card-secondary rounded-lg p-2.5"><div class="text-[10px] text-gray-500">Session</div><div class="text-xs font-bold">${trade.session}</div></div>` : ''}
            <div class="text-[10px] text-gray-500 text-center">الوقت: ${trade.time}</div>
            <button onclick="closeModal(); openReplayModal();" class="w-full py-2 rounded-lg btn-outline text-xs flex items-center justify-center gap-1"><span>🎬</span> Replay</button>
        </div>
    `, { title: 'تفاصيل الصفقة' });
}
