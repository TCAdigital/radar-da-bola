import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
//  SENHA DO PAINEL ADMIN
//  Troque para uma senha sua antes de publicar!
// ─────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = "arenanews2026";

const SPORTS = [
  { id: "all",      label: "Início"    },
  { id: "futebol",  label: "Futebol"   },
  { id: "formula1", label: "Fórmula 1" },
  { id: "tenis",    label: "Tênis"     },
  { id: "basquete", label: "Basquete"  },
];

const META = {
  futebol:  { color: "#009c3b", light: "#e8f5ee", label: "FUTEBOL"   },
  formula1: { color: "#e10600", light: "#fdecea", label: "FÓRMULA 1" },
  tenis:    { color: "#c8860a", light: "#fdf6e3", label: "TÊNIS"     },
  basquete: { color: "#e65c00", light: "#fef3ea", label: "BASQUETE"  },
};

const INITIAL_NEWS = [
  { id:"f1", sport:"futebol",  minsAgo:40,  title:"Palmeiras e Flamengo são campeões estaduais no maior fim de semana do futebol brasileiro", summary:"Palmeiras levou o Paulistão sobre o Novorizontino e Flamengo bateu o Fluminense nos pênaltis.", content:"O fim de semana de 8 de março ficará marcado no futebol brasileiro. Palmeiras e Flamengo foram dois dos 13 clubes que levantaram taças estaduais.\n\nO Verdão conquistou o Paulistão ao vencer o Novorizontino no Allianz Parque. Vitor Roque foi o grande nome da decisão.\n\nJá no Rio, a final do Carioca entre Fluminense e Flamengo foi até os pênaltis. O Mengão venceu com o técnico Leonardo Jardim comandando desde o banco.\n\nCom os estaduais encerrados, a atenção se volta para o início do Brasileirão.", readTime:"4 min", img:"https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&q=80" },
  { id:"f2", sport:"futebol",  minsAgo:95,  title:"Leonardo Jardim estreia no Flamengo com título carioca nos pênaltis contra o Fluminense", summary:"Técnico português assumiu o Mengão e na primeira decisão já levantou a taça.", content:"Leonardo Jardim não poderia ter pedido estreia melhor no Flamengo. O técnico português ganhou o Campeonato Carioca logo na primeira decisão.\n\nA final no Maracanã contra o Fluminense terminou empatada no tempo normal. Nos pênaltis, o Flamengo foi mais eficiente.\n\nJardim, com passagens por Monaco e grandes clubes europeus, demonstrou organização tática desde os primeiros treinos.", readTime:"3 min", img:"https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=80" },
  { id:"f3", sport:"futebol",  minsAgo:180, title:"Copa do Mundo 2026: Brasil inicia contagem regressiva para o torneio que volta às Américas", summary:"Com a Copa prevista para junho e julho nos EUA, Canadá e México, ingressos esgotam em tempo recorde.", content:"A contagem regressiva para a Copa do Mundo 2026 entra em fase decisiva. O torneio será disputado nos Estados Unidos, Canadá e México a partir de junho.\n\nOs jogos da Seleção Brasileira na fase de grupos estão previstos para acontecer nos Estados Unidos. A demanda por ingressos foi enorme.\n\nA Seleção encerrou a fase de qualificação com aproveitamento de 84%, liderando as Eliminatórias Sul-Americanas.", readTime:"4 min", img:"https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=80" },
  { id:"r1", sport:"formula1", minsAgo:28,  title:"Russell vence GP da Austrália e Mercedes domina abertura da nova era da F1 2026", summary:"Dobradinha da Mercedes em Melbourne. Antonelli foi segundo e Leclerc ficou com o terceiro lugar.", content:"A Fórmula 1 iniciou sua nova era em grande estilo na Austrália. Com os carros redesenhados para 2026, a Mercedes voltou ao topo do pódio logo na abertura.\n\nGeorge Russell cruzou a linha em primeiro, seguido por Kimi Antonelli. Leclerc completou o pódio pela Ferrari.\n\nGabriel Bortoleto, piloto brasileiro da Audi, completou sua estreia sem incidentes, finalizando na zona de pontos.", readTime:"4 min", img:"https://images.unsplash.com/photo-1518364538800-6bae3c2ea0f2?w=900&q=80" },
  { id:"r2", sport:"formula1", minsAgo:120, title:"Bortoleto estreia na F1 e celebra primeiro ponto na carreira: 'Mais do que esperava'", summary:"O brasileiro da Audi cruzou a linha dentro do top-10 em Melbourne.", content:"Gabriel Bortoleto completou o GP da Austrália sem erros e conquistou seu primeiro ponto na F1.\n\nA Audi mostrou um carro competitivo para o meio-grid. Bortoleto demonstrou maturidade ao gerir os pneus.\n\n'Foi uma corrida incrível. Marcar ponto na estreia é mais do que eu esperava', disse o piloto.", readTime:"3 min", img:"https://images.unsplash.com/photo-1541348263662-e068662d82af?w=900&q=80" },
  { id:"t1", sport:"tenis",    minsAgo:15,  title:"HOJE ÀS 22H: João Fonseca enfrenta Sinner pelas oitavas de final de Indian Wells", summary:"O prodígio carioca de 19 anos faz história ao chegar às oitavas pela primeira vez.", content:"João Fonseca vive o melhor momento de sua carreira. O carioca de 19 anos chegou às oitavas de Indian Wells pela primeira vez.\n\nA campanha inclui vitória sobre Khachanov salvando dois match points, e uma goleada sobre Tommy Paul por 6/2 e 6/3.\n\nA partida contra Sinner começa às 22h de Brasília. Transmissão pela ESPN 2 e Disney+.", readTime:"4 min", img:"https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&q=80" },
  { id:"t2", sport:"tenis",    minsAgo:72,  title:"Fonseca atropela Tommy Paul com 6/2 e 6/3 e faz história em Indian Wells", summary:"Em 82 minutos dominantes, brasileiro se torna o 4º mais jovem em oitavas de Masters 1000.", content:"A vitória sobre Tommy Paul foi uma declaração de maturidade. Fonseca deixou o americano sem chances.\n\n'Desde o começo fiz o meu jogo, focado e colocando pressão', comemorou o carioca.\n\nUm ano atrás na mesma edição, Fonseca caiu na segunda rodada. A evolução em 12 meses é impressionante.", readTime:"3 min", img:"https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=900&q=80" },
  { id:"b1", sport:"basquete", minsAgo:18,  title:"SGA iguala Wilt Chamberlain com 126 jogos seguidos acima de 20 pontos na NBA", summary:"Astro do Thunder empatou um dos recordes mais míticos do basquete com game-winner.", content:"Shai Gilgeous-Alexander igualou Wilt Chamberlain com 126 jogos consecutivos marcando ao menos 20 pontos.\n\nO Thunder, já com 50 vitórias, encerrou o jogo com um game-winner de SGA nos instantes finais.\n\n'Não fico pensando nos recordes. Quero ganhar', disse Gilgeous-Alexander.", readTime:"4 min", img:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80" },
  { id:"b2", sport:"basquete", minsAgo:90,  title:"Thunder é o primeiro time a 50 vitórias na NBA 2025/26 e consolida favoritismo", summary:"Com campanha de 50-15, Oklahoma City manda recado: o caminho ao título passa por aqui.", content:"O Oklahoma City Thunder se tornou o primeiro time da NBA 2025/26 a atingir 50 vitórias, com campanha de 50-15.\n\nShai Gilgeous-Alexander lidera a liga em diversas estatísticas ofensivas. O suporte de Chet Holmgren e Jalen Williams completa o time.\n\nOs playoffs começam em abril. O Thunder é favorito número 1 ao título segundo analistas.", readTime:"3 min", img:"https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=900&q=80" },
];

function timeAgo(m) {
  if (m < 60) return `${m} min atrás`;
  if (m < 1440) return `${Math.floor(m / 60)}h atrás`;
  return `${Math.floor(m / 1440)}d atrás`;
}

function Badge({ sport, small }) {
  const m = META[sport] || {};
  return (
    <span style={{ background: m.color, color: "#fff", fontSize: small ? 9 : 10, fontWeight: 700, letterSpacing: 0.8, padding: small ? "2px 6px" : "3px 9px", borderRadius: 2, fontFamily: "sans-serif", whiteSpace: "nowrap", display: "inline-block" }}>
      {m.label}
    </span>
  );
}

function AdSlot({ h = 90, label = "728×90" }) {
  return (
    <div style={{ width: "100%", height: h, background: "#f7f7f7", border: "1px dashed #ddd", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 11, fontFamily: "monospace" }}>
      Anúncio · {label}
    </div>
  );
}

// ─── CARDS ────────────────────────────────────────────────────────────────────

function HeroCard({ a, onClick }) {
  const [hov, setHov] = useState(false);
  const m = META[a.sport];
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ cursor: "pointer", borderRadius: 6, overflow: "hidden", boxShadow: hov ? "0 8px 32px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.07)", transition: "box-shadow 0.25s" }}>
      <div style={{ height: 400, position: "relative", overflow: "hidden", background: `linear-gradient(135deg,${m.light},${m.color}30)` }}>
        <img src={a.img} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: hov ? "scale(1.04)" : "scale(1)", transition: "transform 0.45s" }} onError={e => e.target.style.display = "none"} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.1) 45%,transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 28px 28px" }}>
          <Badge sport={a.sport} />
          <h2 style={{ margin: "10px 0 0", color: "#fff", fontSize: 30, fontWeight: 800, lineHeight: 1.2, fontFamily: "Arial,sans-serif", textShadow: "0 2px 14px rgba(0,0,0,0.4)", transform: hov ? "translateY(-2px)" : "none", transition: "transform 0.3s" }}>{a.title}</h2>
        </div>
      </div>
    </div>
  );
}

function MediumCard({ a, onClick }) {
  const [hov, setHov] = useState(false);
  const m = META[a.sport];
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ cursor: "pointer", borderRadius: 5, overflow: "hidden", border: "1px solid #eee", background: "#fff", boxShadow: hov ? "0 4px 18px rgba(0,0,0,0.1)" : "none", transition: "box-shadow 0.2s" }}>
      <div style={{ height: 155, overflow: "hidden", background: `linear-gradient(135deg,${m.color}12,${m.color}28)` }}>
        <img src={a.img} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: hov ? "scale(1.06)" : "scale(1)", transition: "transform 0.35s" }} onError={e => e.target.style.display = "none"} />
      </div>
      <div style={{ padding: "13px 15px 16px" }}>
        <Badge sport={a.sport} small />
        <h3 style={{ margin: "8px 0 5px", fontSize: 15, fontWeight: 700, lineHeight: 1.32, fontFamily: "Arial,sans-serif", color: hov ? m.color : "#111", transition: "color 0.2s" }}>{a.title}</h3>
        <p style={{ color: "#888", fontSize: 12, lineHeight: 1.55, margin: "0 0 7px" }}>{(a.summary || "").slice(0, 88)}{(a.summary || "").length > 88 ? "…" : ""}</p>
        <span style={{ color: "#bbb", fontSize: 11 }}>{timeAgo(a.minsAgo)}</span>
      </div>
    </div>
  );
}

function ListCard({ a, onClick }) {
  const [hov, setHov] = useState(false);
  const m = META[a.sport];
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ cursor: "pointer", display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid #f2f2f2", alignItems: "flex-start" }}>
      <div style={{ width: 90, height: 66, flexShrink: 0, borderRadius: 4, overflow: "hidden", background: `linear-gradient(135deg,${m.color}12,${m.color}26)` }}>
        <img src={a.img} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: hov ? "scale(1.08)" : "scale(1)", transition: "transform 0.3s" }} onError={e => e.target.style.display = "none"} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 5 }}><Badge sport={a.sport} small /></div>
        <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, lineHeight: 1.35, color: hov ? m.color : "#111", transition: "color 0.2s", fontFamily: "Arial,sans-serif" }}>{a.title}</h4>
        <span style={{ color: "#bbb", fontSize: 11 }}>{timeAgo(a.minsAgo)}</span>
      </div>
    </div>
  );
}

// ─── ARTICLE PAGE ─────────────────────────────────────────────────────────────

function ArticlePage({ a, onBack, onNavigate, allNews }) {
  const m = META[a.sport];
  const related = allNews.filter(n => n.sport === a.sport && n.id !== a.id).slice(0, 3);
  const shareUrl = `https://arenanews.com.br/noticias/${a.id}`;
  const shareLinks = [
    { name:"WhatsApp", color:"#25d366", icon:"💬", url:`https://api.whatsapp.com/send?text=${encodeURIComponent(a.title + " " + shareUrl)}` },
    { name:"X",        color:"#000",    icon:"𝕏",  url:`https://twitter.com/intent/tweet?text=${encodeURIComponent(a.title)}&url=${encodeURIComponent(shareUrl)}` },
    { name:"Facebook", color:"#1877f2", icon:"f",  url:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name:"Copiar",   color:"#555",    icon:"🔗", action: () => { navigator.clipboard?.writeText(shareUrl); alert("Link copiado!"); } },
  ];

  return (
    <div style={{ fontFamily: "Arial,Helvetica,sans-serif", background: "#fff", minHeight: "100vh" }}>
      <div style={{ position: "fixed", top: 16, left: 16, zIndex: 200 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.96)", border: "1px solid #ddd", borderRadius: 24, padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#333", boxShadow: "0 2px 14px rgba(0,0,0,0.13)" }}>← Voltar</button>
      </div>
      <div style={{ height: 480, position: "relative", overflow: "hidden", background: `linear-gradient(135deg,${m.light},${m.color}30)` }}>
        <img src={a.img} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 55%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, maxWidth: 860, margin: "0 auto", padding: "0 24px 32px" }}>
          <Badge sport={a.sport} />
        </div>
      </div>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ padding: "16px 0" }}><AdSlot h={90} label="728×90 — Abaixo do Hero" /></div>
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.22, color: "#111", margin: "8px 0 16px", fontFamily: "Arial,sans-serif" }}>{a.title}</h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", gap: 18, color: "#aaa", fontSize: 13, alignItems: "center" }}>
            <span>🕐 {timeAgo(a.minsAgo)}</span><span>📖 {a.readTime} de leitura</span>
            <span style={{ color: m.color, fontWeight: 600 }}>ArenaNEWS</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#aaa" }}>Compartilhar:</span>
            {shareLinks.map(s => (
              <button key={s.name} onClick={() => s.action ? s.action() : window.open(s.url, "_blank")} title={s.name}
                style={{ width: 34, height: 34, borderRadius: "50%", background: s.color, color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.icon}
              </button>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 18, lineHeight: 1.75, fontWeight: 500, color: "#444", borderLeft: `3px solid ${m.color}`, paddingLeft: 20, margin: "0 0 28px" }}>{a.summary}</p>
        <div style={{ fontSize: 16, lineHeight: 1.92, color: "#333" }}>
          {(a.content || a.summary).split("\n").filter(p => p.trim()).map((p, i) => (
            <div key={i}>
              {i === 2 && <div style={{ margin: "24px 0" }}><AdSlot h={90} label="728×90 — In-Article" /></div>}
              <p style={{ marginBottom: 20 }}>{p}</p>
            </div>
          ))}
        </div>
        <div style={{ background: "#f9f9f9", borderRadius: 8, padding: "20px 24px", margin: "32px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div><div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 3 }}>Gostou? Compartilhe!</div></div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {shareLinks.map(s => (
              <button key={s.name} onClick={() => s.action ? s.action() : window.open(s.url, "_blank")}
                style={{ padding: "8px 16px", borderRadius: 20, background: s.color, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                {s.icon} {s.name}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}><AdSlot h={90} label="728×90 — Antes das Relacionadas" /></div>
        {related.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 4, height: 20, background: m.color, borderRadius: 2 }} />
              <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>Mais notícias</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {related.map(r => <MediumCard key={r.id} a={r} onClick={() => onNavigate(r)} />)}
            </div>
          </div>
        )}
      </div>
      <footer style={{ background: "#1a1a1a", color: "#777", padding: "36px 0", marginTop: 24 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div><div style={{ color: "#fff", fontWeight: 800, fontSize: 18, marginBottom: 4 }}>ARENA<span style={{ fontWeight: 300 }}>NEWS</span></div></div>
          <button onClick={onBack} style={{ background: "none", border: "1px solid #444", color: "#aaa", borderRadius: 4, padding: "8px 18px", cursor: "pointer", fontSize: 13 }}>← Voltar ao portal</button>
        </div>
      </footer>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────

function AdminPanel({ news, onSave, onDelete, onClose }) {
  const [editing, setEditing]     = useState(null); // null | article object copy
  const [password, setPassword]   = useState("");
  const [authed, setAuthed]       = useState(false);
  const [pwError, setPwError]     = useState(false);
  const [saved, setSaved]         = useState(false);
  const [filterSport, setFilter]  = useState("all");
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = filterSport === "all" ? news : news.filter(n => n.sport === filterSport);

  if (!authed) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: "36px 40px", maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: "#111", margin: "0 0 6px" }}>Painel Admin</h2>
          <p style={{ color: "#888", fontSize: 13, margin: "0 0 24px" }}>Digite a senha para acessar</p>
          <input
            type="password" placeholder="Senha" value={password}
            onChange={e => { setPassword(e.target.value); setPwError(false); }}
            onKeyDown={e => { if (e.key === "Enter") { if (password === ADMIN_PASSWORD) setAuthed(true); else setPwError(true); }}}
            style={{ width: "100%", border: `1px solid ${pwError ? "#e10600" : "#ddd"}`, borderRadius: 6, padding: "11px 14px", fontSize: 15, outline: "none", textAlign: "center", boxSizing: "border-box", marginBottom: 8 }}
          />
          {pwError && <div style={{ color: "#e10600", fontSize: 12, marginBottom: 8 }}>Senha incorreta</div>}
          <button onClick={() => { if (password === ADMIN_PASSWORD) setAuthed(true); else setPwError(true); }}
            style={{ width: "100%", background: "#c8102e", color: "#fff", border: "none", borderRadius: 6, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
            Entrar
          </button>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#aaa", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
        </div>
      </div>
    );
  }

  // ── EDITING A SINGLE ARTICLE ──
  if (editing) {
    const m = META[editing.sport];
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 500, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
        <div style={{ background: "#fff", borderRadius: 12, maxWidth: 720, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
          {/* Header */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa", borderRadius: "12px 12px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ background: "#c8102e", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 3 }}>EDITANDO</span>
              <Badge sport={editing.sport} small />
            </div>
            <button onClick={() => setEditing(null)} style={{ background: "none", border: "1px solid #eee", color: "#888", cursor: "pointer", borderRadius: 4, padding: "4px 12px", fontSize: 13 }}>✕ Cancelar</button>
          </div>

          <div style={{ padding: "28px 32px" }}>
            {/* Sport */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 1, display: "block", marginBottom: 6 }}>ESPORTE</label>
              <div style={{ display: "flex", gap: 8 }}>
                {Object.entries(META).map(([k, v]) => (
                  <button key={k} onClick={() => setEditing({ ...editing, sport: k })}
                    style={{ background: editing.sport === k ? v.color : "#f5f5f5", color: editing.sport === k ? "#fff" : "#555", border: "none", borderRadius: 5, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 1, display: "block", marginBottom: 6 }}>TÍTULO</label>
              <textarea value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} rows={2}
                style={{ width: "100%", border: "1px solid #e5e5e5", borderRadius: 6, padding: "10px 14px", fontSize: 15, fontWeight: 700, color: "#111", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "Arial,sans-serif" }} />
            </div>

            {/* Summary */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 1, display: "block", marginBottom: 6 }}>RESUMO (aparece nos cards)</label>
              <textarea value={editing.summary} onChange={e => setEditing({ ...editing, summary: e.target.value })} rows={2}
                style={{ width: "100%", border: "1px solid #e5e5e5", borderRadius: 6, padding: "10px 14px", fontSize: 14, color: "#333", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>

            {/* Content */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 1, display: "block", marginBottom: 6 }}>TEXTO COMPLETO (separe parágrafos com Enter)</label>
              <textarea value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} rows={8}
                style={{ width: "100%", border: "1px solid #e5e5e5", borderRadius: 6, padding: "10px 14px", fontSize: 14, color: "#333", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.7 }} />
            </div>

            {/* Image URL */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 1, display: "block", marginBottom: 6 }}>URL DA IMAGEM</label>
              <div style={{ display: "flex", gap: 12 }}>
                <input value={editing.img} onChange={e => setEditing({ ...editing, img: e.target.value })}
                  style={{ flex: 1, border: "1px solid #e5e5e5", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#333", outline: "none", fontFamily: "monospace" }} />
                <div style={{ width: 72, height: 44, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#f5f5f5" }}>
                  <img src={editing.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                </div>
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: "#aaa" }}>
                💡 Use qualquer URL de imagem. Sugestão: <a href="https://unsplash.com" target="_blank" rel="noreferrer" style={{ color: "#c8102e" }}>unsplash.com</a> → clique na foto → botão direito → "Copiar endereço da imagem"
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setEditing(null)}
                style={{ background: "none", border: "1px solid #ddd", color: "#888", borderRadius: 6, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={() => { onSave(editing); setSaved(true); setEditing(null); setTimeout(() => setSaved(false), 2500); }}
                style={{ background: "#009c3b", color: "#fff", border: "none", borderRadius: 6, padding: "10px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                ✓ Salvar notícia
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN ADMIN LIST ──
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 500, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 12, maxWidth: 860, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", marginBottom: 24 }}>

        {/* Header */}
        <div style={{ padding: "18px 28px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa", borderRadius: "12px 12px 0 0" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#111" }}>⚙️ Painel Admin</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Clique em qualquer notícia para editar · {news.length} notícias ativas</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #e5e5e5", color: "#666", borderRadius: 6, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>✕ Fechar</button>
        </div>

        {/* Filter */}
        <div style={{ padding: "14px 28px", borderBottom: "1px solid #f5f5f5", display: "flex", gap: 8 }}>
          {[["all","Todas"],["futebol","Futebol"],["formula1","F1"],["tenis","Tênis"],["basquete","Basquete"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)}
              style={{ background: filterSport === k ? "#111" : "#f5f5f5", color: filterSport === k ? "#fff" : "#555", border: "none", borderRadius: 5, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {l}
            </button>
          ))}
        </div>

        {/* Toast */}
        {saved && (
          <div style={{ margin: "14px 28px", background: "#e8f5ee", border: "1px solid #b7dfca", borderRadius: 6, padding: "10px 16px", color: "#005c23", fontSize: 13, fontWeight: 600 }}>
            ✓ Notícia salva com sucesso!
          </div>
        )}

        {/* Confirm delete */}
        {confirmDel && (
          <div style={{ margin: "14px 28px", background: "#fff0f0", border: "1px solid #fcc", borderRadius: 6, padding: "14px 16px" }}>
            <div style={{ fontWeight: 700, color: "#c8102e", marginBottom: 8 }}>Remover esta notícia?</div>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>"{confirmDel.title.slice(0, 70)}…"</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { onDelete(confirmDel.id); setConfirmDel(null); }}
                style={{ background: "#c8102e", color: "#fff", border: "none", borderRadius: 5, padding: "7px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                Sim, remover
              </button>
              <button onClick={() => setConfirmDel(null)} style={{ background: "#f5f5f5", border: "none", color: "#666", borderRadius: 5, padding: "7px 18px", cursor: "pointer", fontSize: 13 }}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Article list */}
        <div style={{ padding: "8px 0 16px" }}>
          {filtered.map((n, i) => {
            const m = META[n.sport];
            return (
              <div key={n.id} style={{ display: "flex", gap: 16, padding: "14px 28px", borderBottom: "1px solid #f8f8f8", alignItems: "center" }}>
                {/* Thumbnail */}
                <div style={{ width: 72, height: 54, borderRadius: 5, overflow: "hidden", flexShrink: 0, background: m.light }}>
                  <img src={n.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
                    <Badge sport={n.sport} small />
                    <span style={{ color: "#bbb", fontSize: 11 }}>{timeAgo(n.minsAgo)}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111", lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {n.title}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => setEditing({ ...n })}
                    style={{ background: "#f5f5f5", border: "none", color: "#333", borderRadius: 6, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => setConfirmDel(n)}
                    style={{ background: "#fff0f0", border: "none", color: "#c8102e", borderRadius: 6, padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "16px 28px", borderTop: "1px solid #f0f0f0", background: "#fafafa", borderRadius: "0 0 12px 12px" }}>
          <div style={{ fontSize: 12, color: "#aaa" }}>
            💡 <strong>Dica:</strong> Para trocar a imagem de uma notícia, acesse <a href="https://unsplash.com" target="_blank" rel="noreferrer" style={{ color: "#c8102e" }}>unsplash.com</a>, escolha uma foto, clique com botão direito → "Copiar endereço da imagem" e cole no campo URL ao editar.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

function HomePage({ news, tab, setTab, onOpen, onAdmin }) {
  const filtered  = tab === "all" ? news : news.filter(a => a.sport === tab);
  const hero      = filtered[0];
  const secondary = filtered.slice(1, 4);
  const listItems = filtered.slice(4);
  const trending  = news.slice(0, 6);

  return (
    <div style={{ fontFamily: "Arial,Helvetica,sans-serif", background: "#fff", minHeight: "100vh", color: "#111" }}>

      {/* Header */}
      <div style={{ background: "#c8102e", borderBottom: "3px solid #a00d24" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, background: "#fff", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#c8102e" }}>AN</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 22, lineHeight: 1, letterSpacing: -0.5 }}>ARENA<span style={{ fontWeight: 300 }}>NEWS</span></div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, letterSpacing: 2 }}>PORTAL ESPORTIVO</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>Terça-feira, 10 de março de 2026</span>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 4, padding: "5px 12px", color: "#fff", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "pulse 2s infinite" }} />
              Ao vivo
            </div>
            {/* Admin button — discreto */}
            <button onClick={onAdmin} title="Painel Admin"
              style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "rgba(255,255,255,0.5)", borderRadius: 4, padding: "6px 10px", cursor: "pointer", fontSize: 14 }}>
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ borderBottom: "1px solid #e5e5e5", background: "#fff", position: "sticky", top: 0, zIndex: 90, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex" }}>
          {SPORTS.map(s => (
            <button key={s.id} onClick={() => setTab(s.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "13px 18px", fontSize: 13, fontWeight: tab === s.id ? 700 : 400, color: tab === s.id ? "#c8102e" : "#444", borderBottom: tab === s.id ? "3px solid #c8102e" : "3px solid transparent", marginBottom: -1, transition: "all 0.15s", whiteSpace: "nowrap" }}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Ad top */}
      <div style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0", padding: "10px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}><AdSlot h={90} label="728×90 — Leaderboard" /></div>
      </div>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
        {tab !== "all" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <div style={{ width: 4, height: 24, background: META[tab]?.color, borderRadius: 2 }} />
            <span style={{ fontWeight: 800, fontSize: 20 }}>{META[tab]?.label}</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32 }}>
          <div>
            {hero && <div style={{ marginBottom: 22 }}><HeroCard a={hero} onClick={() => onOpen(hero)} /></div>}
            {secondary.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(secondary.length, 3)}, 1fr)`, gap: 16, marginBottom: 30 }}>
                {secondary.map(a => <MediumCard key={a.id} a={a} onClick={() => onOpen(a)} />)}
              </div>
            )}
            {listItems.length > 0 && <div style={{ marginBottom: 24 }}><AdSlot h={90} label="728×90 — In-feed" /></div>}
            {listItems.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 11, color: "#999", letterSpacing: 1 }}>MAIS NOTÍCIAS</span>
                  <div style={{ flex: 1, height: 1, background: "#eee" }} />
                </div>
                {listItems.map((a, i) => (
                  <div key={a.id}>
                    {i === 3 && <div style={{ margin: "16px 0" }}><AdSlot h={90} label="728×90 — In-content" /></div>}
                    <ListCard a={a} onClick={() => onOpen(a)} />
                  </div>
                ))}
              </>
            )}
          </div>

          <aside style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <AdSlot h={250} label="300×250 — Medium Rectangle" />
            <div style={{ border: "1px solid #eee", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", background: "#fafafa", borderBottom: "1px solid #eee" }}>
                <span style={{ fontWeight: 700, fontSize: 11, color: "#888", letterSpacing: 1 }}>MODALIDADES</span>
              </div>
              {SPORTS.filter(s => s.id !== "all").map(s => {
                const m = META[s.id];
                const count = news.filter(a => a.sport === s.id).length;
                return (
                  <button key={s.id} onClick={() => setTab(s.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "11px 16px", background: tab === s.id ? m.light : "#fff", border: "none", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 3, height: 16, background: m.color, borderRadius: 2 }} />
                      <span style={{ fontSize: 13, fontWeight: tab === s.id ? 700 : 400, color: "#222" }}>{s.label}</span>
                    </div>
                    <span style={{ background: m.light, color: m.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>{count}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ border: "1px solid #eee", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", background: "#fafafa", borderBottom: "1px solid #eee" }}>
                <span style={{ fontWeight: 700, fontSize: 11, color: "#888", letterSpacing: 1 }}>EM ALTA</span>
              </div>
              <div style={{ padding: "4px 16px 8px" }}>
                {trending.map((a, i) => {
                  const m = META[a.sport];
                  return (
                    <div key={a.id} onClick={() => onOpen(a)} style={{ cursor: "pointer", display: "flex", gap: 10, padding: "11px 0", borderBottom: i < trending.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                      <span style={{ width: 20, height: 20, background: m.light, color: m.color, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                      <div>
                        <div style={{ marginBottom: 3 }}><Badge sport={a.sport} small /></div>
                        <p style={{ margin: 0, fontSize: 12, color: "#333", lineHeight: 1.4, fontWeight: 600 }}>{a.title}</p>
                        <span style={{ color: "#bbb", fontSize: 10 }}>{timeAgo(a.minsAgo)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <AdSlot h={600} label="300×600 — Half Page" />
          </aside>
        </div>
      </main>

      <footer style={{ background: "#1a1a1a", color: "#777", padding: "36px 0", marginTop: 40 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, marginBottom: 4 }}>ARENA<span style={{ fontWeight: 300 }}>NEWS</span></div>
            <div style={{ fontSize: 12 }}>Portal esportivo atualizado automaticamente por IA</div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {SPORTS.filter(s => s.id !== "all").map(s => (
              <button key={s.id} onClick={() => setTab(s.id)} style={{ background: "none", border: "none", color: "#777", cursor: "pointer", fontSize: 12, padding: 0 }}>{s.label}</button>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: "12px auto 0", padding: "12px 20px 0", borderTop: "1px solid #2a2a2a", fontSize: 11, color: "#555" }}>
          © 2026 ArenaNEWS · Conteúdo gerado por IA · Powered by Claude
        </div>
      </footer>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [news,      setNews]      = useState(INITIAL_NEWS);
  const [tab,       setTab]       = useState("all");
  const [article,   setArticle]   = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const open  = a  => { setArticle(a); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const back  = () => { setArticle(null); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const saveArticle = updated => {
    setNews(prev => prev.map(n => n.id === updated.id ? updated : n));
    // Se estava visualizando esse artigo, atualiza também
    if (article?.id === updated.id) setArticle(updated);
  };

  const deleteArticle = id => {
    setNews(prev => prev.filter(n => n.id !== id));
    if (article?.id === id) setArticle(null);
  };

  return (
    <>
      {article
        ? <ArticlePage a={article} onBack={back} onNavigate={open} allNews={news} />
        : <HomePage news={news} tab={tab} setTab={setTab} onOpen={open} onAdmin={() => setShowAdmin(true)} />
      }
      {showAdmin && (
        <AdminPanel
          news={news}
          onSave={saveArticle}
          onDelete={deleteArticle}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </>
  );
}
