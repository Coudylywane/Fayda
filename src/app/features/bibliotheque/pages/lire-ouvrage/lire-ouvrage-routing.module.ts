import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LireOuvragePage } from './lire-ouvrage.page';

const routes: Routes = [
  {
    path: '',
    component: LireOuvragePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LireOuvragePageRoutingModule {}
