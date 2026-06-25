import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initI18n, getI18n } from './i18n/i18n.config';
import { setupSwagger } from './swagger/swagger.config';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import middleware from 'i18next-http-middleware';

async function bootstrap() {
  await initI18n();

  const app = await NestFactory.create(AppModule);
  app.use(middleware.handle(getI18n()));

  // Enable custom validation pipe with i18n support
  app.useGlobalPipes(new CustomValidationPipe());

  // Setup Swagger
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
