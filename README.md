# 📦 Empilha Blocos

A fast-paced block stacking game built with **Phaser 3**. Stack blocks as high as you can, chain perfect combos, collect powerups and test your luck in the post-game slot.

🎮 **Play on CrazyGames:** *(coming soon)*

---

## 🕹️ Controls

- **Click / Tap** — drop the block
- 🤫 *Rumour has it there are hidden cheat codes for the curious ones...*

---

## 🎯 Game Modes

| Mode | Description |
|------|-------------|
| 📦 **Normal** | Stack blocks with no time limit |
| ⏱️ **Timed** | 60 seconds to get the highest score possible |
| 😌 **Zen** | No game over — just relax and stack |

---

## ⚡ Features

- **Perfect combos** — land blocks dead centre to chain score bonuses
- **Powerups** — Slow Motion 🐌, Wide Block 📏, Aim Assist 🎯, Time Freeze ⏰, Ghost Mode 👻
- **Mystery Blocks** — random surprise effects
- **Lucky Slot** — spin the slot machine after each game for bonus points
- **Achievements** — unlockable milestones during gameplay
- **Chaos Events** — every 50 points, things get a little wild
- **Leaderboard** — top 10 saved locally or via CrazyGames Data Module
- **Music & SFX** — dynamic musical scale that evolves as you stack higher

---

## 🛠️ Tech Stack

- [Phaser 3](https://phaser.io/)
- JavaScript (ES6 Modules)
- Web Audio API
- [CrazyGames SDK](https://docs.crazygames.com/)

---

## 📁 Project Structure

```
├── assets/
│   ├── musica_menu.mp3
│   └── musica_jogo.mp3
├── scenes/
│   ├── MenuScene.js
│   ├── GameScene.js
│   ├── HighscoresScene.js
│   └── ManualScene.js
├── CrazyGamesAds.js
└── index.html
```

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/your-username/empilha-blocos.git

# Serve with any local HTTP server, for example:
npx serve .
# or
python -m http.server 8080
```

> ⚠️ Requires a local HTTP server — does not work via `file://` due to ES6 modules.

---

## 📦 CrazyGames SDK

The game integrates the CrazyGames SDK for:
- Mid-game ads (`showMidgameAd`)
- Gameplay events (`gameplayStart` / `gameplayStop`)
- Saving highscores via the Data Module (with `localStorage` fallback)

---

## 📄 License

GNU General Public License v3.0 — see the [LICENSE](LICENSE) file for details.