import { Controller, Post } from '@nestjs/common';
import { DemoService } from './demo.service';

@Controller('api/demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Post('start')
  startDemo() {
    this.demoService.start();
    return { success: true, message: 'Demo started' };
  }

  @Post('stop')
  stopDemo() {
    this.demoService.stop();
    return { success: true, message: 'Demo stopped' };
  }
}
