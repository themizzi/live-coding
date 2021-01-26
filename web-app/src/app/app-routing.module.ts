import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ListComponent, Resolver} from './list/list.component';

const routes: Routes = [
  {
    path: '',
    component: ListComponent,
    resolve: {
      items: Resolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
