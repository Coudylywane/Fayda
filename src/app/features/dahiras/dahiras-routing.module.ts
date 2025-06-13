import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DahirasPage } from './dahiras.page';

const routes: Routes = [
  {
    path: '',
    component: DahirasPage
  },
  {
    path: 'detail/:id',
    loadChildren: () => import('./pages/detail-dahira/detail-dahira.module').then( m => m.DetailDahiraPageModule)
  },
  


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DahirasPageRoutingModule {}
