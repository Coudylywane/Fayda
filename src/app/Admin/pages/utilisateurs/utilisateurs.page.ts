import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
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
  usersCount$: Observable<number>;
  filteredUsersCount$: Observable<number>;
  
  // ✅ FILTRES PAR STATUT
  filters = ['Tous', 'Actifs', 'Inactifs'];
  
  // ✅ SIMPLE: Filtre actuel sélectionné
  activeFilter: string = 'Tous';
  currentSearchTerm: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private modalController: ModalController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    // Initialisation des observables de base
    this.users$ = this.store.select(UsersSelectors.selectAllUsers);
    this.loading$ = this.store.select(UsersSelectors.selectUsersLoading);
    this.error$ = this.store.select(UsersSelectors.selectUsersError);
    this.searchTerm$ = this.store.select(UsersSelectors.selectSearchTerm);
    this.usersCount$ = this.store.select(UsersSelectors.selectUsersCount);

    // ✅ FILTRAGE PAR STATUT ACTIF/INACTIF
    this.filteredUsers$ = combineLatest([
      this.users$,
      this.searchTerm$
    ]).pipe(
      map(([users, searchTerm]) => {
        let filtered = [...users];
        this.currentSearchTerm = searchTerm || '';

        // 1️⃣ FILTRAGE PAR RECHERCHE
        if (searchTerm && searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          filtered = filtered.filter(user => 
            (user.name?.toLowerCase().includes(term)) ||
            (user.firstName?.toLowerCase().includes(term)) ||
            (user.lastName?.toLowerCase().includes(term)) ||
            (user.email?.toLowerCase().includes(term))
          );
        }

        // 2️⃣ FILTRAGE PAR STATUT ACTIF/INACTIF
        if (this.activeFilter !== 'Tous') {
          filtered = filtered.filter(user => {
            if (this.activeFilter === 'Actifs') {
              return user.active === true;
            } else if (this.activeFilter === 'Inactifs') {
              return user.active === false;
            }
            return false;
          });
        }

        return filtered;
      })
    );

    this.filteredUsersCount$ = this.filteredUsers$.pipe(
      map(users => users.length)
    );
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

  // ✅ NOUVEAU: Obtenir le statut d'un utilisateur
  getStatusLabel(user: User): string {
    return user.active ? 'Actif' : 'Inactif';
  }

  // ✅ NOUVEAU: Obtenir la couleur du statut
  getStatusColor(user: User): string {
    return user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  }

  // ✅ MÉTHODE SIMPLE: Changer de filtre
  setFilter(filterName: string) {
    this.activeFilter = filterName;
    this.store.dispatch(UsersActions.setCategory({ category: filterName }));
  }

  // ✅ MÉTHODE SIMPLE: Vérifier si un filtre est actif
  isFilterActive(filterName: string): boolean {
    return this.activeFilter === filterName;
  }

  // ✅ MÉTHODE SIMPLE: Réinitialiser
  resetFilters() {
    this.activeFilter = 'Tous';
    this.store.dispatch(UsersActions.resetFilters());
  }

  loadUsers() {
    this.store.dispatch(UsersActions.loadUsers({}));
  }

  refreshUsers() {
    this.store.dispatch(UsersActions.loadUsers({}));
  }

  onSearchTermChange(searchTerm: string) {
    this.store.dispatch(UsersActions.setSearchTerm({ searchTerm }));
  }

  onImageError(event: Event, user?: any) {
    const target = event.target as HTMLImageElement;
    if (target) {
      // ✅ CORRECTION: Utilise l'avatar SVG généré au lieu d'une URL externe
      target.src = this.generateAvatarSVG(user || { firstName: 'U', lastName: '' });
      target.onerror = null;
    }
  }

  // ✅ MÉTHODE CORRIGÉE: Générer un avatar SVG avec initiales
  generateAvatarSVG(user: any, size: number = 56): string {
    const initials = this.getInitials(user);
    const backgroundColor = this.getColorForUser(user);
    
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${backgroundColor}"/>
        <text x="50%" y="50%" dy="0.35em" text-anchor="middle" 
              fill="white" font-family="Arial, sans-serif" 
              font-size="${size * 0.35}" font-weight="600">
          ${initials}
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

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
    if (user?.name) {
      const parts = user.name.split(' ').filter((p: string) => p.length > 0);
      if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
      }
      return parts[0]?.charAt(0).toUpperCase() || 'U';
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  }

  getColorForUser(user: any): string {
    const colors = [
      '#4169E1', '#32CD32', '#FF6347', '#9370DB', 
      '#20B2AA', '#FF4500', '#DA70D6', '#1E90FF',
      '#FFD700', '#FF69B4', '#00CED1', '#FFA500'
    ];
    
    const identifier = user?.firstName || user?.lastName || user?.email || user?.name || 'default';
    const hash = this.simpleHash(identifier);
    return colors[hash % colors.length];
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  getAvatarUrl(user: any): string {
    // Si l'utilisateur a une image et qu'elle n'est pas l'image par défaut
    if (user?.image && 
        user.image !== 'assets/images/default-avatar.png' && 
        user.image !== 'assets/images/1.png') {
      return user.image;
    }
    
    // ✅ CORRECTION: Génère toujours un avatar SVG au lieu d'utiliser une image par défaut
    return this.generateAvatarSVG(user);
  }

  async openAddUserModal() {
    const modal = await this.modalController.create({
      component: AddUserModalComponent,
      cssClass: 'add-user-modal'
    });
    
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data && data.success) {
      this.store.dispatch(UsersActions.loadUsers({}));
      await this.presentSuccessToast('Utilisateur créé avec succès');
    } else if (data && data.error) {
      await this.presentErrorToast(data.error);
    }
  }

  async openFilterModal() {
    const currentSearchTerm = await this.getFirstValue(this.searchTerm$);
    
    const modal = await this.modalController.create({
      component: FilterUsersModalComponent,
      cssClass: 'filter-users-modal',
      componentProps: {
        currentFilter: this.activeFilter,
        currentSearchTerm: currentSearchTerm
      }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data) {
      if (data.category) {
        this.setFilter(data.category);
      }
      if (data.searchTerm !== undefined) {
        this.store.dispatch(UsersActions.setSearchTerm({ searchTerm: data.searchTerm }));
      }
    }
  }

  async openUserOptions(user: User) {
    const actionSheet = await this.actionSheetController.create({
      header: `Options pour ${user.firstName} ${user.lastName}`,
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

  callUser(user: User) {
    if (user.phoneNumber) {
      const cleanPhone = user.phoneNumber.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('221') ? cleanPhone : '221' + cleanPhone;
      window.open(`tel:+${formattedPhone}`);
    } else {
      this.presentErrorToast('Aucun numéro de téléphone disponible');
    }
  }

  emailUser(user: User) {
    if (user.email) {
      window.open(`mailto:${user.email}`);
    } else {
      this.presentErrorToast('Aucune adresse email disponible');
    }
  }

  async viewUser(user: User) {
    this.store.dispatch(UsersActions.selectUser({ user }));
    
    const modal = await this.modalController.create({
      component: ViewUserModalComponent,
      componentProps: { user },
      cssClass: 'view-user-modal'
    });
    
    await modal.present();
    
    const { data, role } = await modal.onWillDismiss();
    
    if (data && data.success) {
      switch (role) {
        case 'edit':
          await this.presentSuccessToast('Utilisateur modifié avec succès');
          this.refreshUsers();
          break;
        case 'delete':
          await this.presentSuccessToast('Utilisateur supprimé avec succès');
          this.refreshUsers();
          break;
        case 'status':
          const action = data.user?.active ? 'activé' : 'désactivé';
          await this.presentSuccessToast(`Utilisateur ${action} avec succès`);
          this.refreshUsers();
          break;
      }
    } else if (data && data.error) {
      await this.presentErrorToast(data.error);
    }
  }

  async editUser(user: User) {
    const modal = await this.modalController.create({
      component: EditUserModalComponent,
      componentProps: { user },
      cssClass: 'edit-user-modal'
    });
    
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    
    if (data && role === 'save') {
      this.store.dispatch(UsersActions.updateUser({ 
        userId: user.id, 
        userData: data.userData 
      }));
      
      await this.presentSuccessToast('Utilisateur modifié avec succès');
    } else if (data && role === 'delete') {
      this.store.dispatch(UsersActions.deleteUser({ userId: user.id }));
      await this.presentSuccessToast('Utilisateur supprimé avec succès');
    }
  }

  async toggleUserStatus(user: User) {
    const newStatus = !user.active;
    const action = newStatus ? 'activer' : 'désactiver';
    
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Êtes-vous sûr de vouloir ${action} ${user.firstName} ${user.lastName} ?`,
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
    const userName = user.firstName + ' ' + user.lastName;
    
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
            this.store.dispatch(UsersActions.deleteUser({ userId: user.id }));
            this.presentSuccessToast('Utilisateur supprimé avec succès');
          }
        }
      ]
    });

    await alert.present();
  }

  async quickActions(user: User, event: Event) {
    event.stopPropagation();
    
    const actionSheet = await this.actionSheetController.create({
      header: `Actions rapides - ${user.firstName} ${user.lastName}`,
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

  // Méthodes utilitaires
  private async getFirstValue<T>(observable: Observable<T>): Promise<T> {
    return new Promise(resolve => {
      const subscription = observable.pipe(takeUntil(this.destroy$)).subscribe(value => {
        resolve(value);
        subscription.unsubscribe();
      });
    });
  }

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

  trackByUserId(index: number, user: User): string {
    return user.id;
  }

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
}