import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';  

import { IonicModule } from '@ionic/angular';

import { BaseLayoutAdminPageRoutingModule } from './base-layout-admin-routing.module';

import { BaseLayoutAdminPage } from './base-layout-admin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,         // <-- Ajouté ici
    IonicModule,
    BaseLayoutAdminPageRoutingModule
  ],
  declarations: [BaseLayoutAdminPage]
})
export class BaseLayoutAdminPageModule {}
