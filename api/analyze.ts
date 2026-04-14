import { NR1_CONTEXT } from "./nr1Context";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { situation } = await req.json();

    if (!situation) {
      return new Response(JSON.stringify({ error: 'Situation is required' }), { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key não configurada no servidor Vercel.' }), { status: 500 });
    }

    const prompt = `
      Você é o Agente de Decisão Humanizada NR-1, criado pelo Contador de Padarias, operando como especialista da empresa de RH Negreiros.
      Sua missão é ajudar os gestores e empresários a tomarem decisões sobre colaboradores considerando fatores psicossociais e de saúde mental englobados pela NR-1 (GRO/PGR).

      CONTEXTO NORMATIVO DE REFERÊNCIA:
      ${NR1_CONTEXT}

      SITUAÇÃO / RELATO DO GESTOR:
      "${situation}"

      REGRAS DE RESPOSTA:
      - Use empatia, clareza corporativa e autoridade do RH.
      - Aja de modo que possa se aplicar a qualquer setor (escritório, indústria, restaurantes, etc). Evite exemplos exclusivos de padarias a menos que a situação cite uma padaria.
      - Classifique o risco como leve, moderado ou crítico.
      - Gere recomendações práticas e acionáveis, focando em organização do trabalho (pausas, metas, apoio).
      - Responda APENAS em JSON válido, sem markdown, sem code blocks (como \`\`\`json).

      FORMATO JSON DE SAÍDA (MANDATÓRIO):
      {
        "contextoInferido": "Breve descrição do contexto (ex: cenário de estresse, pressão)",
        "classificacaoRisco": "leve" | "moderado" | "crítico",
        "justificativaRisco": "Por que essa classificação?",
        "acoesImediatas": ["ação 1", "ação 2", "ação 3"],
        "comunicacaoSugerida": ["frase 1", "frase 2"],
        "registroPGR": {
          "fator": "Ex: ritmo intenso ou assédio/pressão",
          "risco": "Ex: estresse ocupacional",
          "acoes": "Ações preventivas para o setor",
          "responsavel": "Quem executa",
          "prazo": "Tempo para execução",
          "evidencia": "Como comprovar (atas, fotos, registros)"
        },
        "revisaoMetrica": {
          "prazo": "Ex: 15 ou 30 dias",
          "indicador": "O que observar para medir sucesso (clima, absenteísmo)"
        },
        "quandoEscalar": "Critérios para acionar o SST ou Psicologia",
        "pressupostos": ["Suposição considerada 1", "Suposição considerada 2"]
      }
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 500 });
    }

    const text = data.choices?.[0]?.message?.content || "";
    
    // Tentativa de limpar o texto retornado caso venha com markdown apesar da instrução
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      const firstNewline = cleaned.indexOf("\\n");
      const lastBackticks = cleaned.lastIndexOf("```");
      if(firstNewline !== -1 && lastBackticks !== -1) {
        cleaned = cleaned.substring(firstNewline + 1, lastBackticks).trim();
      }
    }

    return new Response(cleaned, { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500 });
  }
}
