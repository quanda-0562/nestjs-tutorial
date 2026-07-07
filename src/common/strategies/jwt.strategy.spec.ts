import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../../users/entities/user.entity';
import { RevokedTokensService } from '../services/revoked-tokens.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersRepository: { findOne: jest.Mock };
  let revokedTokensService: { isTokenRevoked: jest.Mock };

  const mockUser: User = {
    id: 1,
    email: 'jake@jake.jake',
    username: 'Jake',
    passwordHash: 'hashed_password',
    bio: undefined,
    image: undefined,
    following: [],
    followers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersRepository = {
      findOne: jest.fn(),
    };

    revokedTokensService = {
      isTokenRevoked: jest.fn().mockResolvedValue(false),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
          },
        },
        {
          provide: RevokedTokensService,
          useValue: revokedTokensService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should reject a revoked token', async () => {
    revokedTokensService.isTokenRevoked.mockResolvedValue(true);
    const req = {
      headers: {
        authorization: 'Bearer revoked-token',
      },
    } as Request;

    await expect(
      strategy.validate(req, { sub: 1, email: 'jake@jake.jake' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(usersRepository.findOne).not.toHaveBeenCalled();
  });

  it('should return the current user for a valid token', async () => {
    usersRepository.findOne.mockResolvedValue(mockUser);
    const req = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    } as Request;

    const result = await strategy.validate(req, { sub: 1, email: 'jake@jake.jake' });

    expect(revokedTokensService.isTokenRevoked).toHaveBeenCalledWith('valid-token');
    expect(result).toEqual(mockUser);
  });
});
