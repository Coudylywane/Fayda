import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyDahiraPage } from './my-dahira.page';

const routes: Routes = [
  {
    path: '',
    component: MyDahiraPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyDahiraPageRoutingModule {}
