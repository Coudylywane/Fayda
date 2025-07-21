import { Component, OnInit } from '@angular/core';
import { CampaignData } from './model/finances.type';
import { DetailFondsService } from './services/detail-fonds.service';
import { ModalController } from '@ionic/angular';
import { ContributionStoryComponent } from './components/contribution-story/contribution-story.component';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { selectProjectState } from 'src/app/Admin/pages/projets/store/project.selectors';
import { ProjectDTO } from 'src/app/Admin/pages/projets/models/projet.model';

@Component({
  selector: 'app-finances',
  templateUrl: './finances.page.html',
  styleUrls: ['./finances.page.scss'],
  standalone: false,
})
export class FinancesPage implements OnInit {
  allProjects: ProjectDTO[] = [];
  showContributionAmount = false;
  showBalanceAmount = false;
  zakatProgress = 75; // Pourcentage pour le cercle de progression
  error: string | null = null;
  loading: boolean = false;
  showAddModal: boolean = false;
  addLoading: boolean = false;

  contributionAmount: number = 234000;
  contributionPercentage: number = 75;
  balance: number = 0; // Initialiser à 0, mis à jour dans ngOnInit
  zakatAmount: number = 180000;
  zakatTarget: number = 350000;
  zakatPercentage: number = Math.round(
    (this.zakatAmount / this.zakatTarget) * 100
  );

  private destroy$ = new Subject<void>();

  constructor(
    private detailFondsService: DetailFondsService,
    private modalController: ModalController,
    private store: Store
  ) {}

  toggleContributionVisibility() {
    this.showContributionAmount = !this.showContributionAmount;
  }

  toggleBalanceVisibility() {
    this.showBalanceAmount = !this.showBalanceAmount;
  }

  ngOnInit() {
    this.loadProjects();
    // Initialiser balance depuis localStorage
    const storedBalance = localStorage.getItem('user_balance');
    this.balance = storedBalance ? parseInt(storedBalance, 10) : 75000; // Valeur par défaut : 75000 FCFA

    // Initialisation ou récupération des données depuis un service
    this.openContributionStory();

    this.store
      .select(selectProjectState)
      .pipe(takeUntil(this.destroy$))
      .subscribe((projectState) => {
        this.error = projectState.error;
        this.loading = projectState.loading;

        if (projectState.projects && Array.isArray(projectState.projects)) {
          this.allProjects = [...projectState.projects];
          console.log('fonds loaded:', this.allProjects.length);
        }
      });
  }

  loadProjects() {
    this.detailFondsService.getFonds();
  }

  // Méthode pour formater les nombres avec espacement des milliers
  formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  // Autres méthodes pour votre application
  addFunds() {
    console.log('Ajouter des fonds');
    // Logique pour ajouter des fonds
  }

  refreshBalance() {
    console.log('Rafraîchir le solde');
    // Logique pour rafraîchir le solde
  }

  refreshContributions() {
    console.log('Rafraîchir les contributions');
    // Logique pour rafraîchir les contributions
  }

  openCampaignModal(data: ProjectDTO) {
    const campaignData: CampaignData = {
      id: '1',
      title: 'Rénovation Mosquée Medina Baye',
      organization: 'Association des Talibé Baye du Sénégal',
      description: `Le chef religieux, Cissé Niang, soulignant la dimension internationale 
            du Gamou de Medina Baye, a affirmé que l'esplanade de la grande 
            mosquée, nouvellement construite, va donner une image plus 
            reluisante à cette cité religieuse fondée par Cheikh Al Islam El Hadji 
            Ibrahima Niass dit Baye`,
      currentAmount: 180000,
      targetAmount: 350000,
      percentageCollected: 48,
      contributors: 245,
      daysRemaining: 250,
      imageUrl: 'assets/images/1.png',
    };

    this.detailFondsService.openCampaignModal(data);
  }

  async openContributionStory() {
    const modal = await this.modalController.create({
      component: ContributionStoryComponent,
      initialBreakpoint: 0.2,
      breakpoints: [0, 0.4, 0.6, 0.9],
      cssClass: 'comment-modal',
    });

    return await modal.present();
  }
}
