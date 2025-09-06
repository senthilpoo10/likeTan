import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const TicTacToeDuel = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { gameNumber } = useParams(); // Get game number from URL
  const gameIndex = parseInt(gameNumber || "1", 10); // Determine the current game number

  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "Player 1"
  );
  const [guestName, setGuestName] = useState(
    localStorage.getItem("guestName") || "Guest"
  );
  const [userAvatar, setUserAvatar] = useState(
    JSON.parse(localStorage.getItem("userAvatar") ?? "null")
  );
  const [guestAvatar, setGuestAvatar] = useState(
    JSON.parse(localStorage.getItem("guestAvatar") ?? "null")
  );
  const [userColor, setUserColor] = useState(
    localStorage.getItem("userColor") || "#000000"
  );
  const [guestColor, setGuestColor] = useState(
    localStorage.getItem("guestColor") || "#FFFFFF"
  );

  const [points, setPoints] = useState({
    player1:
      JSON.parse(localStorage.getItem(`points${gameIndex}`) ?? "0")?.player1 || 0,
    player2:
      JSON.parse(localStorage.getItem(`points${gameIndex}`)  ?? "0")?.player2 || 0,
  });

  const [gameType, setGameType] = useState(
    localStorage.getItem("gameType") || "boring"
  );
  const [board, setBoard] = useState<Array<"X" | "O" | "">>(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<"X" | "O" | "None">("None");
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (gameType === "boring") {
      setBoard(Array(9).fill(""));
    } else if (gameType === "madness") {
      setBoard(Array(25).fill(""));
    }
    setCurrentPlayer("X");
    setWinner("None");
    setIsGameOver(false);
  }, [gameType]);

  const boringWinPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const madnessWinPatterns = [
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
  ];

  const winPatterns =
    gameType === "boring" ? boringWinPatterns : madnessWinPatterns;

  const blockedCells = gameType === "madness" ? [4, 6, 15, 23] : [];

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
        if (
          blockedCells.includes(a) ||
          blockedCells.includes(b) ||
          blockedCells.includes(c)
        ) {
          continue;
        }
        if (
          board[a] &&
          board[a] === board[b] &&
          board[a] === board[c] &&
          board[a] === board[d]
        ) {
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
    const updatedPoints = {
      player1: winner === "X" ? 1 : 0,
      player2: winner === "O" ? 1 : 0,
    };
    localStorage.setItem(`points${gameIndex}`, JSON.stringify(updatedPoints));
    navigate("/duel-setup");
  };

  const getCellStyle = (index: number) => {
    if (gameType === "boring") {
      return { backgroundColor: "#f8c1d4" };
    }

    if (gameType === "madness") {
      if (blockedCells.includes(index)) {
        const imageUrl = getBlockedCellImage(index);
        return {
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        };
      }

      // Apply the colors based on the "X" or "O" value in the cell
      if (board[index] === "X") {
        return { backgroundColor: userColor }; 
      }
      if (board[index] === "O") {
        return { backgroundColor: guestColor }; 
      }
      return { backgroundColor: "#f1f1f1" }; // Default empty cell color
    }

    // If the cell is blocked, apply the background image for the blocked cell
    if (blockedCells.includes(index)) {
      const imageUrl = getBlockedCellImage(index);
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }

    // Default case for the "boring" game type or other types
    return {
      backgroundColor:
        board[index] === "X"
          ? userColor
          : board[index] === "O"
          ? guestColor
          : "#f1f1f1",
    };
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
      <button
        onClick={() => navigate("/menu")}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 {t("BACK_TO_MENU")}
      </button>

      <h1 className="text-4xl font-bold text-center mb-10">
        {t("START_TIC_TAC_TOE")}
      </h1>

      <div className="flex flex-row items-center justify-center gap-12 min-h-[650px]">
        {/* Player Section */}
        <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">
            X 👤 {userName || "Player 1"}
          </h2>
          {userAvatar ? (
            <>
              <img
                src={userAvatar.image}
                alt={userAvatar.name}
                className="w-full h-full max-w-[250px] max-h-[250px] object-contain border-4 border-blue-400 mb-4"
              />
              <p className="capitalize mb-6 text-xl">{userAvatar.name}</p>
            </>
          ) : (
            <p className="mb-6 italic text-gray-400 text-xl">
              {t("NO_AVATAR_SELECTED")}
            </p>
          )}
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
            O 👥 {guestName || "Guest"}
          </h2>
          {guestAvatar ? (
            <>
              <img
                src={guestAvatar.image}
                alt={guestAvatar.name}
                className="w-full h-full max-w-[250px] max-h-[250px] object-contain border-4 border-pink-400 mb-4"
              />
              <p className="capitalize mb-6 text-xl">{guestAvatar.name}</p>
            </>
          ) : (
            <p className="mb-6 italic text-gray-400 text-xl">
              {t("NO_AVATAR_SELECTED")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 text-2xl font-bold">
        {isGameOver
          ? winner === "None"
            ? t("ITS_A_TIE")
            : `${winner} ${t("WINNER")} 🎉`
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

export default TicTacToeDuel;
