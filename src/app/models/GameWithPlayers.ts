import { Game } from "./game";
import { Player } from "./player";

export interface GameWithPlayers extends Game {
  players: (Player | null)[];
}