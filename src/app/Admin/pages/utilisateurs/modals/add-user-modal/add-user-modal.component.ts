// add-user-modal.component.ts
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
  // Configuration des étapes
  currentStep: number = 1;
  totalSteps: number = 3;

  genderOptions = [
    { label: 'Homme', value: 'HOMME' },
    { label: 'Femme', value: 'FEMME' },
    { label: 'Non spécifié', value: 'NON_SPECIFIED' }
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
    category: 'DISCIPLE', // Valeur par défaut même si non affichée
    role: 'DISCIPLE',
    active: true, // Valeur par défaut même si non affichée
    userIdKeycloak: ''
  };

  selectedFile: File | null = null;
  imagePreview: string = 'assets/images/default-avatar.png';
  isSubmitting = false;
  hasSubmitted = false;
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

  // ================================
  // GESTION DES ÉTAPES
  // ================================

  /**
   * Passer à l'étape suivante ou sauvegarder si dernière étape
   */
  async nextStep() {
    if (!this.isCurrentStepValid()) {
      await this.presentAlert('Validation', 'Veuillez remplir correctement tous les champs requis pour cette étape.');
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else {
      // Dernière étape - sauvegarder l'utilisateur
      await this.saveUser();
    }
  }

  /**
   * Retourner à l'étape précédente
   */
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  /**
   * Vérifier si l'étape courante est valide
   */
  isCurrentStepValid(): boolean {
    switch (this.currentStep) {
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

  /**
   * Validation de l'étape 1 : Informations personnelles
   */
  private isStep1Valid(): boolean {
    const u = this.newUser;
    return !!(
      u.firstName?.trim() &&
      u.lastName?.trim() &&
      u.gender &&
      u.dateOfBirth
    );
  }

  /**
   * Validation de l'étape 2 : Coordonnées
   */
  private isStep2Valid(): boolean {
    const u = this.newUser;
    return !!(
      u.email?.trim() &&
      this.isValidEmail(u.email) &&
      u.phoneNumber?.trim() &&
      this.isValidPhone(u.phoneNumber)
    );
  }

  /**
   * Validation de l'étape 3 : Localisation
   */
  private isStep3Valid(): boolean {
    const location = this.newUser.location;
    return !!(
      location?.country?.trim() &&
      location?.region?.trim() &&
      location?.address?.trim()
    );
  }

  // ================================
  // CLASSES CSS POUR LES INDICATEURS
  // ================================

  getStepClass(step: number): string {
    if (step < this.currentStep) {
      return 'step-circle step-completed';
    } else if (step === this.currentStep) {
      return 'step-circle step-active';
    } else {
      return 'step-circle step-inactive';
    }
  }

  getStepLabelClass(step: number): string {
    if (step < this.currentStep) {
      return 'step-label label-completed';
    } else if (step === this.currentStep) {
      return 'step-label label-active';
    } else {
      return 'step-label label-inactive';
    }
  }

  // ================================
  // GESTION DES DONNÉES
  // ================================

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

  onEmailChange() {
    if (!this.newUser.username && this.newUser.email?.includes('@')) {
      this.newUser.username = this.newUser.email.split('@')[0];
    }
  }

  // ================================
  // VALIDATION
  // ================================

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

  // ================================
  // SAUVEGARDE
  // ================================

  /**
   * Sauvegarder l'utilisateur - appelée uniquement à la dernière étape
   */
  async saveUser() {
    if (this.isSubmitting || this.hasSubmitted) {
      console.warn('⚠️ Soumission déjà en cours ou déjà effectuée');
      return;
    }

    // Validation finale de tous les champs
    if (!this.isStep1Valid() || !this.isStep2Valid() || !this.isStep3Valid()) {
      await this.presentAlert('Validation', 'Veuillez remplir correctement tous les champs requis.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Création de l\'utilisateur...',
      spinner: 'circular'
    });
    await loading.present();

    this.isSubmitting = true;
    this.hasSubmitted = true;

    try {
      const username = this.newUser.username?.trim() || (this.newUser.email ? this.newUser.email.split('@')[0] : '');
      const password = this.newUser.password || this.generateTempPassword();

      // Préparation des données utilisateur
      const userData: UserFormData = {
        firstName: this.newUser.firstName?.trim() || '',
        lastName: this.newUser.lastName?.trim() || '',
        email: this.newUser.email?.trim().toLowerCase() || '',
        username,
        password,
        phoneNumber: this.newUser.phoneNumber?.trim() || '',
        gender: this.newUser.gender || 'NON_SPECIFIED',
        userIdKeycloak: this.newUser.userIdKeycloak || this.generateUUID(),
        dateOfBirth: this.newUser.dateOfBirth || '',
        location: this.newUser.location ? {
          locationInfoId: this.newUser.location.locationInfoId || this.generateUUID(),
          nationality: this.newUser.location.nationality || 'Sénégalaise',
          country: this.newUser.location.country || 'Sénégal',
          region: this.newUser.location.region || 'Dakar',
          department: this.newUser.location.department || this.newUser.location.region || 'Dakar',
          address: this.newUser.location.address?.trim() || 'Adresse non spécifiée'
        } : {
          locationInfoId: this.generateUUID(),
          nationality: 'Sénégalaise',
          country: 'Sénégal',
          region: 'Dakar',
          department: 'Dakar',
          address: 'Adresse non spécifiée'
        },
        category: 'DISCIPLE', // Valeur par défaut
        role: 'DISCIPLE',
        active: true // Valeur par défaut
      };

      console.log('=== COMPONENT DEBUG ===');
      console.log('userData à envoyer:', userData);
      console.log('file à envoyer:', this.selectedFile);

      // Vérifications avant envoi
      if (!userData.firstName || !userData.lastName || !userData.email) {
        await this.presentAlert('Erreur', 'Les champs Prénom, Nom et Email sont obligatoires.');
        await loading.dismiss();
        this.isSubmitting = false;
        this.hasSubmitted = false;
        return;
      }

      // Objet sérialisable pour NgRx
      const cleanUserData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username,
        password: userData.password,
        phoneNumber: userData.phoneNumber,
        gender: userData.gender,
        userIdKeycloak: userData.userIdKeycloak,
        dateOfBirth: userData.dateOfBirth,
        location: userData.location,
        category: userData.category,
        role: userData.role,
        active: userData.active
      };

      console.log('🔍 COMPONENT - cleanUserData:', cleanUserData);

      // Validation finale
      if (typeof cleanUserData !== 'object' || !cleanUserData.firstName) {
        throw new Error('Données utilisateur invalides');
      }

      // Dispatch unique de l'action
      this.store.dispatch(UsersActions.createUser({
        userData: cleanUserData,
        file: this.selectedFile || undefined
      }));

      await loading.dismiss();

      // Fermer le modal avec un flag de succès
      this.modalController.dismiss({ success: true });

    } catch (error) {
      await loading.dismiss();
      console.error('❌ Erreur création utilisateur:', error);
      await this.presentAlert('Erreur', 'Une erreur est survenue lors de la création de l\'utilisateur.');
      
      // Reset les flags en cas d'erreur
      this.hasSubmitted = false;
      
      // Fermer le modal avec l'erreur
      this.modalController.dismiss({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  // ================================
  // GESTION DES IMAGES
  // ================================

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
    // Validation du fichier
    if (file.size > 5 * 1024 * 1024) {
      this.presentAlert('Erreur', 'L\'image ne doit pas dépasser 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.presentAlert('Erreur', 'Veuillez sélectionner un fichier image valide');
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ================================
  // MÉTHODES UTILITAIRES
  // ================================

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

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass + '1A!';
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}