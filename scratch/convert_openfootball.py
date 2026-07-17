import json
import urllib.request
import os
import random

# Common country name to FIFA 3-letter code translation map
country_to_fifa = {
    # Core teams and common spelling variants
    "Russia": "RUS", "Saudi Arabia": "SAU", "Egypt": "EGY", "Uruguay": "URY",
    "Portugal": "PRT", "Spain": "ESP", "Morocco": "MAR", "Iran": "IRN",
    "IR Iran": "IRN", "France": "FRA", "Australia": "AUS", "Peru": "PER",
    "Denmark": "DNK", "Argentina": "ARG", "Iceland": "ISL", "Croatia": "HRV",
    "Nigeria": "NGA", "Brazil": "BRA", "Switzerland": "CHE", "Costa Rica": "CRI",
    "Serbia": "SRB", "Germany": "DEU", "Mexico": "MEX", "Sweden": "SWE",
    "South Korea": "KOR", "Korea Republic": "KOR", "Belgium": "BEL", "Panama": "PAN",
    "Tunisia": "TUN", "England": "ENG", "Colombia": "COL", "Japan": "JPN",
    "Poland": "POL", "Senegal": "SEN", "Netherlands": "NLD", "Holland": "NLD",
    "Canada": "CAN", "Ecuador": "ECU", "Qatar": "QAT", "Wales": "WAL",
    "United States": "USA", "USA": "USA", "Haiti": "HTI", "Iraq": "IRQ",
    "Jordan": "JOR", "Uzbekistan": "UZB", "Curaçao": "CUW", "Curacao": "CUW",
    "DR Congo": "COD", "Congo DR": "COD", "Cape Verde": "CPV", "Cabo Verde": "CPV",
    "Ghana": "GHA", "Algeria": "DZA", "Slovakia": "SVK", "Slovenia": "SVN",
    "New Zealand": "NZL", "North Korea": "PRK", "Angola": "AGO", "Togo": "TGO",
    "Trinidad and Tobago": "TTO", "Trinidad & Tobago": "TTO", "Ukraine": "UKR",
    "Czech Republic": "CZE", "Czechia": "CZE", "China": "CHN", "China PR": "CHN",
    "Republic of Ireland": "IRL", "Ireland": "IRL", "Turkey": "TUR", "Türkiye": "TUR",
    "Yugoslavia": "SRB", "Yugoslavia FR": "SRB", "Serbia and Montenegro": "SRB", "South Africa": "ZAF", "Paraguay": "PRY",
    "Chile": "CHL", "Cameroon": "CMR", "Austria": "AUT", "Italy": "ITA",
    "Norway": "NOR", "Scotland": "SCO", "Romania": "ROU", "Bulgaria": "BGR",
    "Jamaica": "JAM", "Honduras": "HND", "Bosnia-Herzegovina": "BIH",
    "Bosnia and Herzegovina": "BIH", "Greece": "GRC", "Ivory Coast": "CIV",
    "Côte d'Ivoire": "CIV"
}

# Real team colors for aesthetic high-contrast rendering of top countries
top_team_colors = {
    "BRA": "#ECC94B",  # Yellow
    "ARG": "#4FD1C5",  # Cyber Light Blue / Teal
    "FRA": "#2B6CB0",  # Navy Blue
    "ESP": "#C53030",  # Red
    "DEU": "#445063",  # Germany Gray
    "ENG": "#EDF2F7",  # Silver White
    "NLD": "#ED8936",  # Orange
    "PRT": "#276749",  # Green
    "ITA": "#3182CE",  # Azure Blue
    "HRV": "#E53E3E",  # Croatian Red
    "BEL": "#9B2C2C",  # Maroon Red
    "URY": "#4299E1",  # Celeste Sky Blue
    "USA": "#3182CE",  # Blue
    "MEX": "#319795",  # Green/Teal
    "CAN": "#E53E3E",  # Red
    "JPN": "#3b4a5e",  # Samurai Dark Blue
    "KOR": "#DD6B20",  # Orange Red
    "NZL": "#2d3748",  # Kiwi Dark Slate
}

# Pre-defined high contrast palette for all other teams
color_palette = [
    "#E53E3E", "#319795", "#3182CE", "#D69E2E", "#2B6CB0", "#38A169", "#C53030",
    "#DD6B20", "#7B341E", "#22543D", "#276749", "#2C5282", "#9B2C2C", "#4299E1",
    "#ED8936", "#805AD5", "#B7791F", "#4A5568", "#68D391", "#63B3ED", "#FC8181",
    "#F6AD55", "#9F7AEA", "#ED64A6", "#A0AEC0", "#718096", "#E2E8F0", "#CBD5E0",
    "#6B46C1", "#553C9A", "#2F855A", "#2C7A7B", "#2B6CB0", "#C05621", "#9B2C2C"
]

def get_clean_stage_name(round_name):
    r = round_name.lower()
    if "matchday" in r or "group" in r:
        return "Group Stage"
    elif "round of 16" in r or "last 16" in r:
        return "Round of 16"
    elif "round of 32" in r:
        return "Round of 32"
    elif "quarter" in r:
        return "Quarterfinal"
    elif "semi" in r:
        return "Semifinal"
    elif "third" in r or "3rd" in r:
        return "Third-Place Match"
    elif "final" in r:
        return "Final"
    return "Group Stage"

def convert_year(year):
    print(f"--- Converting World Cup {year} ---")
    url = f"https://raw.githubusercontent.com/openfootball/worldcup.json/master/{year}/worldcup.json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
    except Exception as e:
        print(f"Error fetching data for {year}: {e}")
        return

    teams_data = {}
    matches_data = []
    
    # Track teams in this tournament to assign colors
    unique_teams = set()
    for match in data.get("matches", []):
        t1 = match.get("team1")
        t2 = match.get("team2")
        if t1: unique_teams.add(t1)
        if t2: unique_teams.add(t2)

    # Resolve FIFA codes and colors for all participating teams
    assigned_palette = list(color_palette)
    random.shuffle(assigned_palette)
    
    resolved_teams = {}
    for team_name in sorted(list(unique_teams)):
        code = country_to_fifa.get(team_name)
        if not code:
            # Fallback code generation
            code = team_name[:3].upper()
            print(f"Warning: Code not found for '{team_name}', using fallback: {code}")
            
        color = top_team_colors.get(code)
        if not color:
            color = assigned_palette.pop(0) if assigned_palette else "#7f8c8d"
            
        resolved_teams[team_name] = {
            "code": code,
            "name": team_name,
            "color": color
        }
        teams_data[code] = {
            "name": team_name,
            "color": color
        }

    # Process all matches
    for idx, match in enumerate(data.get("matches", [])):
        t1_name = match.get("team1")
        t2_name = match.get("team2")
        
        t1_meta = resolved_teams.get(t1_name)
        t2_meta = resolved_teams.get(t2_name)
        
        if not t1_meta or not t2_meta:
            continue
            
        code1 = t1_meta["code"]
        code2 = t2_meta["code"]
        
        score = match.get("score", {})
        
        # Determine winner
        winner = ""
        score_str = ""
        
        ft = score.get("ft")
        et = score.get("et")
        p = score.get("p")
        
        if p:
            # Penalty shootout
            score_str = f"{p[0]}-{p[1]} (p)"
            winner = code1 if p[0] > p[1] else code2
        elif et:
            # Extra time
            score_str = f"{et[0]}-{et[1]} (aet)"
            winner = code1 if et[0] > et[1] else code2
        elif ft:
            # Full time
            score_str = f"{ft[0]}-{ft[1]}"
            if ft[0] > ft[1]:
                winner = code1
            elif ft[0] < ft[1]:
                winner = code2
            else:
                winner = ""  # Draw
        else:
            score_str = "vs"
            winner = ""

        stage = get_clean_stage_name(match.get("round", "Group Stage"))
        date = match.get("date")
        
        matches_data.append({
            "date": date,
            "home": code1,
            "away": code2,
            "winner": winner,
            "score": score_str,
            "stage": stage
        })

    # Save to target folder structure
    output_dir = f"data/{year}"
    os.makedirs(output_dir, exist_ok=True)
    output_file = f"{output_dir}/world_cup_data.json"
    
    output_payload = {
        "teams": teams_data,
        "matches": matches_data
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_payload, f, indent=2, ensure_ascii=False)
        
    print(f"Success: Wrote {len(matches_data)} matches for {year} to {output_file}")

# Run conversion for all modern editions
years_to_convert = [1998, 2002, 2006, 2010, 2014, 2018, 2022]
for y in years_to_convert:
    convert_year(y)
