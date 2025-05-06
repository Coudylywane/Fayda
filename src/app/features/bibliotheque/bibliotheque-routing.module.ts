import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BibliothequePage } from './bibliotheque.page';

const routes: Routes = [
  {
    path: '',
    component: BibliothequePage,
    // children: [
    //   {
    //     path: 'livres/:id',
    //     loadChildren: () => import('./livres/livres.module').then(m => m.LivresPageModule),
    //   }
    // ]
  },
  {
    path: 'detail-ouvrage/:id',
    loadChildren: () => import('./pages/detail-ouvrage/detail-ouvrage.module').then( m => m.DetailOuvragePageModule)
  },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BibliothequePageRoutingModule {}
