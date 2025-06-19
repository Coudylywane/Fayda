import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CampaignData } from '../model/finances.type';
import { DetailFondsComponent } from '../components/detail-fonds/detail-fonds.component';
import * as ProjectActions from 'src/app/Admin/pages/projets/store/project.actions';
import { Store } from '@ngrx/store';
import { ProjectDTO } from 'src/app/Admin/pages/projets/models/projet.model';

@Injectable({
  providedIn: 'root'
})
export class DetailFondsService {

  constructor(private modalCtrl: ModalController, private store: Store,) { }

  async openCampaignModal(project: ProjectDTO) {
    const modal = await this.modalCtrl.create({
      component: DetailFondsComponent,
      componentProps: {
        project,
        balance: 75000 // Normalement ceci serait récupéré depuis un service d'utilisateur
      },
      // breakpoints: [0, 0.4, 0.6, 0.9],
      initialBreakpoint: 0.9,
      backdropDismiss: true,
      showBackdrop: true,
      cssClass: 'campaign-modal'
    });

    return await modal.present();
  }

  getFonds(){
    this.store.dispatch(ProjectActions.loadActiveProjects());
  }
}
