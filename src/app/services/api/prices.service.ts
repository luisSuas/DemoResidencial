import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Price } from 'src/interfaces/Price.model';

@Injectable({
    providedIn: 'root',
})
export class PriceService {

    private _httpClient: HttpClient = inject(HttpClient);

    base = "price"

    createUpdate(adminToCreate: Price) {
        return this._httpClient.post<Price>(`${this.base}`, adminToCreate)
    }

    getAll(
        categories: number[],
        zipCodes: string[],
    ) {
        return this._httpClient.post<Price[]>(`${this.base}/get`, {
            categories,
            zipCodes
        })
    }

}
