import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, catchError, defer, from, lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertsService } from './services/utilities/alerts.service';

export declare class HttpError extends Error {
    httpCode: number;
    constructor(httpCode: number, message?: string);
}

@Injectable()
export class SetDomainInterceptor implements HttpInterceptor {

    private auth = inject(Auth);

    intercept(httpRequest: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return defer(async () => {
            let user = this.auth.currentUser, token = "";
            if (user) {
                token = await user.getIdToken();
            }
            console.log(environment.API)
            const requestStructureUpdated: HttpRequest<any> = httpRequest
                .clone({
                    url: `${environment.API}/${httpRequest.url}`,
                    setHeaders: {
                        'Content-Type': 'application/json',
                        'authorization': token
                    }
                });

            return lastValueFrom(next.handle(requestStructureUpdated));
        });
    }
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    private alertService: AlertsService = inject(AlertsService);

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                this.alertService.defaultErrorAlert(error.error.message || "Error desconocido")
                return EMPTY;
            })
        )

    }

}