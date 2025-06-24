import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DisciplesPage } from './disciples.page';

const routes: Routes = [
  {
    path: '',
    component: DisciplesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DisciplesPageRoutingModule {}
