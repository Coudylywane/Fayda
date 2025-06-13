import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateDahiraPageRoutingModule } from './create-dahira-routing.module';

import { CreateDahiraPage } from './create-dahira.page';
import { PhoneInputComponent } from "../../../../shared/components/phone-input/phone-input.component";
import { CountrySelector2Component } from "../../../../shared/components/country-selector2/country-selector2.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateDahiraPageRoutingModule,
    ReactiveFormsModule,
    PhoneInputComponent,
    CountrySelector2Component
],
  declarations: [CreateDahiraPage]
})
export class CreateDahiraPageModule {}
