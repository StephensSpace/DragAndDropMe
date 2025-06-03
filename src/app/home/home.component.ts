import { Component, Inject } from '@angular/core';
import { FirebaseService } from '../services/FirebaseService/Firebase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
   constructor(
    private firestore: FirebaseService,
    private router: Router
  ) {}


startLobby() {
    this.firestore.createLobby().then((lobbyId: string) => {
      this.router.navigate([lobbyId]);
    });
  }
}
