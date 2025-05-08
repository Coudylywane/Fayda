import { Component } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';  // pour le ngModel

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class AddUserModalComponent {
  newUser = { name: '', email: '', role: '' };  // Données de l'utilisateur à ajouter

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  addUser() {
    console.log('Utilisateur ajouté:', this.newUser);
    this.dismiss(); // Fermer le modal
  }
}
