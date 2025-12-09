import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Get ConfigService
  const configService = app.get(ConfigService);

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 启用 CORS
  const frontendUrl = configService.get<string>('cors.origin'); // e.g., "http://localhost:5183,http://localhost:5174"
  
  const allowedOrigins: string[] = [];
  const urls = frontendUrl.split(',').map(url => url.trim());

  urls.forEach(url => {
    allowedOrigins.push(url);
    // 同时支持 localhost 和 127.0.0.1
    if (url.includes('localhost')) {
      allowedOrigins.push(url.replace('localhost', '127.0.0.1'));
    } else if (url.includes('127.0.0.1')) {
      allowedOrigins.push(url.replace('127.0.0.1', 'localhost'));
    }
  });
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // 设置全局前缀
  app.setGlobalPrefix('api');

  // Get server configuration
  const port = configService.get<number>('server.port');
  const env = configService.get<string>('server.env');

  await app.listen(port);

  // Print startup information
  console.log('========================================');
  console.log('🚀 Vela Backend API');
  console.log('========================================');
  console.log(`📍 URL: http://localhost:${port}/api`);
  console.log(`🌍 Environment: ${env}`);
  console.log(`🔐 CORS Origins: ${allowedOrigins.join(', ')}`);
  console.log(`✅ Server started successfully!`);
  console.log('========================================');
}
bootstrap();
