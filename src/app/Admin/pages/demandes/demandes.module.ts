import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DemandesPageRoutingModule } from './demandes-routing.module';

import { DemandesPage } from './demandes.page';
import { IconButtonComponent } from "../../../shared/components/icon-button/icon-button.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DemandesPageRoutingModule,
    IconButtonComponent
],
  declarations: [DemandesPage]
})
export class DemandesPageModule {}
