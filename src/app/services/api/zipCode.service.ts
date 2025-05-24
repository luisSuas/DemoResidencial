import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Role, User, UserCreation, UserUpdateRequest } from 'src/interfaces/User.model';
import { DefaultHttpMessage, GETMultipleResponse } from 'src/interfaces/interface/DefaultHttpMessage.model';
import { EmailTemplate, EmailTemplateCreation } from 'src/interfaces/EmailTemplate.model';
import { ZipCode, ZipCodeCreation } from 'src/interfaces/ZipCode.model';

@Injectable({
    providedIn: 'root',
})
export class ZipCodeService {

    private _httpClient: HttpClient = inject(HttpClient);

    base = "zipcode"

    create(adminToCreate: ZipCodeCreation) {
        return this._httpClient.post<ZipCode>(`${this.base}`, adminToCreate)
    }

    update(code: string, adminToUpdate: Partial<ZipCodeCreation>) {
        return this._httpClient.put<ZipCode>(`${this.base}/${code}`, adminToUpdate)
    }

    delete(code: string) {
        return this._httpClient.delete<DefaultHttpMessage>(`${this.base}/${code}`)
    }


    get(
        column: keyof ZipCode,
        direction: 'asc' | 'desc',
        searchText: string,
        page: number,
        size: number,
        queries?: string
    ) {
        let url = `${this.base}?column=${column}&direction=${direction}&searchText=${searchText}&page=${page}&size=${size}${queries ? `&${queries}` : ''}`;
        return this._httpClient.get<GETMultipleResponse<ZipCode>>(url)
    }
}
