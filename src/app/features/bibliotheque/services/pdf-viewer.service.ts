// pdf.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import * as pdfjsLib from 'pdfjs-dist';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private pdfCache = new Map<string, Uint8Array>();
  
  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {
    this.initStorage();
  }

  private async initStorage() {
    await this.storage.create();
  }

  /**
   * Charge un PDF depuis une URL ou depuis le cache
   */
  loadPdf(url: string): Observable<ArrayBuffer> {
    // Vérifier si le PDF est dans le cache mémoire
    if (this.pdfCache.has(url)) {
      return of(this.pdfCache.get(url)!.buffer);
    }
    
    // Essayer de récupérer depuis le stockage local
    return from(this.getFromStorage(url)).pipe(
      catchError(() => {
        // Si échec du stockage local, charger depuis l'URL
        return this.fetchPdf(url);
      })
    );
  }

  /**
   * Récupère le PDF depuis le stockage local
   */
  private async getFromStorage(url: string): Promise<ArrayBuffer> {
    const cacheKey = `pdf_${this.hashUrl(url)}`;
    const cachedData = await this.storage.get(cacheKey);
    
    if (cachedData) {
      // Convertir les données stockées en Uint8Array
      const data = new Uint8Array(Object.values(cachedData));
      this.pdfCache.set(url, data);
      return data.buffer;
    }
    
    // Si pas dans le stockage, lancer une erreur pour passer au fetchPdf
    throw new Error('PDF not in storage');
  }

  /**
   * Télécharge le PDF depuis l'URL et le met en cache
   */
  private fetchPdf(url: string): Observable<ArrayBuffer> {
    return this.http.get(url, { responseType: 'arraybuffer' }).pipe(
      tap(data => {
        // Mettre en cache en mémoire
        const uint8Array = new Uint8Array(data);
        this.pdfCache.set(url, uint8Array);
        
        // Mettre en cache dans le stockage local
        const cacheKey = `pdf_${this.hashUrl(url)}`;
        this.storage.set(cacheKey, Object.assign({}, uint8Array));
      })
    );
  }

  /**
   * Précharge les pages du PDF pour un affichage plus rapide
   */
  preloadPdfPages(pdfData: ArrayBuffer, startPage: number, endPage: number): Promise<void> {
    return new Promise(async (resolve) => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        
        // Limiter la fin de page au nombre total de pages
        const maxPage = Math.min(endPage, pdf.numPages);
        
        // Précharger les pages demandées
        for (let i = startPage; i <= maxPage; i++) {
          // Récupérer la page sans la rendre
          await pdf.getPage(i);
        }
        
        resolve();
      } catch (err) {
        console.error('Erreur lors du préchargement des pages:', err);
        resolve();
      }
    });
  }

  /**
   * Génère un hash simple pour la clé de cache
   */
  private hashUrl(url: string): string {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en entier 32 bits
    }
    return hash.toString(36);
  }

  /**
   * Récupère les métadonnées du PDF
   */
  async getPdfMetadata(url: string): Promise<any> {
    try {
      const data = await this.loadPdf(url).toPromise();
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const metadata = await pdf.getMetadata();
      
      return {
        pageCount: pdf.numPages,
        metadata: metadata.info
      };
    } catch (err) {
      console.error('Erreur lors de la récupération des métadonnées:', err);
      throw err;
    }
  }
}