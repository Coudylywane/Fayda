import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AdminDashboardPageRoutingModule } from './admin-dashboard-routing.module';
import { AdminDashboardPage } from './admin-dashboard.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';  // Importation de CUSTOM_ELEMENTS_SCHEMA

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,  // IonicModule pour les composants Ionic
    AdminDashboardPageRoutingModule,
    AdminDashboardPage  // Importation directe de AdminDashboardPage ici
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Permet de gérer les Web Components d'Ionic
})
export class AdminDashboardPageModule {}
