import axios from "axios";
import {
  AppInfo,
  AppLoginInput,
  AppResponse,
  AppLoginCodeInput,
  AppLoginToken,
  AppRegisterInput,
  AppResetPassword,
  AppChangePassword,
  GameData,
  DuelGameData,
} from "./interface";

export const appClient = axios.create({
  baseURL: "/app",
  withCredentials: true,
});

appClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ping-pong-jwt"); // Get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Set token in header
    }
    return config;
  },
  (error) => {
    console.debug("checking jwt in interseptor returning reject");
    return Promise.reject(error);
  }
);

export const getAppInfo = async (): Promise<AppInfo | undefined> => {
  try {
    const res = await appClient.get<AppInfo>("/info");
    // console.debug("/info returned: ", res);
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 401) {
      return undefined; // silently fail for unauthorized
    }
    throw err; // propagate other errors
  }
};

export const appLogin = (data: AppLoginInput) =>
  appClient.post<AppResponse>("/login", data).then((data) => data.data);

export const appLoginCode = (data: AppLoginCodeInput) =>
  appClient.post<AppLoginToken>("/verify-2fa", data).then((data) => data.data);

export const appRegister = (data: AppRegisterInput) =>
  appClient.post<AppResponse>("/register", data).then((data) => data.data);

export const appResetPass = (data: AppResetPassword) =>
  appClient
    .post<AppResponse>("/reset-password", data)
    .then((data) => data.data);

export const appChangePass = (data: AppChangePassword) =>
  appClient
    .post<AppResponse>("/update-password", data)
    .then((data) => data.data);

export const startGame = (data: GameData) =>
  appClient.post("/start-tournament-game", data).then((res) => res.data);

export const startDuelGame = (data: DuelGameData) => {
  console.debug("startDuelGame frontend here");
  return appClient
    .post("/start-duel-ping-pong-game", data)
    .then((res) => res.data);
};

export const googleLoginAuth = (code: string) =>
  appClient.get(`/auth/google/callback?code=${code}`).then((res) => res.data);
// // export const appLogout = (data: AppLogoutInput) => appClient.put<AppResponse>('/logout', data).then(data => data.data);
