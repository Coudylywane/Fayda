import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyCollectePageRoutingModule } from './my-collecte-routing.module';

import { MyCollectePage } from './my-collecte.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyCollectePageRoutingModule
  ],
  declarations: [MyCollectePage]
})
export class MyCollectePageModule {}
