import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DemandeDahiraPage } from './demande-dahira.page';

const routes: Routes = [
  {
    path: '',
    component: DemandeDahiraPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DemandeDahiraPageRoutingModule {}
