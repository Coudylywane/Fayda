import { Component } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular'; // Importer IonicModule pour les composants Ionic
import { CommonModule } from '@angular/common'; // Importer CommonModule pour les directives Angular de base
import { Router } from '@angular/router'; // Importer Router pour la navigation
import { AddUserModalComponent } from '../modal/add-user-modal/add-user-modal.component'; // Importation du composant modal

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.page.html',
  styleUrls: ['./utilisateurs.page.scss'],
  standalone: true, // Définir comme composant autonome
  imports: [IonicModule, CommonModule] // Ajouter les modules nécessaires
})
export class UtilisateursPage {
  users = [
    { name: 'Jean Dupont', email: 'jean@example.com', role: 'Admin' },
    { name: 'Marie Martin', email: 'marie@example.com', role: 'Utilisateur' },
    { name: 'Pierre Durand', email: 'pierre@example.com', role: 'Modérateur' }
  ]; // Liste d'utilisateurs statiques

  constructor(private modalController: ModalController, private router: Router) {} // Injecter Router

  navigateToUtilisateurs() {
    this.router.navigate(['/']); // Navigue vers la page des utilisateurs
  }



  async openAddUserModal() {
    const modal = await this.modalController.create({
      component: AddUserModalComponent, // Utilisation du composant modal ici
    });
    return await modal.present();
  }
}