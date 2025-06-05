import { Component, OnInit } from '@angular/core';
import { RequestDto } from './models/request.model';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectRequestState } from './store/request.selectors';
import { Subject, takeUntil } from 'rxjs';
import { RequestService } from './services/request.service';
import { selectCurrentUser } from '../auth/store/auth.selectors';

@Component({
  selector: 'app-demandes',
  templateUrl: './demandes.page.html',
  styleUrls: ['./demandes.page.scss'],
  standalone: false
})
export class DemandesPage implements OnInit {

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

  // Modale de confirmation
  showDeleteModal: boolean = false;
  requestToDelete: RequestDto | null = null;

  // Types de demandes disponibles
  requestTypes: string[] = ['ALL', 'JOIN_DAHIRA', 'CREATE_DAHIRA', 'LEAVE_DAHIRA'];


  constructor(
    private router: Router,
    private store: Store,
    private requestService: RequestService
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

    this.requestService.getRequest(this.userId);
  }

  // Application des filtres
  applyFilters() {

    this.filteredRequests = this.allRequests.filter(request => {
      // Filtre par statut (onglet)
      const matchesTab = this.activeTab === 'ALL' ||
        request.approvalStatus === this.activeTab;

      // Filtre par recherche (nom demandeur ou dahira)
      const matchesSearch = this.searchTerm === '' ||
        request.requesterName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        request.targetDahiraName.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtre par type de demande
      const matchesType = this.selectedRequestType === 'ALL' ||
        request.requestType === this.selectedRequestType;

      return matchesTab && matchesSearch && matchesType;
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

  getRequestTypeIcon(type: string): string | undefined {
    switch (type) {
      case 'ALL': return 'fas fa-sign-in-alt text-gray-500';
      case 'JOIN_DAHIRA': return 'fas fa-sign-in-alt text-gray-500';
      case 'CREATE_DAHIRA': return 'fas fa-plus-circle text-gray-500';
      case 'LEAVE_DAHIRA': return 'fas fa-sign-out-alt text-gray-500';
      default: return undefined;
    }
  }

  getOptions() {
    return this.requestTypes.map(type => ({
      value: type,
      label: this.getRequestTypeLabel(type),
      icon: this.getRequestTypeIcon(type)
    }));
  }


  // Gestion de la suppression
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
      this.allRequests = this.allRequests.filter(
        req => req.requestId !== this.requestToDelete!.requestId
      );
      this.applyFilters();
      this.closeDeleteModal();
    }
  }

  refresh() {
    this.loadAllRequests();
  }

  goHome() {
    this.router.navigate(['tabs/home'])
  }
}