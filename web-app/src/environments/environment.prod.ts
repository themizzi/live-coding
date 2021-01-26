import {LocalStorageBackendModule} from 'src/app/local-storage-backend/local-storage-backend.module';
import {Environment} from './environment.interface';

export const environment: Environment = {
  production: true,
  backendModule: LocalStorageBackendModule,
};
