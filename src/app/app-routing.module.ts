import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
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
  // {
  //   path: 'tabs',
  //   loadChildren: () => import('./features/tabs/tabs.module').then( m => m.TabsPageModule)
  // },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'infos',
    loadChildren: () => import('./features/infos/infos.module').then( m => m.InfosPageModule)
  },
  {
    path: 'bibliotheque',
    loadChildren: () => import('./features/bibliotheque/bibliotheque.module').then( m => m.BibliothequePageModule)
  },  {
    path: 'finances',
    loadChildren: () => import('./features/finances/finances.module').then( m => m.FinancesPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
