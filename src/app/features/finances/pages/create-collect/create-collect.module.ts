import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateCollectPageRoutingModule } from './create-collect-routing.module';

import { CreateCollectPage } from './create-collect.page';
import { DateSelector2Component } from 'src/app/shared/components/date-selector2/date-selector2.component';
import { FormatNumberDirective } from 'src/app/directives/format-number.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateCollectPageRoutingModule,
    ReactiveFormsModule,
    DateSelector2Component,
    FormatNumberDirective
  ],
  declarations: [CreateCollectPage]
})
export class CreateCollectPageModule {}
