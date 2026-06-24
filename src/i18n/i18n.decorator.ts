import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getI18n } from './i18n.config';

export const I18n = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const i18n = getI18n();
    
    // Nếu middleware thiết lập language trên request
    if (request.language) {
      i18n.changeLanguage(request.language);
    }
    
    return i18n;
  },
);
