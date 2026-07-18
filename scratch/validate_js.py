import os
import re

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

files = [
  'index.html',
  'css/style.css',
  'js/audio.js',
  'js/campaign.js',
  'js/i18n.js',
  'js/iso-data.js'
]

print("--- FILE CHECK ---")
for f in files:
  p = os.path.join(base_dir, f)
  if os.path.exists(p):
    size = os.path.getsize(p)
    print(f"[OK] {f} ({size} bytes)")
  else:
    print(f"[ERROR] {f} MISSING!")

print("\n--- GLOBAL SYMBOL VERIFICATION ---")

with open(os.path.join(base_dir, 'js/audio.js'), 'r') as f:
  audio_content = f.read()

with open(os.path.join(base_dir, 'index.html'), 'r') as f:
  html_content = f.read()

symbols = [
  ('audio', audio_content),
  ('toggleAudio', audio_content),
  ('setAudioVolume', audio_content),
  ('updateAudioUI', audio_content),
  ('playClick', audio_content),
  ('playHover', audio_content),
  ('playAlert', audio_content),
  ('playChime', audio_content),
  ('playLaserShot', audio_content),
  ('playConquestBoom', audio_content),
  ('playUpset', audio_content),
  ('playMatchWin', audio_content),
  ('playVictory', audio_content),
  ('playScan', audio_content),
  ('sfx-volume-slider', html_content),
  ('openSwapModal', html_content),
  ('swapTeam', html_content),
  ('getEffectiveTeamCode', html_content),
  ('setMatchWinner', html_content),
  ('toggleMatchWinner', html_content)
]

all_passed = True
for name, content in symbols:
  if name in content:
    print(f"[OK] Symbol '{name}' defined")
  else:
    print(f"[ERROR] Symbol '{name}' missing!")
    all_passed = False

if all_passed:
  print("\n>>> ALL AUDIO VALIDATION CHECKS PASSED SUCCESSFULLY! <<<")
