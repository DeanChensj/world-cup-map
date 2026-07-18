# 🌍 World Cup Conquest Map

An interactive, state-of-the-art web application that visualizes World Cup tournaments as global territory conquests. Winning countries annex defeated nations' lands in real-time, creating dynamic sovereign empires across historical and custom simulation timelines.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![D3.js](https://img.shields.io/badge/D3.js-F9A03C?style=for-the-badge&logo=d3.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## 🔥 Key Features

- 🏆 **Multi-Edition World Cup Datasets (2018 / 2022 / 2026)**
  - **2018 Russia World Cup**: 32 teams, 16 knockout matches.
  - **2022 Qatar World Cup**: 32 teams, Argentina's iconic title run.
  - **2026 USA/Canada/Mexico World Cup**: 48 teams, 32 knockout matches.

- ⚡ **Parallel Universe Override Engine**
  - Click any match in the schedule feed to override its winner (e.g., engineer an upset or rewrite history).
  - The simulation timeline automatically recalculates all downstream match setups, team advancers, and global territory annexations in real-time.

- 🌲 **Symmetrical 1-to-1 Tournament Bracket Diagram**
  - Built with a **Graph Tree Feeder Resolution Algorithm** that traces parent-child match relationships to guarantee 100% accurate 1-to-1 feeder alignment.
  - **Golden Champion Path Glow**: Highlights the champion's exact conquest route with glowing optical lines and trophy badges.
  - **Dynamic Edition Scaling**: Automatically scales bracket cards between 2018/2022 (16 teams) and 2026 (32 teams) for optimal visual clarity.

- ⚔️ **Rich Motion & Audio Experience**
  - **Laser Ray Clash**: Dynamic SVG laser rays firing between rival national capitals during knockout battles.
  - **Capital Ripples & Red Alert Flashes**: Pulse wave rings on capital pins and red border alert flashes during territory annexations and upsets.
  - **Web Audio API Engine**: Built-in sound effects (chimes, battle signals) with muting toggles.

- 📱 **Pure Panoramic Screenshot View**
  - Pure, minimal modal interface removing header and footer clutter.
  - Designed for mobile landscape mode to take 100% full, pristine tournament bracket screenshots for social sharing.

---

## 🚀 How to Run Locally

No complex build setup required! Simply serve the project directory with any HTTP static server:

```bash
# Clone the repository
git clone https://github.com/DeanChensj/world-cup-map.git
cd world-cup-map

# Serve using Python 3 built-in server
python3 -m http.server 8080
```

Then open your browser and visit: `http://localhost:8080`

---

## 📁 Project Structure

```text
world-cup-map/
├── index.html                # Main application (UI, D3 Map, Bracket Engine, Simulation Logic)
├── data/                     # World Cup datasets
│   ├── 2018/
│   │   └── world_cup_data.json
│   ├── 2022/
│   │   └── world_cup_data.json
│   └── 2026/
│       └── world_cup_data.json
├── geo/                      # Geographic TopoJSON map boundary data
│   └── world-110m.json
└── README.md
```

---

## 🛠️ Technology Stack

- **Core Frontend**: HTML5, Vanilla JavaScript (ES6+), CSS3
- **Visualization & Maps**: D3.js v7, TopoJSON v3
- **Styling & UI**: TailwindCSS, Cyberpunk Console Palette
- **Icons & Typography**: Phosphor Icons (Font/SVG), JetBrains Mono, Inter Font
- **Audio Engine**: Web Audio API Synthesizer

---

## 📄 License

Distributed under the MIT License. Feel free to fork, experiment with custom tournament rules, and share!
