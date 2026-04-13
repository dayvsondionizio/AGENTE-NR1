export interface AnalysisResult {
  contextoInferido: string;
  classificacaoRisco: "leve" | "moderado" | "crítico";
  justificativaRisco: string;
  acoesImediatas: string[];
  comunicacaoSugerida: string[];
  registroPGR: {
    fator: string;
    risco: string;
    acoes: string;
    responsavel: string;
    prazo: string;
    evidencia: string;
  };
  revisaoMetrica: {
    prazo: string;
    indicador: string;
  };
  quandoEscalar: string;
  pressupostos: string[];
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    const firstNewline = cleaned.indexOf("\n");
    const lastBackticks = cleaned.lastIndexOf("```");
    cleaned = cleaned.substring(firstNewline + 1, lastBackticks).trim();
  }
  return cleaned;
}

export async function analyzeSituation(situation: string): Promise<AnalysisResult> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string;
  
  if (!apiKey) {
    console.error("VITE_GROQ_API_KEY não encontrada");
    throw new Error("API Key não configurada");
  }

  const prompt = `
    Você é o Agente de Decisão Humanizada NR-1, criado pelo Contador de Padarias.
    Sua missão é ajudar empresários de padarias a tomarem decisões sobre colaboradores considerando fatores psicossociais da NR-1.

    SITUAÇÃO: "${situation}"

    REGRAS DE RESPOSTA:
    - Use empatia, simplicidade e autoridade de dono de padaria.
    - Classifique o risco como leve, moderado ou crítico.
    - Gere recomendações práticas e acionáveis.
    - Responda APENAS em JSON válido, sem markdown, sem code blocks.

    FORMATO JSON DE SAÍDA:
    {
      "contextoInferido": "Breve descrição da situação no ambiente de padaria",
      "classificacaoRisco": "leve" | "moderado" | "crítico",
      "justificativaRisco": "Por que essa classificação?",
      "acoesImediatas": ["ação 1", "ação 2", "ação 3"],
      "comunicacaoSugerida": ["frase 1", "frase 2", "frase 3"],
      "registroPGR": {
        "fator": "Fator de risco psicossocial",
        "risco": "Descrição do risco no PGR",
        "acoes": "Ações preventivas",
        "responsavel": "Quem executa",
        "prazo": "Tempo para execução",
        "evidencia": "Como comprovar"
      },
      "revisaoMetrica": {
        "prazo": "30 dias",
        "indicador": "O que observar para medir sucesso"
      },
      "quandoEscalar": "Critérios para buscar apoio especializado (SST/Psicologia)",
      "pressupostos": ["Suposição 1", "Suposição 2"]
    }

    Responda APENAS o JSON válido, sem texto adicional.
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
    throw new Error(`Erro: ${data.error.message}`);
  }
  
  const text = data.choices?.[0]?.message?.content || "";
  
  try {
    return JSON.parse(cleanJsonResponse(text));
  } catch (error) {
    console.error("Parse error:", text);
    throw new Error("Falha ao processar a análise");
  }
}