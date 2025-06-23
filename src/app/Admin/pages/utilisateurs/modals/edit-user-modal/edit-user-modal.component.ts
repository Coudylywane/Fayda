import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController, LoadingController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import * as UsersActions from '../../store/users.actions';
import { User, UserFormData } from '../../modals/users.model';

// ✅ Interface pour l'API d'édition (basée sur votre documentation API)
interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password?: string;
  phoneNumber?: string;
  gender: string;
  userIdKeycloak: string;
  img?: string;
  dateOfBirth: string; // Format ISO: "2025-06-21T16:43:21.529Z"
  location: {
    locationInfoId: string;
    nationality?: string;
    country: string;
    region: string;
    department?: string;
    address: string;
  };
  role: string;
  active: boolean;
}

@Component({
  selector: 'app-edit-user-modal',
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss'],
  standalone: false
})
export class EditUserModalComponent implements OnInit {
  @Input() user!: User;
  
  // État du stepper
  currentStep = 1;
  totalSteps = 3;
  
  // État du stepper
  currentStep = 1;
  totalSteps = 3;
  
  editedUser: UserFormData = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
    gender: 'NON_SPECIFIED',
    userIdKeycloak: '',
    dateOfBirth: '',
    location: {
      locationInfoId: '',
      nationality: '',
      country: '',
      region: '',
      department: '',
      address: ''
    },
    role: '',
    active: true
  };

  genderOptions = [
    { label: 'Homme', value: 'HOMME' },
    { label: 'Femme', value: 'FEMME' },
    { label: 'Non spécifié', value: 'NON_SPECIFIED' }
  ];

  roleOptions = [
    { label: 'Utilisateur', value: 'FAYDA_ROLE_USER' },
    { label: 'Disciple', value: 'FAYDA_ROLE_DISCIPLE' },
    { label: 'Responsable Dahira', value: 'FAYDA_ROLE_DAHIRA' },
    { label: 'Mouqadam', value: 'FAYDA_ROLE_MOUQADAM' },
    { label: 'Administrateur', value: 'FAYDA_ROLE_ADMIN' }
  ];

  selectedFile: File | null = null;
  imagePreview: string = 'assets/images/default-avatar.png';
  isSubmitting = false;
  hasSubmitted = false; // ✅ Ajout du flag comme dans add-user
  today: string = new Date().toISOString().split('T')[0];

  // Validation par étape
  stepValidation = {
    step1: false,
    step2: false,
    step3: false
  };

  // Validation par étape
  stepValidation = {
    step1: false,
    step2: false,
    step3: false
  };

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    console.log('🔍 USER DATA REÇU:', this.user);
    this.initializeUserData();
  }

  private initializeUserData() {
    if (this.user) {
      console.log('📋 INITIALISATION DES DONNÉES UTILISATEUR');
      
      // ✅ CORRECTION: Gestion plus robuste des noms
      let firstName = '';
      let lastName = '';
      
      if (this.user.firstName) {
        firstName = this.user.firstName;
      } else if (this.user.name) {
        const nameParts = this.user.name.split(' ').filter((part: string) => part.length > 0);
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }
      
      if (this.user.lastName) {
        lastName = this.user.lastName;
      }
      
      this.editedUser = {
        firstName: firstName,
        lastName: lastName,
        email: this.user.email || '',
        username: this.user.username || '',
        password: '', // Jamais pré-remplir pour la sécurité
        phoneNumber: this.user.phoneNumber || '',
        gender: this.user.gender || 'NON_SPECIFIED',
        userIdKeycloak: this.user.userIdKeycloak || this.user.id || this.generateUUID(),
        dateOfBirth: this.user.dateOfBirth ? this.formatDateSafe(this.user.dateOfBirth) : '',
        
        location: {
          locationInfoId: this.user.location?.locationInfoId || this.generateUUID(),
          nationality: this.user.location?.nationality || '',
          country: this.user.location?.country || '',
          region: this.user.location?.region || '',
          department: this.user.location?.department || '',
          address: this.user.location?.address || ''
        },
        
        role: this.user.role || this.user.category || 'FAYDA_ROLE_USER',
        active: this.user.active !== false
        role: this.user.role || this.user.category || 'FAYDA_ROLE_USER',
        active: this.user.active !== false
      };

      this.imagePreview = this.user.image || 'assets/images/default-avatar.png';
      this.validateAllSteps();
      
      console.log('✅ DONNÉES MAPPÉES:', JSON.stringify(this.editedUser, null, 2));
      console.log('🔍 VÉRIFICATION FirstName:', firstName, 'Type:', typeof firstName);
      console.log('🔍 VÉRIFICATION LastName:', lastName, 'Type:', typeof lastName);
      console.log('🔍 VÉRIFICATION Email:', this.user.email, 'Type:', typeof this.user.email);
    }
  }

  private formatDateSafe(date: string | Date): string {
    if (!date) return '';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime()) || d.getFullYear() > 3000) {
        console.warn('⚠️ Date invalide:', date);
        return '';
      }
      return d.toISOString().split('T')[0];
    } catch (error) {
      console.error('❌ Erreur format date:', error);
      return '';
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ✅ Formater la date pour l'API
  private formatDateForAPI(dateString: string | undefined): string {
    if (!dateString) {
      return new Date().toISOString();
    }
    
    try {
      const date = new Date(dateString + 'T00:00:00.000Z');
      if (isNaN(date.getTime())) {
        throw new Error('Date invalide');
      }
      return date.toISOString();
    } catch (error) {
      console.error('❌ Erreur format date:', error);
      return new Date().toISOString();
    }
  }

  // Navigation entre les étapes
  nextStep() {
    if (this.currentStep < this.totalSteps && this.isCurrentStepValid()) {
      this.currentStep++;
      console.log(`➡️ Passage à l'étape ${this.currentStep}`);
    } else if (!this.isCurrentStepValid()) {
      this.presentAlert('Validation', 'Veuillez remplir tous les champs obligatoires de cette étape.');
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      console.log(`⬅️ Retour à l'étape ${this.currentStep}`);
    }
  }

  goToStep(step: number) {
    for (let i = 1; i < step; i++) {
      if (!this.isStepValid(i)) {
        this.presentAlert('Navigation', `Veuillez d'abord compléter l'étape ${i}.`);
        return;
      }
    }
    this.currentStep = step;
    console.log(`🎯 Navigation directe vers l'étape ${step}`);
  }

  // Validation par étape
  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return this.isStep1Valid();
      case 2:
        return this.isStep2Valid();
      case 3:
        return this.isStep3Valid();
      default:
        return false;
    }
  }

  isCurrentStepValid(): boolean {
    return this.isStepValid(this.currentStep);
  }

  isStep1Valid(): boolean {
    const u = this.editedUser;
    return !!(
      u.firstName?.trim() &&
      u.lastName?.trim() &&
      u.email?.trim() &&
      this.isValidEmail(u.email) &&
      u.gender &&
      u.dateOfBirth &&
      u.role
    );
  }

  isStep2Valid(): boolean {
    const u = this.editedUser;
    return !!(
      u.username?.trim() &&
      (!u.phoneNumber || this.isValidPhone(u.phoneNumber))
    );
  }

  isStep3Valid(): boolean {
    const u = this.editedUser;
    return !!(
      u.location?.country?.trim() &&
      u.location?.region?.trim() &&
      u.location?.address?.trim()
    );
  }

  validateAllSteps() {
    this.stepValidation = {
      step1: this.isStep1Valid(),
      step2: this.isStep2Valid(),
      step3: this.isStep3Valid()
    };
  isStep3Valid(): boolean {
    const u = this.editedUser;
    return !!(
      u.location?.country?.trim() &&
      u.location?.region?.trim() &&
      u.location?.address?.trim()
    );
  }

  validateAllSteps() {
    this.stepValidation = {
      step1: this.isStep1Valid(),
      step2: this.isStep2Valid(),
      step3: this.isStep3Valid()
    };
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

  updateLocation(field: string, value: string) {
    if (!this.editedUser.location) {
      this.editedUser.location = {
        locationInfoId: this.user.location?.locationInfoId || this.generateUUID(),
        nationality: this.user.location?.nationality || '',
        country: this.user.location?.country || '',
        region: this.user.location?.region || '',
        department: this.user.location?.department || '',
        address: this.user.location?.address || ''
      };
    }
    
    (this.editedUser.location as any)[field] = value;
    this.validateAllSteps();
    
    console.log(`📍 Location ${field} mis à jour:`, value);
  }

  onEmailChange() {
    if (!this.editedUser.username && this.editedUser.email?.includes('@')) {
      this.editedUser.username = this.editedUser.email.split('@')[0];
      console.log('📧 Username auto-généré:', this.editedUser.username);
    }
    this.validateAllSteps();
  }

  onFieldChange() {
    this.validateAllSteps();
  }

  // Gestion des images
  async onImageClick() {
    const actionSheet = await this.alertController.create({
      header: 'Changer la photo de profil',
      message: 'Comment souhaitez-vous modifier la photo ?',
      buttons: [
        {
          text: 'Sélectionner depuis la galerie',
          handler: () => {
            this.selectImageFromGallery();
          }
        },
        {
          text: 'Prendre une photo',
          handler: () => {
            this.takePhoto();
          }
        },
        {
          text: 'Supprimer la photo actuelle',
          role: 'destructive',
          handler: () => {
            this.removeCurrentImage();
          }
        },
        {
          text: 'Annuler',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  private selectImageFromGallery() {
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

  private takePhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.handleImageSelection(file);
      }
    };
    input.click();
  }

  private removeCurrentImage() {
    this.selectedFile = null;
    this.imagePreview = 'assets/images/default-avatar.png';
    this.presentInfoMessage('Photo supprimée. L\'image par défaut sera utilisée.');
  }

  handleImageSelection(file: File) {
    console.log('📷 Sélection d\'image:', file.name, file.size);
    
    if (file.size > 5 * 1024 * 1024) {
      this.presentAlert('Erreur', 'L\'image ne doit pas dépasser 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      this.presentAlert('Erreur', 'Veuillez sélectionner un fichier image valide');
      return;
    }

    this.validateImageDimensions(file).then(isValid => {
      if (!isValid) {
        this.presentAlert('Erreur', 'L\'image doit avoir une résolution minimale de 100x100 pixels');
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        console.log('✅ Image prévisualisée');
      };
      reader.readAsDataURL(file);

      this.presentInfoMessage(`Image sélectionnée: ${file.name} (${this.formatFileSize(file.size)})`);
    });
  }

  private validateImageDimensions(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const isValid = img.width >= 100 && img.height >= 100;
        console.log(`📐 Dimensions image: ${img.width}x${img.height} (valide: ${isValid})`);
        resolve(isValid);
      };
      img.onerror = () => {
        console.error('❌ Erreur chargement image pour validation');
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private async presentInfoMessage(message: string) {
    const alert = await this.alertController.create({
      header: 'Information',
      message,
      buttons: ['OK'],
      cssClass: 'info-alert'
    });
    await alert.present();
    
    setTimeout(() => {
      alert.dismiss();
    }, 2000);
  }

  onEmailChange() {
    // Mettre à jour automatiquement le nom d'utilisateur si vide
    if (!this.editedUser.username && this.editedUser.email?.includes('@')) {
      this.editedUser.username = this.editedUser.email.split('@')[0];
      console.log('📧 Username auto-généré:', this.editedUser.username);
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async confirmDelete() {
    const userName = this.user.firstName && this.user.lastName 
      ? `${this.user.firstName} ${this.user.lastName}`
      : this.user.name || 'cet utilisateur';
      
    const alert = await this.alertController.create({
      header: 'Confirmation de suppression',
      message: `
        <div style="text-align: center;">
          <p>Êtes-vous sûr de vouloir supprimer <strong>${userName}</strong> ?</p>
          <p style="color: #e74c3c; font-size: 0.9em; margin-top: 10px;">
            ⚠️ Cette action est irréversible
          </p>
        </div>
      `,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            console.log('🗑️ Suppression confirmée pour:', userName);
            this.store.dispatch(UsersActions.deleteUser({ userId: this.user.id }));
            this.modalController.dismiss({ 
              success: true, 
              action: 'delete',
              userId: this.user.id 
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async toggleStatus() {
    const newStatus = !this.editedUser.active;
    const action = newStatus ? 'activer' : 'désactiver';
    
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Êtes-vous sûr de vouloir ${action} cet utilisateur ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          handler: () => {
            this.editedUser.active = newStatus;
            console.log(`🔄 Statut utilisateur changé: ${newStatus ? 'Actif' : 'Inactif'}`);
          }
        }
      ]
    });
    await alert.present();
  }
}