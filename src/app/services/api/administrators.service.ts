import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Role, User, UserCreation, UserUpdateRequest } from 'src/interfaces/User.model';
import { DefaultHttpMessage } from 'src/interfaces/interface/DefaultHttpMessage.model';

@Injectable({
    providedIn: 'root',
})
export class AdminService {

    private _httpClient: HttpClient = inject(HttpClient);

    base = Role.ADMIN

    /**
     * Reserved for ADMIN users
     *
     */
    create(adminToCreate: UserCreation) {
        return this._httpClient.post<User>(`${this.base}`, adminToCreate)
    }
    
    /**
     * Reserved for ADMIN users
     *
     */
    update(uid: string, adminToUpdate: UserUpdateRequest) {
        return this._httpClient.put<User>(`${this.base}/${uid}`, adminToUpdate)
    }

    /**
     * Reserved for ADMIN users
     *
     */
    block(uid: string) {
        return this._httpClient.put<DefaultHttpMessage>(`${this.base}/${uid}/block`, {})
    }

    /**
     * Reserved for ADMIN users
     *
     */
    unblock(uid: string) {
        return this._httpClient.put<DefaultHttpMessage>(`${this.base}/${uid}/unblock`, {})
    }

    /**
     * Reserved for ADMIN users
     *
     */
    delete(uid: string) {
        return this._httpClient.delete<DefaultHttpMessage>(`${this.base}/${uid}`)
    }
}
