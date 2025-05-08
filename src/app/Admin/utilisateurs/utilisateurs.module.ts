import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { UtilisateursPage } from './utilisateurs.page';  // Composant autonome UtilisateursPage
import { AddUserModalComponent } from '../modal/add-user-modal/add-user-modal.component';  // Composant autonome Modal

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: UtilisateursPage  // Utilise le composant autonome UtilisateursPage ici
      }
    ]),
    UtilisateursPage,  // Importer le composant autonome
    AddUserModalComponent  // Importer le composant autonome
  ]
})
export class UtilisateursPageModule {}