// scripts/update-news.js
// Roda a cada 2h via GitHub Actions
// Busca noticias com Gemini e salva no Supabase

const { createClient } = require("@supabase/supabase-js");

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

async function buscarNoticias(categoria, tema) {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const prompt = `Voce e um jornalista esportivo brasileiro. Hoje e ${hoje}.

Crie 2 noticias esportivas recentes e realistas sobre: ${tema}

Responda APENAS com JSON valido neste formato exato, sem markdown, sem backticks:
[
  {
    "titulo": "titulo da noticia aqui",
    "subtitulo": "resumo de 1-2 frases aqui",
    "conteudo": "texto completo da noticia com 3 paragrafos separados por dois \\n\\n"
  },
  {
    "titulo": "titulo da segunda noticia",
    "subtitulo": "resumo de 1-2 frases",
    "conteudo": "texto completo com 3 paragrafos separados por dois \\n\\n"
  }
]`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
      }),
    }
  );

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

  // Limpar possiveis backticks do Gemini
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch(e) {
    console.error("Erro ao parsear JSON do Gemini:", e.message);
    console.error("Texto recebido:", text.slice(0, 200));
    return [];
  }
}

async function salvarNoticias(noticias, categoria) {
  for (const n of noticias) {
    if (!n.titulo || !n.conteudo) continue;

    // Verificar se ja existe noticia com titulo similar (evita duplicatas)
    const { data: existing } = await supabase
      .from("noticias")
      .select("id")
      .ilike("titulo", n.titulo.slice(0, 30) + "%")
      .limit(1);

    if (existing && existing.length > 0) {
      console.log("Noticia ja existe, pulando:", n.titulo.slice(0, 50));
      continue;
    }

    const { error } = await supabase.from("noticias").insert({
      titulo:     n.titulo,
      subtitulo:  n.subtitulo,
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

async function limparNotiiciasAntigas() {
  // Manter apenas as 50 noticias mais recentes
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

  if (!GEMINI_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error("ERRO: Variaveis de ambiente faltando!");
    process.exit(1);
  }

  for (const { categoria, tema } of TEMAS) {
    console.log(`\nBuscando noticias: ${categoria}...`);
    try {
      const noticias = await buscarNoticias(categoria, tema);
      console.log(`Recebidas ${noticias.length} noticias`);
      await salvarNoticias(noticias, categoria);
    } catch (e) {
      console.error(`Erro em ${categoria}:`, e.message);
    }
    // Pausa entre categorias para nao sobrecarregar a API
    await new Promise(r => setTimeout(r, 2000));
  }

  await limparNotiiciasAntigas();
  console.log("\n=== Concluido! ===");
}

main();
