import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {ListComponent, ListItemComponent, Resolver} from './list.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [ListComponent, ListItemComponent],
  imports: [
    CommonModule,
    MatListModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
  ],
  exports: [ListComponent],
  providers: [
    {
      provide: Resolver,
      useClass: Resolver,
    },
  ],
})
export class ListModule {}
