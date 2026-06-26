import {
  Injectable,
  PipeTransform,
  BadRequestException,
  ArgumentMetadata,
  ExecutionContext,
} from '@nestjs/common';
import { ValidationError, validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { getI18n } from '../../i18n/i18n.config';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata, context?: ExecutionContext) {
    if (!metadata.type || metadata.type !== 'body') {
      return value;
    }

    if (!metadata.metatype) {
      return value;
    }

    let requestLanguage: string | undefined;

    // Get language from request context if available
    if (context) {
      const request = context.switchToHttp().getRequest();
      // i18next-http-middleware stores language in req.language
      requestLanguage = request.language;
      // DEBUG: Log available language properties
      // console.log('Request properties:', { language: request.language, i18nLanguage: request.i18n?.language, headers: request.headers.language });
    }

    const object = plainToInstance(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const translatedErrors = this.translateErrors(errors, '', requestLanguage);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: translatedErrors,
      });
    }

    return value;
  }

  private translateErrors(
    errors: ValidationError[],
    parentKey: string = '',
    requestLanguage?: string,
  ): any {
    const result: any = {};
    const i18n = getI18n();

    for (const error of errors) {
      const fieldKey = parentKey ? `${parentKey}.${error.property}` : error.property;

      if (error.constraints) {
        const translatedConstraints: any = {};
        for (const [constraintKey, message] of Object.entries(
          error.constraints,
        )) {
          // Try to translate the message if it looks like an i18n key (contains a dot)
          let translatedMessage = message;
          if (message.includes('.')) {
            // Use i18n with specific language if available
            if (requestLanguage) {
              translatedMessage = i18n.t(message, { lng: requestLanguage });
            } else {
              translatedMessage = i18n.t(message);
            }
          }
          translatedConstraints[constraintKey] = translatedMessage;
        }
        result[fieldKey] = translatedConstraints;
      }

      if (error.children && error.children.length > 0) {
        const nestedErrors = this.translateErrors(error.children, fieldKey, requestLanguage);
        Object.assign(result, nestedErrors);
      }
    }

    return result;
  }
}
