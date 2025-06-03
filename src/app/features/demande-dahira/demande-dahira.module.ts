import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DemandeDahiraPageRoutingModule } from './demande-dahira-routing.module';

import { DemandeDahiraPage } from './demande-dahira.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DemandeDahiraPageRoutingModule
  ],
  declarations: [DemandeDahiraPage]
})
export class DemandeDahiraPageModule {}
