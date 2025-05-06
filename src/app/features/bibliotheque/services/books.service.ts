// Fichier: services/books.service.ts
import { Injectable } from '@angular/core';
import { Book } from '../model/bibliotheque.model';

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  private books: Book[] = [
    {
      id: 1,
      title: "Premier Voyage À la Mecque",
      subtitle: "Ar-Rihlatoul Hidjaziyatoul oûla",
      author: "C.A.I El Hadji Ibrahima Niass",
      translator: "Traduit de l'arabe par Lassar Khar Ba & Oumar Diattara",
      coverImage: "assets/covers/cover-1.jpg",
      reads: 1230,
      pages: 325,
      language: "Fr",
      description: "Quiconque veut être juste, reconnaîtra les hommes par la vérité et non la vérité par les hommes\". Chaque religion compte des hommes parfaits et imparfaits. Si en Islam, on relève des imperfections chez certains musulmans, cela se traduit par un écart de la voie droite et une iniquité, un abus et une injustice"
    },
    {
      id: 2,
      title: "Taysiroul Woussoul ila Hadrati Rasoul",
      subtitle: "La Facilitation d'Ascension à l'Enceinte du Messager",
      author: "Cheikh Al Islam El Hadj Ibrahim NIASS",
      coverImage: "assets/covers/cover-2.jpg",
      reads: 876,
      pages: 218,
      language: "Fr",
      description: "Une œuvre majeure sur le parcours spirituel et l'élévation du croyant dans sa quête d'ascension spirituelle."
    },
    {
      id: 3,
      title: "THE REMOVAL OF CONFUSION",
      subtitle: "Concerning the Flood of the Saintly Seal of Shaykh Ibrahim",
      author: "Khalifat-ul-Khatm | of Shaykh Ahmad Al-Tijani",
      coverImage: "assets/covers/cover-3.jpg",
      reads: 542,
      pages: 150,
      language: "En",
      description: "An important work addressing spiritual confusion and providing clarity about the teachings of Shaykh Ibrahim."
    },
    {
      id: 4,
      title: "البيان والتبيين",
      subtitle: "من العلماء المحققين",
      author: "Ibrahim Niass",
      coverImage: "assets/covers/cover-2.jpg",
      reads: 980,
      pages: 275,
      language: "Ar",
      description: "كتاب يتناول قضايا العقيدة والفقه بصورة مفصلة، ويقدم إرشادات روحية مهمة للمريدين."
    },
    {
      id: 5,
      title: "Premier Voyage À la Mecque",
      subtitle: "Ar-Rihlatoul Hidjaziyatoul oûla",
      author: "C.A.I El Hadji Ibrahima Niass",
      translator: "Traduit de l'arabe par Lassar Khar Ba & Oumar Diattara",
      coverImage: "assets/covers/cover-1.jpg",
      reads: 1230,
      pages: 325,
      language: "Fr",
      description: "Quiconque veut être juste, reconnaîtra les hommes par la vérité et non la vérité par les hommes\". Chaque religion compte des hommes parfaits et imparfaits. Si en Islam, on relève des imperfections chez certains musulmans, cela se traduit par un écart de la voie droite et une iniquité, un abus et une injustice"
    },
    {
      id: 6,
      title: "Taysiroul Woussoul ila Hadrati Rasoul",
      subtitle: "La Facilitation d'Ascension à l'Enceinte du Messager",
      author: "Cheikh Al Islam El Hadj Ibrahim NIASS",
      coverImage: "assets/covers/cover-3.jpg",
      reads: 876,
      pages: 218,
      language: "Fr",
      description: "Une œuvre majeure sur le parcours spirituel et l'élévation du croyant dans sa quête d'ascension spirituelle."
    },
    {
      id: 7,
      title: "THE REMOVAL OF CONFUSION",
      subtitle: "Concerning the Flood of the Saintly Seal of Shaykh Ibrahim",
      author: "Khalifat-ul-Khatm | of Shaykh Ahmad Al-Tijani",
      coverImage: "assets/covers/cover-1.jpg",
      reads: 542,
      pages: 150,
      language: "En",
      description: "An important work addressing spiritual confusion and providing clarity about the teachings of Shaykh Ibrahim."
    },
    {
      id: 8,
      title: "البيان والتبيين",
      subtitle: "من العلماء المحققين",
      author: "Ibrahim Niass",
      coverImage: "assets/covers/cover-3.jpg",
      reads: 980,
      pages: 275,
      language: "Ar",
      description: "كتاب يتناول قضايا العقيدة والفقه بصورة مفصلة، ويقدم إرشادات روحية مهمة للمريدين."
    }
  ];

  constructor() { }

  getAllBooks(): Book[] {
    return this.books;
  }

  getBookById(id: number): Book | undefined {
    return this.books.find(book => book.id === id);
  }
}