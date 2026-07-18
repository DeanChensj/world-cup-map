// --- Campaign Faction System Module ---

function openFactionModal() {
  const modal = document.getElementById("faction-modal");
  const grid = document.getElementById("faction-teams-grid");
  if (!modal || !grid) return;

  const isZh = (typeof currentLang !== "undefined" && currentLang === "zh");

  const clearCardHTML = `
    <div 
      onclick="clearCampaignTeam()"
      class="p-2 bg-console-panel border ${!activeCampaignTeam ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-console-border hover:border-console-red'} rounded-lg cursor-pointer transition flex items-center space-x-2 group col-span-2 sm:col-span-3 md:col-span-4 mb-1"
    >
      <i class="ph-bold ph-globe text-amber-400 text-base"></i>
      <div class="flex flex-col min-w-0 flex-1">
        <span class="font-bold font-sans text-xs text-white truncate">${isZh ? '🌐 全局观战模式 (取消主队选择)' : '🌐 SPECTATOR MODE (NO FACTION SELECTED)'}</span>
        <span class="text-[8px] text-console-dimText uppercase font-mono">${isZh ? '点击退出战役主队模式，切换为自由观战' : 'CLICK TO CLEAR COMMANDER FACTION & SWITCH TO SPECTATOR'}</span>
      </div>
      ${!activeCampaignTeam ? '<i class="ph-bold ph-check-circle text-amber-400 text-sm"></i>' : `<span class="text-[9px] text-console-dimText group-hover:text-console-red font-mono">[✕ ${isZh ? '取消' : 'Clear'}]</span>`}
    </div>
  `;

  const teamsHTML = originalTeams.map(code => {
    const team = teamMetadata[code];
    const name = (typeof getTeamName === "function") ? getTeamName(code, team?.name) : (team?.name || code);
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

  grid.innerHTML = clearCardHTML + teamsHTML;

  modal.classList.remove("hidden");
}

function closeFactionModal() {
  const modal = document.getElementById("faction-modal");
  if (modal) modal.classList.add("hidden");
}

function clearCampaignTeam() {
  if (typeof audio !== "undefined") audio.playClick();
  activeCampaignTeam = null;
  localStorage.removeItem("activeCampaignTeam");
  closeFactionModal();
  updateCampaignHUD();
  updateUI();
  const isZh = (typeof currentLang !== "undefined" && currentLang === "zh");
  if (typeof triggerAlert === "function") {
    triggerAlert(isZh ? "已退出战役模式 (切换为全局观战)" : "FACTION CLEARED (SPECTATOR MODE ACTIVE)");
  }
}

function selectCampaignTeam(code) {
  activeCampaignTeam = code;
  localStorage.setItem("activeCampaignTeam", code);
  if (typeof audio !== "undefined") {
    if (audio.playMatchWin) audio.playMatchWin(); else audio.playClick();
  }
  closeFactionModal();
  updateCampaignHUD();
  updateUI();
  if (centroids[code]) {
    focusMapOnTeams([code]);
  }
  const teamName = (typeof getTeamName === "function") ? getTeamName(code, teamMetadata[code]?.name) : (teamMetadata[code]?.name || code);
  triggerAlert(`COMMANDER ASSIGNED TO ${teamName.toUpperCase()}!`);
}

function updateCampaignHUD() {
  const hud = document.getElementById("campaign-hud");
  const selectBtnText = document.getElementById("campaign-select-text");
  const bannerTitle = document.getElementById("hero-banner-title");
  const bannerContent = document.getElementById("hero-banner-content");
  const t = (typeof I18N !== "undefined" && typeof currentLang !== "undefined") ? (I18N[currentLang] || I18N.en) : null;

  if (!activeCampaignTeam || !originalTeams.includes(activeCampaignTeam)) {
    if (hud) hud.classList.add("hidden");
    if (selectBtnText) selectBtnText.innerText = t ? t.factionHud : "FACTION HUD";
    if (bannerTitle) bannerTitle.innerText = t ? t.selectFactionTitle : "SELECT CAMPAIGN FACTION";
    if (bannerContent) bannerContent.innerHTML = `<span>${t ? t.selectFactionDesc : 'Choose your nation to lead global conquest'}</span>`;
    if (activeCampaignTeam && !originalTeams.includes(activeCampaignTeam) && typeof triggerAlert === "function") {
      const year = document.getElementById("header-year")?.innerText || "";
      triggerAlert(`${activeCampaignTeam} DID NOT QUALIFY FOR THE ${year} WORLD CUP`);
    }
    return;
  }

  if (hud) hud.classList.remove("hidden");
  if (selectBtnText) selectBtnText.innerText = activeCampaignTeam;

  const teamName = (typeof getTeamName === "function") ? getTeamName(activeCampaignTeam, teamMetadata[activeCampaignTeam]?.name) : (teamMetadata[activeCampaignTeam]?.name || activeCampaignTeam);
  document.getElementById("hud-flag").innerHTML = getFlagImg(activeCampaignTeam).replace('w-5 h-3.5', 'w-8 h-5 rounded shadow');
  document.getElementById("hud-name").innerText = teamName;

  const sectors = originalTeams.filter(t => getCurrentOwner(t) === activeCampaignTeam).length;
  document.getElementById("hud-sectors").innerText = sectors;

  let titleKey = "independentState";
  if (sectors >= 24) titleKey = "globalHegemon";
  else if (sectors >= 8) titleKey = "continentalEmpire";
  else if (sectors >= 3) titleKey = "regionalPower";
  else if (sectors > 1) titleKey = "expandingKingdom";

  const title = t ? t[titleKey] : titleKey.toUpperCase();

  document.getElementById("hud-title").innerText = title;

  if (bannerTitle) bannerTitle.innerText = `${t ? (currentLang === 'zh' ? '阵营指挥官' : 'FACTION COMMANDER') : 'FACTION COMMANDER'}: ${activeCampaignTeam}`;
  if (bannerContent) {
    bannerContent.innerHTML = `
      ${getFlagImg(activeCampaignTeam)}
      <span class="font-bold text-white font-sans text-xs">${teamName}</span>
      <span class="text-amber-400 font-mono text-[10px] ml-auto font-bold">${title} (${sectors})</span>
    `;
  }
}
