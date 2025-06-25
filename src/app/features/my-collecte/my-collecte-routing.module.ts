import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyCollectePage } from './my-collecte.page';

const routes: Routes = [
  {
    path: '',
    component: MyCollectePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyCollectePageRoutingModule {}
