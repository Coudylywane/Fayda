import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ThemeMode } from './colors';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeMode>(this.getPreferredTheme());
  theme$ = this.themeSubject.asObservable();

  private getPreferredTheme(): ThemeMode {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  setTheme(mode: ThemeMode) {
    this.themeSubject.next(mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }

  toggleTheme() {
    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  get currentTheme(): ThemeMode {
    return this.themeSubject.value;
  }
}
