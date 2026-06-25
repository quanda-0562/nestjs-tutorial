<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

NestJS Tutorial Project - A complete authentication system with JWT, TypeORM migrations, PostgreSQL database, internationalization (i18n), and comprehensive testing.

### Features

- **Authentication**: JWT-based login with bcrypt password hashing
- **Database**: PostgreSQL with TypeORM migrations (no auto-sync)
- **Internationalization**: Multi-language error messages (English, Vietnamese)
- **Testing**: Unit tests and E2E tests with 100% coverage for auth
- **API Documentation**: Swagger/OpenAPI support
- **Production Ready**: Safe schema evolution with migrations

## Requirements

- Node.js 18+
- PostgreSQL 15+
- npm 9+

## Project Setup

```bash
$ npm install
```

### Create Databases

```bash
createdb -h localhost nestjs_tutorial
createdb -h localhost nestjs_tutorial_test
```

## Environment Configuration

Create `.env` file (or use `.env.example` as template):

```
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_user
DATABASE_PASSWORD=
DATABASE_NAME=nestjs_tutorial
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
```

## Compile and Run

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run build
$ npm run start:prod
```

## Database Migrations

```bash
# Run pending migrations (auto-runs on app startup)
$ npm run migration:run

# Show migration status
$ npm run migration:show

# Revert last migration
$ npm run migration:revert

# Generate migration from entity changes
$ npm run build
$ npm run migration:generate -- -n MigrationName
```

See [docs/MIGRATIONS.md](docs/MIGRATIONS.md) for complete migration guide.

## Run Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Endpoints

### Authentication
- `POST /api/users/login` - Login with email and password
  ```json
  {
    "user": {
      "email": "user@example.com",
      "password": "password123"
    }
  }
  ```

## Documentation

- [MIGRATIONS.md](docs/MIGRATIONS.md) - Complete migration guide

## Project Structure

```
src/
├── database/
│   ├── data-source.ts        # TypeORM CLI configuration
│   └── database.config.ts    # Database configuration factory
├── migrations/
│   └── 1704000000000-CreateUserTable.ts
├── users/
│   ├── entities/
│   │   └── user.entity.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── user.dto.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── users.module.ts
├── common/
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── utils/
│       └── i18n.utils.ts
├── i18n/
│   ├── i18n.config.ts
│   ├── i18n.decorator.ts
│   └── locales/
│       ├── en.json
│       └── vi.json
├── swagger/
│   └── swagger.config.ts
├── app.controller.ts
├── app.module.ts
└── main.ts
```

## Deployment

When deploying to production:

1. Set appropriate environment variables
2. Ensure PostgreSQL is running and accessible
3. Run migrations automatically (enabled by default)
4. Build and deploy

```bash
npm run build
NODE_ENV=production npm run start:prod
```

Migrations will run automatically on app startup.

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT Guide](https://tools.ietf.org/html/rfc7519)

## License

MIT
