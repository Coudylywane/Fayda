import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, LoadingController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import * as UsersActions from '../../store/users.actions';
import { UserFormData } from '../../modals/users.model';

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.scss'],
  standalone: false,
})
export class AddUserModalComponent implements OnInit {
  
  genderOptions = [
    { label: 'Homme', value: 'HOMME' },
    { label: 'Femme', value: 'FEMME' },
    { label: 'Non spécifié', value: 'NON_SPECIFIED' }
  ];

  categoryOptions = [
    { label: 'Disciple', value: 'DISCIPLE' },
    { label: 'Responsable Dahira', value: 'RESP_DAHIRA' },
    { label: 'Visiteur', value: 'VISITEUR' },
    { label: 'Mouqadam', value: 'MOUQADAM' }
  ];

  newUser: UserFormData = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
    gender: 'NON_SPECIFIED',
    dateOfBirth: '',
    location: {
      nationality: 'Sénégalaise',
      country: 'Sénégal',
      region: 'Dakar',
      department: '',
      address: ''
    },
    category: 'DISCIPLE',
    role: 'DISCIPLE',
    active: true,
    userIdKeycloak: ''
  };

  selectedFile: File | null = null;
  imagePreview: string = 'assets/images/default-avatar.png';
  isSubmitting = false;
  today: string = new Date().toISOString().split('T')[0];

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.newUser.userIdKeycloak = this.generateUUID();
  }

  // Nouvelle méthode pour mettre à jour la localisation
  updateLocation(field: string, value: string) {
    if (!this.newUser.location) {
      this.newUser.location = {
        nationality: '',
        country: '',
        region: '',
        department: '',
        address: ''
      };
    }
    this.newUser.location[field as keyof typeof this.newUser.location] = value;
  }

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

  private formatDateForAPI(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass + '1A!';
  }

  isValidEmail(email: string | undefined): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string | undefined): boolean {
    if (!phone) return false;
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  }

  isFormValid(): boolean {
    const u = this.newUser;
    
    if (!u.firstName?.trim() || !u.lastName?.trim()) {
      return false;
    }
    
    if (!u.email?.trim() || !this.isValidEmail(u.email)) {
      return false;
    }
    
    if (!u.gender || !u.dateOfBirth) {
      return false;
    }
    
    if (!u.location?.country || !u.location?.region || !u.location?.address?.trim()) {
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

    const loading = await this.loadingController.create({
      message: 'Création de l\'utilisateur...',
      spinner: 'circular'
    });

    await loading.present();
    this.isSubmitting = true;

    try {
      const username = this.newUser.username?.trim() || (this.newUser.email ? this.newUser.email.split('@')[0] : '');
      const password = this.newUser.password || this.generateTempPassword();

      const userData: UserFormData = {
        ...this.newUser,
        firstName: this.newUser.firstName?.trim() || '',
        lastName: this.newUser.lastName?.trim() || '',
        email: this.newUser.email?.trim().toLowerCase() || '',
        username,
        password,
        phoneNumber: this.newUser.phoneNumber?.trim() || '',
        dateOfBirth: this.formatDateForAPI(this.newUser.dateOfBirth),
        role: this.newUser.category,
        location: {
          ...this.newUser.location,
          locationInfoId: this.generateUUID(),
          address: this.newUser.location?.address?.trim() || ''
        }
      };

      this.store.dispatch(UsersActions.createUser({ 
        userData, 
        file: this.selectedFile || undefined 
      }));

      await loading.dismiss();
      await this.presentAlert('Succès', 'Utilisateur créé avec succès.');
      this.modalController.dismiss(true);
      
    } catch (error) {
      await loading.dismiss();
      console.error('Erreur création utilisateur:', error);
      await this.presentAlert('Erreur', 'Une erreur est survenue lors de la création de l\'utilisateur.');
    } finally {
      this.isSubmitting = false;
    }
  }

  async onImageClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.handleImageSelection(file);
      }
    };
    input.click();
  }

  handleImageSelection(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      this.presentAlert('Erreur', 'L\'image ne doit pas dépasser 5MB');
      return;
    }

    this.selectedFile = file;
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  onCategoryChange() {
    this.newUser.role = this.newUser.category;
  }

  onEmailChange() {
    if (!this.newUser.username && this.newUser.email?.includes('@')) {
      this.newUser.username = this.newUser.email.split('@')[0];
    }
  }
}