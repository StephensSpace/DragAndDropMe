import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, setDoc, getDocs } from '@angular/fire/firestore';
import { onSnapshot, updateDoc } from 'firebase/firestore';
import { Router } from '@angular/router';
import { Game } from '../../models/game';
import { Player } from '../../models/player';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(
    private firestore: Firestore,
    private router: Router,
  ) { }

  async createLobby(): Promise<string> {
    // Neues Game-Dokument erzeugen
    const newGame = new Game({ maxPlayers: 4 });
    const docRef = await addDoc(collection(this.firestore, 'Games'), newGame.toJson());

    // 4 Dummy-Player anlegen
    for (let i = 0; i < 4; i++) {
      const player = new Player({ id: i.toString(), name: `Player${i + 1}`, color: this.getColor(i) });
      await setDoc(doc(this.firestore, 'Games', docRef.id, 'Players', player.id), player.toJson());
    }

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

  async loadPlayers(gameId: string): Promise<(Player | null)[]> {
  // Spieler-Dokumente aus der Subcollection 'Players' laden
  const snapshot = await getDocs(collection(this.firestore, 'Games', gameId, 'Players'));
  // Dokumentdaten in Player-Objekte umwandeln
  const playersFromDb = snapshot.docs.map(doc => doc.data() as Player);
  // Array mit festen 4 Positionen erzeugen (Player 0–3)
  const playersArray: (Player | null)[] = [];
  for (let i = 0; i < 4; i++) {
    playersArray[i] = playersFromDb.find(p => p.id === i.toString()) || null;
  }
  return playersArray;
}

  updatePlayerData(gameId: string, playerId: string, updatedFields: Partial<Player>) {
    const playerDocRef = doc(this.firestore, 'Games', gameId, 'Players', playerId);
    return updateDoc(playerDocRef, updatedFields);
  }

  updateGameDataField(gameId: string, fieldPath: string, value: any) {
    const gameDoc = doc(this.firestore, 'Games', gameId);
    return updateDoc(gameDoc, { [fieldPath]: value });
  }

  getColor(index: number) {
    return index.toString();
  }
}
