import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return an object with message and greeting', () => {
      const result = appController.getHello(undefined, {
        t: (key: string) => {
          if (key === 'welcome') return 'Welcome to NestJS';
          if (key === 'hello') return 'Hello Developer';
          return key;
        },
      } as any);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('greeting');
    });
  });
});
