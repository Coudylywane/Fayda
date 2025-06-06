import { Component, HostListener, Input, OnInit } from '@angular/core';
import { BaseLayoutAdminService } from './base-layout-admin.service';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { AppState } from '@capacitor/app';
import { Store } from '@ngrx/store';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { takeUntil, filter, Subject } from 'rxjs';
import { selectAuthState } from 'src/app/features/auth/store/auth.selectors';
import { User, UserRole } from 'src/app/features/auth/models/user.model';
import { Router } from '@angular/router';
import { RequestService } from 'src/app/features/demandes/services/request.service';
import { selectAdminRequestPending } from '../pages/demandes/store/demande.selectors';

@Component({
  selector: 'app-base-layout-admin',
  templateUrl: './base-layout-admin.page.html',
  styleUrls: ['./base-layout-admin.page.scss'],
  standalone: false
})
export class BaseLayoutAdminPage implements OnInit {
  @Input() title: string = 'Dashboard';
  @Input() subtitle: string = 'Tableau de bord';
  showTooltip = false;

  activeTab: string = 'dashboard';
  isSidebarOpen = true;
  UserRole = UserRole;
  requestCount: number = 0;

  // Observable pour les données utilisateur
  user: User | null = null;
  logoutAttempted = false;
  logoutError: string = '';
  isLoading = false;


  // Subject pour gérer la désinscription
  private destroy$ = new Subject<void>();

  toggleTooltip() {
    this.showTooltip = !this.showTooltip;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.tooltip-container') && this.showTooltip) {
      this.showTooltip = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  constructor(
    private navigationService: BaseLayoutAdminService,
    private authService: AuthService,
    private router: Router,
    private store: Store<AppState>,
    private toast: ToastService,
    private requestService: RequestService
  ) { }

  ngOnInit() {
    this.navigationService.activeTab$.subscribe(tab => {
      this.activeTab = tab;
    });
    console.log('tabs', this.activeTab);

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
        // this.confettiService.triggerConfetti();
        this.toast.showSuccess('Vous êtes déconnecté');
        this.router.navigate(['admin-login']);
      } else if (this.logoutAttempted && this.logoutError) {
        console.log('Déconnexion echec');
        this.toast.showError(this.logoutError);
        this.logoutAttempted = false;
      } else {
        console.log('rien');
        this.logoutAttempted = false;
      }
      console.log('Données utilisateur:', authState.user);
      
    });
    
    // this.loadAllRequests();

    this.store.select(selectAdminRequestPending).pipe(
        takeUntil(this.destroy$)
      ).subscribe(user => {
      console.log("requestcount", user.length);
      
      this.requestCount = user.length;
    });
  }

  navigate(tab: string) {
    this.navigationService.setActiveNav(tab);
  }

  isActive(tab: string): boolean {
    return this.activeTab === tab;
  }

  async logout() {
    await this.authService.logout();

    this.logoutAttempted = true;
    console.log('Déconnexion encours');
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

      /**
   * Charge toutes les demandes du serveur
   */
  private loadAllRequests(): void {
    this.requestService.getAllRequest();
  }
}
