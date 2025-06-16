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
  @Input() user!: User; // ✅ Correction: Utiliser ! pour indiquer qu'il sera initialisé
  
  // ✅ Propriétés pour l'affichage enrichi
  displayUser: any = {};
  userAge: number | null = null;
  membershipDuration: string = '';
  
  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController, // ✅ Ajout ActionSheetController
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    if (this.user) {
      this.initializeDisplayData();
    }
  }

  // ✅ NOUVELLE MÉTHODE: Préparation des données d'affichage
  private initializeDisplayData() {
    this.displayUser = {
      ...this.user,
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

  // ✅ NOUVELLE MÉTHODE: Formatage du numéro de téléphone
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

  // ✅ NOUVELLE MÉTHODE: Formatage de l'adresse complète
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

  // ✅ NOUVELLE MÉTHODE: Formatage des dates
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

  // ✅ NOUVELLE MÉTHODE: Formatage du genre
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

  // ✅ NOUVELLE MÉTHODE: Calcul de l'âge
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

  // ✅ NOUVELLE MÉTHODE: Calcul de la durée d'adhésion
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

  // ✅ MÉTHODE AMÉLIORÉE: Fermeture du modal
  dismiss() {
    this.modalController.dismiss();
  }

  // ✅ MÉTHODE AMÉLIORÉE: Édition avec gestion d'erreur
  async editUser() {
    try {
      // ✅ Marquer l'utilisateur comme sélectionné dans le store
      this.store.dispatch(UsersActions.selectUser({ user: this.user }));
      
      // Fermer ce modal
      await this.modalController.dismiss();
      
      // Ouvrir le modal d'édition
      const modal = await this.modalController.create({
        component: EditUserModalComponent,
        componentProps: {
          user: { ...this.user } // Copie profonde pour éviter les modifications accidentelles
        },
        cssClass: 'edit-user-modal'
      });
      
      await modal.present();
      
      // Attendre la fermeture du modal et gérer le résultat
      const { data, role } = await modal.onWillDismiss();
      
      if (data && role === 'save') {
        // ✅ Dispatcher l'action de mise à jour via le store
        this.store.dispatch(UsersActions.updateUser({ 
          userId: this.user.id, 
          userData: data 
        }));
        
        await this.presentSuccessToast('Utilisateur modifié avec succès');
        
        // Retourner les données mises à jour au parent
        this.modalController.dismiss({ success: true, user: data }, 'edit');
      }
    } catch (error) {
      console.error('Erreur lors de l\'édition:', error);
      await this.presentErrorToast('Erreur lors de l\'ouverture du modal d\'édition');
    }
  }

  // ✅ MÉTHODE AMÉLIORÉE: Confirmation de suppression
  async confirmDelete() {
    const alert = await this.alertController.create({
      header: 'Confirmation de suppression',
      message: `
        <div style="text-align: center;">
          <p>Êtes-vous sûr de vouloir supprimer <strong>${this.user.name}</strong> ?</p>
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

  // ✅ NOUVELLE MÉTHODE: Suppression avec gestion d'erreur
  private async deleteUser() {
    try {
      // ✅ Dispatcher l'action de suppression via le store
      this.store.dispatch(UsersActions.deleteUser({ userId: this.user.id }));
      
      await this.presentSuccessToast('Utilisateur supprimé avec succès');
      
      // Fermer le modal avec indication de suppression
      this.modalController.dismiss({ success: true, deleted: true, userId: this.user.id }, 'delete');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      await this.presentErrorToast('Erreur lors de la suppression');
    }
  }

  // ✅ NOUVELLE MÉTHODE: Basculer le statut actif/inactif
  async toggleUserStatus() {
    try {
      const newStatus = !this.user.active;
      const action = newStatus ? 'activé' : 'désactivé';
      
      this.store.dispatch(UsersActions.toggleUserStatus({ 
        userId: this.user.id, 
        active: newStatus 
      }));
      
      // Mettre à jour l'affichage local
      this.user.active = newStatus;
      this.initializeDisplayData();
      
      await this.presentSuccessToast(`Utilisateur ${action} avec succès`);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      await this.presentErrorToast('Erreur lors du changement de statut');
    }
  }

  // ✅ NOUVELLE MÉTHODE: Copier l'email
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

  // ✅ NOUVELLE MÉTHODE: Appeler le téléphone
  callPhone() {
    if (this.user.phoneNumber) {
      const cleanPhone = this.user.phoneNumber.replace(/\D/g, '');
      window.open(`tel:+${cleanPhone.startsWith('221') ? cleanPhone : '221' + cleanPhone}`);
    }
  }

  // ✅ NOUVELLE MÉTHODE: Envoyer un email
  sendEmail() {
    if (this.user.email) {
      window.open(`mailto:${this.user.email}`);
    }
  }

  // ✅ MÉTHODE CORRIGÉE: Action sheet sans icônes (incompatibles avec AlertController)
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

  // ✅ NOUVELLE MÉTHODE: Gestion des erreurs d'image
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      const initial = this.user.firstName?.[0] || 'U';
      target.src = `https://via.placeholder.com/150/4169E1/FFFFFF?text=${initial}`;
    }
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