// scripts/update-games.js
// Busca jogos via football-data.org (gratuito, dados reais)
const { createClient } = require("@supabase/supabase-js");
const https = require("https");

const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_KEY;
const FOOTBALL_API_KEY  = process.env.FOOTBALL_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Ligas disponíveis no plano gratuito da football-data.org
const LIGAS = [
  { code:"PL",  nomeExib:"Premier League",    emoji:"⚽",  color:"#3d0060", leagueId:"premierleague" },
  { code:"PD",  nomeExib:"La Liga",           emoji:"🇪🇸", color:"#e8002d", leagueId:"laliga"        },
  { code:"SA",  nomeExib:"Serie A",           emoji:"🇮🇹", color:"#0066cc", leagueId:"seriea"        },
  { code:"BL1", nomeExib:"Bundesliga",        emoji:"🇩🇪", color:"#d00000", leagueId:"bundesliga"    },
  { code:"FL1", nomeExib:"Ligue 1",           emoji:"🇫🇷", color:"#001489", leagueId:"ligue1"        },
  { code:"PPL", nomeExib:"Primeira Liga",     emoji:"🇵🇹", color:"#006600", leagueId:"primeiraliga"  },
  { code:"CL",  nomeExib:"Champions League",  emoji:"🏆",  color:"#1a56db", leagueId:"cl"            },
  { code:"EL",  nomeExib:"Europa League",     emoji:"🟠",  color:"#f97316", leagueId:"el"            },
  { code:"BSA", nomeExib:"Brasileirão Série A",emoji:"🇧🇷",color:"#009c3b", leagueId:"brasileirao"   },
  { code:"CLI", nomeExib:"Copa Libertadores", emoji:"🌎",  color:"#f5a623", leagueId:"libertadores"  },
];

function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { "User-Agent": "RadarDaBola/1.0", ...headers },
      timeout: 15000,
    }, (res) => {
      let body = "";
      res.on("data", c => body += c);
      res.on("end", () => { try { resolve(JSON.parse(body)); } catch(e) { resolve(null); } });
    }).on("error", reject).on("timeout", () => reject(new Error("Timeout")));
  });
}

function converterHorario(utcStr) {
  if (!utcStr) return "--";
  try {
    const d = new Date(utcStr);
    const hBR = d.getUTCHours() - 3;
    const h = ((hBR % 24) + 24) % 24;
    const m = d.getUTCMinutes();
    return `${String(h).padStart(2,"0")}h${String(m).padStart(2,"0")}`;
  } catch(e) { return "--"; }
}

function getStatus(match) {
  const s = match.status || "";
  if (["FINISHED","FT"].includes(s)) return "finished";
  if (["IN_PLAY","PAUSED","HALFTIME","LIVE"].includes(s)) return "live";
  return "scheduled";
}

async function buscarJogosLiga(liga) {
  const hoje = new Date().toISOString().split("T")[0];
  const url = `https://api.football-data.org/v4/competitions/${liga.code}/matches?dateFrom=${hoje}&dateTo=${hoje}`;

  try {
    const data = await httpGet(url, { "X-Auth-Token": FOOTBALL_API_KEY });
    if (!data || !data.matches) return [];

    return data.matches.map(m => ({
      league:       liga.nomeExib,
      league_id:    liga.leagueId,
      league_emoji: liga.emoji,
      league_color: liga.color,
      home:         m.homeTeam?.shortName || m.homeTeam?.name || "Casa",
      away:         m.awayTeam?.shortName || m.awayTeam?.name || "Visitante",
      time:         converterHorario(m.utcDate),
      status:       getStatus(m),
      score_home:   m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null,
      score_away:   m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null,
      prob_home:    null,
      prob_draw:    null,
      prob_away:    null,
      data_jogo:    hoje,
      extra:        m.stage || m.group || null,
    }));
  } catch(e) {
    console.log(`  Erro ${liga.code}: ${e.message}`);
    return [];
  }
}

// TheSportsDB como fallback para ligas nao cobertas (Libertadores, NBA)
async function buscarJogosTheSportsDB() {
  const hoje = new Date().toISOString().split("T")[0];
  const jogos = [];

  // Buscar NBA
  try {
    const url = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${hoje}&s=Basketball`;
    const data = await httpGet(url);
    const nba = (data?.events || []).filter(e => e.strLeague?.includes("NBA"));
    console.log(`  🏀 NBA: ${nba.length} jogos`);
    for (const e of nba) {
      jogos.push({
        league: "NBA", league_id: "nba",
        league_emoji: "🏀", league_color: "#e65c00",
        home: e.strHomeTeam, away: e.strAwayTeam,
        time: converterHorarioTheSports(e.strTime),
        status: getStatusTheSports(e),
        score_home: e.intHomeScore !== null && e.intHomeScore !== "" ? parseInt(e.intHomeScore) : null,
        score_away: e.intAwayScore !== null && e.intAwayScore !== "" ? parseInt(e.intAwayScore) : null,
        prob_home: null, prob_draw: null, prob_away: null,
        data_jogo: hoje, extra: e.strVenue || null,
      });
    }
  } catch(e) { console.log("  NBA erro:", e.message); }

  return jogos;
}

function converterHorarioTheSports(timeStr) {
  if (!timeStr || timeStr === "00:00:00") return "--";
  try {
    const [h, m] = timeStr.split(":").map(Number);
    const totalMin = h * 60 + m - 180;
    const hBR = Math.floor(((totalMin % 1440) + 1440) % 1440 / 60);
    const mBR = ((totalMin % 60) + 60) % 60;
    return `${String(hBR).padStart(2,"0")}h${String(mBR).padStart(2,"0")}`;
  } catch(e) { return "--"; }
}

function getStatusTheSports(e) {
  const s = (e.strStatus || "").toLowerCase();
  if (s.includes("finished") || s === "ft") return "finished";
  if (s.includes("progress") || s === "1h" || s === "2h") return "live";
  return "scheduled";
}

async function main() {
  console.log("=== Radar da Bola - Update Jogos ===");
  const hoje = new Date().toISOString().split("T")[0];
  console.log("Data:", hoje);

  if (!SUPABASE_URL || !SUPABASE_KEY) { console.error("Supabase vars faltando!"); process.exit(1); }
  if (!FOOTBALL_API_KEY) { console.error("FOOTBALL_API_KEY faltando!"); process.exit(1); }

  // Limpar jogos de hoje
  await supabase.from("jogos").delete().eq("data_jogo", hoje);
  console.log("Jogos limpos, buscando...\n");

  const todosJogos = [];

  // Buscar cada liga da football-data.org
  console.log("=== football-data.org ===");
  for (const liga of LIGAS) {
    console.log(`Buscando ${liga.emoji} ${liga.nomeExib}...`);
    const jogos = await buscarJogosLiga(liga);
    if (jogos.length > 0) {
      console.log(`  ✓ ${jogos.length} jogos`);
      jogos.forEach(j => console.log(`    ${j.home} x ${j.away} ${j.time}`));
      todosJogos.push(...jogos);
    } else {
      console.log(`  Nenhum jogo hoje`);
    }
    // Pausa para não estourar rate limit (10 req/min no plano free)
    await new Promise(r => setTimeout(r, 7000));
  }

  // Buscar NBA via TheSportsDB
  console.log("\n=== TheSportsDB (NBA) ===");
  const extras = await buscarJogosTheSportsDB();
  todosJogos.push(...extras);

  // Salvar tudo
  if (todosJogos.length > 0) {
    const { error } = await supabase.from("jogos").insert(todosJogos);
    if (error) console.error("Erro ao salvar:", error.message);
    else console.log(`\n✓ ${todosJogos.length} jogos salvos!`);
  } else {
    console.log("\nNenhum jogo encontrado para hoje.");
  }

  console.log("=== Concluido! ===");
}

main();
