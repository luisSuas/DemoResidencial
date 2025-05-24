import { ApplicationConfig } from '@angular/core';
import { provideDatabase } from '@angular/fire/database';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase } from 'firebase/database';

export const firebaseConfig: ApplicationConfig = {
  providers: [
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
  ]
};


