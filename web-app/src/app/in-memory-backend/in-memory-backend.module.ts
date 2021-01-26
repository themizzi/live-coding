import {NgModule} from '@angular/core';
import {SERVICE} from '../list/list.component';
import {ITEMS, ListService} from './list.service';

if (!((window as unknown) as {items: unknown}).items) {
  const items = {items: []};
  ((window as unknown) as {items: unknown}).items = items;
}

@NgModule({
  providers: [
    {
      provide: SERVICE,
      deps: [ITEMS],
      useClass: ListService,
    },
    {
      provide: ITEMS,
      useValue: ((window as unknown) as {items: unknown}).items,
    },
  ],
})
export class InMemoryBackendModule {}
