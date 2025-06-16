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
  hasSubmitted = false; // ✅ Flag pour éviter les doubles soumissions
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

  // ✅ MÉTHODE CORRIGÉE: Test direct de l'API 
  async testDirectAPI() {
    console.log('🔍 TEST DIRECT DE L\'API');
    
    let token = localStorage.getItem('access_token') || 
                localStorage.getItem('token') || 
                sessionStorage.getItem('access_token') ||
                sessionStorage.getItem('token');
    console.log('Token présent:', !!token);

    // Test FormData CORRIGÉ selon l'API
    const formData = new FormData();
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('email', 'mahamataba2@gmail.com');
    formData.append('username', 'testuser');
    formData.append('password', 'TestPass123!');
    formData.append('phoneNumber', '+221701234567');
    formData.append('gender', 'HOMME');
    formData.append('userIdKeycloak', this.generateUUID());
    formData.append('dateOfBirth', new Date('1990-01-01').toISOString());
    
    // ✅ Format de location simple et valide
    formData.append('location', 'Test Address, Dakar, Dakar, Sénégal');
    
    formData.append('role', 'DISCIPLE');
    formData.append('active', 'true');

    // ✅ CORRECTION CRITIQUE: NE PAS ajouter 'img' si pas de fichier
    if (this.selectedFile && this.selectedFile.size > 0) {
      formData.append('img', this.selectedFile);
      console.log('📎 Fichier ajouté:', this.selectedFile.name);
    } else {
      console.log('📎 Aucun fichier sélectionné, champ img COMPLÈTEMENT omis');
    }

    try {
      const response = await fetch('http://89.47.51.6:8787/api/v1/users', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      console.log('📥 Statut:', response.status);
      const responseText = await response.text();
      console.log('📥 Réponse:', responseText);

      if (response.ok) {
        console.log('✅ SUCCÈS!', JSON.parse(responseText));
        await this.presentAlert('Succès', 'Test API réussi!');
      } else {
        const errorData = JSON.parse(responseText);
        console.error('❌ ERREUR:', errorData);
        await this.presentAlert('Erreur API', `Erreur ${response.status}: ${errorData.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      await this.presentAlert('Erreur réseau', 'Impossible de joindre le serveur');
    }
  }

  // ✅ MÉTHODE CORRIGÉE: Éviter le double dispatch
  async saveUser() {
    // ✅ Protection contre les doubles soumissions
    if (this.isSubmitting || this.hasSubmitted) {
      console.warn('⚠️ Soumission déjà en cours ou déjà effectuée');
      return;
    }

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
    this.hasSubmitted = true; // ✅ Marquer comme soumis

    try {
      const username = this.newUser.username?.trim() || (this.newUser.email ? this.newUser.email.split('@')[0] : '');
      const password = this.newUser.password || this.generateTempPassword();

      // ✅ Création d'un objet UserFormData propre
      const userData: UserFormData = {
        firstName: this.newUser.firstName?.trim() || 'zara',
        lastName: this.newUser.lastName?.trim() || 'ndiaye',
        email: this.newUser.email?.trim().toLowerCase() || 'atcreatif@gmail.com',
        username,
        password,
        phoneNumber: this.newUser.phoneNumber?.trim() || '+221777665554',
        gender: this.newUser.gender || 'NON_SPECIFIED',
        userIdKeycloak: this.newUser.userIdKeycloak || this.generateUUID(),
        dateOfBirth: this.newUser.dateOfBirth || '',
        location: this.newUser.location ? {
          locationInfoId: this.newUser.location.locationInfoId || this.generateUUID(),
          nationality: this.newUser.location.nationality || 'Sénégalaise',
          country: this.newUser.location.country || 'Sénégal',
          region: this.newUser.location.region || 'Dakar',
          department: this.newUser.location.department || this.newUser.location.region || 'Dakar',
          address: this.newUser.location.address?.trim() || 'Dakar, sn'
        } : {
          locationInfoId: this.generateUUID(),
          nationality: 'Sénégalaise',
          country: 'Sénégal',
          region: 'Dakar',
          department: 'Dakar',
          address: 'Adresse non spécifiée'
        },
        category: this.newUser.category || 'DISCIPLE',
        role: this.newUser.category || 'DISCIPLE',
        active: this.newUser.active !== false
      };

      console.log('=== COMPONENT DEBUG ===');
      console.log('userData à envoyer:', userData);
      console.log('file à envoyer:', this.selectedFile);
      
      // Vérifications avant envoi
      if (!userData.firstName || !userData.lastName || !userData.email) {
        await this.presentAlert('Erreur', 'Les champs Prénom, Nom et Email sont obligatoires.');
        await loading.dismiss();
        this.isSubmitting = false;
        this.hasSubmitted = false; // ✅ Reset en cas d'erreur
        return;
      }

      // ✅ Objet sérialisable pour NgRx (sans références circulaires)
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

      // ✅ Validation finale
      if (typeof cleanUserData !== 'object' || !cleanUserData.firstName) {
        throw new Error('Données utilisateur invalides');
      }

      // ✅ Dispatch unique de l'action
      this.store.dispatch(UsersActions.createUser({ 
        userData: cleanUserData, 
        file: this.selectedFile || undefined 
      }));

      await loading.dismiss();
      
      // ✅ SOLUTION: Fermer le modal avec un flag de succès seulement
      // Ne pas passer les données utilisateur pour éviter le double dispatch
      this.modalController.dismiss({ success: true });
      
    } catch (error) {
      await loading.dismiss();
      console.error('❌ Erreur création utilisateur:', error);
      await this.presentAlert('Erreur', 'Une erreur est survenue lors de la création de l\'utilisateur.');
      
      // ✅ Reset les flags en cas d'erreur
      this.hasSubmitted = false;
      
      // ✅ Fermer le modal avec l'erreur
      this.modalController.dismiss({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      });
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
    // ✅ Validation renforcée du fichier
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

  onCategoryChange() {
    this.newUser.role = this.newUser.category;
  }

  onEmailChange() {
    if (!this.newUser.username && this.newUser.email?.includes('@')) {
      this.newUser.username = this.newUser.email.split('@')[0];
    }
  }
}