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
      Sua missão é ajudar gestores a gerarem provas materiais de gestão de riscos psicossociais e estruturais para o GRO/PGR, resguardando a empresa e acolhendo o funcionário.

      CONTEXTO NORMATIVO DE REFERÊNCIA:
      ${NR1_CONTEXT}

      SITUAÇÃO / RELATO DO GESTOR:
      "${situation}"

      REGRAS DE RESPOSTA (MUITO IMPORTANTE):
      - Use empatia corporativa e autoridade do RH.
      - Classifique o risco como leve, moderado ou crítico.
      - NUNCA assuma ou invente "substâncias químicas", "agentes físicos ou biológicos" a menos que o gestor cite isso explicitamente no contexto! Se a queixa for sobre metas, cansaço ou brigas, os riscos são EXCLUSIVAMENTE PSICOSSOCIAIS ou ERGONÔMICOS.
      - INDIQUE COMO o risco foi identificado (MÉTODO). Se o gestor avisou por relato, o método é: "Observação diária e relato aberto do gestor".
      - No campo Evidência do PGR, NÃO sugira ideias genéricas. Sugira um DOCUMENTO FÍSICO (Ex: Ata de reunião assinada, Foto de quadro de escalas preenchido, Checklist impresso).
      - Na métrica de acompanhamento, o prazo DEVE SER CURTO (revisão de checagem em exatos 7 a 15 dias).
      - Responda APENAS em JSON válido, sem markdown, sem \`\`\`

      FORMATO JSON DE SAÍDA (MANDATÓRIO):
      {
        "contextoInferido": "Descrição assertiva do problema real reportado sem inventar fatos extras",
        "metodoIdentificacao": "Breve frase descrevendo como o risco foi avaliado (Ex: Observação diária no posto de trabalho + Entrevista verbal)",
        "classificacaoRisco": "leve" | "moderado" | "crítico",
        "justificativaRisco": "Por que essa classificação?",
        "acoesImediatas": ["ação prática 1", "ação prática 2"],
        "comunicacaoSugerida": ["frase de acolhimento e suporte"],
        "registroPGR": {
          "fator": "Ex: Relações interpessoais no trabalho ou Sobrecarga e metas",
          "risco": "Ex: Fator Psicossocial - Estresse Ocupacional Agudo",
          "acoes": "Medida tomada hoje (Ex: Redistribuição momentânea de carga, Pausa de 15 min autorizada)",
          "responsavel": "Quem gerencia",
          "prazo": "Imediato",
          "evidencia": "Documento físico recomendável (Ex: Controle de Ponto com pausa, Ata de feedabck assinada, Foto do quadro de escala)"
        },
        "revisaoMetrica": {
          "prazo": "7 dias (Acompanhamento Crítico e Visível)",
          "indicador": "O que observar nesses 7 dias na prática"
        },
        "quandoEscalar": "Critérios para acionar a Medicina do Trabalho (SST)",
        "pressupostos": ["Suposições consideradas a partir da fala"]
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
        temperature: 0.2
      })
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 500 });
    }

    const text = data.choices?.[0]?.message?.content || "";
    
    // Limpeza de markdown code block caso a IA coloque acidentalmente
    let cleaned = text.trim();
    if (cleaned.startsWith("\`\`\`")) {
      const firstNewline = cleaned.indexOf("\\n");
      const lastBackticks = cleaned.lastIndexOf("\`\`\`");
      if(firstNewline !== -1 && lastBackticks !== -1) {
        cleaned = cleaned.substring(firstNewline + 1, lastBackticks).trim();
      }
    }

    // fallback limpeza se tiver ```json
    cleaned = cleaned.replace(/^\`\`\`json/m, "").replace(/\`\`\`$/m, "").trim();

    return new Response(cleaned, { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500 });
  }
}
