import 'dotenv/config';
import { AppDataSource } from '../src/database/data-source';

async function clearDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('🔄 Clearing all tables...');
    const tables = ['users', 'typeorm_migrations'];
    
    for (const table of tables) {
      try {
        await AppDataSource.query(`TRUNCATE TABLE "${table}" CASCADE;`);
        console.log(`✅ Cleared table: ${table}`);
      } catch (error) {
        console.log(`⏭️  Table ${table} does not exist or already cleared`);
      }
    }

    console.log('✅ Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

clearDatabase();
