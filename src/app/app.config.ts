import { ApplicationConfig, provideExperimentalZonelessChangeDetection, provideZoneChangeDetection } from '@angular/core';

import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { RouteReuseStrategy, provideRouter, withComponentInputBinding } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';

import { ErrorInterceptor, SetDomainInterceptor } from './interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
// import { provideClientHydration } from '@angular/platform-browser';


import { provideDatabase, getDatabase } from '@angular/fire/database';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideStorage } from '@angular/fire/storage';
import { getStorage } from 'firebase/storage';


export const appConfig: ApplicationConfig = {
    providers: [

        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

        provideHttpClient(withFetch(), withInterceptorsFromDi()),
        provideIonicAngular({
            mode: 'ios'
        }), {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: SetDomainInterceptor,
            multi: true,
        },
        provideAnimations(),
        provideRouter(routes, withComponentInputBinding()),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideFirebaseApp(() => initializeApp({
            apiKey: "AIzaSyDOk2P4G3F3eCBMPMQcpPAWpm6J8DeH6Xw",
            authDomain: "xjobs-app.firebaseapp.com",
            projectId: "xjobs-app",
            storageBucket: "xjobs-app.appspot.com",
            messagingSenderId: "445800764648",
            appId: "1:445800764648:web:1e8493d6b910fd9be6255d",
            measurementId: "G-T4L64SMGXJ"
        })),
        provideAuth(() => getAuth()),
        provideAnalytics(() => getAnalytics()),
        provideStorage(() => getStorage()),
        provideFirestore(() => getFirestore()),
        provideDatabase(() => getDatabase()),

        // provideClientHydration(),
    ],
};