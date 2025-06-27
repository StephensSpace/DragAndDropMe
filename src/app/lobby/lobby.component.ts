import { Component } from '@angular/core';
import { FirebaseService } from '../services/FirebaseService/Firebase';
import { ActivatedRoute, Router } from '@angular/router';
import { OverlayUrlComponent } from '../overlay-url/overlay-url.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Player } from '../models/player';
import { Observable, take } from 'rxjs';
import { GameWithPlayers } from '../models/GameWithPlayers';

@Component({
  selector: 'app-lobby',
  imports: [OverlayUrlComponent, CommonModule, FormsModule],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {
  players$!: Observable<Array<Player | null>>;
  game$!: Observable<GameWithPlayers>;
  currentPlayerIndex = -1;
  overlayVisible = false;
  ID = '';
  localNames: { [index: number]: string } = {};
  gameStart: boolean = false;

  constructor(
    private firestore: FirebaseService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  async ngOnInit(): Promise<void> {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId) {
      this.router.navigate(['/']);
      return;
    }
    this.ID = gameId;
    const maxPlayers = await this.firestore.getMaxPlayers(gameId);
    this.players$ = this.firestore.getPlayersObservable(this.ID, maxPlayers);
    this.players$.subscribe(players => {
      this.initializeLocalNames(players);
    });
    this.game$ = this.firestore.getGameObservable(this.ID)
    this.assignPlayerRole(gameId).then(() => {
      if (this.currentPlayerIndex === 0) {
        this.toggleOverlay();
        console.log(this.overlayVisible, this.game$);
      }
    });
  }

  initializeLocalNames(players: (Player | null)[]) {
    players.forEach((p, i) => {
      if (p && typeof this.localNames[i] === 'undefined') {
        this.localNames[i] = p.name || `Player${i + 1}`;
      }
    });
  }

  onNameChange(name: string, index: number, playerId: string) {
    if (!playerId) return;
    this.firestore.updatePlayerData(this.ID, playerId, { name });
  }

  saveName(i: number, playerId?: string) {
    const name = this.localNames[i];
    if (name && playerId) {
      this.firestore.updatePlayerData(this.ID, playerId, { name });
    }
  }

  toggleReady(player: Player | null) {
    if (!player) return; // Wenn null, dann abbrechen

    const newReadyState = !player.ready;
    this.firestore.updatePlayerData(this.ID, player.id, { ready: newReadyState }).then(() => this.checkAllReady());
  }

  toggleOverlay() {
    this.overlayVisible = !this.overlayVisible;
  }

  checkAllReady() {
    this.players$.pipe(take(1)).subscribe(players => {
      // Filtert nur gültige Player-Objekte mit inLobby = true
      const lobbyPlayers: Player[] = players.filter(
        (p): p is Player => this.isPlayer(p) && p.inLobby
      );

      // Anfangszustand
      let allReady = false;

      if (lobbyPlayers.length > 0) {
        allReady = true;

        for (const p of lobbyPlayers) {
          if (!p.ready) {
            allReady = false;
            break;
          }
        }
      }
      // Wenn alle in der Lobby bereit sind, Game-Flag setzen, sonst zurücksetzen
      this.firestore.updateGameDataField(this.ID, 'allPlayersReady', allReady);
      this.game$.pipe(take(1)).subscribe(game => {
        console.log('🎯 Das ist dein Game-Objekt:', game);
      });
    });
  }

  isPlayer(p: Player | null): p is Player {
    return p !== null && p !== undefined;
  }

  async assignPlayerRole(gameId: string) {
    const playersArray = await this.firestore.loadPlayers(gameId);
    for (let i = 0; i < playersArray.length; i++) {
      const player = playersArray[i];
      if (player && !player.inLobby) {
        player.inLobby = true;
        this.currentPlayerIndex = i;
        const name = `Player${i + 1}`;
        player.name = name;
        await this.firestore.updatePlayerData(gameId, player.id, {
          inLobby: true,
          name,
        });
        return;
      }
    }
    console.warn('Keine freien Spieler-Slots mehr verfügbar.');
  }

  startGame() {
    this.gameStart= !this.gameStart
  }
}


