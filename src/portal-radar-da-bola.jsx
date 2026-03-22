/* eslint-disable */
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const BRAND = { red:"#e8002d", black:"#0d0d0d", white:"#ffffff" };

function useIsMobile() {
  var [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(function(){
    function handleResize(){ setIsMobile(window.innerWidth < 768); }
    window.addEventListener("resize", handleResize);
    return function(){ window.removeEventListener("resize", handleResize); };
  },[]);
  return isMobile;
}
const META = {
  futebol:  { color:"#009c3b", light:"#e8f5ee", label:"FUTEBOL",   emoji:"⚽" },
  formula1: { color:"#e10600", light:"#fdecea", label:"FÓRMULA 1", emoji:"🏎️" },
  tenis:    { color:"#c8860a", light:"#fdf6e3", label:"TÊNIS",     emoji:"🎾" },
  basquete: { color:"#e65c00", light:"#fef3ea", label:"BASQUETE",  emoji:"🏀" },
};

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (diff < 60) return `${diff}min atrás`;
  if (diff < 1440) return `${Math.floor(diff/60)}h atrás`;
  return `${Math.floor(diff/1440)}d atrás`;
}

function AdSlot({ h=90, label="Publicidade" }) {
  return (
    <div style={{ width:"100%", height:h, background:"#f9f9f9", border:"1px dashed #ddd", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:4, margin:"16px 0" }}>
      <span style={{ fontSize:11, color:"#ccc", fontFamily:"monospace" }}>{label}</span>
    </div>
  );
}

function Badge({ sport, small }) {
  const m = META[sport] || META.futebol;
  return (
    <span style={{ background:m.color, color:"#fff", fontSize:small?9:10, fontWeight:700, letterSpacing:0.8, padding:small?"2px 7px":"3px 10px", borderRadius:3 }}>
      {m.emoji} {m.label}
    </span>
  );
}

function ShareButtons({ article }) {
  const url  = "https://radardabola.com.br/" + article.id;
  const text = encodeURIComponent(article.titulo);
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard && navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      <a href={"https://wa.me/?text="+text+"%20"+url} target="_blank" rel="noreferrer" style={{ background:"#25d366", color:"#fff", borderRadius:5, padding:"7px 14px", fontSize:12, fontWeight:700, textDecoration:"none" }}>WhatsApp</a>
      <a href={"https://x.com/intent/tweet?text="+text+"&url="+url} target="_blank" rel="noreferrer" style={{ background:"#000", color:"#fff", borderRadius:5, padding:"7px 14px", fontSize:12, fontWeight:700, textDecoration:"none" }}>X/Twitter</a>
      <a href={"https://facebook.com/sharer/sharer.php?u="+url} target="_blank" rel="noreferrer" style={{ background:"#1877f2", color:"#fff", borderRadius:5, padding:"7px 14px", fontSize:12, fontWeight:700, textDecoration:"none" }}>Facebook</a>
      <button onClick={copy} style={{ background:copied?"#009c3b":"#f0f0f0", color:copied?"#fff":"#555", border:"none", borderRadius:5, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
        {copied?"✓ Copiado!":"Copiar link"}
      </button>
    </div>
  );
}

function HeroCard({ news, onClick }) {
  const m = META[news.categoria] || META.futebol;
  return (
    <div onClick={()=>onClick(news)} style={{ background:"#fff", borderRadius:8, overflow:"hidden", cursor:"pointer", border:"1px solid #e0e0e0", boxShadow:"0 2px 10px rgba(0,0,0,0.07)" }}>
      <div style={{ height:4, background:m.color }} />
      <div style={{ position:"relative", height:480, background:"#eee" }}>
        <img src={news.imagem_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={function(e){e.target.style.display="none"}} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }} />
        <div style={{ position:"absolute", bottom:0, padding:"28px 24px" }}>
          <div style={{ marginBottom:8 }}><Badge sport={news.categoria} /></div>
          <h2 style={{ color:"#fff", fontSize:28, fontWeight:900, margin:"0 0 10px", lineHeight:1.3 }}>{news.titulo}</h2>
          <span style={{ color:"rgba(255,255,255,0.55)", fontSize:12 }}>● {timeAgo(news.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

function MediumCard({ news, onClick }) {
  const m = META[news.categoria] || META.futebol;
  return (
    <div onClick={()=>onClick(news)} style={{ background:"#fff", borderRadius:10, overflow:"hidden", cursor:"pointer", border:"1px solid #e0e0e0", boxShadow:"0 2px 12px rgba(0,0,0,0.07)", transition:"transform 0.2s, box-shadow 0.2s" }}>
      <div style={{ height:4, background:m.color }} />
      <div style={{ height:180, background:m.light, overflow:"hidden" }}>
        <img src={news.imagem_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={function(e){e.target.style.display="none"}} />
      </div>
      <div style={{ padding:"14px 16px" }}>
        <div style={{ marginBottom:6 }}><Badge sport={news.categoria} small /></div>
        <h3 style={{ fontSize:14, fontWeight:700, color:"#111", margin:"0 0 6px", lineHeight:1.4 }}>{news.titulo}</h3>
        <span style={{ fontSize:11, color:"#aaa" }}>● {timeAgo(news.created_at)}</span>
      </div>
    </div>
  );
}

function ListCard({ news, onClick }) {
  const m = META[news.categoria] || META.futebol;
  return (
    <div onClick={()=>onClick(news)} style={{ display:"flex", gap:12, cursor:"pointer", padding:"14px 0", borderBottom:"1px solid #f0f0f0" }}>
      <div style={{ width:96, height:72, borderRadius:5, overflow:"hidden", flexShrink:0, background:m.light }}>
        <img src={news.imagem_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={function(e){e.target.style.display="none"}} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ marginBottom:4 }}><Badge sport={news.categoria} small /></div>
        <h4 style={{ fontSize:13, fontWeight:700, color:"#111", margin:"0 0 4px", lineHeight:1.35 }}>{news.titulo}</h4>
        <span style={{ fontSize:11, color:"#aaa" }}>● {timeAgo(news.created_at)}</span>
      </div>
    </div>
  );
}

function ProbBar({ home, away, draw, color }) {
  var h = Math.round(home||0), a = Math.round(away||0), d = Math.round(draw||0);
  return (
    <div>
      <div style={{ display:"flex", height:5, borderRadius:3, overflow:"hidden", gap:1, marginBottom:4 }}>
        <div style={{ width:h+"%", background:color, opacity:0.8 }} />
        {d>0 && <div style={{ width:d+"%", background:"#aaa" }} />}
        <div style={{ width:a+"%", background:"#555" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"#aaa" }}>
        <span style={{ color:color, fontWeight:700 }}>{h}%</span>
        {d>0 && <span>{d}% empate</span>}
        <span style={{ fontWeight:700 }}>{a}%</span>
      </div>
    </div>
  );
}

function GameCard({ game }) {
  var isLive     = game.status === "live";
  var isFinished = game.status === "finished";
  var hasScore   = game.score_home !== null && game.score_home !== undefined;
  var color      = game.league_color || "#333";
  return (
    <div style={{ background:"#fff", borderRadius:8, padding:"12px 16px", border:"1px solid #e8e8e8", borderLeft:"3px solid "+(isLive?"#e8002d":color), opacity:isFinished?0.75:1 }}>
      {game.extra && <div style={{ fontSize:10, color:"#bbb", marginBottom:6 }}>{game.extra}</div>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {game.home_logo && <img src={game.home_logo} alt="" style={{ width:24, height:24, objectFit:"contain" }} onError={function(e){e.target.style.display="none"}} />}
          <span style={{ fontSize:13, fontWeight:700, color:"#111", lineHeight:1.3 }}>{game.home}</span>
        </div>
        <div style={{ textAlign:"center", minWidth:80 }}>
          {isLive ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(232,0,45,0.08)", borderRadius:20, padding:"2px 8px" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#e8002d", animation:"blink 1s infinite" }} />
                <span style={{ fontSize:9, fontWeight:800, color:"#e8002d" }}>AO VIVO</span>
              </div>
              {hasScore && <span style={{ fontSize:18, fontWeight:900, color:"#111" }}>{game.score_home} - {game.score_away}</span>}
            </div>
          ) : isFinished && hasScore ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <span style={{ fontSize:18, fontWeight:900, color:"#111" }}>{game.score_home} - {game.score_away}</span>
              <span style={{ fontSize:9, color:"#aaa", fontWeight:600, letterSpacing:0.5 }}>ENCERRADO</span>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <span style={{ fontSize:12, color:"#999", fontWeight:600 }}>{game.time}</span>
              <span style={{ fontSize:11, color:"#ccc" }}>x</span>
            </div>
          )}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"flex-end" }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#111", lineHeight:1.3, textAlign:"right" }}>{game.away}</span>
          {game.away_logo && <img src={game.away_logo} alt="" style={{ width:24, height:24, objectFit:"contain" }} onError={function(e){e.target.style.display="none"}} />}
        </div>
      </div>
      {game.prob_home && !isFinished && (
        <div style={{ marginTop:10 }}>
          <ProbBar home={game.prob_home} away={game.prob_away} draw={game.prob_draw} color={color} />
        </div>
      )}
    </div>
  );
}

function TodayGames({ games }) {
  var leagues = [];
  games.forEach(function(g){ if(!leagues.includes(g.league_id)) leagues.push(g.league_id); });
  if(games.length===0) return (
    <div style={{ background:"#fff", borderRadius:8, padding:40, textAlign:"center", color:"#aaa", border:"1px solid #e0e0e0" }}>
      Nenhum jogo cadastrado para hoje.
    </div>
  );
  return (
    <div>
      {leagues.map(function(lid){
        var lg = games.filter(function(g){ return g.league_id===lid; });
        var first = lg[0];
        return (
          <div key={lid} style={{ marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:4, height:20, background:first.league_color||"#333", borderRadius:2 }} />
              <span style={{ fontSize:16, fontWeight:800, color:"#111" }}>{first.league_emoji} {first.league}</span>
              <span style={{ fontSize:11, color:"#bbb" }}>{lg.length} jogos</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {lg.map(function(g){ return <GameCard key={g.id} game={g} />; })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ArticlePage({ news, onBack, allNews }) {
  useEffect(function(){ window.scrollTo(0,0); },[]);
  var m = META[news.categoria] || META.futebol;
  var related = allNews.filter(function(n){ return n.categoria===news.categoria && n.id!==news.id; }).slice(0,3);
  return (
    <div style={{ background:"#f5f5f5", minHeight:"100vh", fontFamily:"'Arial','Helvetica',sans-serif" }}>
      <button onClick={onBack} style={{ position:"fixed", top:16, left:16, zIndex:200, background:"rgba(255,255,255,0.93)", backdropFilter:"blur(8px)", color:"#111", border:"1px solid #ddd", borderRadius:20, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}>
        &larr; Voltar
      </button>
      <div style={{ height:360, position:"relative", overflow:"hidden", background:"#111" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:5, background:m.color, zIndex:2 }} />
        <img src={news.imagem_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.65 }} onError={function(e){e.target.style.display="none"}} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.88), transparent 50%)" }} />
        <div style={{ position:"absolute", bottom:0, padding:"28px 24px", maxWidth:820 }}>
          <div style={{ marginBottom:10 }}><Badge sport={news.categoria} /></div>
          <h1 style={{ color:"#fff", fontSize:25, fontWeight:800, margin:"0 0 10px", lineHeight:1.3 }}>{news.titulo}</h1>
          <span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>● {timeAgo(news.created_at)}</span>
        </div>
      </div>
      <div style={{ maxWidth:1000, margin:"0 auto", padding:isMobile?"0 8px":"0 28px" }}>
        <AdSlot h={90} label="Publicidade" />
        <div style={{ background:"#fff", borderRadius:8, padding:"16px 20px", marginBottom:14, border:"1px solid #e0e0e0" }}>
          <ShareButtons article={news} />
        </div>
        <div style={{ background:m.light, borderLeft:"4px solid "+m.color, padding:"14px 18px", marginBottom:16, fontSize:15, fontWeight:600, color:"#333", lineHeight:1.7, borderRadius:"0 6px 6px 0" }}>
          {news.subtitulo}
        </div>
        <div style={{ background:"#fff", borderRadius:8, padding:"24px", border:"1px solid #e0e0e0" }}>
          {(news.conteudo||"").split("\n\n").map(function(p,i){
            return (
              <div key={i}>
                <p style={{ fontSize:17, lineHeight:1.9, color:"#222", margin:"0 0 18px" }}>{p}</p>
                {i===1 && <AdSlot h={90} label="Publicidade In-Content" />}
              </div>
            );
          })}
        </div>
        <AdSlot h={90} label="Publicidade" />
        <div style={{ background:"#fff", borderRadius:8, padding:"28px", margin:"16px 0", textAlign:"center", border:"1px solid #e0e0e0" }}>
          <p style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:"#111" }}>Gostou? Compartilhe!</p>
          <ShareButtons article={news} />
        </div>
        {related.length>0 && (
          <div style={{ margin:"24px 0 32px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <div style={{ width:4, height:18, background:m.color, borderRadius:2 }} />
              <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:"#111" }}>Mais {(META[news.categoria]||META.futebol).label}</h3>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)", gap:isMobile?12:20 }} className="rdb-cards-grid">
              {related.map(function(n){ return <MediumCard key={n.id} news={n} onClick={function(){}} />; })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ── TICKER DE MANCHETES ───────────────────────────────────────────────────────
function NewsTicker({ news }) {
  var isMobile = useIsMobile();
  if (!news || news.length === 0) return null;
  const items = news.slice(0, 10);
  const m = { futebol:META.futebol, formula1:META.formula1, tenis:META.tenis, basquete:META.basquete };
  return (
    <div style={{ background:"#111", borderBottom:"2px solid #222", overflow:"hidden", height:36, display:"flex", alignItems:"center" }}>
      <div style={{ maxWidth:1400, margin:"0 auto", width:"100%", display:"flex", alignItems:"center", padding:isMobile?"0 8px":"0 28px" }}>
      <div style={{ background:BRAND.red, color:"#fff", fontSize:10, fontWeight:800, padding:"6px 14px", display:"flex", alignItems:"center", letterSpacing:1, whiteSpace:"nowrap", flexShrink:0, borderRadius:3 }}>
        EM ALTA 🔥
      </div>
      <div style={{ overflow:"hidden", flex:1, position:"relative", marginLeft:12 }}>
        <div style={{ display:"flex", gap:0, animation:"ticker 40s linear infinite", whiteSpace:"nowrap" }}>
          {[...items,...items].map(function(n,i){
            var mm = m[n.categoria]||META.futebol;
            return (
              <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"0 24px", fontSize:11, color:"rgba(255,255,255,0.75)", borderRight:"1px solid #333", cursor:"pointer" }}>
                <span style={{ fontSize:10 }}>{mm.emoji}</span>
                {n.titulo}
              </span>
            );
          })}
        </div>
      </div>
      </div>
      <style>{"@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}"}</style>
    </div>
  );
}

// ── CONTAGEM REGRESSIVA COPA 2026 ─────────────────────────────────────────────
function CopaCountdown() {
  var isMobile = useIsMobile();
  var [time, setTime] = React.useState({ dias:0, horas:0, min:0, seg:0 });
  React.useEffect(function(){
    function calc(){
      var copa = new Date("2026-06-11T17:00:00Z");
      var diff = copa - Date.now();
      if(diff <= 0) return;
      var dias  = Math.floor(diff/86400000);
      var horas = Math.floor((diff%86400000)/3600000);
      var min   = Math.floor((diff%3600000)/60000);
      var seg   = Math.floor((diff%60000)/1000);
      setTime({ dias, horas, min, seg });
    }
    calc();
    var t = setInterval(calc, 1000);
    return function(){ clearInterval(t); };
  },[]);
  return (
    <div style={{ background:"linear-gradient(135deg, #009c3b 0%, #006428 50%, #009c3b 100%)", padding:"10px 0" }}>
    <div style={{ maxWidth:1400, margin:"0 auto", padding:isMobile?"0 8px":"0 28px", display:"flex", alignItems:"center", justifyContent:isMobile?"center":"space-between", flexWrap:"wrap", gap:isMobile?8:12, textAlign:isMobile?"center":"left" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:22 }}>🌍</span>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:"#fff", letterSpacing:0.5 }}>COPA DO MUNDO 2026</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.65)", letterSpacing:1 }}>EUA · CANADÁ · MÉXICO · 11 JUN 2026</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:16, alignItems:"center" }}>
        {[["dias",time.dias],["hr",time.horas],["min",time.min],["seg",time.seg]].map(function(item){
          return (
            <div key={item[0]} style={{ textAlign:"center" }}>
              <div style={{ fontSize:26, fontWeight:900, color:"#fff", lineHeight:1, minWidth:40 }}>{String(item[1]).padStart(2,"0")}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.6)", letterSpacing:1, marginTop:2 }}>{item[0].toUpperCase()}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontWeight:600 }}>
        🇧🇷 Seleção Brasileira na Copa
      </div>
    </div>
    </div>
  );
}

function HomePage({ onArticle }) {
  var isMobile = useIsMobile();
  var [tab, setTab]       = useState("inicio");
  var [news, setNews]     = useState([]);
  var [games, setGames]       = useState([]);
  var [gamesAmanha, setGamesAmanha] = useState([]);
  var [loading, setLoading]     = useState(true);

  var tabs     = ["inicio","futebol","formula1","tenis","basquete","jogos","amanha"];
  var horaBR = ((new Date().getUTCHours() - 3) + 24) % 24;
  var tabLabel = { inicio:"Inicio", futebol:"Futebol", formula1:"Formula 1", tenis:"Tenis", basquete:"Basquete", jogos:"Jogos de Hoje", amanha:"Jogos de Amanha" };
  var navColor = { inicio:BRAND.red, futebol:META.futebol.color, formula1:META.formula1.color, tenis:META.tenis.color, basquete:META.basquete.color, jogos:BRAND.red, amanha:"#1a56db" };

  useEffect(function(){
    function load() {
      setLoading(true);
      supabase.from("noticias").select("*").order("created_at",{ascending:false}).limit(20).then(function(res){
        setNews(res.data||[]);
        setLoading(false);
      });

      var hoje = new Date().toISOString().split("T")[0];
      var amanhaDate = new Date(); amanhaDate.setDate(amanhaDate.getDate()+1);
      var amanha = amanhaDate.toISOString().split("T")[0];
      supabase.from("jogos").select("*").in("data_jogo",[hoje,amanha]).order("time",{ascending:true}).then(function(res){
        var todos = res.data||[];
        setGames(todos.filter(function(g){ return g.data_jogo===hoje; }));
        setGamesAmanha(todos.filter(function(g){ return g.data_jogo===amanha; }));
      });
    }
    load();
    var interval = setInterval(load, 5*60*1000);
    return function(){ clearInterval(interval); };
  },[]);

  var filtered = tab==="inicio" ? news : (tab==="jogos"||tab==="amanha" ? [] : news.filter(function(n){ return n.categoria===tab; }));
  var hero   = filtered[0];
  var medium = filtered.slice(1, isMobile ? 5 : 4);
  var rest   = filtered.slice(isMobile ? 5 : 4);

  return (
    <div style={{ background:"#f5f5f5", minHeight:"100vh", fontFamily:"'Arial','Helvetica',sans-serif" }}>
      <header style={{ background:BRAND.red, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth:1400, margin:"0 auto", padding:isMobile?"0 8px":"0 28px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:62 }}>
            <div style={{ fontFamily:"'Arial Black','Arial',sans-serif", fontWeight:900, fontSize:20, color:"#fff", letterSpacing:-0.5 }}>
              RADAR <span style={{ color:"rgba(255,255,255,0.7)" }}> DA </span> BOLA
            </div>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"short"})}</span>
              <span style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.2)", color:"#fff", fontSize:10, fontWeight:700, padding:"4px 10px", borderRadius:20 }}>
                <span style={{ width:6, height:6, background:"#fff", borderRadius:"50%", animation:"blink 1.2s infinite" }} />
                AO VIVO
              </span>
            </div>
          </div>
          <nav style={{ display:"flex", overflowX:"auto", borderTop:"1px solid rgba(255,255,255,0.2)" }} className="rdb-nav">
            {tabs.map(function(t){
              return (
                <button key={t} onClick={function(){ setTab(t); }} style={{ background:"none", border:"none", borderBottom:tab===t?"3px solid #fff":"3px solid transparent", color:tab===t?"#fff":"rgba(255,255,255,0.65)", padding:"12px 20px", fontSize:13, fontWeight:tab===t?700:400, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s" }}>
                  {tabLabel[t]}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <NewsTicker news={news} />
      <CopaCountdown />

      <div style={{ maxWidth:1400, margin:"0 auto", padding:isMobile?"14px":"28px" }}>
        <AdSlot h={90} label="Publicidade Leaderboard 728x90" />

        {(tab==="jogos"||tab==="amanha") ? (
          <div>
            <div style={{ marginBottom:16 }}>
              <h2 style={{ fontSize:20, fontWeight:800, color:"#111", margin:"0 0 4px" }}>
                {tab==="amanha" ? "Jogos de Amanhã" : "Jogos de Hoje"}
              </h2>
              <p style={{ fontSize:13, color:"#888", margin:0 }}>
                {tab==="amanha"
                  ? new Date(new Date().setDate(new Date().getDate()+1)).toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})
                  : new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})
                }
              </p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 320px", gap:isMobile?16:32 }}>
              <TodayGames games={tab==="amanha" ? gamesAmanha : games} />
              <aside style={{ display:isMobile?"none":"block" }}>
                <AdSlot h={250} label="300x250" />
                <AdSlot h={600} label="300x600" />
              </aside>
            </div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 320px", gap:isMobile?16:32 }}>
            <div>
              {loading ? (
                <div style={{ background:"#fff", borderRadius:8, padding:60, textAlign:"center", color:"#aaa", border:"1px solid #e0e0e0" }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>Carregando...</div>
                </div>
              ) : (
                <div>
                  {hero ? <div style={{ marginBottom:16 }}><HeroCard news={hero} onClick={onArticle} /></div> : (
                    <div style={{ background:"#fff", borderRadius:8, padding:60, textAlign:"center", color:"#aaa", border:"1px solid #e0e0e0" }}>
                      <div style={{ fontSize:32, marginBottom:12 }}>Nenhuma noticia ainda. O sistema ira buscar em breve!</div>
                    </div>
                  )}
                  <AdSlot h={90} label="Publicidade In-Feed" />
                  {medium.length>0 && (
                    <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)", gap:isMobile?12:20, margin:"16px 0" }}>
                      {medium.map(function(n){ return <MediumCard key={n.id} news={n} onClick={onArticle} />; })}
                    </div>
                  )}
                  {rest.length>0 && (
                    <div style={{ background:"#fff", borderRadius:10, padding:"4px 20px", border:"1px solid #e0e0e0", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                      {rest.map(function(n){ return <ListCard key={n.id} news={n} onClick={onArticle} />; })}
                    </div>
                  )}
                </div>
              )}
            </div>
            <aside style={{ display:isMobile?"none":"block" }}>
              <AdSlot h={250} label="300x250" />
              <div style={{ background:"#fff", borderRadius:10, padding:"18px", border:"1px solid #e0e0e0", marginTop:16, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                  <div style={{ width:4, height:16, background:BRAND.red, borderRadius:2 }} />
                  <span style={{ fontWeight:800, fontSize:13, color:"#111" }}>Modalidades</span>
                </div>
                {Object.entries(META).map(function(entry){
                  var k=entry[0], m=entry[1];
                  var count = news.filter(function(n){ return n.categoria===k; }).length;
                  return (
                    <div key={k} onClick={function(){ setTab(k); }} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #f5f5f5", cursor:"pointer" }}>
                      <span style={{ fontSize:13, color:"#333" }}>{m.emoji} {m.label}</span>
                      <span style={{ background:m.light, color:m.color, fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:10 }}>{count}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ background:"#fff", borderRadius:10, padding:"18px", border:"1px solid #e0e0e0", marginTop:16, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                  <div style={{ width:4, height:16, background:BRAND.red, borderRadius:2 }} />
                  <span style={{ fontWeight:800, fontSize:13, color:"#111" }}>Em Alta</span>
                </div>
                {news.slice(0,4).map(function(n,i){
                  var mm = META[n.categoria]||META.futebol;
                  return (
                    <div key={n.id} onClick={function(){ onArticle(n); }} style={{ display:"flex", gap:10, cursor:"pointer", padding:"9px 0", borderBottom:"1px solid #f5f5f5" }}>
                      <span style={{ fontSize:26, fontWeight:900, color:"#ebebeb", lineHeight:1, flexShrink:0, width:24, textAlign:"center" }}>{i+1}</span>
                      <div>
                        <div style={{ marginBottom:3 }}>
                          <span style={{ background:mm.color, color:"#fff", fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:2 }}>{mm.label}</span>
                        </div>
                        <div style={{ fontSize:12, fontWeight:700, color:"#111", lineHeight:1.35 }}>{n.titulo}</div>
                        <span style={{ fontSize:10, color:"#aaa" }}>● {timeAgo(n.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <AdSlot h={600} label="300x600" />
            </aside>
          </div>
        )}
      </div>

      <footer style={{ background:BRAND.black, borderTop:"3px solid "+BRAND.red, padding:"24px 20px", marginTop:40, textAlign:"center" }}>
        <div style={{ fontFamily:"'Arial Black','Arial',sans-serif", fontWeight:900, fontSize:18, color:"#fff", letterSpacing:-0.5, marginBottom:6 }}>
          RADAR <span style={{ color:BRAND.red }}>DA</span> BOLA
        </div>
        <p style={{ color:"rgba(255,255,255,0.25)", fontSize:12, margin:0 }}>2026 radardabola.com.br - Esportes em tempo real</p>
      </footer>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @media(max-width:768px){
          .rdb-main-grid{grid-template-columns:1fr !important;}
          .rdb-cards-grid{grid-template-columns:1fr 1fr !important; gap:12px !important;}
          .rdb-sidebar{display:none !important;}
          .rdb-hero{height:260px !important;}
          .rdb-hero-text{padding:16px !important;}
          .rdb-hero-title{font-size:18px !important;}
          .rdb-padding{padding:14px !important;}
          .rdb-copa{flex-direction:column !important; gap:8px !important; text-align:center;}
          .rdb-copa-timer{justify-content:center !important;}
          .rdb-ticker-label{display:none !important;}
          .rdb-nav{padding:0 14px !important;}
          .rdb-nav button{padding:10px 12px !important; font-size:12px !important;}
        }
        @media(max-width:480px){
          .rdb-cards-grid{grid-template-columns:1fr !important;}
        }
      `}</style>
    </div>
  );
}

export default function App() {
  var [article, setArticle] = useState(null);
  var [news, setNews]       = useState([]);
  useEffect(function(){
    supabase.from("noticias").select("*").order("created_at",{ascending:false}).limit(20).then(function(res){
      setNews(res.data||[]);
    });
  },[]);
  if(article) return <ArticlePage news={article} onBack={function(){ setArticle(null); }} allNews={news} />;
  return <HomePage onArticle={function(n){ setArticle(n); }} />;
}
