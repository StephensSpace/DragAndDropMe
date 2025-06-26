export class Player {
  id: string = '';          // z.B. UID oder Index als String
  name: string = 'Player';  
  color: string = 'red';
  score: number = 0;
  inLobby: boolean = false;  // <--- NEU
  ready: boolean = false;

  constructor(init?: Partial<Player>) {
    Object.assign(this, init);
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      score: this.score,
      inLobby: this.inLobby,
      ready: this.ready
    };
  }
}