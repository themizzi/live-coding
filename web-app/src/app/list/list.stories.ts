import {ListComponent} from './list.component';
import {ListModule} from './list.module';
// eslint-disable-next-line node/no-unpublished-import
import {Meta, Story, moduleMetadata} from '@storybook/angular';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

const meta: Meta<ListComponent> = {
  title: 'List',
  decorators: [
    moduleMetadata({
      imports: [CommonModule, ListModule, NoopAnimationsModule],
    }),
  ],
};

export default meta;

export const Default: Story<ListComponent> = () => ({
  component: ListComponent,
});

export const WithIncompleteItem: Story<ListComponent> = () => ({
  component: ListComponent,
  moduleMetadata: {
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            data: {
              incomplete: [
                {
                  title: 'item 1',
                },
              ],
            },
          },
        },
      },
    ],
  },
});

export const WithCompleteItem: Story<ListComponent> = () => ({
  component: ListComponent,
  moduleMetadata: {
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            data: {
              complete: [
                {
                  title: 'item 1',
                },
              ],
            },
          },
        },
      },
    ],
  },
});

export const WithIncompleteAndCompleteItem: Story<ListComponent> = () => ({
  component: ListComponent,
  moduleMetadata: {
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            data: {
              complete: [
                {
                  title: 'item 1',
                },
              ],
              incomplete: [
                {
                  title: 'item 1',
                  completed: false,
                },
              ],
            },
          },
        },
      },
    ],
  },
});
