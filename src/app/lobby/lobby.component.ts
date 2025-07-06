import { Component } from '@angular/core';
import { FirebaseService } from '../services/FirebaseService/Firebase';
import { ActivatedRoute, Router } from '@angular/router';
import { OverlayUrlComponent } from '../overlay-url/overlay-url.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Player } from '../models/player';
import { Observable, take } from 'rxjs';
import { GameWithPlayers } from '../models/GameWithPlayers';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';


@Component({
  selector: 'app-lobby',
  imports: [OverlayUrlComponent, CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {
  players$!: Observable<Array<Player | null>>;
  game$!: Observable<GameWithPlayers>;
  currentPlayerIndex = -1;
  overlayVisible = false;
  ID: string = '';
  localNames: { [index: number]: string } = {};
  gameStart: boolean = false;
  visible: boolean = true;
  lobbyStyle: {} = {
    width: '28rem',
    height: '40rem',
    backgroundImage: 'url(' + '/menuH.jpg' + ')',
    backgroundSize: '100% 100%',
    backgroundPosition: 'center'
  };
  overlayStyle: {} = {
    width: '24rem',
    height: '18rem',
    backgroundImage: 'url(' + '/menuV.jpg' + ')',
    backgroundSize: '100% 100%',
    backgroundPosition: 'center'
  };

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
    if (await this.checkLocalStorage()) {
      this.checkPlayerOne()
    } else {
      await this.assignPlayerRole(gameId);
      this.checkPlayerOne();
    }; 
    
  }

  async checkLocalStorage() {
    const rawData = localStorage.getItem(this.ID);
    if (rawData !== null) {
      const loggedUser: { curentIndex: number, inLobby: boolean } = JSON.parse(rawData);
      this.currentPlayerIndex = loggedUser.curentIndex;
      const playersArray = await this.firestore.loadPlayers(this.ID);
      const player: Player | null = playersArray[this.currentPlayerIndex]
      this.setNameAndSaveInitial(loggedUser.curentIndex, player!);
      return true
    } else {
      return false
    }
  }

  checkPlayerOne() {
    if (this.currentPlayerIndex === 0) {
      this.toggleOverlay();
      console.log(this.overlayVisible, this.game$);
    }
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

  saveSlotToLocalStorage() {
  localStorage.setItem(this.ID, JSON.stringify({
    curentIndex: this.currentPlayerIndex,
    inLobby: true
  }));
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
        this.setNameAndSaveInitial(i, player)
        this.saveSlotToLocalStorage()
        return;
      }
    }
    console.warn('Keine freien Spieler-Slots mehr verfügbar.');
    this.router.navigate(['/']);  // Umleitung zur Home-Komponente
  }

  async setNameAndSaveInitial(i: number, player: Player) {
    const name = `Player${i + 1}`;
    player.name = name;
    await this.firestore.updatePlayerData(this.ID, player.id, {
      inLobby: true,
      name,
    });
  }

  startGame() {
    this.gameStart = !this.gameStart
  }
}


