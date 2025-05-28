import { Component, OnInit } from '@angular/core';
import { TabsService } from '../services/tabs.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ProfilModalComponent } from '../../profil-modal/profil-modal.component';
import { AppState } from 'src/app/store/app.state';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { User } from '../../auth/models/user.model';
import { selectCurrentUser } from '../../auth/store/auth.selectors';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports: [IonicModule, RouterModule, CommonModule]
})
export class TabsComponent implements OnInit {

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

  hideVisisteurTab(): boolean {
    // Vérifier les roles de l'utilisateur est connecté si c'est un visiteur
    if (!this.user?.roles) {
      return true;
    }    

    return !this.user.roles.some((element: string) => element === 'FAYDA_ROLE_USER');
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