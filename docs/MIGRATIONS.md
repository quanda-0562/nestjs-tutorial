# Database Migrations Guide

This project uses TypeORM migrations for database schema management instead of auto-sync. This ensures safe database evolution in production environments.

## Overview

**Why migrations instead of auto-sync?**
- ✅ Safe in production - no risk of data loss from schema changes
- ✅ Version control - explicit record of all schema changes
- ✅ Audit trail - track when and what changed
- ✅ Rollback capability - revert changes if needed

## Configuration

### Files

1. **src/database/data-source.ts** - TypeORM CLI configuration for migration tools
2. **src/database/database.config.ts** - Application runtime configuration
3. **src/migrations/*.ts** - Migration files
4. **.env** - PostgreSQL configuration
5. **.env.test** - Test database configuration

### Environment Behavior

- **Test**: PostgreSQL `nestjs_tutorial_test` with `synchronize: true` and `dropSchema: true` (auto-clean for each test run)
- **Development**: PostgreSQL `nestjs_tutorial` with `migrationsRun: true` (auto-run migrations)
- **Production**: PostgreSQL with `migrationsRun: true` (auto-run migrations)

## Available Commands

```bash
# Build the project (generates JS files in dist/migrations/)
npm run build

# Run pending migrations
npm run migration:run

# Revert the last executed migration
npm run migration:revert

# Show list of executed/pending migrations
npm run migration:show

# Create a new migration manually
npm run migration:create -- -n MigrationName

# Generate migration from entity changes (advanced)
npm run migration:generate -- -n MigrationName
```

## Current Migrations

### 1704000000000-CreateUserTable
Creates the base `users` table with:
- `id` (INT, primary key, auto-increment)
- `email` (VARCHAR, unique)
- `username` (VARCHAR)
- `passwordHash` (VARCHAR)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## How Migrations Work

1. **Application Startup**: When the app starts, it automatically runs any pending migrations
2. **typeorm_migrations Table**: TypeORM tracks executed migrations in this table
3. **Sequential Execution**: Migrations run in timestamp order (1704000000000, 1704000000001, etc.)

## Creating New Migrations

### Option 1: Auto-generate from entity changes (recommended)

```bash
npm run build
npm run migration:generate -- -n AddNewColumn
```

This automatically detects entity changes and creates an appropriate migration.

### Option 2: Manually create a migration

```bash
npm run migration:create -- -n AddNewColumn
```

Then edit the generated file in `src/migrations/` to add your schema changes.

## Example: Adding a new column

1. Modify the entity (`src/users/entities/user.entity.ts`):
```typescript
@Column({ nullable: true })
profile?: string;
```

2. Generate the migration:
```bash
npm run build
npm run migration:generate -- -n AddProfileToUser
```

3. Review the generated migration and test:
```bash
npm run build
npm test       # Verify no tests break
npm run test:e2e
```

4. Commit the migration file to git

## Migration File Structure

Each migration implements `MigrationInterface`:

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddProfileToUser1704000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Forward migration - add the column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'profile',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback - remove the column
    await queryRunner.dropColumn('users', 'profile');
  }
}
```

- `up()`: Applies the migration
- `down()`: Reverts the migration (for rollback)

## Testing Migrations

### 1. Test environment (auto uses synchronize: true)
```bash
npm test
npm run test:e2e
```

### 2. Development with PostgreSQL
```bash
# Start the app - migrations run automatically on startup
npm run start:dev

# Check migration status
npm run migration:show
```

### 3. Manual migration control
```bash
# Run pending migrations
npm run migration:run

# Revert last migration (use carefully!)
npm run migration:revert
```

## Best Practices

✅ **DO:**
- Always create a migration for schema changes
- Test migrations before deploying to production
- Use descriptive migration names (e.g., `1704000000001-AddEmailVerificationColumn`)
- Include both `up()` and `down()` methods
- Commit migration files to git
- Run migrations automatically on application startup

❌ **DON'T:**
- Manually edit database without migrations
- Use `synchronize: true` in production
- Skip testing migrations
- Modify old migrations (create new ones instead)

## Troubleshooting

### Migration not running
```bash
# Check migration status
npm run migration:show

# Verify build output
ls -la dist/migrations/

# Check database connection
npm run start
```

### Need to rollback
```bash
npm run migration:revert
npm run start
```

### New developers setup
```bash
npm install
npm run build
npm run start  # Migrations run automatically
```

## Switching from synchronize: true to migrations

This project already has migrations configured. If you were using `synchronize: true`:

1. ✅ Disable synchronize in `.env`: `DATABASE_SYNCHRONIZE=false`
2. ✅ Create migrations for existing schema (done - see 1704000000000-CreateUserTable)
3. ✅ Update `database.config.ts` to enable migrations (done)
4. ✅ Test thoroughly with migrations
5. ✅ Deploy to production

All steps are complete and tested!
