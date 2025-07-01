# 🪨 Rock Paper Scissors - Multiplayer Game

A real-time, multiplayer Rock-Paper-Scissors game built with **React + TypeScript** and powered by **Socket.IO**. Challenge your friends, experience smooth transitions, and enjoy the classic game with a modern twist.

🎮 **Play Now:** [https://rock-paper-scissors-theta-henna.vercel.app](https://rock-paper-scissors-theta-henna.vercel.app)

---

## 🚀 Features

- 👥 Multiplayer support with real-time updates via Socket.IO
- ⚛️ Built using React (Vite) and TypeScript
- 🎨 Responsive UI with Tailwind CSS
- 🔌 Backend with Node.js and Express
- 🌐 Fully deployed on Vercel (frontend) and Render (backend)

---

## 📁 Project Structure

```

byte-by-byte/
├── backend/                  # Node.js backend with Socket.IO
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── src/                      # React frontend
│   ├── components/ui/        # Game UI components
│   │   ├── ChoiceButton.tsx
│   │   ├── GameResult.tsx
│   │   ├── GameScreen.tsx
│   │   ├── Layout.tsx
│   │   ├── ModeSelector.tsx
│   │   ├── MultiplayerGame.tsx
│   │   ├── RoundTimer.tsx
│   │   └── Scoreboard.tsx
│   ├── pages/
│   │   └── Index.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── gameLogic.ts
│   │   └── socketService.ts
│   ├── main.tsx
│   ├── index.html
│   └── index.css
│
├── .env                      # Environment variable for backend API URL
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── .gitignore

````

---

## 🛠️ Getting Started (Locally)

### 1. Clone the Repository

```bash
git clone https://github.com/Abhigyan-GG/Rock-Paper-Scissors.git
cd Rock-Paper-Scissors
````

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Create a `.env` File

```env
VITE_API_URL=https://rock-paper-scissors-zcak.onrender.com
```

> Replace the value with your deployed backend URL from Render.

### 4. Start the Frontend Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🌐 Deployment

### ✅ Frontend

* Hosted on **Vercel**
* Live URL: [https://rock-paper-scissors-theta-henna.vercel.app](https://rock-paper-scissors-theta-henna.vercel.app)

### ✅ Backend

* Hosted on **Render**
* API URL used in frontend: `https://rock-paper-scissors-zcak.onrender.com`

---

## ✨ Future Improvements

* ✅ Add sound effects and animations
* 🔄 Add rematch functionality
* 🧠 Add a single-player mode vs AI
* 📊 Add game history and statistics

---

## 🤝 Contributing

Pull requests and feedback are welcome!
Feel free to fork the repository and submit improvements.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Abhigyan**
GitHub: [@Abhigyan-GG](https://github.com/Abhigyan-GG)


---

