import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AppService } from './app.service';
import { I18n } from './i18n/i18n.decorator';
import i18next from 'i18next';

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
    @I18n() i18n: typeof i18next,
  ): object {
    return {
      message: i18n.t('welcome'),
      greeting: i18n.t('hello', { name }),
    };
  }
}

