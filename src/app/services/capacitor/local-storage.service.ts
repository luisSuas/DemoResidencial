import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

export enum STORAGE_SETTINGS {
  "Prefers dark mode" = "prefersDarkMode",
}

export enum STORAGE_TUTORIAL_SETTINGS {
  "Menu Tutorial Seen" = "menuTutorialSeen",
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {

  isBrowser: boolean = true;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  setItem(key: string, value: string) {
    if (!this.isBrowser) return;
    return localStorage.setItem(key, value)
  }

  getItem(key: string): string | null {
    if (!this.isBrowser) return null;
    let result = localStorage.getItem(key)
    return result
  }

  setPrefersDarkMode(darkMode: boolean) {
    return this.setItem(STORAGE_SETTINGS['Prefers dark mode'], darkMode ? "true" : "false");
  }

  getPrefersDarkMode(): boolean | null {
    let darkMode = this.getItem(STORAGE_SETTINGS['Prefers dark mode']);
    if (darkMode === null) return null;
    return darkMode === "true" ? true : false;
  }

  removeAll() {
    let settings = Object.values(STORAGE_SETTINGS)
    for (const i in settings) {
      const setting = settings[i];
      try {
        localStorage.removeItem(setting);
      } catch (error) {
        console.log("error deleting")
      }
    }

  }


}
