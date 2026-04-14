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
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ situation })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || "Erro ao consultar a API.");
  }
  
  // Data retornado por Vercel Edge handler já é JSON
  return data as AnalysisResult;
}