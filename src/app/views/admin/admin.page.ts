import { Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, EnvironmentInjector, Inject, inject, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';

import {
  Platform,
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonContent,
  IonList,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet, IonTitle } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  flag,
  key,
  mail,
  medical,
  location,
  bookmark,
  storefront,
  cash,
  personCircle,
  briefcase,
  wallet,
  list,
  grid,
  cube
} from 'ionicons/icons';

import { AdminToolBarComponent } from 'src/app/components/admin-interface/toolbar/admin-toolbar.component';
import { AdminRoutesList } from './admin.routes-list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { InfoStatusService } from 'src/app/services/utilities/infoStatus.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    IonTitle, 
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonContent,
    IonList,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    AdminToolBarComponent,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPage {
  routes = AdminRoutesList;
  
  public showDashboardSub = false;
  

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private platform: Platform,
    private environmentInjector: EnvironmentInjector,
  ) {
    // registra todos los íconos que usas (incluyendo "cube")
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
      grid,
      cube
    });

    // solo en browser, espera a que Ionic esté listo y arranca el keep-online
    if (isPlatformBrowser(this.platformId)) {
      this.platform.ready().then(() => {
        this.keepUserStatusOnline();
      });
    }
  }
// 3. Método para alternar el dashboard
  toggleDashboard() {
    this.showDashboardSub = !this.showDashboardSub;
  }
  goTo(route: string) {
    this.router.navigate([route]);
  }
  private keepUserStatusOnline() {
    runInInjectionContext(this.environmentInjector, () => {
      const infoStatus = inject(InfoStatusService);
      infoStatus.keepUserStatusOnline();
    });
  }

}
