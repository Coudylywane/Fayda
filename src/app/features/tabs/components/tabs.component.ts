import { Component, OnInit } from '@angular/core';
import { TabsService } from '../services/tabs.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ProfilModalComponent } from '../../profil-modal/profil-modal.component';
import { AppState } from 'src/app/store/app.state';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { User, UserRole } from '../../auth/models/user.model';
import { selectCurrentUser } from '../../auth/store/auth.selectors';
import { CommonModule } from '@angular/common';
import { PrimaryRoleVisibilityDirective } from '../../auth/directives/primary-role-visibility.directive';
import { RoleHideDirective } from '../../auth/directives/role-hide.directive';
import { RoleVisibilityDirective } from '../../auth/directives/role-visibility.directive';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports: [IonicModule, RouterModule, CommonModule,
    RoleVisibilityDirective]
})
export class TabsComponent implements OnInit {
  UserRole = UserRole;

  // Observable pour les données utilisateur
  user$: Observable<User | null>;
  user: User | null = null;
  activeTab: string = 'home';
  // Subject pour gérer la désinscription
  private destroy$ = new Subject<void>();

  constructor(
    private navigationService: TabsService,
    private modalCtrl: ModalController,
    private store: Store<AppState>,
  ) {
    this.user$ = this.store.select(selectCurrentUser);
  }

  ngOnInit() {
    this.navigationService.activeTab$.subscribe(tab => {
      this.activeTab = tab;
    });
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

  navigate(tab: string) {
    this.navigationService.setActiveTab(tab);
  }

  isActive(tab: string): boolean {
    return this.activeTab === tab;
  }

  async openUserProfileModal() {
    const modal = await this.modalCtrl.create({
      component: ProfilModalComponent,
      cssClass: 'profil-modal'
    });
    return await modal.present();
  }
}