import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectTheme } from 'src/app/store/theme.selectors';
import { Subscription } from 'rxjs';
import { ColorKey, getColorClass, ThemeMode } from 'src/app/theme/colors';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { getRadiusClass, RadiusKey } from 'src/app/theme/radius';
import { FontSizeKey, FontWeightKey, getFontClass } from 'src/app/theme/typography';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  imports: [IonicModule, CommonModule],
})
export class ButtonComponent implements OnInit, OnDestroy {
  @Input() value: string = '';
  @Input() colorName: ColorKey = 'primary';
  @Input() textColorName?: ColorKey;
  @Input() borderColorName?: ColorKey;
  @Input() backgroundColorName?: ColorKey;
  @Input() backgroundColorLight?: ColorKey;
  @Input() backgroundColorDark?: ColorKey;
  @Input() leftIcon?: any;
  @Input() rightIcon?: any;
  @Input() defaultIcon?: any;
  @Input() isLoading = false;
  @Input() rounded?: RadiusKey;
  @Input() fontSize?: FontSizeKey;
  @Input() fontWeight?: FontWeightKey;  
  @Input() customClass?: string;

  theme: ThemeMode = 'light';
  private themeSub?: Subscription;

  constructor(private store: Store) {}

  ngOnInit() {
    this.themeSub = this.store.select(selectTheme).subscribe(theme => {
      this.theme = theme.theme;
    });
  }

  ngOnDestroy() {
    this.themeSub?.unsubscribe();
  }

  get backgroundColor(): string {
    if (this.theme === 'light' && this.backgroundColorLight) return getColorClass(this.theme, this.backgroundColorLight);
    if (this.theme === 'dark' && this.backgroundColorDark) return getColorClass(this.theme, this.backgroundColorDark);
    console.log('Background color:', getColorClass(this.theme, this.backgroundColorName!));
    
    return getColorClass(this.theme, this.backgroundColorName!);
  }

  get textColor(): string {
    // if (this.textColorName) {
    // console.log(getColorClass(this.theme, this.textColorName!)!.replace('bg-', 'text-'));
    
      return getColorClass(this.theme, this.textColorName!)!.replace('bg-', 'text-');
  // }
    // Default to inverse text color (white on dark bg, dark on light bg)
    // return this.colorName === 'background' || this.colorName === 'surface' 
    //   ? getColorClass(this.theme, 'text') 
    //   : getColorClass(this.theme, 'inverseText');
  }

  get font(): string {
    return getFontClass(this.fontSize, this.fontWeight);
  }

  get radius(): string {
    return getRadiusClass(this.rounded!);
  }
}
