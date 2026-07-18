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

const CAPITAL_NAMES_ZH = {
  "CAN": "渥太华", "MEX": "墨西哥城", "USA": "华盛顿特区", "AUS": "堪培拉",
  "IRQ": "巴格达", "IRN": "德黑兰", "JPN": "东京", "JOR": "安曼",
  "KOR": "首尔", "QAT": "多哈", "SAU": "利雅得", "UZB": "塔什干",
  "DZA": "阿尔及尔", "CPV": "普拉亚", "COD": "金沙萨", "CIV": "雅穆苏克罗",
  "EGY": "开罗", "GHA": "阿克拉", "MAR": "拉巴特", "SEN": "达喀尔",
  "ZAF": "比勒陀利亚", "TUN": "突尼斯城", "HTI": "太子港", "PAN": "巴拿马城",
  "ARG": "布宜诺斯艾利斯", "BRA": "巴西利亚", "COL": "波哥大", "ECU": "基多",
  "PRY": "亚松森", "URY": "蒙得维的亚", "NZL": "惠灵顿", "AUT": "维也纳",
  "BEL": "布鲁塞尔", "BIH": "萨拉热窝", "HRV": "萨格勒布", "CZE": "布拉格",
  "ENG": "伦敦", "FRA": "巴黎", "DEU": "柏林", "NLD": "阿姆斯特丹",
  "NOR": "奥斯陆", "PRT": "里斯本", "SCO": "爱丁堡", "WAL": "加的夫",
  "NIR": "贝尔法斯特", "ESP": "马德里", "SWE": "斯德哥尔摩", "CHE": "伯尔尼",
  "TUR": "安卡拉", "CUW": "威廉斯塔德", "AGO": "罗安达", "BGR": "索非亚",
  "CMR": "雅温得", "CRI": "圣何塞", "DNK": "哥本哈根", "HND": "特古西加尔巴",
  "IRL": "都柏林", "ISL": "雷克雅未克", "ITA": "罗马", "JAM": "金斯敦",
  "NGA": "阿布贾", "POL": "华沙", "PRK": "平壤", "ROU": "布加勒斯特",
  "RUS": "莫斯科", "SRB": "贝尔格莱德", "SVK": "布拉迪斯拉发", "SVN": "卢布尔雅那",
  "TGO": "洛美", "TTO": "西班牙港", "UKR": "基辅", "CHN": "北京", "CHL": "圣地亚哥",
  "PER": "利马"
};

const STAGE_NAMES_ZH = {
  "Group Stage": "小组赛",
  "Round of 32": "32强赛",
  "Round of 16": "1/8决赛",
  "Quarter-finals": "1/4决赛",
  "Quarterfinals": "1/4决赛",
  "Semi-finals": "半决赛",
  "Semifinals": "半决赛",
  "3rd Place": "三四名决赛",
  "Final": "决赛"
};

const I18N = {
  en: {
    siteTitle: "World Cup Map //",
    langBtn: "LANG: EN",
    themeDark: "THEME: DARK",
    themeLight: "THEME: LIGHT",
    sfxOn: "SFX: ON",
    sfxOff: "SFX: OFF",
    editionLabel: "Edition:",
    shareBtn: "SHARE",
    resetOverridesBtn: "RESET",
    tabMap: "MAP VIEW",
    tabLeaderboard: "HOLDINGS",
    tabLogs: "FEED",
    leaderboardTitle: "Territorial Holdings",
    activeFactionsCount: (n) => `${n} Active Factions`,
    selectFactionTitle: "SELECT CAMPAIGN FACTION",
    selectFactionDesc: "Choose your nation to lead global conquest",
    heroBannerCommander: "FACTION COMMANDER:",
    liveFeedTitle: "Live Feed [Conquest log]",
    clashCardDefaultStage: "TACTICAL CONFLICT // MATCH",
    factionHud: "FACTION HUD",
    factionChange: "CHANGE",
    sectorsHeld: "SECTORS HELD:",
    mapLegendTitle: "TACTICAL MAP LEGEND",
    legendAnnexed: "Annexed Territory",
    legendActiveClash: "Active Clash Focus",
    legendHq: "Faction Headquarters",
    play: "Play",
    pause: "Pause",
    kickoff: "KICKOFF",
    final: "FINAL",
    statusSimulating: "Status: Simulating",
    statusParallel: (count) => `Status: Parallel Universe (${count} Alt)`,
    resetOverrides: "RESET OVERRIDES",
    independentState: "INDEPENDENT STATE",
    expandingKingdom: "EXPANDING KINGDOM",
    regionalPower: "REGIONAL POWER",
    continentalEmpire: "CONTINENTAL EMPIRE",
    globalHegemon: "GLOBAL HEGEMON",
    chooseFactionModalTitle: "CAMPAIGN MODE: SELECT YOUR FACTION",
    chooseFactionModalSub: "Choose your nation to lead global conquest across the World Cup map.",
    winnerBadge: "[WINNER]",
    realScore: "Real:",
    annexed: "annexed",
    sectors: "Sectors",
    latest: "LATEST",
    noSectorsYet: "NO SECTORS CONQUERED YET",
    groupStageDesc: "Group Stage: 0 Annexation",
    knockoutStageDesc: "Knockout Stage: Single Elimination Annexation"
  },
  zh: {
    siteTitle: "世界杯地图 //",
    langBtn: "语言: 中文",
    themeDark: "主题: 暗黑",
    themeLight: "主题: 明亮",
    sfxOn: "音效: 开启",
    sfxOff: "音效: 关闭",
    editionLabel: "届份:",
    shareBtn: "分享推演",
    resetOverridesBtn: "重置",
    tabMap: "地图视角",
    tabLeaderboard: "领土榜",
    tabLogs: "战报流",
    leaderboardTitle: "战功排行榜",
    activeFactionsCount: (n) => `${n} 支活跃球队`,
    selectFactionTitle: "选择征服阵营",
    selectFactionDesc: "选择你的国家，带领军队征服全球",
    heroBannerCommander: "阵营指挥官:",
    liveFeedTitle: "比赛实时征服战报",
    clashCardDefaultStage: "焦点战术决战",
    factionHud: "阵营控制台",
    factionChange: "切换阵营",
    sectorsHeld: "占领版图:",
    mapLegendTitle: "战术地图图例",
    legendAnnexed: "占领领土",
    legendActiveClash: "焦点对决",
    legendHq: "阵营大本营",
    play: "推演",
    pause: "暂停",
    kickoff: "开幕战",
    final: "决赛",
    statusSimulating: "状态: 推演中",
    statusParallel: (count) => `状态: 平行宇宙 (${count}项篡改)`,
    resetOverrides: "重置篡改",
    independentState: "独立主权国",
    expandingKingdom: "扩张强权",
    regionalPower: "区域强权",
    continentalEmpire: "洲际帝国",
    globalHegemon: "全球霸主",
    chooseFactionModalTitle: "征服模式：选择你的阵营",
    chooseFactionModalSub: "选择一个国家领地开启全球征服演练。",
    winnerBadge: "[胜者]",
    realScore: "实际比分:",
    annexed: "占领领土",
    sectors: "版图",
    latest: "最新",
    noSectorsYet: "暂无领土斩获",
    groupStageDesc: "小组赛阶段：积分为主",
    knockoutStageDesc: "淘汰赛阶段：单败淘汰领土吞并"
  }
};

let currentLang = localStorage.getItem("appLang") || "en";

function getTeamName(code, defaultName) {
  if (currentLang === "zh" && TEAM_NAMES_ZH[code]) {
    return TEAM_NAMES_ZH[code];
  }
  return defaultName || code;
}

function getCapitalName(code, defaultCity) {
  if (currentLang === "zh" && CAPITAL_NAMES_ZH[code]) {
    return CAPITAL_NAMES_ZH[code];
  }
  if (typeof teamCapitals !== "undefined" && teamCapitals[code] && teamCapitals[code].city) {
    return teamCapitals[code].city;
  }
  return defaultCity || getTeamName(code);
}

function getStageName(stage) {
  if (currentLang === "zh" && STAGE_NAMES_ZH[stage]) {
    return STAGE_NAMES_ZH[stage];
  }
  return stage || "";
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
  updateEl("site-header-title", t.siteTitle);
  updateEl("edition-label", t.editionLabel);

  const themeLabel = document.getElementById("theme-label");
  if (themeLabel) {
    const isLight = document.body.classList.contains("light-theme");
    themeLabel.innerText = isLight ? t.themeLight : t.themeDark;
  }

  if (typeof updateAudioUI === "function") {
    updateAudioUI();
  }

  const shareText = document.getElementById("share-btn-text");
  if (shareText) shareText.innerText = t.shareBtn;

  const btnResetOverrides = document.getElementById("btn-reset-overrides");
  if (btnResetOverrides) {
    btnResetOverrides.innerHTML = `<i class="ph-bold ph-arrow-counter-clockwise text-xs"></i><span>${t.resetOverrides}</span>`;
  }

  updateEl("tab-map", t.tabMap);
  updateEl("tab-leaderboard", t.tabLeaderboard);
  updateEl("tab-logs", t.tabLogs);

  updateEl("leaderboard-title", t.leaderboardTitle);
  updateEl("logs-header-title", t.liveFeedTitle);

  updateEl("sectors-held-label", t.sectorsHeld);
  updateEl("map-legend-title", t.mapLegendTitle);
  updateEl("legend-item-annexed", t.legendAnnexed);
  updateEl("legend-item-clash", t.legendActiveClash);
  updateEl("legend-item-hq", t.legendHq);

  updateEl("timeline-start", t.kickoff);
  updateEl("timeline-end", t.final);

  updateEl("modal-faction-title", t.chooseFactionModalTitle);
  updateEl("modal-faction-sub", t.chooseFactionModalSub);
}
