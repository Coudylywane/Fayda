import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailOuvragePageRoutingModule } from './detail-ouvrage-routing.module';

import { DetailOuvragePage } from './detail-ouvrage.page';
import { IconButtonComponent } from "../../../../shared/components/icon-button/icon-button.component";
import { ButtonComponent } from "../../../../shared/components/button/button.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailOuvragePageRoutingModule,
    IconButtonComponent,
    ButtonComponent
],
  declarations: [DetailOuvragePage]
})
export class DetailOuvragePageModule {}
