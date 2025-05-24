import { ChangeDetectionStrategy, Component, EnvironmentInjector, Inject, inject, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import {
  Platform,
  IonContent,
  IonMenuToggle,
  IonMenu, IonHeader, IonToolbar, IonRouterOutlet, IonSplitPane, IonIcon, IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  flag, key, mail, medical,
  location,
  bookmark,
  storefront,
  cash,
  personCircle,
  briefcase,
  wallet,
  list,
  grid
} from 'ionicons/icons';
import { AdminToolBarComponent } from 'src/app/components/admin-interface/toolbar/admin-toolbar.component';

import { AdminRoutesList } from './admin.routes-list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { InfoStatusService } from 'src/app/services/utilities/infoStatus.service';



@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonLabel, IonItem, IonList,
    IonMenuToggle,
    AdminToolBarComponent,
    IonIcon, IonSplitPane, IonMenu, IonRouterOutlet, IonContent, IonHeader, IonToolbar,
    RouterLink, RouterLinkActive
  ]
})
export class AdminPage {

  private environmentInjector = inject(EnvironmentInjector);
  private platform = inject(Platform);

  routes = AdminRoutesList;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    addIcons({
      mail,
      medical,
      flag,
      storefront,
      key,
      location,
      bookmark,
      cash,
      personCircle,
      briefcase,
      wallet,
      list,
      grid
    })

    if (isPlatformBrowser(this.platformId)) {
      this.platform.ready().then(() => {
        this.keepUserStatusOnline();
      });
    }
  }


  keepUserStatusOnline() {
    runInInjectionContext(this.environmentInjector, () => {
      let infoStatusService = inject(InfoStatusService);
      infoStatusService.keepUserStatusOnline();
    });
  }

}
