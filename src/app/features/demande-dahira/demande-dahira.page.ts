import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { selectCurrentUser } from '../auth/store/auth.selectors';
import { RequestService } from '../demandes/services/request.service';
import { selectRequestState } from '../demandes/store/request.selectors';
import { ApprovalDto, RequestDto, RequestTypeEnum, StatusEnum } from '../demandes/models/request.model';
import { RequestApiService } from '../demandes/services/request.api';
import { ToastService } from 'src/app/shared/components/toast/toast.service';

@Component({
  selector: 'app-demande-dahira',
  templateUrl: './demande-dahira.page.html',
  styleUrls: ['./demande-dahira.page.scss'],
  standalone: false
})
export class DemandeDahiraPage implements OnInit {

  filteredRequests: RequestDto[] = [];
  allRequests: RequestDto[] = [];

  // Filtres et recherche
  activeTab: string = 'ALL';
  searchTerm: string = '';
  selectedRequestType: string = '';
  error: string | null = null;
  options: any;
  loading: boolean = false;
  userId!: string;

  private destroy$ = new Subject<void>();

  // Modale de confirmation de suppression
  showDeleteModal: boolean = false;
  requestToDelete: RequestDto | null = null;

  // Modale d'approbation
  showApprovalModal: boolean = false;
  requestToApprove: RequestDto | null = null;

  // Modale de rejet
  showRejectionModal: boolean = false;
  requestToReject: RequestDto | null = null;
  rejectionReason: string = '';

  constructor(
    private router: Router,
    private store: Store,
    private requestService: RequestService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    // Charger toutes les données une seule fois

    this.store.select(selectCurrentUser).subscribe(user => {

      this.userId = user?.userId!;
      console.log("store: demande this.userId:", this.userId);
    });

    this.loadAllRequests()

    this.store.select(selectRequestState).pipe(
      takeUntil(this.destroy$)
    ).subscribe(requestState => {
      this.error = requestState.error
      this.loading = requestState.loading


      if (requestState.demandes && Array.isArray(requestState.demandes)) {
        this.allRequests = [...requestState.demandes];
        this.applyFilters();
        console.log('Demandes loaded:', this.allRequests.length); // DEBUG
      }
    })
  }

  // Gestion des onglets
  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.applyFilters();
  }

  /**
   * Charge toutes les demandes du serveur
   */
  private loadAllRequests(): void {
    console.log('loadAllRequests');
    this.requestService.getRequestByTargetUser(this.userId);
  }

  // Application des filtres
  applyFilters() {
    this.filteredRequests = this.allRequests.filter(request => {
      // Filtre par statut (onglet)
      const matchesTab = this.activeTab === 'ALL' ||
        request.approvalStatus === this.activeTab;

      // Filtre par recherche (nom demandeur)
      const matchesSearch = this.searchTerm === '' ||
        request.requesterName.toLowerCase().includes(this.searchTerm.toLowerCase())

      return matchesTab && matchesSearch;
    });
  }

  // Recherche
  onSearchChange() {
    this.applyFilters();
  }

  // Changement de type de demande
  onRequestTypeChange(value: any) {
    this.selectedRequestType = value;
    this.applyFilters();
  }

  // Formatage de la date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Couleur du statut
  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Traduction du type de demande
  getRequestTypeLabel(type: string): string {
    switch (type) {
      case 'ALL':
        return 'Filtrer';
      case 'JOIN_DAHIRA':
        return 'Rejoindre Dahira';
      case 'CREATE_DAHIRA':
        return 'Créer Dahira';
      case 'LEAVE_DAHIRA':
        return 'Quitter Dahira';
      default:
        return type;
    }
  }

  // === GESTION DE LA SUPPRESSION ===
  openDeleteModal(request: RequestDto) {
    this.requestToDelete = request;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.requestToDelete = null;
  }

  confirmDelete() {
    if (this.requestToDelete) {
      // Appel à votre service pour supprimer la demande
      // this.requestService.deleteRequest(this.requestToDelete.requestId);

      // Mise à jour locale en attendant la réponse du serveur
      this.allRequests = this.allRequests.filter(
        req => req.requestId !== this.requestToDelete!.requestId
      );
      this.applyFilters();
      this.closeDeleteModal();
    }
  }

  // === GESTION DE L'APPROBATION ===
  openApprovalModal(request: RequestDto) {
    this.requestToApprove = request;
    this.showApprovalModal = true;
  }

  closeApprovalModal() {
    this.showApprovalModal = false;
    this.requestToApprove = null;
  }

  /**
   * Envoie une demande d'adhésion
   */
  // async requestMembership(): Promise<void> {
  //   if (!this.dahira || this.requestingMembership) {
  //     console.log("return");

  //     return;
  //   }

  //   this.requestingMembership = true;

  //   try {

  //     const response = await DahiraApiService.requestMembership(this.dahiraId);
  //     console.log("request ", response);


  //     if (response.success) {
  //       this.membershipRequested = true;
  //       this.saveMembershipRequest();
  //       this.toastService.showSuccess('Demande d\'adhésion envoyée avec succès !');
  //     } else {
  //       this.toastService.showError('Erreur lors de l\'envoi de la demande');
  //     }
  //   } catch (error: any) {
  //     console.error('Erreur demande adhésion:', error);
  //     const errorMessage = error.message || 'Erreur lors de l\'envoi de la demande';
  //     this.toastService.showError(errorMessage);
  //   } finally {
  //     this.requestingMembership = false;
  //   }

  async confirmApproval() {
    if (this.requestToApprove) {
      const data: ApprovalDto = { targetId: this.requestToApprove.requestId, approved: true, targetType: this.requestToApprove.requestType }

      try {
        const response = await RequestApiService.approval(data);
        console.log("request ", response);
        this.toastService.showSuccess("Vous avez autorisé la demande");
        // Mise à jour locale en attendant la réponse du serveur
        const requestIndex = this.allRequests.findIndex(
          req => req.requestId === this.requestToApprove!.requestId
        );

        if (requestIndex !== -1) {
          this.allRequests[requestIndex] = {
            ...this.allRequests[requestIndex],
            approvalStatus: StatusEnum.APPROVED
          };
          this.applyFilters();
        }
      } catch (error: any) {
        console.error('Erreur demande adhésion:', error);
        const errorMessage = error.message || 'Erreur lors de l\'envoi de la demande';
        this.toastService.showError(errorMessage);
      }


      this.closeApprovalModal();
    }
  }

  // === GESTION DU REJET ===
  openRejectionModal(request: RequestDto) {
    this.requestToReject = request;
    this.rejectionReason = '';
    this.showRejectionModal = true;
  }

  closeRejectionModal() {
    this.showRejectionModal = false;
    this.requestToReject = null;
    this.rejectionReason = '';
  }

  async confirmRejection() {
    if (this.requestToReject && this.isRejectionReasonValid) {
      // Appel à votre service pour rejeter la demande
      if (this.requestToApprove) {
        const data: ApprovalDto = { targetId: this.requestToApprove.requestId,
          approved: true,
          rejectionReason: this.rejectionReason,
          targetType: this.requestToApprove.requestType }

        try {
          const response = await RequestApiService.approval(data);
          console.log("request ", response);
          this.toastService.showSuccess("Vous avez décliné la demande");
          // Mise à jour locale en attendant la réponse du serveur
          const requestIndex = this.allRequests.findIndex(
            req => req.requestId === this.requestToReject!.requestId
          );

          if (requestIndex !== -1) {
            this.allRequests[requestIndex] = {
              ...this.allRequests[requestIndex],
              approvalStatus: StatusEnum.REJECTED,
              rejectionReason: this.rejectionReason
            };
            this.applyFilters();
          }
        } catch (error: any) {
          console.error('Erreur demande adhésion:', error);
          const errorMessage = error.message || 'Erreur lors de l\'envoi de la demande';
          this.toastService.showError(errorMessage);
        }


        this.closeRejectionModal();
      }
    }
  }

  // Validation du motif de rejet
  get isRejectionReasonValid(): boolean {
    return this.rejectionReason.trim().length >= 10;
  }

  // === AUTRES MÉTHODES ===
  refresh() {
    this.loadAllRequests();
  }

  goHome() {
    this.router.navigate(['tabs/home'])
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}