import { Injectable } from '@angular/core';
import { getFirestore, onSnapshot } from 'firebase/firestore';
import { Firestore, collection, collectionData, doc, docData, addDoc } from '@angular/fire/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyBOCpbiUFSX1AWQPW5k3dgu6z5nBDNx7YI",
    authDomain: "drag-and-drop-me.firebaseapp.com",
    projectId: "drag-and-drop-me",
    storageBucket: "drag-and-drop-me.firebasestorage.app",
    messagingSenderId: "899149559923",
    appId: "1:899149559923:web:4724b89cd90dc21ec61206"
};

// Firebase einmal initialisieren und exportieren
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {

    // Zugriff auf Firestore über diese Property
    firestore = firestore;

    constructor() { }
    async createLobby(): Promise<string> {
        // generiere Lobby-Dokument mit automatischer ID und evtl. Standarddaten
        const docRef = await addDoc(collection(this.firestore, 'Games'), { /* default data */ });
        return docRef.id; // zurückgeben für URL etc.
    }

    subscribeLobby(lobbyId: string, callback: Function) {
        const lobbyDoc = doc(this.firestore, 'Games', lobbyId);
        return onSnapshot(lobbyDoc, (docSnap) => {
            callback(docSnap.data());
        });
    }

}