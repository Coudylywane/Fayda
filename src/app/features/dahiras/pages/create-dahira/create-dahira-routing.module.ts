import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateDahiraPage } from './create-dahira.page';

const routes: Routes = [
  {
    path: '',
    component: CreateDahiraPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateDahiraPageRoutingModule {}
