import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBOCpbiUFSX1AWQPW5k3dgu6z5nBDNx7YI",
  authDomain: "drag-and-drop-me.firebaseapp.com",
  projectId: "drag-and-drop-me",
  storageBucket: "drag-and-drop-me.firebasestorage.app",
  messagingSenderId: "899149559923",
  appId: "1:899149559923:web:4724b89cd90dc21ec61206"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
  ]
};

