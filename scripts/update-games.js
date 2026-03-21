// scripts/update-games.js
const { createClient } = require("@supabase/supabase-js");
const https = require("https");

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_KEY     = process.env.SUPABASE_SERVICE_KEY;
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Datas — sempre em UTC para consistência
function getDataBrasilia(offsetDias) {
  // Usa UTC-3 para calcular a data correta no Brasil
  var d = new Date();
  d.setUTCHours(d.getUTCHours() - 3); // ajusta para Brasilia
  if (offsetDias) d.setDate(d.getDate() + offsetDias);
  return d.toISOString().split("T")[0];
}

const HOJE  = getDataBrasilia(0);
const AMANHA = getDataBrasilia(1);

// Ligas da football-data.org
const LIGAS = [
  { code:"PL",  nomeExib:"Premier League",     emoji:"⚽",  color:"#3d0060", leagueId:"premierleague" },
  { code:"PD",  nomeExib:"La Liga",            emoji:"🇪🇸", color:"#e8002d", leagueId:"laliga"        },
  { code:"SA",  nomeExib:"Serie A",            emoji:"🇮🇹", color:"#0066cc", leagueId:"seriea"        },
  { code:"BL1", nomeExib:"Bundesliga",         emoji:"🇩🇪", color:"#d00000", leagueId:"bundesliga"    },
  { code:"FL1", nomeExib:"Ligue 1",            emoji:"🇫🇷", color:"#001489", leagueId:"ligue1"        },
  { code:"PPL", nomeExib:"Primeira Liga",      emoji:"🇵🇹", color:"#006600", leagueId:"primeiraliga"  },
  { code:"CL",  nomeExib:"Champions League",   emoji:"🏆",  color:"#1a56db", leagueId:"cl"            },
  { code:"EL",  nomeExib:"Europa League",      emoji:"🟠",  color:"#f97316", leagueId:"el"            },
  { code:"BSA", nomeExib:"Brasileirão Série A",emoji:"🇧🇷", color:"#009c3b", leagueId:"brasileirao"   },
  { code:"CLI", nomeExib:"Copa Libertadores",  emoji:"🌎",  color:"#f5a623", leagueId:"libertadores"  },
];

function httpGet(url, headers) {
  headers = headers || {};
  return new Promise(function(resolve, reject) {
    https.get(url, {
      headers: Object.assign({ "User-Agent": "RadarDaBola/1.0" }, headers),
      timeout: 15000,
    }, function(res) {
      var body = "";
      res.on("data", function(c) { body += c; });
      res.on("end", function() {
        try { resolve(JSON.parse(body)); } catch(e) { resolve(null); }
      });
    }).on("error", reject).on("timeout", function() { reject(new Error("Timeout")); });
  });
}

function converterHorario(utcStr) {
  if (!utcStr) return "--";
  try {
    var d = new Date(utcStr);
    var h = ((d.getUTCHours() - 3) + 24) % 24;
    var m = d.getUTCMinutes();
    return String(h).padStart(2,"0") + "h" + String(m).padStart(2,"0");
  } catch(e) { return "--"; }
}

function getStatus(match) {
  var s = match.status || "";
  if (["FINISHED","FT","AWARDED"].includes(s)) return "finished";
  if (["IN_PLAY","PAUSED","HALFTIME","LIVE","FIRST_HALF","SECOND_HALF"].includes(s)) return "live";
  return "scheduled";
}

async function buscarLiga(liga, dataStr) {
  var url = "https://api.football-data.org/v4/competitions/" + liga.code + "/matches?dateFrom=" + dataStr + "&dateTo=" + dataStr;
  try {
    var data = await httpGet(url, { "X-Auth-Token": FOOTBALL_API_KEY });
    if (!data || !data.matches || data.matches.length === 0) return [];
    console.log("  " + liga.emoji + " " + liga.nomeExib + " (" + dataStr + "): " + data.matches.length + " jogos");
    return data.matches.map(function(m) {
      return {
        league:       liga.nomeExib,
        league_id:    liga.leagueId,
        league_emoji: liga.emoji,
        league_color: liga.color,
        home:         m.homeTeam && m.homeTeam.shortName || "Casa",
        away:         m.awayTeam && m.awayTeam.shortName || "Visitante",
        home_logo:    m.homeTeam && m.homeTeam.crest || null,
        away_logo:    m.awayTeam && m.awayTeam.crest || null,
        time:         converterHorario(m.utcDate),
        status:       getStatus(m),
        score_home:   m.score && m.score.fullTime && m.score.fullTime.home !== null ? m.score.fullTime.home : null,
        score_away:   m.score && m.score.fullTime && m.score.fullTime.away !== null ? m.score.fullTime.away : null,
        prob_home:    null,
        prob_draw:    null,
        prob_away:    null,
        data_jogo:    dataStr,
        extra:        m.stage || m.group || null,
      };
    });
  } catch(e) {
    console.log("  Erro " + liga.code + ": " + e.message);
    return [];
  }
}

async function main() {
  console.log("=== Radar da Bola - Update Jogos ===");
  console.log("Hoje (Brasilia):", HOJE);
  console.log("Amanha (Brasilia):", AMANHA);

  if (!SUPABASE_URL || !SUPABASE_KEY || !FOOTBALL_API_KEY) {
    console.error("Variaveis de ambiente faltando!");
    process.exit(1);
  }

  // Limpar jogos de hoje e amanha
  await supabase.from("jogos").delete().eq("data_jogo", HOJE);
  await supabase.from("jogos").delete().eq("data_jogo", AMANHA);
  console.log("Jogos limpos. Buscando...\n");

  var todosJogos = [];

  // Buscar HOJE
  console.log("=== JOGOS DE HOJE (" + HOJE + ") ===");
  for (var i = 0; i < LIGAS.length; i++) {
    var jogos = await buscarLiga(LIGAS[i], HOJE);
    todosJogos = todosJogos.concat(jogos);
    await new Promise(function(r) { setTimeout(r, 7000); });
  }

  // Buscar AMANHA
  console.log("\n=== JOGOS DE AMANHA (" + AMANHA + ") ===");
  for (var j = 0; j < LIGAS.length; j++) {
    var jogosA = await buscarLiga(LIGAS[j], AMANHA);
    todosJogos = todosJogos.concat(jogosA);
    await new Promise(function(r) { setTimeout(r, 7000); });
  }

  // Salvar tudo
  if (todosJogos.length > 0) {
    var { error } = await supabase.from("jogos").insert(todosJogos);
    if (error) console.error("Erro ao salvar:", error.message);
    else console.log("\n Total: " + todosJogos.length + " jogos salvos!");
  } else {
    console.log("\nNenhum jogo encontrado.");
  }

  console.log("=== Concluido! ===");
}

main();
