// --- Campaign Faction System Module ---

function openFactionModal() {
  const modal = document.getElementById("faction-modal");
  const grid = document.getElementById("faction-teams-grid");
  if (!modal || !grid) return;

  grid.innerHTML = originalTeams.map(code => {
    const team = teamMetadata[code];
    const name = team?.name || code;
    const isSelected = activeCampaignTeam === code;

    return `
      <div 
        onclick="selectCampaignTeam('${code}')"
        class="p-2.5 bg-console-panel border ${isSelected ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-console-border hover:border-amber-500/50'} rounded-lg cursor-pointer transition flex items-center space-x-2 group"
      >
        ${getFlagImg(code).replace('w-5 h-3.5', 'w-7 h-5 rounded')}
        <div class="flex flex-col min-w-0 flex-1">
          <span class="font-bold font-sans text-xs text-white truncate">${name}</span>
          <span class="text-[8px] text-console-dimText uppercase font-mono">${code}</span>
        </div>
        ${isSelected ? '<i class="ph-bold ph-check-circle text-amber-400 text-sm"></i>' : ''}
      </div>
    `;
  }).join("");

  modal.classList.remove("hidden");
}

function closeFactionModal() {
  const modal = document.getElementById("faction-modal");
  if (modal) modal.classList.add("hidden");
}

function selectCampaignTeam(code) {
  activeCampaignTeam = code;
  localStorage.setItem("activeCampaignTeam", code);
  audio.playClick();
  closeFactionModal();
  updateCampaignHUD();
  updateUI();
  if (centroids[code]) {
    focusMapOnTeams([code]);
  }
  triggerAlert(`COMMANDER ASSIGNED TO ${teamMetadata[code]?.name || code}!`);
}

function updateCampaignHUD() {
  const hud = document.getElementById("campaign-hud");
  const selectBtnText = document.getElementById("campaign-select-text");
  const bannerTitle = document.getElementById("hero-banner-title");
  const bannerContent = document.getElementById("hero-banner-content");

  if (!activeCampaignTeam || !originalTeams.includes(activeCampaignTeam)) {
    if (hud) hud.classList.add("hidden");
    if (selectBtnText) selectBtnText.innerText = "FACTION";
    if (bannerTitle) bannerTitle.innerText = "SELECT CAMPAIGN FACTION";
    if (bannerContent) bannerContent.innerHTML = `<span>Choose your nation to lead global conquest</span>`;
    if (activeCampaignTeam && !originalTeams.includes(activeCampaignTeam) && typeof triggerAlert === "function") {
      const year = document.getElementById("header-year")?.innerText || "";
      triggerAlert(`${activeCampaignTeam} DID NOT QUALIFY FOR THE ${year} WORLD CUP`);
    }
    return;
  }

  if (hud) hud.classList.remove("hidden");
  if (selectBtnText) selectBtnText.innerText = activeCampaignTeam;

  const teamName = teamMetadata[activeCampaignTeam]?.name || activeCampaignTeam;
  document.getElementById("hud-flag").innerHTML = getFlagImg(activeCampaignTeam).replace('w-5 h-3.5', 'w-8 h-5 rounded shadow');
  document.getElementById("hud-name").innerText = teamName;

  const sectors = originalTeams.filter(t => getCurrentOwner(t) === activeCampaignTeam).length;
  document.getElementById("hud-sectors").innerText = sectors;

  let title = "INDEPENDENT STATE";
  if (sectors >= 24) title = "GLOBAL HEGEMON";
  else if (sectors >= 8) title = "CONTINENTAL EMPIRE";
  else if (sectors >= 3) title = "REGIONAL POWER";
  else if (sectors > 1) title = "EXPANDING KINGDOM";

  document.getElementById("hud-title").innerText = title;

  if (bannerTitle) bannerTitle.innerText = `FACTION COMMANDER: ${activeCampaignTeam}`;
  if (bannerContent) {
    bannerContent.innerHTML = `
      ${getFlagImg(activeCampaignTeam)}
      <span class="font-bold text-white font-sans text-xs">${teamName}</span>
      <span class="text-amber-400 font-mono text-[10px] ml-auto font-bold">${title} (${sectors})</span>
    `;
  }
}
