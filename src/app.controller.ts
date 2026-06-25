import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AppService } from './app.service';
import { t } from './common/utils/i18n.utils';

@Controller()
@ApiTags('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Get welcome message',
    description: 'Returns localized welcome message. Use "language" header to change language (en or vi)',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Name for greeting message',
    example: 'Alice',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved welcome message',
    example: {
      message: 'Welcome to NestJS',
      greeting: 'Hello Alice',
    },
  })
  getHello(
    @Query('name') name: string = 'Developer',
  ): object {
    return {
      message: t('welcome'),
      greeting: t('hello', { name }),
    };
  }
}

