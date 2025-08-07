import { Component, OnInit } from '@angular/core';
import { CampaignData } from './model/finances.type';
import { DetailFondsService } from './services/detail-fonds.service';
import { ModalController } from '@ionic/angular';
import { ContributionStoryComponent } from './components/contribution-story/contribution-story.component';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectProjectState } from 'src/app/Admin/pages/projets/store/project.selectors';
import { ProjectDTO } from 'src/app/Admin/pages/projets/models/projet.model';
import { ZakatContributionModalComponent } from './components/zakat-contribution-modal/zakat-contribution-modal.component';
import { selectUserBalance } from '../auth/store/auth.selectors';
import { AddBalanceModalComponent } from './components/add-balance-modal/add-balance-modal.component';
import { AuthService } from '../auth/services/auth.service';
import * as AuthActions from '../auth/store/auth.actions';

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
  error: string | null = null;
  loading: boolean = false;
  showAddModal: boolean = false;
  addLoading: boolean = false;

  contributionAmount: number = 234000;
  contributionPercentage: number = 0;
  balance: number = 0; // Initialiser à 0, mis à jour dans ngOnInit
  contribut: number = 0;
  showGoalModal = false;
  contributionGoal: number = 0;
  zakatAmount: number = 0;
  zakatTarget: number = 350000;
  zakatPercentage: number = Math.round(
    (this.zakatAmount / this.zakatTarget) * 100
  );

  private destroy$ = new Subject<void>();

  constructor(
    private detailFondsService: DetailFondsService,
    private modalController: ModalController,
    private store: Store,
    private authService: AuthService
  ) {}

  toggleContributionVisibility() {
    this.showContributionAmount = !this.showContributionAmount;
  }

  toggleBalanceVisibility() {
    this.showBalanceAmount = !this.showBalanceAmount;
  }

  ngOnInit() {
    this.loadProjects();
    this.openContributionStory();
    // Initialiser balance depuis localStorage
    // const storedBalance = localStorage.getItem('user_balance');
    // this.balance = storedBalance ? parseInt(storedBalance, 10) : 75000;
    this.store
      .select(selectUserBalance)
      .pipe(takeUntil(this.destroy$))
      .subscribe((balance) => {
        this.balance = balance ?? 0; // Assign 0 if balance is undefined
      });
    localStorage.setItem('user_balance', this.balance.toString());
    const storedContribut = localStorage.getItem('user_contribut');
    this.contribut = storedContribut ? parseInt(storedContribut, 10) : 0;
    const savedGoal = localStorage.getItem('contributionGoal');
    const storedZakat = localStorage.getItem('zakatAmount');
    this.zakatAmount = storedZakat ? parseInt(storedZakat, 10) : 0;
    this.zakatPercentage = Math.round(
      (this.zakatAmount / this.zakatTarget) * 100
    );
    if (savedGoal) {
      this.contributionGoal = parseInt(savedGoal, 10);
    } else {
      this.contributionGoal = 100000; // Valeur par défaut si rien de sauvegardé
    }

    this.calculatePercentage();
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
    console.log(
      'Chargement des projets de fonds',
      this.detailFondsService.getFonds()
    );
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

  calculatePercentage() {
    if (this.contributionGoal > 0) {
      this.contributionPercentage = Math.min(
        Math.round((this.contribut / this.contributionGoal) * 100),
        100
      );
    } else {
      this.contributionPercentage = 0;
    }
  }

  onSaveGoal(goal: number) {
    this.contributionGoal = goal;
    localStorage.setItem('contributionGoal', goal.toString()); // <-- Sauvegarde
    this.calculatePercentage();
  }

  async openZakatModal() {
    const modal = await this.modalController.create({
      component: ZakatContributionModalComponent,
      cssClass: 'rounded-modal',
    });

    await modal.present();

    const { data: amount } = await modal.onWillDismiss();

    if (amount) {
      this.zakatAmount += parseInt(amount, 10);
      localStorage.setItem('zakatAmount', this.zakatAmount.toString());
      this.zakatPercentage = Math.min(
        Math.round((this.zakatAmount / this.zakatTarget) * 100),
        100
      );
    }
  }

  async openAddBalanceModal() {
    const modal = await this.modalController.create({
      component: AddBalanceModalComponent,
      componentProps: { currentBalance: this.balance },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.newBalance != null) {
      const currentUser = this.authService.getCurrentUser(); 
      if (!currentUser) return;

      const updatedUser = {
        balance: data.newBalance,
      };

      // Déclenche l'action NgRx pour mettre à jour le solde
      this.store.dispatch(
        AuthActions.updateUser({
          userId: currentUser.userId,
          updatedUser: updatedUser,
        })
      );
    }
  }
}
