import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LireOuvragePageRoutingModule } from './lire-ouvrage-routing.module';

import { LireOuvragePage } from './lire-ouvrage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LireOuvragePageRoutingModule
  ],
  declarations: [LireOuvragePage]
})
export class LireOuvragePageModule {}
