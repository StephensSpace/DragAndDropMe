import { Component, Inject } from '@angular/core';
import { FirebaseService } from '../services/FirebaseService/Firebase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  providers: [FirebaseService, Router],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private firestore = Inject(FirebaseService);
  private router = Inject(Router);


startLobby() {
    this.firestore.createLobby().then((lobbyId: string) => {
      this.router.navigate([lobbyId]);
    });
  }
}
