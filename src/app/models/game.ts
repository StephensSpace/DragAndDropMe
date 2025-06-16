export class Game {
  // Spiel-Metadaten
  id: string = '';
  name: string = '';
  maxPlayers: number = 4;  // maximale Spieleranzahl

  constructor(init?: Partial<Game>) {
    Object.assign(this, init);
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      maxPlayers: this.maxPlayers
    };
  }
}
