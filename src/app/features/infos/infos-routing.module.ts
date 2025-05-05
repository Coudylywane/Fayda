import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfosPage } from './infos.page';

const routes: Routes = [
  {
    path: '',
    component: InfosPage
  },  {
    path: 'detail-infos',
    loadChildren: () => import('./pages/detail-infos/detail-infos.module').then( m => m.DetailInfosPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfosPageRoutingModule {}
