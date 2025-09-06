import dotenv from "dotenv";
dotenv.config();

export const Env = {
  Host: process.env.BACKEND_HOST || "0.0.0.0",
  Port: parseInt(process.env.BACKEND_PORT || "8080", 10),
  Logger: (process.env.BACKEND_LOGGER || "false") === "true",
  JwtSecret: process.env.JWT_SECRET || "supersecretkey",
  EmailUser: process.env.EMAIL_USER || "transcendenceft8@gmail.com",
  EmailPass: process.env.EMAIL_PASS || "emkt cebr acsv dpwe",
  FrontendBaseUrl: "https://gang-gang-gang.serveo.net/",
  HashingSalt: "super-secret-hash-salt",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
} as const;
