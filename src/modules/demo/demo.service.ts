import { Injectable, Logger } from '@nestjs/common';
import { AppGateway } from '../websocket/websocket.gateway';

@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);
  private interval: NodeJS.Timeout;
  private isRunning = false;
  private currentPrice = 3350.00;

  constructor(private readonly gateway: AppGateway) {}

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.logger.log('Demo Market Data Started');
    
    this.interval = setInterval(() => {
      const change = (Math.random() - 0.48) * 2;
      this.currentPrice = Math.round((this.currentPrice + change) * 100) / 100;
      
      const tick = {
        type: 'tick',
        timestamp: Date.now(),
        data: {
          symbol: 'XAU/USD',
          price: this.currentPrice,
        }
      };
      
      this.gateway.broadcastTick(tick);
    }, 2000);
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.interval);
    this.logger.log('Demo Market Data Stopped');
  }
}
