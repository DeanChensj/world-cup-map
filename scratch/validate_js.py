import re
import subprocess

html_content = open("index.html").read()
matches = re.finditer(r'<script>(.*?)</script>', html_content, re.DOTALL)
for i, m in enumerate(matches):
    with open(f"scratch/temp_{i}.js", "w") as f:
        f.write(m.group(1))
    result = subprocess.run(["node", "-c", f"scratch/temp_{i}.js"], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error in script {i}: {result.stderr}")
    else:
        print(f"Script {i} syntax OK")
