import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyDahiraPageRoutingModule } from './my-dahira-routing.module';

import { MyDahiraPage } from './my-dahira.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyDahiraPageRoutingModule
  ],
  declarations: [MyDahiraPage]
})
export class MyDahiraPageModule {}
