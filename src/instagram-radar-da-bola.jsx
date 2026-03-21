/* eslint-disable */
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";

const B = {
  black:"#0d0d0d", dark:"#1a1a1a", darker:"#111111",
  red:"#e8002d", redDeep:"#9e001f",
  white:"#ffffff", gray:"#888", border:"#2a2a2a",
};

const SPORTS = {
  futebol:  { color:"#009c3b", label:"FUTEBOL",   emoji:"⚽" },
  formula1: { color:"#e10600", label:"FÓRMULA 1", emoji:"🏎️" },
  tenis:    { color:"#c8860a", label:"TÊNIS",     emoji:"🎾" },
  basquete: { color:"#e65c00", label:"BASQUETE",  emoji:"🏀" },
};

const NEWS = [];

const INIT_STATUS = {};

function timeAgo(m) {
  if (m < 60) return `${m}min atrás`;
  if (m < 1440) return `${Math.floor(m/60)}h atrás`;
  return `${Math.floor(m/1440)}d atrás`;
}

function wrapText(ctx, text, x, y, maxW, lineH, maxLines=5) {
  const words = text.split(" ");
  let line="", cy=y, n=0;
  for (let i=0;i<words.length;i++) {
    const test = line+words[i]+" ";
    if (ctx.measureText(test).width > maxW && i > 0) {
      n++;
      if (n>=maxLines) { ctx.fillText(line.trim()+"…",x,cy); return; }
      ctx.fillText(line.trim(),x,cy);
      line=words[i]+" "; cy+=lineH;
    } else line=test;
  }
  ctx.fillText(line.trim(),x,cy);
}

function pill(ctx,x,y,w,h,r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

// ── LAYOUT 1 CLÁSSICO — FEED (1:1) ───────────────────────────────────────────
function FeedCanvas({ news, size=1 }) {
  const ref   = useRef(null);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const s = SPORTS[news.sport];
  const W = 260*size, H = 325*size;

  const draw = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const DPR = 2;
    canvas.width=W*DPR; canvas.height=H*DPR;
    canvas.style.width=W+"px"; canvas.style.height=H+"px";
    ctx.scale(DPR,DPR);

    // Fundo preto
    ctx.fillStyle = B.black;
    ctx.fillRect(0,0,W,H);

    // Foto de fundo com overlay
    if (imgRef.current && imgLoaded) {
      const img = imgRef.current;
      const sc = Math.max(W/img.naturalWidth, H/img.naturalHeight);
      const sw=img.naturalWidth*sc, sh=img.naturalHeight*sc;
      ctx.drawImage(img,(W-sw)/2,(H-sh)/2,sw,sh);
      ctx.fillStyle="rgba(0,0,0,0.55)";
      ctx.fillRect(0,0,W,H);
      const tint=ctx.createLinearGradient(0,H*0.4,0,H);
      tint.addColorStop(0,"rgba(0,0,0,0)");
      tint.addColorStop(1,"rgba(0,0,0,0.8)");
      ctx.fillStyle=tint; ctx.fillRect(0,0,W,H);
    }

    // Header cor do esporte
    ctx.fillStyle=s.color;
    ctx.fillRect(0,0,W,44);

    // Logo no header
    ctx.fillStyle=B.white;
    ctx.font=`800 11px 'Arial Black',Arial`;
    ctx.fillText("RADAR DA BOLA",14,28);

    // Badge no header
    ctx.fillStyle="rgba(0,0,0,0.25)";
    const bw=70,bh=18,bx=W-bw-10,by=13;
    pill(ctx,bx,by,bw,bh,3); ctx.fill();
    ctx.fillStyle=B.white;
    ctx.font="800 8px Arial";
    ctx.textAlign="center";
    ctx.fillText(s.emoji+" "+s.label,bx+bw/2,by+12);
    ctx.textAlign="left";

    // Gradiente inferior para titulo
    const grad=ctx.createLinearGradient(0,H*0.4,0,H);
    grad.addColorStop(0,"rgba(0,0,0,0)");
    grad.addColorStop(1,"rgba(0,0,0,0.92)");
    ctx.fillStyle=grad; ctx.fillRect(0,H*0.4,W,H-H*0.4);

    // Traco
    ctx.fillStyle=s.color;
    ctx.fillRect(14,H-118,28,3);

    // Titulo — espaco do traco
    ctx.fillStyle=B.white;
    ctx.font="800 14px Arial";
    ctx.shadowColor="rgba(0,0,0,0.95)"; ctx.shadowBlur=8;
    wrapText(ctx,news.title,14,H-98,W-28,19,4);
    ctx.shadowBlur=0;

    // Rodape preto transparente
    const gradF=ctx.createLinearGradient(0,H-44,0,H);
    gradF.addColorStop(0,"rgba(0,0,0,0)");
    gradF.addColorStop(1,"rgba(0,0,0,0.78)");
    ctx.fillStyle=gradF; ctx.fillRect(0,H-44,W,44);
    ctx.fillStyle=B.white; ctx.font="700 10px Arial";
    ctx.fillText("🔗 Link na bio",14,H-10);
    ctx.fillStyle="rgba(255,255,255,0.55)";
    ctx.font="400 9px Arial";
    ctx.textAlign="right";
    ctx.fillText(timeAgo(news.minsAgo),W-12,H-10);
    ctx.textAlign="left";
  }, [news, imgLoaded, W, H, s]);

  useEffect(() => {
    setImgLoaded(false);
    const img=new Image(); img.crossOrigin="anonymous";
    img.onload=()=>{ imgRef.current=img; setImgLoaded(true); };
    img.onerror=()=>{ imgRef.current=null; draw(); };
    img.src=news.img;
  }, [news.img]);

  useEffect(() => { draw(); }, [draw]);

  return <canvas ref={ref} style={{ borderRadius:8, display:"block", boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }} />;
}

// ── LAYOUT 1 CLÁSSICO — STORIES (9:16) ───────────────────────────────────────
function StoryCanvas({ news, size=1 }) {
  const ref   = useRef(null);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const s = SPORTS[news.sport];
  const W = 180*size, H = 320*size;

  const draw = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const DPR = 2;
    canvas.width=W*DPR; canvas.height=H*DPR;
    canvas.style.width=W+"px"; canvas.style.height=H+"px";
    ctx.scale(DPR,DPR);

    ctx.fillStyle=B.black;
    ctx.fillRect(0,0,W,H);

    // Foto fundo
    if (imgRef.current && imgLoaded) {
      const img=imgRef.current;
      const sc=Math.max(W/img.naturalWidth,H/img.naturalHeight);
      const sw=img.naturalWidth*sc,sh=img.naturalHeight*sc;
      ctx.drawImage(img,(W-sw)/2,(H-sh)/2,sw,sh);
      ctx.fillStyle="rgba(0,0,0,0.58)";
      ctx.fillRect(0,0,W,H);
      const tint=ctx.createLinearGradient(0,H*0.35,0,H);
      tint.addColorStop(0,"rgba(0,0,0,0)");
      tint.addColorStop(1,"rgba(0,0,0,0.85)");
      ctx.fillStyle=tint; ctx.fillRect(0,0,W,H);
    }

    // Gradiente inferior forte
    const gradS=ctx.createLinearGradient(0,H*0.35,0,H);
    gradS.addColorStop(0,"rgba(0,0,0,0)");
    gradS.addColorStop(1,"rgba(0,0,0,0.94)");
    ctx.fillStyle=gradS; ctx.fillRect(0,H*0.35,W,H-H*0.35);

    // CATEGORIA badge
    ctx.fillStyle=s.color;
    const bw=84,bh=20,bx=14,by=H-185;
    pill(ctx,bx,by,bw,bh,4); ctx.fill();
    ctx.fillStyle=B.white;
    ctx.font="800 9px Arial";
    ctx.fillText(s.emoji+" "+s.label,bx+10,by+13);

    // TRACO
    ctx.fillStyle=s.color;
    ctx.fillRect(14,H-155,32,3);

    // TITULO — 18px abaixo do traco
    ctx.fillStyle=B.white;
    ctx.font="800 15px Arial";
    ctx.shadowColor="rgba(0,0,0,0.95)"; ctx.shadowBlur=10;
    wrapText(ctx,news.title,14,H-132,W-28,21,4);
    ctx.shadowBlur=0;

    // FOOTER transparente
    const gradSt=ctx.createLinearGradient(0,H-34,0,H);
    gradSt.addColorStop(0,"rgba(0,0,0,0)");
    gradSt.addColorStop(1,"rgba(0,0,0,0.65)");
    ctx.fillStyle=gradSt; ctx.fillRect(0,H-34,W,34);
    ctx.fillStyle="rgba(255,255,255,0.65)";
    ctx.font="700 9px Arial";
    ctx.textAlign="center";
    ctx.fillText("Leia a materia completa · Link na bio",W/2,H-10);
    ctx.textAlign="left";
  }, [news, imgLoaded, W, H, s]);

  useEffect(() => {
    setImgLoaded(false);
    const img=new Image(); img.crossOrigin="anonymous";
    img.onload=()=>{ imgRef.current=img; setImgLoaded(true); };
    img.onerror=()=>{ imgRef.current=null; draw(); };
    img.src=news.img;
  }, [news.img]);

  useEffect(() => { draw(); }, [draw]);

  return <canvas ref={ref} style={{ borderRadius:12, display:"block", boxShadow:"0 6px 24px rgba(0,0,0,0.4)" }} />;
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function IGManager() {
  const [view,        setView]       = useState("dashboard");
  const [news,        setNews]       = useState([]);
  const [statuses,    setStatuses]   = useState(INIT_STATUS);
  const [previewNews, setPreviewNews]= useState(null);
  const [igConnected, setIgConnected]= useState(false);
  const [posting,     setPosting]    = useState(null);
  const [toast,       setToast]      = useState(null);
  const [loadingNews, setLoadingNews]= useState(true);
  const [caption,     setCaption]    = useState("📰 {titulo}\n\n{resumo}\n\n🔗 Link na bio para a matéria completa!\n\n#{esporte} #esportes #portalradardabola #noticias #brasil");

  // Carregar noticias do Supabase
  useEffect(() => {
    supabase
      .from("noticias")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const mapped = data.map(n => ({
            id:       n.id,
            sport:    n.categoria,
            minsAgo:  Math.floor((Date.now() - new Date(n.created_at)) / 60000),
            title:    n.titulo,
            summary:  n.subtitulo,
            img:      n.imagem_url,
          }));
          setNews(mapped);
          setPreviewNews(mapped[0]);
          // Inicializar statuses como pending para todas
          const s = {};
          mapped.forEach(n => { s[n.id] = "pending"; });
          setStatuses(s);
        }
        setLoadingNews(false);
      });
  }, []);

  const showToast = (msg,ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  const simulatePost = (id) => {
    if(posting) return;
    setPosting(id);
    setStatuses(s=>({...s,[id]:"generating"}));
    setTimeout(()=>{ setStatuses(s=>({...s,[id]:"posted"})); setPosting(null); showToast("✓ Feed + Stories publicados!"); },2400);
  };

  const downloadArte = (newsItem, tipo) => {
    // Renderiza o canvas e faz download
    const isFeed = tipo === "feed";
    const W = isFeed ? 1080 : 1080;
    const H = isFeed ? 1350 : 1920;
    const size = isFeed ? (1080/260) : (1080/180);

    const canvas = document.createElement("canvas");
    const DPR = 1;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    const s = SPORTS[newsItem.sport] || SPORTS.futebol;

    function pill(ctx,x,y,w,h,r){
      ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
      ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
      ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
    }

    function wrapText(ctx,text,x,y,maxW,lineH,maxLines){
      const words=text.split(' ');let line='',lines=0;
      for(let i=0;i<words.length;i++){
        const test=line+words[i]+' ';
        if(ctx.measureText(test).width>maxW&&i>0){
          ctx.fillText(line.trim(),x,y);line=words[i]+' ';y+=lineH;lines++;
          if(lines>=maxLines-1){ctx.fillText(line.trim()+(i<words.length-1?'...':''),x,y);return;}
        }else{line=test;}
      }
      ctx.fillText(line.trim(),x,y);
    }

    function desenhar(img) {
      ctx.fillStyle="#0d0d0d";
      ctx.fillRect(0,0,W,H);

      if(img){
        const sc=Math.max(W/img.naturalWidth,H/img.naturalHeight);
        const sw=img.naturalWidth*sc,sh=img.naturalHeight*sc;
        ctx.drawImage(img,(W-sw)/2,(H-sh)/2,sw,sh);
        ctx.fillStyle="rgba(0,0,0,0.38)";ctx.fillRect(0,0,W,H);
        const tint=ctx.createLinearGradient(0,H*0.38,0,H);
        tint.addColorStop(0,"rgba(0,0,0,0)");
        tint.addColorStop(1,"rgba(0,0,0,0.93)");
        ctx.fillStyle=tint;ctx.fillRect(0,0,W,H);
      }

      if(isFeed){
        // Header
        ctx.fillStyle=s.color;ctx.fillRect(0,0,W,44*size);
        ctx.fillStyle="#fff";ctx.font=`800 ${12*size}px Arial Black,Arial`;
        ctx.fillText("RADAR DA BOLA",14*size,28*size);
        const bw=74*size,bh=20*size,bx=W-bw-10*size,by=12*size;
        ctx.fillStyle="rgba(0,0,0,0.3)";pill(ctx,bx,by,bw,bh,4*size);ctx.fill();
        ctx.fillStyle="#fff";ctx.font=`800 ${9*size}px Arial`;
        ctx.textAlign="center";ctx.fillText(s.emoji+" "+s.label,bx+bw/2,by+13*size);ctx.textAlign="left";
        // Traco
        ctx.fillStyle=s.color;ctx.fillRect(14*size,H-118*size,28*size,3*size);
        // Titulo
        ctx.fillStyle="#fff";ctx.font=`800 ${14*size}px Arial`;
        ctx.shadowColor="rgba(0,0,0,0.95)";ctx.shadowBlur=8*size;
        wrapText(ctx,newsItem.title||newsItem.titulo,14*size,H-98*size,W-28*size,19*size,4);
        ctx.shadowBlur=0;
        // Rodape
        const gf=ctx.createLinearGradient(0,H-44*size,0,H);
        gf.addColorStop(0,"rgba(0,0,0,0)");gf.addColorStop(1,"rgba(0,0,0,0.78)");
        ctx.fillStyle=gf;ctx.fillRect(0,H-44*size,W,44*size);
        ctx.fillStyle="#fff";ctx.font=`700 ${10*size}px Arial`;
        ctx.fillText("🔗 Link na bio",14*size,H-10*size);
        ctx.fillStyle="rgba(255,255,255,0.55)";ctx.font=`400 ${9*size}px Arial`;
        ctx.textAlign="right";ctx.fillText("@portalradardabola",W-12*size,H-10*size);ctx.textAlign="left";
      } else {
        // STORIES
        const bw=84*size,bh=20*size,bx=14*size,by=H-185*size;
        ctx.fillStyle=s.color;pill(ctx,bx,by,bw,bh,4*size);ctx.fill();
        ctx.fillStyle="#fff";ctx.font=`800 ${9*size}px Arial`;
        ctx.fillText(s.emoji+" "+s.label,bx+10*size,by+13*size);
        ctx.fillStyle=s.color;ctx.fillRect(14*size,H-155*size,32*size,3*size);
        ctx.fillStyle="#fff";ctx.font=`800 ${15*size}px Arial`;
        ctx.shadowColor="rgba(0,0,0,0.95)";ctx.shadowBlur=10*size;
        wrapText(ctx,newsItem.title||newsItem.titulo,14*size,H-132*size,W-28*size,21*size,4);
        ctx.shadowBlur=0;
        const gs=ctx.createLinearGradient(0,H-34*size,0,H);
        gs.addColorStop(0,"rgba(0,0,0,0)");gs.addColorStop(1,"rgba(0,0,0,0.65)");
        ctx.fillStyle=gs;ctx.fillRect(0,H-34*size,W,34*size);
        ctx.fillStyle="rgba(255,255,255,0.65)";ctx.font=`700 ${9*size}px Arial`;
        ctx.textAlign="center";
        ctx.fillText("Leia a materia completa · Link na bio",W/2,H-10*size);
        ctx.textAlign="left";
      }

      // Download
      const link=document.createElement("a");
      const titulo=(newsItem.title||newsItem.titulo||"noticia").slice(0,30).replace(/\s+/g,"-").toLowerCase();
      link.download=`radar-${tipo}-${titulo}.jpg`;
      link.href=canvas.toDataURL("image/jpeg",0.95);
      link.click();
      showToast(`✓ ${isFeed?"Feed":"Stories"} baixado!`);
    }

    const img=new Image();
    img.crossOrigin="anonymous";
    img.onload=()=>desenhar(img);
    img.onerror=()=>desenhar(null);
    img.src=newsItem.img||newsItem.imagem_url||"";
  };

  const stats = {
    posted:  Object.values(statuses).filter(s=>s==="posted").length,
    pending: Object.values(statuses).filter(s=>s==="pending").length,
    total:   news.length,
  };

  const ST = {
    posted:     { label:"Publicado",  color:"#00c44f", bg:"rgba(0,196,79,0.1)",  icon:"✓" },
    pending:    { label:"Na fila",    color:"#888",    bg:"rgba(136,136,136,0.1)",icon:"○" },
    generating: { label:"Gerando…",  color:"#60a5fa", bg:"rgba(96,165,250,0.1)", icon:"⟳" },
    blocked:    { label:"Bloqueado",  color:B.red,     bg:"rgba(232,0,45,0.1)",   icon:"✕" },
  };

  const TABS = [
    { id:"dashboard", label:"Dashboard",     icon:"▦" },
    { id:"queue",     label:"Fila de posts", icon:"☰" },
    { id:"preview",   label:"Preview artes", icon:"◫" },
    { id:"settings",  label:"Configurações", icon:"⚙" },
  ];

  return (
    <div style={{ fontFamily:"'Arial','Helvetica',sans-serif", background:B.black, minHeight:"100vh", color:B.white }}>
      {toast && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:999, background:toast.ok?"#009c3b":B.red, color:B.white, borderRadius:8,padding:"12px 20px",fontSize:13,fontWeight:700,boxShadow:"0 6px 24px rgba(0,0,0,0.4)",animation:"slideIn 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display:"flex" }}>
        {/* Sidebar */}
        <aside style={{ width:220,background:"#0a0a0a",flexShrink:0,position:"fixed",top:0,left:0,bottom:0,zIndex:100,display:"flex",flexDirection:"column",borderRight:`1px solid ${B.border}` }}>
          <div style={{ padding:"20px",borderBottom:`1px solid ${B.border}` }}>
            <div style={{ fontWeight:900,fontSize:16,color:B.white,fontFamily:"'Arial Black',sans-serif" }}>
              RADAR <span style={{ color:B.red }}>DA</span> BOLA
            </div>
            <div style={{ fontSize:9,color:"#333",letterSpacing:2,marginTop:2 }}>INSTAGRAM MANAGER</div>
          </div>

          {/* IG status */}
          <div style={{ padding:"14px 20px",borderBottom:`1px solid ${B.border}` }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,#f09433,#dc2743,#bc1888)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0 }}>📸</div>
              <div>
                <div style={{ color:B.white,fontSize:12,fontWeight:700 }}>@portalradardabola</div>
                <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:2 }}>
                  <div style={{ width:6,height:6,borderRadius:"50%",background:igConnected?"#00c44f":B.red }} />
                  <span style={{ fontSize:10,color:igConnected?"#00c44f":B.red }}>{igConnected?"Conectado":"Não conectado"}</span>
                </div>
              </div>
            </div>
          </div>

          <nav style={{ padding:"10px 0",flex:1 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={()=>setView(t.id)} style={{ display:"flex",alignItems:"center",gap:10,width:"100%",background:view===t.id?"rgba(232,0,45,0.1)":"none",border:"none",cursor:"pointer",padding:"11px 20px",color:view===t.id?B.white:"rgba(255,255,255,0.35)",fontSize:13,fontWeight:view===t.id?700:400,borderLeft:view===t.id?`3px solid ${B.red}`:"3px solid transparent",transition:"all 0.15s",textAlign:"left" }}>
                <span style={{ fontSize:14 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>

          <div style={{ padding:"14px 20px",borderTop:`1px solid ${B.border}`,fontSize:11,color:"#333",lineHeight:2 }}>
            <div style={{ color:"#444",fontWeight:700,letterSpacing:1,marginBottom:4 }}>CONFIGURADO</div>
            <div>📐 Feed + Stories</div>
            <div>⚡ Postagem imediata</div>
            <div style={{ color:B.red }}>🎨 Layout 1 · Clássico</div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ marginLeft:220,flex:1,padding:"28px 32px" }}>

          {/* DASHBOARD */}
          {view==="dashboard" && (
            <div>
              <h1 style={{ fontSize:22,fontWeight:800,margin:"0 0 4px" }}>Dashboard</h1>
              <p style={{ color:"#444",fontSize:13,margin:"0 0 24px" }}>Terça-feira · 10 mar 2026</p>

              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22 }}>
                {[{label:"Notícias",value:stats.total,color:"#60a5fa"},{label:"Publicados",value:stats.posted,color:"#00c44f"},{label:"Na fila",value:stats.pending,color:"#888"},{label:"Publicados hoje",value:stats.posted,color:B.red}].map(s=>(
                  <div key={s.label} style={{ background:"#111",borderRadius:8,padding:"16px 18px",border:`1px solid ${B.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div style={{ fontSize:11,color:"#444" }}>{s.label}</div>
                    <div style={{ fontSize:28,fontWeight:800,color:s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Progresso */}
              <div style={{ background:"#111",borderRadius:8,padding:20,border:`1px solid ${B.border}`,marginBottom:20 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}>
                  <span style={{ fontWeight:700,fontSize:13 }}>Posts publicados hoje</span>
                  <span style={{ fontSize:12,color:"#444" }}>{stats.posted}/{stats.total}</span>
                </div>
                <div style={{ height:5,background:"rgba(255,255,255,0.07)",borderRadius:3,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${(stats.posted/stats.total)*100}%`,background:`linear-gradient(90deg,${B.redDeep},${B.red})`,borderRadius:3,transition:"width 0.6s" }} />
                </div>
                <div style={{ marginTop:8,fontSize:11,color:"#444" }}>Cada notícia gera: <span style={{ color:"#60a5fa" }}>1× Feed 4:5</span> + <span style={{ color:"#c084fc" }}>1× Stories 9:16</span> · Layout Clássico</div>
              </div>

              {/* Lista */}
              <div style={{ background:"#111",borderRadius:8,border:`1px solid ${B.border}`,overflow:"hidden" }}>
                <div style={{ padding:"14px 20px",borderBottom:`1px solid ${B.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <span style={{ fontWeight:700,fontSize:13 }}>Últimas notícias</span>
                  <button onClick={()=>setView("queue")} style={{ background:"none",border:"none",color:B.red,fontSize:12,fontWeight:700,cursor:"pointer" }}>Ver todas →</button>
                </div>
                {news.slice(0,5).map((n,i)=>{
                  const sp=SPORTS[n.sport];
                  const st=ST[statuses[n.id]]||ST.pending;
                  return (
                    <div key={n.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderBottom:i<4?`1px solid rgba(255,255,255,0.03)`:"none" }}>
                      <div style={{ width:40,height:40,borderRadius:5,overflow:"hidden",flexShrink:0,background:"#1a1a1a" }}>
                        <img src={n.img} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",opacity:0.8 }} onError={e=>e.target.style.display="none"} />
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#ddd",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{n.title}</div>
                        <div style={{ display:"flex",gap:8,marginTop:3 }}>
                          <span style={{ background:"rgba(255,255,255,0.06)",color:sp.color,fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:2 }}>{sp.label}</span>
                          <span style={{ color:"#444",fontSize:11 }}>{timeAgo(n.minsAgo)}</span>
                        </div>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
                        <span style={{ background:st.bg,color:st.color,fontSize:10,fontWeight:600,padding:"4px 10px",borderRadius:20 }}>{st.icon} {st.label}</span>
                        {statuses[n.id]==="pending" && (
                          <button onClick={()=>downloadArte(n,"feed")} title="Baixar Feed" style={{ background:"#1a1a2e",color:B.white,border:"none",borderRadius:5,padding:"5px 10px",fontSize:11,cursor:"pointer" }}>⬇ Feed</button>
                          <button onClick={()=>downloadArte(n,"stories")} title="Baixar Stories" style={{ background:"#1a1a2e",color:B.white,border:"none",borderRadius:5,padding:"5px 10px",fontSize:11,cursor:"pointer" }}>⬇ Story</button>
                          <button onClick={()=>simulatePost(n.id)} disabled={!!posting} style={{ background:B.red,color:B.white,border:"none",borderRadius:5,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:posting?"not-allowed":"pointer",opacity:posting?.5:1 }}>▶</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!igConnected && (
                <div style={{ background:"rgba(232,0,45,0.06)",border:`1px solid rgba(232,0,45,0.2)`,borderRadius:8,padding:"14px 18px",marginTop:16,display:"flex",alignItems:"center",gap:12 }}>
                  <span style={{ fontSize:20 }}>⚠️</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700,fontSize:13,color:B.red }}>Instagram não conectado</div>
                    <div style={{ fontSize:12,color:"#555",marginTop:2 }}>Configure o token de acesso para ativar as postagens automáticas.</div>
                  </div>
                  <button onClick={()=>setView("settings")} style={{ background:B.red,color:B.white,border:"none",borderRadius:6,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer" }}>Configurar →</button>
                </div>
              )}
            </div>
          )}

          {/* FILA */}
          {view==="queue" && (
            <div>
              <h1 style={{ fontSize:22,fontWeight:800,margin:"0 0 4px" }}>Fila de posts</h1>
              <p style={{ color:"#444",fontSize:13,margin:"0 0 20px" }}>Feed + Stories · Layout 1 Clássico · Postagem imediata</p>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {news.map(n=>{
                  const sp=SPORTS[n.sport];
                  const st=ST[statuses[n.id]]||ST.pending;
                  return (
                    <div key={n.id} style={{ background:"#111",borderRadius:8,padding:"14px 18px",border:`1px solid ${B.border}`,display:"flex",gap:12,alignItems:"center" }}>
                      <div style={{ width:64,height:48,borderRadius:5,overflow:"hidden",flexShrink:0,background:"#1a1a1a" }}>
                        <img src={n.img} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",opacity:0.8 }} onError={e=>e.target.style.display="none"} />
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:12,fontWeight:700,color:"#ddd",lineHeight:1.35,marginBottom:4 }}>{n.title}</div>
                        <div style={{ display:"flex",gap:8 }}>
                          <span style={{ background:"rgba(255,255,255,0.06)",color:sp.color,fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:2 }}>{sp.label}</span>
                          <span style={{ color:"#444",fontSize:11 }}>{timeAgo(n.minsAgo)}</span>
                          <span style={{ color:"#60a5fa",fontSize:10 }}>📐 Feed + Stories</span>
                        </div>
                      </div>
                      <div style={{ display:"flex",gap:8,alignItems:"center",flexShrink:0 }}>
                        <span style={{ background:st.bg,color:st.color,fontSize:10,fontWeight:600,padding:"5px 12px",borderRadius:20,minWidth:80,textAlign:"center" }}>
                          {posting===n.id?"⟳ Gerando…":`${st.icon} ${st.label}`}
                        </span>
                        <button onClick={()=>{setPreviewNews(n);setView("preview");}} style={{ background:"rgba(255,255,255,0.06)",color:"#888",border:"none",borderRadius:5,padding:"6px 10px",fontSize:11,fontWeight:600,cursor:"pointer" }}>👁 Ver</button>
                        {(statuses[n.id]==="pending"||statuses[n.id]==="error") && (
                          <button onClick={()=>downloadArte(n,"feed")} style={{ background:"#1a1a2e",color:B.white,border:"none",borderRadius:5,padding:"7px 10px",fontSize:11,fontWeight:600,cursor:"pointer" }}>⬇ Feed</button>
                          <button onClick={()=>downloadArte(n,"stories")} style={{ background:"#1a1a2e",color:B.white,border:"none",borderRadius:5,padding:"7px 10px",fontSize:11,fontWeight:600,cursor:"pointer" }}>⬇ Story</button>
                          <button onClick={()=>simulatePost(n.id)} disabled={!!posting} style={{ background:`linear-gradient(135deg,${B.redDeep},${B.red})`,color:B.white,border:"none",borderRadius:5,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:posting?"not-allowed":"pointer",opacity:posting?.5:1 }}>▶ Postar</button>
                        )}
                        {statuses[n.id]==="posted" && (
                          <div style={{ background:"rgba(0,196,79,0.1)",color:"#00c44f",borderRadius:5,padding:"7px 12px",fontSize:11,fontWeight:700 }}>✓ Publicado</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PREVIEW */}
          {view==="preview" && (
            <div>
              <h1 style={{ fontSize:22,fontWeight:800,margin:"0 0 4px" }}>Preview das artes</h1>
              <p style={{ color:"#444",fontSize:13,margin:"0 0 20px" }}>Layout 1 Clássico · Vermelho e Preto · Radar da Bola</p>

              {/* Seletor */}
              <div style={{ background:"#111",borderRadius:8,padding:"12px 16px",border:`1px solid ${B.border}`,marginBottom:20,display:"flex",gap:8,overflowX:"auto" }}>
                {news.map(n=>(
                  <button key={n.id} onClick={()=>setPreviewNews(n)} style={{ background:previewNews?.id===n.id?B.red:"rgba(255,255,255,0.06)",color:previewNews?.id===n.id?B.white:"#666",border:"none",borderRadius:5,padding:"6px 11px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0 }}>
                    {SPORTS[n.sport].emoji} {n.id.toUpperCase()}
                  </button>
                ))}
              </div>

              {previewNews && (
                <div>
                  <div style={{ display:"flex",gap:40,alignItems:"flex-start",marginBottom:28 }}>
                    <div>
                      <div style={{ fontSize:10,color:"#444",letterSpacing:1,fontWeight:700,marginBottom:12 }}>FEED · 4:5</div>
                      <FeedCanvas news={previewNews} />
                    </div>
                    <div>
                      <div style={{ fontSize:10,color:"#444",letterSpacing:1,fontWeight:700,marginBottom:12 }}>STORIES · 9:16</div>
                      <StoryCanvas news={previewNews} />
                    </div>
                    <div style={{ flex:1,paddingTop:4 }}>
                      <div style={{ background:"#111",borderRadius:8,padding:16,marginBottom:14,border:`1px solid ${B.border}` }}>
                        <div style={{ fontWeight:700,fontSize:12,color:"#aaa",marginBottom:8 }}>LEGENDA GERADA</div>
                        <pre style={{ fontSize:11,color:"#666",lineHeight:1.9,fontFamily:"monospace",margin:0,whiteSpace:"pre-wrap",background:"rgba(0,0,0,0.3)",borderRadius:6,padding:10 }}>
                          {caption.replace("{titulo}",previewNews.title).replace("{resumo}",previewNews.summary).replace("{esporte}",previewNews.sport)}
                        </pre>
                      </div>
                      <div style={{ display:"flex",gap:10 }}>
                        <button onClick={()=>showToast("Arte salva!")} style={{ flex:1,background:"rgba(255,255,255,0.06)",color:"#888",border:"none",borderRadius:7,padding:10,fontSize:12,fontWeight:700,cursor:"pointer" }}>↓ Baixar</button>
                        {(statuses[previewNews.id]==="pending"||statuses[previewNews.id]==="error") && (
                          <button onClick={()=>downloadArte(previewNews,"feed")} style={{ flex:1,background:"#1a1a2e",color:B.white,border:"none",borderRadius:7,padding:10,fontSize:12,fontWeight:700,cursor:"pointer" }}>⬇ Feed</button>
                      <button onClick={()=>downloadArte(previewNews,"stories")} style={{ flex:1,background:"#1a1a2e",color:B.white,border:"none",borderRadius:7,padding:10,fontSize:12,fontWeight:700,cursor:"pointer" }}>⬇ Stories</button>
                      <button onClick={()=>simulatePost(previewNews.id)} disabled={!!posting} style={{ flex:1,background:`linear-gradient(135deg,${B.redDeep},${B.red})`,color:B.white,border:"none",borderRadius:7,padding:10,fontSize:12,fontWeight:800,cursor:"pointer" }}>▶ Postar agora</button>
                        )}
                        {statuses[previewNews.id]==="posted" && (
                          <div style={{ flex:1,background:"rgba(0,196,79,0.1)",color:"#00c44f",borderRadius:7,padding:10,fontSize:12,fontWeight:700,textAlign:"center" }}>✓ Já publicado</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Miniaturas */}
                  <div style={{ borderTop:`1px solid ${B.border}`,paddingTop:20 }}>
                    <div style={{ fontWeight:700,fontSize:11,color:"#333",letterSpacing:1,marginBottom:14 }}>TODAS · FEED</div>
                    <div style={{ display:"flex",gap:14,overflowX:"auto",paddingBottom:8 }}>
                      {news.map(n=>(
                        <div key={n.id} onClick={()=>setPreviewNews(n)} style={{ cursor:"pointer",opacity:previewNews.id===n.id?1:0.45,transition:"opacity 0.2s",flexShrink:0 }}>
                          <FeedCanvas news={n} size={0.5} />
                          <div style={{ marginTop:5,fontSize:9,color:"#444",textAlign:"center",fontWeight:700 }}>{SPORTS[n.sport].emoji}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {view==="settings" && (
            <div>
              <h1 style={{ fontSize:22,fontWeight:800,margin:"0 0 4px" }}>Configurações</h1>
              <p style={{ color:"#444",fontSize:13,margin:"0 0 24px" }}>Token do Instagram e template de legenda</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18 }}>

                <div style={{ background:"#111",borderRadius:10,padding:24,border:`1px solid ${B.border}`,gridColumn:"1 / -1" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:18 }}>
                    <div style={{ width:38,height:38,borderRadius:9,background:"linear-gradient(135deg,#f09433,#dc2743,#bc1888)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19 }}>📸</div>
                    <div>
                      <div style={{ fontWeight:700,fontSize:14,color:B.white }}>Conta do Instagram</div>
                      <div style={{ fontSize:12,color:"#444" }}>Necessário conta Business vinculada ao Facebook</div>
                    </div>
                  </div>
                  {!igConnected ? (
                    <div>
                      <div style={{ background:"rgba(255,255,255,0.03)",borderRadius:7,padding:14,marginBottom:14,border:`1px solid ${B.border}` }}>
                        <div style={{ fontWeight:700,fontSize:11,color:"#555",marginBottom:8,letterSpacing:0.5 }}>COMO OBTER O TOKEN</div>
                        <ol style={{ fontSize:12,color:"#444",lineHeight:2.3,paddingLeft:18,margin:0 }}>
                          <li>Acesse <span style={{ color:B.red }}>developers.facebook.com</span> → crie App tipo <strong style={{ color:"#aaa" }}>Business</strong></li>
                          <li>Adicione o produto <strong style={{ color:"#aaa" }}>Instagram Graph API</strong></li>
                          <li>Vincule sua <strong style={{ color:"#aaa" }}>Página do Facebook</strong> + conta Instagram Business</li>
                          <li>Vá em Ferramentas → Explorador da API do Graph</li>
                          <li>Gere um <strong style={{ color:"#aaa" }}>Long-lived Access Token</strong> (válido 60 dias)</li>
                          <li>Cole o token abaixo e clique em Conectar</li>
                        </ol>
                      </div>
                      <div style={{ display:"flex",gap:10 }}>
                        <input placeholder="EAABsbCS... (cole aqui o Access Token)" style={{ flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${B.border}`,borderRadius:6,padding:"10px 12px",fontSize:12,color:"#ddd",fontFamily:"monospace",outline:"none" }} />
                        <button onClick={()=>{setIgConnected(true);showToast("✓ Instagram conectado!");}} style={{ background:`linear-gradient(135deg,#dc2743,#bc1888)`,color:B.white,border:"none",borderRadius:6,padding:"10px 20px",fontSize:13,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap" }}>Conectar</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(0,196,79,0.07)",borderRadius:8,padding:"13px 16px",border:"1px solid rgba(0,196,79,0.15)" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:9,height:9,borderRadius:"50%",background:"#00c44f" }} />
                        <div>
                          <div style={{ fontWeight:700,fontSize:13,color:B.white }}>@portalradardabola — Conectado</div>
                          <div style={{ fontSize:11,color:"#444",marginTop:2 }}>Token válido · Feed + Stories ativos · Layout 1 Clássico</div>
                        </div>
                      </div>
                      <button onClick={()=>setIgConnected(false)} style={{ background:"rgba(255,255,255,0.06)",border:"none",color:"#555",borderRadius:6,padding:"6px 14px",fontSize:12,cursor:"pointer" }}>Desconectar</button>
                    </div>
                  )}
                </div>

                <div style={{ background:"#111",borderRadius:10,padding:24,border:`1px solid ${B.border}` }}>
                  <div style={{ fontWeight:700,fontSize:13,color:B.white,marginBottom:14 }}>Configurações ativas</div>
                  {[["📐","Formatos","Feed (4:5) + Stories (9:16)","#60a5fa"],["🎨","Layout","Layout 1 — Clássico Jornalístico",B.red],["⚡","Postagem","Assim que a notícia for gerada","#00c44f"],["🔄","Auto-update","A cada 2 horas automaticamente","#f5c518"]].map(([icon,label,val,color])=>(
                    <div key={label} style={{ display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                      <span style={{ fontSize:18,flexShrink:0 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize:10,color:"#444",marginBottom:2 }}>{label}</div>
                        <div style={{ fontSize:13,fontWeight:600,color }}>{val}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background:"#111",borderRadius:10,padding:24,border:`1px solid ${B.border}` }}>
                  <div style={{ fontWeight:700,fontSize:13,color:B.white,marginBottom:6 }}>Template de legenda</div>
                  <div style={{ fontSize:11,color:"#444",marginBottom:12 }}>
                    Use <code style={{ background:"rgba(255,255,255,0.07)",padding:"1px 5px",borderRadius:3,color:"#60a5fa" }}>{"{titulo}"}</code>{" "}
                    <code style={{ background:"rgba(255,255,255,0.07)",padding:"1px 5px",borderRadius:3,color:"#60a5fa" }}>{"{resumo}"}</code>{" "}
                    <code style={{ background:"rgba(255,255,255,0.07)",padding:"1px 5px",borderRadius:3,color:"#60a5fa" }}>{"{esporte}"}</code>
                  </div>
                  <textarea value={caption} onChange={e=>setCaption(e.target.value)} rows={7}
                    style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${B.border}`,borderRadius:6,padding:"11px 12px",fontSize:12,color:"#ccc",fontFamily:"monospace",outline:"none",resize:"vertical",boxSizing:"border-box" }} />
                  <button onClick={()=>showToast("✓ Legenda salva!")} style={{ marginTop:12,background:B.red,color:B.white,border:"none",borderRadius:6,padding:"10px 22px",fontSize:13,fontWeight:800,cursor:"pointer" }}>Salvar</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}
