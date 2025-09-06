export interface AppInfo {
  user: {
    username: string;
    id: number;
  };
}

export interface AppLoginInput {
  username: string;
  password: string;
}

export interface AppResponse {
  message: string;
}

export interface AppLoginToken {
  token: string;
}

export interface AppLoginCodeInput {
  username: string;
  code: string;
}

export interface AppRegisterInput {
  username: string;
  password: string;
  email: string;
}

export interface AppResetPassword {
  email: string;
}

export interface AppChangePassword {
  token: string;
  password: string;
}

export interface ProfileData {
  username: string;
  email: string;
  profilePic: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string; // ISO YYYY-MM-DD
  wins: number;
  losses: number;
  language: "english" | "finnish" | "serbian" | "russian";
}

export interface UpdateProfileField {
  field: string;
  value: any;
}

export interface ProfileProps {
  userId: string;
}

export interface UserProfile {
  username: string;
  email: string;
  profilePic: string | null;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  wins: number;
  losses: number;
  language: string;
  favAvatar: string;
}

export interface UpdateFieldInput {
  field: string;
  value: string;
}

export interface GameData {
  user: string;
  userAvatar: string;
  guests: {
    username: string;
    avatar: string;
  }[];
}

export interface DuelGameData {
  user: string
  userAvatar: string
  guest: string
  guestAvatar: string
  userColor: string | null
  guestColor: string | null
  gameType : string
}

export interface Match {
  p1_username: string;
  p2_username: string;
  p1_avatar: string;
  p2_avatar: string;
  p1_wins: number;
  p2_wins: number;
}

export interface Game {
  id_user: string | undefined;
  id_game: number;
  date: string;
  game_name: string;
  rounds_json: Match[][];
}
