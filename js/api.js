// ============================================================
// SERVICE LAYER - BACKEND API 
// ============================================================
const ApiService = {
    // BACKEND TODO: Replace with real WebSocket connection
    connectWebSocket() {
        console.log('[API] WebSocket connection placeholder:', CONFIG.WEBSOCKET_URL);
        // Simulate connection after delay
        setTimeout(() => {
            AppState.connectionStatus = 'connecting';
            updateConnectionUI();
            setTimeout(() => {
                AppState.connectionStatus = 'connected';
                updateConnectionUI();
                showToast('success', 'تم الاتصال بالسيرفر (Demo)');
            }, 1500);
        }, 1000);
    },

    // BACKEND TODO: Replace with real API call
    async fetchTick() {
        // Simulate price movement
        const change = (Math.random() - 0.48) * 2;
        AppState.currentPrice = Math.round((AppState.currentPrice + change) * 100) / 100;
        AppState.priceChange = Math.round((Math.random() * 1.2 - 0.3) * 100) / 100;
        updatePriceUI();
    },

    async fetchSignal() { return MockData.currentSignal; },
    async fetchTrades() { return MockData.journalTrades; },

    async runBacktest(params) {
        return new Promise(resolve => {
            setTimeout(() => resolve(MockData.backtestResult), 2000);
        });
    },

    async runLab(params) {
        return new Promise(resolve => {
            setTimeout(() => resolve(MockData.labResult), 1500);
        });
    },

    async fetchReport() { return MockData.dailyReport; },
    async fetchCandles(timeframe, count = 60) { return MockData.generateCandles(timeframe, count); }
};

