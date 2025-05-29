import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ProfilModalComponent } from '../profil-modal/profil-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'pages/home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  onClick() {
  }

  searchExpanded = false;
  searchQuery = '';
  title = 'Oeuvres et écrits';
  
  gamouItems = [
    {
      id: 1,
      title: 'Gamou',
      subtitle: 'Medina Baye 2024',
      date: '16 Octobre',
      image: 'assets/images/1.png'
    },
    {
      id: 2,
      title: 'Ziarra',
      subtitle: 'Gamou Médina',
      date: '20 Octobre',
      image: 'assets/images/1.png'
    },
    {
      id: 3,
      title: 'Daaka',
      subtitle: 'Médina Gounass',
      date: '25 Octobre',
      image: 'assets/images/1.png'
    }
  ];
  
  citationItems = [
    {
      id: 1,
      title: '"L\'Afrique aux africains.."',
      date: 'Avril 1975',
      content: 'Quiconque veut être juste, reconnaîtra les hommes pour le qu\'ils sont et insistera sur les bienfaits. Chaque religion compte des hommes qui font et inspire bien. C\'est ainsi, on retrouve un peu partout des prophètes, des sages, des savants et des dévots, dont l\'idéal est la vie droite et une vérité, un idéal et une loyauté.',
      image: 'assets/images/1.png'
    },
    {
      id: 2,
      title: '"L\'Afrique aux africains.."',
      date: 'Avril 1975',
      content: 'Quiconque veut être juste, reconnaîtra les hommes pour le qu\'ils sont et insistera sur les bienfaits. Chaque religion compte des hommes qui font et inspire bien. C\'est ainsi, on retrouve un peu partout des prophètes, des sages, des savants et des dévots, dont l\'idéal est la vie droite et une vérité, un idéal et une loyauté.',
      image: 'assets/images/1.png'
    },
    {
      id: 3,
      title: '"L\'Afrique aux africains.."',
      date: 'Avril 1975',
      content: 'Quiconque veut être juste, reconnaîtra les hommes pour le qu\'ils sont et insistera sur les bienfaits. Chaque religion compte des hommes qui font et inspire bien. C\'est ainsi, on retrouve un peu partout des prophètes, des sages, des savants et des dévots, dont l\'idéal est la vie droite et une vérité, un idéal et une loyauté.',
      image: 'assets/images/1.png'
    },
  ];

  constructor(private router: Router, private modalCtrl: ModalController) {}

  ngOnInit() {
  }

  toggleSearch() {
    this.searchExpanded = !this.searchExpanded;
    if (!this.searchExpanded) {
      this.searchQuery = '';
    }
  }

  navigateToDetail(id: number) {
    this.router.navigate(['/detail', id]);
  }

  navigateToCitation(id: number) {
    this.router.navigate(['/citation', id]);
  }

  async openUserProfileModal() {
      const modal = await this.modalCtrl.create({
        component: ProfilModalComponent,
        cssClass: 'profil-modal'
      });
      return await modal.present();
    }

  navigateTo(url: string){
    this.router.navigate([url]);
  }
}
