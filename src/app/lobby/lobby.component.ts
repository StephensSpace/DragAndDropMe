import { Component } from '@angular/core';
import { FirebaseService } from '../services/FirebaseService/Firebase';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from '../models/game';
import { OverlayUrlComponent } from '../overlay-url/overlay-url.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Player } from '../models/player';
import { Observable } from 'rxjs';
import { GameWithPlayers } from '../models/GameWithPlayers';

@Component({
  selector: 'app-lobby',
  imports: [OverlayUrlComponent, CommonModule, FormsModule],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {
  players$!: Observable<(Player | null)[]>;
  game$!: Observable<GameWithPlayers>;
  currentPlayerIndex = -1;
  overlayVisible = false;
  ID = '';

  constructor(
    private firestore: FirebaseService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId) {
      this.router.navigate(['/']);
      return;
    }

    this.ID = gameId;
    this.players$ = this.firestore.getPlayersObservable(this.ID);
    this.game$ = this.firestore.getGameObservable(this.ID);

    this.assignPlayerRole(gameId);
  }

  onNameChange(name: string, index: number, playerId: string) {
  if (!playerId) return;
  this.firestore.updatePlayerData(this.ID, playerId, { name });
}

  saveName(i: number, name: string) {
    if (!name || i !== this.currentPlayerIndex) return;
    const playerId = `${i}`; // oder aus Player[] wenn vorhanden
    this.firestore.updatePlayerData(this.ID, playerId, { name });
  }

  //if (this.currentPlayerIndex === 0) {
  // this.toggleOverlay();
  //}

  toggleOverlay() {
    this.overlayVisible = !this.overlayVisible;
  }

  async assignPlayerRole(gameId: string) {
    const playersArray = await this.firestore.loadPlayers(gameId);

    for (let i = 0; i < playersArray.length; i++) {
      const player = playersArray[i];
      if (player && !player.inLobby) {
        player.inLobby = true;
        this.currentPlayerIndex = i;

        // Spielername setzen (aus lokalem Storage oder Default)
        const name = `Player${i + 1}`;
        player.name = name;

        // Firebase update
        await this.firestore.updatePlayerData(gameId, player.id, {
          inLobby: true,
          name,
        });

        return;
      }
    }

    console.warn('Keine freien Spieler-Slots mehr verfügbar.');
  }
}
