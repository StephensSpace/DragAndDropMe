export class Game {
    players: { name: string; Color: string; score: number }[] = [];
   
    constructor() {
    const defaultPlayers = [
      { name: 'Player1', Color: 'red', score: 0 },
      { name: 'Player2', Color: 'blue', score: 0 },
      { name: 'Player3', Color: 'green', score: 0 },
      { name: 'Player4', Color: 'purple', score: 0 }
    ];
    this.players = defaultPlayers;
  }

  toJson() {
    return {
      players: this.players
    };
  }
}
