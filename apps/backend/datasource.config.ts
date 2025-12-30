import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import databaseConfig from './src/config/database.config';

config();

const datasourceOptions = {
  ...databaseConfig(),
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  extra: {
    socketTimeout: 60000, // Increase timeout
  },
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
} as DataSourceOptions;

export default new DataSource(datasourceOptions);
