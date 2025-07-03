# FastFinger - Full Frontend & Socket API Documentation

This document provides the complete API reference for the FastFinger application, a real-time multiplayer typing game enhanced by AI-generated prompts.

---

## Deployment

- **Frontend**: https://your-frontend-domain.com
- **Backend**: https://hartashuwanto.xyz

---

## Tech Stack

| Tool             | Purpose                       |
| ---------------- | ----------------------------- |
| React + Vite     | Frontend framework            |
| Tailwind CSS     | Styling and responsive layout |
| Context API      | State management              |
| Axios            | HTTP client for auth APIs     |
| React Router v7  | Routing and navigation        |
| Socket.IO Client | Real-time communication       |
| Framer Motion    | UI animations                 |
| React Toastify   | Toast notifications           |
| Lucide React     | Icon set                      |
| jwt-decode       | JWT token parsing             |

---

## Features

- Real-time multiplayer typing race
- AI-generated typing prompts (using Gemini)
- CPM (characters per minute) and accuracy tracking
- Dynamic leaderboard
- Countdown system
- Game reset and replay support

---

## Authentication API (via Axios)

### Public Endpoints

| Method | Endpoint  | Description         |
| ------ | --------- | ------------------- |
| POST   | /register | Register a new user |
| POST   | /login    | Log in a user       |

**Response:**

```json
{
  "access_token": "JWT_TOKEN_HERE"
}
```

The token is stored in `localStorage` and used for socket authentication and protected routes.

---

## WebSocket API (Socket.IO)

### Client → Server Events

| Event Name     | Payload                             | Description                         |
| -------------- | ----------------------------------- | ----------------------------------- |
| `joinGame`     | `{ username }`                      | Join a game room                    |
| `startGame`    | `{ timeLimit }`                     | Start the game with a time limit    |
| `typingUpdate` | `{ userInput, textLength, errors }` | Send typing progress                |
| `timeUp`       | -                                   | Notify that player time has run out |
| `resetGame`    | -                                   | Reset the game to waiting state     |

### Server → Client Events

| Event Name       | Payload                                         | Description                          |
| ---------------- | ----------------------------------------------- | ------------------------------------ |
| `gameJoined`     | `{ gameStatus, isSpectator, message? }`         | Confirm game join                    |
| `countdown`      | `number`                                        | Countdown before start               |
| `gameStart`      | `{ text, startTime, timeLimit }`                | Game begins with AI-generated prompt |
| `playerProgress` | `{ username, progress, cpm, accuracy, errors }` | Individual player updates            |
| `playersUpdate`  | `{ players, gameStatus, text }`                 | Updates for all players              |
| `raceFinished`   | `{ position, cpm }`                             | Sent to player upon completion       |
| `gameFinished`   | `{ results }`                                   | Game finished for all players        |
| `gameReset`      | `{ players, gameStatus }`                       | Game state reset                     |

---

## State Management (Context API)

Main state values provided via Context:

| State              | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| `gameStatus`       | Current game state: `waiting`, `countdown`, `playing`, `finished` |
| `text`             | The text to be typed                                              |
| `userInput`        | Player's current input                                            |
| `cpm`              | Characters per minute                                             |
| `accuracy`         | Typing accuracy                                                   |
| `errors`           | Number of typing errors                                           |
| `players`          | List of players and their stats                                   |
| `timeRemaining`    | Time left in the game                                             |
| `startTime`        | Game start timestamp                                              |
| `position`         | Final position after finishing                                    |
| `isComplete`       | Whether the player has finished                                   |
| `gameTime`         | Elapsed game time                                                 |
| `connectionStatus` | Socket connection status                                          |
| `startGame()`      | Function to start the game                                        |
| `resetGame()`      | Function to reset the game                                        |
