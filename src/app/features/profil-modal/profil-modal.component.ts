import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { TabsService } from '../tabs/services/tabs.service';
import { IconButtonComponent } from "../../shared/components/icon-button/icon-button.component";
import { ButtonComponent } from "../../shared/components/button/button.component";
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { AppState } from 'src/app/store/app.state';
import { Store } from '@ngrx/store';
import { selectAuthState } from '../auth/store/auth.selectors';

@Component({
  selector: 'app-profil-modal',
  templateUrl: './profil-modal.component.html',
  styleUrls: ['./profil-modal.component.scss'],
  imports: [IonicModule, CommonModule, IconButtonComponent, ButtonComponent],
})
export class ProfilModalComponent implements OnInit {

  constructor(private modalCtrl: ModalController,
    private navigationService: TabsService,
    private authService: AuthService,
    private router: Router,
    private store: Store<AppState>,
  ) { }

  ngOnInit(): void {
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
    
    await this.store.select(selectAuthState).subscribe(authState => {
      if (!authState.user) {
        console.log('Déconnexion réussie');
        this.router.navigate(['/login']);
      }
      console.log('Auth state après déconnexion:', authState);
      
    });

    this.dismiss();
  }
}
