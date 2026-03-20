// scripts/update-news.js
// Busca noticias REAIS de portais esportivos via RSS
// Gemini reescreve para evitar duplicata/plagio
const { createClient } = require("@supabase/supabase-js");
const https = require("https");
const http  = require("http");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const GEMINI_KEY   = process.env.GEMINI_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── FONTES RSS POR CATEGORIA ──────────────────────────────────────────────────
const FONTES = {
  futebol: [
    // Google News (imagens reais + noticias frescas)
    "https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRFp1ZEdvU0JYQjBMVUpTR2dKQ1VpZ0FQAQ?hl=pt-BR&gl=BR&ceid=BR:pt-419",
    "https://news.google.com/rss/search?q=futebol+brasileiro+brasileirao&hl=pt-BR&gl=BR&ceid=BR:pt-419",
    "https://news.google.com/rss/search?q=libertadores+2026&hl=pt-BR&gl=BR&ceid=BR:pt-419",
    "https://news.google.com/rss/search?q=copa+do+brasil+2026&hl=pt-BR&gl=BR&ceid=BR:pt-419",
    // Portais especializados
    "https://www.gazetaesportiva.com/feed/",
    "https://www.lance.com.br/feed/",
    "https://esportes.r7.com/futebol/feed.xml",
    // GE Globo
    "https://ge.globo.com/rss/futebol/brasileirao-serie-a/",
    "https://ge.globo.com/rss/futebol/libertadores/",
    "https://ge.globo.com/rss/futebol/futebol-internacional/",
    "https://ge.globo.com/rss/futebol/",
    // ESPN e Goal
    "https://www.espn.com.br/rss/futebol/",
    "https://www.goal.com/feeds/br/news",
  ],
  formula1: [
    // Google News
    "https://news.google.com/rss/search?q=formula+1+2026+F1&hl=pt-BR&gl=BR&ceid=BR:pt-419",
    "https://news.google.com/rss/search?q=Bortoleto+F1+2026&hl=pt-BR&gl=BR&ceid=BR:pt-419",
    // Portais
    "https://www.gazetaesportiva.com/feed/",
    "https://www.lance.com.br/feed/",
    "https://esportes.r7.com/formula-1/feed.xml",
    "https://ge.globo.com/rss/formula-1/",
    "https://www.espn.com.br/rss/f1/",
    "https://www.motorsport.com/rss/f1/news/",
    "https://www.autosport.com/rss/f1/news/",
  ],
  tenis: [
    // Google News
    "https://news.google.com/rss/search?q=tenis+ATP+WTA+2026&hl=pt-BR&gl=BR&ceid=BR:pt-419",
    "https://news.google.com/rss/search?q=Joao+Fonseca+tenis&hl=pt-BR&gl=BR&ceid=BR:pt-419",
    // Portais
    "https://www.gazetaesportiva.com/feed/",
    "https://www.lance.com.br/feed/",
    "https://esportes.r7.com/tenis/feed.xml",
    "https://ge.globo.com/rss/tenis/",
    "https://www.espn.com.br/rss/tenis/",
    "https://www.tennisworldusa.org/rss/news.xml",
  ],
  basquete: [
    // Google News
    "https://news.google.com/rss/search?q=NBA+2026+basquete&hl=pt-BR&gl=BR&ceid=BR:pt-419",
    // Portais
    "https://www.gazetaesportiva.com/feed/",
    "https://www.lance.com.br/feed/",
    "https://esportes.r7.com/basquete/feed.xml",
    "https://ge.globo.com/rss/basquete/",
    "https://www.espn.com.br/rss/nba/",
  ],
};

// Palavras-chave para filtrar noticias da categoria correta
const FILTROS = {
  futebol:  ["futebol", "brasileirao", "libertadores", "copa", "gol", "clube", "selecao", "campeonato", "serie a", "serie b", "flamengo", "palmeiras", "corinthians", "sao paulo", "atletico", "cruzeiro", "botafogo", "fluminense", "vasco", "gremio", "internacional", "champions"],
  formula1: ["formula 1", "formula1", "f1", "gp", "grand prix", "piloto", "corrida", "verstappen", "hamilton", "ferrari", "mercedes", "red bull", "bortoleto", "senna"],
  tenis:    ["tenis", "atp", "wta", "grand slam", "wimbledon", "roland garros", "us open", "australian open", "sinner", "djokovic", "alcaraz", "swiatek", "fonseca"],
  basquete: ["basquete", "nba", "basketball", "playoffs", "finals", "lakers", "celtics", "warriors", "thunder", "nuggets", "knicks"],
};

// Imagens fallback por categoria (caso o RSS nao traga imagem)
const IMAGENS_FALLBACK = {
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

function getFallbackImagem(categoria) {
  const imgs = IMAGENS_FALLBACK[categoria] || IMAGENS_FALLBACK.futebol;
  return imgs[Math.floor(Math.random() * imgs.length)];
}

// ── HTTP GET com redirecionamento ─────────────────────────────────────────────
function httpGet(url, depth = 0) {
  if (depth > 3) return Promise.reject(new Error("Too many redirects"));
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RadarDaBola/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      timeout: 10000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location, depth + 1).then(resolve).catch(reject);
      }
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve(body));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

// ── PARSE RSS ─────────────────────────────────────────────────────────────────
function parseRSS(xml) {
  const items = [];
  
  // Extrair cada <item>
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let itemMatch;
  
  while ((itemMatch = itemRegex.exec(xml)) !== null && items.length < 8) {
    const itemXml = itemMatch[1];
    
    // Titulo
    let titulo = "";
    const titleMatch = itemXml.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
                       itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    if (titleMatch) titulo = titleMatch[1].replace(/<[^>]+>/g, "").trim();
    
    // Descricao/resumo
    let resumo = "";
    const descMatch = itemXml.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
                      itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/);
    if (descMatch) {
      resumo = descMatch[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()
        .slice(0, 500);
    }
    
    // Imagem — tenta varios formatos incluindo Google News
    let imagem = "";
    const imgPatterns = [
      /<media:content[^>]+url="([^"]+)"[^>]*type="image/,
      /<media:thumbnail[^>]+url="([^"]+)"/,
      /<enclosure[^>]+url="([^"]+)"[^>]*type="image/,
      /<image:url>([\s\S]*?)<\/image:url>/,
      // Google News usa tag <figure> com img src
      /src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i,
      /url="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i,
      // Qualquer URL de imagem no conteudo
      /(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?)/i,
    ];
    for (const pat of imgPatterns) {
      const m = itemXml.match(pat);
      if (m && m[1] && m[1].startsWith("http") && !m[1].includes("pixel") && m[1].length < 500) {
        imagem = m[1];
        break;
      }
    }

    // Data
    let data = "";
    const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    if (dateMatch) data = dateMatch[1].trim();

    if (titulo && titulo.length > 10) {
      items.push({ titulo, resumo, imagem, data });
    }
  }
  
  return items;
}

// ── FILTRO POR CATEGORIA ─────────────────────────────────────────────────────
function pertenceCategoria(titulo, resumo, categoria) {
  const texto = (titulo + " " + resumo).toLowerCase();
  const palavras = FILTROS[categoria] || [];
  return palavras.some(p => texto.includes(p));
}

// ── BUSCA IMAGEM NO UNSPLASH ──────────────────────────────────────────────────
async function buscarImagem(titulo, categoria) {
  try {
    // Palavras-chave por categoria para busca no Unsplash
    const queries = {
      futebol:  "soccer football stadium",
      formula1: "formula 1 race car motorsport",
      tenis:    "tennis court player",
      basquete: "basketball nba court",
    };
    const query = encodeURIComponent(queries[categoria] || "sports");
    const url = `https://source.unsplash.com/900x600/?${query}`;
    // Unsplash source retorna redirect para imagem real
    const img = await new Promise((resolve) => {
      https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.headers.location) {
          resolve(res.headers.location);
        } else {
          resolve(url);
        }
      }).on("error", () => resolve(getFallbackImagem(categoria)));
    });
    return img;
  } catch(e) {
    return getFallbackImagem(categoria);
  }
}

// ── BUSCA RSS DE TODAS AS FONTES DA CATEGORIA ─────────────────────────────────
async function buscarRSS(categoria) {
  const fontes = FONTES[categoria] || [];
  const todasNoticias = [];
  
  for (const url of fontes) {
    try {
      console.log(`  RSS: ${url}`);
      const xml = await httpGet(url);
      const items = parseRSS(xml);
      
      // Filtrar apenas noticias que realmente pertencem a categoria
      const filtradas = items.filter(n => pertenceCategoria(n.titulo, n.resumo, categoria));
      console.log(`  -> ${items.length} itens, ${filtradas.length} da categoria`);
      todasNoticias.push(...filtradas);
      if (todasNoticias.length >= 6) break;
    } catch(e) {
      console.log(`  -> Erro: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Remover duplicatas por titulo
  const vistos = new Set();
  return todasNoticias.filter(n => {
    const key = n.titulo.slice(0, 40).toLowerCase();
    if (vistos.has(key)) return false;
    vistos.add(key);
    return true;
  }).slice(0, 6);
}

// ── GEMINI REESCREVE A NOTICIA ────────────────────────────────────────────────
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
      timeout: 30000,
    };
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { reject(new Error("JSON parse: " + body.slice(0, 200))); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
    req.write(data);
    req.end();
  });
}

async function reescreverComGemini(noticiasOriginais, categoria) {
  if (noticiasOriginais.length === 0) return [];
  
  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  const lista = noticiasOriginais
    .slice(0, 4)
    .map((n, i) => `${i+1}. TITULO: ${n.titulo}\n   RESUMO: ${n.resumo || "sem resumo"}`)
    .join("\n\n");

  const prompt = `Voce e um redator esportivo brasileiro. HOJE E ${hoje}.

Abaixo estao ${Math.min(noticiasOriginais.length, 4)} noticias REAIS de hoje sobre ${categoria}:

${lista}

Reescreva 2 dessas noticias em portugues brasileiro jornalistico:
- Use as informacoes reais mas com suas proprias palavras
- Titulo criativo e impactante (diferente do original)
- Subtitulo de 1-2 frases resumindo
- Conteudo com 3 paragrafos completos e informativos
- NAO invente fatos que nao estao nas noticias originais

Responda APENAS JSON valido, sem markdown, sem backticks:
[{"titulo":"titulo aqui","subtitulo":"resumo","conteudo":"paragrafo 1\\n\\nparagrafo 2\\n\\nparagrafo 3"},{"titulo":"titulo 2","subtitulo":"resumo 2","conteudo":"paragrafo 1\\n\\nparagrafo 2\\n\\nparagrafo 3"}]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

  try {
    const data = await httpsPost(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 8192 },
    });

    if (data.error) {
      console.error("Erro Gemini:", data.error.message);
      return [];
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    console.log("Gemini (300 chars):", text.slice(0, 300));

    let clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const si = clean.indexOf("[");
    const ei = clean.lastIndexOf("]");
    if (si !== -1 && ei !== -1) clean = clean.slice(si, ei + 1);

    try {
      return JSON.parse(clean);
    } catch(e) {
      console.log("JSON parse falhou, tentando recuperar...");
      return [];
    }
  } catch(e) {
    console.error("Erro Gemini:", e.message);
    return [];
  }
}

// ── SALVAR NO SUPABASE ────────────────────────────────────────────────────────
async function salvarNoticias(noticias, noticiasOriginais, categoria) {
  for (let i = 0; i < noticias.length; i++) {
    const n = noticias[i];
    if (!n.titulo || !n.conteudo) continue;

    // Verificar duplicata
    const { data: existing } = await supabase
      .from("noticias")
      .select("id")
      .ilike("titulo", n.titulo.slice(0, 40) + "%")
      .limit(1);

    if (existing && existing.length > 0) {
      console.log("Ja existe:", n.titulo.slice(0, 50));
      continue;
    }

    // Usar imagem real do RSS se disponivel, senao busca no Unsplash
    const originalImg = noticiasOriginais[i]?.imagem;
    let imagem;
    if (originalImg && originalImg.startsWith("http")) {
      imagem = originalImg;
    } else {
      imagem = await buscarImagem(n.titulo, categoria);
    }

    const { error } = await supabase.from("noticias").insert({
      titulo:     n.titulo,
      subtitulo:  n.subtitulo || "",
      conteudo:   n.conteudo,
      imagem_url: imagem,
      categoria:  categoria,
    });

    if (error) {
      console.error("Erro ao salvar:", error.message);
    } else {
      console.log("✓ Salvo:", n.titulo.slice(0, 60));
      console.log("  Imagem:", imagem.slice(0, 60));
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

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Radar da Bola - Auto Update ===");
  console.log("Horario:", new Date().toLocaleString("pt-BR"));

  if (!GEMINI_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error("ERRO: Variaveis de ambiente faltando!");
    process.exit(1);
  }

  const categorias = ["futebol", "formula1", "tenis", "basquete"];

  for (const categoria of categorias) {
    console.log(`\n========== ${categoria.toUpperCase()} ==========`);
    try {
      // 1. Busca noticias reais nos RSS
      console.log("Buscando nos portais esportivos...");
      const noticiasOriginais = await buscarRSS(categoria);
      console.log(`Total encontrado: ${noticiasOriginais.length} noticias`);

      if (noticiasOriginais.length === 0) {
        console.log("Nenhuma noticia encontrada nos RSS.");
        continue;
      }

      // 2. Gemini reescreve
      console.log("Reescrevendo com Gemini...");
      const noticiasReescritas = await reescreverComGemini(noticiasOriginais, categoria);
      console.log(`Reescritas: ${noticiasReescritas.length}`);

      // 3. Salva
      if (noticiasReescritas.length > 0) {
        await salvarNoticias(noticiasReescritas, noticiasOriginais, categoria);
      }
    } catch(e) {
      console.error(`Erro em ${categoria}:`, e.message);
    }

    // Pausa entre categorias
    await new Promise(r => setTimeout(r, 3000));
  }

  await limparNoticiasAntigas();
  console.log("\n=== Concluido! ===");
}

main();
