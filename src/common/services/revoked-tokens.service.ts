import { Injectable } from '@nestjs/common';

@Injectable()
export class RevokedTokensService {
  private readonly revokedTokens = new Map<string, number | undefined>();

  revokeToken(token: string, expiresAtUnix?: number): void {
    this.cleanupExpiredTokens();
    this.revokedTokens.set(token, expiresAtUnix);
  }

  isTokenRevoked(token: string): boolean {
    this.cleanupExpiredTokens();
    return this.revokedTokens.has(token);
  }

  private cleanupExpiredTokens(): void {
    const now = Math.floor(Date.now() / 1000);

    for (const [token, expiresAtUnix] of this.revokedTokens.entries()) {
      if (expiresAtUnix !== undefined && expiresAtUnix <= now) {
        this.revokedTokens.delete(token);
      }
    }
  }
}
