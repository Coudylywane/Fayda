import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BibliothequePageRoutingModule } from './bibliotheque-routing.module';

import { BibliothequePage } from './bibliotheque.page';
import { BaseLayoutComponent } from "../../shared/components/base-layout/base-layout.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BibliothequePageRoutingModule,
    BaseLayoutComponent
],
  declarations: [BibliothequePage]
})
export class BibliothequePageModule {}
