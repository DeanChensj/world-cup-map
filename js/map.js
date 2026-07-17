/**
 * Map Rendering Engine - D3.js SVG Map, Tooltips, Zoom & Flow Vector Arcs
 */
let worldData = null;
let centroids = {};

const alpha3To2 = {
  "CAN": "ca", "MEX": "mx", "USA": "us", "AUS": "au", "IRQ": "iq",
  "IRN": "ir", "JPN": "jp", "JOR": "jo", "KOR": "kr", "QAT": "qa",
  "SAU": "sa", "UZB": "uz", "DZA": "dz", "CPV": "cv", "COD": "cd",
  "CIV": "ci", "EGY": "eg", "GHA": "gh", "MAR": "ma", "SEN": "sn",
  "ZAF": "za", "TUN": "tn", "HTI": "ht", "PAN": "pa", "ARG": "ar",
  "BRA": "br", "COL": "co", "ECU": "ec", "PRY": "py", "URY": "uy",
  "NZL": "nz", "AUT": "at", "BEL": "be", "BIH": "ba", "HRV": "hr",
  "CZE": "cz", "ENG": "gb-eng", "FRA": "fr", "DEU": "de", "NLD": "nl",
  "NOR": "no", "PRT": "pt", "SCO": "gb-sct", "ESP": "es", "SWE": "se",
  "CHE": "ch", "TUR": "tr", "CUW": "cw"
};

function getFlagImg(code) {
  const code2 = alpha3To2[code];
  if (!code2) return `<span class="w-5 h-3.5 bg-console-border inline-block rounded-sm"></span>`;
  return `<img src="https://flagcdn.com/20x15/${code2}.png" class="w-5 h-3.5 object-cover rounded-sm border border-console-border/40 shadow-sm" alt="${code}" />`;
}

function formatDateString(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getWCCodeFromMap(name, id, code) {
  if (code) return code;
  const alpha3 = numericToAlpha3[id] || null;
  if (alpha3 === "GBR") {
    return "ENG";
  }
  return alpha3;
}

function getCountryColor(name, id, code) {
  const alpha3 = getWCCodeFromMap(name, id, code);
  const unmappedColor = isLightTheme ? "#d1d5db" : "#161a22";
  if (!alpha3) return unmappedColor;

  if (originalTeams.includes(alpha3)) {
    const owner = getCurrentOwner(alpha3);
    return teamMetadata[owner]?.color || "#2c3e50";
  }

  return unmappedColor;
}

function showTooltip(event, d) {
  const alpha3 = d.code || getWCCodeFromMap(d.properties ? d.properties.name : "", d.id);
  if (!alpha3 || !originalTeams.includes(alpha3)) {
    const countryName = (d.properties && d.properties.name) ? d.properties.name : (d.name || "Unmapped Zone");
    tooltip.style("display", "block")
      .html(`
        <div class="text-[9px] text-console-dimText uppercase tracking-wider">Unmapped Zone</div>
        <div class="font-bold font-sans mt-1 text-console-text">${countryName}</div>
      `);
    return;
  }

  const originalTeam = teamMetadata[alpha3].name;
  const lineageCodes = countryLineage[alpha3] || [alpha3];
  const currentOwnerCode = lineageCodes[lineageCodes.length - 1];
  const currentOwner = teamMetadata[currentOwnerCode].name;

  const lineageTrail = lineageCodes.map(code => teamMetadata[code]?.name || code).join(" ➔ ");

  let content = `
    <div class="text-[9px] text-console-dimText uppercase tracking-wider">Territory Details</div>
    <div class="flex items-center space-x-2 mt-1">
      ${getFlagImg(alpha3)}
      <span class="font-bold text-console-text font-sans text-sm">${originalTeam}</span>
    </div>
  `;
  
  if (alpha3 !== currentOwnerCode) {
    content += `
      <div class="flex items-center space-x-2 mt-2 pt-1.5 border-t border-console-border">
        ${getFlagImg(currentOwnerCode)}
        <span class="text-[11px] text-console-dimText">Occupied by:</span>
        <span class="text-[11px] text-console-accent font-bold font-sans">${currentOwner}</span>
      </div>
      <div class="mt-2 text-[9px] leading-relaxed text-console-dimText font-mono border-t border-console-border/50 pt-1.5">
        <div class="uppercase tracking-wider text-[8px] mb-0.5">Lineage Trace:</div>
        <span class="text-console-text">${lineageTrail}</span>
      </div>
    `;
  } else {
    const holdingsCount = originalTeams.filter(t => getCurrentOwner(t) === alpha3).length;
    content += `
      <div class="flex items-center space-x-2 mt-2 pt-1.5 border-t border-console-border">
        <span class="text-[11px] text-console-accent font-bold font-sans">Sovereign Capital</span>
        <span class="text-[9px] text-console-dimText">(${holdingsCount} Sectors)</span>
      </div>
    `;
  }

  tooltip.style("display", "block").html(content);

  if (currentOwnerCode && currentOwnerCode !== alpha3) {
    d3.select(`#country-${currentOwnerCode}`).classed("suzerain-highlight", true);
  }
}

function moveTooltip(event) {
  const [x, y] = d3.pointer(event, container.node());
  tooltip.style("left", (x + 15) + "px")
         .style("top", (y + 15) + "px");
}

function hideTooltip(event, d) {
  tooltip.style("display", "none");
  
  if (d) {
    const alpha3 = d.code || getWCCodeFromMap(d.properties ? d.properties.name : "", d.id);
    if (alpha3) {
      const owner = getCurrentOwner(alpha3);
      if (owner && owner !== alpha3) {
        d3.select(`#country-${owner}`).classed("suzerain-highlight", false);
      }
    }
  }
}

function highlightOwner(ownerCode) {
  d3.selectAll(".country")
    .transition()
    .duration(200)
    .style("opacity", d => {
      const alpha3 = d.code || getWCCodeFromMap(d.properties ? d.properties.name : "", d.id);
      if (!alpha3) return 0.05;
      const currentOwner = getCurrentOwner(alpha3);
      return currentOwner === ownerCode ? 1.0 : 0.12;
    });
}

function resetHighlight() {
  d3.selectAll(".country")
    .transition()
    .duration(200)
    .style("opacity", 1.0);
}

const numericToAlpha3 = {
  "004": "AFG", "008": "ALB", "012": "DZA", "024": "AGO", "032": "ARG",
  "036": "AUS", "040": "AUT", "050": "BGD", "056": "BEL", "076": "BRA",
  "100": "BGR", "116": "KHM", "120": "CMR", "124": "CAN", "148": "TCD",
  "152": "CHL", "156": "CHN", "170": "COL", "180": "COD", "191": "HRV",
  "192": "CUB", "203": "CZE", "208": "DNK", "214": "DOM", "218": "ECU",
  "222": "SLV", "231": "ETH", "246": "FIN", "250": "FRA", "276": "DEU",
  "288": "GHA", "300": "GRC", "320": "GTM", "324": "GIN", "328": "GUY",
  "332": "HTI", "340": "HND", "348": "HUN", "352": "ISL", "356": "IND",
  "360": "IDN", "364": "IRN", "368": "IRQ", "372": "IRL", "376": "ISR",
  "380": "ITA", "384": "CIV", "388": "JAM", "392": "JPN", "400": "JOR",
  "404": "KEN", "410": "KOR", "414": "KWT", "417": "KGZ", "418": "LAO",
  "422": "LBN", "426": "LSO", "428": "LVA", "430": "LBR", "434": "LBY",
  "440": "LTU", "442": "LUX", "450": "MDG", "454": "MWI", "458": "MYS",
  "484": "MEX", "496": "MNG", "498": "MDA", "504": "MAR", "508": "MOZ",
  "524": "NPL", "528": "NLD", "554": "NZL", "558": "NIC", "562": "NER",
  "566": "NGA", "578": "NOR", "586": "PAK", "591": "PAN", "600": "PRY",
  "604": "PER", "608": "PHL", "616": "POL", "620": "PRT", "634": "QAT",
  "642": "ROU", "643": "RUS", "646": "RWA", "682": "SAU", "686": "SEN",
  "702": "SGP", "703": "SVK", "704": "VNM", "705": "SVN", "710": "ZAF",
  "724": "ESP", "736": "SDN", "752": "SWE", "756": "CHE", "762": "TJK",
  "764": "THA", "788": "TUN", "792": "TUR", "800": "UGA", "804": "UKR",
  "807": "MKD", "818": "EGY", "826": "GBR", "840": "USA", "858": "URY",
  "860": "UZB", "862": "VEN", "887": "YEM", "894": "ZMB", "716": "ZWE",
  "531": "CUW", "688": "SRB", "132": "CPV"
};
