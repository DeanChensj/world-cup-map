import shutil
import os

base = '/google/src/cloud/deanchen/eat-ai-fig/google3/experimental/users/deanchen/world-cup-map'
for d in ['css', 'js']:
  path = os.path.join(base, d)
  if os.path.exists(path):
    shutil.rmtree(path)
    print(f"Removed {d}")
