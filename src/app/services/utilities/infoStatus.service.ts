import { Injectable, inject } from "@angular/core";
import { Auth } from "@angular/fire/auth";

import { Database, ref, serverTimestamp, onValue, onDisconnect, set, DatabaseReference } from '@angular/fire/database';

@Injectable({
    providedIn: 'root'
})
export class InfoStatusService {

    private database = inject(Database);
    private auth: Auth = inject(Auth);

    private userStatusDatabaseRef: DatabaseReference | null = null;

    private isOfflineForDatabase = {
        state: 'offline',
        last_changed: serverTimestamp(),
    };

    private isOnlineForDatabase = {
        state: 'online',
        last_changed: serverTimestamp(),
    };

    keepUserStatusOnline() {
        this.auth.onAuthStateChanged(user => {
            var uid = user?.uid;
            if (!uid) return;
            // Create a reference to this user's specific status node.
            // This is where we will store data about being online/offline.
            this.userStatusDatabaseRef = ref(this.database, '/status/' + uid);

            // Create a reference to the special '.info/connected' path in
            // Realtime Database. This path returns `true` when connected
            // and `false` when disconnected.
            let refInfo = ref(this.database, '.info/connected')
            onValue(refInfo, (snapshot) => {
                // If we're not currently connected, don't do anything.
                if (snapshot.val() == false) {
                    return;
                };
                if (this.userStatusDatabaseRef)
                    onDisconnect(this.userStatusDatabaseRef).set(this.isOfflineForDatabase).then(() => {
                        if (this.userStatusDatabaseRef)
                            set(this.userStatusDatabaseRef, this.isOnlineForDatabase);
                    });
            })
        });
    }

    userStatusOffline() {
        if (this.userStatusDatabaseRef) {
            var isOfflineForDatabase = {
                state: 'offline',
                last_changed: serverTimestamp(),
            };
            set(this.userStatusDatabaseRef, isOfflineForDatabase);
            this.userStatusDatabaseRef = null;
        }
    }
}
