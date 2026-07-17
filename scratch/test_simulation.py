import json
import glob
import os

def test_all_years():
    data_dirs = sorted(glob.glob("data/[0-9][0-9][0-9][0-9]"))
    print(f"Found {len(data_dirs)} years to verify: {[os.path.basename(d) for d in data_dirs]}")
    
    all_success = True
    
    for y_dir in data_dirs:
        year = os.path.basename(y_dir)
        filepath = os.path.join(y_dir, "world_cup_data.json")
        
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        teams = data["teams"]
        matches = data["matches"]
        
        original_teams = list(teams.keys())
        country_lineage = {t: [t] for t in original_teams}

        def get_current_owner(t):
            return country_lineage[t][-1]

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
                for t in original_teams:
                    if get_current_owner(t) == owner_loser:
                        country_lineage[t].append(owner_winner)
            else:
                # Rebellion check
                if owner_winner == loser:
                    for t in original_teams:
                        if get_current_owner(t) == loser:
                            country_lineage[t].append(winner)

        # Count holdings
        counts = {}
        for t in original_teams:
            owner = get_current_owner(t)
            counts[owner] = counts.get(owner, 0) + 1
            
        leaderboard = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        top_team_code, top_count = leaderboard[0]
        top_team_name = teams[top_team_code]["name"]
        
        total_teams = len(original_teams)
        if top_count == total_teams:
            print(f"[{year}] SUCCESS: {top_team_name} ({top_team_code}) won the conquest with all {top_count}/{total_teams} holdings.")
        else:
            print(f"[{year}] FAILURE: Top team is {top_team_name} ({top_team_code}) with only {top_count}/{total_teams} holdings.")
            all_success = False
            # Print leaderboard for debugging
            for rank, (code, count) in enumerate(leaderboard[:5]):
                print(f"   {rank+1}. {teams[code]['name']} ({code}): {count} holdings")
                
    if all_success:
        print("\n=== ALL YEARS ARE 100% CORRECT! ===")
    else:
        print("\n=== SOME YEARS FAILED CONQUEST VERIFICATION ===")

test_all_years()
