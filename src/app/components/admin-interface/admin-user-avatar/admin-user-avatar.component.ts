import { AsyncPipe } from "@angular/common";
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from "@angular/core";
import { Auth, user, } from "@angular/fire/auth";

import {
    IonSpinner,
    IonChip, IonAvatar, IonLabel
} from "@ionic/angular/standalone";

import { toSignal } from '@angular/core/rxjs-interop';

import { UserActionsComponent } from "../user-actions/user-actions.component";

@Component({
    selector: 'admin-user-avatar',
    templateUrl: './admin-user-avatar.component.html',
    standalone: true,
    imports: [
        AsyncPipe,
        IonChip, IonAvatar, IonLabel,
        IonSpinner,
        UserActionsComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUserAvatarComponent implements AfterViewInit {
    private auth: Auth = inject(Auth);
    user$ = user(this.auth);
    user = toSignal(this.user$);

    displayImage = computed(() => {
        let user = this.user();
        return `https://ui-avatars.com/api/?background=444&color=fff&name=${user?.email || user?.displayName || 'User'}`
    })

    openUserActions = signal<boolean>(false);

    ngAfterViewInit() {
        this.user$.subscribe(async user => {
            console.log(await user?.getIdTokenResult())
        })
    }
}
