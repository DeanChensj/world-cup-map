// --- UK Home Nations GeoJSON Polygon Features ---
const ukHomeNationsFeatures = [
  {
    type: "Feature",
    id: "826_ENG",
    code: "ENG",
    properties: { name: "England" },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-2.9466, 53.9847], [-3.6162, 54.6008], [-3.6306, 54.6144], [-4.8438, 54.7904],
        [-1.1142, 54.6245], [-0.4302, 54.4637], [0.1854, 53.3246], [0.4698, 52.9303],
        [1.683, 52.739], [1.5606, 52.0992], [1.0494, 51.8064], [1.449, 51.2902],
        [0.549, 50.7655], [-0.7866, 50.7756], [-2.4894, 50.4998], [-2.9574, 50.6961],
        [-3.6162, 50.2289], [-4.5414, 50.3423], [-5.2435, 49.9598], [-5.7763, 50.1596],
        [-4.311, 51.2106], [-2.9466, 53.9847]
      ]]
    }
  },
  {
    type: "Feature",
    id: "826_SCO",
    code: "SCO",
    properties: { name: "Scotland" },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-5.0526, 55.087], [-5.5002, 55.4326], [-5.6604, 55.4293], [-4.9662, 55.8458],
        [-5.5848, 55.9388], [-5.5866, 56.4001], [-6.1542, 56.7797], [-5.7834, 57.0094],
        [-5.7366, 57.7288], [-4.7898, 58.5303], [-3.0582, 58.635], [-3.069, 57.652],
        [-1.947, 57.4807], [-2.601, 56.337], [-3.2202, 55.9867], [-1.9746, 55.8087],
        [-3.0114, 55.0022], [-5.0526, 55.087]
      ]]
    }
  },
  {
    type: "Feature",
    id: "826_WAL",
    code: "WAL",
    properties: { name: "Wales" },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-3.0546, 51.5835], [-3.5352, 51.4285], [-4.9968, 51.6833], [-5.319, 51.8906],
        [-4.7646, 52.8126], [-4.7358, 53.4831], [-3.3948, 53.3323], [-3.033, 53.2285],
        [-2.7306, 51.9897], [-2.6568, 51.5912], [-3.0546, 51.5835]
      ]]
    }
  }
];

// --- ISO 3166-1 Numeric to Alpha-3 Conversion Map ---
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
  "404": "KEN", "408": "PRK", "410": "KOR", "414": "KWT", "417": "KGZ", "418": "LAO",
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
  "860": "UZB", "862": "VEN", "887": "YEM", "894": "ZMB", "716": "ZWE", "531": "CUW", "688": "SRB", "132": "CPV", "254": "GUF", "188": "CRI", "768": "TGO", "780": "TTO"
};

// --- World Cup 2026 Team Capitals Coordinates Database ---
const teamCapitals = {
  "CAN": { "city": "Ottawa", "coords": [-75.6950, 45.4215] },
  "MEX": { "city": "Mexico City", "coords": [-99.1332, 19.4326] },
  "USA": { "city": "Washington, D.C.", "coords": [-77.0369, 38.9072] },
  "AUS": { "city": "Canberra", "coords": [149.1300, -35.2809] },
  "IRQ": { "city": "Baghdad", "coords": [44.3661, 33.3152] },
  "IRN": { "city": "Tehran", "coords": [51.3890, 35.6892] },
  "JPN": { "city": "Tokyo", "coords": [139.6917, 35.6895] },
  "JOR": { "city": "Amman", "coords": [35.9284, 31.9454] },
  "PRK": { "city": "Pyongyang", "coords": [125.7625, 39.0392] },
  "KOR": { "city": "Seoul", "coords": [126.9780, 37.5665] },
  "QAT": { "city": "Doha", "coords": [51.5310, 25.2854] },
  "SAU": { "city": "Riyadh", "coords": [46.7167, 24.7136] },
  "UZB": { "city": "Tashkent", "coords": [69.2401, 41.2995] },
  "DZA": { "city": "Algiers", "coords": [3.0588, 36.7538] },
  "CPV": { "city": "Praia", "coords": [-23.5133, 14.9315] },
  "COD": { "city": "Kinshasa", "coords": [15.3222, -4.4419] },
  "CIV": { "city": "Yamoussoukro", "coords": [-5.2767, 6.8276] },
  "EGY": { "city": "Cairo", "coords": [31.2357, 30.0444] },
  "GHA": { "city": "Accra", "coords": [-0.1870, 5.6037] },
  "MAR": { "city": "Rabat", "coords": [-6.8498, 34.0209] },
  "SEN": { "city": "Dakar", "coords": [-17.4677, 14.7167] },
  "ZAF": { "city": "Pretoria", "coords": [28.1881, -25.7479] },
  "TUN": { "city": "Tunis", "coords": [10.1815, 36.8065] },
  "HTI": { "city": "Port-au-Prince", "coords": [-72.3388, 18.5944] },
  "PAN": { "city": "Panama City", "coords": [-79.5197, 8.9824] },
  "ARG": { "city": "Buenos Aires", "coords": [-58.3816, -34.6037] },
  "BRA": { "city": "Brasília", "coords": [-47.9292, -15.7801] },
  "COL": { "city": "Bogotá", "coords": [-74.0721, 4.7110] },
  "ECU": { "city": "Quito", "coords": [-78.4678, -0.1807] },
  "PRY": { "city": "Asunción", "coords": [-57.5759, -25.2637] },
  "URY": { "city": "Montevideo", "coords": [-56.1645, -34.9011] },
  "NZL": { "city": "Wellington", "coords": [174.7762, -41.2865] },
  "AUT": { "city": "Vienna", "coords": [16.3738, 48.2082] },
  "BEL": { "city": "Brussels", "coords": [4.3517, 50.8503] },
  "BIH": { "city": "Sarajevo", "coords": [18.4131, 43.8563] },
  "HRV": { "city": "Zagreb", "coords": [15.9819, 45.8150] },
  "CZE": { "city": "Prague", "coords": [14.4378, 50.0755] },
  "ENG": { "city": "London", "coords": [-0.1276, 51.5074] },
  "FRA": { "city": "Paris", "coords": [2.3522, 48.8566] },
  "DEU": { "city": "Berlin", "coords": [13.4050, 52.5200] },
  "NLD": { "city": "Amsterdam", "coords": [4.9041, 52.3676] },
  "NOR": { "city": "Oslo", "coords": [10.7522, 59.9139] },
  "PRT": { "city": "Lisbon", "coords": [-9.1393, 38.7223] },
  "SCO": { "city": "Edinburgh", "coords": [-3.1883, 55.9533] },
  "WAL": { "city": "Cardiff", "coords": [-3.1791, 51.4816] },
  "NIR": { "city": "Belfast", "coords": [-5.9301, 54.5973] },
  "ESP": { "city": "Madrid", "coords": [-3.7038, 40.4168] },
  "SWE": { "city": "Stockholm", "coords": [18.0686, 59.3293] },
  "CHE": { "city": "Bern", "coords": [7.4474, 46.9480] },
  "TUR": { "city": "Ankara", "coords": [32.8597, 39.9334] },
  "CUW": { "city": "Willemstad", "coords": [-68.9335, 12.1084] },
  "CHN": { "city": "Beijing", "coords": [116.4074, 39.9042] },
  "ITA": { "city": "Rome", "coords": [12.4964, 41.9028] },
  "RUS": { "city": "Moscow", "coords": [37.6173, 55.7558] },
  "CHL": { "city": "Santiago", "coords": [-70.6693, -33.4489] },
  "PER": { "city": "Lima", "coords": [-77.0428, -12.0464] },
  "IRL": { "city": "Dublin", "coords": [-6.2603, 53.3498] },
  "FIN": { "city": "Helsinki", "coords": [24.9384, 60.1699] },
  "GRC": { "city": "Athens", "coords": [23.7275, 37.9838] },
  "POL": { "city": "Warsaw", "coords": [21.0122, 52.2297] },
  "SVK": { "city": "Bratislava", "coords": [17.1077, 48.1486] },
  "SVN": { "city": "Ljubljana", "coords": [14.5058, 46.0569] },
  "SRB": { "city": "Belgrade", "coords": [20.4489, 44.7866] },
  "UKR": { "city": "Kyiv", "coords": [30.5234, 50.4501] },
  "NGA": { "city": "Abuja", "coords": [7.4951, 9.0579] },
  "CMR": { "city": "Yaoundé", "coords": [11.5021, 3.8480] },
  "AGO": { "city": "Luanda", "coords": [13.2343, -8.8390] },
  "BGR": { "city": "Sofia", "coords": [23.3219, 42.6977] },
  "CRI": { "city": "San José", "coords": [-84.0833, 9.9281] },
  "DNK": { "city": "Copenhagen", "coords": [12.5683, 55.6761] },
  "HND": { "city": "Tegucigalpa", "coords": [-87.2068, 14.0818] },
  "ISL": { "city": "Reykjavik", "coords": [-21.8954, 64.1355] },
  "JAM": { "city": "Kingston", "coords": [-76.7920, 17.9716] },
  "ROU": { "city": "Bucharest", "coords": [26.1025, 44.4268] },
  "TGO": { "city": "Lomé", "coords": [1.2125, 6.1375] },
  "TTO": { "city": "Port of Spain", "coords": [-61.5180, 10.6660] }
};
