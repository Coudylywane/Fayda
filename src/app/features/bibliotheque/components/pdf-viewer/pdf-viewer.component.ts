import { Component, Input, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import * as pdfjsLib from 'pdfjs-dist';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from "../../../../shared/components/button/button.component";
import { IconButtonComponent } from "../../../../shared/components/icon-button/icon-button.component";

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ButtonComponent, IconButtonComponent],
})
export class PdfViewerComponent implements OnInit, OnDestroy {
  @Input() pdfSrc!: string;
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;

  pdfDoc: any = null;
  pageNum = 1;
  pageRendering = false;
  pageNumPending: any = null;
  scale = 1.0;
  totalPages = 0;
  isLoading = true;
  error: string | null = null;

  // Pour gérer les observables et les évènements
  private resizeObserver!: ResizeObserver;

  constructor(private platform: Platform) {
    // Configuration du worker PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';
  }

  ngOnInit() {
    if (this.pdfSrc) {
      this.loadPdf();
    }
    
    // Observer les changements de taille pour adapter le PDF
    this.resizeObserver = new ResizeObserver(() => {
      if (this.pdfDoc) {
        this.queueRenderPage(this.pageNum);
      }
    });
    
    this.resizeObserver.observe(this.canvasContainer.nativeElement);
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  async loadPdf() {
    this.isLoading = true;
    this.error = null;
    
    try {
      // Chargement du document PDF
      const loadingTask = pdfjsLib.getDocument(this.pdfSrc);
      this.pdfDoc = await loadingTask.promise;
      this.totalPages = this.pdfDoc.numPages;
      
      // Ajustement de l'échelle en fonction de la largeur du conteneur
      this.adjustScale();
      
      // Rendu de la première page
      this.renderPage(this.pageNum);
      this.isLoading = false;
    } catch (err) {
      console.error('Erreur lors du chargement du PDF:', err);
      this.error = 'Impossible de charger le PDF';
      this.isLoading = false;
    }
  }

  adjustScale() {
    if (!this.pdfDoc || !this.canvasContainer) return;
    
    const containerWidth = this.canvasContainer.nativeElement.clientWidth;
    // On récupère la taille de la page pour calculer le ratio correct
    this.pdfDoc.getPage(1).then((page: any) => {
      const viewport = page.getViewport({ scale: 1 });
      this.scale = containerWidth / viewport.width;
      
      // Si on est déjà en train d'afficher une page, on la rafraîchit
      if (this.pageNum) {
        this.queueRenderPage(this.pageNum);
      }
    });
  }

  /**
   * Rendu d'une page spécifique du PDF
   */
  async renderPage(num: any) {
    this.pageRendering = true;
    
    try {
      // Récupération de la page
      const page = await this.pdfDoc.getPage(num);
      
      // Calcul du viewport avec l'échelle adaptée
      const viewport = page.getViewport({ scale: this.scale });
      
      // Préparation du canvas pour le rendu
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.className = 'pdf-page';
      
      // Nettoyage du conteneur avant d'ajouter la nouvelle page
      this.canvasContainer.nativeElement.innerHTML = '';
      this.canvasContainer.nativeElement.appendChild(canvas);
      
      // Rendu de la page sur le canvas
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      this.pageRendering = false;
      
      // Vérification s'il y a une page en attente de rendu
      if (this.pageNumPending !== null) {
        const numToRender = this.pageNumPending;
        this.pageNumPending = null;
        this.renderPage(numToRender);
      }
    } catch (err) {
      console.error('Erreur lors du rendu de la page:', err);
      this.pageRendering = false;
      this.error = 'Erreur lors du rendu de la page';
    }
  }

  /**
   * Mise en file d'attente du rendu de page si une autre page est en cours de rendu
   */
  queueRenderPage(num: number) {
    if (this.pageRendering) {
      this.pageNumPending = num;
    } else {
      this.renderPage(num);
    }
  }

  /**
   * Affichage de la page précédente
   */
  prevPage() {
    if (this.pageNum <= 1) return;
    this.pageNum--;
    this.queueRenderPage(this.pageNum);
  }

  /**
   * Affichage de la page suivante
   */
  nextPage() {
    if (this.pageNum >= this.totalPages) return;
    this.pageNum++;
    this.queueRenderPage(this.pageNum);
  }

  /**
   * Zoom in: augmente l'échelle de 20%
   */
  zoomIn() {
    this.scale *= 1.2;
    this.queueRenderPage(this.pageNum);
  }

  /**
   * Zoom out: diminue l'échelle de 20%
   */
  zoomOut() {
    this.scale *= 0.8;
    this.queueRenderPage(this.pageNum);
  }

  /**
   * Aller à une page spécifique
   */
  goToPage(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;
    this.pageNum = pageNumber;
    this.queueRenderPage(this.pageNum);
  }
}