import { Component, AfterViewInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';  // Importation d'IonicModule
import { Router } from '@angular/router';  // Importation du Router pour la navigation
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,  // Si tu utilises un composant autonome
  imports: [IonicModule],  // Ajout de IonicModule pour inclure les composants Ionic
})
export class AdminDashboardPage implements AfterViewInit {

  constructor(private router: Router) {}  // Injection du Router

  ngAfterViewInit() {
    this.loadMonthlyChart();
  }

  loadMonthlyChart(): void {
    const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement;

    if (!canvas) {
      console.error('Canvas element #monthlyChart not found');
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('2D context not available on canvas');
      return;
    }

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'],
        datasets: [{
          label: 'Cotisations',
          data: [60, 40, 30, 20, 100, 90, 70, 50],
          backgroundColor: '#4b572d',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  }

  // Fonction pour la navigation vers la page Utilisateurs
  navigateToUtilisateurs() {
    this.router.navigate(['/admin/utilisateurs']);
  }
}
