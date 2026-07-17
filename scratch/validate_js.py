import os
import re

files = [
  'index.html',
  'css/styles.css',
  'js/audio.js',
  'js/simulation.js',
  'js/map.js',
  'js/ui.js'
]

base_dir = '/google/src/cloud/deanchen/eat-ai-fig/google3/experimental/users/deanchen/world-cup-map'

print("--- FILE CHECK ---")
for f in files:
  p = os.path.join(base_dir, f)
  if os.path.exists(p):
    size = os.path.getsize(p)
    print(f"[OK] {f} ({size} bytes)")
  else:
    print(f"[ERROR] {f} MISSING!")

print("\n--- GLOBAL SYMBOL VERIFICATION ---")
# Check if key functions exist in files
with open(os.path.join(base_dir, 'js/ui.js'), 'r') as f:
  ui_content = f.read()

with open(os.path.join(base_dir, 'js/map.js'), 'r') as f:
  map_content = f.read()

with open(os.path.join(base_dir, 'js/simulation.js'), 'r') as f:
  sim_content = f.read()

with open(os.path.join(base_dir, 'js/audio.js'), 'r') as f:
  audio_content = f.read()

symbols = [
  ('audio', audio_content),
  ('toggleAudio', audio_content),
  ('teamMetadata', sim_content),
  ('matches', sim_content),
  ('dates', sim_content),
  ('currentDateIndex', sim_content),
  ('countryLineage', sim_content),
  ('userOverrides', sim_content),
  ('isLightTheme', sim_content),
  ('initOwnership', sim_content),
  ('runSimulationToDateIndex', sim_content),
  ('getLeaderboard', sim_content),
  ('parseUrlOverrides', sim_content),
  ('toggleMatchWinner', sim_content),
  ('resetOverrides', sim_content),
  ('shareUniverse', sim_content),
  ('worldData', map_content),
  ('centroids', map_content),
  ('getWCCodeFromMap', map_content),
  ('getCountryColor', map_content),
  ('showTooltip', map_content),
  ('highlightOwner', map_content),
  ('toggleTheme', ui_content),
  ('loadEdition', ui_content),
  ('updateUI', ui_content)
]

for name, content in symbols:
  if name in content:
    print(f"[OK] Symbol '{name}' defined")
  else:
    print(f"[ERROR] Symbol '{name}' missing!")
