import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateCollectPage } from './create-collect.page';

const routes: Routes = [
  {
    path: '',
    component: CreateCollectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateCollectPageRoutingModule {}
