import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const TournamentGamePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { gameNumber } = useParams();
  const gameIndex = gameNumber ? parseInt(gameNumber, 10) : null;

  // Access the passed player data from navigate state
  const location = useLocation();
  const { player1, player2, gameIndex: gameFromState } = location.state || {};
  console.log({ player1, player2, gameIndex: gameFromState });

  // Initialize game state
  const [board, setBoard] = useState<Array<"X" | "O" | "">>(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<"X" | "O" | "None">("None");
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameType, setGameType] = useState(
    localStorage.getItem("gameType") || "boring"
  );

  const [tournamentData, setTournamentData] = useState<any>(null);

  // Check if it's a "madness" or "boring" game
  const isMadnessGame = gameType === "madness";
  const gridSize = isMadnessGame ? 25 : 9;

  const blockedCells = isMadnessGame ? [4, 6, 15, 23] : [];

  useEffect(() => {
    setBoard(Array(gridSize).fill(""));
    setCurrentPlayer("X");
    setWinner("None");
    setIsGameOver(false);
  }, [gameIndex, gameType]);

  const winPatterns = isMadnessGame
    ? [
        [0, 1, 2, 3],
        [10, 11, 12, 13],
        [11, 12, 13, 14],
        [16, 17, 18, 19],
        [1, 7, 13, 19],
        [8, 12, 16, 20],
        [9, 13, 17, 21],
        [2, 7, 12, 17],
        [7, 12, 17, 22],
        [3, 8, 13, 18],
        [9, 14, 19, 24],
      ]
    : [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];

  const checkForWinner = () => {
    if (gameType === "boring") {
      for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          setWinner(board[a]);
          setIsGameOver(true); // Stop the game when a winner is found
          return;
        }
      }
    } else {
      for (const pattern of winPatterns) {
        const [a, b, c, d] = pattern;
        if (blockedCells.includes(a) ||
            blockedCells.includes(b) ||
            blockedCells.includes(c)
        ) {
          continue;
        }
        if (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] === board[d]) {
          setWinner(board[a]);
          setIsGameOver(true); // Stop the game when a winner is found
          return;
        }
      }
    }

    const remainingEmptyCells = board.filter(
      (cell, index) => cell === "" && !blockedCells.includes(index)
    );
    if (remainingEmptyCells.length === 0 && !isGameOver) {
      setWinner("None");
      setIsGameOver(true); // Declare the game a tie if no empty spaces left
    }
  };

  const handleCellClick = (index: number) => {
    if (
      board[index] !== "" ||
      isGameOver ||
      (gameType === "madness" && blockedCells.includes(index))
    )
      return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  useEffect(() => {
    checkForWinner();
  }, [board]);

  const handleBackToSetup = () => {
    const updatedTournamentData = JSON.parse(
      localStorage.getItem("tournamentData") || "{}"
    );

    if (!player1 || !player2) {
      console.error("Player data missing.");
      return;
    }

    console.log(`Game index in tournament ${gameIndex}`);

    if (!updatedTournamentData[`game${gameIndex}`]) {
      console.error(`Game data for game${gameIndex} missing.`);
      return;
    }

    // Assign points based on winner
    if (winner === "X") {
      updatedTournamentData[`game${gameIndex}`].player1.points = "1";
      updatedTournamentData[`game${gameIndex}`].player2.points = "0";
    } else if (winner === "O") {
      updatedTournamentData[`game${gameIndex}`].player1.points = "0";
      updatedTournamentData[`game${gameIndex}`].player2.points = "1";
    } else if (winner === "None") {
      updatedTournamentData[`game${gameIndex}`].player1.points = "0";
      updatedTournamentData[`game${gameIndex}`].player2.points = "0";
    }

    // Save updated tournament data
    localStorage.setItem(
      "tournamentData",
      JSON.stringify(updatedTournamentData)
    );
    navigate("/tournament-setup");
  };

  const getCellStyle = (index: number) => {
    if (blockedCells.includes(index)) {
      return {
        backgroundImage: `url(${getBlockedCellImage(index)})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }
    const cellValue = board[index];
    if (cellValue !== "X" && cellValue !== "O") return {};
    try {
      const color =
        cellValue === "X"
          ? player1.color || "lightpink"
          : player2.color || "lightpink";

      console.log(
        "Cell value: " +
          cellValue +
          ", player1.color: " +
          player1.color +
          ", player2.color: " +
          player2.color
      );

      return { backgroundColor: color };
    } catch (e) {
      console.error("Failed to parse currentGameData:", e);
      return {};
    }
  };

  const getBlockedCellImage = (index: number) => {
    if (index === 4) return "/game_assets/cup.png";
    if (index === 6) return "/game_assets/spoon.png";
    if (index === 15) return "/game_assets/cup2.png";
    if (index === 23) return "/game_assets/gp.png";
    return "";
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center text-white p-8 flex flex-col items-center"
      style={{
        backgroundImage:
          "url('/background/360_F_339060225_w8ob8LjMJzPdEqD9UFxbE6ibcKx8dFrP.jpg')",
      }}
    >
      <h1 className="text-4xl font-bold text-center mb-10">
        {t("START_TIC_TAC_TOE")}
      </h1>

      <div className="flex flex-row items-center justify-center gap-12 min-h-[650px]">
        {/* Player Section */}
        <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">
            X 👤 {player1.username || "Player 1"}
          </h2>
          <img
            src={player1.avatarimage}
            alt={player1.avatarname}
            className="w-full h-full max-w-[250px] max-h-[250px] object-contain border-4 border-blue-400 mb-4"
          />
          <p className="capitalize mb-6 text-xl">{player1.avatarname}</p>
        </div>

        {/* Game Board Section */}
        <div
          className={`grid ${
            gameType === "boring" ? "grid-cols-3" : "grid-cols-5"
          } gap-6 mb-6 max-w-[500px]`}
        >
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className="w-20 h-20 text-4xl font-bold border-4 border-gray-400 rounded-md flex justify-center items-center"
              style={getCellStyle(index)}
            >
              {cell}
            </button>
          ))}
        </div>

        {/* Guest Section */}
        <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">
            O 👥 {player2.username || "Guest"}
          </h2>
          <img
            src={player2.avatarimage}
            alt={player2.avatarname}
            className="w-full h-full max-w-[250px] max-h-[250px] object-contain border-4 border-pink-400 mb-4"
          />
          <p className="capitalize mb-6 text-xl">{player2.avatarname}</p>
        </div>
      </div>

      <div className="mt-6 text-2xl font-bold">
        {isGameOver
          ? winner === "None"
            ? t("ITS_A_TIE")
            : `${winner} ${t("WINS")} 🎉`
          : `${t("ITS_TURN", { player: currentPlayer === "X" ? "X" : "O" })}`}
      </div>

      {isGameOver && (
        <button
          onClick={handleBackToSetup}
          className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl mt-4"
        >
          {t("BACK_TO_SETUP")} 🔙
        </button>
      )}
    </div>
  );
};

export default TournamentGamePage;
