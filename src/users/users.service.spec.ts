import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
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

});
