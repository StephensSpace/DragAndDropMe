import { Component } from '@angular/core';
import { FirebaseService } from '../services/FirebaseService/Firebase';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from '../models/game';
import { OverlayUrlComponent } from '../overlay-url/overlay-url.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  localName: string = '';

  constructor(private firestore: FirebaseService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // gameId aus der URL holen
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId) {
      console.warn('Keine Game-ID gefunden');
      this.router.navigate(['/']);
      return;
    }

    this.ID = gameId;
    this.unsubscribeFn = this.firestore.subscribeToGame(gameId, (data) => {
      console.log('Empfangene Spieldaten:', data, 'empfangeneID:', this.ID); // hier werden die Daten geloggt
      this.gameData = data; // falls du die Daten im Template brauchst
      this.assignPlayerRole(this.gameData!);
      
      //if (this.currentPlayerIndex === 0) {
       // this.toggleOverlay();
      //}
    }); 
  }

  saveName(i: number) {
  this.firestore.updateGameDataField(this.ID, `players.${i}.name`, this.localName);
}

  toggleOverlay() {
    this.overlayVisible = !this.overlayVisible;
  }

  assignPlayerRole(gameData: Game) {
    for (let i = 0; i < gameData.players.length; i++) {
      if (!gameData.players[i].inLobby) {
        this.currentPlayerIndex = i;
        this.firestore.updateGameDataField(this.ID, `players.${i}.inLobby`, true);
        this.localName = gameData.players[i].name;
        return;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribeFn) {
      this.unsubscribeFn(); // sauber vom Listener abmelden beim Verlassen der Komponente
    }
  }

  
}
