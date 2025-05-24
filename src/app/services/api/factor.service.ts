import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DefaultHttpMessage, GETMultipleResponse } from 'src/interfaces/interface/DefaultHttpMessage.model';

import { Factor, FactorCreation } from 'src/interfaces/Factor.model';

@Injectable({
    providedIn: 'root',
})
export class FactorService {

    private _httpClient: HttpClient = inject(HttpClient);

    base = "factor"

    create(adminToCreate: FactorCreation) {
        return this._httpClient.post<Factor>(`${this.base}`, adminToCreate)
    }

    update(id: number, adminToUpdate: Partial<FactorCreation>) {
        return this._httpClient.put<Factor>(`${this.base}/${id}`, adminToUpdate)
    }

    delete(id: number) {
        return this._httpClient.delete<DefaultHttpMessage>(`${this.base}/${id}`)
    }

    get(
        column: keyof Factor,
        direction: 'asc' | 'desc',
        searchText: string,
        page: number,
        size: number,
        queries?: string
    ) {
        let url = `category?column=${column}&direction=${direction}&searchText=${searchText}&page=${page}&size=${size}${queries ? `&${queries}` : ''}`;
        return this._httpClient.get<GETMultipleResponse<Factor>>(url)
    }
}
