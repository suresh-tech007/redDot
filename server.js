import dotenv from "dotenv";
import connectMongo from "./config/database.js";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { checkwinerUser } from "./GameHelper/wingoresult.js";

const port = 4000;

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({ path: "./config/.env" });
}

// Connect to MongoDB
connectMongo();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Vite frontend URL
    methods: ["GET", "POST"],
  },
});

// Game logic
const timers = {
  "1Min": 60,
  "3Min": 180,
  "5Min": 300,
  "10Min": 600,
};

const intervals = {};

const bets = {
  "1Min": [],
  "3Min": [],
  "5Min": [],
  "10Min": [],
};

const startTimers = () => {
  Object.keys(timers).forEach((key) => {
    intervals[key] = setInterval(() => {
      if (timers[key] > 0) {
        timers[key]--;

        if (timers[key] <= 5) {
          // Finalize bets automatically when 5 seconds or less remain for this specific timer
          finalizeBets(key);
        }
      } else {
        timers[key] = parseInt(key) * 60; // Reset timer
      }
      io.emit("countdown", { type: key, value: timers[key] });
    }, 1000);
  });
};

const finalizeBets = (timerType) => {
  if (bets[timerType].length === 0) {
    return;
  }

  const allNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const numberCounts = {};

  allNumbers.forEach((num) => {
    numberCounts[num] = 0;
  });

  bets[timerType].forEach((bet) => {
    if (Array.isArray(bet.selectednum)) {
      bet.selectednum.forEach((num) => {
        numberCounts[num]++;
      });
    } else {
      numberCounts[bet.selectednum]++;
    }
  });

  const values = Object.values(numberCounts);
  const allEqual = values.every((value) => value === values[0]);

  // If all values are the same, generate a random number between 0 and 9
  const { GameId, GameName } = bets[timerType][0];

  const resultdata = {
    timerType,
    Game_id: GameId,
    GameName,
    selectedNumber: allEqual
      ? Math.floor(Math.random() * 10) // Random number if all counts are equal
      : findLeastSelectedNumber(numberCounts), // Least selected number otherwise
  };

  // Check the winner and reset the bets for the timer
  checkwinerUser(resultdata, bets);
  bets[timerType] = [];
};
const findLeastSelectedNumber = (numberCounts) => {
    return Object.entries(numberCounts).reduce(
      (leastSelected, [num, count]) =>
        leastSelected === null || count < numberCounts[leastSelected]
          ? num
          : leastSelected,
      null
    );
  };

startTimers();
const generateGameID = () => {
  return Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
};

io.on("connection", (socket) => {
  let gameIDs = {
    "1Min": generateGameID(),
    "3Min": generateGameID(),
    "5Min": generateGameID(),
    "10Min": generateGameID(),
  };

  // Broadcast the initial game IDs
  socket.emit("gameID", gameIDs);

  // Handle countdown reaching 0 and resetting the game ID
  socket.on("timerEnded", (timerType) => {
    gameIDs[timerType] = generateGameID();
    io.emit("gameID", gameIDs); // Broadcast the new game ID to all clients
  });

  // Receive bet data from the client
  socket.on("placeBet", (betData) => {
    if (bets[betData.selectedTimer]) {
      bets[betData.selectedTimer].push(betData);
    }
  });

  socket.on("finalizeBets", (timerType) => {
    if (bets[timerType]) {
      finalizeBets(timerType);
    }
  });

  socket.on("sendMessage", (selectedTimer) => {
    socket.emit("countdown", {
      type: selectedTimer,
      value: timers[selectedTimer],
    });
  });

  socket.on("disconnect", () => {
  });
});

server.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});
