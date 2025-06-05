import { Component, OnInit, OnDestroy } from '@angular/core';
import { Demande } from './model/demandes.interface';
import { Router } from '@angular/router';
import { ConfettiService } from '../../services/confetti.service';
import { RequestApiService } from 'src/app/features/demandes/services/request.api';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { selectAdminRequestState } from './store/demande.selectors';
import { RequestService } from 'src/app/features/demandes/services/request.service';
import { RequestDto, RequestTypeEnum, StatusEnum } from 'src/app/features/demandes/models/request.model';

@Component({
  selector: 'app-demandes',
  templateUrl: './demandes.page.html',
  styleUrls: ['./demandes.page.scss'],
  standalone: false
})
export class DemandesPage implements OnInit, OnDestroy {

  protected Math = Math;
  allRequests: RequestDto[] = [];
  filteredDemands: RequestDto[] = [];
  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  selectedStatus: string = 'ALL';
  selectedType: string = 'ALL';
  status = StatusEnum;
  requestType = RequestTypeEnum;

  statusOptions: string[] = ['ALL', ...Object.values(this.status)]
  typeOptions = ['ALL', ...Object.values(this.requestType)];

  pendingCount: number = 0;
  approvedCount: number = 0;
  rejectedCount: number = 0;

  contextMenuPosition = { top: '0', left: '0' };

  // Modal properties
  showActionsPopup: string | null = null;
  showRejectModal: boolean = false;
  selectedDemand: RequestDto | null = null;
  rejectReason: string = '';
  error: string | null = null;
  loading: boolean = false;
  totalFilteredItems: number = 0;

  // Search debounce
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private confettiService: ConfettiService,
    private store: Store,
    private requestService: RequestService
  ) {
    // Configuration du debounce pour la recherche
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchText = searchTerm;
      this.currentPage = 1;
      this.filterDemands();
    });
  }

  ngOnInit() {
    this.loadAllRequests();

    this.store.select(selectAdminRequestState).pipe(
      takeUntil(this.destroy$)
    ).subscribe(requestState => {
      this.error = requestState.error;
      this.loading = requestState.loading;

      if (requestState.demandes && Array.isArray(requestState.demandes)) {
        this.allRequests = [...requestState.demandes];
        this.filterDemands();
        this.updateCounts();
        console.log('Demandes admin loaded:', this.allRequests.length);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge toutes les demandes du serveur
   */
  private loadAllRequests(): void {
    this.requestService.getAllRequest();
  }

  /**
   * Met à jour les compteurs par statut
   */
  updateCounts() {
    this.pendingCount = this.allRequests.filter(d => d.approvalStatus === this.status.PENDING).length;
    this.approvedCount = this.allRequests.filter(d => d.approvalStatus === this.status.APPROVED).length;
    this.rejectedCount = this.allRequests.filter(d => d.approvalStatus === this.status.REJECTED).length;
  }

  /**
   * Filtre les demandes selon les critères de recherche
   */
  filterDemands() {
    this.filteredDemands = this.allRequests.filter(demand => {
      // Filtrage par texte de recherche
      const searchLower = this.searchText.toLowerCase().trim();
      const searchMatch = !searchLower ||
        demand.requesterName.toLowerCase().includes(searchLower) ||
        demand.targetDahiraName?.toLowerCase().includes(searchLower);

      // Filtrage par statut
      const statusMatch = this.selectedStatus === 'ALL' ||
        demand.approvalStatus === this.selectedStatus;

      // Filtrage par type
      const typeMatch = this.selectedType === 'ALL' ||
        demand.requestType === this.selectedType;

      return searchMatch && statusMatch && typeMatch;
    });

    this.totalFilteredItems = this.filteredDemands.length;

    // Ajuster la page courante si nécessaire
    const maxPage = Math.ceil(this.filteredDemands.length / this.itemsPerPage);
    if (this.currentPage > maxPage && maxPage > 0) {
      this.currentPage = maxPage;
    }
  }

  /**
   * Gestion de la recherche avec debounce
   */
  onSearch(value: string) {
    this.searchSubject.next(value);
  }

  /**
   * Efface la recherche et recharge les données
   */
  clearSearch(): void {
    this.searchText = '';
    this.searchSubject.next('');
  }

  /**
   * Gestion du changement de statut
   */
  onStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus = select.value;
    this.currentPage = 1;
    this.filterDemands();
  }

  /**
   * Gestion du changement de type
   */
  onTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedType = select.value;
    this.currentPage = 1;
    this.filterDemands();
  }

  // Pagination
  get pageCount(): number {
    return Math.ceil(this.filteredDemands.length / this.itemsPerPage);
  }

  get pages(): number[] {
    const totalPages = this.pageCount;
    const current = this.currentPage;
    const pages = [];

    // Logique pour afficher les pages (max 7 pages visibles)
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1); // Ellipsis
        pages.push(totalPages);
      } else if (current >= totalPages - 3) {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1); // Ellipsis
        pages.push(totalPages);
      }
    }

    return pages;
  }

  get paginatedDemands(): RequestDto[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDemands.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.pageCount) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number) {
    if (page > 0 && page <= this.pageCount) {
      this.currentPage = page;
    }
  }

  /**
   * Retourne la classe CSS pour le statut
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-amber-100 text-amber-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Toggle du popup d'actions
   */
  toggleActionsPopup(event: MouseEvent, id: string | null): void {
    event.preventDefault();
    event.stopPropagation();

    this.showActionsPopup = this.showActionsPopup === id ? null : id;

    if (this.showActionsPopup) {
      const menuHeight = 150; // Hauteur estimée du menu
      const menuWidth = 200; // Largeur estimée du menu
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const clickY = event.clientY;
      const clickX = event.clientX;

      // Calculer la position
      const topPosition = clickY + menuHeight > windowHeight
        ? windowHeight - menuHeight - 10
        : clickY;
      const leftPosition = clickX + menuWidth > windowWidth
        ? windowWidth - menuWidth - 10
        : clickX;

      // Stocker la position pour l'utiliser dans le template
      this.contextMenuPosition = {
        top: `${topPosition}px`,
        left: `${leftPosition}px`
      };
    }
  }

  /**
   * Voir les détails d'une demande
   */
  viewDetails(demand: RequestDto): void {
    this.router.navigate(['admin/demandes/demande/', demand.requestId]);
    this.showActionsPopup = null;
  }

  /**
   * Approuver une demande
   */
  approveDemand(demand: RequestDto): void {
    if (demand.approvalStatus !== this.status.PENDING) {
      return;
    }

    // Ici, vous devriez appeler votre service pour approuver la demande
    // this.requestService.approveRequest(demand.requestId).subscribe(...)

    demand.approvalStatus = this.status.APPROVED;
    this.updateCounts();
    this.showActionsPopup = null;
    this.confettiService.triggerConfetti();
  }

  /**
   * Ouvrir le modal de rejet
   */
  openRejectModal(demand: RequestDto): void {
    this.selectedDemand = demand;
    this.rejectReason = '';
    this.showRejectModal = true;
    this.showActionsPopup = null;
  }

  /**
   * Fermer le modal de rejet
   */
  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedDemand = null;
    this.rejectReason = '';
  }

  /**
   * Confirmer le rejet d'une demande
   */
  confirmReject(): void {
    if (this.selectedDemand && this.rejectReason.trim()) {
      // Ici, vous devriez appeler votre service pour rejeter la demande
      // this.requestService.rejectRequest(this.selectedDemand.requestId, this.rejectReason).subscribe(...)

      this.selectedDemand.approvalStatus = this.status.REJECTED;
      this.selectedDemand.rejectionReason = this.rejectReason;
      this.updateCounts();
      this.closeRejectModal();
    }
  }

  // Traductions centralisées
  requestTypeLabels: { [key: string]: string } = {
    ALL: 'Tous les types',
    BECOME_DISCIPLE: 'Devenir Disciple',
    JOIN_DAHIRA: 'Rejoindre Dahira',
    CREATE_DAHIRA: 'Créer Dahira',
    BECOME_MOUQADAM: 'Devenir Moukhadam',
    BECOME_FONDS_CREATOR: 'Devenir Gestionnaire'
  };

  statusLabels: { [key: string]: string } = {
    ALL: 'Tous les statuts',
    PENDING: 'En attente',
    APPROVED: 'Approuvé',
    REJECTED: 'Rejeté'
  };

  /**
   * Traduction du statut de demande
   */
  getStatusLabel(status: string): string {
    return this.statusLabels[status] ?? status;
  }

  /**
   * Traduction du type de demande
   */
  getRequestTypeLabel(type: string): string {
    return this.requestTypeLabels[type] ?? type;
  }

  /**
   * Fermer les popups en cliquant à l'extérieur
   */
  closePopupsOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.actions-popup') && !target.closest('.actions-button')) {
      this.showActionsPopup = null;
    }
  }

  /**
   * Rafraîchir le tableau
   */
  refresh() {
    this.searchText = '';
    this.selectedStatus = 'ALL';
    this.selectedType = 'ALL';
    this.currentPage = 1;
    this.loadAllRequests();
  }

  /**
   * Vérifie si c'est une recherche vide
   */
  isEmptySearch(): boolean {
    return (this.searchText.length > 0 || this.selectedStatus !== 'ALL' || this.selectedType !== 'ALL')
      && this.totalFilteredItems === 0 && !this.loading;
  }

  /**
   * Vérifie s'il n'y a aucune donnée
   */
  hasNoData(): boolean {
    return this.allRequests.length === 0 && !this.loading;
  }

  /**
   * Formatage de la date
   */
  formatDate(dateString: string): string {
    if (!dateString) return '-';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  }

  /**
   * Obtient le motif d'affichage (pour la colonne Motif)
   */
  getDisplayReason(demand: RequestDto): string {
    if (demand.approvalStatus === this.status.REJECTED && demand.rejectionReason) {
      return demand.rejectionReason;
    }
    return this.getRequestTypeLabel(demand.requestType);
  }

  /**
 * Classes CSS pour les statuts
 */
  getStatusClasses(status: string): string {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'APPROVED': return `${baseClasses} bg-green-100 text-green-800`;
      case 'PENDING': return `${baseClasses} bg-amber-100 text-amber-800`;
      case 'REJECTED': return `${baseClasses} bg-red-100 text-red-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  /**
   * Classes pour les points de statut
   */
  getStatusDotClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'bg-green-400';
      case 'PENDING': return 'bg-amber-400';
      case 'REJECTED': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  }

  /**
   * TrackBy pour optimiser le rendu
   */
  trackByRequestId(index: number, item: RequestDto): string {
    return item.requestId;
  }

  getArrayFromCount(count: number): number[] {
    return Array(count).fill(0);
  }
}