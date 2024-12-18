import dotenv from "dotenv";
import connectMongo from "./config/database.js";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { checkwinerUser } from "./GameHelper/wingoresult.js";
import os from "os";

process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
  console.error("Shutting down the Server due to Unhandled Exception");
  process.exit(1);
});

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
    // origin:   "http://localhost:5173",
    origin:   "https://reddotreal.netlify.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 10000, // Ping every 10 seconds to keep connection alive
  pingTimeout: 5000,   // Close connection if no pong is received within 5 seconds
  maxHttpBufferSize: 1e6, // Limit data to 1MB
});

// io.on("connection", (socket) => {
//   console.log(`New socket connected: ${socket.id}`);

//   // Handle events...

//   socket.on("disconnect", (reason) => {
//     console.log(`Socket disconnected: ${socket.id} - Reason: ${reason}`);
//   });
// });

// Log system resource usage every 30 seconds
// const logResourceUsage = () => {
//   console.log(`Memory Usage: ${JSON.stringify(process.memoryUsage())}`);
//   console.log(`CPU Usage: ${JSON.stringify(os.cpus())}`);
//   console.log(`Load Average: ${os.loadavg()}`);
// };
// setInterval(logResourceUsage, 30000); // Log every 30 seconds


 

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

const generateGameID = () => {
  return Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
};

let gameIDs = {
  "1Min": generateGameID(),
  "3Min": generateGameID(),
  "5Min": generateGameID(),
  "10Min": generateGameID(),
};

const startTimers = () => {
   
  Object.keys(timers).forEach((key) => {
    intervals[key] = setInterval(() => {
      if (timers[key] > 0) {
        timers[key]--;

        if (timers[key] <= 5) {
          finalizeBets(key);
        }
      } else {
        timers[key] = parseInt(key) * 60;
        gameIDs[key] = generateGameID();
        io.emit("gameID", gameIDs); // Broadcast the new game ID
      }
      io.emit("countdown", { type: key, value: timers[key] });
    }, 1000);
  });
};

const finalizeBets = (timerType) => {
  // console.log(`Finalizing bets for timer: ${timerType}`);
  if (bets[timerType].length === 0) {
    // console.log(`No bets to finalize for timer: ${timerType}`);
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

  const group1 = [0, 1, 2, 3, 4];
  const group2 = [5, 6, 7, 8, 9];

  const allEqualInGroup1 = group1.every(
    (num) => numberCounts[num] === numberCounts[group1[0]]
  );
  const allEqualInGroup2 = group2.every(
    (num) => numberCounts[num] === numberCounts[group2[0]]
  );

  const minCountInGroup1 = Math.min(...group1.map((num) => numberCounts[num]));
  const minCountInGroup2 = Math.min(...group2.map((num) => numberCounts[num]));

  let selectedNumber;

  if (allEqualInGroup1 && minCountInGroup1 < minCountInGroup2) {
    selectedNumber = Math.floor(Math.random() * 5); // Random number between 0-4
  } else if (allEqualInGroup2 && minCountInGroup2 < minCountInGroup1) {
    selectedNumber = Math.floor(Math.random() * 5) + 5; // Random number between 5-9
  } else {
    const values = Object.values(numberCounts);
    const allEqual = values.every((value) => value === values[0]);
    if (allEqual) {
      selectedNumber = Math.floor(Math.random() * 10);
    } else {
      selectedNumber = findLeastSelectedNumber(numberCounts);
    }
  }

  const { GameId, GameName } = bets[timerType][0];
  const resultdata = {
    timerType,
    Game_id: GameId,
    GameName,
    selectedNumber,
  };

  // console.log(`Finalized result for ${timerType}:`, resultdata);

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

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
 
  
  socket.emit("gameID", gameIDs);

  socket.on("requestGameIDs", () => {
    
    socket.emit("gameID", gameIDs);
  });

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
    console.log(`Client disconnected: ${socket.id}`); // Track disconnects
  });

  socket.on("error", (err) => {
    console.error(`Socket error on ${socket.id}:`, err);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

// Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
  console.error("Shutting down the server due to Unhandled Promise Rejection");

  server.close(() => {
    process.exit(1);
  });
});
