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

  async openAddUserModal() {
    const modal = await this.modalController.create({
      component: AddUserModalComponent,
      cssClass: 'add-user-modal'
    });
    
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data) {
      this.store.dispatch(UsersActions.createUser({ userData: data }));
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

  async viewUser(user: User) {
    this.store.dispatch(UsersActions.selectUser({ user }));
    
    const modal = await this.modalController.create({
      component: ViewUserModalComponent,
      componentProps: { user }
    });
    await modal.present();
  }

  async editUser(user: User) {
    const modal = await this.modalController.create({
      component: EditUserModalComponent,
      componentProps: { user }
    });
    
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data) {
      this.store.dispatch(UsersActions.updateUser({ 
        userId: user.id, 
        userData: data 
      }));
    }
  }

  toggleUserStatus(user: User) {
    this.store.dispatch(UsersActions.toggleUserStatus({ 
      userId: user.id, 
      active: !user.active 
    }));
  }

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
          handler: () => {
            this.store.dispatch(UsersActions.deleteUser({ userId: user.id }));
          }
        }
      ]
    });

    await alert.present();
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/default-avatar.png';
    }
  }

  // Méthodes utilitaires
  private async getFirstValue<T>(observable: Observable<T>): Promise<T> {
    return new Promise(resolve => {
      observable.pipe(takeUntil(this.destroy$)).subscribe(value => {
        resolve(value);
      });
    });
  }

  // Méthodes de notification
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