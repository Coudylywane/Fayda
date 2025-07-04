import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectDTO } from '../../models/projet.model';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-projet',
  templateUrl: './detail-projet.component.html',
  styleUrls: ['./detail-projet.component.scss'],
  imports: [CommonModule],
})
export class DetailProjetComponent implements OnInit {
  project: ProjectDTO | undefined;
  projectId: string = "";
  projectNull: boolean = false;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectId = id;
      if (this.projectId && this.projectId !== "undefined") {
        this.loadProjectDetails();
      } else {
        this.projectNull = true;
      }
    } else {
      this.projectNull = true;
    }
  }

  loadProjectDetails() {
    this.loading = true;
    this.error = null;
    
    this.projectService.getProjectById(this.projectId).then((response) => {
      console.log('Response:', response.data);
      
      if (response.data.statusCodeValue === 200) {
        this.project = response.data.data;
        console.log("Project:", this.project);
      } else {
        this.error = response.data.developerMessage || 'Erreur lors du chargement du projet';
        this.projectNull = true;
      }
      this.loading = false;
    }).catch(error => {
      this.loading = false;
      this.error = error.message || 'Erreur de connexion';
      this.projectNull = true;
      console.error('Erreur lors du chargement des détails de la levée de fonds', error);
    });
  }

  goBack() {
    this.router.navigate(['admin/projets']);
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'APPROVED': 'Approuvé',
      'PENDING': 'En attente',
      'REJECTED': 'Rejeté'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'APPROVED': 'bg-green-100 text-green-600',
      'PENDING': 'bg-yellow-100 text-yellow-600',
      'REJECTED': 'bg-red-100 text-red-600'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-600';
  }

  getActiveStatusClass(isActive: boolean): string {
    return isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600';
  }

  getActiveStatusLabel(isActive: boolean): string {
    return isActive ? 'Actif' : 'Inactif';
  }

  formatDate(date: Date | string): string {
    if (!date) return 'Non défini';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    if (!amount) return '0 XAF';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getInitials(firstName: string, lastName: string): string {
    if (!firstName || !lastName) return 'NA';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getRandomColor(): string {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getRemainingAmount(): number {
    if (!this.project) return 0;
    return this.project.targetAmount - this.project.currentAmount;
  }

  getContributorFullName(contributor: any): string {
    return `${contributor.fisrtName} ${contributor.lastName}`;
  }

  // hasContributors(): boolean {
  //   return this.project?.contributors && this.project.contributors.length > 0;
  // }

  // getContributorsCount(): number {
  //   return this.project?.contributors?.length || 0;
  // }

  retryLoading() {
    this.projectNull = false;
    this.error = null;
    this.loadProjectDetails();
  }
}