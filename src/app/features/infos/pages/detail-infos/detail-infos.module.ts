import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailInfosPageRoutingModule } from './detail-infos-routing.module';

import { DetailInfosPage } from './detail-infos.page';
import { IconButtonComponent } from "../../../../shared/components/icon-button/icon-button.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailInfosPageRoutingModule,
    IconButtonComponent
],
  declarations: [DetailInfosPage]
})
export class DetailInfosPageModule {}
