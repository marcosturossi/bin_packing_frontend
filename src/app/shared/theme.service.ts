import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storageKey = 'theme';

  init() {
    const saved = localStorage.getItem(this.storageKey);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = saved ? saved === 'dark' : prefersDark;
    this.setDark(shouldDark);
  }

  isDark(): boolean {
    return document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
  }

  toggle() {
    this.setDark(!this.isDark());
  }

  setDark(enable: boolean) {
    const el = document.documentElement;
    if (enable) {
      el.classList.add('dark');
      localStorage.setItem(this.storageKey, 'dark');
    } else {
      el.classList.remove('dark');
      localStorage.setItem(this.storageKey, 'light');
    }
  }
}
