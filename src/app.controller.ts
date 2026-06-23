import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { I18n } from './i18n/i18n.decorator';
import i18next from 'i18next';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@I18n() i18n: typeof i18next): object {
    return {
      message: i18n.t('welcome'),
      greeting: i18n.t('hello', { name: 'Developer' }),
    };
  }
}
