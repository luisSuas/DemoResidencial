import { Component, inject, NgZone } from '@angular/core';
import {
  NavController,
  IonApp, IonRouterOutlet, Platform
} from '@ionic/angular/standalone';

import { App, URLOpenListenerEvent } from '@capacitor/app';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

  private platform = inject(Platform);
  private nav = inject(NavController);
  private zone = inject(NgZone);

  constructor() {

    this.platform.ready().then(() => {
      addIcons({
        add
      })
      if (this.platform.is("capacitor")) {
        App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
          this.zone.run(() => {
            console.log('App opened with URL: ' + event.url);
            var slug = event.url.split(".app").pop();
            console.log(slug);
            if (slug) {
              this.nav.navigateForward(slug);
            }
            // If no match, do nothing - let regular routing
            // logic take over
          });
        });
      };
    });

  }
}
