# World Cup Conquest Map

An interactive, dynamic map visualization of the World Cup where winning countries annex the territories of the defeated countries.

## Features
- **Interactive SVG Map**: Powered by D3.js and TopoJSON, dynamically coloring countries based on their current owner.
- **Dynamic Timeline**: A slider to scrub through tournament dates chronologically, replay conquests, and pause/play the animation.
- **Territory Leaderboard**: Real-time ranking of the teams controlling the most land units.
- **Conquest History Log**: A running feed of every battle and annexation.

## How to Run Locally
To run this project locally without any complex installations, simply serve the directory using Python's built-in HTTP server:

```bash
python3 -m http.server 8080
```

Then open your browser and navigate to `http://localhost:8080`.
