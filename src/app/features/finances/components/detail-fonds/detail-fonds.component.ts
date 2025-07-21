import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonContent, IonButton, IonIcon } from "@ionic/angular/standalone";
import { CampaignData } from '../../model/finances.type';
import { ButtonComponent } from "../../../../shared/components/button/button.component";
import { ProjectDTO } from 'src/app/Admin/pages/projets/models/projet.model';
import { DonateComponent } from "../donate/donate.component";
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { ProjectApiService } from 'src/app/Admin/pages/projets/services/project.api';
import { DetailFondsService } from '../../services/detail-fonds.service';

@Component({
  selector: 'app-detail-fonds',
  templateUrl: './detail-fonds.component.html',
  styleUrls: ['./detail-fonds.component.scss'],
  imports: [
    IonIcon,
    IonContent,
    CommonModule,
    ButtonComponent,
    DonateComponent,
  ],
})
export class DetailFondsComponent implements OnInit {
  @Input() p!: ProjectDTO;
  @Input() balance: number = 0;
  showDonateModal: boolean = false;
  addLoading: boolean = false;
  loading: boolean = false;
  error: string = '';
  project!: ProjectDTO;

  activeTab: string = 'Résumé';
  isFavorite: boolean = false;
  tabs: string[] = ['Résumé', 'Détails', 'Comité'];

  constructor(
    private modalCtrl: ModalController,
    private toastService: ToastService,
    private detailFondsService: DetailFondsService
  ) {}

  ngOnInit() {
    this.getCollectById();
    const storedBalance = localStorage.getItem('user_balance');
    this.balance = storedBalance ? parseInt(storedBalance, 10) : 100000;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  refresh() {
    this.getCollectById();
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }

  contribute() {
    // Logique de contribution
    console.log('Contribute button clicked');
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }

  closeDonateModal() {
    this.showDonateModal = false;
  }

  openDonateModal() {
    this.showDonateModal = true;
  }

  loadProjects() {
    this.detailFondsService.getFonds();
  }

  getCollectById() {
    this.loading = true;
    console.log('Tentative de don:');
    ProjectApiService.getProjectById(this.project.collectionId)
      .then((response) => {
        this.loading = false;
        console.log('Succès get collecte de fonds by id:', response);
        if (response.success) {
          this.loadProjects();
          this.project = response.data.data;
          this.showDonateModal = false;
          // this.toastService.showSuccess(response.data.message || "Collecte récupérer avec succès");
        }
        this.closeDonateModal();
      })
      .catch((error) => {
        this.loading = false;
        error = error.message;
        console.error('Erreur de chargement de collecte de fonds:', error);
        this.toastService.showError(error.message);
      });
  }

  onDonate(don: { amount: number }) {
    if (don.amount > this.balance) {
      this.toastService.showError(
        'Votre solde est insuffisant pour effectuer cette contribution.'
      );
      this.addLoading = false;
      return;
    }
    this.addLoading = true;
    console.log('Tentative de don:', don);
    ProjectApiService.donate(this.project.collectionId, don.amount)
      .then((response) => {
        // Mettre à jour le solde localement
        this.balance -= don.amount;
        localStorage.setItem('user_balance', this.balance.toString());

        // Incrémenter totalContributors localement
        // this.totalContributors += 1;
        // localStorage.setItem(
        //   `contributors_${this.project!.collectionId}`,
        //   this.totalContributors.toString()
        // );
        this.addLoading = false;
        console.log('Succès création collecte de fonds:', response);
        if (response.success) {
          this.getCollectById();
          this.showDonateModal = false;
          this.toastService.showSuccess(
            response.data.message || 'Vous avez contribué avec succès'
          );
        }
        this.closeDonateModal();
      })
      .catch((error) => {
        this.addLoading = false;
        console.error('Erreur création collecte de fonds:', error);
        this.toastService.showError(error.message);
      });
  }
}
