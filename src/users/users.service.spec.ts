import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let jwtService: JwtService;
  let usersRepository: any;

  const mockUser: User = {
    id: 1,
    email: 'jake@jake.jake',
    username: 'Jake',
    passwordHash: 'hashed_password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.login('jake@jake.jake', 'jakejake12');

      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
      expect(result.user.email).toBe('jake@jake.jake');
      expect(result.user).toHaveProperty('token');
      expect(result.user.token).toBe('test-token');
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      usersRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.login('jake@jake.jake', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with non-existent email', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.login('notfound@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException when email is missing', async () => {
      await expect(service.login('', 'password')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when password is missing', async () => {
      await expect(service.login('jake@jake.jake', '')).rejects.toThrow(BadRequestException);
    });

    it('should generate JWT token on successful login', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersRepository.findOne.mockResolvedValue(mockUser);

      await service.login('jake@jake.jake', 'jakejake12');

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: 'jake@jake.jake',
      });
    });
  });

  describe('create', () => {
    it('should successfully create a new user with valid data', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        username: 'NewUser',
        password: 'password123',
      };

      const newUser: User = {
        id: 2,
        email: 'newuser@example.com',
        username: 'NewUser',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      usersRepository.findOne.mockResolvedValue(null); // Email doesn't exist
      usersRepository.create.mockReturnValue(newUser);
      usersRepository.save.mockResolvedValue(newUser);

      const result = await service.create(createUserDto);

      expect(result).toHaveProperty('user');
      expect(result.user.id).toBe(2);
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.username).toBe('NewUser');
      expect(result.user).toHaveProperty('token');
      expect(result.user.token).toBe('test-token');
    });

    it('should hash the password before saving', async () => {
      const createUserDto = {
        email: 'hashtest@example.com',
        username: 'HashTest',
        password: 'plainpassword123',
      };

      const newUser: User = {
        id: 3,
        email: 'hashtest@example.com',
        username: 'HashTest',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(newUser);
      usersRepository.save.mockResolvedValue(newUser);

      await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword123', 10);
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto = {
        email: 'jake@jake.jake',
        username: 'Jake2',
        password: 'password123',
      };

      usersRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when email is missing', async () => {
      const createUserDto = {
        email: '',
        username: 'User',
        password: 'password123',
      };

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when username is missing', async () => {
      const createUserDto = {
        email: 'user@example.com',
        username: '',
        password: 'password123',
      };

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when password is missing', async () => {
      const createUserDto = {
        email: 'user@example.com',
        username: 'User',
        password: '',
      };

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should save the user with hashed password', async () => {
      const createUserDto = {
        email: 'savetest@example.com',
        username: 'SaveTest',
        password: 'password123',
      };

      const newUser: User = {
        id: 4,
        email: 'savetest@example.com',
        username: 'SaveTest',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(newUser);
      usersRepository.save.mockResolvedValue(newUser);

      await service.create(createUserDto);

      expect(usersRepository.create).toHaveBeenCalledWith({
        email: 'savetest@example.com',
        username: 'SaveTest',
        passwordHash: 'hashed_password',
      });
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
    });

    it('should generate JWT token for new user', async () => {
      const createUserDto = {
        email: 'jwttest@example.com',
        username: 'JwtTest',
        password: 'password123',
      };

      const newUser: User = {
        id: 5,
        email: 'jwttest@example.com',
        username: 'JwtTest',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(newUser);
      usersRepository.save.mockResolvedValue(newUser);

      await service.create(createUserDto);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 5,
        email: 'jwttest@example.com',
      });
    });
  });
});
