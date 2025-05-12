import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TabsService } from 'src/app/features/tabs/services/tabs.service';

@Component({
  selector: 'app-detail-tafsir',
  templateUrl: './detail-tafsir.page.html',
  styleUrls: ['./detail-tafsir.page.scss'],
  standalone: false
})
export class DetailTafsirPage implements OnInit {

  surah = {
    id: 1,
    name: 'Al-Fatiha',
    nameArabic: 'الفَاتِحَة',
    verses: [
      {
        number: 1,
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux'
      },
      {
        number: 2,
        arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        translation: 'Louange à Allah, Seigneur de l\'univers'
      },
      {
        number: 3,
        arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'Le Tout Miséricordieux, le Très Miséricordieux'
      },
      {
        number: 4,
        arabic: 'مَالِكِ يَوْمِ الدِّينِ',
        translation: 'Maître du Jour de la rétribution'
      },
      {
        number: 5,
        arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        translation: 'C\'est Toi [Seul] que nous adorons, et c\'est Toi [Seul] dont nous implorons secours'
      },
      {
        number: 6,
        arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        translation: 'Guide-nous dans le droit chemin'
      },
      {
        number: 7,
        arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        translation: 'Le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés'
      }
    ],
    description: [
      'Cette Sourate est appelée Al-Fatiha, c\'est-à-dire l\'Ouverture du Livre, la Sourate par laquelle les prières commencent.',
      'Elle est aussi appelée Umm Al-Kitab (la Mère du Livre), selon la majorité des savants.',
      'Dans un hadith authentique rapporté par At-Tirmidhi, classé comme Sahih, Abu Hurairah a rapporté que le Messager d\'Allah ﷺ a dit:',
      'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ أُمُّ الْقُرْآنِ وَأُمُّ الْكِتَابِ وَالسَّبْعُ الْمَثَانِي وَالْقُرْآنُ الْعَظِيمُ',
      'Al-Hamdu lillahi Rabbil-\'Alamin est la Mère du Coran, la Mère du Livre, et les sept versets répétés du Glorieux Coran. Elle est aussi appelée Al-Hamd et As-Salah, parce que le Prophète ﷺ a dit que son Seigneur a dit:',
      'قَسَمْتُ الصَّلَاةَ بَيْنِي وَبَيْنَ عَبْدِي نِصْفَيْنِ فَإِذَا قَالَ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، قَالَ اللَّهُ: حَمِدَنِي عَبْدِي',
      'La prière (c\'est-à-dire Al-Fatiha) est divisée en deux moitiés entre Moi et Mon serviteur. Quand le serviteur dit: "Toute louange est due à Allah, le Seigneur de l\'existence", Allah dit: "Mon serviteur M\'a loué."'
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private navigationService: TabsService,
  ) { }

  ngOnInit() {
    // récupéreration de l'ID de la sourate depuis les paramètres de route
    const id = this.route.snapshot.paramMap.get('id');
    //charger les données en conséquence
    if (id) {
      // Ici, vous pouvez charger les données de la sourate depuis un service ou une API
      // Par exemple : this.surah = this.surahService.getSurahById(id);
    }
  }

  goBack() {
    this.navigationService.setActiveTabWithoutNavigation('bibliotheque');
    this.navCtrl.back();
  }
}
