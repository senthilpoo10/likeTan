//save duel for backend
import { appClient } from "../../service/index";

export async function saveGameResult(params: {
  username: string;
  guest_name: string | undefined;
  userAvatar: string;
  guestAvatar: string;
  userWins: number;
  guestWins: number;
  gameName: "ping-pong" | "tic-tac-toe";
  rounds_json?: string;
}) {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");
  try {
    const rounds =
      params.rounds_json ??
      JSON.stringify([
        [
          {
            p1_username: params.username,
            p2_username: params.guest_name,
            p1_avatar: params.userAvatar,
            p2_avatar: params.guestAvatar,
            p1_wins: params.userWins,
            p2_wins: params.guestWins,
          },
        ],
      ]);

    // Prepare the request body
    const requestBody = {
      username: params.username,
      rounds,
      gameName: params.gameName,
    };

    console.debug(
      "before post in saveGameResult. rounds is: ",
      rounds,
      ", gamename is ",
      params.gameName
    );
    const response = await appClient
      .post(
        `/api/save-game-session`,
        requestBody, // Pass the request body directly
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => res.data)
      .catch((err) => {
        console.debug("error with saving game sesh: ", err);
        throw err;
      });

    if (!response || response.error) {
      throw new Error(
        "Failed to save game session. Res: " + JSON.stringify(response)
      );
    }

    console.log("✅ Game session saved successfully!");
  } catch (error) {
    console.error("❌ Error saving game session:", error);
  }
}
