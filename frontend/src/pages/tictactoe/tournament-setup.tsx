import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  generatePlayerData,
  generateTournamentData,
  checkIfCircleCompleted,
  updateNextCircle,
} from "./tournament_init";

export const TournamentSetupPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [guestCount, setGuestCount] = useState<number>(3);
  const [loggedInUsername, setLoggedInUsername] = useState("");
  const [userAvatar, setUserAvatar] = useState<any | null>(null);
  const [userColor, setUserColor] = useState(
    localStorage.getItem("userColor") || "pink"
  );
  const [tournamentData, setTournamentData] = useState<any>(null);
  const [currentCircle, setCurrentCircle] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("ping-pong-jwt");
    let username = "";
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      username = payload.username;
      setLoggedInUsername(username);
    }

    const storedGuestCount = localStorage.getItem("guestCount");
    const storedUserAvatar = localStorage.getItem("userAvatar");
    const storedUserColor = localStorage.getItem("userColor");

    const guestCountValue = storedGuestCount ? parseInt(storedGuestCount) : 3;
    const userAvatarValue = storedUserAvatar
      ? JSON.parse(storedUserAvatar)
      : null;
    const userColorValue = storedUserColor || "pink";

    setGuestCount(guestCountValue);
    setUserAvatar(userAvatarValue);
    setUserColor(userColorValue);

    const storedCircle = localStorage.getItem("currentCircle");
    if (storedCircle) {
      setCurrentCircle(parseInt(storedCircle, 10));
    } else {
      setCurrentCircle(1);
    }

    const storedTournamentData = localStorage.getItem("tournamentData");
    if (storedTournamentData) {
      setTournamentData(JSON.parse(storedTournamentData));
    } else if (username && userAvatarValue && userColorValue) {
      const players = generatePlayerData(
        username,
        userAvatarValue,
        userColorValue
      );
      const tournament = generateTournamentData(guestCountValue, players);
      if (tournament) {
        setTournamentData(tournament);
        localStorage.setItem("tournamentData", JSON.stringify(tournament));
      }
    }
  }, []);

  const handleNextCircle = () => {
    const nextCircle = currentCircle + 1;
    setCurrentCircle(nextCircle);
    localStorage.setItem("currentCircle", nextCircle.toString());
    updateNextCircle(nextCircle, guestCount);

    const storedTournamentData = localStorage.getItem("tournamentData");
    if (storedTournamentData) {
      const parsedData = JSON.parse(storedTournamentData);
      setTournamentData(parsedData);

      console.log("FINAL TOURNAMENT DATA: ", tournamentData);

      if (parsedData.winner?.points !== "?") {
        navigate("/show_a_tournament_winner");
      }
    }
  };

  const handlePickWinner = (gameNumber: number) => {
    const gameKey = `game${gameNumber}`;

    // Create a deep copy of the tournamentData to avoid mutating state directly
    const updatedTournamentData = { ...tournamentData };

    const game = updatedTournamentData?.[gameKey];

    if (!game || !game.player1 || !game.player2) {
      console.error(`Game ${gameNumber} data is missing player1 or player2.`);
      return;
    }

    const randomWinner = Math.random() < 0.5 ? game.player1 : game.player2; // Randomly choose a winner

    // Assign points
    if (randomWinner.username === game.player1.username) {
      game.player1.points = "1";
      game.player2.points = "0";
    } else {
      game.player1.points = "0";
      game.player2.points = "1";
    }

    localStorage.setItem(
      "tournamentData",
      JSON.stringify(updatedTournamentData)
    );
    setTournamentData(updatedTournamentData);
  };

  const startGame = (gameNumber: number) => {
    const gameKey = `game${gameNumber}`;
    const gameData = tournamentData?.[gameKey];

    if (!gameData || !gameData.player1 || !gameData.player2) {
      console.error(`Game ${gameNumber} data is missing player1 or player2.`);
      return;
    }

    navigate(`/tic-tac-toe-tournament/${gameNumber}`, {
      state: {
        player1: gameData.player1,
        player2: gameData.player2,
        gameIndex: gameNumber,
      },
    });
  };

  return (
    <div
      className="flex flex-col justify-center items-center p-4 bg-gray-900 min-h-screen"
      style={{
        backgroundImage:
          "url('/background/360_F_339060225_w8ob8LjMJzPdEqD9UFxbE6ibcKx8dFrP.jpg')",
        backgroundSize: "cover",
      }}
    >
      <button
        onClick={() => navigate("/menu")}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 {t("BACK_TO_MENU")}
      </button>

      {/* Render Dynamic Rounds based on current circle */}
      {tournamentData &&
        Object.entries(tournamentData).map(([key, game]: [string, any]) => {
          if (key === "winner") return null;

          const gameNumber = parseInt(key.replace("game", ""), 10);

          if (game.circle !== currentCircle) return null;

          return (
            <div
              key={key}
              className="flex justify-around items-center bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl mb-6"
            >
              <div className="flex flex-col items-center bg-pink-500 p-4 rounded-lg">
                <div className="w-20 h-20 bg-pink-500 rounded-full flex justify-center items-center mb-4">
                  {game.player1.avatarimage && (
                    <img
                      src={game.player1.avatarimage}
                      alt={game.player1.avatarname}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                </div>
                <h3 className="text-white">{game.player1.username}</h3>
                <p className="text-white">{t("POINTS")}: {game.player1.points}</p>
              </div>

              <div className="text-white text-xl mx-8">vs</div>

              <div className="flex flex-col items-center bg-pink-500 p-4 rounded-lg">
                <div className="w-20 h-20 bg-pink-500 rounded-full flex justify-center items-center mb-4">
                  {game.player2.avatarimage && (
                    <img
                      src={game.player2.avatarimage}
                      alt={game.player2.avatarname}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                </div>
                <h3 className="text-white">{game.player2.username}</h3>
                <p className="text-white">{t("POINTS")}: {game.player2.points}</p>
              </div>

              <div className="flex flex-col items-center mt-6">
                {game.player1.points === "?" && game.player2.points === "?" && (
                  <button
                    onClick={() => startGame(gameNumber)}
                    className="mt-4 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                  >
                    {t("START_GAME")} {gameNumber}
                  </button>
                )}

                {game.player1.points === "0" && game.player2.points === "0" && (
                  <button
                    onClick={() => handlePickWinner(gameNumber)}
                    className="mt-4 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                  >
                    {t("PICK_WINNER")}
                  </button>
                )}
              </div>
            </div>
          );
        })}

      {checkIfCircleCompleted(currentCircle, guestCount) === 1 && (
        <button
          onClick={handleNextCircle}
          className="mt-6 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg"
        >
          {t("NEXT_CIRCLE")}
        </button>
      )}
    </div>
  );
};

export default TournamentSetupPage;
