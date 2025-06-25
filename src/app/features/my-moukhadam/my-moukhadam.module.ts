import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyMoukhadamPageRoutingModule } from './my-moukhadam-routing.module';

import { MyMoukhadamPage } from './my-moukhadam.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyMoukhadamPageRoutingModule
  ],
  declarations: [MyMoukhadamPage]
})
export class MyMoukhadamPageModule {}
