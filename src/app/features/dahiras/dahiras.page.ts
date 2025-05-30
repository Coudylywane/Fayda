import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Observable, Subject, takeUntil } from 'rxjs';
import { DahiraService } from './services/dahira.service';
import { Dahira } from './models/dahira.model';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectDahiras, selectDahiraState } from './store/dahira.selector';
import { ToastService } from 'src/app/shared/components/toast/toast.service';

@Component({
  selector: 'app-dahiras',
  templateUrl: './dahiras.page.html',
  styleUrls: ['./dahiras.page.scss'],
  standalone: false
})
export class DahirasPage implements OnInit {
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
  selectedDahira: Dahira | null = null;
  protected Math = Math;
  private destroy$ = new Subject<void>();

  // Pour le menu contextuel
  activeContextMenu: string | null = null;
  contextMenuPosition = { top: '0px', left: '0px' };

  // Pour la recherche avec debounce
  private searchSubject = new Subject<string>();

  // Pagination côté client
  filteredDahiras: Dahira[] = [];
  totalFilteredItems: number = 0;

  constructor(
    private dahiraService: DahiraService,
    private router: Router,
    private store: Store,
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

  /**
   * Calcule le nombre total de pages
   */
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  /**
   * Rafraîchit les données depuis le serveur
   */
  refresh(): void {
    this.loadAllDahiras();
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
   * Obtient les pages visibles pour la pagination
   */
  getVisiblePages(): number[] {
    const totalPages = this.getTotalPages();
    const current = this.currentPage;
    const pages: number[] = [];

    // Toujours afficher au maximum 5 pages
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    // Ajuster le début si on est proche de la fin
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * TrackBy function pour l'optimisation des performances de ngFor
   */
  trackByPage(index: number, page: number): number {
    return page;
  }

  /**
   * TrackBy function pour la liste des dahiras
   */
  trackByDahira(index: number, dahira: Dahira): string {
    return dahira.dahiraId;
  }

  /**
   * Navigue vers les détails d'un dahira
   */
  onCardClick(dahira: Dahira): void {
    this.router.navigate(['tabs/dahiras/detail', dahira.dahiraId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}