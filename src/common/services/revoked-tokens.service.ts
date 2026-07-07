import { createHash } from 'crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { createClient } from 'redis';
import { REDIS_CLIENT } from '../constants/redis.constants';

type RedisClient = ReturnType<typeof createClient>;

@Injectable()
export class RevokedTokensService {
  private readonly logger = new Logger(RevokedTokensService.name);
  private readonly revokedTokens = new Map<string, number | undefined>();
  private hasLoggedFallback = false;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClient | null,
  ) {}

  async revokeToken(token: string, expiresAtUnix?: number): Promise<void> {
    const key = this.getRedisKey(token);
    const ttlInSeconds =
      expiresAtUnix !== undefined ? expiresAtUnix - Math.floor(Date.now() / 1000) : undefined;

    if (ttlInSeconds !== undefined && ttlInSeconds <= 0) {
      return;
    }

    if (!this.redisClient) {
      this.logFallbackOnce();
      this.revokedTokens.set(token, expiresAtUnix);
      this.cleanupExpiredTokens();
      return;
    }

    if (ttlInSeconds !== undefined) {
      await this.redisClient.setEx(key, ttlInSeconds, '1');
      return;
    }

    await this.redisClient.set(key, '1');
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    if (!this.redisClient) {
      this.logFallbackOnce();
      this.cleanupExpiredTokens();
      return this.revokedTokens.has(token);
    }

    const result = await this.redisClient.exists(this.getRedisKey(token));
    return result === 1;
  }

  private cleanupExpiredTokens(): void {
    const now = Math.floor(Date.now() / 1000);

    for (const [revokedToken, expiresAtUnix] of this.revokedTokens.entries()) {
      if (expiresAtUnix !== undefined && expiresAtUnix <= now) {
        this.revokedTokens.delete(revokedToken);
      }
    }
  }

  private logFallbackOnce(): void {
    if (this.hasLoggedFallback) {
      return;
    }

    this.logger.warn('Using in-memory revoked token storage because Redis is unavailable.');
    this.hasLoggedFallback = true;
  }

  private getRedisKey(token: string): string {
    // Store a digest instead of the raw JWT so Redis keys do not expose credentials.
    const tokenHash = createHash('sha256').update(token).digest('hex');
    return `revoked_token:${tokenHash}`;
  }
}
