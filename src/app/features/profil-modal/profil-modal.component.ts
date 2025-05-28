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
import { Observable, Subject, takeUntil } from 'rxjs';
import { User } from '../auth/models/user.model';

@Component({
  selector: 'app-profil-modal',
  templateUrl: './profil-modal.component.html',
  styleUrls: ['./profil-modal.component.scss'],
  imports: [IonicModule, CommonModule, IconButtonComponent, ButtonComponent],
})
export class ProfilModalComponent implements OnInit, OnDestroy {
  
  // Observable pour les données utilisateur
  user$: Observable<User | null>;
  user: User | null = null;
  
  // Subject pour gérer la désinscription
  private destroy$ = new Subject<void>();

  constructor(
    private modalCtrl: ModalController,
    private navigationService: TabsService,
    private authService: AuthService,
    private router: Router,
    private store: Store<AppState>,
  ) { 
    // Récupérer l'observable des données utilisateur
    this.user$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    // S'abonner aux données utilisateur
    this.user$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.user = user;
      console.log('Données utilisateur:', user);
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
    
    // Utiliser takeUntil pour éviter les fuites mémoire
    if (!this.user) {
      console.log('Déconnexion réussie');
      this.router.navigate(['/login']);
    }

    this.dismiss();
  }

  // Méthodes utilitaires pour le template
  getUserInitials(): string {
    if (!this.user) return '';
    
    const firstName = this.user.firstName ||  '';
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