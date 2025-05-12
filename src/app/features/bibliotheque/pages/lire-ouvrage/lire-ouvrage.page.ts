import { Component, OnInit } from '@angular/core';
import { PdfService } from '../../services/pdf-viewer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Book } from '../../model/bibliotheque.model';
import { BooksService } from '../../services/books.service';
import { TabsService } from 'src/app/features/tabs/services/tabs.service';

@Component({
  selector: 'app-lire-ouvrage',
  templateUrl: './lire-ouvrage.page.html',
  styleUrls: ['./lire-ouvrage.page.scss'],
  standalone: false
})
export class LireOuvragePage implements OnInit {

  pdfUrl!: string;
  isLoading: boolean = true;
  error: string | null = null;
  book: Book | undefined;

  constructor(private pdfService: PdfService,
    private route: ActivatedRoute,
    private router: Router,
    private booksService: BooksService,
    private navigationService: TabsService, ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.book = this.booksService.getBookById(+id);
      if (this.book) {
        // Dans une application réelle, ceci serait le chemin vers le fichier PDF
        this.pdfUrl = `http://localhost:4200/assets/books/1.pdf`;
      }
    }

    this.loadDocument();
  }

  goBack() {
    this.router.navigate(['tabs/bibliotheque/detail-ouvrage', this.book?.id]);
    this.navigationService.setActiveTabWithoutNavigation('bibliotheque');
  }

  async loadDocument() {
    this.isLoading = true;
    this.error = null;

    try {
      
      //  Précharger les premières pages pour une expérience plus fluide
      const pdfData = await this.pdfService.loadPdf(this.pdfUrl).toPromise();
      await this.pdfService.preloadPdfPages(pdfData!, 1, 5); // Précharge les 5 premières pages
      
      this.isLoading = false;
    } catch (err) {
      console.error('Erreur lors du chargement du document:', err);
      this.error = 'Impossible de charger le document';
      this.isLoading = false;
    }
  }

}
