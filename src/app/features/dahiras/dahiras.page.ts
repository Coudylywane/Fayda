import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { DahiraService } from './services/dahira.service';
import { Dahira } from './models/dahira.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dahiras',
  templateUrl: './dahiras.page.html',
  styleUrls: ['./dahiras.page.scss'],
  standalone: false
})
export class DahirasPage implements OnInit {
  dahiras: Dahira[] = [];
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
  
  // Pour le menu contextuel
  activeContextMenu: string | null = null;
  contextMenuPosition = { top: '0px', left: '0px' };
  
  // Pour la recherche
  searchSubject = new Subject<string>();
  
  constructor(
    private dahiraService: DahiraService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDahiras();
    
    // Configuration de la recherche avec debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 1; // Réinitialiser à la première page lors d'une recherche
      this.loadDahiras();
    });
  }

  loadDahiras(): void {
    this.loading = true;
    this.dahiraService.getDahiras(this.currentPage, this.itemsPerPage, this.searchTerm, this.filters)
      .subscribe({
        next: (result) => {
          this.dahiras = result.dahiras;
          this.totalItems = result.total;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des dahiras', error);
          this.loading = false;
        }
      });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDahiras();
  }

  onFilterChange(filters: any): void {
    this.filters = filters;
    this.currentPage = 1; // Réinitialiser à la première page lors d'un changement de filtre
    this.loadDahiras();
  }


  viewDahiraDetails(dahira: Dahira): void {
    // this.router.navigate(['tabs/dahira/detail', dahira.dahiraId]);
  }

  onCardClick(dahira: Dahira): void {
    this.viewDahiraDetails(dahira);
  }
}