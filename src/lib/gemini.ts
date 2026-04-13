import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

export async function analyzeSituation(situation: string): Promise<AnalysisResult> {
  const prompt = `
    Você é o Agente de Decisão Humanizada NR-1, criado pelo Contador de Padarias.
    Sua missão é ajudar empresários de padarias a tomarem decisões sobre colaboradores considerando fatores psicossociais da NR-1.

    SITUAÇÃO: "${situation}"

    REGRAS DE RESPOSTA:
    - Use empatia, simplicidade e autoridade de dono de padaria.
    - Classifique o risco como leve, moderado ou crítico.
    - Gere recomendações práticas e acionáveis.
    - Siga estritamente o formato JSON abaixo.

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

    Responda APENAS o JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const text = response.text;
  
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Falha ao processar a análise. Tente novamente.");
  }
}
