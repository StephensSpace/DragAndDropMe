import { Injectable } from '@angular/core';
import { Firestore, collectionData, docData } from '@angular/fire/firestore';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc
} from 'firebase/firestore';
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

  ) { }

  async createLobby(): Promise<string> {
    const newGame = new Game();
    const docRef = await addDoc(collection(this.firestore, 'Games'), newGame.toJson());

    for (let i = 0; i < newGame.maxPlayers; i++) {
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
    const gameDocRef = doc(this.firestore, 'Games', gameId);
    return docData(gameDocRef, { idField: 'id' }) as Observable<GameWithPlayers>;
  }

  async loadPlayers(gameId: string): Promise<(Player | null)[]> {
    const snapshot = await getDocs(collection(this.firestore, 'Games', gameId, 'Players'));
    const gameDocSnap = await getDoc(doc(this.firestore, 'Games', gameId));
    const game = gameDocSnap.data() as Game;
    const playersFromDb = snapshot.docs.map(doc => doc.data() as Player);
    const playersArray: (Player | null)[] = [];
    for (let i = 0; i < game.maxPlayers; i++) {
      playersArray[i] = playersFromDb.find(p => p.id === i.toString()) || null;
    }
    console.log(playersArray)
    return playersArray;
  }


  getPlayersObservable(gameId: string, maxPlayers: number): Observable<(Player | null)[]> {
    const playersRef = collection(this.firestore, 'Games', gameId, 'Players');
    return collectionData(playersRef, { idField: 'id' }).pipe(
      map((players: any[]) => {
        const playersArray: (Player | null)[] = [];
        for (let i = 0; i < maxPlayers; i++) {
          playersArray[i] = players.find(p => p.id === i.toString()) || null;
        }
        return playersArray;
      })
    );
  }

  async getMaxPlayers(gameId: string): Promise<number> {
    const gameDocRef = doc(this.firestore, 'Games', gameId);
    const gameSnap = await getDoc(gameDocRef);
    if (gameSnap.exists()) {
      const gameData = gameSnap.data() as Game;
      return gameData.maxPlayers;
    }
    return 0;
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
