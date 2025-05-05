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

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BibliothequePageRoutingModule {}
