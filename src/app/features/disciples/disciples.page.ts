import { Component, OnInit } from '@angular/core';
import { User } from '../auth/models/user.model';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DiscipleService } from './services/disciples.service';

@Component({
  selector: 'app-disciples',
  templateUrl: './disciples.page.html',
  styleUrls: ['./disciples.page.scss'],
  standalone: false
})
export class DisciplesPage implements OnInit {

  // Données originales du serveur
  allDisciples: User[] = [];
  // Données affichées (après filtrage)
  disciples: User[] = [];
  error: string | null = null;
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 12;
  searchTerm: string = '';
  filters: any = {};
  loading: boolean = false;
  selectedDisciple: User | null = null;
  private destroy$ = new Subject<void>();
  protected Math = Math;

  // Pour le menu contextuel
  activeContextMenu: string | null = null;
  contextMenuPosition = { top: '0px', left: '0px' };

  // Pour la recherche avec debounce
  private searchSubject = new Subject<string>();

  // Pagination côté client
  filteredDisciples: User[] = [];
  totalFilteredItems: number = 0;

  constructor(
    private router: Router,
    private store: Store,
  ) { }

  ngOnInit(): void {
    console.log("Initialisation DisciplesPage");

    // Charger toutes les données une seule fois
    this.loadAllDisciples();

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
   * Charge toutes les disciples du serveur
   */
  private loadAllDisciples(): void {
    this.loading = true;
    console.log('chargement de disciples:');
    DiscipleService.getDisciple().then(response => {
        this.loading = false;
        console.log('Succès chargement de disciples:', response);
        if (response.success) {
          this.allDisciples = response.data.data;
        }
      }).catch(error => {
        this.loading = false;
        console.error('Erreur chargement de disciples:', error);
        this.error = error.message
      });
  }

  /**
   * Applique les filtres de recherche et la pagination côté client
   */
  private applyFiltersAndPagination(): void {
    let filtered = [...this.allDisciples];

    // Appliquer la recherche
    if (this.searchTerm && this.searchTerm.length > 0) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(disciple =>
        disciple.firstName.toLowerCase().includes(searchLower) ||
        disciple.email.toLowerCase().includes(searchLower) ||
        disciple.phoneNumber.includes(searchLower) ||
        disciple.lastName.toLowerCase().includes(searchLower)
        // disciple.location?.region?.toLowerCase().includes(searchLower) ||
        // disciple.location?.country?.toLowerCase().includes(searchLower)
      );
    }

    // Appliquer d'autres filtres si nécessaire
    if (this.filters && Object.keys(this.filters).length > 0) {
      filtered = this.applyCustomFilters(filtered, this.filters);
    }

    // Stocker les résultats filtrés
    this.filteredDisciples = filtered;
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

    this.disciples = this.filteredDisciples.slice(startIndex, endIndex);
    this.totalItems = this.totalFilteredItems;
  }

  /**
   * Applique des filtres personnalisés (à adapter selon vos besoins)
   */
  private applyCustomFilters(disciples: User[], filters: any): User[] {
    let filtered = disciples;

    // Exemple de filtres (adaptez selon vos besoins)
    if (filters.region) {
      filtered = filtered.filter(d =>
        d.location?.region?.toLowerCase().includes(filters.region.toLowerCase())
      );
    }

    // if (filters.minDisciples) {
    //   filtered = filtered.filter(d => d.numberOfDisciples >= filters.minDisciples);
    // }

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
    this.loadAllDisciples();
  }

  /**
   * Vérifie s'il y a des résultats
   */
  hasResults(): boolean {
    return this.disciples.length > 0;
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
   * TrackBy function pour la liste des disciples
   */
  trackByDisciple(index: number, disciple: User): string {
    return disciple.userId;
  }

  /**
   * Navigue vers les détails d'un disciple
   */
  onCardClick(disciple: User): void {
    this.router.navigate(['tabs/disciples/detail', disciple.userId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(){
    this.router.navigate(['tabs/home']);
  }
}