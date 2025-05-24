import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AdminUserAvatarComponent } from '../admin-user-avatar/admin-user-avatar.component';
import { IonMenuButton } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { menu } from "ionicons/icons";
@Component({
  selector: 'admin-toolbar',
  styleUrls: ['./admin-toolbar.component.scss'],
  templateUrl: './admin-toolbar.component.html',
  standalone: true,
  imports: [
    IonMenuButton,
    AdminUserAvatarComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminToolBarComponent {

  constructor() {
    addIcons({
      menu
    })
  }
}
