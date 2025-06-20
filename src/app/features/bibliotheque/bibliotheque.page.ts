import { Component, OnInit } from '@angular/core';
import { Book, Ouvrage, Tafsir } from './model/bibliotheque.model';
import { Router } from '@angular/router';
import { BooksService } from './services/books.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type BibliothequeType = 'tafsirs' | 'ouvrages' | 'ressources';

interface Ressource {
  id: number;
  title: string;
  description: string;
  speaker: string;
  duration: string;
  views: string;
  videoUrl: SafeResourceUrl;
  originalUrl: string;
}

@Component({
  selector: 'app-bibliotheque',
  templateUrl: './bibliotheque.page.html',
  styleUrls: ['./bibliotheque.page.scss'],
  standalone: false,
})
export class BibliothequePage implements OnInit {

  activeTab: BibliothequeType = 'tafsirs';
  
  // Données originales
  tafsirs: Tafsir[] = [];
  ouvrages: Ouvrage[] = [];
  books: Book[] = [];
  ressources: Ressource[] = [];
  
  // Données filtrées
  filteredTafsirs: Tafsir[] = [];
  filteredBooks: Book[] = [];
  filteredRessources: Ressource[] = [];
  
  // Termes de recherche
  tafsirSearchTerm: string = '';
  ouvrageSearchTerm: string = '';
  ressourceSearchTerm: string = '';

  constructor(
    private booksService: BooksService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  goToDetailOuvrage(bookId: number) {
    this.router.navigate(['tabs/bibliotheque/detail-ouvrage', bookId]);
  }

  goToTafsirDetail(tafsirId: number) {
    this.router.navigate(['bibliotheque/detail-tafsir', tafsirId]); 
  }

  playVideo(ressource: Ressource) {
    // Vous pouvez implémenter une modal ou naviguer vers une page de lecture vidéo
    console.log('Playing video:', ressource.title);
    // Exemple : ouvrir dans une nouvelle fenêtre
    // window.open(ressource.originalUrl, '_blank');
  }
  
  ngOnInit() {
    this.initializeData();
    this.resetFilters();
  }

  private initializeData() {
    this.books = this.booksService.getAllBooks();
    
    // Données simulées pour les tafsirs
    this.tafsirs = [
      {
        title: 'Les secrets de Al Fatiha',
        author: 'El Hadj Ibrahima Niass',
        ayahCount: 7,
        number: 22,
        id: 1
      },
      {
        title: 'Tafsir Sourate Al-Baqara',
        author: 'Cheikh Ahmadou Bamba',
        ayahCount: 286,
        number: 2,
        id: 2
      },
      {
        title: 'Interprétation de Sourate Al-Imran',
        author: 'Dr. Abdoulaye Wade',
        ayahCount: 200,
        number: 3,
        id: 3
      },
      {
        title: 'Les lumières du Coran',
        author: 'Imam Malik Sy',
        ayahCount: 114,
        number: 1,
        id: 4
      },
      {
        title: 'Méditations Coraniques',
        author: 'Serigne Touba',
        ayahCount: 50,
        number: 12,
        id: 5
      }
    ];
    
    // Données simulées pour les ouvrages
    this.ouvrages = [
      {
        title: 'La Voie Spirituelle',
        author: 'Cheikh Ahmadou Bamba',
        pageCount: 120,
        number: 15
      },
      {
        title: 'Les Dons de l\'Islam',
        author: 'Imam Al-Ghazali',
        pageCount: 245,
        number: 18
      },
      {
        title: 'Méditations Soufies',
        author: 'Ibrahim Niang',
        pageCount: 85,
        number: 12
      },
      {
        title: 'Le Coran expliqué',
        author: 'Amadou Kane',
        pageCount: 310,
        number: 24
      },
      {
        title: 'L\'Essence du Tawhid',
        author: 'Mamadou Sakho',
        pageCount: 175,
        number: 20
      }
    ];

    // Données simulées pour les ressources vidéo
    const videoData = [
      {
        id: 1,
        title: 'Les fondements de la foi islamique',
        description: 'Une conférence complète sur les piliers de l\'Islam et leur importance dans la vie quotidienne.',
        speaker: 'Dr. Ahmadou Mbacké',
        duration: '45:30',
        views: '12.5K',
        originalUrl: "https://www.youtube.com/embed/eazCuUiZD3A?si=Yo_A6nVuZP6Kf0Y_"
      },
      {
        id: 2,
        title: 'L\'histoire des prophètes',
        description: 'Récits authentiques sur la vie des prophètes mentionnés dans le Coran.',
        speaker: 'Cheikh Oumar Diagne',
        duration: '1:12:45',
        views: '25.8K',
        originalUrl: "https://www.youtube.com/embed/eazCuUiZD3A?si=Yo_A6nVuZP6Kf0Y_"
      },
      {
        id: 3,
        title: 'La prière en Islam : guide pratique',
        description: 'Comment bien accomplir la prière selon la tradition prophétique.',
        speaker: 'Imam Ibrahima Fall',
        duration: '28:15',
        views: '8.2K',
        originalUrl: "https://www.youtube.com/embed/eazCuUiZD3A?si=Yo_A6nVuZP6Kf0Y_"
      },
      {
        id: 4,
        title: 'Les bienfaits du jeûne de Ramadan',
        description: 'Les aspects spirituels et physiques du jeûne du mois de Ramadan.',
        speaker: 'Dr. Fatou Sow',
        duration: '52:20',
        views: '18.9K',
        originalUrl: "https://www.youtube.com/embed/eazCuUiZD3A?si=Yo_A6nVuZP6Kf0Y_"
      },
      {
        id: 5,
        title: 'La Zakat : purification des biens',
        description: 'Comprendre l\'obligation de la Zakat et ses modalités d\'application.',
        speaker: 'Cheikh Modou Kara',
        duration: '35:10',
        views: '7.1K',
        originalUrl: "https://www.youtube.com/embed/eazCuUiZD3A?si=Yo_A6nVuZP6Kf0Y_"
      },
      {
        id: 6,
        title: 'Le Hajj : voyage spirituel',
        description: 'Les étapes du pèlerinage à La Mecque et sa signification spirituelle.',
        speaker: 'Imam Serigne Ba',
        duration: '1:05:30',
        views: '22.4K',
        originalUrl: "https://www.youtube.com/embed/eazCuUiZD3A?si=Yo_A6nVuZP6Kf0Y_"
      }
    ];

    this.ressources = videoData.map(video => ({
      ...video,
      videoUrl: this.sanitizer.bypassSecurityTrustResourceUrl(video.originalUrl)
    }));
  }

  private resetFilters() {
    this.filteredTafsirs = [...this.tafsirs];
    this.filteredBooks = [...this.books];
    this.filteredRessources = [...this.ressources];
  }

  setActiveTab(tab: BibliothequeType) {
    this.activeTab = tab;
  }

  filterTafsirs() {
    const term = this.tafsirSearchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredTafsirs = [...this.tafsirs];
      return;
    }

    this.filteredTafsirs = this.tafsirs.filter(tafsir => 
      tafsir.title.toLowerCase().includes(term) ||
      tafsir.author.toLowerCase().includes(term)
    );
  }

  filterOuvrages() {
    const term = this.ouvrageSearchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredBooks = [...this.books];
      return;
    }

    this.filteredBooks = this.books.filter(book => 
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      (book.subtitle && book.subtitle.toLowerCase().includes(term))
    );
  }

  filterRessources() {
    const term = this.ressourceSearchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredRessources = [...this.ressources];
      return;
    }

    this.filteredRessources = this.ressources.filter(ressource => 
      ressource.title.toLowerCase().includes(term) ||
      ressource.description.toLowerCase().includes(term) ||
      ressource.speaker.toLowerCase().includes(term)
    );
  }
}