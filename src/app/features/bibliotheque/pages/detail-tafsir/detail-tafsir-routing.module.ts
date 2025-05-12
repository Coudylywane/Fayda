import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetailTafsirPage } from './detail-tafsir.page';

const routes: Routes = [
  {
    path: '',
    component: DetailTafsirPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailTafsirPageRoutingModule {}
