import { Component } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { UserAdminService } from '../../services/useradmin.service';
import { CreateUserRequest } from '../../modals/users.model';

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.scss'],
  standalone: false,
})
export class AddUserModalComponent {

  genderOptions = [
    { label: 'Homme', value: 'M' },
    { label: 'Femme', value: 'F' },
    { label: 'Autre', value: 'O' }
  ];

  category = ['Disciple', 'Resp.dahira','Visteur','Mouqadam'];

  newUser = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    country: '',
    region: '',
    department: '',
    address: '',
    image: '', // Base64 ou URL
    category: '',
  };

  isSubmitting = false;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private userAdminService: UserAdminService
  ) {}

  dismiss() {
    this.modalController.dismiss();
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private formatDateForAPI(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;
    return phoneRegex.test(phone);
  }

  isFormValid(): boolean {
    const u = this.newUser;
    if (
      !u.firstName.trim() ||
      !u.lastName.trim() ||
      !u.email.trim() ||
      !this.isValidEmail(u.email) ||
      !u.gender ||
      !u.dateOfBirth ||
      !u.nationality ||
      !u.country ||
      !u.region ||
      !u.department ||
      !u.address.trim() ||
      !u.category
    ) {
      return false;
    }
    if (u.phoneNumber && !this.isValidPhone(u.phoneNumber)) {
      return false;
    }
    return true;
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async saveUser() {
    if (this.isSubmitting) return;

    if (!this.isFormValid()) {
      await this.presentAlert('Validation', 'Veuillez remplir correctement tous les champs obligatoires.');
      return;
    }

    this.isSubmitting = true;

    try {
      const username = this.newUser.username.trim() || this.newUser.email.split('@')[0];
      const password = this.newUser.password || this.generateTempPassword();

      const userData: CreateUserRequest = {
        firstName: this.newUser.firstName.trim(),
        lastName: this.newUser.lastName.trim(),
        email: this.newUser.email.trim().toLowerCase(),
        username,
        password,
        phoneNumber: this.newUser.phoneNumber.trim(),
        gender: this.newUser.gender,
        userIdKeycloak: this.generateUUID(),
        dateOfBirth: this.formatDateForAPI(this.newUser.dateOfBirth),
        location: {
          locationInfoId: this.generateUUID(),
          nationality: this.newUser.nationality,
          country: this.newUser.country,
          region: this.newUser.region,
          department: this.newUser.department,
          address: this.newUser.address.trim(),
        },
        role: this.newUser.category.toUpperCase(),
        active: true,
      };

      await this.userAdminService.createUser(userData).toPromise();
      await this.presentAlert('Succès', 'Utilisateur créé avec succès.');
      this.modalController.dismiss(true);
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      await this.presentAlert('Erreur', 'Une erreur est survenue lors de la création de l\'utilisateur.');
    } finally {
      this.isSubmitting = false;
    }
  }

  // Gérer les changements d'image
  onImageChange(event: any): void {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.newUser.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Méthodes déclenchées par les inputs
  onFirstNameChange(): void {}
  onLastNameChange(): void {}
  onEmailChange(): void {}
}
