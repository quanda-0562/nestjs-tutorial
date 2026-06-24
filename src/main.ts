import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { initI18n, getI18n } from './i18n/i18n.config';
import { setupSwagger } from './swagger/swagger.config';
import middleware from 'i18next-http-middleware';

async function bootstrap() {
  await initI18n();

  const app = await NestFactory.create(AppModule);
  app.use(middleware.handle(getI18n()));

  // Enable validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Setup Swagger
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
