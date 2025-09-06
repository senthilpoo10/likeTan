import { appClient } from "./index";
import { UserProfile, Game } from "./interface";

export const getUserProfile = async () => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;

  try {
    const response = await appClient.get<UserProfile>(`/get-profile/${userId}`);

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const getUsernameFromToken = () => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (token) {
    const decoded: any = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    return decoded.username;
  }
  return "";
};

export const updateProfileField = (field: string, value: string) => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.id;

    if (!userId) throw new Error("User ID not found in token");

    return appClient
      .patch(`/update-field/${userId}`, { field, value })
      .then((res) => res.data);
  } catch (error) {
    console.error("Failed to decode token or send patch request:", error);
    throw error;
  }
};

export const uploadProfilePicture = async (file: File) => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("id", userId.toString());

  return appClient
    .post(`/upload-profile-pic/${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

export const getFriends = () => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;

  return appClient
    .get(`/friendships?user_id=${userId}&status=Friend`)
    .then((res) => res.data);
};

export const getFriendRequests = () => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;

  return appClient
    .get(`/friendships?user_id=${userId}&status=Pending`)
    .then((res) => res.data);
};

export const sendFriendRequest = (receiverId: number) => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const senderId = payload.id;

  return appClient.post(`/friendships/request`, {
    sender_id: senderId,
    receiver_id: receiverId,
  });
};

export const acceptFriendRequest = (friendshipId: number) => {
  return appClient.patch(`/friendships/${friendshipId}`, { status: "Friend" });
};

export const declineFriendRequest = (friendshipId: number) => {
  return appClient.delete(`/friendships/${friendshipId}`);
};

export const removeFriend = (friendshipId: number) => {
  return appClient.delete(`/friendships/${friendshipId}`);
};

export const getGamestatsProfile = () => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");

  return appClient
    .get<UserProfile[]>("/get-all-profiles", {})
    .then((res) => res.data);
};

export const addGameToTable = async (file: Game) => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");

  return appClient.post<Game>("/post-games", file, {}).then((res) => res.data);
};

export const getUserGames = async (username: string) => {
  const token = localStorage.getItem("ping-pong-jwt");
  if (!token) throw new Error("User not authenticated");
  return appClient
    .get<Game[]>(`/get-games/${username}`, {})
    .then((res) => res.data);
};
