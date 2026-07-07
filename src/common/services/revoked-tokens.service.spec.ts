import { Test, TestingModule } from '@nestjs/testing';
import { REDIS_CLIENT } from '../constants/redis.constants';
import { RevokedTokensService } from './revoked-tokens.service';

describe('RevokedTokensService', () => {
  let service: RevokedTokensService;
  let redisClient: {
    exists: jest.Mock;
    set: jest.Mock;
    setEx: jest.Mock;
  };

  beforeEach(async () => {
    redisClient = {
      exists: jest.fn(),
      set: jest.fn(),
      setEx: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevokedTokensService,
        {
          provide: REDIS_CLIENT,
          useValue: redisClient,
        },
      ],
    }).compile();

    service = module.get<RevokedTokensService>(RevokedTokensService);
  });

  it('should store revoked tokens with ttl when expiration is in the future', async () => {
    const futureExpiration = Math.floor(Date.now() / 1000) + 3600;

    await service.revokeToken('token-value', futureExpiration);

    expect(redisClient.setEx).toHaveBeenCalledWith(
      expect.stringMatching(/^revoked_token:/),
      expect.any(Number),
      '1',
    );
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it('should skip storing tokens that are already expired', async () => {
    const expiredAt = Math.floor(Date.now() / 1000) - 10;

    await service.revokeToken('token-value', expiredAt);

    expect(redisClient.setEx).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it('should store revoked tokens without ttl when no expiration is provided', async () => {
    await service.revokeToken('token-value');

    expect(redisClient.set).toHaveBeenCalledWith(expect.stringMatching(/^revoked_token:/), '1');
    expect(redisClient.setEx).not.toHaveBeenCalled();
  });

  it('should report revoked tokens from redis', async () => {
    redisClient.exists.mockResolvedValue(1);

    await expect(service.isTokenRevoked('token-value')).resolves.toBe(true);
    expect(redisClient.exists).toHaveBeenCalledWith(expect.stringMatching(/^revoked_token:/));
  });

  it('should report non-revoked tokens from redis', async () => {
    redisClient.exists.mockResolvedValue(0);

    await expect(service.isTokenRevoked('token-value')).resolves.toBe(false);
  });

  it('should fall back to in-memory storage when redis is unavailable', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevokedTokensService,
        {
          provide: REDIS_CLIENT,
          useValue: null,
        },
      ],
    }).compile();

    const fallbackService = module.get<RevokedTokensService>(RevokedTokensService);

    await fallbackService.revokeToken('token-value', Math.floor(Date.now() / 1000) + 60);

    await expect(fallbackService.isTokenRevoked('token-value')).resolves.toBe(true);
  });
});
