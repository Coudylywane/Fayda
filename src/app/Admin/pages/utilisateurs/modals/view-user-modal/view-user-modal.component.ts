import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { EditUserModalComponent } from '../edit-user-modal/edit-user-modal.component';
import { User } from '../users.model';
import { AppState } from '../../app.state';
import * as UsersActions from '../../store/users.actions';

@Component({
  selector: 'app-view-user-modal',
  templateUrl: './view-user-modal.component.html',
  styleUrls: ['./view-user-modal.component.scss'],
  standalone: false
})
export class ViewUserModalComponent implements OnInit {
  @Input() user!: User;
  
  // ✅ Propriétés pour l'affichage enrichi
  displayUser: any = {};
  userAge: number | null = null;
  membershipDuration: string = '';
  
  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    if (this.user) {
      this.initializeDisplayData();
    }
  }

  // ✅ MÉTHODE ADAPTÉE: Préparation des données d'affichage
  private initializeDisplayData() {
    this.displayUser = {
      ...this.user,
      // ✅ Nom complet
      fullName: `${this.user.firstName} ${this.user.lastName}`,
      
      // ✅ Formatage de l'email
      emailDisplay: this.user.email || 'Non renseigné',
      
      // ✅ Formatage du téléphone
      phoneDisplay: this.formatPhoneNumber(this.user.phoneNumber) || 'Non renseigné',
      
      // ✅ Formatage de l'adresse complète
      addressDisplay: this.formatFullAddress(),
      
      // ✅ Formatage des dates
      joinDateDisplay: this.formatDate(this.user.createdAt) || 'Non renseignée',
      birthDateDisplay: this.formatDate(this.user.dateOfBirth) || 'Non renseignée',
      
      // ✅ Statut avec couleur
      statusDisplay: {
        text: this.user.active ? 'Actif' : 'Inactif',
        color: this.user.active ? 'success' : 'danger',
        icon: this.user.active ? 'checkmark-circle' : 'close-circle'
      },
      
      // ✅ Genre formaté
      genderDisplay: this.formatGender(this.user.gender),
      
      // ✅ Nationalité et pays
      nationalityDisplay: this.user.location?.nationality || 'Non renseignée',
      countryDisplay: this.user.location?.country || 'Non renseigné'
    };

    // ✅ Calculer l'âge si date de naissance disponible
    if (this.user.dateOfBirth) {
      this.userAge = this.calculateAge(this.user.dateOfBirth);
    }

    // ✅ Calculer la durée d'adhésion
    if (this.user.createdAt) {
      this.membershipDuration = this.calculateMembershipDuration(this.user.createdAt);
    }
  }

  // ✅ MÉTHODE ADAPTÉE: Formatage du numéro de téléphone
  private formatPhoneNumber(phone: string | undefined): string {
    if (!phone) return '';
    
    // Format sénégalais : +221 XX XXX XX XX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 9 && cleaned.startsWith('7')) {
      return `+221 ${cleaned.slice(0,2)} ${cleaned.slice(2,5)} ${cleaned.slice(5,7)} ${cleaned.slice(7,9)}`;
    }
    if (cleaned.length === 12 && cleaned.startsWith('221')) {
      return `+${cleaned.slice(0,3)} ${cleaned.slice(3,5)} ${cleaned.slice(5,8)} ${cleaned.slice(8,10)} ${cleaned.slice(10,12)}`;
    }
    return phone;
  }

  // ✅ MÉTHODE ADAPTÉE: Formatage de l'adresse complète
  private formatFullAddress(): string {
    if (!this.user.location) return 'Non renseignée';
    
    const location = this.user.location;
    const parts = [
      location.address,
      location.department,
      location.region,
      location.country
    ].filter(part => part && part.trim() !== '');
    
    return parts.length > 0 ? parts.join(', ') : 'Non renseignée';
  }

  // ✅ MÉTHODE ADAPTÉE: Formatage des dates
  private formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  // ✅ MÉTHODE ADAPTÉE: Formatage du genre
  private formatGender(gender: string | undefined): string {
    if (!gender) return 'Non spécifié';
    
    const genderMap: { [key: string]: string } = {
      'HOMME': 'Homme',
      'FEMME': 'Femme',
      'MALE': 'Homme',
      'FEMALE': 'Femme',
      'M': 'Homme',
      'F': 'Femme',
      'NON_SPECIFIED': 'Non spécifié'
    };
    
    return genderMap[gender.toUpperCase()] || gender;
  }

  // ✅ MÉTHODE ADAPTÉE: Calcul de l'âge
  private calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  // ✅ MÉTHODE ADAPTÉE: Calcul de la durée d'adhésion
  private calculateMembershipDuration(joinDate: string): string {
    const today = new Date();
    const joined = new Date(joinDate);
    const diffTime = Math.abs(today.getTime() - joined.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mois`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return remainingMonths > 0 ? 
        `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois` :
        `${years} an${years > 1 ? 's' : ''}`;
    }
  }

  // ✅ MÉTHODE STANDARD: Fermeture du modal
  dismiss() {
    this.modalController.dismiss();
  }

  // ✅ MÉTHODE STANDARD: Édition avec gestion d'erreur
  async editUser() {
    try {
      this.store.dispatch(UsersActions.selectUser({ user: this.user }));
      
      await this.modalController.dismiss();
      
      const modal = await this.modalController.create({
        component: EditUserModalComponent,
        componentProps: {
          user: { ...this.user }
        },
        cssClass: 'edit-user-modal'
      });
      
      await modal.present();
      
      const { data, role } = await modal.onWillDismiss();
      
      if (data && role === 'save') {
        this.store.dispatch(UsersActions.updateUser({ 
          userId: this.user.id, 
          userData: data 
        }));
        
        await this.presentSuccessToast('Utilisateur modifié avec succès');
        this.modalController.dismiss({ success: true, user: data }, 'edit');
      }
    } catch (error) {
      console.error('Erreur lors de l\'édition:', error);
      await this.presentErrorToast('Erreur lors de l\'ouverture du modal d\'édition');
    }
  }

  // ✅ MÉTHODE STANDARD: Confirmation de suppression
  async confirmDelete() {
    const alert = await this.alertController.create({
      header: 'Confirmation de suppression',
      message: `
        <div style="text-align: center;">
          <p>Êtes-vous sûr de vouloir supprimer <strong>${this.displayUser.fullName}</strong> ?</p>
          <p style="color: #e74c3c; font-size: 0.9em; margin-top: 10px;">
            ⚠️ Cette action est irréversible
          </p>
        </div>
      `,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          cssClass: 'alert-button-destructive',
          handler: () => {
            this.deleteUser();
          }
        }
      ]
    });
    
    await alert.present();
  }

  // ✅ MÉTHODE STANDARD: Suppression avec gestion d'erreur
  private async deleteUser() {
    try {
      this.store.dispatch(UsersActions.deleteUser({ userId: this.user.id }));
      
      await this.presentSuccessToast('Utilisateur supprimé avec succès');
      
      this.modalController.dismiss({ success: true, deleted: true, userId: this.user.id }, 'delete');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      await this.presentErrorToast('Erreur lors de la suppression');
    }
  }

  // ✅ MÉTHODE CORRIGÉE: Basculer le statut actif/inactif
  async toggleUserStatus() {
    try {
      const newStatus = !this.user.active;
      const action = newStatus ? 'activé' : 'désactivé';
      
      // ✅ CORRECTION: Dispatche l'action SANS modifier l'objet user directement
      this.store.dispatch(UsersActions.toggleUserStatus({ 
        userId: this.user.id, 
        active: newStatus 
      }));
      
      // ✅ CORRECTION: Mettre à jour seulement l'affichage local
      this.displayUser.statusDisplay = {
        text: newStatus ? 'Actif' : 'Inactif',
        color: newStatus ? 'success' : 'danger',
        icon: newStatus ? 'checkmark-circle' : 'close-circle'
      };
      
      await this.presentSuccessToast(`Utilisateur ${action} avec succès`);
      
      // ✅ Fermer le modal avec les nouvelles données
      this.modalController.dismiss({ 
        success: true, 
        user: { ...this.user, active: newStatus } 
      }, 'status');
      
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      await this.presentErrorToast('Erreur lors du changement de statut');
    }
  }

  // ✅ MÉTHODE STANDARD: Copier l'email
  async copyEmail() {
    if (this.user.email) {
      try {
        await navigator.clipboard.writeText(this.user.email);
        await this.presentSuccessToast('Email copié dans le presse-papiers');
      } catch {
        // Fallback pour les navigateurs qui ne supportent pas clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = this.user.email;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        await this.presentSuccessToast('Email copié');
      }
    }
  }

  // ✅ MÉTHODE STANDARD: Appeler le téléphone
  callPhone() {
    if (this.user.phoneNumber) {
      const cleanPhone = this.user.phoneNumber.replace(/\D/g, '');
      window.open(`tel:+${cleanPhone.startsWith('221') ? cleanPhone : '221' + cleanPhone}`);
    }
  }

  // ✅ MÉTHODE STANDARD: Envoyer un email
  sendEmail() {
    if (this.user.email) {
      window.open(`mailto:${this.user.email}`);
    }
  }

  // ✅ MÉTHODE STANDARD: Action sheet
  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Actions rapides',
      buttons: [
        {
          text: 'Modifier',
          handler: () => this.editUser()
        },
        {
          text: this.user.active ? 'Désactiver' : 'Activer',
          handler: () => this.toggleUserStatus()
        },
        {
          text: 'Copier email',
          handler: () => this.copyEmail()
        },
        {
          text: 'Appeler',
          handler: () => this.callPhone()
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => this.confirmDelete()
        },
        {
          text: 'Annuler',
          role: 'cancel'
        }
      ]
    });
    
    await actionSheet.present();
  }

  // ✅ MÉTHODE CORRIGÉE: Gestion des erreurs d'image
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      // ✅ CORRECTION: Utilise l'avatar SVG généré au lieu de via.placeholder.com
      const avatarSVG = this.generateAvatarSVG({ 
        firstName: this.user.firstName, 
        lastName: this.user.lastName 
      });
      target.src = avatarSVG;
      
      // Empêcher les erreurs en cascade
      target.onerror = null;
    }
  }

  // ✅ NOUVELLE MÉTHODE: Générer un avatar SVG avec initiales
  generateAvatarSVG(user: any, size: number = 150): string {
    const initials = this.getInitials(user);
    const backgroundColor = this.getColorForUser(user);
    
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${backgroundColor}"/>
        <text x="50%" y="50%" dy="0.35em" text-anchor="middle" 
              fill="white" font-family="Arial, sans-serif" 
              font-size="${size * 0.4}" font-weight="600">
          ${initials}
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  // ✅ NOUVELLE MÉTHODE: Obtenir les initiales
  getInitials(user: any): string {
    if (user?.firstName && user?.lastName) {
      return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user?.lastName) {
      return user.lastName.charAt(0).toUpperCase();
    }
    return 'U';
  }

  // ✅ NOUVELLE MÉTHODE: Obtenir une couleur pour l'avatar
  getColorForUser(user: any): string {
    const colors = [
      '#4169E1', '#32CD32', '#FF6347', '#9370DB', 
      '#20B2AA', '#FF4500', '#DA70D6', '#1E90FF',
      '#FFD700', '#FF69B4', '#00CED1', '#FFA500'
    ];
    
    const identifier = user?.firstName || user?.lastName || user?.email || 'default';
    const hash = this.simpleHash(identifier);
    return colors[hash % colors.length];
  }

  // ✅ NOUVELLE MÉTHODE: Hash simple
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // ===================================
  // MÉTHODES UTILITAIRES DE NOTIFICATION
  // ===================================

  private async presentSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  }

  private async presentErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }
}