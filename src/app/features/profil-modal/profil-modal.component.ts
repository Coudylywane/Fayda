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
import { User } from '../auth/models/user.model';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { ConfettiService } from 'src/app/Admin/services/confetti.service';

@Component({
  selector: 'app-profil-modal',
  templateUrl: './profil-modal.component.html',
  styleUrls: ['./profil-modal.component.scss'],
  imports: [IonicModule, CommonModule, IconButtonComponent, ButtonComponent],
})
export class ProfilModalComponent implements OnInit, OnDestroy {

  // Observable pour les données utilisateur
  user: User | null = null;
  logoutAttempted = false;
  logoutError: string = '';
  isLoading = false;


  // Subject pour gérer la désinscription
  private destroy$ = new Subject<void>();

  constructor(
    private modalCtrl: ModalController,
    private navigationService: TabsService,
    private authService: AuthService,
    private router: Router,
    private store: Store<AppState>,
    private confettiService: ConfettiService,
    private toast: ToastService
  ) {
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
        this.dismiss();
        // this.confettiService.triggerConfetti();
        this.toast.showSuccess('Vous êtes déconnecté');
        this.router.navigate(['/login']);
      }else if (this.logoutAttempted && this.logoutError) {
        this.toast.showError(this.logoutError);
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

  changePassword() {
    console.log('Changement de mot de passe');
    // Implémentation pour changer le mot de passe
  }

  async logout() {
    await this.authService.logout();

    this.logoutAttempted = true;
    console.log('Déconnexion réussie');
    // this.dismiss();
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