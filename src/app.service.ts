import { Injectable } from '@nestjs/common';
import { t } from './common/utils/i18n.utils';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: t('welcome'),
      description: 'Translated message using i18n',
    };
  }
}
