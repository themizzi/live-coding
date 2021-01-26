import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ListModule} from './list/list.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {environment} from 'src/environments/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ListModule,
    BrowserAnimationsModule,
    environment.backendModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
