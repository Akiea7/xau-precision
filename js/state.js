// ============================================================
// STATE MANAGEMENT
// ============================================================
const AppState = {
    currentTab: 'live',
    connectionStatus: 'disconnected', // connected, connecting, disconnected
    demoMode: true,
    currentPrice: 3350.25,
    priceChange: 0.42,
    marketRegime: 'UP', // STRONG_UP, UP, DOWN, STRONG_DOWN, HIGH_VOL, QUIET, RANGE
    currentSignal: null,
    currentTrade: null,
    chartTimeframe: 'M15',
    chartOffset: 0,
    journalFilter: 'all',
    backtestRunning: false,
    labRunning: false,
};
