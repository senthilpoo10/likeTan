import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import jwt from "@fastify/jwt";
import { Env } from "./env";
import { initializeDatabase } from "./database";
import { authRoutes } from "./routes/authRoutes";
import { userRoutes } from "./routes/userRoutes";
import { friendshipRoutes } from "./routes/friendshipRoutes";
import { startUserStatusUpdater } from "./routes/userStatusUpdater";
import { gameRoutes } from "./routes/gameRoutes";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: number; username: string }; // this is what you sign
    user: { id: number; username: string }; // this is what you get on request.user
  }
}

declare module "fastify" {
  interface FastifyRequest {
    payload: { id: number; username: string };
    user: { id: number; username: string };
  }

  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

// Create the Fastify app instance
export const app = Fastify({ logger: Env.Logger });

// Register JWT plugin for signing and verifying tokens
app.register(jwt, { secret: Env.JwtSecret });

// Define the 'authenticate' decorator with proper types
app.decorate(
  "authenticate",
  async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      // No need to reassign request.user manually here — Fastify JWT does it for you
    } catch (err) {
      // console.debug("The request wasnt verified, sending reply: ", reply);
      reply.status(401).send({ error: "Unauthorized" });
    }
  }
);

// Initialize the database (create tables if they don't exist)
initializeDatabase();

// Register authentication and user routes
app.register(authRoutes);
app.register(userRoutes);
app.register(friendshipRoutes);
app.register(gameRoutes);

// Start user status updater
startUserStatusUpdater(); // Start the interval for updating user statuses

// Root Route
app.get("/", async (request, reply) => {
  // this should send static frontend files
  return { message: "Hello, Fastify with TypeScript!" };
});

// Protected Route Example (Use authenticate for JWT verification)
app.get("/info", { preHandler: [app.authenticate] }, async (request, reply) => {
  return reply.send({
    user: request.user.username,
    id: request.user.id,
  });
});
