import re
import json

def fix_file(filepath):
    print(f"Fixing {filepath}...")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Fix quote typos (like "stage: " -> "stage": ")
    # Match key in double quotes, followed by colon, optional spaces, and opening double quote of value
    # Since we are in a python file, we can use single quotes to wrap our regex cleanly
    content = re.sub(r'"(home|away|winner|score|stage|date):\s*"', r'"\1": "', content)

    # 2. Fix unquoted keys (like color: or name:)
    # Match word boundary of key, followed by colon, but make sure it is not preceded by a quote
    for key in ["color", "name", "home", "away", "winner", "score", "stage", "date"]:
        content = re.sub(r'(?<!")\b' + key + r'\b\s*:', r'"' + key + r'":', content)

    try:
        data = json.loads(content)
        # Re-dump to guarantee perfect valid formatted JSON
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"SUCCESS: {filepath} is now clean and valid!")
    except Exception as e:
        print(f"FAILED to parse {filepath}: {e}")
        # Print a snippet of the failure region
        err_msg = str(e)
        if "char" in err_msg:
            try:
                char_idx = int(re.search(r'char\s+(\d+)', err_msg).group(1))
                print("Context around error:")
                print(repr(content[max(0, char_idx-40):min(len(content), char_idx+40)]))
            except:
                pass

fix_file("data/2026/world_cup_data.json")
