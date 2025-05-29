import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DahirasPageRoutingModule } from './dahiras-routing.module';

import { DahirasPage } from './dahiras.page';
import { BaseLayoutComponent } from "../../shared/components/base-layout/base-layout.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DahirasPageRoutingModule,
    BaseLayoutComponent
],
  declarations: [DahirasPage]
})
export class DahirasPageModule {}
