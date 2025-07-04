import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectDTO } from 'src/app/Admin/pages/projets/models/projet.model';
import { ProjectService } from 'src/app/Admin/pages/projets/services/project.service';

@Component({
  selector: 'app-my-collecte',
  templateUrl: './my-collecte.page.html',
  styleUrls: ['./my-collecte.page.scss'],
  standalone: false
})
export class MyCollectePage implements OnInit {
  projectId: string = '';
  
  // Données des projets
  projects: ProjectDTO[] = [];
  allProjects: ProjectDTO[] = [];
  
  // États de l'interface
  loading: boolean = false;
  error: string | null = null;
  
  // Recherche
  searchTerm: string = '';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  
  // Propriétés calculées
  get totalItems(): number {
    return this.getFilteredProjects().length;
  }
  
  get totalFilteredItems(): number {
    return this.getFilteredProjects().length;
  }

  constructor(
    private router: Router,
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
    this.loadProjectDetails();
  }

  loadProjectDetails(): void {
    this.loading = true;
    this.error = null;
    
    this.projectService.getOwnProjects().then((response) => {
      console.log(response.data);

      if (response.data.statusCodeValue === 200) {
        this.allProjects = response.data.data || [];
        this.applyFiltersAndPagination();
        console.log("Projects : ", this.allProjects);
      } else {
        this.error = response.data.developerMessage || 'Erreur lors du chargement des projets';
      }
      
      this.loading = false;
    }).catch(error => {
      this.loading = false;
      this.error = error.message || 'Erreur lors du chargement des projets';
      console.error('Erreur lors du chargement des détails du projet', error);
    });
  }

  // Gestion de la recherche
  onSearch(searchValue: string): void {
    this.searchTerm = searchValue.toLowerCase();
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  // Filtrage des projets
  getFilteredProjects(): ProjectDTO[] {
    if (!this.searchTerm) {
      return this.allProjects;
    }

    return this.allProjects.filter(project => 
      project.title.toLowerCase().includes(this.searchTerm) ||
      project.description.toLowerCase().includes(this.searchTerm) ||
      project.status.toLowerCase().includes(this.searchTerm) ||
      project.creatorName.toLowerCase().includes(this.searchTerm)
    );
  }

  // Application des filtres et pagination
  applyFiltersAndPagination(): void {
    const filteredProjects = this.getFilteredProjects();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    this.projects = filteredProjects.slice(startIndex, endIndex);
  }

  // Vérification des états
  hasResults(): boolean {
    return this.allProjects.length > 0 && this.projects.length > 0;
  }

  isEmptySearch(): boolean {
    return this.searchTerm !== '' && this.getFilteredProjects().length === 0;
  }

  // Gestion de la pagination
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.applyFiltersAndPagination();
    }
  }

  getVisiblePages(): number[] {
    const totalPages = this.getTotalPages();
    const currentPage = this.currentPage;
    const visiblePages: number[] = [];

    if (totalPages <= 7) {
      // Afficher toutes les pages si moins de 7
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      // Logique pour les ellipses
      if (currentPage <= 4) {
        // Début : 1, 2, 3, 4, 5, ..., totalPages
        for (let i = 1; i <= 5; i++) {
          visiblePages.push(i);
        }
        visiblePages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Fin : 1, ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
        visiblePages.push(1);
        for (let i = totalPages - 4; i <= totalPages; i++) {
          visiblePages.push(i);
        }
      } else {
        // Milieu : 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
        visiblePages.push(1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          visiblePages.push(i);
        }
        visiblePages.push(totalPages);
      }
    }

    return visiblePages;
  }

  trackByPage(index: number, page: number): number {
    return page;
  }

  // Actions
  onCardClick(project: ProjectDTO): void {
    // Navigation vers les détails du projet
    this.router.navigate(['/project-details', project.collectionId]);
  }

  refresh(): void {
    this.loadProjectDetails();
  }

  goBack(): void {
    this.router.navigate(['tabs/home']);
  }

  // Utilitaires de formatage
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'ACTIVE': 'Actif',
      'PENDING': 'En attente',
      'APPROVED': 'Approuvé',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé'
    };
    return statusLabels[status] || status;
  }

  // Propriété utilitaire pour le template
  get Math() {
    return Math;
  }
}