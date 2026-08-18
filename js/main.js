// ============================================================
// INITIALIZATION
// ============================================================
function init() {
    // Set current date for the report
    document.getElementById('reportDate').textContent = new Date().toISOString().split('T')[0];
    
    // Init chart
    initChart();
    
    // Init journal
    renderJournal(MockData.journalTrades);
    
    // Start time updates
    updateTime();
    setInterval(updateTime, 1000);
    
    // Start price simulation
    setInterval(() => {
        if (AppState.demoMode) {
            ApiService.fetchTick();
        }
    }, 2000);
    
    // Connect WebSocket (demo)
    ApiService.connectWebSocket();
    
    // Nav tab clicks
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Initial toast message
    setTimeout(() => {
        showToast('info', 'مرحباً بك في XAU Precision - وضع Demo');
    }, 1000);
}

// Start app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
