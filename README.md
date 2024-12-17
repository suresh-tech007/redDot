## Project 1: Real-Time Betting System

### Overview
This project is a real-time betting system built using React for the frontend, Node.js with Socket.IO for real-time communication, and MongoDB for data management. Users can place bets, and results are calculated and broadcast to all users simultaneously.

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

---

---

## Project 2: Wallet Balance System

### Overview
This project is focused on managing user wallet balances with two fields: `deposit` and `withdrawable` balance. The system deducts amounts from the deposit first and then the withdrawable balance.

---

### Features
1. **Dynamic Balance Management**
   - Deducts balances based on priority.
   - Updates balance instantly after a bet.

2. **Transaction History**
   - Tracks both withdrawals and deposits in the wallet.

3. **Real-Time Wallet Updates**
   - Updates the wallet balance dynamically on the React frontend.

---

### Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB

---

### Setup Instructions
#### Prerequisites
- Node.js
- MongoDB

#### Steps
1. Clone the project repository.
2. Follow similar steps from Project 1 for backend and frontend setup.
3. Ensure the database has wallet-related fields initialized.

---

### API Endpoints
| Method | Endpoint           | Description                    |
|--------|--------------------|--------------------------------|
| POST   | `/api/wallet/deposit` | Add money to the wallet         |
| POST   | `/api/wallet/withdraw`| Withdraw money from the wallet  |
| GET    | `/api/wallet`        | Get user wallet balance         |

---

### Key Logic
1. **Priority Deduction**:
   ```javascript
   if (depositBalance >= amount) {
       depositBalance -= amount;
   } else {
       remaining = amount - depositBalance;
       depositBalance = 0;
       withdrawableBalance -= remaining;
   }
   ```
2. **Instant Updates**: State updates using React hooks (`useState`, `useEffect`).

---


## Project 3: User Invitation and Bonus System

### Overview
This project implements a referral system where users can invite friends and receive bonuses based on deposit amounts.

---

### Features
1. **Referral Codes**
   - Unique referral code generation.
   - Referral codes are stored and validated.

2. **Bonus System**
   - Bonuses awarded based on deposit amounts (`300` or `500`).
   - Inviter wallet updates when invitee deposits.

3. **Transaction Records**
   - Tracks invited user deposit details.

---

### Tech Stack
- **Frontend**: React.js, Vite
- **Backend**: Node.js, Express, MongoDB

---

### Setup Instructions
1. Clone the repository.
2. Set up the backend and frontend following the instructions in Project 1.
3. Add environment variables for referral logic.
   ```env
   REFERRAL_BONUS_300=50
   REFERRAL_BONUS_500=100
   ```
4. Run the project.

---

### Key API Endpoints
| Method | Endpoint                   | Description                          |
|--------|----------------------------|--------------------------------------|
| POST   | `/api/referral`            | Add referral code                    |
| POST   | `/api/referral/check`      | Verify referral and add bonuses      |
| GET    | `/api/referral/history`    | Get referral transaction history     |

---

### Key Logic
1. **Referral Code Generation**:
   ```javascript
   const generateReferralCode = () => {
       return Math.random().toString(36).substr(2, 8).toUpperCase();
   };
   ```

2. **Bonus Update**:
   - Check deposit amount (300/500) and update inviter wallet.

---

### Notes
- Ensure inviter and invitee relationships are stored correctly in the database.
- Referral codes are case-sensitive.
- **Backend code is private and not publicly available. API documentation is provided for integration with the frontend.**

---

### Folder Structure
```plaintext
project-referral/
|-- backend/
|   |-- routes/referral.js
|   |-- controllers/referralController.js
|
|-- frontend/
|   |-- components/Referral.jsx
```

---

### Final Notes
Each project is independent but follows a similar structure. Make sure to set up your environment variables and install dependencies properly.
