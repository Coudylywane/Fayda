import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinancesPageRoutingModule } from './finances-routing.module';

import { FinancesPage } from './finances.page';
import { BaseLayoutComponent } from "../../shared/components/base-layout/base-layout.component";
import { ContributionGoalModalComponent } from "./components/contribution-goal-modal/contribution-goal-modal.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinancesPageRoutingModule,
    BaseLayoutComponent,
    ContributionGoalModalComponent
],
  declarations: [FinancesPage]
})
export class FinancesPageModule {}
