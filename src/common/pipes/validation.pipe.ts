import {
  Injectable,
  PipeTransform,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { ValidationError, validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { t } from '../utils/i18n.utils';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!metadata.type || metadata.type !== 'body') {
      return value;
    }

    if (!metadata.metatype) {
      return value;
    }

    const object = plainToInstance(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const translatedErrors = this.translateErrors(errors);
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
  ): any {
    const result: any = {};

    for (const error of errors) {
      const fieldKey = parentKey ? `${parentKey}.${error.property}` : error.property;

      if (error.constraints) {
        const translatedConstraints: any = {};
        for (const [constraintKey, message] of Object.entries(
          error.constraints,
        )) {
          // Try to translate the message if it looks like an i18n key
          const translatedMessage = t(message);
          translatedConstraints[constraintKey] = translatedMessage;
        }
        result[fieldKey] = translatedConstraints;
      }

      if (error.children && error.children.length > 0) {
        const nestedErrors = this.translateErrors(error.children, fieldKey);
        Object.assign(result, nestedErrors);
      }
    }

    return result;
  }
}
