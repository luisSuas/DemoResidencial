import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmailTemplate, EmailTemplateCreation } from 'src/interfaces/EmailTemplate.model';

@Injectable({
    providedIn: 'root',
})
export class EmailTemplateService {

    private _httpClient: HttpClient = inject(HttpClient);

    base = "emailtemplate"

    create(adminToCreate: EmailTemplateCreation) {
        return this._httpClient.post<EmailTemplate>(`${this.base}`, adminToCreate)
    }

    update(code: string, adminToUpdate: Partial<EmailTemplateCreation>) {
        return this._httpClient.put<EmailTemplate>(`${this.base}/${code}`, adminToUpdate)
    }

}
