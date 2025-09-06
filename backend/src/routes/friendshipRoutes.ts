import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { database } from "../database";

export async function friendshipRoutes(app: FastifyInstance) {
  // Send a friend request
  app.post(
    "/friendships/request",
    { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { receiver_id } = request.body as { receiver_id: number };
      const sender_id = request.user.id;

      if (sender_id === receiver_id) {
        return reply.status(400).send({ error: "You cannot friend yourself" });
      }

      try {
        await database.db.run(
          `UPDATE friendships SET status = ? WHERE sender_id = ? AND receiver_id = ?`,
          ["Pending", sender_id, receiver_id]
        );

        return reply.send({ message: "Set Friend Status to Pending" });
      } catch (error) {
        console.error("Inserted (pending) status into Database:", error);
        return reply
          .status(500)
          .send({ error: "Failed to set Friend status to Pending" });
      }
    }
  );

  // Get pending friend requests for the current user
  app.get(
    "/friendships/requests",
    { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.id; // Get the current user's ID from the authenticated session

      try {
        // Fetch pending friend requests for the current user from the 'friendships' table
        const requests = await database.db.all(
          `SELECT * 
         FROM friendships 
         WHERE receiver_id = ? AND status = 'Pending'`, // Only look for 'Pending' requests for the current user
          [userId] // Pass the userId as the query parameter
        );

        return reply.send(requests); // Return the list of friend requests
      } catch (error) {
        console.error("Error fetching friend requests:", error);
        return reply
          .status(500)
          .send({ error: "Failed to fetch friend requests" });
      }
    }
  );

  app.get(
    "/friendships",
    { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUserId = request.user.id;

      try {
        // const friendships = await database.db.all(
        //   `
        //   SELECT *
        //   FROM friendships
        //   WHERE sender_id = ?
        //   `,
        //   [currentUserId]
        // );
        const friendships = await database.db.all(
          `
          SELECT
            f.sender_id,
            f.receiver_id,
            f.receiver_username,
            u.online_status,
            f.status
          FROM friendships f
          JOIN users u ON u.id = f.receiver_id
          WHERE f.sender_id = ?
          `,
          [currentUserId]
        );

        return reply.send(friendships);
      } catch (error) {
        console.error("Error fetching friendships:", error);
        return reply.status(500).send({ error: "Failed to fetch friendships" });
      }
    }
  );

  app.put(
    "/friendships/decline",
    { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUserId = request.user.id;
      const { sender_id, receiver_id } = request.body as {
        sender_id: number;
        receiver_id: number;
      };

      // Ensure only the receiver can decline
      if (receiver_id !== currentUserId) {
        return reply
          .status(403)
          .send({ error: "You can only decline requests sent to you." });
      }

      try {
        const result1 = await database.db.run(
          `
        UPDATE friendships
        SET status = 'Not Friend'
        WHERE sender_id = ? AND receiver_id = ?
        `,
          [sender_id, receiver_id]
        );

        const result2 = await database.db.run(
          `
        UPDATE friendships
        SET status = 'Not Friend'
        WHERE sender_id = ? AND receiver_id = ?
        `,
          [receiver_id, sender_id] // <- inverse direction
        );

        if (result1.changes === 0 && result2.changes === 0) {
          return reply.status(404).send({ error: "Friend request not found." });
        }

        return reply.send({
          message: "Friend request declined and status updated.",
        });
      } catch (error) {
        console.error("Error declining friend request:", error);
        return reply
          .status(500)
          .send({ error: "Failed to decline friend request" });
      }
    }
  );

  app.put(
    "/friendships/accept",
    { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUserId = request.user.id;
      const { sender_id, receiver_id } = request.body as {
        sender_id: number;
        receiver_id: number;
      };

      // Ensure only the receiver can decline
      if (receiver_id !== currentUserId) {
        return reply
          .status(403)
          .send({ error: "You can only accept requests sent to you." });
      }

      try {
        const result1 = await database.db.run(
          `
        UPDATE friendships
        SET status = 'Friend'
        WHERE sender_id = ? AND receiver_id = ?
        `,
          [sender_id, receiver_id]
        );

        const result2 = await database.db.run(
          `
        UPDATE friendships
        SET status = 'Friend'
        WHERE sender_id = ? AND receiver_id = ?
        `,
          [receiver_id, sender_id] // <- inverse direction
        );

        if (result1.changes === 0 && result2.changes === 0) {
          return reply.status(404).send({ error: "Friend status not found." });
        }

        return reply.send({
          message: "Friend request accepted and status updated.",
        });
      } catch (error) {
        console.error("Error declining friend request:", error);
        return reply
          .status(500)
          .send({ error: "Failed to accept friend request" });
      }
    }
  );

  app.put(
    "/friendships/unfriend",
    { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUserId = request.user.id;
      const { sender_id, receiver_id } = request.body as {
        sender_id: number;
        receiver_id: number;
      };

      try {
        const result1 = await database.db.run(
          `
        UPDATE friendships
        SET status = 'Not Friend'
        WHERE sender_id = ? AND receiver_id = ?
        `,
          [sender_id, receiver_id]
        );

        const result2 = await database.db.run(
          `
        UPDATE friendships
        SET status = 'Not Friend'
        WHERE sender_id = ? AND receiver_id = ?
        `,
          [receiver_id, sender_id] // <- inverse direction
        );

        if (result1.changes === 0 && result2.changes === 0) {
          return reply.status(404).send({ error: "Friend status not found." });
        }

        return reply.send({ message: "Friend unfriended and status updated." });
      } catch (error) {
        console.error("Error unfriending friend :", error);
        return reply.status(500).send({ error: "Failed to unfriend friend" });
      }
    }
  );

  // Get all users except the current one
  app.get(
    "/users",
    { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUserId = request.user.id;

      try {
        const users = await database.db.all(
          `SELECT id, username FROM users WHERE id != ?`, // Adjust query as needed
          [currentUserId]
        );

        return reply.send(users);
      } catch (error) {
        return reply.status(500).send({ error: "Failed to fetch users" });
      }
    }
  );

  // Updates last_activity and online_status of user
  app.post(
    "/update-activity",
    { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.id;

      try {
        const now = Date.now();
        await database.db.run(
          `
        UPDATE users
        SET online_status = 'online', last_activity = ?
        WHERE id = ?
        `,
          [now, userId]
        );

        return reply.send({ success: true });
      } catch (err) {
        console.error("Failed to update user activity", err);
        return reply.status(500).send({ error: "Activity update failed" });
      }
    }
  );
}
