import { database } from "../database"; // Assuming your database connection is in this file

// Function to update user statuses
export const updateUserStatuses = async () => {
  try {
    const currentTime = new Date().getTime();

    // Query for  users who haven't updated their activity timestamp in the last 3 minutes
    await database.db.run(
      `UPDATE users SET online_status = 'offline' WHERE last_activity < ? AND online_status = 'online'`,
      [currentTime - 3 * 60 * 1000]  // 3 minutes ago
    );
  } catch (error) {
    console.error("Error updating user statuses:", error);
  }
};

// Set an interval to update user statuses every 1 minutes
export const startUserStatusUpdater = () => {
  setInterval(updateUserStatuses, 1 * 60 * 1000);  // 1 minutes interval //5 * 60 * 1000
};
