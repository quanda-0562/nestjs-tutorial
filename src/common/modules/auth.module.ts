import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createClient } from 'redis';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { User } from '../../users/entities/user.entity';
import { REDIS_CLIENT } from '../constants/redis.constants';
import { RevokedTokensService } from '../services/revoked-tokens.service';

type RedisClient = ReturnType<typeof createClient>;

/**
 * AuthModule
 *
 * Shared authentication module that provides:
 * - JWT strategy for route protection
 * - Passport configuration
 * - JWT token signing and verification
 *
 * This module should be imported by any feature module that needs authentication.
 */
@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresIn = configService.get<string>('JWT_EXPIRATION') || '24h';
        return {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expiresIn: expiresIn as any,
          },
        };
      },
    }),
  ],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<RedisClient | null> => {
        const logger = new Logger('RedisClient');
        const client = createClient({
          url: configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
          socket: {
            reconnectStrategy: false,
          },
        });

        client.on('error', (error: Error) => {
          logger.error(error.message, error.stack);
        });

        try {
          await client.connect();
          logger.log('Connected to Redis');
          return client;
        } catch (error) {
          logger.warn('Redis is unavailable, revoked token storage will fall back to in-memory.');
          return null;
        }
      },
    },
    JwtStrategy,
    RevokedTokensService,
  ],
  exports: [JwtModule, PassportModule, JwtStrategy, RevokedTokensService],
})
export class AuthModule {}
