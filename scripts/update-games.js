// scripts/update-games.js
// Busca jogos do dia via TheSportsDB usando ID das ligas
const { createClient } = require("@supabase/supabase-js");
const https = require("https");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// IDs corretos do TheSportsDB (verificados)
const LIGAS = [
  { id:"4351", nomeExib:"Brasileirão Série A", emoji:"🇧🇷", color:"#009c3b", leagueId:"brasileirao" },
  { id:"4352", nomeExib:"Brasileirão Série B", emoji:"🇧🇷", color:"#3aaa5c", leagueId:"brasileirao_b" },
  { id:"4420", nomeExib:"Copa Libertadores",   emoji:"🌎",  color:"#f5a623", leagueId:"libertadores" },
  { id:"4419", nomeExib:"Sul-Americana",        emoji:"🌎",  color:"#e65c00", leagueId:"sulamericana" },
  { id:"4346", nomeExib:"Copa do Brasil",       emoji:"🏆",  color:"#009c3b", leagueId:"copa_brasil"  },
  { id:"4480", nomeExib:"Champions League",     emoji:"🏆",  color:"#1a56db", leagueId:"cl"           },
  { id:"4481", nomeExib:"Europa League",        emoji:"🟠",  color:"#f97316", leagueId:"el"           },
  { id:"4335", nomeExib:"Premier League",       emoji:"⚽",  color:"#3d0060", leagueId:"premierleague"},
  { id:"4332", nomeExib:"La Liga",              emoji:"🇪🇸", color:"#e8002d", leagueId:"laliga"       },
  { id:"4331", nomeExib:"Serie A",              emoji:"🇮🇹", color:"#0066cc", leagueId:"seriea"       },
  { id:"4337", nomeExib:"Bundesliga",           emoji:"🇩🇪", color:"#d00000", leagueId:"bundesliga"   },
  { id:"4334", nomeExib:"Ligue 1",              emoji:"🇫🇷", color:"#001489", leagueId:"ligue1"       },
  { id:"4344", nomeExib:"Primeira Liga",        emoji:"🇵🇹", color:"#006600", leagueId:"primeiraliga" },
  { id:"4387", nomeExib:"NBA",                  emoji:"🏀",  color:"#e65c00", leagueId:"nba"          },
  { id:"4391", nomeExib:"NFL",                  emoji:"🏈",  color:"#00338d", leagueId:"nfl"          },
];

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
      res.on("data", c => body += c);
      res.on("end", () => { try { resolve(JSON.parse(body)); } catch(e) { resolve(null); } });
    }).on("error", reject).on("timeout", () => reject(new Error("Timeout")));
  });
}

function converterHorario(timeStr, dateStr) {
  if (!timeStr || timeStr === "00:00:00") return "--";
  try {
    const [h, m] = timeStr.split(":").map(Number);
    // Converter UTC para Brasilia (UTC-3)
    const totalMin = h * 60 + m - 180;
    const hBR = Math.floor(((totalMin % 1440) + 1440) % 1440 / 60);
    const mBR = ((totalMin % 60) + 60) % 60;
    return `${String(hBR).padStart(2,"0")}h${String(mBR).padStart(2,"0")}`;
  } catch(e) {
    return timeStr;
  }
}

function getStatus(event) {
  const s = (event.strStatus || "").toLowerCase();
  const progress = (event.strProgress || "").toLowerCase();
  if (s.includes("finished") || s === "ft" || s === "aet" || s === "pen") return "finished";
  if (s.includes("progress") || s === "1h" || s === "2h" || s === "ht" || progress !== "") return "live";
  return "scheduled";
}

async function buscarJogosPorID(liga) {
  const hoje = new Date().toISOString().split("T")[0];
  // Busca por ID da liga
  const url = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${hoje}&s=Soccer&l=${liga.id}`;

  try {
    const data = await httpGet(url);
    if (!data) return [];

    const events = data.events || data.results || [];
    if (events.length === 0) return [];

    return events.map(e => ({
      league:       liga.nomeExib,
      league_id:    liga.leagueId,
      league_emoji: liga.emoji,
      league_color: liga.color,
      home:         e.strHomeTeam || "Casa",
      away:         e.strAwayTeam || "Visitante",
      time:         converterHorario(e.strTime, e.dateEvent),
      status:       getStatus(e),
      score_home:   e.intHomeScore !== null && e.intHomeScore !== "" ? parseInt(e.intHomeScore) : null,
      score_away:   e.intAwayScore !== null && e.intAwayScore !== "" ? parseInt(e.intAwayScore) : null,
      prob_home:    null,
      prob_draw:    null,
      prob_away:    null,
      data_jogo:    hoje,
      extra:        e.strVenue || e.strLeague || null,
    }));
  } catch(e) {
    return [];
  }
}

async function buscarJogosPorSport(liga, sport) {
  const hoje = new Date().toISOString().split("T")[0];
  const url = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${hoje}&s=${encodeURIComponent(sport)}`;

  try {
    const data = await httpGet(url);
    if (!data) return [];
    const events = (data.events || []).filter(e =>
      e.strLeague && e.strLeague.toLowerCase().includes(liga.nomeExib.toLowerCase().split(" ")[0])
    );
    return events.map(e => ({
      league:       liga.nomeExib,
      league_id:    liga.leagueId,
      league_emoji: liga.emoji,
      league_color: liga.color,
      home:         e.strHomeTeam || "Casa",
      away:         e.strAwayTeam || "Visitante",
      time:         converterHorario(e.strTime, e.dateEvent),
      status:       getStatus(e),
      score_home:   e.intHomeScore !== null ? parseInt(e.intHomeScore) : null,
      score_away:   e.intAwayScore !== null ? parseInt(e.intAwayScore) : null,
      prob_home:    null, prob_draw: null, prob_away: null,
      data_jogo:    hoje,
      extra:        e.strVenue || null,
    }));
  } catch(e) {
    return [];
  }
}

async function main() {
  console.log("=== Radar da Bola - Update Jogos ===");
  const hoje = new Date().toISOString().split("T")[0];
  console.log("Data:", hoje);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("ERRO: Variaveis Supabase faltando!");
    process.exit(1);
  }

  // Limpar jogos de hoje
  await supabase.from("jogos").delete().eq("data_jogo", hoje);
  console.log("Jogos limpos, buscando novos...\n");

  // Buscar todos os jogos de futebol do dia de uma vez
  console.log("Buscando TODOS os jogos de Soccer do dia...");
  const todosUrl = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${hoje}&s=Soccer`;
  let totalJogos = 0;

  try {
    const data = await httpGet(todosUrl);
    const eventos = data?.events || [];
    console.log(`Total de jogos de Soccer hoje: ${eventos.length}`);

    // Agrupar por liga
    const porLiga = {};
    for (const e of eventos) {
      const ligaKey = e.strLeague || "Outros";
      if (!porLiga[ligaKey]) porLiga[ligaKey] = [];
      porLiga[ligaKey].push(e);
    }

    // Mapear para nossas ligas conhecidas
    const mapeamento = {
      "Brazilian Serie A":        LIGAS.find(l=>l.leagueId==="brasileirao"),
      "Brazilian Serie B":        LIGAS.find(l=>l.leagueId==="brasileirao_b"),
      "Copa Libertadores":        LIGAS.find(l=>l.leagueId==="libertadores"),
      "Copa Sudamericana":        LIGAS.find(l=>l.leagueId==="sulamericana"),
      "Copa Do Brasil":           LIGAS.find(l=>l.leagueId==="copa_brasil"),
      "UEFA Champions League":    LIGAS.find(l=>l.leagueId==="cl"),
      "UEFA Europa League":       LIGAS.find(l=>l.leagueId==="el"),
      "English Premier League":   LIGAS.find(l=>l.leagueId==="premierleague"),
      "Spanish La Liga":          LIGAS.find(l=>l.leagueId==="laliga"),
      "Italian Serie A":          LIGAS.find(l=>l.leagueId==="seriea"),
      "German Bundesliga":        LIGAS.find(l=>l.leagueId==="bundesliga"),
      "French Ligue 1":           LIGAS.find(l=>l.leagueId==="ligue1"),
      "Portuguese Primeira Liga": LIGAS.find(l=>l.leagueId==="primeiraliga"),
    };

    const jogosParaSalvar = [];

    for (const [ligaNome, eventos] of Object.entries(porLiga)) {
      const ligaConfig = mapeamento[ligaNome];
      if (!ligaConfig) {
        // Liga nao mapeada — ainda salva com config padrao
        console.log(`  Liga nao mapeada: ${ligaNome} (${eventos.length} jogos)`);
        for (const e of eventos) {
          jogosParaSalvar.push({
            league: ligaNome, league_id: "outros",
            league_emoji: "⚽", league_color: "#555",
            home: e.strHomeTeam, away: e.strAwayTeam,
            time: converterHorario(e.strTime, e.dateEvent),
            status: getStatus(e),
            score_home: e.intHomeScore !== null ? parseInt(e.intHomeScore) : null,
            score_away: e.intAwayScore !== null ? parseInt(e.intAwayScore) : null,
            prob_home: null, prob_draw: null, prob_away: null,
            data_jogo: hoje, extra: e.strVenue || null,
          });
        }
        continue;
      }

      console.log(`  ${ligaConfig.emoji} ${ligaConfig.nomeExib}: ${eventos.length} jogos`);
      for (const e of eventos) {
        jogosParaSalvar.push({
          league: ligaConfig.nomeExib, league_id: ligaConfig.leagueId,
          league_emoji: ligaConfig.emoji, league_color: ligaConfig.color,
          home: e.strHomeTeam, away: e.strAwayTeam,
          time: converterHorario(e.strTime, e.dateEvent),
          status: getStatus(e),
          score_home: e.intHomeScore !== null ? parseInt(e.intHomeScore) : null,
          score_away: e.intAwayScore !== null ? parseInt(e.intAwayScore) : null,
          prob_home: null, prob_draw: null, prob_away: null,
          data_jogo: hoje, extra: e.strVenue || null,
        });
      }
    }

    // Buscar NBA separadamente
    console.log("\nBuscando jogos de Basketball (NBA)...");
    const nbaUrl = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${hoje}&s=Basketball`;
    const nbaData = await httpGet(nbaUrl);
    const nbaEventos = (nbaData?.events || []).filter(e => e.strLeague && e.strLeague.includes("NBA"));
    console.log(`  🏀 NBA: ${nbaEventos.length} jogos`);
    const nbaLiga = LIGAS.find(l=>l.leagueId==="nba");
    for (const e of nbaEventos) {
      jogosParaSalvar.push({
        league: "NBA", league_id: "nba",
        league_emoji: "🏀", league_color: "#e65c00",
        home: e.strHomeTeam, away: e.strAwayTeam,
        time: converterHorario(e.strTime, e.dateEvent),
        status: getStatus(e),
        score_home: e.intHomeScore !== null ? parseInt(e.intHomeScore) : null,
        score_away: e.intAwayScore !== null ? parseInt(e.intAwayScore) : null,
        prob_home: null, prob_draw: null, prob_away: null,
        data_jogo: hoje, extra: e.strVenue || null,
      });
    }

    // Salvar tudo de uma vez
    if (jogosParaSalvar.length > 0) {
      const { error } = await supabase.from("jogos").insert(jogosParaSalvar);
      if (error) console.error("Erro ao salvar:", error.message);
      else {
        totalJogos = jogosParaSalvar.length;
        console.log(`\n✓ ${totalJogos} jogos salvos!`);
      }
    }

  } catch(e) {
    console.error("Erro:", e.message);
  }

  console.log(`\n=== Concluido! ${totalJogos} jogos para hoje ===`);
}

main();
