import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { TabsService } from '../tabs/services/tabs.service';
import { IconButtonComponent } from "../../shared/components/icon-button/icon-button.component";
import { ButtonComponent } from "../../shared/components/button/button.component";
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { AppState } from 'src/app/store/app.state';
import { Store } from '@ngrx/store';
import { selectAuthState, selectCurrentUser } from '../auth/store/auth.selectors';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { User, UserRole } from '../auth/models/user.model';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { ConfettiService } from 'src/app/Admin/services/confetti.service';
import { PrimaryRoleVisibilityDirective } from '../auth/directives/primary-role-visibility.directive';
import { RoleHideDirective } from '../auth/directives/role-hide.directive';
import { RoleVisibilityDirective } from '../auth/directives/role-visibility.directive';
import { ProfilModalService } from './services/profil-modal.service';
import { VisiteurOnlyDirective } from '../auth/directives/role-visitor-only.directive';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profil-modal',
  templateUrl: './profil-modal.component.html',
  styleUrls: ['./profil-modal.component.scss'],
  imports: [IonicModule,
    CommonModule,
    IconButtonComponent,
    ButtonComponent,
    RoleVisibilityDirective,
    RoleHideDirective,
    VisiteurOnlyDirective,
    ReactiveFormsModule],
})
export class ProfilModalComponent implements OnInit, OnDestroy {
  UserRole = UserRole;

  // Observable pour les données utilisateur
  user: User | null = null;
  logoutAttempted = false;
  logoutError: string = '';
  isLoading = false;
  error: string = '';
  showLogoutConfirm = false;
  showChangePasswordModal = false;
  changePasswordForm: FormGroup;
  isChangingPassword = false;
  changePasswordError = '';
  changePasswordSuccess = '';

  // Subject pour gérer la désinscription
  private destroy$ = new Subject<void>();

  constructor(
    private modalCtrl: ModalController,
    private navigationService: TabsService,
    private authService: AuthService,
    private router: Router,
    private store: Store<AppState>,
    private toastService: ToastService,
    private profilModalService: ProfilModalService,
    private fb: FormBuilder
  ) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit(): void {
    this.store.select(selectAuthState).pipe(
      takeUntil(this.destroy$),
    ).subscribe(authState => {
      this.isLoading = authState.loading;
    });


    // S'abonner aux données utilisateur
    this.store.select(selectAuthState).pipe(
      takeUntil(this.destroy$),
      filter(authState => !authState.loading)
    ).subscribe(authState => {
      this.logoutError = authState.error ?? '';
      this.user = authState.user;

      if (this.logoutAttempted && !authState.isAuthenticated) {
        this.modalCtrl.dismiss();
        // this.confettiService.triggerConfetti();
        this.toastService.showSuccess('Vous êtes déconnecté');
        this.router.navigate(['/login']);
      } else if (this.logoutAttempted && this.logoutError) {
        console.log('Déconnexion echec');
        this.toastService.showError(this.logoutError);
        this.logoutAttempted = false;
      } else {
        console.log('rien');
        this.logoutAttempted = false;
      }
      console.log('Données utilisateur:', authState.user);

    });
  }

  ngOnDestroy(): void {
    // Nettoyer les abonnements
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismiss() {
    this.modalCtrl.dismiss();
    this.navigationService.setActiveTab("home");
  }

  // Méthodes pour rendre la modale interactive si nécessaire
  openPaymentMethods() {
    console.log('Ouverture des méthodes de paiement');
    // Implémentation pour ouvrir les méthodes de paiement
  }

  openActivities() {
    console.log('Ouverture des activités');
    // Implémentation pour ouvrir les activités
  }

  openChangePasswordModal() {
    this.showChangePasswordModal = true;
    this.changePasswordForm.reset();
    this.changePasswordError = '';
    this.changePasswordSuccess = '';
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
  }

  passwordsMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  async changePassword() {
    if (this.changePasswordForm.invalid) return;
    this.isChangingPassword = true;
    this.changePasswordError = '';
    this.changePasswordSuccess = '';
    const { oldPassword, newPassword } = this.changePasswordForm.value;
    try {
      await this.authService.resetPassword({ newPassword });
      this.changePasswordSuccess = 'Mot de passe changé avec succès.';
      this.toastService.showSuccess(this.changePasswordSuccess);
      this.closeChangePasswordModal();
    } catch (err: any) {
      this.changePasswordError = err?.response?.data?.message || err?.message || 'Erreur lors du changement de mot de passe.';
      this.toastService.showError(this.changePasswordError);
    } finally {
      this.isChangingPassword = false;
    }
  }

  openLogoutConfirm() {
    this.showLogoutConfirm = true;
  }

  closeLogoutConfirm() {
    this.showLogoutConfirm = false;
  }

  async confirmLogout() {
    this.closeLogoutConfirm();
    await this.authService.logout();
    this.logoutAttempted = true;
    console.log('Déconnexion encours');
  }

  /**
   * Naviguer vers une url
   * @param url 
   */
  async navigateTo(url: string) {
    if (await this.router.navigate([url])) {
      this.modalCtrl.dismiss();
    }
  }

  async becomeMoukhadam() {
    this.isLoading = true;
    this.error = '';

    try {
      const response = await this.profilModalService.becomeMoukhadam();
      console.log("l", response);
      this.isLoading = false;
      this.dismiss();
      this.toastService.showSuccess(response.data.message);
    } catch (error: any) {
      console.error('Erreur lors d envoie:', error);
      this.error = error.response?.data?.message || 'Impossible d\'envoyer la demande';
      this.isLoading = false;
      this.dismiss();
      this.toastService.showError(this.error!);
    }
  }

  // Méthodes utilitaires pour le template
  getUserInitials(): string {
    if (!this.user) return '';

    const firstName = this.user.firstName || '';
    const lastName = this.user.lastName || '';

    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getUserFullName(): string {
    if (!this.user) return 'Utilisateur';

    const firstName = this.user.firstName || '';
    const lastName = this.user.lastName || '';

    return `${firstName} ${lastName}`.trim() || this.user.username || 'Utilisateur';
  }

  getUserEmail(): string {
    return this.user?.email || '';
  }
}