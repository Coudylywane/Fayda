import { Component, OnInit } from '@angular/core';
import { ConfettiService } from '../../services/confetti.service';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { DahiraServiceAdmin } from './services/dahira.service';
import { DahiraService } from 'src/app/features/dahiras/services/dahira.service';
import { selectDahiraState } from 'src/app/features/dahiras/store/dahira.selector';
import { Store } from '@ngrx/store';
import { Dahira } from 'src/app/features/dahiras/models/dahira.model';
import { CreateDahira } from './models/dahira.model';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { selectCurrentUser } from 'src/app/features/auth/store/auth.selectors';

@Component({
  selector: 'app-dahira',
  templateUrl: './dahira.page.html',
  styleUrls: ['./dahira.page.scss'],
  standalone: false
})
export class DahiraPage implements OnInit {
  // Données originales du serveur
  allDahiras: Dahira[] = [];
  // Données affichées (après filtrage)
  dahiras: Dahira[] = [];
  error: string | null = null;
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 12;
  searchTerm: string = '';
  filters: any = {};
  loading: boolean = false;
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showConfirmDeleteModal: boolean = false;
  selectedDahira: Dahira | null = null;
  protected Math = Math;
  private destroy$ = new Subject<void>();
  addLoading: boolean = false;

  // Pour le menu contextuel
  activeContextMenu: string | null = null;
  contextMenuPosition = { top: '0px', left: '0px' };

  // Pour la recherche
  searchSubject = new Subject<string>();

  // Pagination côté client
  filteredDahiras: Dahira[] = [];
  totalFilteredItems: number = 0;
  userId: string = "";

  constructor(
    private confettiService: ConfettiService,
    private dahiraServiceAdmin: DahiraServiceAdmin,
    private dahiraService: DahiraService,
    private router: Router,
    private store: Store,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    console.log("Initialisation DahirasPage");

    // Charger toutes les données une seule fois
    this.loadAllDahiras();

    // S'abonner aux changements d'état du store
    this.store.select(selectDahiraState).pipe(
      takeUntil(this.destroy$)
    ).subscribe(dahiraState => {
      this.loading = dahiraState.loading;
      this.error = dahiraState.error;

      // Stocker toutes les données du serveur
      if (dahiraState.dahiras && dahiraState.dahiras.length > 0) {
        this.allDahiras = [...dahiraState.dahiras];
        this.applyFiltersAndPagination();
      }
    });

    // S'abonner aux changements d'état du store
    this.store.select(selectCurrentUser).pipe(
      takeUntil(this.destroy$)
    ).subscribe(currentUser => {
      this.userId = currentUser?.userId!;

    });

    // Configuration de la recherche avec debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 1; // Réinitialiser à la première page
      this.applyFiltersAndPagination();
    });
  }

  /**
 * Charge toutes les dahiras du serveur
 */
  private loadAllDahiras(): void {
    this.dahiraService.getDahirasPagined(1, 12);
  }

  /**
   * Applique les filtres de recherche et la pagination côté client
   */
  private applyFiltersAndPagination(): void {
    let filtered = [...this.allDahiras];

    // Appliquer la recherche
    if (this.searchTerm && this.searchTerm.length > 0) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(dahira =>
        dahira.dahiraName.toLowerCase().includes(searchLower) ||
        dahira.email.toLowerCase().includes(searchLower) ||
        dahira.phoneNumber.includes(searchLower) ||
        dahira.location?.address?.toLowerCase().includes(searchLower) ||
        dahira.location?.region?.toLowerCase().includes(searchLower) ||
        dahira.location?.country?.toLowerCase().includes(searchLower)
      );
    }

    // Appliquer d'autres filtres si nécessaire
    if (this.filters && Object.keys(this.filters).length > 0) {
      filtered = this.applyCustomFilters(filtered, this.filters);
    }

    // Stocker les résultats filtrés
    this.filteredDahiras = filtered;
    this.totalFilteredItems = filtered.length;

    // Appliquer la pagination
    this.applyPagination();
  }

  /**
   * Applique la pagination sur les données filtrées
   */
  private applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.dahiras = this.filteredDahiras.slice(startIndex, endIndex);
    this.totalItems = this.totalFilteredItems;
  }

  /**
   * Applique des filtres personnalisés (à adapter selon vos besoins)
   */
  private applyCustomFilters(dahiras: Dahira[], filters: any): Dahira[] {
    let filtered = dahiras;

    // Exemple de filtres (adaptez selon vos besoins)
    if (filters.region) {
      filtered = filtered.filter(d =>
        d.location?.region?.toLowerCase().includes(filters.region.toLowerCase())
      );
    }

    if (filters.minDisciples) {
      filtered = filtered.filter(d => d.numberOfDisciples >= filters.minDisciples);
    }

    if (filters.active !== undefined) {
      filtered = filtered.filter(d => d.active === filters.active);
    }

    return filtered;
  }

  /**
   * Gère la recherche avec debounce
   */
  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  formatPhoneNumber(phoneNumber: string) {
    return phoneNumber;
  }

  /**
 * Calcule le nombre total de pages
 */
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  /**
   * Gère le changement de page
   */
  onPageChange(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.applyPagination();
    }
  }

  /**
 * Vérifie s'il y a des résultats
 */
  hasResults(): boolean {
    return this.dahiras.length > 0;
  }

  /**
   * Vérifie si c'est une recherche vide
   */
  isEmptySearch(): boolean {
    return this.searchTerm.length > 0 && this.totalFilteredItems === 0;
  }

  /**
   * Gère le changement de filtres
   */
  onFilterChange(filters: any): void {
    this.filters = filters;
    this.currentPage = 1; // Réinitialiser à la première page
    this.applyFiltersAndPagination();
  }

  /**
   * Efface la recherche et recharge les données
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  showContextMenu(event: MouseEvent, dahira: Dahira): void {
    event.preventDefault();
    event.stopPropagation();

    this.selectedDahira = dahira;
    this.activeContextMenu = dahira.dahiraId;

    // Positionner le menu contextuel
    const menuWidth = 200; // Largeur estimée du menu
    const windowWidth = window.innerWidth;
    const clickX = event.clientX;

    // Éviter que le menu ne sorte de l'écran par la droite
    const left = clickX + menuWidth > windowWidth
      ? windowWidth - menuWidth - 10
      : clickX;

    this.contextMenuPosition = {
      top: `${event.clientY}px`,
      left: `${left}px`
    };
  }

  closeContextMenu(): void {
    this.activeContextMenu = null;
  }

  viewDahiraDetails(dahira: Dahira): void {
    this.router.navigate(['admin/dahira/detail', dahira.dahiraId]);
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  /**
 * Rafraîchit les données depuis le serveur
 */
  refresh(): void {
    this.searchTerm = "";
    this.loadAllDahiras();
  }

  openEditModal(dahira: Dahira): void {
    this.selectedDahira = dahira;
    this.showEditModal = true;
    this.closeContextMenu();
  }

  openDeleteConfirmation(dahira: Dahira): void {
    this.selectedDahira = dahira;
    this.showConfirmDeleteModal = true;
    this.closeContextMenu();
  }

  onAddDahira(dahira: CreateDahira): void {
    this.addLoading = true;
    console.log('Tentative de création dahira:', dahira);
    dahira.location.nationality = dahira.location.country;
    this.dahiraService.createDahira(dahira)
      .then(response => {
        this.addLoading = false;
        console.log('Succès création dahira:', response);
        if (response.success) {
          this.showAddModal = false;
          this.toastService.showSuccess(response.data.message || "Votre demande a été envoyé");
        }
        this.loadAllDahiras();
      }).catch(error => {
        this.addLoading = false;
        console.error('Erreur création dahira:', error);
        this.toastService.showError(error.message)
      });
  }

  onEditDahira(dahira: any): void {
    this.addLoading = true;
    console.log('Tentative de modification dahira:', dahira);
    this.dahiraService.updateDahira(this.selectedDahira?.dahiraId!, dahira)
      .then(response => {
        this.addLoading = false;
        console.log('Succès modification dahira:', response);
        if (response.success) {
          this.showEditModal = false;
          this.toastService.showSuccess(response.data.message || "La Dahira a été modifié");
        }
        this.loadAllDahiras();
      }).catch(error => {
        this.addLoading = false;
        console.error('Erreur modification dahira:', error);
        this.toastService.showError(error.message)
      });

  }

  onDeleteDahira(): void {
    if (this.selectedDahira) {
      this.dahiraServiceAdmin.deleteDahira(this.selectedDahira.dahiraId).subscribe({
        next: (success) => {
          if (success) {
            this.showConfirmDeleteModal = false;
            this.loadAllDahiras();
          }
        },
        error: (error) => console.error('Erreur lors de la suppression du dahira', error)
      });
    }
  }

  onCardClick(dahira: Dahira): void {
    this.viewDahiraDetails(dahira);
  }

  // Fermer les modales
  closeAddModal(): void {
    this.showAddModal = false;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  closeDeleteModal(): void {
    this.showConfirmDeleteModal = false;
  }
}