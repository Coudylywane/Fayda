import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetailInfosPage } from './detail-infos.page';

const routes: Routes = [
  {
    path: '',
    component: DetailInfosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailInfosPageRoutingModule {}
