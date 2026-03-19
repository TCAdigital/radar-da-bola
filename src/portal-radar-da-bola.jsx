/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import AdminApp from "./admin-radar-da-bola";

// ── PALETA ─────────────────────────────────────────────────────────────────
const BRAND = { red:"#e8002d", black:"#0d0d0d" };

const META = {
  futebol:  { color:"#009c3b", light:"#e8f5ee", label:"FUTEBOL",   emoji:"⚽" },
  formula1: { color:"#e10600", light:"#fdecea", label:"FÓRMULA 1", emoji:"🏎️" },
  tenis:    { color:"#c8860a", light:"#fdf6e3", label:"TÊNIS",     emoji:"🎾" },
  basquete: { color:"#e65c00", light:"#fef3ea", label:"BASQUETE",  emoji:"🏀" },
};

// ── NOTÍCIAS ────────────────────────────────────────────────────────────────
const NEWS = [
  { id:"f1", sport:"futebol",  minsAgo:40,  readTime:"4 min",
    title:"Palmeiras e Flamengo são campeões estaduais no maior fim de semana do futebol brasileiro",
    summary:"Palmeiras levou o Paulistão sobre o Novorizontino e Flamengo bateu o Fluminense nos pênaltis.",
    content:"O fim de semana de 8 de março ficará marcado no futebol brasileiro. Palmeiras e Flamengo foram dois dos 13 clubes que levantaram taças estaduais.\n\nO Verdão conquistou o Paulistão ao vencer o Novorizontino no Allianz Parque. Vitor Roque foi o grande nome da decisão com dois gols.\n\nNo Rio, a final do Carioca entre Fluminense e Flamengo foi até os pênaltis. O Mengão venceu com Leonardo Jardim no comando.",
    img:"https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&q=80" },
  { id:"f2", sport:"futebol",  minsAgo:95,  readTime:"3 min",
    title:"Leonardo Jardim estreia no Flamengo com título carioca nos pênaltis contra o Fluminense",
    summary:"Técnico português assumiu o Mengão e na primeira decisão já levantou a taça.",
    content:"Leonardo Jardim não poderia ter pedido estreia melhor no comando do Flamengo.\n\nA final no Maracanã terminou empatada no tempo normal. Nos pênaltis, o Flamengo foi mais eficiente.\n\nCom o estadual conquistado, o foco se volta para o Brasileirão e Copa Libertadores.",
    img:"https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=80" },
  { id:"f3", sport:"futebol",  minsAgo:180, readTime:"5 min",
    title:"Copa do Mundo 2026: Brasil inicia contagem regressiva para o torneio que volta às Américas",
    summary:"Ingressos esgotam em tempo recorde enquanto Seleção finaliza preparação.",
    content:"A contagem regressiva para a Copa do Mundo 2026 entra em fase decisiva.\n\nOs jogos da Seleção estão previstos para os EUA. A demanda por ingressos foi enorme — esgotados em horas.\n\nVinicius Jr., Rodrygo e Endrick são os destaques ofensivos da equipe de Carlo Ancelotti.",
    img:"https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=80" },
  { id:"r1", sport:"formula1", minsAgo:28,  readTime:"4 min",
    title:"Russell vence GP da Austrália e Mercedes domina abertura da nova era da F1 2026",
    summary:"Dobradinha da Mercedes em Melbourne. Antonelli foi segundo e Leclerc ficou com o terceiro.",
    content:"A Fórmula 1 iniciou sua nova era regulamentar em Melbourne com Mercedes dominando.\n\nGeorge Russell venceu de ponta a ponta. Kimi Antonelli completou a dobradinha em apenas sua segunda corrida.\n\nGabriel Bortoleto, estreando pela Audi, completou a corrida dentro da zona de pontos.",
    img:"https://images.unsplash.com/photo-1518364538800-6bae3c2ea0f2?w=900&q=80" },
  { id:"r2", sport:"formula1", minsAgo:120, readTime:"3 min",
    title:"Bortoleto estreia na F1 e celebra primeiro ponto na carreira: 'Mais do que esperava'",
    summary:"O brasileiro da Audi cruzou a linha dentro do top-10 em Melbourne.",
    content:"Gabriel Bortoleto completou o GP da Austrália com frieza e inteligência.\n\n'Marcar ponto na estreia é mais do que eu esperava', disse o piloto.",
    img:"https://images.unsplash.com/photo-1541348263662-e068662d82af?w=900&q=80" },
  { id:"t1", sport:"tenis",    minsAgo:15,  readTime:"3 min",
    title:"HOJE ÀS 22H: João Fonseca enfrenta Sinner pelas oitavas de final de Indian Wells",
    summary:"O prodígio carioca de 19 anos faz história ao chegar às oitavas pela primeira vez.",
    content:"João Fonseca chegou às oitavas de Indian Wells pela primeira vez na carreira.\n\nFonseca atropelou Tommy Paul por 6/2 e 6/3 em 82 minutos na rodada anterior.\n\nA partida começa às 22h de Brasília pela ESPN 2 e Disney+.",
    img:"https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&q=80" },
  { id:"t2", sport:"tenis",    minsAgo:72,  readTime:"3 min",
    title:"Fonseca atropela Tommy Paul com 6/2 e 6/3 e faz história em Indian Wells",
    summary:"Em 82 minutos dominantes, brasileiro se torna o 4º mais jovem em oitavas de Masters 1000.",
    content:"João Fonseca deixou Tommy Paul sem chances — 6/2 e 6/3.\n\nFonseca se torna o quarto tenista mais jovem a atingir as oitavas de um Masters 1000 na Era Aberta.",
    img:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=900&q=80" },
  { id:"b1", sport:"basquete", minsAgo:18,  readTime:"4 min",
    title:"SGA iguala Wilt Chamberlain com 126 jogos consecutivos acima de 20 pontos na NBA",
    summary:"Astro do Thunder empatou um dos recordes mais míticos do basquete com game-winner.",
    content:"Shai Gilgeous-Alexander igualou Wilt Chamberlain com 126 jogos consecutivos acima de 20 pontos.\n\nSGA fechou o jogo com um game-winner nos instantes finais. 'Quero ganhar. O recorde é só um reflexo disso.'",
    img:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80" },
  { id:"b2", sport:"basquete", minsAgo:90,  readTime:"3 min",
    title:"Thunder é o primeiro time a 50 vitórias na NBA 2025/26 e consolida favoritismo ao título",
    summary:"Com campanha de 50-15, Oklahoma City manda recado: o caminho para o título passa por aqui.",
    content:"O Oklahoma City Thunder se tornou o primeiro time a atingir 50 vitórias na temporada.\n\nSGA, Chet Holmgren e Jalen Williams formam um dos trios mais temidos da liga.",
    img:"https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=900&q=80" },
];

// ── JOGOS DE HOJE — dados reais buscados via API ─────────────────────────────
const LIVE_SECTIONS = [
  {
    id:"brasileirao", label:"Brasileirão Série A", emoji:"🇧🇷", color:"#009c3b",
    games:[
      { id:"br1", home:"Flamengo",        away:"Botafogo",        time:"16h00", status:"scheduled", winProb:{home:48.2,away:25.1,draw:26.7} },
      { id:"br2", home:"Palmeiras",       away:"Corinthians",     time:"18h30", status:"scheduled", winProb:{home:54.3,away:20.4,draw:25.3} },
      { id:"br3", home:"São Paulo",       away:"Grêmio",          time:"20h00", status:"scheduled", winProb:{home:42.1,away:30.5,draw:27.4} },
      { id:"br4", home:"Atlético-MG",     away:"Internacional",   time:"21h00", status:"scheduled", winProb:{home:38.7,away:36.2,draw:25.1} },
      { id:"br5", home:"Cruzeiro",        away:"Bragantino",      time:"21h00", status:"scheduled", winProb:{home:44.0,away:29.8,draw:26.2} },
    ],
  },
  {
    id:"libertadores", label:"Copa Libertadores", emoji:"🌎", color:"#f5a623",
    games:[
      { id:"lib1", home:"Fluminense",     away:"LDU Quito",       time:"19h00", status:"scheduled", winProb:{home:52.4,away:23.6,draw:24.0} },
      { id:"lib2", home:"River Plate",    away:"Peñarol",         time:"21h30", status:"scheduled", winProb:{home:55.1,away:20.9,draw:24.0} },
      { id:"lib3", home:"Boca Juniors",   away:"Sporting Cristal",time:"23h30", status:"scheduled", winProb:{home:61.2,away:16.5,draw:22.3} },
    ],
  },
  {
    id:"cl", label:"Champions League", emoji:"🏆", color:"#1a56db",
    games:[
      { id:"cl1", home:"Bayer Leverkusen", away:"Arsenal FC",     time:"14h45", status:"scheduled", winProb:{home:14.5,away:64.6,draw:20.9} },
      { id:"cl2", home:"Real Madrid",      away:"Man. City",      time:"17h00", status:"scheduled", winProb:{home:26.9,away:47.9,draw:25.2} },
      { id:"cl3", home:"PSG",              away:"Chelsea",        time:"17h00", status:"scheduled", winProb:{home:46.8,away:27.6,draw:25.6} },
      { id:"cl4", home:"Bodø/Glimt",       away:"Sporting CP",   time:"17h00", status:"scheduled", winProb:{home:38.5,away:35.3,draw:26.2} },
    ],
  },
  {
    id:"nba", label:"NBA", emoji:"🏀", color:"#e65c00",
    games:[
      { id:"nba1", home:"Orlando Magic",        away:"Cleveland Cavaliers",     time:"20h30", status:"scheduled", winProb:{home:40.6,away:59.4} },
      { id:"nba2", home:"New Orleans Pelicans",  away:"Toronto Raptors",        time:"21h00", status:"scheduled", winProb:{home:47.5,away:52.5} },
      { id:"nba3", home:"Utah Jazz",             away:"New York Knicks",        time:"22h00", status:"scheduled", winProb:{home:13.7,away:86.3} },
      { id:"nba4", home:"Denver Nuggets",        away:"Houston Rockets",        time:"23h00", status:"scheduled", winProb:{home:64.8,away:35.2} },
      { id:"nba5", home:"Sacramento Kings",      away:"Charlotte Hornets",      time:"23h00", status:"scheduled", winProb:{home:14.4,away:85.6} },
      { id:"nba6", home:"LA Clippers",           away:"Minnesota Timberwolves", time:"23h30", status:"scheduled", winProb:{home:53.3,away:46.7} },
    ],
  },
  {
    id:"tennis", label:"Tênis — Ao Vivo", emoji:"🎾", color:"#c8860a",
    games:[
      { id:"t1", home:"Kalinina",  away:"Pridankina", time:"AO VIVO", status:"live", score:{home:1,away:0}, extra:"WTA 125K Antalya · Sets: 1-0" },
      { id:"t2", home:"Bronzetti", away:"Brancaccio", time:"AO VIVO", status:"live", extra:"WTA 125K Antalya" },
      { id:"t3", home:"Giustino",  away:"Henning",    time:"AO VIVO", status:"live", score:{home:1,away:0}, extra:"ATP Challenger Hersonissos" },
      { id:"t4", home:"Jubb",      away:"Wendelken",  time:"AO VIVO", status:"live", score:{home:1,away:0}, extra:"ATP Challenger Hersonissos" },
      { id:"t5", home:"Shelbayh",  away:"Coppejans",  time:"~12h20",  status:"scheduled", extra:"ATP Challenger Hersonissos" },
      { id:"t6", home:"Erjavec",   away:"Oz",         time:"~12h10",  status:"scheduled", extra:"WTA 125K Antalya" },
    ],
  },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
function timeAgo(m) {
  if (m < 60) return `${m}min atrás`;
  if (m < 1440) return `${Math.floor(m/60)}h atrás`;
  return `${Math.floor(m/1440)}d atrás`;
}

function AdSlot({ h=90, label="Publicidade" }) {
  return (
    <div style={{ width:"100%", height:h, background:"#f9f9f9", border:"1px dashed #ddd", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:4, margin:"12px 0" }}>
      <span style={{ fontSize:11, color:"#ccc", fontFamily:"monospace" }}>{label}</span>
    </div>
  );
}

function Badge({ sport, small }) {
  const m = META[sport];
  return (
    <span style={{ background:m.color, color:"#fff", fontSize:small?9:10, fontWeight:700, letterSpacing:0.8, padding:small?"2px 7px":"3px 10px", borderRadius:3 }}>
      {m.emoji} {m.label}
    </span>
  );
}

function ShareButtons({ article }) {
  const url  = `https://radardabola.com.br/${article.id}`;
  const text = encodeURIComponent(article.title);
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {[
        { label:"WhatsApp", bg:"#25d366", href:`https://wa.me/?text=${text}%20${url}` },
        { label:"X/Twitter", bg:"#000",  href:`https://x.com/intent/tweet?text=${text}&url=${url}` },
        { label:"Facebook",  bg:"#1877f2",href:`https://facebook.com/sharer/sharer.php?u=${url}` },
      ].map(s=>(
        <a key={s.label} href={s.href} target="_blank" rel="noreferrer" style={{ background:s.bg, color:"#fff", borderRadius:5, padding:"7px 14px", fontSize:12, fontWeight:700, textDecoration:"none" }}>{s.label}</a>
      ))}
      <button onClick={copy} style={{ background:copied?"#009c3b":"#f0f0f0", color:copied?"#fff":"#555", border:"none", borderRadius:5, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
        {copied?"✓ Copiado!":"Copiar link"}
      </button>
    </div>
  );
}

// ── CARDS ────────────────────────────────────────────────────────────────────
function HeroCard({ news, onClick }) {
  const m = META[news.sport];
  return (
    <div onClick={()=>onClick(news)} style={{ background:"#fff", borderRadius:8, overflow:"hidden", cursor:"pointer", border:"1px solid #e0e0e0", boxShadow:"0 2px 10px rgba(0,0,0,0.07)" }}>
      <div style={{ height:4, background:m.color }} />
      <div style={{ position:"relative", height:380, background:"#eee" }}>
        <img src={news.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }} />
        <div style={{ position:"absolute", bottom:0, padding:"22px 20px" }}>
          <div style={{ marginBottom:8 }}><Badge sport={news.sport} /></div>
          <h2 style={{ color:"#fff", fontSize:22, fontWeight:800, margin:"0 0 8px", lineHeight:1.3 }}>{news.title}</h2>
          <span style={{ color:"rgba(255,255,255,0.55)", fontSize:12 }}>● {timeAgo(news.minsAgo)} · {news.readTime} de leitura</span>
        </div>
      </div>
    </div>
  );
}

function MediumCard({ news, onClick }) {
  const m = META[news.sport];
  return (
    <div onClick={()=>onClick(news)} style={{ background:"#fff", borderRadius:8, overflow:"hidden", cursor:"pointer", border:"1px solid #e0e0e0", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ height:4, background:m.color }} />
      <div style={{ height:130, background:m.light, overflow:"hidden" }}>
        <img src={news.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} />
      </div>
      <div style={{ padding:"12px 14px" }}>
        <div style={{ marginBottom:6 }}><Badge sport={news.sport} small /></div>
        <h3 style={{ fontSize:13, fontWeight:700, color:"#111", margin:"0 0 6px", lineHeight:1.4 }}>{news.title}</h3>
        <span style={{ fontSize:11, color:"#aaa" }}>● {timeAgo(news.minsAgo)}</span>
      </div>
    </div>
  );
}

function ListCard({ news, onClick }) {
  const m = META[news.sport];
  return (
    <div onClick={()=>onClick(news)} style={{ display:"flex", gap:12, cursor:"pointer", padding:"12px 0", borderBottom:"1px solid #f0f0f0" }}>
      <div style={{ width:72, height:54, borderRadius:5, overflow:"hidden", flexShrink:0, background:m.light }}>
        <img src={news.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ marginBottom:4 }}><Badge sport={news.sport} small /></div>
        <h4 style={{ fontSize:12, fontWeight:700, color:"#111", margin:"0 0 4px", lineHeight:1.35 }}>{news.title}</h4>
        <span style={{ fontSize:11, color:"#aaa" }}>● {timeAgo(news.minsAgo)}</span>
      </div>
    </div>
  );
}

// ── JOGOS DE HOJE ─────────────────────────────────────────────────────────────
function ProbBar({ home, away, draw, color }) {
  const h = Math.round(home), a = Math.round(away), d = draw ? Math.round(draw) : 0;
  return (
    <div>
      <div style={{ display:"flex", height:5, borderRadius:3, overflow:"hidden", gap:1, marginBottom:4 }}>
        <div style={{ width:`${h}%`, background:color, opacity:0.8 }} />
        {d>0 && <div style={{ width:`${d}%`, background:"#aaa" }} />}
        <div style={{ width:`${a}%`, background:"#555" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"#aaa" }}>
        <span style={{ color:color, fontWeight:700 }}>{h}%</span>
        {d>0 && <span>{d}% empate</span>}
        <span style={{ fontWeight:700 }}>{a}%</span>
      </div>
    </div>
  );
}

function GameCard({ game, color }) {
  const isLive = game.status === "live";
  return (
    <div style={{ background:"#fff", borderRadius:8, padding:"12px 16px", border:"1px solid #e8e8e8", borderLeft:`3px solid ${isLive?"#e8002d":color}` }}>
      {game.extra && (
        <div style={{ fontSize:10, color:"#bbb", marginBottom:6 }}>{game.extra}</div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:13, fontWeight:700, color:"#111", lineHeight:1.3 }}>{game.home}</span>
        <div style={{ textAlign:"center", minWidth:80, flexShrink:0 }}>
          {isLive ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(232,0,45,0.08)", borderRadius:20, padding:"2px 8px" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#e8002d", animation:"blink 1s infinite" }} />
                <span style={{ fontSize:9, fontWeight:800, color:"#e8002d", letterSpacing:0.5 }}>AO VIVO</span>
              </div>
              {game.score && (
                <span style={{ fontSize:18, fontWeight:900, color:"#111", lineHeight:1 }}>
                  {game.score.home} <span style={{ color:"#ccc" }}>–</span> {game.score.away}
                </span>
              )}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <span style={{ fontSize:12, color:"#999", fontWeight:600 }}>{game.time}</span>
              <span style={{ fontSize:11, color:"#ccc" }}>×</span>
            </div>
          )}
        </div>
        <span style={{ fontSize:13, fontWeight:700, color:"#111", textAlign:"right", lineHeight:1.3 }}>{game.away}</span>
      </div>
      {game.winProb && (
        <div style={{ marginTop:10 }}>
          <ProbBar home={game.winProb.home} away={game.winProb.away} draw={game.winProb.draw} color={color} />
        </div>
      )}
    </div>
  );
}

function TodayTab({ games }) {
  const [filter, setFilter] = useState("all");
  
  // Agrupar jogos por liga
  const sectionsMap = {};
  games.forEach(g => {
    if (!sectionsMap[g.leagueId]) {
      sectionsMap[g.leagueId] = {
        id: g.leagueId,
        label: g.league,
        emoji: g.leagueEmoji,
        color: g.leagueColor,
        games: []
      };
    }
    // Adaptar estrutura do BD para o formato esperado pelo GameCard (winProb)
    const adaptedGame = {
      ...g,
      winProb: (g.probHome || g.probAway) ? { home: g.probHome, away: g.probAway, draw: g.probDraw } : undefined,
      score: (g.scoreHome !== null && g.scoreHome !== undefined) ? { home: g.scoreHome, away: g.scoreAway } : undefined
    };
    sectionsMap[g.leagueId].games.push(adaptedGame);
  });
  
  const allSections = Object.values(sectionsMap);
  const sections = filter==="all" ? allSections : allSections.filter(s=>s.id===filter);

  return (
    <div>
      <div style={{ background:"#fff", borderRadius:8, padding:"12px 16px", border:"1px solid #e0e0e0", marginBottom:16, display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:11, color:"#aaa", fontWeight:600, marginRight:4 }}>FILTRAR:</span>
        {[["all","Todos"], ...allSections.map(s=>[s.id, s.label])].map(([id, label])=>(
          <button key={id} onClick={()=>setFilter(id)} style={{ background:filter===id?BRAND.red:"#f5f5f5", color:filter===id?"#fff":"#555", border:"none", borderRadius:20, padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
            {id==="all"?"🏟️ Todos":allSections.find(s=>s.id===id)?.emoji+" "+label}
          </button>
        ))}
        <div style={{ marginLeft:"auto", fontSize:11, color:"#aaa" }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#e8002d", display:"inline-block", animation:"blink 1s infinite" }} />
            Dados atualizados em tempo real
          </span>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:24 }}>
        <div>
          {sections.map(section=>(
            <div key={section.id} style={{ marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ width:4, height:20, background:section.color, borderRadius:2 }} />
                <span style={{ fontSize:16, fontWeight:800, color:"#111" }}>{section.emoji} {section.label}</span>
                <span style={{ fontSize:11, color:"#bbb", marginLeft:4 }}>{section.games.length} jogos</span>
                {section.games.some(g=>g.status==="live") && (
                  <span style={{ background:"rgba(232,0,45,0.08)", color:"#e8002d", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>● AO VIVO</span>
                )}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {section.games.map(g=><GameCard key={g.id} game={g} color={section.color} />)}
              </div>
            </div>
          ))}
        </div>
        <aside>
          <div style={{ background:"#fff", borderRadius:8, padding:"16px", border:"1px solid #e0e0e0", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <div style={{ width:4, height:16, background:BRAND.red, borderRadius:2 }} />
              <span style={{ fontWeight:800, fontSize:13, color:"#111" }}>Resumo de hoje</span>
            </div>
            {allSections.map(s=>(
              <div key={s.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f5f5f5", alignItems:"center" }}>
                <span style={{ fontSize:13, color:"#444" }}>{s.emoji} {s.label}</span>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {s.games.some(g=>g.status==="live") && (
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#e8002d", display:"inline-block", animation:"blink 1s infinite" }} />
                  )}
                  <span style={{ background:"#f0f0f0", color:"#666", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>{s.games.length}</span>
                </div>
              </div>
            ))}
          </div>
          <AdSlot h={250} label="300×250" />
          <AdSlot h={600} label="300×600" />
        </aside>
      </div>
    </div>
  );
}

// ── ARTIGO ────────────────────────────────────────────────────────────────────
function ArticlePage({ news, onBack, allNews }) {
  useEffect(()=>{ window.scrollTo(0,0); },[]);
  const m = META[news.sport];
  const related = allNews.filter(n=>n.sport===news.sport&&n.id!==news.id).slice(0,3);
  return (
    <div style={{ background:"#f5f5f5", minHeight:"100vh", fontFamily:"'Arial','Helvetica',sans-serif" }}>
      <button onClick={onBack} style={{ position:"fixed", top:16, left:16, zIndex:200, background:"rgba(255,255,255,0.93)", backdropFilter:"blur(8px)", color:"#111", border:"1px solid #ddd", borderRadius:20, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}>
        ← Voltar
      </button>
      <div style={{ height:360, position:"relative", overflow:"hidden", background:"#111" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:5, background:m.color, zIndex:2 }} />
        <img src={news.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.65 }} onError={e=>e.target.style.display="none"} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.88), transparent 50%)" }} />
        <div style={{ position:"absolute", bottom:0, padding:"28px 24px", maxWidth:820 }}>
          <div style={{ marginBottom:10 }}><Badge sport={news.sport} /></div>
          <h1 style={{ color:"#fff", fontSize:25, fontWeight:800, margin:"0 0 10px", lineHeight:1.3 }}>{news.title}</h1>
          <span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>● {timeAgo(news.minsAgo)} · {news.readTime} de leitura</span>
        </div>
      </div>
      <div style={{ maxWidth:820, margin:"0 auto", padding:"0 20px" }}>
        <AdSlot h={90} label="Publicidade" />
        <div style={{ background:"#fff", borderRadius:8, padding:"16px 20px", marginBottom:14, border:"1px solid #e0e0e0" }}>
          <ShareButtons article={news} />
        </div>
        <div style={{ background:m.light, borderLeft:`4px solid ${m.color}`, padding:"14px 18px", marginBottom:16, fontSize:15, fontWeight:600, color:"#333", lineHeight:1.7, borderRadius:"0 6px 6px 0" }}>
          {news.summary}
        </div>
        <div style={{ background:"#fff", borderRadius:8, padding:"24px", border:"1px solid #e0e0e0" }}>
          {news.content.split("\n\n").map((p,i)=>(
            <div key={i}>
              <p style={{ fontSize:16, lineHeight:1.85, color:"#222", margin:"0 0 18px" }}>{p}</p>
              {i===1 && <AdSlot h={90} label="Publicidade In-Content" />}
            </div>
          ))}
        </div>
        <AdSlot h={90} label="Publicidade" />
        <div style={{ background:"#fff", borderRadius:8, padding:"20px", margin:"16px 0", textAlign:"center", border:"1px solid #e0e0e0" }}>
          <p style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#111" }}>Gostou? Compartilhe!</p>
          <ShareButtons article={news} />
        </div>
        {related.length>0 && (
          <div style={{ margin:"24px 0 32px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <div style={{ width:4, height:18, background:m.color, borderRadius:2 }} />
              <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:"#111" }}>Mais {META[news.sport].label}</h3>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
              {related.map(n=><MediumCard key={n.id} news={n} onClick={()=>{}} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomePage({ onArticle, news, games }) {
  const [tab, setTab] = useState("inicio");
  const tabs = ["inicio","futebol","formula1","tenis","basquete","jogos"];
  const tabLabel = { inicio:"Início", futebol:"Futebol", formula1:"Fórmula 1", tenis:"Tênis", basquete:"Basquete", jogos:"🏟️ Jogos de Hoje" };

  const filtered = tab==="inicio" ? news : (tab==="jogos" ? [] : news.filter(n=>n.sport===tab));
  const hero   = filtered[0];
  const medium = filtered.slice(1,4);
  const rest   = filtered.slice(4);

  return (
    <div style={{ background:"#f5f5f5", minHeight:"100vh", fontFamily:"'Arial','Helvetica',sans-serif" }}>
      <header style={{ background:BRAND.red, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>
            <div style={{ fontFamily:"'Arial Black','Arial',sans-serif", fontWeight:900, fontSize:20, color:"#fff", letterSpacing:-0.5 }}>
              RADAR DA BOLA
            </div>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.65)" }}>Terça, 11 mar 2026</span>
              <span style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(0,0,0,0.2)", color:"#fff", fontSize:10, fontWeight:700, padding:"4px 10px", borderRadius:20 }}>
                <span style={{ width:6, height:6, background:"#fff", borderRadius:"50%", animation:"blink 1.2s infinite" }} />
                AO VIVO
              </span>
            </div>
          </div>
          <nav style={{ display:"flex", overflowX:"auto", borderTop:"1px solid rgba(255,255,255,0.2)" }}>
            {tabs.map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                background:"none", border:"none",
                borderBottom: tab===t ? "3px solid #fff" : "3px solid transparent",
                color: tab===t ? "#fff" : "rgba(255,255,255,0.65)",
                padding:"10px 16px", fontSize:13,
                fontWeight: tab===t ? 700 : 400,
                cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s",
              }}>
                {tabLabel[t]}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"20px" }}>
        {tab==="jogos" ? (
          <div>
            <div style={{ marginBottom:16 }}>
              <h2 style={{ fontSize:20, fontWeight:800, color:"#111", margin:"0 0 4px" }}>🏟️ Jogos de Hoje</h2>
              <p style={{ fontSize:13, color:"#888", margin:0 }}>Terça-feira, 11 de março de 2026 · Dados em tempo real</p>
            </div>
            <TodayTab games={games} />
          </div>
        ) : (
          <>
            <AdSlot h={90} label="Publicidade Leaderboard 728×90" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:24 }}>
              <div>
                {hero && <div style={{ marginBottom:16 }}><HeroCard news={hero} onClick={onArticle} /></div>}
                <AdSlot h={90} label="Publicidade In-Feed" />
                {medium.length>0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, margin:"16px 0" }}>
                    {medium.map(n=><MediumCard key={n.id} news={n} onClick={onArticle} />)}
                  </div>
                )}
                {rest.length>0 && (
                  <div style={{ background:"#fff", borderRadius:8, padding:"0 16px", border:"1px solid #e0e0e0" }}>
                    {rest.map(n=><ListCard key={n.id} news={n} onClick={onArticle} />)}
                  </div>
                )}
              </div>
              <aside>
                <AdSlot h={250} label="300×250" />
                <div style={{ background:"#fff", borderRadius:8, padding:"16px", border:"1px solid #e0e0e0", marginTop:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                    <div style={{ width:4, height:16, background:BRAND.red, borderRadius:2 }} />
                    <span style={{ fontWeight:800, fontSize:13, color:"#111" }}>Modalidades</span>
                  </div>
                  {Object.entries(META).map(([k,m])=>{
                    const n=news.filter(x=>x.sport===k).length;
                    return (
                      <div key={k} onClick={()=>setTab(k)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #f5f5f5", cursor:"pointer" }}>
                        <span style={{ fontSize:13, color:"#333" }}>{m.emoji} {m.label}</span>
                        <span style={{ background:m.light, color:m.color, fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:10 }}>{n}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ background:"#fff", borderRadius:8, padding:"16px", border:"1px solid #e0e0e0", marginTop:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                    <div style={{ width:4, height:16, background:BRAND.red, borderRadius:2 }} />
                    <span style={{ fontWeight:800, fontSize:13, color:"#111" }}>Em Alta 🔥</span>
                  </div>
                  {news.slice(0,4).map((n,i)=>(
                    <div key={n.id} onClick={()=>onArticle(n)} style={{ display:"flex", gap:10, cursor:"pointer", padding:"9px 0", borderBottom:"1px solid #f5f5f5" }}>
                      <span style={{ fontSize:22, fontWeight:900, color:"#e8e8e8", lineHeight:1, flexShrink:0, width:24, textAlign:"center" }}>{i+1}</span>
                      <div>
                        <div style={{ marginBottom:3 }}>
                          <span style={{ background:META[n.sport].color, color:"#fff", fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:2 }}>{META[n.sport].label}</span>
                        </div>
                        <div style={{ fontSize:12, fontWeight:700, color:"#111", lineHeight:1.35 }}>{n.title}</div>
                        <span style={{ fontSize:10, color:"#aaa" }}>● {timeAgo(n.minsAgo)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <AdSlot h={600} label="300×600" />
              </aside>
            </div>
          </>
        )}
      </div>
      <footer style={{ background:BRAND.black, borderTop:`3px solid ${BRAND.red}`, padding:"24px 20px", marginTop:40, textAlign:"center" }}>
        <div style={{ fontFamily:"'Arial Black','Arial',sans-serif", fontWeight:900, fontSize:18, color:"#fff", letterSpacing:-0.5, marginBottom:6 }}>
          RADAR DA BOLA
        </div>
        <p style={{ color:"rgba(255,255,255,0.25)", fontSize:12, margin:0 }}>© 2026 radardabola.com.br · Esportes em tempo real</p>
      </footer>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

export default function App() {
  if (typeof window !== "undefined" && (window.location.pathname === "/admin" || window.location.pathname === "/admin/")) {
    return <AdminApp />;
  }

  const [news, setNews] = useState([]);
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Notícias
    const { data: nData } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (nData) {
      const mappedNews = nData.map(n => ({
        ...n,
        minsAgo: n.created_at ? Math.floor((new Date() - new Date(n.created_at)) / 60000) : 0,
        readTime: "3 min" // Padrão
      }));
      setNews(mappedNews);
    }
    // Jogos
    const { data: gData } = await supabase.from('games').select('*');
    if (gData) setGames(gData);
  };

  const [article, setArticle] = useState(null);
  return article
    ? <ArticlePage news={article} onBack={()=>setArticle(null)} allNews={news} />
    : <HomePage onArticle={setArticle} news={news} games={games} />;
}