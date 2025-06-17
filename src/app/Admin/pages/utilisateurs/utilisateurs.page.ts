import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModalController, AlertController, ActionSheetController, LoadingController, ToastController } from '@ionic/angular';

import { AppState } from './app.state';
import * as UsersActions from './store/users.actions';
import * as UsersSelectors from './store/users.selectors';
import { User, UserFormData } from './modals/users.model';

// Import des modals
import { AddUserModalComponent } from './modals/add-user-modal/add-user-modal.component';
import { FilterUsersModalComponent } from './modals/filter-users-modal/filter-users-modal.component';
import { ViewUserModalComponent } from './modals/view-user-modal/view-user-modal.component';
import { EditUserModalComponent } from './modals/edit-user-modal/edit-user-modal.component';

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.page.html',
  styleUrls: ['./utilisateurs.page.scss'],
  standalone: false,
})
export class UtilisateursPage implements OnInit, OnDestroy {
  users$: Observable<User[]>;
  filteredUsers$: Observable<User[]>;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  searchTerm$: Observable<string>;
  category$: Observable<string>;
  usersCount$: Observable<number>;
  filteredUsersCount$: Observable<number>;
  
  filters = ['Tous', 'Disciples', 'Visiteurs', 'Mouqadam', 'Resp. Dahira'];
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private modalController: ModalController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    // Initialisation des observables
    this.users$ = this.store.select(UsersSelectors.selectAllUsers);
    this.filteredUsers$ = this.store.select(UsersSelectors.selectFilteredUsers);
    this.loading$ = this.store.select(UsersSelectors.selectUsersLoading);
    this.error$ = this.store.select(UsersSelectors.selectUsersError);
    this.searchTerm$ = this.store.select(UsersSelectors.selectSearchTerm);
    this.category$ = this.store.select(UsersSelectors.selectCategory);
    this.usersCount$ = this.store.select(UsersSelectors.selectUsersCount);
    this.filteredUsersCount$ = this.store.select(UsersSelectors.selectFilteredUsersCount);
  }

  ngOnInit() {
    this.loadUsers();
    
    // Gestion des erreurs
    this.error$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        this.presentErrorToast(error.message || 'Une erreur est survenue');
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers() {
    this.store.dispatch(UsersActions.loadUsers({}));
  }

  refreshUsers() {
    this.store.dispatch(UsersActions.loadUsers({}));
  }

  setFilter(category: string) {
    this.store.dispatch(UsersActions.setCategory({ category }));
  }

  onSearchTermChange(searchTerm: string) {
    this.store.dispatch(UsersActions.setSearchTerm({ searchTerm }));
  }

  resetFilters() {
    this.store.dispatch(UsersActions.resetFilters());
  }

  // ✅ CORRECTION MAJEURE: Supprimer le double dispatch
  async openAddUserModal() {
    const modal = await this.modalController.create({
      component: AddUserModalComponent,
      cssClass: 'add-user-modal'
    });
    
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    // ✅ SOLUTION: Ne plus dispatcher createUser ici
    // Le modal fait déjà le dispatch dans sa méthode saveUser()
    if (data && data.success) {
      console.log('✅ Modal fermée avec succès - utilisateur créé');
      // Optionnel: recharger la liste des utilisateurs
      this.store.dispatch(UsersActions.loadUsers({}));
      await this.presentSuccessToast('Utilisateur créé avec succès');
    } else if (data && data.error) {
      console.error('❌ Erreur lors de la création:', data.error);
      await this.presentErrorToast(data.error);
    }
  }

  async openFilterModal() {
    const currentSearchTerm = await this.getFirstValue(this.searchTerm$);
    const currentCategory = await this.getFirstValue(this.category$);
    
    const modal = await this.modalController.create({
      component: FilterUsersModalComponent,
      cssClass: 'filter-users-modal',
      componentProps: {
        currentFilter: currentCategory,
        currentSearchTerm: currentSearchTerm
      }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data) {
      if (data.category) {
        this.store.dispatch(UsersActions.setCategory({ category: data.category }));
      }
      if (data.searchTerm !== undefined) {
        this.store.dispatch(UsersActions.setSearchTerm({ searchTerm: data.searchTerm }));
      }
    }
  }

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
          text: 'Appeler',
          icon: 'call-outline',
          handler: () => this.callUser(user)
        },
        {
          text: 'Envoyer un email',
          icon: 'mail-outline',
          handler: () => this.emailUser(user)
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

  // ✅ NOUVELLE MÉTHODE: Appeler un utilisateur
  callUser(user: User) {
    if (user.phoneNumber) {
      const cleanPhone = user.phoneNumber.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('221') ? cleanPhone : '221' + cleanPhone;
      window.open(`tel:+${formattedPhone}`);
    } else {
      this.presentErrorToast('Aucun numéro de téléphone disponible');
    }
  }

  // ✅ NOUVELLE MÉTHODE: Envoyer un email à un utilisateur
  emailUser(user: User) {
    if (user.email) {
      window.open(`mailto:${user.email}`);
    } else {
      this.presentErrorToast('Aucune adresse email disponible');
    }
  }

  // ✅ NOUVELLE MÉTHODE: Recherche avancée
  async openAdvancedSearch() {
    const alert = await this.alertController.create({
      header: 'Recherche avancée',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nom complet...'
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email...'
        },
        {
          name: 'phone',
          type: 'tel',
          placeholder: 'Téléphone...'
        },
        {
          name: 'location',
          type: 'text',
          placeholder: 'Localisation...'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Rechercher',
          handler: (data) => {
            this.performAdvancedSearch(data);
          }
        }
      ]
    });

    await alert.present();
  }

  // ✅ NOUVELLE MÉTHODE: Effectuer une recherche avancée
  private performAdvancedSearch(criteria: any) {
    // Combiner tous les critères de recherche
    const searchTerms = Object.values(criteria)
      .filter(term => term && typeof term === 'string' && term.trim().length > 0)
      .join(' ');
    
    if (searchTerms) {
      this.store.dispatch(UsersActions.setSearchTerm({ searchTerm: searchTerms }));
      this.presentSuccessToast(`Recherche effectuée pour: "${searchTerms}"`);
    } else {
      this.presentErrorToast('Veuillez saisir au moins un critère de recherche');
    }
  }

  // ✅ NOUVELLE MÉTHODE: Exporter les données
  async exportUsers() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Exporter les utilisateurs',
      buttons: [
        {
          text: 'Exporter tous les utilisateurs',
          icon: 'download-outline',
          handler: () => this.performExport('all')
        },
        {
          text: 'Exporter les utilisateurs filtrés',
          icon: 'filter-outline',
          handler: () => this.performExport('filtered')
        },
        {
          text: 'Exporter les utilisateurs actifs',
          icon: 'checkmark-circle-outline',
          handler: () => this.performExport('active')
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

  // ✅ NOUVELLE MÉTHODE: Effectuer l'export
  private async performExport(type: 'all' | 'filtered' | 'active') {
    try {
      const loading = await this.loadingController.create({
        message: 'Préparation de l\'export...',
        spinner: 'crescent'
      });
      await loading.present();

      // Récupérer les données selon le type d'export
      let usersToExport: User[] = [];
      
      switch (type) {
        case 'all':
          usersToExport = await this.getFirstValue(this.users$);
          break;
        case 'filtered':
          usersToExport = await this.getFirstValue(this.filteredUsers$);
          break;
        case 'active':
          const allUsers = await this.getFirstValue(this.users$);
          usersToExport = allUsers.filter(user => user.active);
          break;
      }

      // Convertir en CSV
      const csvContent = this.convertToCSV(usersToExport);
      
      // Télécharger le fichier
      this.downloadCSV(csvContent, `utilisateurs_${type}_${new Date().toISOString().split('T')[0]}.csv`);
      
      await loading.dismiss();
      await this.presentSuccessToast(`Export de ${usersToExport.length} utilisateur(s) terminé`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      await this.presentErrorToast('Erreur lors de l\'export');
    }
  }

  // ✅ NOUVELLE MÉTHODE: Convertir en CSV
  private convertToCSV(users: User[]): string {
    const headers = [
      'ID', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Genre', 
      'Date de naissance', 'Catégorie', 'Statut', 'Nationalité', 
      'Pays', 'Région', 'Adresse', 'Date d\'inscription'
    ];

    const csvRows = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        `"${user.firstName || ''}"`,
        `"${user.lastName || ''}"`,
        `"${user.email || ''}"`,
        `"${user.phoneNumber || ''}"`,
        `"${user.gender || ''}"`,
        `"${user.dateOfBirth || ''}"`,
        `"${user.category || ''}"`,
        user.active ? 'Actif' : 'Inactif',
        `"${user.location?.nationality || ''}"`,
        `"${user.location?.country || ''}"`,
        `"${user.location?.region || ''}"`,
        `"${user.location?.address || ''}"`,
        `"${user.createdAt || ''}"`
      ].join(','))
    ];

    return csvRows.join('\n');
  }

  // ✅ NOUVELLE MÉTHODE: Télécharger le CSV
  private downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // ✅ NOUVELLE MÉTHODE: Statistiques rapides
  async showUserStats() {
    const allUsers = await this.getFirstValue(this.users$);
    const activeUsers = allUsers.filter(user => user.active);
    const inactiveUsers = allUsers.filter(user => !user.active);
    
    // Statistiques par catégorie
    const statsByCategory = this.filters.slice(1).map(category => {
      const count = allUsers.filter(user => user.category === category).length;
      return { category, count };
    });

    // Statistiques par genre
    const maleCount = allUsers.filter(user => 
      user.gender?.toLowerCase().includes('homme') || 
      user.gender?.toLowerCase().includes('male') ||
      user.gender?.toLowerCase().includes('m')
    ).length;
    const femaleCount = allUsers.filter(user => 
      user.gender?.toLowerCase().includes('femme') || 
      user.gender?.toLowerCase().includes('female') ||
      user.gender?.toLowerCase().includes('f')
    ).length;

    const alert = await this.alertController.create({
      header: 'Statistiques des utilisateurs',
      message: `
        <div style="text-align: left;">
          <h4>📊 Vue d'ensemble</h4>
          <p><strong>Total:</strong> ${allUsers.length} utilisateurs</p>
          <p><strong>Actifs:</strong> ${activeUsers.length} (${Math.round(activeUsers.length/allUsers.length*100)}%)</p>
          <p><strong>Inactifs:</strong> ${inactiveUsers.length} (${Math.round(inactiveUsers.length/allUsers.length*100)}%)</p>
          
          <h4>👥 Par catégorie</h4>
          ${statsByCategory.map(stat => 
            `<p><strong>${stat.category}:</strong> ${stat.count}</p>`
          ).join('')}
          
          <h4>🚻 Par genre</h4>
          <p><strong>Hommes:</strong> ${maleCount}</p>
          <p><strong>Femmes:</strong> ${femaleCount}</p>
          <p><strong>Non spécifié:</strong> ${allUsers.length - maleCount - femaleCount}</p>
        </div>
      `,
      buttons: [
        {
          text: 'Exporter',
          handler: () => this.exportUsers()
        },
        {
          text: 'Fermer',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  // ✅ MÉTHODE AMÉLIORÉE: Visualisation utilisateur avec gestion des actions
  async viewUser(user: User) {
    // Marquer l'utilisateur comme sélectionné dans le store
    this.store.dispatch(UsersActions.selectUser({ user }));
    
    const modal = await this.modalController.create({
      component: ViewUserModalComponent,
      componentProps: { user },
      cssClass: 'view-user-modal'
    });
    
    await modal.present();
    
    // ✅ NOUVEAU: Gérer les actions retournées par le modal
    const { data, role } = await modal.onWillDismiss();
    
    if (data && data.success) {
      switch (role) {
        case 'edit':
          // L'utilisateur a été modifié
          await this.presentSuccessToast('Utilisateur modifié avec succès');
          this.refreshUsers();
          break;
          
        case 'delete':
          // L'utilisateur a été supprimé
          await this.presentSuccessToast('Utilisateur supprimé avec succès');
          this.refreshUsers();
          break;
          
        case 'status':
          // Le statut a été modifié
          const action = data.user?.active ? 'activé' : 'désactivé';
          await this.presentSuccessToast(`Utilisateur ${action} avec succès`);
          this.refreshUsers();
          break;
      }
    } else if (data && data.error) {
      await this.presentErrorToast(data.error);
    }
  }

  // ✅ MÉTHODE AMÉLIORÉE: Édition avec retour de données
  async editUser(user: User) {
    const modal = await this.modalController.create({
      component: EditUserModalComponent,
      componentProps: { user },
      cssClass: 'edit-user-modal'
    });
    
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    
    if (data && role === 'save') {
      // ✅ Dispatch de l'action de mise à jour
      this.store.dispatch(UsersActions.updateUser({ 
        userId: user.id, 
        userData: data 
      }));
      
      await this.presentSuccessToast('Utilisateur modifié avec succès');
    }
  }

  // ✅ MÉTHODE AMÉLIORÉE: Basculer le statut avec feedback
  async toggleUserStatus(user: User) {
    const newStatus = !user.active;
    const action = newStatus ? 'activer' : 'désactiver';
    
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Êtes-vous sûr de vouloir ${action} ${user.name} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          handler: () => {
            this.store.dispatch(UsersActions.toggleUserStatus({ 
              userId: user.id, 
              active: newStatus 
            }));
            
            const actionPast = newStatus ? 'activé' : 'désactivé';
            this.presentSuccessToast(`Utilisateur ${actionPast} avec succès`);
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmDeleteUser(user: User) {
    const alert = await this.alertController.create({
      header: 'Confirmation de suppression',
      message: `
        <div style="text-align: center;">
          <p>Êtes-vous sûr de vouloir supprimer <strong>${user.name}</strong> ?</p>
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
            this.store.dispatch(UsersActions.deleteUser({ userId: user.id }));
            this.presentSuccessToast('Utilisateur supprimé avec succès');
          }
        }
      ]
    });

    await alert.present();
  }

  // ✅ NOUVELLE MÉTHODE: Gestion des erreurs d'image
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      // ✅ Utiliser des placeholders en ligne au lieu de fichiers locaux
      const isUser = target.alt?.includes('femme') || target.alt?.includes('female');
      target.src = isUser ? 
        'https://via.placeholder.com/150/FF69B4/FFFFFF?text=F' : 
        'https://via.placeholder.com/150/4169E1/FFFFFF?text=M';
    }
  }

  // ✅ NOUVELLE MÉTHODE: Actions rapides depuis la liste
  async quickActions(user: User, event: Event) {
    event.stopPropagation(); // Empêcher l'ouverture du modal de vue
    
    const actionSheet = await this.actionSheetController.create({
      header: `Actions rapides - ${user.name}`,
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

  // Méthodes utilitaires (conservées et améliorées)
  private async getFirstValue<T>(observable: Observable<T>): Promise<T> {
    return new Promise(resolve => {
      const subscription = observable.pipe(takeUntil(this.destroy$)).subscribe(value => {
        resolve(value);
        subscription.unsubscribe();
      });
    });
  }

  // ✅ MÉTHODES DE NOTIFICATION AMÉLIORÉES
  private async presentSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle',
      buttons: [
        {
          text: '✕',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  private async presentErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      position: 'top',
      color: 'danger',
      icon: 'alert-circle',
      buttons: [
        {
          text: '✕',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  // ✅ NOUVELLE MÉTHODE: Toast informatif
  private async presentInfoToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'primary',
      icon: 'information-circle',
      buttons: [
        {
          text: '✕',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  // ✅ NOUVELLE MÉTHODE: Actions en lot
  async bulkActions() {
    // Cette méthode peut être développée pour gérer les actions en lot
    const actionSheet = await this.actionSheetController.create({
      header: 'Actions en lot',
      buttons: [
        {
          text: 'Sélectionner plusieurs utilisateurs',
          icon: 'checkbox-outline',
          handler: () => this.presentInfoToast('Fonctionnalité à venir...')
        },
        {
          text: 'Exporter la sélection',
          icon: 'download-outline',
          handler: () => this.exportUsers()
        },
        {
          text: 'Voir les statistiques',
          icon: 'bar-chart-outline',
          handler: () => this.showUserStats()
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
}