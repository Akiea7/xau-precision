import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // السماح للواجهة بالاتصال بالسيرفر
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  const port = process.env.BACKEND_PORT || 3000;
  await app.listen(port);
  console.log(`XAU Precision Backend is running on port: ${port}`);
}
bootstrap();
