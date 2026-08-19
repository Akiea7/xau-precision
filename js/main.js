// ============================================================
// SERVICE LAYER - REAL SERVER & WEBSOCKET API
// ============================================================
const ApiService = {
    socket: null,

        connectWebSocket() {
                console.log('[API] Connecting to Real Server...');
                        
                                // الاتصال بالسيرفر الحقيقي
                                        this.socket = io();

                                                this.socket.on('connect', () => {
                                                            AppState.connectionStatus = 'connected';
                                                                        updateConnectionUI();
                                                                                    showToast('success', 'تم الاتصال بالسيرفر الحقيقي!');
                                                                                            });

                                                                                                    this.socket.on('disconnect', () => {
                                                                                                                AppState.connectionStatus = 'disconnected';
                                                                                                                            updateConnectionUI();
                                                                                                                                        showToast('error', 'انقطع الاتصال بالسيرفر');
                                                                                                                                                });

                                                                                                                                                        // التقاط أسعار الذهب (Ticks) وتحديث الواجهة
                                                                                                                                                                this.socket.on('tick', (data) => {
                                                                                                                                                                            const newPrice = data.data.price;
                                                                                                                                                                                        const oldPrice = AppState.currentPrice;
                                                                                                                                                                                                    
                                                                                                                                                                                                                AppState.currentPrice = newPrice;
                                                                                                                                                                                                                            AppState.priceChange = ((newPrice - oldPrice) / oldPrice) * 100;
                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                                    updatePriceUI();
                                                                                                                                                                                                                                                            });
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
                                                                                                                                                                                                                                                                                                                                                        