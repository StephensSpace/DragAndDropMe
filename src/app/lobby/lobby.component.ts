import { Component } from '@angular/core';
import { FirebaseService } from '../services/FirebaseService/Firebase';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from '../models/game';

@Component({
  selector: 'app-lobby',
  imports: [],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {
  private unsubscribeFn?: () => void;
  gameData: Game | undefined;
  ID: string = "";

    constructor(private firestore: FirebaseService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

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
    });
  }

  ngOnDestroy(): void {
    if (this.unsubscribeFn) {
      this.unsubscribeFn(); // sauber vom Listener abmelden beim Verlassen der Komponente
    }
  }
    
}
