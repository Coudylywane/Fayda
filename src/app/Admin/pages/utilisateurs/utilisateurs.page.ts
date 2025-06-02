import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalController, AlertController, ActionSheetController, LoadingController, ToastController } from '@ionic/angular';

import { AddUserModalComponent } from './modals/add-user-modal/add-user-modal.component';
import { FilterUsersModalComponent } from './modals/filter-users-modal/filter-users-modal.component';
import { ViewUserModalComponent } from './modals/view-user-modal/view-user-modal.component';
import { EditUserModalComponent } from './modals/edit-user-modal/edit-user-modal.component';
import { UserAdminService } from './services/useradmin.service';
import { User, UserFormData } from './modals/users.model';

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.page.html',
  styleUrls: ['./utilisateurs.page.scss'],
  standalone: false,
})
export class UtilisateursPage implements OnInit, OnDestroy {
  searchTerm = '';
  activeFilter = 'Tous';
  users: User[] = [];
  isLoading = false;
  filters = ['Tous', 'Disciples', 'Visiteurs', 'Mouqadam', 'Resp. Dahira'];
  
  private userSubscription = new Subscription();

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private userService: UserAdminService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  // Chargement initial des utilisateurs
  async loadUsers() {
    this.isLoading = true;
    
    try {
      this.userService.initialize();
      
      this.userSubscription.add(
        this.userService.users$.subscribe({
          next: users => {
            this.users = users;
            this.isLoading = false;
            console.log('Utilisateurs chargés:', users.length);
          },
          error: error => {
            console.error('Erreur lors du chargement:', error);
            this.isLoading = false;
            this.presentErrorToast('Impossible de charger les utilisateurs');
          }
        })
      );
    } catch (error) {
      this.isLoading = false;
      this.presentErrorToast('Erreur lors de l\'initialisation');
    }
  }

  // Rafraîchissement de la liste
  async refreshUsers() {
    this.userService.loadUsers().subscribe({
      next: users => {
        console.log('Liste rafraîchie:', users.length, 'utilisateurs');
        this.presentSuccessToast('Liste mise à jour');
      },
      error: error => {
        console.error('Erreur rafraîchissement:', error);
        this.presentErrorToast('Impossible de rafraîchir la liste');
      }
    });
  }

  // Utilisateurs filtrés
  get filteredUsers(): User[] {
    let filtered = [...this.users];
    
    // Filtrage par catégorie
    if (this.activeFilter !== 'Tous') {
      filtered = filtered.filter(user => user.category === this.activeFilter);
    }
    
    // Filtrage par terme de recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(term) ||
        user.firstName?.toLowerCase().includes(term) ||
        user.lastName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.category?.toLowerCase().includes(term) ||
        user.phoneNumber?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }

  // Définir le filtre actif
  setFilter(filter: string) {
    this.activeFilter = filter;
  }

  // Réinitialiser les filtres
  resetFilters() {
    this.searchTerm = '';
    this.setFilter('Tous');
  }

  // Ouvrir le modal d'ajout d'utilisateur
  async openAddUserModal() {
    const modal = await this.modalController.create({
      component: AddUserModalComponent,
      cssClass: 'add-user-modal'
    });
    
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data) {
      await this.createUser(data);
    }
  }

  // Créer un utilisateur
  async createUser(userData: UserFormData) {
    const loading = await this.loadingController.create({
      message: 'Création de l\'utilisateur...',
      spinner: 'circular'
    });

    await loading.present();

    this.userService.createUser(userData).subscribe({
      next: (response) => {
        loading.dismiss();
        const userName = userData.name || `${userData.firstName} ${userData.lastName}`;
        this.presentSuccessAlert('Utilisateur créé', `${userName} a été créé avec succès`);
      },
      error: (error) => {
        loading.dismiss();

        // Fallback: créer un utilisateur local
        const newUser = this.userService.createUserWithFallback(userData);
        this.userService.addUserLocally(newUser);

        const errorMessage = error.error?.message || error.message || 'Erreur lors de la création';
        const userName = userData.name || `${userData.firstName} ${userData.lastName}`;
        
        this.presentWarningAlert(
          'Utilisateur ajouté localement', 
          `${errorMessage}. ${userName} a été ajouté localement et sera synchronisé plus tard.`
        );
      }
    });
  }

  // Ouvrir le modal de filtrage
  async openFilterModal() {
    const modal = await this.modalController.create({
      component: FilterUsersModalComponent,
      cssClass: 'filter-users-modal',
      componentProps: {
        currentFilter: this.activeFilter,
        currentSearchTerm: this.searchTerm
      }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data) {
      if (data.category) this.activeFilter = data.category;
      if (data.searchTerm !== undefined) this.searchTerm = data.searchTerm;
    }
  }

  // Options utilisateur (ActionSheet)
  async openUserOptions(user: User) {
    const actionSheet = await this.actionSheetController.create({
      header: `Options pour ${user.name}`,
      buttons: [
        {
          text: 'Voir les détails',
          icon: 'eye-outline',
          handler: () => this.viewUser(user)
        },
        {
          text: 'Modifier',
          icon: 'pencil-outline',
          handler: () => this.editUser(user)
        },
        {
          text: user.active ? 'Désactiver' : 'Activer',
          icon: user.active ? 'close-circle-outline' : 'checkmark-circle-outline',
          handler: () => this.toggleUserStatus(user)
        },
        {
          text: 'Supprimer',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => this.confirmDeleteUser(user)
        },
        {
          text: 'Annuler',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    
    await actionSheet.present();
  }

  // Voir un utilisateur
  async viewUser(user: User) {
    const modal = await this.modalController.create({
      component: ViewUserModalComponent,
      componentProps: { user }
    });
    await modal.present();
  }

  // Modifier un utilisateur
  async editUser(user: User) {
    const modal = await this.modalController.create({
      component: EditUserModalComponent,
      componentProps: { user }
    });
    
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data) {
      await this.updateUser(user.id, data);
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(userId: string, userData: Partial<User>) {
    const loading = await this.loadingController.create({
      message: 'Mise à jour...',
      spinner: 'circular'
    });

    await loading.present();

    this.userService.updateUser(userId, userData).subscribe({
      next: () => {
        loading.dismiss();
        this.presentSuccessToast('Utilisateur mis à jour');
      },
      error: (error) => {
        loading.dismiss();
        
        // Fallback: mise à jour locale
        const currentUser = this.users.find(u => u.id === userId);
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          this.userService.updateUserLocally(updatedUser);
          this.presentWarningToast('Mis à jour localement. Synchronisation en attente.');
        } else {
          this.presentErrorToast('Impossible de mettre à jour l\'utilisateur');
        }
      }
    });
  }

  // Basculer le statut d'un utilisateur
  async toggleUserStatus(user: User) {
    const newStatus = !user.active;
    await this.updateUser(user.id, { active: newStatus });
  }

  // Confirmer la suppression d'un utilisateur
  async confirmDeleteUser(user: User) {
    const alert = await this.alertController.create({
      header: 'Confirmation de suppression',
      message: `Êtes-vous sûr de vouloir supprimer définitivement ${user.name} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => this.deleteUser(user)
        }
      ]
    });

    await alert.present();
  }

  // Supprimer un utilisateur
  async deleteUser(user: User) {
    const loading = await this.loadingController.create({
      message: 'Suppression...',
      spinner: 'circular'
    });

    await loading.present();

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        loading.dismiss();
        this.presentSuccessAlert('Utilisateur supprimé', `${user.name} a été supprimé avec succès.`);
      },
      error: (error) => {
        loading.dismiss();
        
        // Fallback: suppression locale
        this.userService.removeUserLocally(user.id);
        this.presentWarningAlert(
          'Supprimé localement', 
          `${user.name} a été supprimé localement. La synchronisation se fera plus tard.`
        );
      }
    });
  }

  // Gestion des erreurs d'image
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/default-avatar.png';
    }
  }

  // Méthodes de notification
  private async presentSuccessAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'success-alert'
    });
    await alert.present();
  }

  private async presentErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'error-alert'
    });
    await alert.present();
  }

  private async presentWarningAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'warning-alert'
    });
    await alert.present();
  }

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

  private async presentWarningToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'warning'
    });
    await toast.present();
  }
}