import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ ValidationPipe global — INDISPENSABLE para que los DTOs se validen
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // Elimina propiedades no definidas en el DTO
    forbidNonWhitelisted: false, // No lanza error por props extra, solo las ignora
    transform: true,       // Convierte tipos automáticamente (string → number, etc.)
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // ✅ CORS restringido al dominio del frontend
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3001',
    'http://localhost:3000',
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Log global para ver todas las peticiones que llegan
  app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
