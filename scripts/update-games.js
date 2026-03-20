// scripts/update-games.js
// Busca jogos do dia via TheSportsDB (gratuita, sem limite)
// Roda junto com o update-news.js via GitHub Actions

const { createClient } = require("@supabase/supabase-js");
const https = require("https");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── LIGAS MONITORADAS ─────────────────────────────────────────────────────────
// IDs da TheSportsDB
const LIGAS = [
  // FUTEBOL BRASIL
  { id:"4351", nome:"Brasileirão Série A", emoji:"🇧🇷", color:"#009c3b", leagueId:"brasileirao" },
  { id:"4352", nome:"Brasileirão Série B", emoji:"🇧🇷", color:"#3aaa5c", leagueId:"brasileirao_b" },
  { id:"4420", nome:"Copa Libertadores",   emoji:"🌎", color:"#f5a623", leagueId:"libertadores" },
  { id:"4419", nome:"Copa Sul-Americana",  emoji:"🌎", color:"#e65c00", leagueId:"sulamericana" },
  // FUTEBOL EUROPA
  { id:"4480", nome:"Champions League",    emoji:"🏆", color:"#1a56db", leagueId:"cl" },
  { id:"4481", nome:"Europa League",       emoji:"🟠", color:"#f97316", leagueId:"el" },
  { id:"4335", nome:"Premier League",      emoji:"⚽", color:"#3d0060", leagueId:"premierleague" },
  { id:"4332", nome:"La Liga",             emoji:"🇪🇸", color:"#e8002d", leagueId:"laliga" },
  { id:"4331", nome:"Serie A",             emoji:"🇮🇹", color:"#0066cc", leagueId:"seriea" },
  { id:"4337", nome:"Bundesliga",          emoji:"🇩🇪", color:"#d00000", leagueId:"bundesliga" },
  { id:"4334", nome:"Ligue 1",             emoji:"🇫🇷", color:"#001489", leagueId:"ligue1" },
  { id:"4438", nome:"Primeira Liga",       emoji:"🇵🇹", color:"#006600", leagueId:"primeiraliga" },
  // OUTROS ESPORTES
  { id:"4424", nome:"NBA",                 emoji:"🏀", color:"#e65c00", leagueId:"nba" },
  { id:"4391", nome:"NFL",                 emoji:"🏈", color:"#00338d", leagueId:"nfl" },
];

// ── HTTP GET ──────────────────────────────────────────────────────────────────
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { "User-Agent": "RadarDaBola/1.0" },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location).then(resolve).catch(reject);
      }
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { resolve(null); }
      });
    }).on("error", reject).on("timeout", () => reject(new Error("Timeout")));
  });
}

// ── BUSCAR JOGOS DO DIA ───────────────────────────────────────────────────────
async function buscarJogosDia(liga) {
  const hoje = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const url = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${hoje}&l=${encodeURIComponent(liga.nome)}`;
  
  try {
    const data = await httpGet(url);
    if (!data || !data.events) return [];
    
    return data.events.map(e => {
      // Converter horario UTC para Brasilia (UTC-3)
      let timeBrasilia = "--";
      if (e.strTime) {
        try {
          const [h, m] = e.strTime.split(":").map(Number);
          const totalMin = h * 60 + m - 180; // UTC-3
          const hBR = Math.floor(((totalMin % 1440) + 1440) % 1440 / 60);
          const mBR = ((totalMin % 60) + 60) % 60;
          timeBrasilia = `${String(hBR).padStart(2,"0")}h${String(mBR).padStart(2,"0")}`;
        } catch(e) {}
      }

      // Status
      let status = "scheduled";
      if (e.strStatus === "Match Finished" || e.strStatus === "FT") status = "finished";
      else if (e.strStatus === "In Progress" || e.strStatus === "1H" || e.strStatus === "2H" || e.strStatus === "HT") status = "live";

      return {
        league:       liga.nome,
        league_id:    liga.leagueId,
        league_emoji: liga.emoji,
        league_color: liga.color,
        home:         e.strHomeTeam || "Casa",
        away:         e.strAwayTeam || "Visitante",
        time:         timeBrasilia,
        status:       status,
        score_home:   e.intHomeScore !== null && e.intHomeScore !== "" ? parseInt(e.intHomeScore) : null,
        score_away:   e.intAwayScore !== null && e.intAwayScore !== "" ? parseInt(e.intAwayScore) : null,
        prob_home:    null,
        prob_draw:    null,
        prob_away:    null,
        data_jogo:    hoje,
        extra:        e.strVenue || null,
      };
    });
  } catch(e) {
    console.log(`  Erro em ${liga.nome}: ${e.message}`);
    return [];
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Radar da Bola - Update Jogos ===");
  const hoje = new Date().toISOString().split("T")[0];
  console.log("Data:", hoje);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("ERRO: Variaveis Supabase faltando!");
    process.exit(1);
  }

  // Apagar jogos de hoje para reinserir atualizados
  const { error: delErr } = await supabase
    .from("jogos")
    .delete()
    .eq("data_jogo", hoje);
  
  if (delErr) console.error("Erro ao limpar jogos:", delErr.message);
  else console.log("Jogos de hoje limpos, buscando novos...");

  let totalJogos = 0;

  for (const liga of LIGAS) {
    console.log(`\nBuscando: ${liga.emoji} ${liga.nome}...`);
    try {
      const jogos = await buscarJogosDia(liga);
      
      if (jogos.length === 0) {
        console.log("  Nenhum jogo hoje.");
        continue;
      }

      console.log(`  Encontrados: ${jogos.length} jogos`);

      // Inserir no Supabase
      const { error } = await supabase.from("jogos").insert(jogos);
      if (error) {
        console.error("  Erro ao inserir:", error.message);
      } else {
        console.log(`  ✓ ${jogos.length} jogos salvos`);
        jogos.forEach(j => console.log(`    ${j.home} x ${j.away} - ${j.time}`));
        totalJogos += jogos.length;
      }
    } catch(e) {
      console.error(`  Erro: ${e.message}`);
    }

    // Pausa entre requisicoes
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n=== Concluido! ${totalJogos} jogos salvos para hoje ===`);
}

main();
