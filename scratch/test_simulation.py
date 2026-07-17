import json

def run_test_old():
    with open("data/1998/world_cup_data.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    teams = data["teams"]
    matches = data["matches"]
    matches = sorted(matches, key=lambda x: x["date"])
    
    original_teams = list(teams.keys())
    country_lineage = {t: [t] for t in original_teams}

    def get_current_owner(team):
        return country_lineage[team][-1]

    print("--- Tracing 1998 with OLD Buggy Annexation Logic ---")
    for match in matches:
        winner = match["winner"]
        if not winner:
            continue
        
        home = match["home"]
        away = match["away"]
        loser = away if winner == home else home
        
        owner_winner = get_current_owner(winner)
        owner_loser = get_current_owner(loser)
        
        if owner_winner != owner_loser:
            # Old logic: annex all holdings of owner_loser
            count = 0
            for team in original_teams:
                if get_current_owner(team) == owner_loser:
                    country_lineage[team].append(owner_winner)
                    count += 1
            print(f"{match['date']} ({match['stage']}): {teams[winner]['name']} ({winner}) beat {teams[loser]['name']} ({loser}). Owner {teams[owner_winner]['name']} ({owner_winner}) annexed Owner {teams[owner_loser]['name']} ({owner_loser}) (+{count} sectors)")

run_test_old()
