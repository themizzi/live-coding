import {Type} from '@angular/core';

export interface Environment {
  production: boolean;
  backendModule: Type<unknown>;
}
