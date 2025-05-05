import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfosPageRoutingModule } from './infos-routing.module';

import { InfosPage } from './infos.page';
import { BaseLayoutComponent } from "../../shared/components/base-layout/base-layout.component";
import { EventListComponent } from "./components/event-list/event-list.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfosPageRoutingModule,
    BaseLayoutComponent,
    EventListComponent
],
  declarations: [InfosPage]
})
export class InfosPageModule {}
