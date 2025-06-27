

export class Game {
  // Spiel-Metadaten
  id: string = '';
  name: string = '';
  maxPlayers: number = 8;  // maximale Spieleranzahl
  allPlayersReady: boolean = false;

  constructor(init?: Partial<Game>) {
    Object.assign(this, init);
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      maxPlayers: this.maxPlayers,
      allPlayersReady: this.allPlayersReady
    };
  }
}
