##  Real-Time Betting System

### Overview
This project is a real-time betting system built using React for the frontend, Node.js with Socket.IO for real-time communication, and MongoDB for data management. Users can place bets, and results are calculated and broadcast to all users simultaneously.

## 🚀 Live Demo
Check out the live demo of the project here: [Live Demo]( https://reddotreal.netlify.app/)
---

### Features
1. **Real-Time Communication**
   - Socket.IO is used to broadcast real-time updates to all users.
   
2. **Multiple Timers**
   - Separate betting windows for 1Min, 3Min, 5Min, and 10Min intervals.
   - Timers reset with a unique 14-digit game ID.

3. **Betting Logic**
   - Accepts multiple selected numbers and colors.
   - Results are calculated based on the least amount of money placed on a number.

4. **Game History**
   - Stores game details (GameID, selected numbers, user bets, results, etc.) in MongoDB.

5. **Dynamic Wallet Management**
   - Deducts money first from the deposit balance and then from the withdrawable balance.

---

### Tech Stack
**Frontend**:
- React.js
- Vite
- Tailwind CSS

**Backend**:
- Node.js
- Express
- Socket.IO
- Mongoose (MongoDB)

---

### Setup Instructions
#### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

#### Backend Setup
1. Clone the repository.
   ```bash
   git clone <repo-url>
   cd backend
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Configure environment variables.
   Create a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=<Your MongoDB URI>
   ```
4. Run the backend.
   ```bash
   npm run start
   ```

#### Frontend Setup
1. Move to the frontend folder.
   ```bash
   cd frontend
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Run the frontend.
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

---

### Endpoints
| Method | Endpoint            | Description            |
|--------|---------------------|------------------------|
| POST   | `/api/bets`         | Place a user bet       |
| GET    | `/api/gamehistory`  | Retrieve game history  |

---

### Folder Structure
```plaintext
project/
|-- backend/
|   |-- models/
|   |-- routes/
|   |-- controllers/
|   |-- server.js
|
|-- frontend/
|   |-- src/
|   |-- components/
|   |-- App.jsx
```

---

### Key Components
- **WinGo Component**: Generates a unique 14-digit game ID based on timers.
- **SelectTopUp Component**: Displays wallet details and manages transactions.

---

### Notes
- Ensure the database is connected before running the project.
- Socket.IO manages all real-time updates.
- **Backend code is private and not publicly available. API documentation is provided for integration with the frontend.**
