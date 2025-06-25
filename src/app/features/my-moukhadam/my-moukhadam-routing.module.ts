import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyMoukhadamPage } from './my-moukhadam.page';

const routes: Routes = [
  {
    path: '',
    component: MyMoukhadamPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyMoukhadamPageRoutingModule {}
