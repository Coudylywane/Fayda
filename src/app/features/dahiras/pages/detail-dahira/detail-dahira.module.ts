import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailDahiraPageRoutingModule } from './detail-dahira-routing.module';

import { DetailDahiraPage } from './detail-dahira.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailDahiraPageRoutingModule
  ],
  declarations: [DetailDahiraPage]
})
export class DetailDahiraPageModule {}
