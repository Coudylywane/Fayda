import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsLayoutPage } from './tabs-layout.page';

const routes: Routes = [
  {
    path: '',
    component: TabsLayoutPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'infos',
        loadChildren: () => import('../infos/infos.module').then(m => m.InfosPageModule)
      },
      {
        path: 'bibliotheque',
        loadChildren: () => import('../bibliotheque/bibliotheque.module').then(m => m.BibliothequePageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'finances',
        loadChildren: () => import('../finances/finances.module').then( m => m.FinancesPageModule)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsLayoutPageRoutingModule {}
