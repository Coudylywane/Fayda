import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LireOuvragePageRoutingModule } from './lire-ouvrage-routing.module';
import { LireOuvragePage } from './lire-ouvrage.page';
import { PdfViewerComponent } from "../../components/pdf-viewer/pdf-viewer.component";
import { PdfService } from '../../services/pdf-viewer.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LireOuvragePageRoutingModule,
    PdfViewerComponent
],
providers: [PdfService],
  declarations: [LireOuvragePage]
})
export class LireOuvragePageModule {}
