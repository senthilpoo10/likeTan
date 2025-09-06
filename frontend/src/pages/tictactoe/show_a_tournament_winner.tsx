import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveGameResult } from "../game/saveGameResult";
import { useTranslation } from "react-i18next";

type Winner = {
  username: string;
  avatarname: string;
  points: number | string;
};

export const ShowATournamentWinner = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [winner, setWinner] = useState<Winner | null>(null);

  useEffect(() => {
    const storedTournamentData = localStorage.getItem("tournamentData");
    if (!storedTournamentData) {
      console.error("No tournament data found");
      return;
    }

    try {
      const data = JSON.parse(storedTournamentData);
      if (!data.winner || data.winner === "?") {
        console.error("No winner found in tournament data");
        return;
      }
      setWinner(data.winner);
      saveResults();
    } catch (error) {
      console.error("Failed to parse tournament data:", error);
    }
  }, []);

  const fallbackAvatar =
    "/avatars/queen_of_spoons/6f6e1f9c-7ea1-4902-a844-a3292cc6954d.png";

  const getAvatarPath = (avatarname: string) => {
    return avatarname ? `/winning/${avatarname}.png` : fallbackAvatar;
  };

  const saveResults = async () => {
    const saveRounds = JSON.parse(
      localStorage.getItem("tournamentData") || "{}"
    );

    const convertRounds = Object.entries(saveRounds)
      .filter(([key]) => key !== "winner")
      .map(([key, game]) => {
        return [
          {
            p1_username: game.player1.username,
            p2_username: game.player2.username,
            p1_avatar: game.player1.avatarname,
            p2_avatar: game.player2.avatarname,
            p1_wins: game.player1.points === "1" ? 1 : 0,
            p2_wins: game.player2.points === "1" ? 1 : 0,
          },
        ];
      });

    saveGameResult({
      username: convertRounds[0][0].p1_username || "",
      guest_name: "",
      userAvatar: "",
      guestAvatar: "",
      userWins: 0,
      guestWins: 0,
      gameName: "tic-tac-toe",
      rounds_json: JSON.stringify(convertRounds),
    });
    localStorage.removeItem("tournamentData");
  };

  if (!winner) {
    return (
      <div className="flex flex-col justify-center items-center p-4 bg-gray-900 min-h-screen text-white">
        Loading winner...
      </div>
    );
  }

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

      <h1 className="text-5xl font-bold text-black mt-12 mb-8">
        🏆 {t("GAME_OVER")}
      </h1>

      <div className="flex flex-col items-center bg-white bg-opacity-80 p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-semibold text-green-800 mb-4">
          {winner.username} {t("IS_WINNER")}
        </h2>
        <img
          src={getAvatarPath(winner.avatarname)}
          alt="Winner Avatar"
          className="w-72 h-72 object-contain mb-4"
        />
        <p className="text-xl text-gray-800">
          {t("POINTS")} {winner.points}
        </p>
      </div>
    </div>
  );
};
