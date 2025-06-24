import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DisciplesPageRoutingModule } from './disciples-routing.module';

import { DisciplesPage } from './disciples.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DisciplesPageRoutingModule,

  ],
  declarations: [DisciplesPage]
})
export class DisciplesPageModule {}
