import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { appClient } from "../../service";

interface Player {
  self_id: number;
  id: number;
  username: string;
  online_status: string;
  friendStatus: string;
  showUnfriend?: boolean;
}

interface FriendRequest {
  sender_id: number;
  receiver_id: number;
  sender_username: string;
}

export const ConnectionsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [players, setPlayers] = useState<Player[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchFriendships = async () => {
      try {
        const response = await appClient.get("/friendships");
        const friendships: {
          sender_id: number;
          receiver_id: number;
          receiver_username: string;
          online_status: string;
          status: string;
        }[] = response.data;

        const players = friendships.map((f) => ({
          self_id: f.sender_id,
          id: f.receiver_id,
          username: f.receiver_username,
          online_status: f.online_status,
          friendStatus: f.status,
        }));

        setPlayers(players);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching friendships:", err);
        setError(t("FAILED_TO_LOAD_FRIENDSHIPS"));
        setLoading(false);
      }
    };

    fetchFriendships();
    const interval = setInterval(fetchFriendships, 3000);
    return () => clearInterval(interval);
  }, [t]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await appClient.get("/friendships/requests");
        setFriendRequests(response.data);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    };

    fetchFriendRequests();
    const interval = setInterval(fetchFriendRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddFriend = async (index: number) => {
    const newPlayers = [...players];
    const player = newPlayers[index];

    if (player.friendStatus === "Not Friend") {
      try {
        await appClient.post("/friendships/request", {
          receiver_id: player.id,
        });
        player.friendStatus = "Pending";
        setPlayers(newPlayers);
      } catch (err) {
        console.error("Error sending friend request:", err);
      }
    }
  };

  const handleUnfriend = async (index: number) => {
    const newPlayers = [...players];
    const player = newPlayers[index];

    await appClient.put("/friendships/unfriend", {
      sender_id: player.self_id,
      receiver_id: player.id,
    });

    player.friendStatus = "Not Friend";
    player.showUnfriend = false;
    setPlayers(newPlayers);
  };

  const handleFriendClick = (index: number) => {
    const newPlayers = [...players];
    const player = newPlayers[index];

    if (player.friendStatus === "Friend") {
      player.showUnfriend = !player.showUnfriend;
    }
    setPlayers(newPlayers);
  };

  const handleRequestAction = async (
    index: number,
    action: "accept" | "decline"
  ) => {
    const newRequests = [...friendRequests];
    const request = newRequests[index];

    if (action === "accept") {
      try {
        await appClient.put("/friendships/accept", {
          sender_id: request.sender_id,
          receiver_id: request.receiver_id,
        });

        newRequests.splice(index, 1);

        const newPlayers = players.map((player) => {
          if (player.id === request.sender_id) {
            return {
              ...player,
              friendStatus: "Friend",
            };
          }
          return player;
        });

        setPlayers(newPlayers);
        setFriendRequests(newRequests);
      } catch (error) {
        console.error("Error accepting friend request:", error);
      }
    } else if (action === "decline") {
      try {
        await appClient.put("/friendships/decline", {
          sender_id: request.sender_id,
          receiver_id: request.receiver_id,
        });

        newRequests.splice(index, 1);
        setFriendRequests(newRequests);
      } catch (error) {
        console.error("Error declining friend request:", error);
      }
    }
  };

  if (loading) return <div></div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex h-screen text-white relative bg-cover bg-center">
      <button
        onClick={() => navigate("/menu")}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
      >
        🔙 {t("BACK_TO_MENU")}
      </button>

      <div className="flex flex-col justify-center items-center w-full text-center">
        <h1 className="text-5xl font-bold bg-black bg-opacity-60 px-6 py-4 rounded-lg">
          {t("CONNECTIONS_TITLE")}
        </h1>
        <p className="mt-4 text-xl text-gray-700">
          {t("CONNECTIONS_SUBTITLE")}
        </p>

        <div className="mt-8 w-3/4 text-center">
          <h2 className="text-2xl text-gray-700">{t("FRIEND_REQUESTS")}</h2>
          <div className="mt-4 space-y-2">
            {friendRequests.length === 0 && (
              <p className="text-gray-500">{t("NO_PENDING_REQUESTS")}</p>
            )}
            {friendRequests.map((req, index) => (
              <div
                key={index}
                className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
              >
                <span className="text-white font-semibold">
                  {req.sender_username}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleRequestAction(index, "accept")}
                    className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg text-white"
                  >
                    {t("ACCEPT")}
                  </button>
                  <button
                    onClick={() => handleRequestAction(index, "decline")}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-white"
                  >
                    {t("DECLINE")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <table className="mt-8 w-3/4 text-center border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 text-lg bg-gray-700">{t("USERNAME")}</th>
              <th className="px-4 py-2 text-lg bg-gray-700">
                {t("ONLINE_STATUS")}
              </th>
              <th className="px-4 py-2 text-lg bg-gray-700">
                {t("FRIEND_STATUS")}
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={index} className="bg-gray-800">
                <td className="px-4 py-2">
                  <Link
                    to={`/user/${player.username}`}
                    className="text-blue-400 hover:text-blue-600 font-bold"
                  >
                    {player.username}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`font-bold ${
                      player.online_status === "online" ? "text-green-500" : ""
                    }`}
                  >
                    {player.online_status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {player.friendStatus === "Not Friend" && (
                    <button
                      onClick={() => handleAddFriend(index)}
                      className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white"
                    >
                      {t("ADD_FRIEND")}
                    </button>
                  )}
                  {player.friendStatus === "Pending" && (
                    <span className="bg-yellow-500 px-4 py-2 rounded-lg text-white">
                      {t("PENDING")}
                    </span>
                  )}
                  {player.friendStatus === "Friend" && (
                    <div className="inline-flex items-center">
                      <button
                        onClick={() => handleFriendClick(index)}
                        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white"
                      >
                        {t("FRIEND")}
                      </button>
                      {player.showUnfriend && (
                        <button
                          onClick={() => handleUnfriend(index)}
                          className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg text-white text-sm ml-2"
                        >
                          {t("UNFRIEND")}
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConnectionsPage;
