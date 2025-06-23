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
      
      // ✅ Gestion robuste des noms (comme dans votre code)
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
        password: '', // Toujours vide par défaut
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
      };

      // ✅ Gestion image sécurisée
      if (this.user.image && !this.isPlaceholderUrl(this.user.image)) {
        this.imagePreview = this.user.image;
      } else {
        this.imagePreview = 'assets/images/default-avatar.png';
      }
      
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

  // ✅ Format de date pour l'API (corrigé)
  private formatDateForAPI(dateString: string | undefined): string {
    if (!dateString) {
      return new Date().toISOString();
    }
    
    try {
      // Si déjà au format ISO complet
      if (dateString.includes('T') && dateString.endsWith('Z')) {
        return dateString;
      }
      
      // Convertir YYYY-MM-DD vers ISO
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

  // ✅ Navigation basée sur add-user qui fonctionne
  async nextStep() {
    if (!this.isCurrentStepValid()) {
      await this.presentAlert('Validation', 'Veuillez remplir correctement tous les champs requis pour cette étape.');
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      console.log(`➡️ Passage à l'étape ${this.currentStep}`);
    } else {
      // Dernière étape - sauvegarder
      await this.saveUser();
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

  updateLocation(field: string, value: string | null | undefined) {
    if (!this.editedUser.location) {
      this.editedUser.location = {
        locationInfoId: this.user.location?.locationInfoId || this.generateUUID(),
        nationality: '',
        country: '',
        region: '',
        department: '',
        address: ''
      };
    }
    
    const cleanValue = value?.toString().trim() || '';
    (this.editedUser.location as any)[field] = cleanValue;
    this.validateAllSteps();
    
    console.log(`📍 Location ${field} mis à jour:`, cleanValue);
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

  // ✅ Gestion des images (identique à add-user)
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

  // ✅ SAUVEGARDE BASÉE SUR ADD-USER AVEC FORMAT API CORRECT
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

    console.log('💾 DÉBUT SAUVEGARDE');
    console.log('📝 Données editedUser avant sauvegarde:', JSON.stringify(this.editedUser, null, 2));

    const loading = await this.loadingController.create({
      message: 'Modification en cours...',
      spinner: 'circular'
    });
    await loading.present();

    this.isSubmitting = true;
    this.hasSubmitted = true;

    try {
      // ✅ STRUCTURE EXACTE DE VOTRE API D'ÉDITION
      const updateData: UpdateUserRequest = {
        firstName: this.cleanString(this.editedUser.firstName!),
        lastName: this.cleanString(this.editedUser.lastName!),
        email: this.cleanString(this.editedUser.email!).toLowerCase(),
        username: this.cleanString(this.editedUser.username!),
        gender: this.editedUser.gender || 'NON_SPECIFIED',
        userIdKeycloak: this.cleanString(this.editedUser.userIdKeycloak!),
        dateOfBirth: this.formatDateForAPI(this.editedUser.dateOfBirth),
        role: this.editedUser.role || 'FAYDA_ROLE_USER',
        active: Boolean(this.editedUser.active),
        
        // ✅ Location selon votre API
        location: {
          locationInfoId: this.cleanString(this.editedUser.location?.locationInfoId) || this.generateUUID(),
          country: this.cleanString(this.editedUser.location?.country) || 'Sénégal',
          region: this.cleanString(this.editedUser.location?.region) || 'Dakar',
          address: this.cleanString(this.editedUser.location?.address) || 'Adresse non spécifiée'
        }
      };

      // ✅ Champs optionnels
      const phoneNumber = this.cleanString(this.editedUser.phoneNumber);
      if (phoneNumber) {
        updateData.phoneNumber = phoneNumber;
      }

      const password = this.cleanString(this.editedUser.password);
      if (password) {
        updateData.password = password;
        console.log('🔑 Mot de passe inclus dans la mise à jour');
      }

      const nationality = this.cleanString(this.editedUser.location?.nationality);
      if (nationality) {
        updateData.location.nationality = nationality;
      }

      const department = this.cleanString(this.editedUser.location?.department);
      if (department) {
        updateData.location.department = department;
      }

      // ✅ Gestion image
      if (this.selectedFile) {
        updateData.img = ''; // Sera géré par l'upload
      } else if (this.user.image && !this.isPlaceholderUrl(this.user.image)) {
        updateData.img = this.user.image;
      }

      console.log('=== UPDATE COMPONENT DEBUG ===');
      console.log('updateData à envoyer:', updateData);
      console.log('file à envoyer:', this.selectedFile);
      console.log('user.id:', this.user.id);

      // ✅ Validation finale stricte
      if (!updateData.firstName || !updateData.lastName || !updateData.email || !updateData.username) {
        await this.presentAlert('Erreur', 'Les champs Prénom, Nom, Email et Username sont obligatoires.');
        await loading.dismiss();
        this.isSubmitting = false;
        this.hasSubmitted = false;
        return;
      }

      if (!this.isValidEmail(updateData.email)) {
        await this.presentAlert('Erreur', 'Format d\'email invalide.');
        await loading.dismiss();
        this.isSubmitting = false;
        this.hasSubmitted = false;
        return;
      }

      // ✅ DISPATCH ACTION UPDATE (comme add-user mais avec updateUser)
      this.store.dispatch(UsersActions.updateUser({
        userId: this.user.id,
        userData: updateData
        // Note: pas de paramètre file si votre action ne le supporte pas
      }));

      await loading.dismiss();

      // Fermer le modal avec succès
      this.modalController.dismiss({ 
        success: true, 
        action: 'update',
        userId: this.user.id 
      });

    } catch (error) {
      await loading.dismiss();
      console.error('❌ Erreur modification utilisateur:', error);
      await this.presentAlert('Erreur', 'Une erreur est survenue lors de la modification de l\'utilisateur.');
      
      this.hasSubmitted = false;
      
      this.modalController.dismiss({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  // ✅ Fonction utilitaire pour nettoyer les chaînes
  private cleanString(value: any): string {
    if (!value || value === 'undefined' || value === 'null') {
      return '';
    }
    return String(value).trim();
  }

  // ✅ Vérifier si c'est une URL placeholder
  private isPlaceholderUrl(url: string | undefined): boolean {
    if (!url) return false;
    return url.includes('placeholder') || 
           url.includes('via.placeholder') || 
           url.includes('default-avatar') ||
           url.includes('assets/images/') ||
           url.includes('FFFFFF') ||
           url.includes('4169E1');
  }

  dismiss() {
    this.modalController.dismiss();
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

  // ✅ DEBUG optimisé
  debugUserData() {
    console.log('🔍 ===== DEBUG UTILISATEUR =====');
    console.log('📊 User original:', JSON.stringify(this.user, null, 2));
    console.log('📝 EditedUser:', JSON.stringify(this.editedUser, null, 2));
    console.log('🎯 Étape actuelle:', this.currentStep);
    console.log('✅ Validation étapes:', this.stepValidation);
    console.log('🖼️ Image preview:', this.imagePreview);
    console.log('📎 Selected file:', this.selectedFile);
    
    // ✅ Simuler les données exactes qui seront envoyées
    const simulatedData: UpdateUserRequest = {
      firstName: this.cleanString(this.editedUser.firstName!),
      lastName: this.cleanString(this.editedUser.lastName!),
      email: this.cleanString(this.editedUser.email!).toLowerCase(),
      username: this.cleanString(this.editedUser.username!),
      gender: this.editedUser.gender || 'NON_SPECIFIED',
      userIdKeycloak: this.cleanString(this.editedUser.userIdKeycloak!),
      dateOfBirth: this.formatDateForAPI(this.editedUser.dateOfBirth),
      role: this.editedUser.role || 'FAYDA_ROLE_USER',
      active: Boolean(this.editedUser.active),
      location: {
        locationInfoId: this.cleanString(this.editedUser.location?.locationInfoId) || this.generateUUID(),
        country: this.cleanString(this.editedUser.location?.country) || 'Sénégal',
        region: this.cleanString(this.editedUser.location?.region) || 'Dakar',
        address: this.cleanString(this.editedUser.location?.address) || 'Adresse non spécifiée'
      }
    };

    // Ajouter les champs optionnels
    const phoneNumber = this.cleanString(this.editedUser.phoneNumber);
    if (phoneNumber) {
      simulatedData.phoneNumber = phoneNumber;
    }
    
    const password = this.cleanString(this.editedUser.password);
    if (password) {
      simulatedData.password = password;
    }

    const nationality = this.cleanString(this.editedUser.location?.nationality);
    if (nationality) {
      simulatedData.location.nationality = nationality;
    }

    const department = this.cleanString(this.editedUser.location?.department);
    if (department) {
      simulatedData.location.department = department;
    }
    
    console.log('🧪 DONNÉES SIMULÉES POUR API:', JSON.stringify(simulatedData, null, 2));
    
    // ✅ Validation structure
    console.log('🔍 ===== VALIDATION RAPIDE =====');
    console.log('- Tous les champs requis:', !!(simulatedData.firstName && simulatedData.lastName && simulatedData.email && simulatedData.username));
    console.log('- Email valide:', this.isValidEmail(simulatedData.email));
    console.log('- Date format ISO:', simulatedData.dateOfBirth.includes('T') && simulatedData.dateOfBirth.endsWith('Z'));
    console.log('- Location complète:', !!(simulatedData.location.country && simulatedData.location.region && simulatedData.location.address));
    console.log('- LocationInfoId UUID format:', /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(simulatedData.location.locationInfoId));
    
    const dataSize = JSON.stringify(simulatedData).length;
    console.log('📏 Taille des données:', dataSize, 'caractères');
    
    console.log('🔍 ===== FIN DEBUG =====');
  }
}