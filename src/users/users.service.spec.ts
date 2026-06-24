import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('jake@jake.jake', 'jakejake');

      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
      expect(result.user.email).toBe('jake@jake.jake');
      expect(result.user).toHaveProperty('token');
      expect(result.user.token).toBe('test-token');
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('jake@jake.jake', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with non-existent email', async () => {
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

      await service.login('jake@jake.jake', 'jakejake');

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: expect.any(Number),
        email: 'jake@jake.jake',
      });
    });
  });

  describe('validateUser', () => {
    it('should return user when valid id is provided', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // First login to ensure user exists
      await service.login('jake@jake.jake', 'jakejake');

      // Then validate
      const user = await service.validateUser(1);
      expect(user).toBeDefined();
      expect(user?.email).toBe('jake@jake.jake');
    });

    it('should return null for non-existent user id', async () => {
      const user = await service.validateUser(999);
      expect(user).toBeNull();
    });
  });
});
