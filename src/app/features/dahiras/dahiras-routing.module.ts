import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DahirasPage } from './dahiras.page';

const routes: Routes = [
  {
    path: '',
    component: DahirasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DahirasPageRoutingModule {}
