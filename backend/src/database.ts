import Fastify from "fastify";
import { fpSqlitePlugin } from "fastify-sqlite-typed";

// Initialize the Fastify instance
const database = Fastify();

// Register the SQLite plugin
database.register(fpSqlitePlugin, {
  dbFilename: "./database.db", // Define the path to the SQLite database file
});

// Function to initialize the database (creating the table)
export const initializeDatabase = async () => {
  try {
    await database.ready();
    // Create table if it doesn't exist already
    // profilePic - URL or file path for the picture
    // dateOfBirth - ISO date format e.g. "YYYY-MM-DD"
    await database.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT,
        email TEXT UNIQUE NOT NULL,
        reset_token TEXT,
        secret TEXT,
        firstName TEXT,
        lastName TEXT,
        dateOfBirth TEXT,
        gender TEXT CHECK(gender IN ('male', 'female', 'other')) DEFAULT 'other',
        favAvatar TEXT CHECK(favAvatar IN ('None', 'QueenOfTheSpoons', 'JustBorn', 'Maslina', \
        'BossLady', 'Inka', 'Burek', 'Fish', 'WarMachine', 'Finn', \
        'GangGanger', 'StabIlity', 'VampBoy')) DEFAULT 'None',
        language TEXT CHECK(language IN ('english', 'serbian', 'finnish', 'russian')) DEFAULT 'english',
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        profilePic TEXT,
        online_status TEXT CHECK(online_status IN ('offline', 'online')) DEFAULT 'offline',
        last_activity number DEFAULT 0,
        auth_provider TEXT CHECK(auth_provider IN ('email', 'google')) DEFAULT 'email'
      )
    `);

    //adding mock data
    await database.db.exec(
      `INSERT OR IGNORE INTO users (username, password, email, \
      firstName, lastName, dateOfBirth, gender, favAvatar, \
      language, wins, losses, profilePic, online_status, \
      last_activity) VALUES ('pingqueen', 'hashed_pwd_1', 'pingqueen@example.com', 'Lana', 'Smith', \
      '1990-05-12', 'female', 'QueenOfTheSpoons', 'english', 10, 2, 'lana.jpg', 'online', 1686238123)`
    );

    await database.db.exec(
      `INSERT OR IGNORE INTO users \
      (username, password, email, firstName, lastName, dateOfBirth, gender, favAvatar, \
      language, wins, losses, profilePic, online_status, last_activity) \
      VALUES ('maslinator', 'hashed_pwd_2', 'maslinator@example.com', 'Igor', 'Petrovic', \
      '1988-10-23', 'male', 'Maslina', 'serbian', 8, 5, 'igor.png', 'offline', 1686200000)`
    );

    await database.db.exec(
      `INSERT OR IGNORE INTO users (username, password, email, \
      firstName, lastName, dateOfBirth, gender, favAvatar, language, \
      wins, losses, profilePic, online_status, last_activity) \
      VALUES ('stabbyboy', 'hashed_pwd_3', 'stabbyboy@example.com', 'Finn', \
      'Johnson', '2002-03-09', 'other', 'StabIlity', 'finnish', 12, 7, 'finnie.jpeg', 'online', 1686245000)`
    );

    // Create friendships table (if it doesn't exist)
    await database.db.exec(`
      CREATE TABLE IF NOT EXISTS friendships (
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        sender_username TEXT NOT NULL,
        receiver_username TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('Not Friend', 'Pending', 'Friend')),
        PRIMARY KEY (sender_id, receiver_id),
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await database.db.exec(`
      CREATE TABLE IF NOT EXISTS games (
        id_game INTEGER PRIMARY KEY AUTOINCREMENT,
        id_user TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        rounds_json TEXT NOT NULL,
        game_name TEXT NOT NULL CHECK (game_name IN ('ping-pong', 'tic-tac-toe'))
      )
    `);

    //adding mock data
    await database.db.exec(
      `INSERT OR IGNORE INTO games (id_user, rounds_json, game_name) VALUES \
      ('1', '[ [ { "p1_username": "pingqueen", "p2_username": "maslinator", "p1_avatar": "QueenOfTheSpoons", "p2_avatar": "Maslina", "p1_wins": 1, "p2_wins": 0 }, { "p1_username": "stabbyboy", "p2_username": "pingqueen", "p1_avatar": "StabIlity", "p2_avatar": "QueenOfTheSpoons", "p1_wins": 0, "p2_wins": 1 } ], [ { "p1_username": "maslinator", "p2_username": "stabbyboy", "p1_avatar": "Maslina", "p2_avatar": "StabIlity", "p1_wins": 0, "p2_wins": 1 }, { "p1_username": "pingqueen", "p2_username": "maslinator", "p1_avatar": "QueenOfTheSpoons", "p2_avatar": "Maslina", "p1_wins": 1, "p2_wins": 0 } ] ]', 'ping-pong')`
    );

    await database.db.exec(
      `INSERT OR IGNORE INTO games (id_user, rounds_json, game_name) \
      VALUES ('1', '[ [ { "p1_username": "pingqueen", "p2_username": "maslinator", "p1_avatar": "QueenOfTheSpoons", "p2_avatar": "Maslina", "p1_wins": 1, "p2_wins": 0 }, { "p1_username": "stabbyboy", "p2_username": "pingqueen", "p1_avatar": "StabIlity", "p2_avatar": "QueenOfTheSpoons", "p1_wins": 0, "p2_wins": 1 } ], [ { "p1_username": "maslinator", "p2_username": "stabbyboy", "p1_avatar": "Maslina", "p2_avatar": "StabIlity", "p1_wins": 0, "p2_wins": 1 }, { "p1_username": "pingqueen", "p2_username": "maslinator", "p1_avatar": "QueenOfTheSpoons", "p2_avatar": "Maslina", "p1_wins": 1, "p2_wins": 0 } ] ]', 'ping-pong')`
    );

    await database.db.exec(
      `INSERT OR IGNORE INTO games (id_user, rounds_json, game_name) \
      VALUES ('2', '[ [ { "p1_username": "maslinator", "p2_username": "stabbyboy", "p1_avatar": "Maslina", "p2_avatar": "StabIlity", "p1_wins": 1, "p2_wins": 0 }, { "p1_username": "pingqueen", "p2_username": "maslinator", "p1_avatar": "QueenOfTheSpoons", "p2_avatar": "Maslina", "p1_wins": 0, "p2_wins": 1 } ], [ { "p1_username": "stabbyboy", "p2_username": "pingqueen", "p1_avatar": "StabIlity", "p2_avatar": "QueenOfTheSpoons", "p1_wins": 1, "p2_wins": 0 }, { "p1_username": "maslinator", "p2_username": "pingqueen", "p1_avatar": "Maslina", "p2_avatar": "QueenOfTheSpoons", "p1_wins": 0, "p2_wins": 1 } ] ]', 'tic-tac-toe')`
    );

    await database.db.exec(
      `INSERT OR IGNORE INTO games (id_user, rounds_json, game_name) \
      VALUES ('3', '[ [ { "p1_username": "stabbyboy", "p2_username": "pingqueen", "p1_avatar": "StabIlity", "p2_avatar": "QueenOfTheSpoons", "p1_wins": 0, "p2_wins": 1 }, { "p1_username": "maslinator", "p2_username": "stabbyboy", "p1_avatar": "Maslina", "p2_avatar": "StabIlity", "p1_wins": 1, "p2_wins": 0 } ], [ { "p1_username": "pingqueen", "p2_username": "maslinator", "p1_avatar": "QueenOfTheSpoons", "p2_avatar": "Maslina", "p1_wins": 1, "p2_wins": 0 }, { "p1_username": "stabbyboy", "p2_username": "pingqueen", "p1_avatar": "StabIlity", "p2_avatar": "QueenOfTheSpoons", "p1_wins": 0, "p2_wins": 1 } ] ]', 'ping-pong')`
    );

    // await database.db.exec(`
    //   CREATE TABLE IF NOT EXISTS game_sessions (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     user TEXT NOT NULL,
    //     user_avatar TEXT NOT NULL,
    //     guest TEXT NOT NULL,
    //     guest_avatar TEXT NOT NULL,
    //     created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    //     user_wins INTEGER DEFAULT 0,
    //     guest_wins INTEGER DEFAULT 0
    //   )
    // `);

    // await database.db.exec(`
    //   CREATE TABLE IF NOT EXISTS tournament_sessions (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     user TEXT NOT NULL,
    //     user_avatar TEXT NOT NULL,
    //     guests_json TEXT NOT NULL
    //   )
    // `);

    console.log("Database and tables are ready");
  } catch (error) {
    console.error("Error creating database table:", error);
  }
};

// Export db to interact with it in other parts of the database
export { database };
