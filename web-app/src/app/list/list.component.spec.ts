import {TestBed} from '@angular/core/testing';

import {ListComponent, SERVICE} from './list.component';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatCheckboxHarness} from '@angular/material/checkbox/testing';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ActivatedRoute} from '@angular/router';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {Provider} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatInputHarness} from '@angular/material/input/testing';
import {By} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';

describe('ListComponent', () => {
  const setup = async (props?: {providers?: Provider[]}) => {
    await TestBed.configureTestingModule({
      declarations: [ListComponent],
      imports: [
        MatListModule,
        MatExpansionModule,
        NoopAnimationsModule,
        MatCheckboxModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        FormsModule,
      ],
      providers: props?.providers,
    }).compileComponents();
  };

  it('should create', async () => {
    await setup();
    const fixture = TestBed.createComponent(ListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  fit('should call selected on service', async () => {
    // GIVEN
    const mockService = jasmine.createSpyObj('service', ['select']);
    const item = {id: 'test-item'};
    setup({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                items: {incomplete: [item]},
              },
            },
          },
        },
        {
          provide: SERVICE,
          useValue: mockService,
        },
      ],
    });

    // WHEN
    const fixture = TestBed.createComponent(ListComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const harness = await loader.getHarness(MatCheckboxHarness);
    await harness.toggle();

    // THEN
    expect(mockService.select).toHaveBeenCalledWith(item, true);
  });

  it('should call add on service', async () => {
    // GIVEN
    const mockService = jasmine.createSpyObj('service', ['add']);
    await setup({
      providers: [
        {
          provide: SERVICE,
          useValue: mockService,
        },
      ],
    });

    // WHEN
    const fixture = TestBed.createComponent(ListComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const harness = await loader.getHarness(MatInputHarness);
    await harness.setValue('test');
    const submit = fixture.debugElement.query(By.css('#submit')).nativeElement;

    await fixture.whenStable();
    submit.click();

    // // THEN
    expect(mockService.add).toHaveBeenCalledWith('test');
  });
});
