import { Component, OnInit } from '@angular/core';
import { TabsService } from '../services/tabs.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ProfilModalComponent } from '../../profil-modal/profil-modal.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports: [IonicModule, RouterModule]
})
export class TabsComponent  implements OnInit {

  activeTab: string = 'home';

  constructor(private navigationService: TabsService, private modalCtrl: ModalController) {}

  ngOnInit() {
    this.navigationService.activeTab$.subscribe(tab => {
      this.activeTab = tab;
    });
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