import { Injectable, inject } from "@angular/core";
import { FirebaseError } from "@angular/fire/app";
import { Auth, signInWithCustomToken, signInWithEmailAndPassword, signOut } from "@angular/fire/auth";
import { browserLocalPersistence, browserSessionPersistence, inMemoryPersistence, setPersistence, UserCredential } from "firebase/auth";
import { NavController } from "@ionic/angular/standalone";
import { ErrorAuthMessageService } from "./errorAuthMessages";
import { AlertsService } from "./utilities/alerts.service";
import { Role } from "src/interfaces/User.model";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private errorAuthMessageService: ErrorAuthMessageService = inject(ErrorAuthMessageService);

    private auth: Auth = inject(Auth);
    private alertsService: AlertsService = inject(AlertsService);
    private nav = inject(NavController);

    async getUseRole(user: UserCredential): Promise<Role | null> {
        let token = await user.user.getIdTokenResult()
        console.log(token.claims)
        return token.claims["role"] as Role || null;
    }

    async signInWithEmailAndPassword(email: string, password: string): Promise<Role | null> {
        try {
            await this.setPersistence("LOCAL")
            console.log("Persistence set to LOCAL");
            let user = await signInWithEmailAndPassword(this.auth, email, password);
            return await this.getUseRole(user);
        } catch (error: any) {
            console.error(error?.code);
            if (error instanceof FirebaseError) {
                let errorMessage = error instanceof FirebaseError && error.code
                    ? this.errorAuthMessageService.errorAuth(error)
                    : "Intenta de nuevo más tarde";
                this.alertsService.displayError(errorMessage)
            }
        }
        return null;
    }

    async signInWithCustomToken(token: string): Promise<Role | null> {
        try {
            await this.setPersistence("LOCAL");
            let user = await signInWithCustomToken(this.auth, token)
            return this.getUseRole(user);
        } catch (error: any) {
            console.error(error?.code);
            if (error instanceof FirebaseError) {
                let errorMessage = error instanceof FirebaseError && error.code
                    ? this.errorAuthMessageService.errorAuth(error)
                    : "Intenta de nuevo más tarde";
                this.alertsService.displayError(errorMessage)
            }
        }
        return null;
    }

    async actualUser() {
        return this.auth.currentUser;
    }

    async actualRole(): Promise<Role | null> {
        let user = this.auth.currentUser;
        if (user) {
            let token = await user.getIdTokenResult()
            console.log(token.claims)
            return token.claims["role"] as Role || null;
        }
        return null;
    }

    setPersistence(persistence: "SESSION" | "LOCAL" | "NONE"): Promise<void> {
        switch (persistence) {
            case "SESSION":
                return setPersistence(this.auth, browserSessionPersistence);
            case "LOCAL":
                return setPersistence(this.auth, browserLocalPersistence);
            default:
                return setPersistence(this.auth, inMemoryPersistence);
        }
    }


    async logout() {
        try {
            await signOut(this.auth);
            this.nav.navigateRoot('/login')
        } catch (error) {
            this.alertsService.displayError(error)
        }
    }
}
