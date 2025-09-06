import { FastifyInstance } from "fastify";
import { database } from "../database";
import validator from "validator";

//duplicated interfaces from the interface.ts in frontend
interface Match {
  p1_username: string;
  p2_username: string;
  p1_avatar: string;
  p2_avatar: string;
  p1_wins: number;
  p2_wins: number;
}

interface Game {
  id_user: string | undefined;
  id_game: number;
  date: string;
  game_name: string;
  rounds_json: Match[][];
}

export const gameRoutes = async (app: FastifyInstance) => {
  // Duel Game Route (unchanged)
  app.post(
    "/start-duel-ping-pong-game",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      try {
        const { user, userAvatar, guest, guestAvatar } = request.body as {
          user: string;
          userAvatar: string;
          guest: string;
          guestAvatar: string;
        };

        if (
          !validator.isAlphanumeric(user) ||
          !validator.isAlphanumeric(guest)
        ) {
          return reply.status(400).send({ error: "Invalid username format." });
        }

        if (!user || !userAvatar || !guest || !guestAvatar) {
          return reply.status(400).send({ error: "Missing fields" });
        }
        // check if user exists
        const userId = await database.db.get(
          "SELECT id FROM users WHERE username = ?",
          [user]
        );
        if (!userId) {
          return reply.status(401).send({ error: "User not found" });
        }

        return reply.send({
          message: "Duel game session created successfully",
        });
      } catch (err) {
        console.debug("Failed to start a game: ", err);
        return reply
          .status(500)
          .send({ message: "Duel game session creation encountered an error" });
      }
    }
  );

  // 🆕 Tournament Game Route
  app.post(
    "/start-tournament-game",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      try {
        const { user, userAvatar, guests } = request.body as {
          user: string;
          userAvatar: string;
          guests: { username: string; avatar: string }[];
        };

        if (
          !user ||
          !userAvatar ||
          !Array.isArray(guests) ||
          guests.length === 0
        ) {
          return reply.status(400).send({ error: "Missing or invalid fields" });
        }

        // check if user exists
        const userId = await database.db.get(
          "SELECT id FROM users WHERE username = ?",
          [user]
        );
        if (!userId) {
          return reply.status(401).send({ error: "User not found" });
        }

        return reply.send({
          message: "Tournament session created successfully",
        });
      } catch (err) {
        console.debug("Failed to start a game: ", err);
        return reply
          .status(500)
          .send({ message: "Duel game session creation encountered an error" });
      }
    }
  );

  app.post(
    "/api/save-game-session",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { username, rounds, gameName } = request.body as {
        username: string;
        rounds: string; // JSON string representing the game rounds
        gameName: string; // e.g., "ping-pong" or "tic-tac-toe"
      };

      if (!validator.isAlphanumeric(username)) {
        console.debug("/api/save-game-session: Invalid username: ", username);
        return reply.status(400).send({ error: "Invalid username format." });
      }

      if (gameName !== "ping-pong" && gameName !== "tic-tac-toe") {
        console.debug("/api/save-game-session: Invalid gamename: ", gameName);
        return reply.status(400).send({ error: "Invalid gamename format." });
      }
      try {
        const idUser = await database.db.get(
          `SELECT id FROM users WHERE username = ?`,
          [username]
        );

        if (!idUser) {
          console.debug("/api/save-game-session: User not found");
          return reply.status(400).send({ error: "User not found." });
        }
        // Insert the game session into the "games" table
        await database.db.run(
          `
        INSERT INTO games (id_user, rounds_json, game_name)
        VALUES (?, ?, ?)
        `,
          [idUser.id, rounds, gameName]
        );

        // Parse the rounds to calculate wins and losses for p1_username
        const roundsParse = JSON.parse(rounds) as Array<
          Array<{
            p1_username: string;
            p2_username: string;
            p1_wins: number;
            p2_wins: number;
          }>
        >;

        const userStats: Record<string, { wins: number; losses: number }> = {};

        let ticTacUser: string = "";
        // Aggregate wins and losses for each p1_username that exists in the database
        for (const round of roundsParse) {
          for (const match of round) {
            // Check if p1_username exists in the database
            const p1User = await database.db.get(
              `SELECT id FROM users WHERE username = ?`,
              [match.p1_username]
            );

            if (!p1User) {
              console.warn(
                `Skipping stats update for non-existent user: ${match.p1_username}`
              );
              continue; // Skip if p1_username does not exist
            }
            ticTacUser = match.p1_username;

            if (!userStats[match.p1_username]) {
              userStats[match.p1_username] = { wins: 0, losses: 0 };
            }

            userStats[match.p1_username].wins += match.p1_wins;
            userStats[match.p1_username].losses += match.p2_wins;
          }
        }

        if (gameName === "tic-tac-toe" && ticTacUser) {
          if (roundsParse.at(-1)?.at(-1)?.p1_username !== ticTacUser) {
            userStats[ticTacUser].losses += 1;
          }
        }

        // Update the users table with the aggregated stats
        for (const [username, stats] of Object.entries(userStats)) {
          await database.db.run(
            `
        UPDATE users
        SET wins = wins + ?, losses = losses + ?
        WHERE username = ?
        `,
            [stats.wins, stats.losses, username]
          );
        }

        reply.send({ success: true });
      } catch (err) {
        console.error("Error saving game session:", err);
        reply
          .status(500)
          .send({ success: false, error: "Failed to save game session" });
      }
    }
  );
};
