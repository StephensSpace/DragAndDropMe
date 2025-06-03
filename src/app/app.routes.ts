import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LobbyComponent } from './lobby/lobby.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Startseite
  { path: ':id', component: LobbyComponent }, // Dynamische Route für die Lobby
];