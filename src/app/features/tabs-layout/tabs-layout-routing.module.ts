import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsLayoutPage } from './tabs-layout.page';
import { RoleGuard } from '../auth/guards/role.guard';
import { UserRole } from '../auth/models/user.model';

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
        loadChildren: () => import('../infos/infos.module').then(m => m.InfosPageModule),
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.DISCIPLE, UserRole.MOUKHADAM] // doit avoir au moins un des deux
        }
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
        loadChildren: () => import('../finances/finances.module').then(m => m.FinancesPageModule),
        canActivate: [RoleGuard],
        data: {
          roles: [UserRole.DISCIPLE, UserRole.MOUKHADAM] // doit avoir au moins un des deux
        }
      },
      {
        path: 'dahiras',
        loadChildren: () => import('../dahiras/dahiras.module').then(m => m.DahirasPageModule)
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
export class TabsLayoutPageRoutingModule { }
