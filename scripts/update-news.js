// scripts/update-news.js
// Busca noticias REAIS via Google News RSS e usa Gemini para formatar
const { createClient } = require("@supabase/supabase-js");
const https = require("https");
const http  = require("http");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const GEMINI_KEY   = process.env.GEMINI_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Termos de busca para cada categoria no Google News
const TEMAS = [
  {
    categoria: "futebol",
    query: "futebol+brasileiro+OR+Brasileirao+OR+Libertadores+OR+selecao+brasileira",
    tema: "futebol brasileiro",
  },
  {
    categoria: "formula1",
    query: "Formula+1+2026+OR+F1+Bortoleto+OR+F1+corrida",
    tema: "Fórmula 1",
  },
  {
    categoria: "tenis",
    query: "tenis+ATP+OR+WTA+OR+Fonseca+tenis+OR+Sinner+OR+Swiatek",
    tema: "tênis",
  },
  {
    categoria: "basquete",
    query: "NBA+2026+OR+basquete+NBA+resultado",
    tema: "basquete NBA",
  },
];

const IMAGENS = {
  futebol:  [
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&q=80",
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=80",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=80",
    "https://images.unsplash.com/photo-1551958219-acbc630e2914?w=900&q=80",
  ],
  formula1: [
    "https://images.unsplash.com/photo-1518364538800-6bae3c2ea0f2?w=900&q=80",
    "https://images.unsplash.com/photo-1541348263662-e068662d82af?w=900&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
  ],
  tenis: [
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&q=80",
    "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=900&q=80",
    "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=900&q=80",
  ],
  basquete: [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80",
    "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=900&q=80",
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=900&q=80",
  ],
};

function getImagem(categoria) {
  const imgs = IMAGENS[categoria] || IMAGENS.futebol;
  return imgs[Math.floor(Math.random() * imgs.length)];
}

// Busca via HTTP/HTTPS
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      // Seguir redirecionamentos
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location).then(resolve).catch(reject);
      }
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve(body));
    }).on("error", reject);
  });
}

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { reject(new Error("JSON parse error: " + body.slice(0, 200))); }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// Busca noticias reais do Google News RSS
async function buscarGoogleNews(query) {
  try {
    const url = `https://news.google.com/rss/search?q=${query}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    const xml = await httpGet(url);

    // Extrair titulos e descricoes do RSS
    const items = [];
    const titleRegex = /<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>[\s\S]*?<\/item>/g;
    const titleRegex2 = /<title>(.*?)<\/title>/g;
    
    let match;
    // Tentar CDATA primeiro
    while ((match = titleRegex.exec(xml)) !== null && items.length < 5) {
      const title = match[1].trim();
      if (title && !title.includes("Google News")) {
        items.push(title);
      }
    }
    
    // Se nao achou com CDATA, tenta sem
    if (items.length === 0) {
      while ((match = titleRegex2.exec(xml)) !== null && items.length < 5) {
        const title = match[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
        if (title && !title.includes("Google News") && title.length > 10) {
          items.push(title);
        }
      }
    }

    console.log(`Google News encontrou ${items.length} titulos`);
    return items;
  } catch(e) {
    console.error("Erro Google News:", e.message);
    return [];
  }
}

// Usa Gemini para escrever noticia baseada em titulo real
async function gerarNoticia(titulosReais, categoria, tema) {
  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  const titulosStr = titulosReais.length > 0
    ? `Baseie-se NESTAS noticias reais de hoje:\n${titulosReais.map((t,i) => `${i+1}. ${t}`).join("\n")}`
    : `Crie noticias sobre ${tema} para ${hoje}`;

  const prompt = `Voce e um jornalista esportivo brasileiro. HOJE E ${hoje}.

${titulosStr}

Escreva 2 noticias completas em portugues brasileiro sobre ${tema}.
Use os fatos reais acima como base. Nao invente resultados de jogos.

Responda APENAS com JSON valido, sem markdown, sem backticks:
[{"titulo":"titulo jornalistico aqui","subtitulo":"resumo de 1-2 frases","conteudo":"paragrafo 1\\n\\nparagrafo 2\\n\\nparagrafo 3"},{"titulo":"titulo 2","subtitulo":"resumo","conteudo":"paragrafo 1\\n\\nparagrafo 2\\n\\nparagrafo 3"}]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

  try {
    const data = await httpsPost(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 8192 },
    });

    if (data.error) {
      console.error("Erro Gemini:", data.error.message);
      return [];
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    console.log("Gemini (200 chars):", text.slice(0, 200));

    let clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const startIdx = clean.indexOf("[");
    const endIdx   = clean.lastIndexOf("]");
    if (startIdx !== -1 && endIdx !== -1) {
      clean = clean.slice(startIdx, endIdx + 1);
    }

    try {
      return JSON.parse(clean);
    } catch(e) {
      // Recuperar objetos individuais
      const results = [];
      const matches = clean.match(/\{"titulo"[\s\S]*?"conteudo"[\s\S]*?\}/g) || [];
      for (const m of matches) {
        try { 
          const obj = JSON.parse(m + "}");
          if (obj.titulo) results.push(obj);
        } catch(e2) {}
      }
      return results;
    }
  } catch(e) {
    console.error("Erro ao gerar noticia:", e.message);
    return [];
  }
}

async function salvarNoticias(noticias, categoria) {
  for (const n of noticias) {
    if (!n.titulo || !n.conteudo) continue;

    const { data: existing } = await supabase
      .from("noticias")
      .select("id")
      .ilike("titulo", n.titulo.slice(0, 40) + "%")
      .limit(1);

    if (existing && existing.length > 0) {
      console.log("Ja existe:", n.titulo.slice(0, 50));
      continue;
    }

    const { error } = await supabase.from("noticias").insert({
      titulo:     n.titulo,
      subtitulo:  n.subtitulo || "",
      conteudo:   n.conteudo,
      imagem_url: getImagem(categoria),
      categoria:  categoria,
    });

    if (error) {
      console.error("Erro ao salvar:", error.message);
    } else {
      console.log("Salvo:", n.titulo.slice(0, 60));
    }
  }
}

async function limparNoticiasAntigas() {
  const { data } = await supabase
    .from("noticias")
    .select("id")
    .order("created_at", { ascending: false });

  if (data && data.length > 60) {
    const ids = data.slice(60).map(n => n.id);
    await supabase.from("noticias").delete().in("id", ids);
    console.log("Removidas", ids.length, "noticias antigas");
  }
}

async function main() {
  console.log("=== Radar da Bola - Auto Update ===");
  console.log("Horario:", new Date().toLocaleString("pt-BR"));

  if (!GEMINI_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error("ERRO: Variaveis de ambiente faltando!");
    process.exit(1);
  }

  for (const { categoria, query, tema } of TEMAS) {
    console.log(`\n--- ${categoria.toUpperCase()} ---`);
    try {
      // 1. Busca noticias reais no Google News
      console.log("Buscando no Google News...");
      const titulosReais = await buscarGoogleNews(query);

      // 2. Gemini escreve as noticias baseado nos titulos reais
      console.log("Gerando com Gemini...");
      const noticias = await gerarNoticia(titulosReais, categoria, tema);
      console.log(`Geradas: ${noticias.length} noticias`);

      // 3. Salva no Supabase
      if (noticias.length > 0) {
        await salvarNoticias(noticias, categoria);
      }
    } catch(e) {
      console.error(`Erro em ${categoria}:`, e.message);
    }

    await new Promise(r => setTimeout(r, 3000));
  }

  await limparNoticiasAntigas();
  console.log("\n=== Concluido! ===");
}

main();
