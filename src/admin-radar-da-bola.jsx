/* eslint-disable */
import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabaseClient";

const PASS = "radar2026";

// ── PALETA LIGHT (igual ao portal) ───────────────────────────────────────────
const C = {
  red:     "#e8002d",
  black:   "#0d0d0d",
  white:   "#ffffff",
  bg:      "#f5f5f5",
  card:    "#ffffff",
  border:  "#e0e0e0",
  text:    "#111111",
  muted:   "#888888",
  light:   "#f9f9f9",
};

const SPORT_META = {
  futebol:  { color:"#009c3b", light:"#e8f5ee", label:"FUTEBOL",   emoji:"⚽" },
  formula1: { color:"#e10600", light:"#fdecea", label:"FÓRMULA 1", emoji:"🏎️" },
  tenis:    { color:"#c8860a", light:"#fdf6e3", label:"TÊNIS",     emoji:"🎾" },
  basquete: { color:"#e65c00", light:"#fef3ea", label:"BASQUETE",  emoji:"🏀" },
};

const LEAGUE_OPTIONS = [
  { id:"brasileirao",   label:"Brasileirão Série A", emoji:"🇧🇷", color:"#009c3b" },
  { id:"brasileirao_b", label:"Brasileirão Série B", emoji:"🇧🇷", color:"#3aaa5c" },
  { id:"libertadores",  label:"Copa Libertadores",   emoji:"🌎",  color:"#f5a623" },
  { id:"sulamericana",  label:"Sul-Americana",        emoji:"🌎",  color:"#e65c00" },
  { id:"copa_brasil",   label:"Copa do Brasil",       emoji:"🏆",  color:"#009c3b" },
  { id:"cl",            label:"Champions League",     emoji:"🏆",  color:"#1a56db" },
  { id:"el",            label:"Europa League",        emoji:"🟠",  color:"#f97316" },
  { id:"laliga",        label:"La Liga",              emoji:"🇪🇸", color:"#e8002d" },
  { id:"seriea",        label:"Serie A",              emoji:"🇮🇹", color:"#0066cc" },
  { id:"bundesliga",    label:"Bundesliga",           emoji:"🇩🇪", color:"#d00000" },
  { id:"ligue1",        label:"Ligue 1",              emoji:"🇫🇷", color:"#001489" },
  { id:"premierleague", label:"Premier League",       emoji:"⚽",  color:"#3d0060" },
  { id:"primeiraliga",  label:"Primeira Liga",        emoji:"🇵🇹", color:"#006600" },
  { id:"worldcup",      label:"Copa do Mundo 2026",   emoji:"🌍",  color:"#c8860a" },
  { id:"copaamerica",   label:"Copa América",         emoji:"🌎",  color:"#f5a623" },
  { id:"formula1",      label:"Fórmula 1",            emoji:"🏎️", color:"#e10600" },
  { id:"ufc",           label:"UFC",                  emoji:"🥊",  color:"#d4000a" },
  { id:"bellator",      label:"Bellator",             emoji:"🥊",  color:"#ff6600" },
  { id:"nba",           label:"NBA",                  emoji:"🏀",  color:"#e65c00" },
  { id:"nfl",           label:"NFL",                  emoji:"🏈",  color:"#00338d" },
  { id:"tenis",         label:"Tênis",                emoji:"🎾",  color:"#c8860a" },
  { id:"outro",         label:"Outro",                emoji:"🏟️", color:"#888888" },
];

const STATUS_OPTS = [
  { id:"scheduled", label:"Agendado"  },
  { id:"live",      label:"Ao Vivo"   },
  { id:"finished",  label:"Encerrado" },
];

const IG_CFG = {
  posted:     { label:"Publicado",  color:"#009c3b", bg:"#e8f5ee", icon:"✓" },
  pending:    { label:"Na fila",    color:"#888888", bg:"#f5f5f5", icon:"○" },
  blocked:    { label:"Bloqueado",  color:"#e8002d", bg:"#fdecea", icon:"✕" },
  generating: { label:"Gerando…",  color:"#1a56db", bg:"#eef2ff", icon:"⟳" },
};

// ── DADOS INICIAIS ─────────────────────────────────────────────────────────────
const INIT_NEWS = [];
const _SAMPLE_NEWS = [
  { id:"f1", sport:"futebol",  minsAgo:40,  igStatus:"posted",
    title:"Palmeiras e Flamengo são campeões estaduais no maior fim de semana do futebol brasileiro",
    summary:"Palmeiras levou o Paulistão e Flamengo bateu o Fluminense nos pênaltis.",
    content:"O fim de semana ficará marcado. Palmeiras e Flamengo foram dois dos 13 clubes que levantaram taças estaduais.",
    img:"https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&q=80" },
  { id:"f2", sport:"futebol",  minsAgo:95,  igStatus:"posted",
    title:"Leonardo Jardim estreia no Flamengo com título carioca nos pênaltis contra o Fluminense",
    summary:"Técnico português assumiu o Mengão e na primeira decisão já levantou a taça.",
    content:"Leonardo Jardim não poderia ter pedido estreia melhor.",
    img:"https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=80" },
  { id:"r1", sport:"formula1", minsAgo:28,  igStatus:"posted",
    title:"Russell vence GP da Austrália e Mercedes domina abertura da nova era da F1 2026",
    summary:"Dobradinha da Mercedes em Melbourne.",
    content:"A Fórmula 1 iniciou sua nova era regulamentar em Melbourne com Mercedes dominando.",
    img:"https://images.unsplash.com/photo-1518364538800-6bae3c2ea0f2?w=900&q=80" },
  { id:"t1", sport:"tenis",    minsAgo:15,  igStatus:"pending",
    title:"HOJE ÀS 22H: João Fonseca enfrenta Sinner pelas oitavas de Indian Wells",
    summary:"O prodígio carioca de 19 anos faz história ao chegar às oitavas pela primeira vez.",
    content:"João Fonseca chegou às oitavas de Indian Wells pela primeira vez.",
    img:"https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&q=80" },
  { id:"b1", sport:"basquete", minsAgo:18,  igStatus:"posted",
    title:"SGA iguala Wilt Chamberlain com 126 jogos seguidos acima de 20 pontos na NBA",
    summary:"Astro do Thunder empatou recorde mítico com game-winner.",
    content:"Shai Gilgeous-Alexander igualou Wilt Chamberlain.",
    img:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80" },
];

const INIT_GAMES = [];
const _SAMPLE_GAMES = [
  { id:"br1",  leagueId:"brasileirao",  league:"Brasileirão Série A", leagueEmoji:"🇧🇷", leagueColor:"#009c3b", home:"Flamengo",        away:"Botafogo",            time:"16h00", status:"scheduled", probHome:48.2, probDraw:26.7, probAway:25.1 },
  { id:"br2",  leagueId:"brasileirao",  league:"Brasileirão Série A", leagueEmoji:"🇧🇷", leagueColor:"#009c3b", home:"Palmeiras",       away:"Corinthians",         time:"18h30", status:"scheduled", probHome:54.3, probDraw:25.3, probAway:20.4 },
  { id:"br3",  leagueId:"brasileirao",  league:"Brasileirão Série A", leagueEmoji:"🇧🇷", leagueColor:"#009c3b", home:"São Paulo",       away:"Grêmio",              time:"20h00", status:"scheduled", probHome:42.1, probDraw:27.4, probAway:30.5 },
  { id:"lib1", leagueId:"libertadores", league:"Copa Libertadores",   leagueEmoji:"🌎",  leagueColor:"#f5a623", home:"Fluminense",      away:"LDU Quito",           time:"19h00", status:"scheduled", probHome:52.4, probDraw:24.0, probAway:23.6 },
  { id:"cl1",  leagueId:"cl",           league:"Champions League",    leagueEmoji:"🏆",  leagueColor:"#1a56db", home:"Bayer Leverkusen",away:"Arsenal FC",          time:"14h45", status:"scheduled", probHome:14.5, probDraw:20.9, probAway:64.6 },
  { id:"cl2",  leagueId:"cl",           league:"Champions League",    leagueEmoji:"🏆",  leagueColor:"#1a56db", home:"Real Madrid",     away:"Man. City",           time:"17h00", status:"scheduled", probHome:26.9, probDraw:25.2, probAway:47.9 },
  { id:"nba1", leagueId:"nba",          league:"NBA",                 leagueEmoji:"🏀",  leagueColor:"#e65c00", home:"Orlando Magic",   away:"Cleveland Cavaliers", time:"20h30", status:"scheduled", probHome:40.6, probDraw:0,    probAway:59.4 },
  { id:"nba2", leagueId:"nba",          league:"NBA",                 leagueEmoji:"🏀",  leagueColor:"#e65c00", home:"Utah Jazz",       away:"New York Knicks",     time:"22h00", status:"scheduled", probHome:13.7, probDraw:0,    probAway:86.3 },
];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,5); }
function timeAgo(m) { return m<60?`${m}min atrás`:m<1440?`${Math.floor(m/60)}h atrás`:`${Math.floor(m/1440)}d atrás`; }

// ── COMPONENTES BASE ──────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ fontSize:10, fontWeight:700, color:C.muted, letterSpacing:0.8, marginBottom:5 }}>{label}</div>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type="text", multiline, rows=3 }) {
  const base = { width:"100%", background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:"9px 12px", fontSize:13, color:C.text, outline:"none", fontFamily:"Arial,sans-serif", boxSizing:"border-box" };
  return multiline
    ? <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder} style={{...base,resize:"vertical"}} onFocus={e=>e.target.style.borderColor=C.red} onBlur={e=>e.target.style.borderColor=C.border} />
    : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{...base,height:38}} onFocus={e=>e.target.style.borderColor=C.red} onBlur={e=>e.target.style.borderColor=C.border} />;
}

function Chip({ active, color, onClick, children }) {
  return (
    <button onClick={onClick} style={{ background:active?color:"#f5f5f5", color:active?"#fff":"#666", border:`1px solid ${active?color:C.border}`, borderRadius:5, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}>
      {children}
    </button>
  );
}

function SectionHead({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
      <div style={{ width:4, height:16, background:C.red, borderRadius:2 }} />
      <span style={{ fontWeight:800, fontSize:13, color:C.text }}>{label}</span>
    </div>
  );
}

// ── MODAL EDITAR NOTÍCIA ──────────────────────────────────────────────────────
function EditNewsModal({ news, onSave, onClose }) {
  const [title,   setTitle]   = useState(news.title);
  const [summary, setSummary] = useState(news.summary);
  const [content, setContent] = useState(news.content);
  const [img,     setImg]     = useState(news.img);
  const [sport,   setSport]   = useState(news.sport);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:10, maxWidth:640, width:"100%", border:`1px solid ${C.border}`, boxShadow:"0 8px 40px rgba(0,0,0,0.12)", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ padding:"14px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:C.white }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:3, height:18, background:C.red, borderRadius:2 }} />
            <span style={{ fontWeight:700, fontSize:14, color:C.text }}>Editar notícia</span>
          </div>
          <button onClick={onClose} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:4, color:C.muted, cursor:"pointer", padding:"4px 12px", fontSize:13 }}>✕</button>
        </div>
        <div style={{ padding:24 }}>
          <Field label="MODALIDADE">
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {Object.entries(SPORT_META).map(([k,m])=>(
                <Chip key={k} active={sport===k} color={m.color} onClick={()=>setSport(k)}>{m.emoji} {m.label}</Chip>
              ))}
            </div>
          </Field>
          <Field label="TÍTULO"><TextInput value={title} onChange={setTitle} /></Field>
          <Field label="RESUMO"><TextInput value={summary} onChange={setSummary} multiline rows={2} /></Field>
          <Field label="TEXTO COMPLETO"><TextInput value={content} onChange={setContent} multiline rows={5} /></Field>
          <Field label="IMAGEM (URL)">
            <TextInput value={img} onChange={setImg} placeholder="https://images.unsplash.com/..." />
            {img && <div style={{ marginTop:6, borderRadius:6, overflow:"hidden", height:90 }}><img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} /></div>}
          </Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:16, borderTop:`1px solid ${C.border}` }}>
            <button onClick={onClose} style={{ background:"#f5f5f5", color:"#666", border:`1px solid ${C.border}`, borderRadius:6, padding:"9px 18px", fontSize:13, cursor:"pointer" }}>Cancelar</button>
            <button onClick={()=>onSave({title,summary,content,img,sport})} style={{ background:C.red, color:"#fff", border:"none", borderRadius:6, padding:"9px 22px", fontSize:13, fontWeight:700, cursor:"pointer" }}>✓ Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MODAL EDITAR JOGO ─────────────────────────────────────────────────────────
function EditGameModal({ game, onSave, onClose }) {
  const isNew = !game.id;
  const [leagueId,  setLeagueId]  = useState(game.leagueId  || "brasileirao");
  const [home,      setHome]      = useState(game.home      || "");
  const [away,      setAway]      = useState(game.away      || "");
  const [time,      setTime]      = useState(game.time      || "");
  const [status,    setStatus]    = useState(game.status    || "scheduled");
  const [scoreHome, setScoreHome] = useState(game.scoreHome ?? "");
  const [scoreAway, setScoreAway] = useState(game.scoreAway ?? "");
  const [probHome,  setProbHome]  = useState(game.probHome  ?? "");
  const [probDraw,  setProbDraw]  = useState(game.probDraw  ?? "");
  const [probAway,  setProbAway]  = useState(game.probAway  ?? "");
  const [extra,     setExtra]     = useState(game.extra     || "");
  const league = LEAGUE_OPTIONS.find(l=>l.id===leagueId) || LEAGUE_OPTIONS[0];

  const handleSave = () => {
    if (!home.trim()||!away.trim()) return alert("Preencha os times.");
    onSave({ id:game.id||uid(), leagueId, league:league.label, leagueEmoji:league.emoji, leagueColor:league.color,
      home:home.trim(), away:away.trim(), time:time.trim()||"--", status,
      scoreHome: scoreHome!==""?Number(scoreHome):undefined,
      scoreAway: scoreAway!==""?Number(scoreAway):undefined,
      probHome:  probHome !==""?Number(probHome) :undefined,
      probDraw:  probDraw !==""?Number(probDraw) :undefined,
      probAway:  probAway !==""?Number(probAway) :undefined,
      extra: extra.trim()||undefined,
    });
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.white, borderRadius:10, maxWidth:580, width:"100%", border:`1px solid ${C.border}`, boxShadow:"0 8px 40px rgba(0,0,0,0.12)", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ padding:"14px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:C.white }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:3, height:18, background:C.red, borderRadius:2 }} />
            <span style={{ fontWeight:700, fontSize:14, color:C.text }}>{isNew?"Adicionar jogo":"Editar jogo"}</span>
          </div>
          <button onClick={onClose} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:4, color:C.muted, cursor:"pointer", padding:"4px 12px", fontSize:13 }}>✕</button>
        </div>
        <div style={{ padding:24 }}>
          <Field label="COMPETIÇÃO">
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {LEAGUE_OPTIONS.map(l=>(
                <Chip key={l.id} active={leagueId===l.id} color={l.color} onClick={()=>setLeagueId(l.id)}>{l.emoji} {l.label}</Chip>
              ))}
            </div>
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="TIME DA CASA"><TextInput value={home} onChange={setHome} placeholder="Ex: Flamengo" /></Field>
            <Field label="TIME VISITANTE"><TextInput value={away} onChange={setAway} placeholder="Ex: Botafogo" /></Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="HORÁRIO (Brasília)"><TextInput value={time} onChange={setTime} placeholder="Ex: 21h00" /></Field>
            <Field label="STATUS">
              <div style={{ display:"flex", gap:6 }}>
                {STATUS_OPTS.map(s=>(
                  <Chip key={s.id} active={status===s.id} color={s.id==="live"?C.red:C.black} onClick={()=>setStatus(s.id)}>
                    {s.id==="live"?"● ":""}{s.label}
                  </Chip>
                ))}
              </div>
            </Field>
          </div>
          {(status==="live"||status==="finished") && (
            <Field label="PLACAR">
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:8, alignItems:"center" }}>
                <input type="number" value={scoreHome} onChange={e=>setScoreHome(e.target.value)} min="0" placeholder="0"
                  style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:10, fontSize:22, fontWeight:900, color:C.text, textAlign:"center", outline:"none", width:"100%", boxSizing:"border-box" }} />
                <span style={{ color:C.muted, fontWeight:900, fontSize:20, textAlign:"center" }}>–</span>
                <input type="number" value={scoreAway} onChange={e=>setScoreAway(e.target.value)} min="0" placeholder="0"
                  style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:10, fontSize:22, fontWeight:900, color:C.text, textAlign:"center", outline:"none", width:"100%", boxSizing:"border-box" }} />
              </div>
            </Field>
          )}
          <Field label="PROBABILIDADES (%) — opcional">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[["Casa",probHome,setProbHome],["Empate",probDraw,setProbDraw],["Visitante",probAway,setProbAway]].map(([lbl,val,set])=>(
                <div key={lbl}>
                  <div style={{ fontSize:9, color:C.muted, marginBottom:4, textAlign:"center" }}>{lbl}</div>
                  <input type="number" value={val} onChange={e=>set(e.target.value)} placeholder="—" min="0" max="100" step="0.1"
                    style={{ width:"100%", background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px", fontSize:13, fontWeight:700, color:C.text, outline:"none", textAlign:"center", boxSizing:"border-box" }} />
                </div>
              ))}
            </div>
          </Field>
          <Field label="INFO EXTRA (opcional)"><TextInput value={extra} onChange={setExtra} placeholder="Ex: Oitavas de Final" /></Field>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:16, borderTop:`1px solid ${C.border}` }}>
            <button onClick={onClose} style={{ background:"#f5f5f5", color:"#666", border:`1px solid ${C.border}`, borderRadius:6, padding:"9px 18px", fontSize:13, cursor:"pointer" }}>Cancelar</button>
            <button onClick={handleSave} style={{ background:C.red, color:"#fff", border:"none", borderRadius:6, padding:"9px 22px", fontSize:13, fontWeight:700, cursor:"pointer" }}>✓ Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ABA NOTÍCIAS ──────────────────────────────────────────────────────────────
function NewsTab({ news, setNews, showToast }) {
  const [editing, setEditing] = useState(null);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");
  const [posting, setPosting] = useState(null);

  const saveEdit = async (id, f) => {
    try {
      const { error } = await supabase.from("noticias").update({
        titulo:     f.title || f.titulo,
        subtitulo:  f.summary || f.subtitulo,
        conteudo:   f.content || f.conteudo,
        imagem_url: f.img || f.imagem_url,
        categoria:  f.sport || f.categoria,
      }).eq("id", id);
      if (error) throw error;
      setNews(n=>n.map(x=>x.id===id?{...x,...f}:x));
      setEditing(null);
      showToast("✓ Notícia atualizada!");
    } catch(e) {
      showToast("Erro ao salvar: " + e.message, false);
    }
  };
  const toggleBlock = (id) => {
    const n = news.find(x=>x.id===id);
    const block = n.igStatus!=="blocked";
    setNews(prev=>prev.map(x=>x.id===id?{...x,igStatus:block?"blocked":"pending"}:x));
    showToast(block?"🚫 Post bloqueado.":"✓ Post desbloqueado.", !block);
  };
  const simulatePost = (id) => {
    if(posting) return;
    setPosting(id);
    setNews(n=>n.map(x=>x.id===id?{...x,igStatus:"generating"}:x));
    setTimeout(()=>{ setNews(n=>n.map(x=>x.id===id?{...x,igStatus:"posted"}:x)); setPosting(null); showToast("✓ Publicado no Instagram!"); }, 2200);
  };
  const deleteNews = async (id) => {
    if(!window.confirm("Remover esta notícia?")) return;
    try {
      const { error } = await supabase.from("noticias").delete().eq("id", id);
      if (error) throw error;
      setNews(n=>n.filter(x=>x.id!==id));
      showToast("Notícia removida.", false);
    } catch(e) {
      showToast("Erro ao remover: " + e.message, false);
    }
  };

  const filtered = news.filter(n=>filter==="all"||n.sport===filter).filter(n=>!search||n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {editing && <EditNewsModal news={editing} onSave={f=>saveEdit(editing.id,f)} onClose={()=>setEditing(null)} />}

      {/* Toolbar */}
      <div style={{ background:C.card, borderRadius:8, padding:"12px 16px", border:`1px solid ${C.border}`, marginBottom:14, display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {[["all","Todas"],["futebol","⚽ Futebol"],["formula1","🏎️ F1"],["tenis","🎾 Tênis"],["basquete","🏀 Basquete"]].map(([v,l])=>(
            <Chip key={v} active={filter===v} color={C.red} onClick={()=>setFilter(v)}>{l}</Chip>
          ))}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar título..."
          style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 12px", fontSize:13, color:C.text, outline:"none", minWidth:160 }} />
        <span style={{ fontSize:12, color:C.muted }}>{filtered.length} notícia{filtered.length!==1?"s":""}</span>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.length===0 && (
          <div style={{ background:C.card, borderRadius:8, padding:40, textAlign:"center", color:C.muted, border:`1px solid ${C.border}` }}>Nenhuma notícia encontrada.</div>
        )}
        {filtered.map(n=>{
          const m  = SPORT_META[n.sport];
          const ig = IG_CFG[n.igStatus]||IG_CFG.pending;
          const isBlocked = n.igStatus==="blocked";
          const isGen     = n.igStatus==="generating";
          return (
            <div key={n.id} style={{ background:C.card, borderRadius:8, border:`1px solid ${isBlocked?"#fca5a5":C.border}`, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ height:3, background:m.color }} />
              <div style={{ display:"flex" }}>
                {/* Thumb */}
                <div style={{ width:88, flexShrink:0, background:m.light, position:"relative", overflow:"hidden" }}>
                  <img src={n.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:isBlocked?0.4:1 }} onError={e=>e.target.style.display="none"} />
                  {isBlocked && <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🚫</div>}
                </div>
                {/* Corpo */}
                <div style={{ flex:1, padding:"12px 16px", minWidth:0 }}>
                  <div style={{ display:"flex", gap:8, marginBottom:6, alignItems:"center", flexWrap:"wrap" }}>
                    <span style={{ background:m.color, color:"#fff", fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:3 }}>{m.emoji} {m.label}</span>
                    <span style={{ background:ig.bg, color:ig.color, fontSize:10, fontWeight:600, padding:"2px 9px", borderRadius:20 }}>
                      {isGen?"⟳ Gerando…":`${ig.icon} ${ig.label}`}
                    </span>
                    <span style={{ color:C.muted, fontSize:11, marginLeft:"auto" }}>{timeAgo(n.minsAgo)}</span>
                  </div>
                  <h3 style={{ margin:"0 0 4px", fontSize:13, fontWeight:700, color:isBlocked?C.muted:C.text, lineHeight:1.35, textDecoration:isBlocked?"line-through":"none" }}>{n.title}</h3>
                  <p style={{ margin:0, fontSize:11, color:C.muted, lineHeight:1.5 }}>{n.summary}</p>
                </div>
                {/* Ações */}
                <div style={{ display:"flex", flexDirection:"column", gap:6, padding:"12px 14px", borderLeft:`1px solid ${C.border}`, flexShrink:0, justifyContent:"center" }}>
                  <button onClick={()=>setEditing(n)} style={{ background:"#eff6ff", color:"#1d4ed8", border:"none", borderRadius:6, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>✏️ Editar</button>
                  <button onClick={()=>toggleBlock(n.id)} style={{ background:isBlocked?"#f0fdf4":"#fef2f2", color:isBlocked?"#16a34a":"#dc2626", border:"none", borderRadius:6, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                    {isBlocked?"✓ Desbloquear":"🚫 Bloquear IG"}
                  </button>
                  {n.igStatus==="pending" && (
                    <button onClick={()=>simulatePost(n.id)} disabled={!!posting} style={{ background:C.red, color:"#fff", border:"none", borderRadius:6, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:posting?"not-allowed":"pointer", opacity:posting?.6:1, whiteSpace:"nowrap" }}>▶ Postar</button>
                  )}
                  <button onClick={()=>deleteNews(n.id)} style={{ background:"#f5f5f5", color:C.muted, border:"none", borderRadius:6, padding:"7px 14px", fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>🗑 Remover</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ABA JOGOS ─────────────────────────────────────────────────────────────────
const CSV_TEMPLATE = `league,home,away,time,status,scoreHome,scoreAway,probHome,probDraw,probAway,extra
Brasileirão Série A,Flamengo,Botafogo,21h00,scheduled,,,48,27,25,
Copa Libertadores,Fluminense,LDU Quito,19h00,scheduled,,,52,24,24,
Champions League,Real Madrid,Man. City,17h00,scheduled,,,27,25,48,
NBA,Lakers,Celtics,22h30,scheduled,,,45,,55,`;

function GamesTab({ games, setGames, showToast }) {
  const [editingGame,  setEditingGame]  = useState(null);
  const [filterLeague, setFilterLeague] = useState("all");
  const [csvError,     setCsvError]     = useState(null);
  const [csvPreview,   setCsvPreview]   = useState(null);
  const fileRef = useRef();

  const leagues  = [...new Set(games.map(g=>g.leagueId))];
  const filtered = filterLeague==="all" ? games : games.filter(g=>g.leagueId===filterLeague);

  const saveGame = (g) => {
    setGames(prev=>{ const i=prev.findIndex(x=>x.id===g.id); if(i>=0){const n=[...prev];n[i]=g;return n;} return [...prev,g]; });
    setEditingGame(null); showToast("✓ Jogo salvo!");
  };
  const deleteGame = (id) => { if(!window.confirm("Remover este jogo?")) return; setGames(prev=>prev.filter(x=>x.id!==id)); showToast("Jogo removido.", false); };

  const downloadTemplate = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([CSV_TEMPLATE],{type:"text/csv"}));
    a.download = "jogos-template.csv"; a.click();
  };

  const parseCSV = (text) => {
    const lines = text.trim().split("\n").filter(l=>l.trim());
    if(lines.length<2) return { error:"CSV precisa de cabeçalho + ao menos 1 linha." };
    const headers = lines[0].split(",").map(h=>h.trim().toLowerCase());
    const missing = ["league","home","away","time","status"].filter(r=>!headers.includes(r));
    if(missing.length) return { error:`Colunas faltando: ${missing.join(", ")}` };
    const rows = [];
    for(let i=1;i<lines.length;i++){
      const vals = lines[i].split(",").map(v=>v.trim());
      if(vals.length<3) continue;
      const get = k => vals[headers.indexOf(k)]||"";
      const ln  = get("league");
      const opt = LEAGUE_OPTIONS.find(l=>l.label.toLowerCase()===ln.toLowerCase()) || LEAGUE_OPTIONS[LEAGUE_OPTIONS.length-1];
      rows.push({ id:uid(), league:ln||opt.label, leagueId:opt.id, leagueEmoji:opt.emoji, leagueColor:opt.color,
        home:get("home"), away:get("away"), time:get("time")||"--",
        status:["scheduled","live","finished"].includes(get("status"))?get("status"):"scheduled",
        scoreHome: get("scorehome")!==""?Number(get("scorehome")):undefined,
        scoreAway: get("scoreaway")!==""?Number(get("scoreaway")):undefined,
        probHome:  get("probhome") !==""?Number(get("probhome")) :undefined,
        probDraw:  get("probdraw") !==""?Number(get("probdraw")) :undefined,
        probAway:  get("probaway") !==""?Number(get("probaway")) :undefined,
        extra:     get("extra")||undefined,
      });
    }
    return { rows };
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    if(!file.name.endsWith(".csv")){ setCsvError("Selecione um arquivo .csv"); return; }
    const r = new FileReader();
    r.onload = ev => { const res=parseCSV(ev.target.result); if(res.error){setCsvError(res.error);setCsvPreview(null);}else{setCsvError(null);setCsvPreview(res.rows);} };
    r.readAsText(file); e.target.value="";
  };

  const confirmImport = (replace) => {
    if(!csvPreview) return;
    setGames(prev => replace ? csvPreview : [...prev,...csvPreview]);
    showToast(`✓ ${csvPreview.length} jogos importados!`);
    setCsvPreview(null);
  };

  const stColor = { scheduled:C.muted, live:C.red, finished:"#444" };
  const stLabel = { scheduled:"Agendado", live:"● Ao Vivo", finished:"Encerrado" };

  return (
    <div>
      {editingGame && <EditGameModal game={editingGame} onSave={saveGame} onClose={()=>setEditingGame(null)} />}

      {/* Preview CSV */}
      {csvPreview && (
        <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:8, padding:16, marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ fontWeight:700, fontSize:13, color:"#16a34a" }}>✓ {csvPreview.length} jogo{csvPreview.length!==1?"s":""} lido{csvPreview.length!==1?"s":""} — confirmar importação?</span>
            <button onClick={()=>setCsvPreview(null)} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:16 }}>✕</button>
          </div>
          <div style={{ maxHeight:180, overflowY:"auto", marginBottom:12 }}>
            {csvPreview.map((g,i)=>(
              <div key={i} style={{ display:"flex", gap:10, padding:"6px 0", borderBottom:"1px solid #dcfce7", fontSize:12, color:C.text, alignItems:"center" }}>
                <span>{g.leagueEmoji}</span>
                <span style={{ flex:1, fontWeight:700 }}>{g.home}</span>
                <span style={{ color:C.muted, fontSize:11 }}>{g.time}</span>
                <span style={{ flex:1, fontWeight:700, textAlign:"right" }}>{g.away}</span>
                <span style={{ fontSize:10, color:stColor[g.status], width:72, textAlign:"right" }}>{stLabel[g.status]}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>confirmImport(false)} style={{ flex:1, background:"#16a34a", color:"#fff", border:"none", borderRadius:6, padding:9, fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Adicionar aos existentes</button>
            <button onClick={()=>confirmImport(true)}  style={{ flex:1, background:C.red,     color:"#fff", border:"none", borderRadius:6, padding:9, fontSize:12, fontWeight:700, cursor:"pointer" }}>↺ Substituir todos</button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ background:C.card, borderRadius:8, padding:"12px 16px", border:`1px solid ${C.border}`, marginBottom:12, display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          <Chip active={filterLeague==="all"} color={C.red} onClick={()=>setFilterLeague("all")}>Todas</Chip>
          {leagues.map(lid=>{
            const opt = LEAGUE_OPTIONS.find(l=>l.id===lid);
            return opt ? <Chip key={lid} active={filterLeague===lid} color={opt.color} onClick={()=>setFilterLeague(lid)}>{opt.emoji} {opt.label}</Chip> : null;
          })}
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display:"none" }} />
          <button onClick={downloadTemplate} style={{ background:"#eff6ff", color:"#1d4ed8", border:"1px solid #bfdbfe", borderRadius:6, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>↓ Template CSV</button>
          <button onClick={()=>fileRef.current?.click()} style={{ background:"#f0fdf4", color:"#16a34a", border:"1px solid #bbf7d0", borderRadius:6, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>📂 Upload CSV</button>
          <button onClick={()=>setEditingGame({})} style={{ background:C.red, color:"#fff", border:"none", borderRadius:6, padding:"7px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Adicionar jogo</button>
        </div>
      </div>

      {csvError && <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:6, padding:"9px 14px", marginBottom:10, fontSize:12, color:"#dc2626" }}>⚠️ {csvError}</div>}

      {/* Dica CSV */}
      <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:8, padding:"10px 14px", marginBottom:12, fontSize:11, color:"#475569", lineHeight:1.8 }}>
        <strong style={{ color:"#1d4ed8" }}>📋 CSV:</strong> Baixe o template, preencha no Excel/Google Planilhas e faça upload.
        Colunas: <code>league, home, away, time, status, scoreHome, scoreAway, probHome, probDraw, probAway, extra</code>.
        Ligas: Brasileirão Série A, Copa Libertadores, La Liga, Serie A, Bundesliga, Ligue 1, Primeira Liga, Champions League, Fórmula 1, UFC, NBA…
      </div>

      {/* Lista */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.length===0 && (
          <div style={{ background:C.card, borderRadius:8, padding:40, textAlign:"center", color:C.muted, border:`1px solid ${C.border}` }}>Nenhum jogo encontrado.</div>
        )}
        {filtered.map(g=>(
          <div key={g.id} style={{ background:C.card, borderRadius:8, border:`1px solid ${C.border}`, padding:"11px 16px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ width:4, height:38, borderRadius:4, background:g.leagueColor, flexShrink:0 }} />
            <div style={{ width:130, flexShrink:0 }}>
              <div style={{ fontSize:11, fontWeight:700, color:g.leagueColor }}>{g.leagueEmoji} {g.league}</div>
              <div style={{ fontSize:10, color:stColor[g.status], marginTop:2 }}>{stLabel[g.status]}</div>
            </div>
            <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:8, alignItems:"center", minWidth:0 }}>
              <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{g.home}</span>
              <div style={{ textAlign:"center", minWidth:80 }}>
                {(g.status==="live"||g.status==="finished")&&g.scoreHome!==undefined
                  ? <span style={{ fontSize:16, fontWeight:900, color:C.text }}>{g.scoreHome} – {g.scoreAway}</span>
                  : <div>
                      <div style={{ fontSize:12, color:C.muted, fontWeight:600 }}>{g.time}</div>
                      <div style={{ fontSize:10, color:"#ccc" }}>×</div>
                    </div>
                }
                {g.status==="live" && <div style={{ fontSize:9, color:C.red, fontWeight:700 }}>● AO VIVO</div>}
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:C.text, textAlign:"right" }}>{g.away}</span>
            </div>
            {g.probHome!==undefined && (
              <div style={{ width:90, flexShrink:0, fontSize:10, color:C.muted, textAlign:"center" }}>
                <div style={{ display:"flex", height:4, borderRadius:3, overflow:"hidden", gap:1, marginBottom:2 }}>
                  <div style={{ width:`${g.probHome}%`, background:g.leagueColor, opacity:0.7 }} />
                  {g.probDraw>0 && <div style={{ width:`${g.probDraw}%`, background:"#ccc" }} />}
                  <div style={{ width:`${g.probAway}%`, background:"#ddd" }} />
                </div>
                <span>{Math.round(g.probHome)}% – {Math.round(g.probAway)}%</span>
              </div>
            )}
            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
              <button onClick={()=>setEditingGame(g)} style={{ background:"#eff6ff", color:"#1d4ed8", border:"none", borderRadius:5, padding:"6px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>✏️</button>
              <button onClick={()=>deleteGame(g.id)}   style={{ background:"#f5f5f5", color:C.muted,   border:"none", borderRadius:5, padding:"6px 12px", fontSize:12, cursor:"pointer" }}>🗑</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:12, fontSize:11, color:C.muted }}>{games.length} jogo{games.length!==1?"s":""} · Exibindo: {filtered.length}</div>
    </div>
  );
}

// ── PAINEL PRINCIPAL ──────────────────────────────────────────────────────────
function AdminPanel({ onLogout }) {
  const [tab,      setTab]     = useState("noticias");
  const [news,     setNews]    = useState(INIT_NEWS);
  const [games,    setGames]   = useState(INIT_GAMES);
  const [toast,    setToast]   = useState(null);
  const [loading,  setLoading] = useState(true);

  const showToast = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  // Carregar dados do Supabase
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: noticias } = await supabase
          .from("noticias")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (noticias) {
          // Converter formato Supabase para formato do admin
          setNews(noticias.map(n => ({
            id:       n.id,
            sport:    n.categoria,
            minsAgo:  Math.floor((Date.now() - new Date(n.created_at)) / 60000),
            igStatus: "pending",
            title:    n.titulo,
            titulo:   n.titulo,
            summary:  n.subtitulo,
            subtitulo:n.subtitulo,
            content:  n.conteudo,
            conteudo: n.conteudo,
            img:      n.imagem_url,
            imagem_url:n.imagem_url,
          })));
        }

        const hoje = new Date().toISOString().split("T")[0];
        const { data: jogos } = await supabase
          .from("jogos")
          .select("*")
          .eq("data_jogo", hoje)
          .order("time");

        if (jogos) setGames(jogos);
      } catch(e) {
        console.error("Erro ao carregar dados:", e);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const sn = { total:news.length, posted:news.filter(n=>n.igStatus==="posted").length, pending:news.filter(n=>n.igStatus==="pending").length, blocked:news.filter(n=>n.igStatus==="blocked").length };
  const sg = { total:games.length, live:games.filter(g=>g.status==="live").length, finished:games.filter(g=>g.status==="finished").length, ligas:[...new Set(games.map(g=>g.leagueId))].length };

  const statItems = tab==="noticias"
    ? [{ label:"Notícias",      value:sn.total,   color:"#1d4ed8" },{ label:"Publicados IG", value:sn.posted,  color:"#16a34a" },{ label:"Na fila",       value:sn.pending, color:C.muted },{ label:"Bloqueados",    value:sn.blocked, color:C.red }]
    : [{ label:"Jogos hoje",    value:sg.total,   color:"#1d4ed8" },{ label:"Ao vivo",       value:sg.live,    color:C.red     },{ label:"Encerrados",    value:sg.finished,color:C.muted },{ label:"Ligas",         value:sg.ligas,   color:"#c8860a"}];

  return (
    <div style={{ fontFamily:"'Arial','Helvetica',sans-serif", background:C.bg, minHeight:"100vh", color:C.text }}>
      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:999, background:toast.ok?"#16a34a":C.red, color:"#fff", borderRadius:8, padding:"12px 20px", fontSize:13, fontWeight:700, boxShadow:"0 4px 20px rgba(0,0,0,0.15)", animation:"fadeIn 0.25s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* Header — mesmo estilo do portal */}
      <header style={{ background:C.black, borderBottom:`3px solid ${C.red}`, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:18 }}>📡</span>
            <div style={{ fontFamily:"'Arial Black','Arial',sans-serif", fontWeight:900, fontSize:18, color:"#fff", letterSpacing:-0.5 }}>
              RADAR <span style={{ color:C.red }}>DA</span> BOLA
              <span style={{ fontSize:10, fontWeight:600, color:C.red, marginLeft:8, background:"rgba(232,0,45,0.15)", padding:"2px 7px", borderRadius:4 }}>ADMIN</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>Terça, 11 mar 2026</span>
            <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:6, padding:"6px 14px", fontSize:12, color:"rgba(255,255,255,0.6)", cursor:"pointer" }}>Sair</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px" }}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
          {statItems.map(st=>(
            <div key={st.label} style={{ background:C.card, borderRadius:8, padding:"14px 18px", border:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:11, color:C.muted }}>{st.label}</div>
              <div style={{ fontSize:28, fontWeight:800, color:st.color }}>{st.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, marginBottom:20, background:C.card, borderRadius:"8px 8px 0 0", padding:"0 4px" }}>
          {[{ id:"noticias", label:"📰 Notícias", count:news.length },{ id:"jogos", label:"🏟️ Jogos de Hoje", count:games.length }].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              background:"none", border:"none",
              borderBottom: tab===t.id ? `2px solid ${C.red}` : "2px solid transparent",
              color: tab===t.id ? C.text : C.muted,
              padding:"12px 20px", fontSize:13, fontWeight: tab===t.id?700:400,
              cursor:"pointer", transition:"all 0.15s",
            }}>
              {t.label}
              <span style={{ marginLeft:6, background: tab===t.id?"#fdecea":"#f5f5f5", color: tab===t.id?C.red:C.muted, fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:10 }}>{t.count}</span>
            </button>
          ))}
        </div>

        {tab==="noticias"
          ? <NewsTab  news={news}   setNews={setNews}   showToast={showToast} />
          : <GamesTab games={games} setGames={setGames} showToast={showToast} />
        }
      </div>

      <footer style={{ background:C.black, borderTop:`3px solid ${C.red}`, padding:"16px 20px", marginTop:40, textAlign:"center" }}>
        <p style={{ color:"rgba(255,255,255,0.25)", fontSize:11, margin:0 }}>© 2026 radardabola.com.br · Painel Administrativo</p>
      </footer>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw,   setPw]   = useState("");
  const [err,  setErr]  = useState(false);
  const [show, setShow] = useState(false);
  const handle = () => pw===PASS ? onLogin() : (setErr(true), setTimeout(()=>setErr(false),2000));
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Arial','Helvetica',sans-serif" }}>
      <div style={{ background:C.card, borderRadius:12, padding:"40px 36px", width:360, border:`1px solid ${C.border}`, boxShadow:"0 8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          {/* Mini header igual portal */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.black, borderRadius:8, padding:"8px 18px", marginBottom:16 }}>
            <span style={{ fontSize:16 }}>📡</span>
            <span style={{ fontFamily:"'Arial Black','Arial',sans-serif", fontWeight:900, fontSize:16, color:"#fff", letterSpacing:-0.5 }}>
              RADAR <span style={{ color:C.red }}>DA</span> BOLA
            </span>
          </div>
          <div style={{ fontSize:12, color:C.muted, letterSpacing:1 }}>PAINEL ADMINISTRATIVO</div>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, letterSpacing:0.8, marginBottom:6 }}>SENHA DE ACESSO</div>
          <div style={{ position:"relative" }}>
            <input type={show?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="Digite sua senha..."
              style={{ width:"100%", background:C.bg, border:`1px solid ${err?C.red:C.border}`, borderRadius:6, padding:"11px 40px 11px 12px", fontSize:14, color:C.text, outline:"none", boxSizing:"border-box" }} />
            <button onClick={()=>setShow(!show)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:16 }}>{show?"🙈":"👁"}</button>
          </div>
          {err && <div style={{ color:C.red, fontSize:12, marginTop:5 }}>Senha incorreta.</div>}
        </div>
        <button onClick={handle} style={{ width:"100%", background:C.red, color:"#fff", border:"none", borderRadius:6, padding:12, fontSize:14, fontWeight:700, cursor:"pointer" }}>Entrar</button>
        <div style={{ marginTop:14, fontSize:11, color:"#ccc", textAlign:"center" }}>radardabola.com.br © 2026</div>
      </div>
    </div>
  );
}

export default function App() {
  const [logged, setLogged] = useState(false);
  return logged ? <AdminPanel onLogout={()=>setLogged(false)} /> : <LoginScreen onLogin={()=>setLogged(true)} />;
}
