import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  const corsOrigin = configService.get<string>('cors.origin');
  app.enableCors({
    origin: corsOrigin,
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
  console.log(`🔐 CORS Origin: ${corsOrigin}`);
  console.log(`✅ Server started successfully!`);
  console.log('========================================');
}
bootstrap();
