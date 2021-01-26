import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';
import {ListModule} from './list/list.module';

describe('AppComponent', () => {
  it('should create the app', async () => {
    // GIVEN
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ListModule],
      declarations: [AppComponent],
    }).compileComponents();

    // WHEN
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    // THEN
    expect(app).toBeTruthy();
  });
});
