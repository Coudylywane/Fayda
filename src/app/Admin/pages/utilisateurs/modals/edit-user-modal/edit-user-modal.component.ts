import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController, LoadingController } from '@ionic/angular';
import { User, UserFormData } from '../../modals/users.model';

@Component({
  selector: 'app-edit-user-modal',
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss'],
  standalone: false
})
export class EditUserModalComponent implements OnInit {
  @Input() user!: User;
  
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
    { label: 'Disciple', value: 'DISCIPLE' },
    { label: 'Responsable Dahira', value: 'RESP_DAHIRA' },
    { label: 'Visiteur', value: 'VISITEUR' },
    { label: 'Mouqadam', value: 'MOUQADAM' }
  ];

  selectedFile: File | null = null;
  imagePreview: string = 'assets/images/default-avatar.png';
  isSubmitting = false;
  today: string = new Date().toISOString().split('T')[0];

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    console.log('🔍 USER DATA REÇU:', this.user);
    this.initializeUserData();
  }

  private initializeUserData() {
    if (this.user) {
      console.log('📋 INITIALISATION DES DONNÉES UTILISATEUR');
      
      // ✅ MAPPING ROBUSTE: Gérer toutes les variations possibles
      this.editedUser = {
        // Informations de base avec fallbacks
        firstName: this.user.firstName || (this.user.name ? this.user.name.split(' ')[0] : '') || '',
        lastName: this.user.lastName || (this.user.name ? this.user.name.split(' ').slice(1).join(' ') : '') || '',
        email: this.user.email || '',
        username: this.user.username || '',
        password: '', // Jamais pré-remplir pour la sécurité
        phoneNumber: this.user.phoneNumber || '',
        gender: this.user.gender || 'NON_SPECIFIED',
        userIdKeycloak: this.user.userIdKeycloak || this.user.id || this.generateUUID(),
        
        // Date de naissance avec gestion d'erreur
        dateOfBirth: this.user.dateOfBirth ? this.formatDateSafe(this.user.dateOfBirth) : '',
        
        // Location avec mapping complet
        location: {
          locationInfoId: this.user.location?.locationInfoId || this.generateUUID(),
          nationality: this.user.location?.nationality || 'Sénégalaise',
          country: this.user.location?.country || 'Sénégal',
          region: this.user.location?.region || 'Dakar',
          department: this.user.location?.department || this.user.location?.region || 'Dakar',
          address: this.user.location?.address || ''
        },
        
        // Rôle et statut
        role: this.user.role || this.user.category || 'DISCIPLE',
        active: this.user.active !== false // true par défaut sauf si explicitement false
      };

      // Image avec source unique
      this.imagePreview = this.user.image || 'assets/images/default-avatar.png';
      
      console.log('✅ DONNÉES MAPPÉES:', this.editedUser);
      console.log('🖼️ IMAGE PREVIEW:', this.imagePreview);
    }
  }

  private formatDateSafe(date: string | Date): string {
    if (!date) return '';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
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

  updateLocation(field: string, value: string) {
    if (!this.editedUser.location) {
      this.editedUser.location = {
        locationInfoId: this.generateUUID(),
        nationality: 'Sénégalaise',
        country: 'Sénégal',
        region: 'Dakar',
        department: '',
        address: ''
      };
    }
    this.editedUser.location[field as keyof typeof this.editedUser.location] = value;
    console.log(`📍 Location ${field} mis à jour:`, value);
  }

  dismiss() {
    this.modalController.dismiss();
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
    const u = this.editedUser;
    
    // Vérifier les champs obligatoires
    if (!u.firstName?.trim() || !u.lastName?.trim()) {
      console.log('❌ Validation: Nom/Prénom manquant');
      return false;
    }
    
    if (!u.email?.trim() || !this.isValidEmail(u.email)) {
      console.log('❌ Validation: Email invalide');
      return false;
    }
    
    if (!u.gender || !u.dateOfBirth) {
      console.log('❌ Validation: Genre/Date naissance manquant');
      return false;
    }
    
    if (!u.location?.country || !u.location?.region || !u.location?.address?.trim()) {
      console.log('❌ Validation: Localisation incomplète');
      return false;
    }
    
    if (u.phoneNumber && !this.isValidPhone(u.phoneNumber)) {
      console.log('❌ Validation: Téléphone invalide');
      return false;
    }
    
    console.log('✅ Validation: Formulaire valide');
    return true;
  }

  async saveUser() {
    if (this.isSubmitting) {
      console.warn('⚠️ Soumission déjà en cours');
      return;
    }

    console.log('💾 DÉBUT SAUVEGARDE');
    console.log('📝 Données avant validation:', this.editedUser);

    if (!this.isFormValid()) {
      await this.presentAlert('Validation', 'Veuillez remplir correctement tous les champs obligatoires.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Modification en cours...',
      spinner: 'circular'
    });
    await loading.present();

    this.isSubmitting = true;

    try {
      // ✅ PRÉPARATION DES DONNÉES COMPLÈTES
      const updateData: any = {
        // ID original (CRUCIAL pour l'update)
        id: this.user.id,
        
        // Informations personnelles (fallback vers valeurs originales si vides)
        firstName: this.editedUser.firstName?.trim() || this.user.firstName || '',
        lastName: this.editedUser.lastName?.trim() || this.user.lastName || '',
        email: this.editedUser.email?.trim().toLowerCase() || this.user.email || '',
        username: this.editedUser.username?.trim() || this.user.username || this.editedUser.email?.split('@')[0] || '',
        phoneNumber: this.editedUser.phoneNumber?.trim() || this.user.phoneNumber || '',
        gender: this.editedUser.gender || this.user.gender || 'NON_SPECIFIED',
        userIdKeycloak: this.editedUser.userIdKeycloak || this.user.userIdKeycloak || this.user.id,
        
        // Date de naissance
        dateOfBirth: this.editedUser.dateOfBirth || this.user.dateOfBirth || '',
        
        // Location complète avec préservation des données existantes
        location: {
          locationInfoId: this.editedUser.location?.locationInfoId || this.user.location?.locationInfoId || this.generateUUID(),
          nationality: this.editedUser.location?.nationality || this.user.location?.nationality || 'Sénégalaise',
          country: this.editedUser.location?.country || this.user.location?.country || 'Sénégal',
          region: this.editedUser.location?.region || this.user.location?.region || 'Dakar',
          department: this.editedUser.location?.department || this.user.location?.department || '',
          address: this.editedUser.location?.address || this.user.location?.address || ''
        },
        
        // Rôle et statut
        role: this.editedUser.role || this.user.role || 'DISCIPLE',
        active: this.editedUser.active,
        
        // ✅ PRÉSERVATION DES MÉTADONNÉES
        createdAt: this.user.createdAt,
        updatedAt: new Date().toISOString(),
        
        // Préserver autres champs possibles
        category: this.editedUser.role || this.user.category || this.user.role
      };

      // Inclure le mot de passe seulement s'il a été modifié
      if (this.editedUser.password && this.editedUser.password.trim()) {
        updateData.password = this.editedUser.password.trim();
        console.log('🔑 Mot de passe inclus dans la mise à jour');
      }

      console.log('📤 DONNÉES FINALES À ENVOYER:', updateData);
      console.log('📎 FICHIER IMAGE:', this.selectedFile);

      await loading.dismiss();

      // ✅ RETOUR ENRICHI avec toutes les informations nécessaires
      this.modalController.dismiss({
        userData: updateData,
        file: this.selectedFile || undefined,
        hasImageChanged: !!this.selectedFile,
        originalUser: this.user, // Pour comparaison côté parent
        timestamp: new Date().toISOString()
      }, 'save');

    } catch (error) {
      await loading.dismiss();
      console.error('❌ Erreur lors de la modification:', error);
      await this.presentAlert('Erreur', 'Une erreur est survenue lors de la modification.');
    } finally {
      this.isSubmitting = false;
    }
  }

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
    
    // Validation renforcée du fichier
    if (file.size > 5 * 1024 * 1024) {
      this.presentAlert('Erreur', 'L\'image ne doit pas dépasser 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      this.presentAlert('Erreur', 'Veuillez sélectionner un fichier image valide');
      return;
    }

    // Vérifier les dimensions de l'image
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

      // Feedback utilisateur
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
    
    // Auto-dismiss après 2 secondes
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
            this.modalController.dismiss({ 
              delete: true, 
              userId: this.user.id,
              userName 
            }, 'delete');
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