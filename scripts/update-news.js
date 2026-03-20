// scripts/update-news.js
const { createClient } = require("@supabase/supabase-js");
const https = require("https");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const GEMINI_KEY   = process.env.GEMINI_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TEMAS = [
  { categoria:"futebol",  tema:"futebol brasileiro, Brasileirao, Libertadores, Selecao Brasileira, Copa do Brasil" },
  { categoria:"formula1", tema:"Formula 1 2026, corridas, pilotos, Gabriel Bortoleto, Verstappen, Hamilton" },
  { categoria:"tenis",    tema:"tenis, ATP, WTA, Grand Slam, Joao Fonseca, Sinner, Swiatek" },
  { categoria:"basquete", tema:"NBA 2026, basquete, jogos, resultados, playoffs" },
];

const IMAGENS = {
  futebol:  [
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&q=80",
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=80",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=80",
  ],
  formula1: [
    "https://images.unsplash.com/photo-1518364538800-6bae3c2ea0f2?w=900&q=80",
    "https://images.unsplash.com/photo-1541348263662-e068662d82af?w=900&q=80",
  ],
  tenis: [
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&q=80",
    "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=900&q=80",
  ],
  basquete: [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80",
    "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=900&q=80",
  ],
};

function getImagem(categoria) {
  const imgs = IMAGENS[categoria] || IMAGENS.futebol;
  return imgs[Math.floor(Math.random() * imgs.length)];
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
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { reject(new Error("JSON parse error: " + body.slice(0,200))); }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function buscarNoticias(categoria, tema) {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const prompt = `Voce e um jornalista esportivo brasileiro. Hoje e ${hoje}.

Crie 2 noticias esportivas recentes e realistas sobre: ${tema}

Responda APENAS com JSON valido neste formato, sem markdown, sem backticks, sem texto extra:
[{"titulo":"titulo aqui","subtitulo":"resumo de 1-2 frases","conteudo":"paragrafo 1\\n\\nparagrafo 2\\n\\nparagrafo 3"},{"titulo":"titulo 2","subtitulo":"resumo","conteudo":"paragrafo 1\\n\\nparagrafo 2\\n\\nparagrafo 3"}]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`;
  
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
  };

  try {
    const data = await httpsPost(url, body);
    
    if (data.error) {
      console.error("Erro da API Gemini:", data.error.message);
      return [];
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    console.log("Resposta Gemini (primeiros 200 chars):", text.slice(0, 200));
    
    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(clean);
  } catch(e) {
    console.error("Erro ao buscar noticias:", e.message);
    return [];
  }
}

async function salvarNoticias(noticias, categoria) {
  for (const n of noticias) {
    if (!n.titulo || !n.conteudo) {
      console.log("Noticia invalida, pulando");
      continue;
    }

    const { data: existing } = await supabase
      .from("noticias")
      .select("id")
      .ilike("titulo", n.titulo.slice(0, 30) + "%")
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
      console.log("Salvo com sucesso:", n.titulo.slice(0, 60));
    }
  }
}

async function limparNoticiasAntigas() {
  const { data } = await supabase
    .from("noticias")
    .select("id")
    .order("created_at", { ascending: false });

  if (data && data.length > 50) {
    const idsParaApagar = data.slice(50).map(n => n.id);
    await supabase.from("noticias").delete().in("id", idsParaApagar);
    console.log("Apagadas", idsParaApagar.length, "noticias antigas");
  }
}

async function main() {
  console.log("=== Radar da Bola - Auto Update ===");
  console.log("Horario:", new Date().toLocaleString("pt-BR"));

  if (!GEMINI_KEY) { console.error("ERRO: GEMINI_KEY nao definida!"); process.exit(1); }
  if (!SUPABASE_URL) { console.error("ERRO: SUPABASE_URL nao definida!"); process.exit(1); }
  if (!SUPABASE_KEY) { console.error("ERRO: SUPABASE_SERVICE_KEY nao definida!"); process.exit(1); }

  console.log("Gemini Key:", GEMINI_KEY.slice(0,8) + "...");
  console.log("Supabase URL:", SUPABASE_URL);

  // Listar modelos disponíveis
  try {
    const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`;
    const modelsRes = await new Promise((resolve, reject) => {
      const https = require("https");
      const req = https.get(modelsUrl, (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => resolve(JSON.parse(body)));
      });
      req.on("error", reject);
    });
    const names = (modelsRes.models || []).map(m => m.name);
    console.log("Modelos disponíveis:", names.join(", "));
  } catch(e) {
    console.log("Erro ao listar modelos:", e.message);
  }

  for (const { categoria, tema } of TEMAS) {
    console.log(`\nBuscando: ${categoria}...`);
    try {
      const noticias = await buscarNoticias(categoria, tema);
      console.log(`Recebidas ${noticias.length} noticias`);
      if (noticias.length > 0) {
        await salvarNoticias(noticias, categoria);
      }
    } catch (e) {
      console.error(`Erro em ${categoria}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  await limparNoticiasAntigas();
  console.log("\n=== Concluido! ===");
}

main();
