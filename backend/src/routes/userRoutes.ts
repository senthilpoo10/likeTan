import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { database } from "../database";
import { Env } from "../env";
//import { useResolvedPath } from 'react-router-dom'
import { fdatasync } from "fs";
import fastifyMultipart from "@fastify/multipart";
import fs from "fs";
import { dirname } from "path";
import { pipeline } from "stream/promises";
import { sendGameAchievementEmail } from "../emailService";
import validator from "validator";

// change it completely when you start working on user stuff!!!
interface UpdateField {
  field: string;
  value: any;
}

interface LogoutInput {
  username: string;
}

export const userRoutes = async (app: FastifyInstance) => {
  // Retrieving Profile Data
  app.get(
    "/get-profile/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      console.log("Fetching profile for ID:", id); // 👈 Add this line

      if (!validator.isNumeric(id)) {
        return reply.status(400).send({ error: "Invalid user ID format." });
      }
      try {
        const profile = await database.db.get(
          `SELECT username, email, profilePic, firstName, lastName, gender, dateOfBirth, wins, losses, language, favAvatar 
         FROM users WHERE id = ?`,
          [id]
        );

        if (!profile) {
          return reply.code(404).send({ error: "User not found" });
        }

        return reply.send(profile);
      } catch (err) {
        console.error("Error fetching profile:", err); // 👈 Catch and log error
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  app.get(
    "/get-all-profiles",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      try {
        const profiles = await database.db.all(
          `SELECT username, wins, losses FROM users`
        );

        if (!profiles || profiles.length === 0) {
          console.debug("error fetching profiles:", profiles);
          return reply.code(404).send({ error: "No profiles found" });
        }

        console.debug("Fetched profiles:", profiles);

        return reply.send(profiles);
      } catch (err) {
        console.error("Error fetching profiles:", err);
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  // Profile Update
  app.patch(
    "/update-field/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { field, value } = request.body as { field: string; value: string };

      console.log("🔧 PATCH /update-field called with:", { id, field, value });

      if (!validator.isNumeric(id)) {
        return reply.status(400).send({ error: "Invalid user ID format." });
      }

      const allowedFields = [
        "firstName",
        "lastName",
        "gender",
        "dateOfBirth",
        "language",
        "favAvatar",
      ];

      if (!allowedFields.includes(field)) {
        console.warn("⛔ Blocked update to disallowed field:", field);
        return reply.code(400).send({ error: "Field not allowed to update" });
      }

      if (field === "firstName" || field === "lastName") {
        if (!validator.isAlpha(value, "en-US", { ignore: " " })) {
          return reply
            .status(400)
            .send({ error: "Name must contain only alphabetic characters." });
        }
      }

      if (field === "dateOfBirth") {
        if (!validator.isDate(value)) {
          return reply.status(400).send({ error: "Invalid date format." });
        }
      }

      try {
        const query = `UPDATE users SET ${field} = ? WHERE id = ?`;
        await database.db.run(query, [value, id]);
        console.log("✅ Successfully updated field.");
        return reply.send({ success: true });
      } catch (err) {
        console.error("🔥 Error updating field:", err);
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  // Uploading profile pic
  app.register(require("@fastify/multipart"));

  app.post(
    "/upload-profile-pic/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      if (!validator.isNumeric(id)) {
        return reply.status(400).send({ error: "Invalid user ID format." });
      }

      const data = await request.file({
        limits: {
          fileSize: 5 * 1024 * 1024,
        },
      }); // using fastify-multipart
      if (!data) {
        return reply.code(400).send({ error: "No file uploaded" });
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.code(400).send({ error: "Invalid file type" });
      }

      const filePath = `/profile-pics/uploads/${data.filename}`;
      try {
        await pipeline(
          data.file,
          fs.createWriteStream(
            `${dirname(process.cwd())}/frontend/public${filePath}`
          )
        );
      } catch (error) {
        console.log(error);
        return reply.code(500).send({ error: "Error saving file" });
      }

      await database.db.run("UPDATE users SET profilePic = ? WHERE id = ?", [
        filePath,
        id,
      ]);

      return reply.send({ success: true, profilePic: filePath });
    }
  );

  // Getting public profile's information based on username
  app.get(
    "/get-public-profile/:username",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { username } = request.params as { username: string };

      if (!validator.isAlphanumeric(username)) {
        return reply.status(400).send({ error: "Invalid username format." });
      }

      try {
        const profile = await database.db.get(
          `
        SELECT username, email, profilePic, firstName, lastName, dateOfBirth, gender, wins, losses, language, favAvatar
        FROM users WHERE username = ?
      `,
          [username]
        );

        if (!profile) {
          return reply.code(404).send({ error: "User not found" });
        }

        return reply.send(profile);
      } catch (error) {
        console.error("Error fetching public profile:", error);
        return reply.code(500).send({ error: "Failed to load profile" });
      }
    }
  );

  // Game Achievement Route
  app.post(
    "/game-achievement",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { username, email, position } = request.body as {
        username: string;
        email: string;
        position: number;
      };

      if (!validator.isAlphanumeric(username)) {
        return reply.status(400).send({ error: "Invalid username format." });
      }

      if (!validator.isEmail(email)) {
        return reply.status(400).send({ error: "Invalid email format." });
      }

      if (!validator.isNumeric(position.toString())) {
        return reply.status(400).send({ error: "Invalid position format." });
      }

      if (position === 1) {
        // Send congratulatory email when user gets 1st place
        await sendGameAchievementEmail(email, username);
      }

      return reply.send({
        message: `Game result: ${username} finished in position ${position}`,
      });
    }
  );

  app.post(
    "/post-games",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id_user, rounds } = request.body as {
        id_user: string | undefined;
        rounds: any[];
      };

      await database.db.run(
        `INSERT INTO games (id_user, rounds_json) VALUES (?, ?)`,
        [id_user, JSON.stringify(rounds)]
      );

      console.debug(
        `inserted into games new row with id_user=${id_user}, rounds_json =${rounds}`
      );
      reply.send({ status: "ok" });
    }
  );

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
    rounds: Match[][];
  }

  app.get(
    "/get-games/:username",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { username } = request.params as { username: string };
      try {
        const idUser = await database.db.get(
          `SELECT id FROM users WHERE username = ?`,
          [username]
        );

        const userGames: Game[] = await database.db.all(
          `
        SELECT id_game, id_user, date, rounds_json, game_name
        FROM games WHERE id_user = ?
      `,
          [idUser.id]
        );

        if (!userGames) {
          return reply.code(404).send({ error: "Games not found" });
        }

        console.debug("userGames: ", userGames);

        return reply.send(userGames);
      } catch (error) {
        console.error("Error fetching user games:", error);
        return reply.code(500).send({ error: "Failed to fetch user games" });
      }
    }
  );
};
