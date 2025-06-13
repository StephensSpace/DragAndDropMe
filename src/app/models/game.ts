export class Game {
    players: { name: string; Color: string; score: number, inLobby: boolean }[] = [];
   
    constructor() {
    const defaultPlayers = [
      { name: 'Player1', Color: 'red', score: 0, inLobby: false },
      { name: 'Player2', Color: 'blue', score: 0, inLobby: false },
      { name: 'Player3', Color: 'green', score: 0, inLobby: false },
      { name: 'Player4', Color: 'purple', score: 0, inLobby: false }
    ];
    this.players = defaultPlayers;
  }

  toJson() {
    return {
      players: this.players
    };
  }
}
