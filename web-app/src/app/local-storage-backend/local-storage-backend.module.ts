import {APP_INITIALIZER, NgModule} from '@angular/core';
import {SERVICE} from '../list/list.component';
import {ListService} from './list.service';
import {Items, ITEMS} from '../local-storage-backend/list.service';

const items: Items = {items: []};

@NgModule({
  providers: [
    {
      provide: SERVICE,
      deps: [ITEMS],
      useClass: ListService,
    },
    {
      provide: ITEMS,
      useValue: items,
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useValue: () => {
        const itemData: Items = JSON.parse(
          localStorage.getItem('items') ?? '[]'
        );
        console.log('Loaded local storage items.', itemData);
        items.incrementor = itemData.incrementor;
        items.items.push(...(itemData.items ?? []));
      },
    },
  ],
})
export class LocalStorageBackendModule {}
