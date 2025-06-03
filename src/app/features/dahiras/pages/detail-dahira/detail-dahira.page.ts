// dahira-detail.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { Location } from '@angular/common';
import { DahiraApiService } from '../../services/dahira-api.service';
import { selectCurrentUser } from 'src/app/features/auth/store/auth.selectors';
import { Dahira } from '../../models/dahira.model';
import { RequestApiService } from 'src/app/features/demandes/services/request.api';
import { Request, RequestType, Status } from 'src/app/features/demandes/models/request.model';

@Component({
  selector: 'app-detail-dahira',
  templateUrl: './detail-dahira.page.html',
  styleUrls: ['./detail-dahira.page.scss'],
  standalone: false
})
export class DetailDahiraPage implements OnInit, OnDestroy {
  dahira: Dahira | null = null;
  requests: Request[] | [] = [];
  dahiraId: string = '';
  loading: boolean = false;
  error: string | null = null;
  membershipRequested: boolean = false;
  requestingMembership: boolean = false;
  userId!: string;
  requestType = RequestType;
  status = Status;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private toastService: ToastService,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.store.select(selectCurrentUser).pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.userId = user!.userId
    })

    // Récupérer l'ID du dahira depuis les paramètres de route
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.dahiraId = params['id'];
      if (this.dahiraId) {
        this.loadDahiraDetails();
        this.DetailRequest();
        // this.checkMembershipStatus();
      }
    });
  }

  /**
   * Charge les détails du dahira
   */
  private async loadDahiraDetails(): Promise<void> {
    this.loading = true;
    this.error = null;
    console.log("load details dahira");


    try {
      const response = await DahiraApiService.getDahira(this.dahiraId);
      console.log("ldetails dahira", response);
      this.dahira = response.data.data;
      this.loading = false;
    } catch (error: any) {
      console.error('Erreur lors du chargement du dahira:', error);
      this.error = error.response?.data?.message || 'Impossible de charger les détails du dahira';
      this.loading = false;
      this.toastService.showError(this.error!);
    }
  }

  /**
 * Charge les demandes par type Adhésion dahira
 */
  private async DetailRequest(): Promise<void> {
    this.loading = true;
    this.error = null;
    console.log("load details dahira");


    try {
      const response = await RequestApiService.getRequest(this.userId);
      console.log("ldetails demande join_dahira", response);
      this.requests = [...response.data.data];
    } catch (error: any) {
      console.error('Erreur lors du chargement des demandes:', error);
      this.error = error.response?.data?.message || 'Impossible de charger les détails du dahira';
      this.toastService.showError(this.error!);
    }
  }

  requestCheck(type: Status): boolean {
    return this.requests.some(request =>
      request.targetDahiraName === this.dahira?.dahiraName && request.approvalStatus === type
    );
  }


  /**
   * Vérifie si l'utilisateur a déjà fait une demande d'adhésion
   */
  private async checkMembershipStatus(): Promise<void> {
    const requestedDahiras = JSON.parse(localStorage.getItem('requestedMemberships') || '[]');
    // this.membershipRequested = requestedDahiras.includes(this.dahiraId);
    this.membershipRequested = this.requestCheck(this.status.PENDING);
    console.log("checkMembershipStatus dahira detail", this.membershipRequested);
    // if (!this.membershipRequested) {
    //   try {
    //     const response = await DahiraApiService.checkMembershipStatus(this.userId, this.dahiraId);
    //     console.log("ldetails check", response);
    //     this.dahira = response.data.data;
    //     this.loading = false;
    //   } catch (error: any) {
    //     console.error('Erreur lors du chargement du check:', error);
    //     this.error = error.response?.data?.message || 'Impossible de charger les détails du check';
    //     this.loading = false;
    //     this.toastService.showError(this.error!);
    //   }
    // }
  }

  /**
   * Envoie une demande d'adhésion
   */
  async requestMembership(): Promise<void> {
    if (!this.dahira || this.requestingMembership) {
      console.log("return");

      return;
    }

    this.requestingMembership = true;

    try {

      const response = await DahiraApiService.requestMembership(this.dahiraId);
      console.log("request ", response);


      if (response.success) {
        this.membershipRequested = true;
        this.saveMembershipRequest();
        this.toastService.showSuccess('Demande d\'adhésion envoyée avec succès !');
      } else {
        this.toastService.showError('Erreur lors de l\'envoi de la demande');
      }
    } catch (error: any) {
      console.error('Erreur demande adhésion:', error);
      const errorMessage = error.message || 'Erreur lors de l\'envoi de la demande';
      this.toastService.showError(errorMessage);
    } finally {
      this.requestingMembership = false;
    }
  }

  /**
   * Sauvegarde la demande d'adhésion en local
   */
  private saveMembershipRequest(): void {
    const requestedDahiras = JSON.parse(localStorage.getItem('requestedMemberships') || '[]');
    if (!requestedDahiras.includes(this.dahiraId)) {
      requestedDahiras.push(this.dahiraId);
      localStorage.setItem('requestedMemberships', JSON.stringify(requestedDahiras));
    }
  }

  /**
   * Rafraîchit les données
   */
  refresh(): void {
    this.loadDahiraDetails();
  }

  /**
   * Retour à la page précédente
   */
  goBack(): void {
    this.router.navigate(["tabs/dahiras"]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}