import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Role, User, UserCreation, UserUpdateRequest } from 'src/interfaces/User.model';
import { DefaultHttpMessage } from 'src/interfaces/interface/DefaultHttpMessage.model';

@Injectable({
    providedIn: 'root',
})
export class PaymentService {

    private _httpClient: HttpClient = inject(HttpClient);

    base = "payment"

    create(adminToCreate: UserCreation) {
        return this._httpClient.post<User>(`${this.base}`, adminToCreate)
    }

    update(uid: string, adminToUpdate: UserUpdateRequest) {
        return this._httpClient.put<User>(`${this.base}/${uid}`, adminToUpdate)
    }

    block(uid: string) {
        return this._httpClient.put<DefaultHttpMessage>(`${this.base}/${uid}/block`, {})
    }

    unblock(uid: string) {
        return this._httpClient.put<DefaultHttpMessage>(`${this.base}/${uid}/unblock`, {})
    }

    delete(uid: string) {
        return this._httpClient.delete<DefaultHttpMessage>(`${this.base}/${uid}`)
    }
}
