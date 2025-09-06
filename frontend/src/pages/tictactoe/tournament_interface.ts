/*
Idea is that for tournament of 8 players my informations are 
saved in local storage at the beginning in this format:

{
 {
  {round1, circle1, {pl1_un, av1, "?"}, {pl2_un, av2, "?"}}, 
  {round2, circle1, {pl3_un, av3, "?"}, {pl4_un, av4, "?"}}, 
  {round3, circle1, {pl5_un, av5 "?"}, {pl6_un, av6, "?"}}, 
  {round4, circle1, {pl7_un, av7, "?"}, {pl8_un, av8, "?"}}
 },
 {
  {round1, circle2, {"?", "?", "?"}, {"?", "?", "?"}}, 
  {round2, circle2, {"?", "?", "?"}, {{"?", "?", "?"}}
 },
  {round1, circle3, {"?", "?", "?"}, {"?", "?", "?"}}
} 

Since I can read informations about my 8 players from local storage
I can fill it up to looks similar as this, like what is the round,
circle, in first circle what are my usernames, their avatar's infos 
(name and image). and I can put points to me "?" everywhere. in other 
circles we don't know at the beginning who is playing, so it can be put
as "?" as it is visable in example.

After each round, I can update points into 0 or 1, and I can update 
who will be a next player in next circle. For example winners from
rounds 1 and 2 in circle 1 will be players in round 1 in circle 2 and so on
*/

export interface PlayerInfo {
  username: string 
  avatarname: string
  avatarimage: string
  color: string
  points: "?" | "0" | "1"
}

export interface GameInfo {
  round: 1 | 2 | 3 | 4
  circle: 1 | 2 | 3
  player1: PlayerInfo
  player2: PlayerInfo
}

export interface Tournament4 {
  game1: GameInfo
  game2: GameInfo
  game3: GameInfo
  winner: PlayerInfo
}

export interface Tournament8 {
  game1: GameInfo
  game2: GameInfo
  game3: GameInfo
  game4: GameInfo
  game5: GameInfo
  game6: GameInfo
  game7: GameInfo
  winner: PlayerInfo
}