import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DetailTafsirPageRoutingModule } from './detail-tafsir-routing.module';
import { DetailTafsirPage } from './detail-tafsir.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailTafsirPageRoutingModule,
],
  declarations: [DetailTafsirPage]
})
export class DetailTafsirPageModule {}
