import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc } from '@angular/fire/firestore';
import { onSnapshot } from 'firebase/firestore';
import { Router } from '@angular/router';
import { Game } from '../../models/game';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(
    private firestore: Firestore,
    private router: Router,
  ) {}

  async createLobby(): Promise<string> {
    const newGame = new Game(); // Instanz mit Standardwerten
    const docRef = await addDoc(collection(this.firestore, 'Games'), newGame.toJson());
    return docRef.id;
  }

  subscribeToGame(gameId: string, callback: (data: any) => void): () => void {
    const gameDoc = doc(this.firestore, 'Games', gameId);
    const unsubscribe = onSnapshot(gameDoc, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        console.warn('Spiel nicht gefunden!');
        this.router.navigate(['/']);
      }
    });
    return unsubscribe;
  }
}