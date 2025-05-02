import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BibliothequePage } from './bibliotheque.page';

const routes: Routes = [
  {
    path: '',
    component: BibliothequePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BibliothequePageRoutingModule {}
