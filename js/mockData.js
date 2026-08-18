// ============================================================
// MOCK DATA
// ============================================================
const MockData = {
    currentSignal: {
        side: 'BUY',
        confidence: 82,
        entry: 3348.50,
        sl: 3342.00,
        tp: 3361.50,
        rr: '1 : 2.0',
        reasons: [
            'H1 سياق صاعد',
            'M15 الاتجاه يؤكد',
            'M15 البنية إيجابية',
            'السعر عاد إلى منطقة الإعداد',
            'استئناف فوق EMA21',
            'شمعة تأكيد M5',
            'زخم RSI مناسب',
            'التقلب مناسب',
            'الجلسة مناسبة'
        ]
    },

    currentTrade: {
        side: 'BUY',
        entry: 3348.50,
        sl: 3342.00,
        tp: 3361.50,
        currentPrice: 3351.20,
        pnl: 27.00,
        rMultiple: 0.42,
        openTime: '14:23',
        duration: '12 دقيقة'
    },

    journalTrades: [
        { id: 1, time: '2024-12-15 14:23', side: 'BUY', entry: 3348.50, sl: 3342.00, tp: 3361.50, exit: 3361.50, status: 'TP', pnl: 130, r: 2.0, regime: 'UP', session: 'London' },
        { id: 2, time: '2024-12-15 12:05', side: 'SELL', entry: 3355.00, sl: 3361.00, tp: 3343.00, exit: 3343.00, status: 'TP', pnl: 120, r: 2.0, regime: 'DOWN', session: 'London' },
        { id: 3, time: '2024-12-15 10:30', side: 'BUY', entry: 3340.00, sl: 3334.00, tp: 3352.00, exit: 3334.00, status: 'SL', pnl: -60, r: -1.0, regime: 'RANGE', session: 'Asia' },
        { id: 4, time: '2024-12-15 09:15', side: 'BUY', entry: 3335.50, sl: 3329.50, tp: 3347.50, exit: 3347.50, status: 'TP', pnl: 120, r: 2.0, regime: 'STRONG_UP', session: 'Asia' },
        { id: 5, time: '2024-12-14 20:10', side: 'SELL', entry: 3360.00, sl: 3366.00, tp: 3348.00, exit: 3366.00, status: 'SL', pnl: -60, r: -1.0, regime: 'UP', session: 'NY' },
        { id: 6, time: '2024-12-14 16:45', side: 'BUY', entry: 3345.00, sl: 3339.00, tp: 3357.00, exit: 3357.00, status: 'TP', pnl: 120, r: 2.0, regime: 'UP', session: 'London' },
        { id: 7, time: '2024-12-14 14:20', side: 'SELL', entry: 3352.00, sl: 3358.00, tp: 3340.00, exit: 3340.00, status: 'TP', pnl: 120, r: 2.0, regime: 'DOWN', session: 'London' },
        { id: 8, time: '2024-12-14 11:00', side: 'BUY', entry: 3338.00, sl: 3332.00, tp: 3350.00, exit: 3332.00, status: 'SL', pnl: -60, r: -1.0, regime: 'QUIET', session: 'Asia' },
        { id: 9, time: '2024-12-14 09:30', side: 'BUY', entry: 3330.00, sl: 3324.00, tp: 3342.00, exit: 3342.00, status: 'TP', pnl: 120, r: 2.0, regime: 'STRONG_UP', session: 'Asia' },
        { id: 10, time: '2024-12-13 21:15', side: 'SELL', entry: 3358.00, sl: 3364.00, tp: 3346.00, exit: 3358.00, status: 'OPEN', pnl: 0, r: 0, regime: 'HIGH_VOL', session: 'NY' },
        { id: 11, time: '2024-12-13 15:40', side: 'BUY', entry: 3342.00, sl: 3336.00, tp: 3354.00, exit: 3354.00, status: 'TP', pnl: 120, r: 2.0, regime: 'UP', session: 'London' },
        { id: 12, time: '2024-12-13 13:20', side: 'SELL', entry: 3350.00, sl: 3356.00, tp: 3338.00, exit: 3356.00, status: 'SL', pnl: -60, r: -1.0, regime: 'RANGE', session: 'London' },
    ],

    backtestResult: {
        initialBalance: 10000,
        finalBalance: 12450,
        netProfit: 2450,
        winRate: 64.2,
        lossRate: 35.8,
        profitFactor: 1.85,
        totalTrades: 156,
        averageR: 0.62,
        maxDrawdown: -420,
        bestTrade: 280,
        worstTrade: -120,
        winningTrades: 100,
        losingTrades: 56,
        averageWin: 42,
        averageLoss: -28,
        trades: [],
        equityCurve: []
    },

    labResult: {
        byRegime: [
            { regime: 'Strong Up', trades: 18, winRate: 78, pnl: 450, avgR: 1.2 },
            { regime: 'Up', trades: 32, winRate: 69, pnl: 380, avgR: 0.8 },
            { regime: 'Down', trades: 24, winRate: 62, pnl: 180, avgR: 0.5 },
            { regime: 'Strong Down', trades: 15, winRate: 73, pnl: 320, avgR: 1.0 },
            { regime: 'High Vol', trades: 20, winRate: 55, pnl: 80, avgR: 0.2 },
            { regime: 'Quiet', trades: 8, winRate: 35, pnl: -120, avgR: -0.4 },
            { regime: 'Range', trades: 39, winRate: 58, pnl: 160, avgR: 0.3 },
        ],
        bySession: [
            { session: 'Asia', trades: 42, winRate: 60, pnl: 280, avgR: 0.5 },
            { session: 'London', trades: 62, winRate: 68, pnl: 520, avgR: 0.8 },
            { session: 'New York', trades: 52, winRate: 63, pnl: 350, avgR: 0.6 },
        ],
        byTimeframe: [
            { tf: 'H1', trades: 35, winRate: 70, pnl: 480, avgR: 0.9 },
            { tf: 'M15', trades: 78, winRate: 65, pnl: 520, avgR: 0.7 },
            { tf: 'M5', trades: 43, winRate: 58, pnl: 150, avgR: 0.3 },
        ],
        byQuality: [
            { quality: 'عالية (>80%)', trades: 45, winRate: 82, pnl: 680, avgR: 1.2 },
            { quality: 'متوسطة (60-80%)', trades: 68, winRate: 60, pnl: 320, avgR: 0.5 },
            { quality: 'منخفضة (<60%)', trades: 43, winRate: 38, pnl: -150, avgR: -0.3 },
        ]
    },

    dailyReport: {
        date: '2024-12-15',
        totalTrades: 12,
        wins: 8,
        losses: 4,
        winRate: 66.7,
        netPnl: 240,
        averageR: 0.72,
        maxDrawdown: -85,
        bestSession: 'London',
        bestRegime: 'Strong Up',
        worstRegime: 'Quiet',
        summary: 'أداء اليوم كان إيجابياً، وكانت أفضل النتائج خلال الاتجاهات الصاعدة الواضحة، بينما انخفض الأداء في ظروف السوق الهادئة.'
    },

    generateCandles(timeframe, count = 60) {
        const candles = [];
        let price = 3320 + Math.random() * 30;
        const volatility = timeframe === 'H1' ? 5 : timeframe === 'M15' ? 2.5 : 1.2;
        
        for (let i = 0; i < count; i++) {
            const open = price;
            const change = (Math.random() - 0.45) * volatility;
            const close = open + change;
            const high = Math.max(open, close) + Math.random() * volatility * 0.5;
            const low = Math.min(open, close) - Math.random() * volatility * 0.5;
            const volume = Math.floor(Math.random() * 1000 + 200);
            
            candles.push({ open, high, low, close, volume, time: Date.now() - (count - i) * 60000 });
            price = close;
        }
        return candles;
    },

    generateBacktestTrades() {
        const trades = [];
        let price = 3300;
        for (let i = 0; i < 20; i++) {
            const isWin = Math.random() > 0.36;
            const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
            const entry = price + (Math.random() - 0.5) * 10;
            const sl = side === 'BUY' ? entry - 6 : entry + 6;
            const tp = side === 'BUY' ? entry + 12 : entry - 12;
            const exit = isWin ? tp : sl;
            const pnl = isWin ? 120 : -60;
            const r = isWin ? 2.0 : -1.0;
            
            trades.push({
                id: i + 1,
                time: `2024-${String(Math.floor(Math.random()*12)+1).padStart(2,'0')}-${String(Math.floor(Math.random()*28)+1).padStart(2,'0')} ${String(Math.floor(Math.random()*24)).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
                side,
                entry: Math.round(entry * 100) / 100,
                sl: Math.round(sl * 100) / 100,
                tp: Math.round(tp * 100) / 100,
                exit: Math.round(exit * 100) / 100,
                status: isWin ? 'TP' : 'SL',
                pnl,
                r
            });
            price = exit;
        }
        return trades;
    },

    generateEquityCurve() {
        const points = [];
        let equity = 10000;
        for (let i = 0; i < 50; i++) {
            equity += (Math.random() - 0.38) * 80;
            points.push(equity);
        }
        return points;
    }
};
