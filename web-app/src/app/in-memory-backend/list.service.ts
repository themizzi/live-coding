import {Inject, Injectable, InjectionToken} from '@angular/core';
import {Item as BaseItem, Service} from '../list/list.component';

export const ITEMS = new InjectionToken<Item[]>('ITEMS');

interface Item extends BaseItem {
  completed?: boolean;
}

export interface Items {
  items: Item[];
  incrementor?: number;
}

@Injectable()
export class ListService implements Service {
  constructor(@Inject(ITEMS) private readonly items: Items) {}

  select(item: BaseItem, checked: boolean) {
    const index = this.items.items.indexOf(item);
    this.items.items[index].completed = checked;
    return Promise.resolve(this.save());
  }

  add(task: string) {
    const id = (this.items.incrementor ?? 0) + 1;
    this.items.items.push({
      id: `${id}`,
      title: task,
    });
    this.items.incrementor = id;
    return Promise.resolve(this.save());
  }

  delete(item: Item) {
    delete this.items.items[this.items.items.indexOf(item)];
    return Promise.resolve(this.save());
  }

  private reduce() {
    return this.items.items.reduce(
      (previous, current) =>
        current.completed
          ? {
              complete: [...previous.complete, current],
              incomplete: previous.incomplete,
            }
          : {
              complete: previous.complete,
              incomplete: [...previous.incomplete, current],
            },
      {complete: [], incomplete: []} as {
        complete: BaseItem[];
        incomplete: BaseItem[];
      }
    );
  }

  private save() {
    return this.reduce();
  }

  load() {
    return Promise.resolve(this.reduce());
  }
}
