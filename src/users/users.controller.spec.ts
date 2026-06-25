import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import i18next from 'i18next';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LoginRequestDto } from './dto/login.dto';
import { CreateUserRequestDto } from './dto/user.dto';

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
            create: jest.fn(),
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

  describe('create', () => {
    it('should call service.create with correct data', async () => {
      const createRequest: CreateUserRequestDto = {
        user: {
          email: 'newuser@example.com',
          username: 'NewUser',
          password: 'password123',
        },
      };

      const mockResponse = {
        user: {
          id: 2,
          email: 'newuser@example.com',
          username: 'NewUser',
          token: 'test-token',
        },
      };

      (service.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.create(createRequest);

      expect(service.create).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        username: 'NewUser',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return user data with token after creation', async () => {
      const createRequest: CreateUserRequestDto = {
        user: {
          email: 'jacob@example.com',
          username: 'Jacob',
          password: 'jakejake',
        },
      };

      const mockResponse = {
        user: {
          id: 2,
          email: 'jacob@example.com',
          username: 'Jacob',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      };

      (service.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.create(createRequest);

      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(2);
      expect(result.user.email).toBe('jacob@example.com');
      expect(result.user.username).toBe('Jacob');
      expect(result.user.token).toBeDefined();
    });

    it('should propagate ConflictException when email already exists', async () => {
      const createRequest: CreateUserRequestDto = {
        user: {
          email: 'jake@jake.jake',
          username: 'Jake2',
          password: 'password123',
        },
      };

      (service.create as jest.Mock).mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(controller.create(createRequest)).rejects.toThrow(ConflictException);
    });

    it('should propagate BadRequestException when missing required fields', async () => {
      const createRequest: CreateUserRequestDto = {
        user: {
          email: 'newuser@example.com',
          username: '',
          password: 'password123',
        },
      };

      (service.create as jest.Mock).mockRejectedValue(
        new BadRequestException('Email, username and password are required'),
      );

      await expect(controller.create(createRequest)).rejects.toThrow(BadRequestException);
    });
  });
  });
});
