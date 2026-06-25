import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import i18next from 'i18next';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LoginRequestDto } from './dto/login.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockI18n = {
    t: jest.fn((key: string) => key),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('login', () => {
    it('should call service.login with correct credentials', async () => {
      const loginRequest: LoginRequestDto = {
        user: {
          email: 'jake@jake.jake',
          password: 'jakejake',
        },
      };

      const mockResponse = {
        user: {
          id: 1,
          email: 'jake@jake.jake',
          username: 'Jake',
          token: 'test-token',
        },
      };

      (service.login as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.login(loginRequest);

      expect(service.login).toHaveBeenCalledWith('jake@jake.jake', 'jakejake');
      expect(result).toEqual(mockResponse);
    });

    it('should return user data with token', async () => {
      const loginRequest: LoginRequestDto = {
        user: {
          email: 'jake@jake.jake',
          password: 'jakejake',
        },
      };

      const mockResponse = {
        user: {
          id: 1,
          email: 'jake@jake.jake',
          username: 'Jake',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      };

      (service.login as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.login(loginRequest);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('jake@jake.jake');
      expect(result.user.token).toBeDefined();
    });

    it('should propagate UnauthorizedException from service', async () => {
      const loginRequest: LoginRequestDto = {
        user: {
          email: 'jake@jake.jake',
          password: 'wrongpassword',
        },
      };

      (service.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid email or password'),
      );

      await expect(controller.login(loginRequest)).rejects.toThrow(UnauthorizedException);
    });

    it('should propagate BadRequestException from service', async () => {
      const loginRequest: LoginRequestDto = {
        user: {
          email: '',
          password: 'password',
        },
      };

      (service.login as jest.Mock).mockRejectedValue(
        new BadRequestException('Email and password are required'),
      );

      await expect(controller.login(loginRequest)).rejects.toThrow(BadRequestException);
    });
  });
});
