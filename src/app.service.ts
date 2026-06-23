import { Injectable } from '@nestjs/common';
import { getI18n } from './i18n/i18n.config';

@Injectable()
export class AppService {
  getHello(): object {
    const i18n = getI18n();
    return {
      message: i18n.t('welcome'),
      description: 'Translated message using i18n',
    };
  }
}
