import { PlayerInfo, Tournament4, Tournament8, GameInfo } from "./tournament_interface";

export const generatePlayerData = (loggedInUsername: string, userAvatar: any, userColor: string | null) => {
  const players: PlayerInfo[] = [{
    username: loggedInUsername,
    avatarname: userAvatar?.name || "",
    avatarimage: userAvatar?.image || "",
    color: userColor || "",
    points: "?"
  }];

  const storedGuests = JSON.parse(localStorage.getItem("tournamentGuests") || "[]");
  storedGuests.forEach((guest: any) => {
    players.push({
      username: guest.username,
      avatarname: guest.avatar?.name || "",
      avatarimage: guest.avatar?.image || "",
      color: guest.color || "",
      points: "?"
    });
  });

  return players;
};

export const generateTournament4 = (players: PlayerInfo[]): Tournament4 => {
  return {
    game1: {
      round: 1,
      circle: 1,
      player1: players[0], // logged in user
      player2: players[1],
    },
    game2: {
      round: 2,
      circle: 1,
      player1: players[2],
      player2: players[3],
    },
    game3: {
      round: 1,
      circle: 2,
      player1: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
      player2: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
    },
    winner: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
  };
};

export const generateTournament8 = (players: PlayerInfo[]): Tournament8 => {
  return {
    game1: {
      round: 1,
      circle: 1,
      player1: players[0], // logged in user
      player2: players[1],
    },
    game2: {
      round: 2,
      circle: 1,
      player1: players[2],
      player2: players[3],
    },
    game3: {
      round: 3,
      circle: 1,
      player1: players[4],
      player2: players[5],
    },
    game4: {
      round: 4,
      circle: 1,
      player1: players[6],
      player2: players[7],
    },
    game5: {
      round: 1,
      circle: 2,
      player1: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
      player2: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
    },
    game6: {
      round: 2,
      circle: 2,
      player1: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
      player2: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
    },
    game7: {
      round: 1,
      circle: 3,
      player1: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
      player2: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
    },
    winner: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
  };
};

// Function to generate tournament data and store it in localStorage
export const generateTournamentData = (guestCount: number, players: PlayerInfo[]) => {
  if (guestCount === 3) {
    const tournamentData: Tournament4 = generateTournament4(players);
    localStorage.setItem("tournamentData", JSON.stringify(tournamentData));
    return tournamentData;
  } else if (guestCount === 7) {
    const tournamentData: Tournament8 = generateTournament8(players);
    localStorage.setItem("tournamentData", JSON.stringify(tournamentData));
    return tournamentData;
  }
  return null;
};

// Functions for updating players in a circle
const players4Circle2 = () => {
  const updatedTournamentData = JSON.parse(
    localStorage.getItem("tournamentData") || "{}"
  );

  const winner1 = updatedTournamentData[`game1`].player1.points === "1" ? updatedTournamentData[`game1`].player1 : updatedTournamentData[`game1`].player2;
  const winner2 = updatedTournamentData[`game2`].player1.points === "1" ? updatedTournamentData[`game2`].player1 : updatedTournamentData[`game2`].player2;

  winner1.points = "?";
  winner2.points = "?";

  updatedTournamentData[`game3`].player1 = winner1;
  updatedTournamentData[`game3`].player2 = winner2;

  localStorage.setItem("tournamentData", JSON.stringify(updatedTournamentData));

  console.log("Updating players [players4Circle2]:", updatedTournamentData);
};

const players8Circle2 = () => {
  const updatedTournamentData = JSON.parse(
    localStorage.getItem("tournamentData") || "{}"
  );

  const winner1 = updatedTournamentData[`game1`].player1.points === "1" ? updatedTournamentData[`game1`].player1 : updatedTournamentData[`game1`].player2;
  const winner2 = updatedTournamentData[`game2`].player1.points === "1" ? updatedTournamentData[`game2`].player1 : updatedTournamentData[`game2`].player2;
  const winner3 = updatedTournamentData[`game3`].player1.points === "1" ? updatedTournamentData[`game3`].player1 : updatedTournamentData[`game3`].player2;
  const winner4 = updatedTournamentData[`game4`].player1.points === "1" ? updatedTournamentData[`game4`].player1 : updatedTournamentData[`game4`].player2;

  winner1.points = "?";
  winner2.points = "?";
  winner3.points = "?";
  winner4.points = "?";

  updatedTournamentData[`game5`].player1 = winner1;
  updatedTournamentData[`game5`].player2 = winner2;
  updatedTournamentData[`game6`].player1 = winner3;
  updatedTournamentData[`game6`].player2 = winner4;

  localStorage.setItem("tournamentData", JSON.stringify(updatedTournamentData));
};

const players4winner = () => {
  const updatedTournamentData = JSON.parse(
    localStorage.getItem("tournamentData") || "{}"
  );

  const winner = updatedTournamentData[`game3`].player1.points === "1" ? updatedTournamentData[`game3`].player1 : updatedTournamentData[`game3`].player2;
  
  updatedTournamentData[`winner`] = winner;

  localStorage.setItem("tournamentData", JSON.stringify(updatedTournamentData));
};

const players8Circle3 = () => {
  const updatedTournamentData = JSON.parse(
    localStorage.getItem("tournamentData") || "{}"
  );

  const winner1 = updatedTournamentData[`game5`].player1.points === "1" ? updatedTournamentData[`game5`].player1 : updatedTournamentData[`game5`].player2;
  const winner2 = updatedTournamentData[`game6`].player1.points === "1" ? updatedTournamentData[`game6`].player1 : updatedTournamentData[`game6`].player2;

  winner1.points = "?";
  winner2.points = "?";
  
  updatedTournamentData[`game7`].player1 = winner1;
  updatedTournamentData[`game7`].player2 = winner2;

  localStorage.setItem("tournamentData", JSON.stringify(updatedTournamentData));
};

const players8winner = () => {
  const updatedTournamentData = JSON.parse(
    localStorage.getItem("tournamentData") || "{}"
  );

  const winner = updatedTournamentData[`game7`].player1.points === "1" ? updatedTournamentData[`game7`].player1 : updatedTournamentData[`game7`].player2;
  
  updatedTournamentData[`winner`] = winner;

  localStorage.setItem("tournamentData", JSON.stringify(updatedTournamentData));
};

export const updateNextCircle = (circleNumber: number, guestCount: number) => {
  if (guestCount === 3 && circleNumber === 2)
    players4Circle2();
  if (guestCount === 3 && circleNumber === 3)
    players4winner();
  if (guestCount === 7 && circleNumber === 2)
    players8Circle2();
  if (guestCount === 7 && circleNumber === 3)
    players8Circle3();
  if (guestCount === 7 && circleNumber === 4)
    players8winner();

  console.log("Updated players [AT END updateNextCircle]:", localStorage.getItem("tournamentData"));
};

// functions for checking if circle is completed
const players4Circle1completed = () => {
  const updatedTournamentData = JSON.parse(
    localStorage.getItem("tournamentData") || "{}"
  );

  let game1: GameInfo = updatedTournamentData[`game1`] || null;
  let game2: GameInfo = updatedTournamentData[`game2`] || null;

  if (game1 === null || game2 === null)
    return 0;

  if ((updatedTournamentData[`game1`].player1.points === "1" || updatedTournamentData[`game1`].player2.points === "1") &&
  (updatedTournamentData[`game2`].player1.points === "1" || updatedTournamentData[`game2`].player2.points === "1"))
    return 1;
  else 
    return 0;
};

const players4Circle2completed = () => {
  const updatedTournamentData = JSON.parse(
    localStorage.getItem("tournamentData") || "{}"
  );

  let game: GameInfo = updatedTournamentData[`game3`] || null;

  if (game === null)
    return 0;

  if ((updatedTournamentData[`game3`].player1.points === "1" || updatedTournamentData[`game3`].player2.points === "1"))
    return 1;
  else 
    return 0;
};

const players8Circle1completed = () => {
  const updatedTournamentData = JSON.parse(
    localStorage.getItem("tournamentData") || "{}"
  );

  let game1: GameInfo = updatedTournamentData[`game1`] || null;
  let game2: GameInfo = updatedTournamentData[`game2`] || null;
  let game3: GameInfo = updatedTournamentData[`game3`] || null;
  let game4: GameInfo = updatedTournamentData[`game4`] || null;

  if (game1 === null || game2 === null || game3 === null || game4 === null)
    return 0;

  if ((updatedTournamentData[`game1`].player1.points === "1" || updatedTournamentData[`game1`].player2.points === "1") &&
  (updatedTournamentData[`game2`].player1.points === "1" || updatedTournamentData[`game2`].player2.points === "1") &&
  (updatedTournamentData[`game3`].player1.points === "1" || updatedTournamentData[`game3`].player2.points === "1") &&
  (updatedTournamentData[`game4`].player1.points === "1" || updatedTournamentData[`game4`].player2.points === "1"))
    return 1;
  else 
    return 0;
};

const players8Circle2completed = () => {
  const updatedTournamentData = JSON.parse(
    localStorage.getItem("tournamentData") || "{}"
  );

  let game1: GameInfo = updatedTournamentData[`game5`] || null;
  let game2: GameInfo = updatedTournamentData[`game6`] || null;

  if (game1 === null || game2 === null)
    return 0;

  if ((updatedTournamentData[`game5`].player1.points === "1" || updatedTournamentData[`game5`].player2.points === "1") &&
  (updatedTournamentData[`game6`].player1.points === "1" || updatedTournamentData[`game6`].player2.points === "1"))
    return 1;
  else 
    return 0;
};

const players8Circle3completed = () => {
  const updatedTournamentData = JSON.parse(
    localStorage.getItem("tournamentData") || "{}"
  );

  let game: GameInfo = updatedTournamentData[`game7`] || null;

  if (game === null)
    return 0;

  if ((updatedTournamentData[`game7`].player1.points === "1" || updatedTournamentData[`game7`].player2.points === "1"))
    return 1;
  else 
    return 0;
};

export const checkIfCircleCompleted = (circleNumber: number, guestCount: number) => {
  let return_value: number = 0;
  if (guestCount === 3 && circleNumber === 1)
    return_value = players4Circle1completed();
  if (guestCount === 3 && circleNumber === 2)
    return_value = players4Circle2completed();
  if (guestCount === 7 && circleNumber === 1)
    return_value = players8Circle1completed();
  if (guestCount === 7 && circleNumber === 2)
    return_value = players8Circle2completed();
  if (guestCount === 7 && circleNumber === 3)
    return_value = players8Circle3completed();

  return return_value;
};