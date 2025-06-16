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
    this.initializeUserData();
  }

  private initializeUserData() {
    if (this.user) {
      // Mapper les données de l'utilisateur vers le formulaire d'édition
      this.editedUser = {
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        email: this.user.email || '',
        username: this.user.username || '',
        password: '', // Ne pas pré-remplir le mot de passe pour la sécurité
        phoneNumber: this.user.phoneNumber || '',
        gender: this.user.gender || 'NON_SPECIFIED',
        userIdKeycloak: this.user.userIdKeycloak || '',
        dateOfBirth: this.user.dateOfBirth ? this.formatDate(this.user.dateOfBirth) : '',
        location: {
          locationInfoId: this.user.location?.locationInfoId || '',
          nationality: this.user.location?.nationality || 'Sénégalaise',
          country: this.user.location?.country || 'Sénégal',
          region: this.user.location?.region || 'Dakar',
          department: this.user.location?.department || '',
          address: this.user.location?.address || ''
        },
        role: this.user.role || 'DISCIPLE',
        active: this.user.active !== false
      };

      // Définir l'image de prévisualisation
      this.imagePreview = this.user.image || 'assets/images/default-avatar.png';
    }
  }

  private formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  updateLocation(field: string, value: string) {
    if (!this.editedUser.location) {
      this.editedUser.location = {
        locationInfoId: '',
        nationality: '',
        country: '',
        region: '',
        department: '',
        address: ''
      };
    }
    this.editedUser.location[field as keyof typeof this.editedUser.location] = value;
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

  async saveUser() {
    if (this.isSubmitting) {
      return;
    }

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
      // Préparer les données pour la mise à jour
      const updateData: Partial<UserFormData> = {
        firstName: this.editedUser.firstName?.trim(),
        lastName: this.editedUser.lastName?.trim(),
        email: this.editedUser.email?.trim().toLowerCase(),
        username: this.editedUser.username?.trim(),
        phoneNumber: this.editedUser.phoneNumber?.trim(),
        gender: this.editedUser.gender,
        dateOfBirth: this.editedUser.dateOfBirth,
        location: {
          locationInfoId: this.editedUser.location?.locationInfoId || this.user.location?.locationInfoId || '',
          nationality: this.editedUser.location?.nationality,
          country: this.editedUser.location?.country,
          region: this.editedUser.location?.region,
          department: this.editedUser.location?.department,
          address: this.editedUser.location?.address
        },
        role: this.editedUser.role,
        active: this.editedUser.active
      };

      // Inclure le mot de passe seulement s'il a été modifié
      if (this.editedUser.password && this.editedUser.password.trim()) {
        updateData.password = this.editedUser.password.trim();
      }

      console.log('Données de mise à jour:', updateData);
      console.log('Fichier image sélectionné:', this.selectedFile);

      await loading.dismiss();

      // Retourner les données modifiées avec le fichier image si présent
      this.modalController.dismiss({
        userData: updateData,
        file: this.selectedFile || undefined,
        hasImageChanged: !!this.selectedFile
      }, 'save');

    } catch (error) {
      await loading.dismiss();
      console.error('Erreur lors de la modification:', error);
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
    // Pour les navigateurs qui supportent l'API camera
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user'; // Utilise la caméra frontale
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
    this.presentAlert('Information', 'Photo supprimée. L\'image par défaut sera utilisée.');
  }

  handleImageSelection(file: File) {
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
        resolve(isValid);
      };
      img.onerror = () => resolve(false);
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
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Êtes-vous sûr de vouloir supprimer ${this.user.firstName} ${this.user.lastName} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.modalController.dismiss({ delete: true }, 'delete');
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
          }
        }
      ]
    });
    await alert.present();
  }
}