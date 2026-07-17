/**
 * Simulation Engine - Conquest Lineage Tracking & Sandbox Alternate History Logic
 */
let teamMetadata = {};
let matches = [];
let dates = [];
let currentDateIndex = 0;
let playbackInterval = null;
let originalTeams = [];
let countryLineage = {};
let userOverrides = {};
let isLightTheme = false;

function initOwnership() {
  countryLineage = {};
  originalTeams.forEach(team => {
    countryLineage[team] = [team];
  });
}

function getCurrentOwner(team) {
  const history = countryLineage[team];
  return history ? history[history.length - 1] : team;
}

function parseUrlOverrides() {
  const params = new URLSearchParams(window.location.search);
  const altParam = params.get("alt");
  if (altParam) {
    userOverrides = {};
    altParam.split(",").forEach(item => {
      const parts = item.split(":");
      if (parts.length === 2) {
        const idx = parseInt(parts[0]);
        if (!isNaN(idx)) {
          userOverrides[idx] = parts[1];
        }
      }
    });
  }
}

function toggleMatchWinner(matchIndex) {
  audio.playClick();
  const match = matches[matchIndex];
  if (!match) return;

  const currentWinner = (userOverrides[matchIndex] !== undefined) ? userOverrides[matchIndex] : match.winner;

  if (currentWinner === match.home) {
    userOverrides[matchIndex] = match.away;
  } else if (currentWinner === match.away) {
    userOverrides[matchIndex] = "";
  } else {
    userOverrides[matchIndex] = match.home;
  }

  updateUI();
}

function resetOverrides() {
  audio.playClick();
  userOverrides = {};
  const url = new URL(window.location.href);
  url.searchParams.delete("alt");
  window.history.replaceState({}, document.title, url.toString());
  updateUI();
}

function shareUniverse() {
  audio.playClick();
  const currentYear = document.getElementById("header-year").innerText;
  const overridePairs = Object.entries(userOverrides)
    .map(([idx, code]) => `${idx}:${code}`)
    .join(",");

  const url = new URL(window.location.href);
  url.searchParams.set("edition", currentYear);
  if (overridePairs) {
    url.searchParams.set("alt", overridePairs);
  } else {
    url.searchParams.delete("alt");
  }

  const urlString = url.toString();

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(urlString).then(() => {
      triggerAlert("PARALLEL UNIVERSE LINK COPIED TO CLIPBOARD!");
    }).catch(() => {
      fallbackCopyText(urlString);
    });
  } else {
    fallbackCopyText(urlString);
  }
}

function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    triggerAlert("PARALLEL UNIVERSE LINK COPIED TO CLIPBOARD!");
  } catch (err) {
    prompt("Copy this Universe URL:", text);
  }
  document.body.removeChild(textArea);
}

function runSimulationToDateIndex(dateIndex) {
  initOwnership();
  const targetDate = dates[dateIndex];
  const activeMatches = matches.filter(m => m.date <= targetDate);
  const logs = [];

  activeMatches.forEach(match => {
    const matchIdx = match.originalIndex;
    const winnerCode = (userOverrides[matchIdx] !== undefined) ? userOverrides[matchIdx] : match.winner;
    if (!winnerCode) return;

    const loserCode = (winnerCode === match.home) ? match.away : match.home;
    const ownerOfLoser = getCurrentOwner(loserCode);
    const ownerOfWinner = getCurrentOwner(winnerCode);
    
    if (ownerOfWinner !== ownerOfLoser) {
      let count = 0;
      originalTeams.forEach(team => {
        if (getCurrentOwner(team) === ownerOfLoser && countryLineage[team].includes(loserCode)) {
          countryLineage[team].push(ownerOfWinner);
          count++;
        }
      });
      logs.push({
        date: match.date,
        winner: teamMetadata[ownerOfWinner].name,
        winnerCode: ownerOfWinner,
        loser: teamMetadata[loserCode].name,
        loserCode: loserCode,
        count: count,
        stage: match.stage
      });

      if (count >= 4 && match.date === targetDate) {
        triggerAlert(`[EVENT]: ${teamMetadata[ownerOfWinner].name.toUpperCase()} annexed ${teamMetadata[loserCode].name.toUpperCase()}'s holdings (+${count} sectors)`);
      }
    } else {
      if (ownerOfWinner === loserCode) {
        let count = 0;
        originalTeams.forEach(team => {
          if (getCurrentOwner(team) === loserCode && countryLineage[team].includes(loserCode)) {
            countryLineage[team].push(winnerCode);
            count++;
          }
        });
        logs.push({
          date: match.date,
          winner: teamMetadata[winnerCode].name,
          winnerCode: winnerCode,
          loser: teamMetadata[loserCode].name,
          loserCode: loserCode,
          count: count,
          stage: `${match.stage} (Rebellion)`
        });

        if (count >= 4 && match.date === targetDate) {
          triggerAlert(`[REBELLION]: ${teamMetadata[winnerCode].name.toUpperCase()} overthrew ${teamMetadata[loserCode].name.toUpperCase()} (+${count} sectors)`);
        }
      }
    }
  });

  return logs;
}

function getLeaderboard() {
  const counts = {};
  originalTeams.forEach(team => {
    const owner = getCurrentOwner(team);
    counts[owner] = (counts[owner] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([teamCode, count]) => ({
      code: teamCode,
      name: teamMetadata[teamCode]?.name || teamCode,
      count: count,
      color: teamMetadata[teamCode]?.color || "#7f8c8d"
    }))
    .sort((a, b) => b.count - a.count);
}
