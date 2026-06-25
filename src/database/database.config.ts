import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // PostgreSQL for all environments (test, dev, production)
  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DATABASE_USER', 'postgres'),
    password: configService.get<string>('DATABASE_PASSWORD', ''),
    database: configService.get<string>('DATABASE_NAME', 'nestjs_tutorial'),
    entities: [User],
    synchronize: nodeEnv === 'test',
    dropSchema: nodeEnv === 'test',
    migrations: nodeEnv !== 'test' ? ['dist/migrations/*.js'] : [],
    migrationsRun: false,
    logging: configService.get<boolean>('DATABASE_LOGGING', false),
  };
};
