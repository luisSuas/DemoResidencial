import { ChangeDetectionStrategy, Component, EnvironmentInjector, inject, model, runInInjectionContext } from '@angular/core';

import { IonPopover, IonContent, IonList, IonItem } from "@ionic/angular/standalone";

import { AuthService } from 'src/app/services/auth.service';
import { InfoStatusService } from 'src/app/services/utilities/infoStatus.service';
@Component({
    selector: 'user-actions',
    templateUrl: './user-actions.component.html',
    standalone: true,
    imports: [
        IonItem, IonList, IonContent,
        IonPopover
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserActionsComponent {

    private authService = inject(AuthService);
    private environmentInjector = inject(EnvironmentInjector);

    isOpen = model<boolean>(false);

    logout() {
        this.authService.logout();
        runInInjectionContext(this.environmentInjector, () => {
            let infoStatusService = inject(InfoStatusService);
            infoStatusService.userStatusOffline();
        });
    }
}
