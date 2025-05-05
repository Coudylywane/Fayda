import { Component, OnInit } from '@angular/core';
import { Ouvrage, Tafsir } from './model/bibliotheque.model';

@Component({
  selector: 'app-bibliotheque',
  templateUrl: './bibliotheque.page.html',
  styleUrls: ['./bibliotheque.page.scss'],
  standalone: false,
})
export class BibliothequePage implements OnInit {

  activeTab: 'tafsirs' | 'ouvrages' = 'tafsirs';
  tafsirs: Tafsir[] = [];
  ouvrages: Ouvrage[] = [];

  constructor() {}

  ngOnInit() {
    // Données simulées pour les tafsirs
    this.tafsirs = [
      {
        title: 'Les secrets de Al Fatiha',
        author: 'El Hadj Ibrahima Niass',
        ayahCount: 7,
        number: 22
      },
      {
        title: 'Les secrets de Al Fatiha',
        author: 'El Hadj Ibrahima Niass',
        ayahCount: 7,
        number: 22
      },
      {
        title: 'Les secrets de Al Fatiha',
        author: 'El Hadj Ibrahima Niass',
        ayahCount: 7,
        number: 22
      },
      {
        title: 'Les secrets de Al Fatiha',
        author: 'El Hadj Ibrahima Niass',
        ayahCount: 7,
        number: 22
      },
      {
        title: 'Les secrets de Al Fatiha',
        author: 'El Hadj Ibrahima Niass',
        ayahCount: 7,
        number: 22
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
  }

  setActiveTab(tab: 'tafsirs' | 'ouvrages') {
    this.activeTab = tab;
  }

}
