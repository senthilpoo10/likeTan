import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveGameResult } from "../game/saveGameResult";
import { useTranslation } from "react-i18next";

export const ShowAWinner = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const userAvatar = JSON.parse(localStorage.getItem("userAvatar") ?? "null");
  const guestAvatar = JSON.parse(localStorage.getItem("guestAvatar") ?? "null");
  const points1 = JSON.parse(localStorage.getItem("points1") ?? "null");
  const points2 = JSON.parse(localStorage.getItem("points2") ?? "null");
  const points3 = JSON.parse(localStorage.getItem("points3") ?? "null");
  const userName = localStorage.getItem("userName") ?? "null"; // Get logged-in username
  const guestName = localStorage.getItem("guestName") ?? "null"; // Get guest's username

  const [winner, setWinner] = useState<string | null>(null);
  const [loser, setLoser] = useState<string | null>(null);

  useEffect(() => {
    if (!points1 || !points2 || !points3 || !userAvatar || !guestAvatar) {
      if (!userAvatar || !guestAvatar) {
        console.error("User or Guest Avatar is missing in localStorage");
      }
      navigate("/menu");
      return;
    }
  }, [userAvatar, guestAvatar]);

  useEffect(() => {
    // Determine winner and loser based on points
    const totalPointsPlayer1 =
      points1.player1 + points2.player1 + points3.player1;
    const totalPointsPlayer2 =
      points1.player2 + points2.player2 + points3.player2;

    if (totalPointsPlayer1 > totalPointsPlayer2) {
      setWinner("player1");
      setLoser("player2");
    } else if (totalPointsPlayer1 < totalPointsPlayer2) {
      setWinner("player2");
      setLoser("player1");
    } else {
      setWinner("tie");
      setLoser("tie");
    }
    if (!winner || !loser) {
      console.debug("ShowAWinner: winner or loser state hasnt loaded yet");
      return;
    }

    saveResults();
  }, [points1, points2, points3]);

  const fallbackAvatar =
    "/avatars/queen_of_spoons/6f6e1f9c-7ea1-4902-a844-a3292cc6954d.png";

  const getAvatarPath = (player: string, status: string) => {
    const avatarName =
      player === "player1" ? userAvatar?.name : guestAvatar?.name;
    // If avatarName is found, construct the path for winner/loser images
    return avatarName ? `/${status}/${avatarName}.png` : fallbackAvatar;
  };

  const saveResults = async () => {
    const userWins = winner === "player1" ? 1 : 0;
    const guestWins = winner === "player2" ? 1 : 0;

    saveGameResult({
      username: userName || "",
      guest_name: guestName || "",
      userAvatar: userAvatar?.name || "",
      guestAvatar: guestAvatar?.name || "",
      userWins,
      guestWins,
      gameName: "tic-tac-toe",
      // rounds_json: JSON.stringify(tournamentResults),
    });
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("guestAvatar");
    localStorage.removeItem("points1");
    localStorage.removeItem("points2");
    localStorage.removeItem("points3");
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

      <h1 className="text-4xl text-black mt-8 mb-4">{t("GAME_OVER")}</h1>

      {winner === "tie" ? (
        <div className="text-black text-2xl">{t("ITS_A_TIE")}</div>
      ) : (
        <div className="flex justify-around items-center w-full max-w-5xl">
          {/* Winner Section */}
          <div className="flex flex-col items-center">
            <h2 className="text-black text-xl mb-4">
              {winner === "player1" ? userName : guestName} {t("IS_WINNER")}
            </h2>
            <img
              src={getAvatarPath(
                winner === "player1" ? "player1" : "player2",
                "winning"
              )}
              alt="Winner Avatar"
              className="w-96 h-96 object-contain mb-4"
            />
            <p className="text-black">{t("WINNER")}</p>
          </div>

          {/* Loser Section */}
          <div className="flex flex-col items-center">
            <h2 className="text-black text-xl mb-4">
              {loser === "player1" ? userName : guestName} {t("LOSES")}
            </h2>
            <img
              src={getAvatarPath(
                loser === "player1" ? "player1" : "player2",
                "losing"
              )}
              alt="Loser Avatar"
              className="w-96 h-96 object-contain mb-4"
            />
            <p className="text-black">{t("LOSER")}</p>
          </div>
        </div>
      )}
    </div>
  );
};
