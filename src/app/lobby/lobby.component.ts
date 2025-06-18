import { Component } from '@angular/core';
import { FirebaseService } from '../services/FirebaseService/Firebase';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from '../models/game';
import { OverlayUrlComponent } from '../overlay-url/overlay-url.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Player } from '../models/player';

@Component({
  selector: 'app-lobby',
  imports: [OverlayUrlComponent, CommonModule, FormsModule],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {
  private unsubscribeFn?: () => void;
  currentPlayerIndex: number = -1;
  overlayVisible: boolean = false;
  gameData: Game | undefined;
  ID: string = "";
  players: (Player | null)[] = [];
  localNames: { [index: number]: string } = {};

  constructor(private firestore: FirebaseService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId) {
      console.warn('Keine Game-ID gefunden');
      this.router.navigate(['/']);
      return;
    }
    this.ID = gameId;
    // ZUERST: Spielerrolle zuweisen (setzt currentPlayerIndex)
    this.assignPlayerRole(gameId);
    // DANACH: Auf Game-Daten hören
    this.unsubscribeFn = this.firestore.subscribeToGame(gameId, (data) => {
      console.log('Empfangene Spieldaten:', data, this.localNames, this.currentPlayerIndex);
      this.gameData = data;
    });
  }
  //if (this.currentPlayerIndex === 0) {
  // this.toggleOverlay();
  //}



  onNameChange(value: string, i: number) {
    if (i === this.currentPlayerIndex) {
      this.localNames[i] = value;
    }
  }

  saveName(i: number) {
    const name = this.localNames[i];
    if (name) {
      this.firestore.updateGameDataField(this.ID, `players.${i}.name`, name);
    }
  }

  toggleOverlay() {
    this.overlayVisible = !this.overlayVisible;
  }

  async assignPlayerRole(gameId: string) {
    // Lade die 4 möglichen Player-Slots aus Firestore
    const playersArray = await this.firestore.loadPlayers(gameId);
    // Finde den ersten freien Slot (inLobby === false)
    for (let i = 0; i < playersArray.length; i++) {
      const player = playersArray[i];
      if (player && !player.inLobby) {
        // Slot gefunden – Spieler betritt Lobby
        player.inLobby = true;
        // Aktuellen Index merken (z. B. für UI-Sperre)
        this.currentPlayerIndex = i;
        // Optional: z. B. Spielername aus lokalem Storage oder Eingabe
        const name = this.localNames[i] || `Player${i + 1}`;
        player.name = name;
        // Spieler-Objekt zurück in Firestore schreiben
        await this.firestore.updatePlayerData(gameId, player.id, player);
        // Lokales players-Array updaten
        this.players = playersArray;
        return; // Aufgabe erledigt
      }
    }
    // Falls kein freier Slot gefunden wurde
    console.warn('Keine freien Spieler-Slots mehr verfügbar.');
  }

  ngOnDestroy(): void {
    if (this.unsubscribeFn) {
      this.unsubscribeFn(); // sauber vom Listener abmelden beim Verlassen der Komponente
    }
  }


}
