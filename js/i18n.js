// --- Internationalization (i18n) Module (English / Chinese) ---

const TEAM_NAMES_ZH = {
  "AGO": "安哥拉", "ARG": "阿根廷", "AUS": "澳大利亚", "AUT": "奥地利",
  "BEL": "比利时", "BGR": "保加利亚", "BIH": "波黑", "BRA": "巴西",
  "CAN": "加拿大", "CHE": "瑞士", "CHL": "智利", "CHN": "中国",
  "CIV": "科特迪瓦", "CMR": "喀麦隆", "COD": "刚果民主共和国", "COL": "哥伦比亚",
  "CPV": "佛得角", "CRI": "哥斯达黎加", "CUW": "库拉索", "CZE": "捷克",
  "DEU": "德国", "DNK": "丹麦", "DZA": "阿尔及利亚", "ECU": "厄瓜多尔",
  "EGY": "埃及", "ENG": "英格兰", "ESP": "西班牙", "FRA": "法国",
  "GHA": "加纳", "GRC": "希腊", "HND": "洪都拉斯", "HRV": "克罗地亚",
  "HTI": "海地", "IRL": "爱尔兰", "IRN": "伊朗", "IRQ": "伊拉克",
  "ISL": "冰岛", "ITA": "意大利", "JAM": "牙买加", "JOR": "约旦",
  "JPN": "日本", "KOR": "韩国", "MAR": "摩洛哥", "MEX": "墨西哥",
  "NGA": "尼日利亚", "NLD": "荷兰", "NOR": "挪威", "NZL": "新西兰",
  "PAN": "巴拿马", "PER": "秘鲁", "POL": "波兰", "PRK": "朝鲜",
  "PRT": "葡萄牙", "PRY": "巴拉圭", "QAT": "卡塔尔", "ROU": "罗马尼亚",
  "RUS": "俄罗斯", "SAU": "沙特阿拉伯", "SCO": "苏格兰", "SEN": "塞内加尔",
  "SRB": "塞尔维亚", "SVK": "斯洛伐克", "SVN": "斯洛文尼亚", "SWE": "瑞典",
  "TGO": "多哥", "TTO": "特立尼达和多巴哥", "TUN": "突尼斯", "TUR": "土耳其",
  "UKR": "乌克兰", "URY": "乌拉圭", "USA": "美国", "UZB": "乌兹别克斯坦",
  "WAL": "威尔士", "ZAF": "南非"
};

const STAGE_NAMES_ZH = {
  "Group Stage": "小组赛",
  "Round of 32": "32强赛",
  "Round of 16": "1/8决赛",
  "Quarter-finals": "1/4决赛",
  "Semi-finals": "半决赛",
  "3rd Place": "三四名决赛",
  "Final": "决赛"
};

const I18N = {
  en: {
    langBtn: "LANG: EN",
    themeDark: "THEME: DARK",
    themeLight: "THEME: LIGHT",
    editionLabel: "Edition:",
    factionHud: "FACTION HUD",
    factionChange: "CHANGE",
    selectFactionTitle: "SELECT CAMPAIGN FACTION",
    selectFactionDesc: "Choose your nation to lead global conquest",
    sectorsHeld: "SECTORS HELD:",
    play: "Play",
    pause: "Pause",
    kickoff: "KICKOFF",
    final: "FINAL",
    statusSimulating: "Status: Simulating",
    statusParallel: "Status: Parallel Universe",
    resetOverrides: "RESET OVERRIDES",
    mapLegendTitle: "TACTICAL MAP LEGEND",
    annexedTerritory: "Annexed Territory",
    activeClash: "Active Clash Focus",
    factionHq: "Faction Headquarters",
    independentState: "INDEPENDENT STATE",
    expandingKingdom: "EXPANDING KINGDOM",
    regionalPower: "REGIONAL POWER",
    continentalEmpire: "CONTINENTAL EMPIRE",
    globalHegemon: "GLOBAL HEGEMON",
    chooseFactionModalTitle: "CHOOSE YOUR FACTION",
    chooseFactionModalSub: "Select a country to command in territorial conquest mode"
  },
  zh: {
    langBtn: "语言: 中文",
    themeDark: "主题: 暗黑",
    themeLight: "主题: 明亮",
    editionLabel: "届份:",
    factionHud: "阵营控制台",
    factionChange: "切换阵营",
    selectFactionTitle: "选择征服阵营",
    selectFactionDesc: "选择你的国家，带领军队征服全球",
    sectorsHeld: "占领版图:",
    play: "推演",
    pause: "暂停",
    kickoff: "开幕战",
    final: "决赛",
    statusSimulating: "状态: 推演中",
    statusParallel: "状态: 平行宇宙",
    resetOverrides: "重置篡改",
    mapLegendTitle: "战术地图图例",
    annexedTerritory: "占领领土",
    activeClash: "焦点对决",
    factionHq: "阵营大本营",
    independentState: "独立主权国",
    expandingKingdom: "扩张强权",
    regionalPower: "区域强权",
    continentalEmpire: "洲际帝国",
    globalHegemon: "全球霸主",
    chooseFactionModalTitle: "选择你的征服阵营",
    chooseFactionModalSub: "选择一个国家领地开启全球征服演练"
  }
};

let currentLang = localStorage.getItem("appLang") || "zh";

function getTeamName(code, defaultName) {
  if (currentLang === "zh" && TEAM_NAMES_ZH[code]) {
    return TEAM_NAMES_ZH[code];
  }
  return defaultName || code;
}

function getStageName(stage) {
  if (currentLang === "zh" && STAGE_NAMES_ZH[stage]) {
    return STAGE_NAMES_ZH[stage];
  }
  return stage;
}

function toggleLanguage() {
  currentLang = (currentLang === "en") ? "zh" : "en";
  localStorage.setItem("appLang", currentLang);
  if (typeof audio !== "undefined" && audio.playClick) audio.playClick();
  updateLanguageUI();
  if (typeof updateCampaignHUD === "function") updateCampaignHUD();
  if (typeof updateUI === "function") updateUI();
}

function updateLanguageUI() {
  const t = I18N[currentLang] || I18N.en;
  
  const updateEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  };

  updateEl("lang-label", t.langBtn);
  
  const editionLabelEl = document.getElementById("edition-label");
  if (editionLabelEl) editionLabelEl.innerText = t.editionLabel;

  const btnResetOverrides = document.getElementById("btn-reset-overrides");
  if (btnResetOverrides) {
    btnResetOverrides.innerHTML = `<i class="ph-bold ph-arrow-counter-clockwise text-xs"></i><span>${t.resetOverrides}</span>`;
  }

  const modalTitle = document.getElementById("modal-faction-title");
  if (modalTitle) modalTitle.innerText = t.chooseFactionModalTitle;

  const modalSub = document.getElementById("modal-faction-sub");
  if (modalSub) modalSub.innerText = t.chooseFactionModalSub;

  const mapLegendTitle = document.getElementById("map-legend-title");
  if (mapLegendTitle) mapLegendTitle.innerText = t.mapLegendTitle;
}
