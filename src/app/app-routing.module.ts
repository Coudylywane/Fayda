import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./features/auth/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./features/tabs-layout/tabs-layout.module').then( m => m.TabsLayoutPageModule)
  },
  {
    path: 'infos/detail-infos',
    loadChildren: () => import('./features/infos/pages/detail-infos/detail-infos.module').then( m => m.DetailInfosPageModule)
  },
  {
    path: 'bibliotheque/lire-ouvrage/:id',
    loadChildren: () => import('./features/bibliotheque/pages/lire-ouvrage/lire-ouvrage.module').then( m => m.LireOuvragePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
