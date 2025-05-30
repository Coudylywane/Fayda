import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetailDahiraPage } from './detail-dahira.page';

const routes: Routes = [
  {
    path: '',
    component: DetailDahiraPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailDahiraPageRoutingModule {}
