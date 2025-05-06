import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetailOuvragePage } from './detail-ouvrage.page';

const routes: Routes = [
  {
    path: '',
    component: DetailOuvragePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailOuvragePageRoutingModule {}
