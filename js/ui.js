/**
 * UI Controller - D3 Map Orchestration, Leaderboards, Timeline Controls & Theme Toggling
 */
let svg, container, tooltip, projection, path, graticule, zoom;

function triggerAlert(message) {
  audio.playAlert();
  const banner = document.getElementById("alert-banner");
  if (!banner) return;
  document.getElementById("alert-message").innerText = message;
  banner.style.opacity = "1";
  banner.style.transform = "translate(-50%, 0)";
  
  setTimeout(() => {
    banner.style.opacity = "0";
    banner.style.transform = "translate(-50%, -16px)";
  }, 2500);
}

function switchEdition(edition) {
  if (playbackInterval) {
    stopPlayback();
  }
  loadEdition(edition);
}

function loadEdition(edition) {
  d3.json(`data/${edition}/world_cup_data.json`).then(wcData => {
    teamMetadata = wcData.teams;
    matches = wcData.matches;
    matches.forEach((m, idx) => m.originalIndex = idx);
    dates = Array.from(new Set(matches.map(m => m.date))).sort();
    originalTeams = Object.keys(teamMetadata);
    parseUrlOverrides();
    currentDateIndex = 0;

    document.getElementById("header-year").innerText = edition;

    const slider = document.getElementById("timeline-slider");
    slider.max = dates.length - 1;
    slider.value = 0;
    document.getElementById("timeline-end").innerText = formatDateString(dates[dates.length - 1]).toUpperCase();
    document.getElementById("timeline-start").innerText = formatDateString(dates[0]).toUpperCase();

    initOwnership();

    svg.selectAll(".country")
      .transition()
      .duration(300)
      .attr("fill", d => {
        if (d.code) {
          return getCountryColor(d.name, null, d.code);
        }
        return getCountryColor(d.properties ? d.properties.name : "", d.id);
      })
      .style("opacity", 1.0);

    updateUI();
  });
}

function updateUI() {
  const currentDate = dates[currentDateIndex];
  if (!currentDate) return;
  
  document.getElementById("current-date-badge").innerText = currentDate;
  document.getElementById("timeline-slider").value = currentDateIndex;

  const logs = runSimulationToDateIndex(currentDateIndex);

  svg.selectAll(".country")
    .transition()
    .duration(400)
    .ease(d3.easeCubicOut)
    .attr("fill", d => {
      if (d.code) {
        return getCountryColor(d.name, null, d.code);
      }
      return getCountryColor(d.properties ? d.properties.name : "", d.id);
    })
    .attr("class", d => {
      const alpha3 = d.code || getWCCodeFromMap(d.properties ? d.properties.name : "", d.id);
      let classes = d.code ? "country micro-nation" : "country";
      if (alpha3) {
        const owner = getCurrentOwner(alpha3);
        if (alpha3 === owner) {
          const isEmpire = originalTeams.filter(t => getCurrentOwner(t) === owner).length > 1;
          if (isEmpire) {
            classes += " empire-capital";
          }
        }
      }
      return classes;
    });

  // Render Empire Flow Vector Arcs
  const vectorGroup = svg.select(".vector-layer");
  vectorGroup.selectAll("*").remove();

  originalTeams.forEach(suzerainCode => {
    const holdings = originalTeams.filter(t => getCurrentOwner(t) === suzerainCode);
    if (holdings.length > 1 && centroids[suzerainCode]) {
      const [cx0, cy0] = centroids[suzerainCode];
      const color = teamMetadata[suzerainCode]?.color || "#00ff66";

      holdings.forEach(vassalCode => {
        if (vassalCode !== suzerainCode && centroids[vassalCode]) {
          const [cx1, cy1] = centroids[vassalCode];
          
          const midX = (cx0 + cx1) / 2;
          const midY = (cy0 + cy1) / 2;
          const dx = cx1 - cx0;
          const dy = cy1 - cy0;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const offset = Math.min(dist * 0.25, 45);
          const ctrlX = midX - (dy / (dist || 1)) * offset;
          const ctrlY = midY + (dx / (dist || 1)) * offset;

          const dStr = `M ${cx1} ${cy1} Q ${ctrlX} ${ctrlY} ${cx0} ${cy0}`;

          vectorGroup.append("path")
            .attr("d", dStr)
            .attr("class", `flow-arc flow-arc-${suzerainCode}`)
            .attr("stroke", color)
            .attr("stroke-width", "1.2px")
            .attr("opacity", 0.45);
        }
      });
    }
  });

  // Update Leaderboard
  const leaderboard = getLeaderboard();
  const activeFactionsCount = leaderboard.filter(e => e.count > 0).length;
  document.getElementById("active-factions").innerText = `${activeFactionsCount} Factions Active`;

  const championContainer = document.getElementById("champion-container");
  if (championContainer) {
    if (currentDateIndex === dates.length - 1 && leaderboard.length > 0) {
      const champion = leaderboard[0];
      const totalCount = originalTeams.length;
      championContainer.innerHTML = `
        <div class="mb-3 p-3 bg-gradient-to-r from-yellow-500/20 via-console-panel to-yellow-500/10 border border-yellow-400/80 rounded-sm font-mono shadow-xl relative overflow-hidden">
          <div class="text-[9px] uppercase tracking-widest text-yellow-400 font-bold flex items-center space-x-1">
            <i class="ph-fill ph-trophy text-xs animate-bounce"></i>
            <span>Conquest Champion</span>
          </div>
          <div class="flex items-center space-x-3 mt-1.5">
            ${getFlagImg(champion.code)}
            <span class="font-sans font-bold text-sm text-white">${champion.name}</span>
            <span class="ml-auto font-bold text-yellow-400 text-xs">${champion.count} / ${totalCount} SECTORS</span>
          </div>
        </div>
      `;
    } else {
      championContainer.innerHTML = "";
    }
  }

  renderStageJumpBar();

  const leaderboardEl = document.getElementById("leaderboard");
  leaderboardEl.innerHTML = leaderboard
    .filter(entry => entry.count > 0)
    .map((entry, idx) => `
      <div 
        onmouseenter="highlightOwner('${entry.code}')" 
        onmouseleave="resetHighlight()"
        class="flex items-center justify-between p-2 bg-console-bg border border-console-border hover:border-console-accent/40 rounded-sm cursor-pointer transition"
      >
        <div class="flex items-center space-x-2.5">
          <span class="w-3 text-center font-mono text-[9px] font-bold text-console-dimText">${idx + 1}</span>
          ${getFlagImg(entry.code)}
          <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${entry.color}"></span>
          <span class="text-[11px] font-semibold text-console-text font-sans">${entry.name}</span>
        </div>
        <div class="flex items-center space-x-2 font-mono">
          <span class="text-[9px] text-console-dimText">HOLDINGS:</span>
          <span class="font-bold text-console-accent text-[11px]">${entry.count}</span>
        </div>
      </div>
    `).join("");

  // Sandbox status indicator
  const overrideCount = Object.keys(userOverrides).length;
  const resetBtn = document.getElementById("btn-reset-overrides");
  const statusLabel = document.getElementById("sim-status-label");
  if (overrideCount > 0) {
    resetBtn.classList.remove("hidden");
    statusLabel.innerText = `Status: Parallel Universe (${overrideCount} Alt)`;
    statusLabel.className = "text-[10px] uppercase font-mono text-console-accent font-bold animate-pulse";
  } else {
    resetBtn.classList.add("hidden");
    statusLabel.innerText = "Status: Simulating";
    statusLabel.className = "text-[10px] uppercase font-mono text-console-dimText";
  }

  // Update Terminal Log / Overrides list
  const logEl = document.getElementById("conquest-log");
  const activeMatchesList = matches.filter(m => m.date <= currentDate);
  
  if (activeMatchesList.length === 0) {
    logEl.innerHTML = `<div class="text-console-dimText italic">// Console ready. Awaiting tournament kickoff...</div>`;
  } else {
    logEl.innerHTML = activeMatchesList.slice().reverse().map(match => {
      const idx = match.originalIndex;
      const currentWinner = (userOverrides[idx] !== undefined) ? userOverrides[idx] : match.winner;
      const isOverridden = (userOverrides[idx] !== undefined);

      const homeName = teamMetadata[match.home]?.name || match.home;
      const awayName = teamMetadata[match.away]?.name || match.away;

      let resultText = "";
      if (currentWinner === match.home) {
        resultText = `<span class="text-console-accent font-bold">${homeName} WIN</span>`;
      } else if (currentWinner === match.away) {
        resultText = `<span class="text-console-red font-bold">${awayName} WIN</span>`;
      } else {
        resultText = `<span class="text-console-dimText italic">DRAW / UNPLAYED</span>`;
      }

      return `
        <div 
          onclick="toggleMatchWinner(${idx})"
          title="Click to cycle match result (Sandbox Mode)"
          class="mb-1.5 p-1.5 bg-console-bg border ${isOverridden ? 'border-console-accent bg-console-accent/5' : 'border-console-border hover:border-console-accent/40'} rounded-sm cursor-pointer transition flex items-center justify-between group"
        >
          <div class="text-[10px] font-mono leading-tight">
            <div class="text-[9px] text-console-dimText flex items-center space-x-1">
              <span>${match.date}</span>
              <span>•</span>
              <span>${match.stage}</span>
              ${isOverridden ? '<span class="text-console-accent font-bold ml-1">[ALT]</span>' : ''}
            </div>
            <div class="text-console-text font-semibold mt-0.5">
              ${getFlagImg(match.home)} ${homeName} <span class="text-console-dimText font-normal">vs</span> ${awayName} ${getFlagImg(match.away)}
            </div>
            <div class="text-[10px] mt-0.5 flex items-center space-x-2">
              <span>Result: ${resultText}</span>
              <span class="text-console-dimText/70 text-[9px]">• Real: ${match.score}</span>
            </div>
          </div>
          <div class="text-[10px] text-console-dimText group-hover:text-console-accent transition flex items-center space-x-1">
            <i class="ph-bold ph-pencil-simple"></i>
          </div>
        </div>
      `;
    }).join("");
  }
}

function switchMobileTab(tab) {
  const mapSec = document.getElementById("map-section");
  const sidePanel = document.getElementById("sidebar-panel");
  const lbSec = document.getElementById("leaderboard-section");
  const logsSec = document.getElementById("logs-section");

  document.getElementById("tab-map").className = "flex-1 py-3 text-center border-r border-console-border " + (tab === 'map' ? "text-console-accent font-bold" : "");
  document.getElementById("tab-leaderboard").className = "flex-1 py-3 text-center border-r border-console-border " + (tab === 'leaderboard' ? "text-console-accent font-bold" : "");
  document.getElementById("tab-logs").className = "flex-1 py-3 text-center " + (tab === 'logs' ? "text-console-accent font-bold" : "");

  if (tab === 'map') {
    mapSec.classList.remove("hidden");
    sidePanel.classList.add("hidden");
  } else if (tab === 'leaderboard') {
    mapSec.classList.add("hidden");
    sidePanel.classList.remove("hidden");
    lbSec.classList.remove("hidden");
    logsSec.classList.add("hidden");
    sidePanel.className = "w-full bg-console-panel border-b border-console-border flex flex-col h-auto overflow-hidden";
  } else if (tab === 'logs') {
    mapSec.classList.add("hidden");
    sidePanel.classList.remove("hidden");
    lbSec.classList.add("hidden");
    logsSec.classList.remove("hidden");
    sidePanel.className = "w-full bg-console-panel border-b border-console-border flex flex-col h-auto overflow-hidden";
  }
}

function startPlayback() {
  audio.playChime(true);
  const playBtn = document.getElementById("btn-play");
  playBtn.classList.remove("bg-console-accent", "text-console-bg");
  playBtn.classList.add("bg-console-red", "text-console-text");
  document.getElementById("play-icon").className = "ph-fill ph-pause text-xs";
  document.getElementById("play-text").innerText = "Pause";
  
  playbackInterval = setInterval(() => {
    if (currentDateIndex < dates.length - 1) {
      currentDateIndex++;
      updateUI();
    } else {
      stopPlayback();
    }
  }, 1500);
}

function stopPlayback() {
  audio.playChime(false);
  const playBtn = document.getElementById("btn-play");
  clearInterval(playbackInterval);
  playbackInterval = null;
  playBtn.classList.add("bg-console-accent", "text-console-bg");
  playBtn.classList.remove("bg-console-red", "text-console-text");
  document.getElementById("play-icon").className = "ph-fill ph-play text-xs";
  document.getElementById("play-text").innerText = "Play";
}

function renderStageJumpBar() {
  const bar = document.getElementById("stage-jump-bar");
  if (!matches || matches.length === 0 || !bar) return;

  const stageMap = {};
  matches.forEach(m => {
    let key = m.stage;
    if (key.includes("Group")) key = "Group Stage";
    if (stageMap[key] === undefined) {
      stageMap[key] = dates.indexOf(m.date);
    }
  });

  const stageLabels = {
    "Group Stage": "GROUP",
    "Round of 16": "R16",
    "Quarterfinal": "QUARTER",
    "Semifinal": "SEMI",
    "Third-Place Match": "3RD PLACE",
    "Final": "FINAL"
  };

  bar.innerHTML = Object.entries(stageMap).map(([stage, dateIdx]) => {
    const label = stageLabels[stage] || stage.toUpperCase();
    const isActive = (currentDateIndex >= dateIdx && dateIdx !== -1);
    return `
      <button 
        onclick="jumpToDateIndex(${dateIdx})" 
        title="Jump to ${stage}"
        class="px-1.5 py-0.5 rounded transition cursor-pointer font-mono text-[9px] ${isActive ? 'text-console-accent font-bold bg-console-accent/10 border border-console-accent/30' : 'hover:text-console-text text-console-dimText'}"
      >
        • ${label}
      </button>
    `;
  }).join("");
}

function jumpToDateIndex(dateIdx) {
  if (dateIdx === -1) return;
  audio.playClick();
  if (playbackInterval) stopPlayback();
  currentDateIndex = dateIdx;
  updateUI();
}

function toggleTheme() {
  audio.playClick();
  isLightTheme = !isLightTheme;
  const body = document.body;
  const icon = document.getElementById("theme-icon");
  const label = document.getElementById("theme-label");

  if (isLightTheme) {
    body.classList.add("light-theme");
    icon.className = "ph-bold ph-moon text-[10px]";
    label.innerText = "THEME: LIGHT";
  } else {
    body.classList.remove("light-theme");
    icon.className = "ph-bold ph-sun text-[10px]";
    label.innerText = "THEME: DARK";
  }

  updateUI();
}

// Global Keyboard Hotkeys Listener
document.addEventListener("keydown", (e) => {
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;

  if (e.code === "Space") {
    e.preventDefault();
    document.getElementById("btn-play").click();
  } else if (e.code === "ArrowLeft") {
    e.preventDefault();
    document.getElementById("btn-prev").click();
  } else if (e.code === "ArrowRight") {
    e.preventDefault();
    document.getElementById("btn-next").click();
  } else if (e.code === "KeyR") {
    e.preventDefault();
    resetOverrides();
  } else if (e.code === "KeyM") {
    e.preventDefault();
    toggleAudio();
  }
});

// Initialize Map & Event Bindings on Document Ready
document.addEventListener("DOMContentLoaded", () => {
  svg = d3.select("#world-map");
  container = d3.select("#map-container");
  tooltip = d3.select("#tooltip");

  projection = d3.geoNaturalEarth1();
  path = d3.geoPath().projection(projection);
  graticule = d3.geoGraticule();

  zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {
      svg.selectAll("g").attr("transform", event.transform);
      svg.selectAll(".micro-nation")
        .attr("r", 3.5 / event.transform.k);
      svg.selectAll(".flow-arc")
        .style("stroke-width", (1.2 / event.transform.k) + "px");
    });

  svg.call(zoom);

  const slider = document.getElementById("timeline-slider");
  slider.addEventListener("input", (e) => {
    audio.playClick();
    currentDateIndex = parseInt(e.target.value);
    updateUI();
    if (playbackInterval) stopPlayback();
  });

  document.getElementById("btn-prev").addEventListener("click", () => {
    if (currentDateIndex > 0) {
      audio.playClick();
      currentDateIndex--;
      updateUI();
      if (playbackInterval) stopPlayback();
    }
  });

  document.getElementById("btn-next").addEventListener("click", () => {
    if (currentDateIndex < dates.length - 1) {
      audio.playClick();
      currentDateIndex++;
      updateUI();
      if (playbackInterval) stopPlayback();
    }
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    audio.playClick();
    currentDateIndex = 0;
    updateUI();
    if (playbackInterval) stopPlayback();
  });

  const playBtn = document.getElementById("btn-play");
  playBtn.addEventListener("click", () => {
    if (playbackInterval) {
      stopPlayback();
    } else {
      startPlayback();
    }
  });

  if (window.innerWidth < 1024) {
    switchMobileTab('map');
  }

  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(mapData => {
    worldData = topojson.feature(mapData, mapData.objects.countries);
    worldData.features = worldData.features.filter(d => d.id !== "010");

    const width = container.node().clientWidth || 800;
    const height = container.node().clientHeight || 500;
    projection.fitSize([width, height], worldData);

    const g = svg.append("g");

    g.append("path")
      .datum(graticule)
      .attr("class", "graticule")
      .attr("d", path);

    g.selectAll(".country")
      .data(worldData.features)
      .enter()
      .append("path")
        .attr("d", path)
        .attr("id", d => {
          const alpha3 = getWCCodeFromMap(d.properties ? d.properties.name : "", d.id);
          return alpha3 ? `country-${alpha3}` : `country-numeric-${d.id}`;
        })
        .attr("class", "country")
        .attr("fill", "#161a22")
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseout", hideTooltip);

    const microNations = [
      { code: "CUW", name: "Curaçao", coords: [-68.9900, 12.1696] },
      { code: "CPV", name: "Cabo Verde", coords: [-24.0132, 16.0022] },
      { code: "TTO", name: "Trinidad & Tobago", coords: [-61.2225, 10.6918] }
    ];

    g.selectAll(".micro-nation")
      .data(microNations)
      .enter()
      .append("circle")
        .attr("class", "country micro-nation")
        .attr("id", d => `country-${d.code}`)
        .attr("cx", d => projection(d.coords)[0])
        .attr("cy", d => projection(d.coords)[1])
        .attr("r", 3.5)
        .attr("fill", "#161a22")
        .on("mouseover", (event, d) => {
          const mockedD = {
            id: null,
            properties: { name: d.name },
            code: d.code
          };
          showTooltip(event, mockedD);
        })
        .on("mousemove", moveTooltip)
        .on("mouseout", (event, d) => {
          const mockedD = {
            id: null,
            properties: { name: d.name },
            code: d.code
          };
          hideTooltip(event, mockedD);
        });

    g.append("g").attr("class", "vector-layer");

    centroids = {};
    worldData.features.forEach(f => {
      const code = getWCCodeFromMap(f.properties ? f.properties.name : "", f.id);
      if (code) {
        centroids[code] = path.centroid(f);
      }
    });
    microNations.forEach(m => {
      centroids[m.code] = projection(m.coords);
    });

    const params = new URLSearchParams(window.location.search);
    const editionParam = params.get("edition");
    const targetEdition = editionParam || "2026";
    const selectEl = document.getElementById("edition-select");
    if (selectEl) selectEl.value = targetEdition;

    loadEdition(targetEdition);
  });
});
