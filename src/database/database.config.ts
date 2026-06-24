import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  
  if (nodeEnv === 'test') {
    // Better SQLite3 in-memory database for testing
    return {
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [User],
      synchronize: true,
      logging: false,
    } as TypeOrmModuleOptions;
  }

  // PostgreSQL for development and production
  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DATABASE_USER', 'postgres'),
    password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
    database: configService.get<string>('DATABASE_NAME', 'nestjs_tutorial'),
    entities: [User],
    synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE', false),
    logging: configService.get<boolean>('DATABASE_LOGGING', false),
  };
};
