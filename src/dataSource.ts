// ormconfig.js or dataSource.ts
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'gbubemi.postgres.database.azure.com',
  port: 5432,
  username: 'zoomtime',
  password: 'webnet123@',
  database: 'aid_Dev',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_typeorm',
  migrationsRun: false, // Set to true if you want migrations to run automatically
});