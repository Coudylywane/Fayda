import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectTheme } from 'src/app/store/theme.selectors';
import { Colors, ThemeMode, ColorKey } from 'src/app/theme/colors';
import { Location } from '@angular/common';

@Component({
  selector: 'app-base-layout',
  templateUrl: './base-layout.component.html',
  styleUrls: ['./base-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class BaseLayoutComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Page Title';
  @Input() showBackButton: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() headerClass: string = '';
  @Input() contentClass: string = '';
  @Input() footerClass: string = '';
  @Input() colorName: ColorKey = 'surface';
  @Input() lightColor?: ColorKey;
  @Input() darkColor?: ColorKey;

  backgroundClass = '';
  private themeSub?: Subscription;

  constructor(private store: Store, private location: Location) {}
  
  ngOnInit(): void {
    this.themeSub = this.store.select(selectTheme).subscribe(theme => {
      this.updateBackgroundClass(theme.theme);
    });
  }

  goBack() {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }

  private updateBackgroundClass(theme: ThemeMode) {
    console.log('Thème actuel:', Colors.dark[this.colorName!]);
    
    this.backgroundClass =
      theme === 'light'
        ? this.lightColor || (this.colorName ? Colors.light[this.colorName] : 'bg-transparent')
        : this.darkColor || (this.colorName ? Colors.dark[this.colorName] : 'bg-transparent');
  }
}

// Exemple d'utilisation dans une page
/**
<app-base-layout title="Accueil" [showBackButton]="false">
  <ion-button header-end>
    <ion-icon name="settings-outline"></ion-icon>
  </ion-button>
  
  <div>
    <!-- Contenu principal de la page -->
    <h1 class="text-2xl font-bold mb-4">Bienvenue sur notre application</h1>
    <p class="text-gray-600">Lorem ipsum dolor sit amet...</p>
  </div>
  
  <div footer>
    <p class="text-center text-sm text-gray-500">© 2025 Mon Application</p>
  </div>
</app-base-layout>
*/

/**
 * 2. TAB LAYOUT
 * =============
 * Un layout avec une barre d'onglets en bas pour la navigation principale.
 * Parfait pour les applications avec plusieurs sections principales.
 */
