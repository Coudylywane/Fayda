import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DemandesPageRoutingModule } from './demandes-routing.module';

import { DemandesPage } from './demandes.page';
import { SelectorComponent } from "../../shared/components/selector/selector.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DemandesPageRoutingModule,
    SelectorComponent
],
  declarations: [DemandesPage]
})
export class DemandesPageModule {}
