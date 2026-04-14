export interface AnalysisResult {
  contextoInferido: string;
  metodoIdentificacao: string;
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
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ situation }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao analisar a situação');
  }

  return response.json();
}