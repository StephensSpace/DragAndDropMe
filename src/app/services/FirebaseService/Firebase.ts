import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  setDoc,
  getDocs,
  docData
} from '@angular/fire/firestore';
import { onSnapshot, updateDoc } from 'firebase/firestore';
import { Router } from '@angular/router';
import { Game } from '../../models/game';
import { Player } from '../../models/player';
import { GameWithPlayers } from '../../models/GameWithPlayers';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(
    private firestore: Firestore,
    private router: Router
  ) { }

  async createLobby(): Promise<string> {
    const newGame = new Game({ maxPlayers: 4 });
    const docRef = await addDoc(collection(this.firestore, 'Games'), newGame.toJson());

    for (let i = 0; i < 4; i++) {
      const player = new Player({
        id: i.toString(),
        name: `Player${i + 1}`,
        color: this.getColor(i)
      });
      await setDoc(doc(this.firestore, 'Games', docRef.id, 'Players', player.id), player.toJson());
    }

    return docRef.id;
  }

  getGameObservable(gameId: string) {
  const gameDocRef = doc(this.firestore, 'games', gameId);
  return docData(gameDocRef, { idField: 'id' }) as Observable<GameWithPlayers>;
}

  async loadPlayers(gameId: string): Promise<(Player | null)[]> {
    const snapshot = await getDocs(collection(this.firestore, 'Games', gameId, 'Players'));
    const playersFromDb = snapshot.docs.map(doc => doc.data() as Player);
    const playersArray: (Player | null)[] = [];
    for (let i = 0; i < 4; i++) {
      playersArray[i] = playersFromDb.find(p => p.id === i.toString()) || null;
    }
    console.log(playersArray)
    return playersArray;
  }

  // ✅ NEU: Players-Observable mit Live-Updates (RxJS)
  getPlayersObservable(gameId: string): Observable<(Player | null)[]> {
    const playersRef = collection(this.firestore, 'Games', gameId, 'Players');
    return collectionData(playersRef, { idField: 'id' }).pipe(
      map((players: any[]) => {
        const playersArray: (Player | null)[] = [];
        for (let i = 0; i < 4; i++) {
          playersArray[i] = players.find(p => p.id === i.toString()) || null;
        }
        return playersArray;
      })
    );
  }

  // ✅ Optional: Game + Players kombinieren (falls benötigt)
  subscribeToGame(gameId: string, callback: (data: GameWithPlayers) => void): () => void {
    const gameDoc = doc(this.firestore, 'Games', gameId);
    const unsubscribe = onSnapshot(gameDoc, async (docSnap) => {
      if (!docSnap.exists()) {
        console.warn('Spiel nicht gefunden!');
        this.router.navigate(['/']);
        return;
      }
      const gameData = docSnap.data() as Game;
      const playersSnapshot = await getDocs(collection(this.firestore, `Games/${gameId}/players`));
      const players: (Player | null)[] = playersSnapshot.docs.map(doc => doc.data() as Player);
      const fullData = { ...gameData, players } as unknown as GameWithPlayers;
      callback(fullData);
    });
    return unsubscribe;
  }

  // ✅ Wird weiterhin benötigt zum gezielten Schreiben
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
