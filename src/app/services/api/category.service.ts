import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Role, User, UserCreation, UserUpdateRequest } from 'src/interfaces/User.model';
import { DefaultHttpMessage, GETMultipleResponse } from 'src/interfaces/interface/DefaultHttpMessage.model';

import { Category, CategoryCreation } from 'src/interfaces/Category.model';

@Injectable({
    providedIn: 'root',
})
export class CategoryService {

    private _httpClient: HttpClient = inject(HttpClient);

    base = "category"

    create(adminToCreate: CategoryCreation) {
        return this._httpClient.post<Category>(`${this.base}`, adminToCreate)
    }

    update(id: number, adminToUpdate: Partial<CategoryCreation>) {
        return this._httpClient.put<Category>(`${this.base}/${id}`, adminToUpdate)
    }

    delete(id: number) {
        return this._httpClient.delete<DefaultHttpMessage>(`${this.base}/${id}`)
    }

    get(
        column: keyof Category,
        direction: 'asc' | 'desc',
        searchText: string,
        page: number,
        size: number,
        queries?: string
    ) {
        let url = `category?column=${column}&direction=${direction}&searchText=${searchText}&page=${page}&size=${size}${queries ? `&${queries}` : ''}`;
        return this._httpClient.get<GETMultipleResponse<Category>>(url)
    }
}
