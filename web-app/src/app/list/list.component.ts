import {
  Component,
  EventEmitter,
  Inject,
  Injectable,
  InjectionToken,
  Input,
  Optional,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {ActivatedRoute, Resolve} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';

export const ITEMS = new InjectionToken<Item[]>('ITEMS');
export const CONTROLLER = new InjectionToken<ControllerContract>('CONTROLLER');
export const SERVICE = new InjectionToken<Service>('SERVICE');

export const routeDataFactory = (path: string) => (route?: ActivatedRoute) => {
  return route?.snapshot.data[path];
};

export interface Item {
  readonly id: string;
  readonly title?: string;
}

export interface Items {
  readonly complete?: Item[];
  readonly incomplete?: Item[];
}

export interface Service {
  load?: () => Promise<Items>;
  select?: (item: Item, checked: boolean) => Promise<Items>;
  add?: (task: string) => Promise<Items>;
  delete?: (item: Item) => Promise<Items>;
}

@Injectable()
export class Resolver implements Resolve<Items> {
  constructor(@Optional() @Inject(SERVICE) private readonly service: Service) {}

  async resolve(): Promise<Items> {
    return this.service?.load?.call(this.service) ?? Promise.resolve({});
  }
}

export interface ControllerContract {
  readonly items?: Observable<Items>;
  add?: (task: string) => Promise<void>;
  select?: (item: Item, checked: boolean) => Promise<void>;
  delete?: (item: Item) => Promise<void>;
}

@Injectable()
export class Controller implements ControllerContract {
  private readonly _items: BehaviorSubject<Items>;

  constructor(
    @Optional() @Inject(ITEMS) items?: Items,
    @Optional() @Inject(SERVICE) private readonly service?: Service
  ) {
    this._items = new BehaviorSubject<Items>(items ?? {});
  }

  get items() {
    return this._items.asObservable();
  }

  async select(item: Item, checked: boolean) {
    this._items.next(
      this.service?.select
        ? await this.service.select(item, checked)
        : this._items.value
    );
  }

  async add(task: string) {
    this._items.next(
      this.service?.add ? await this.service.add(task) : this._items.value
    );
  }

  async delete(item: Item) {
    this._items.next(
      this.service?.delete ? await this.service.delete(item) : this._items.value
    );
  }
}

@Component({
  selector: 'app-list-item',
  template: `
    <mat-list-item>
      <button
        mat-icon-button
        color="primary"
        (click)="delete.emit()"
        id="delete-task"
      >
        <mat-icon>delete_outline</mat-icon>
      </button>
      <mat-checkbox
        id="complete-task"
        (change)="change.emit($event.checked)"
        [checked]="checked"
      ></mat-checkbox>
      <span matLine><ng-content></ng-content></span>
    </mat-list-item>
  `,
})
export class ListItemComponent {
  @Output() change = new EventEmitter<boolean>();
  @Output() delete = new EventEmitter<void>();
  @Input() checked = false;
}

@Component({
  selector: 'app-list',
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-container *ngIf="controller?.items">
      <div
        class="task-list"
        *ngIf="controller.items | async as items"
        id="task-list"
      >
        <div class="task-list__items-container" id="incomplete-tasks-list">
          <mat-list class="task-list__items">
            <div class="task-list__item-container" *ngIf="items.incomplete">
              <app-list-item
                class="task-list__item"
                *ngFor="let item of items.incomplete"
                [id]="'item-' + item.id"
                (change)="change(item, $event)"
                (delete)="delete(item)"
              >
                <span>{{ item.title }}</span>
              </app-list-item>
            </div>
            <ng-container *ngIf="items.complete">
              <div
                class="task-list__item-container"
                *ngIf="items.complete as complete"
                id="completed-tasks-list"
              >
                <h3 matSubheader *ngIf="items.complete.length > 0">
                  <button
                    id="expand-complete-tasks"
                    color="primary"
                    mat-icon-button
                    (click)="toggleCompleted()"
                  >
                    <mat-icon>{{
                      showCompleted ? 'expand_more' : 'chevron_right'
                    }}</mat-icon>
                  </button>
                  <span id="completed-tasks">
                    Completed ({{ items.complete.length }})
                  </span>
                </h3>
                <ng-container *ngIf="showCompleted">
                  <app-list-item
                    class="task-list__item"
                    *ngFor="let item of items.complete"
                    [id]="'item-' + item.id"
                    (change)="change(item, $event)"
                    [checked]="true"
                    (delete)="delete(item)"
                  >
                    <span>{{ item.title }}</span>
                  </app-list-item>
                </ng-container>
              </div>
            </ng-container>
          </mat-list>
        </div>
        <div class="task-list__add-task">
          <form (ngSubmit)="add()" class="task-list__form" id="add-task-form">
            <mat-form-field class="task-list__input" appearance="outline">
              <mat-icon matPrefix>add</mat-icon>
              <mat-label>Add a task</mat-label>
              <input
                id="add-task"
                #input
                matInput
                [(ngModel)]="newTask"
                [ngModelOptions]="{standalone: true}"
              />
            </mat-form-field>
            <input id="submit" type="submit" hidden />
          </form>
        </div>
      </div>
    </ng-container>
  `,
  styles: [
    `
      .task-list {
        width: 100%;
      }
    `,
    `
      .task-list__add-task {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
      }
    `,
    `
      .task-list__input {
        width: 100%;
      }
    `,
    `
      .task-list__item {
        position: relative;
      }
    `,
    `
      .task-list__items-container {
        max-height: 100%;
        position: absolute;
        overflow-y: auto;
        width: 100%;
      }
    `,
    `
      .task-list__form .mat-form-field {
        border-radius: 6px;
      }
    `,
    `
      .task-list__form .mat-form-field .mat-form-field-wrapper {
        margin-bottom: 4px;
        margin-left: 4px;
        margin-right: 4px;
        padding-bottom: 0;
      }
    `,
  ],
  providers: [
    {
      provide: ITEMS,
      deps: [[new Optional(), ActivatedRoute]],
      useFactory: routeDataFactory('items'),
    },
    {
      provide: CONTROLLER,
      useClass: Controller,
    },
  ],
})
export class ListComponent {
  showCompleted = false;
  newTask?: string;

  constructor(
    @Optional()
    @Inject(CONTROLLER)
    public readonly controller: ControllerContract
  ) {}

  change(item: Item, checked: boolean) {
    this.controller?.select?.call(this.controller, item, checked);
  }

  toggleCompleted() {
    this.showCompleted = !this.showCompleted;
  }

  add() {
    if (this.newTask) {
      this.controller?.add?.call(this.controller, this.newTask);
      this.newTask = undefined;
    }
  }

  delete(item: Item) {
    this.controller?.delete?.call(this.controller, item);
  }
}
