import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Send, 
  User, 
  Store, 
  Calendar,
  ChevronRight,
  Info,
  ShieldCheck,
  Mic,
  MicOff
} from "lucide-react";
import { analyzeSituation, AnalysisResult } from "./lib/groq";
import { generatePDF } from "./lib/pdfGenerator";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function App() {
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const [formData, setFormData] = useState({
    empresa: "",
    responsavel: "",
    funcionario: "",
    data: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isRecording && recognition) {
      recognition.stop();
      setIsRecording(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'pt-BR';

    let finalTranscript = situation ? situation + " " : "";

    rec.onresult = (event: any) => {
      let interimTranscript = '';
      let currentFinal = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          currentFinal += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      finalTranscript += currentFinal;
      setSituation(finalTranscript + interimTranscript);
    };

    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);

    try {
      rec.start();
      setRecognition(rec);
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim()) return;

    setLoading(true);
    try {
      const analysis = await analyzeSituation(situation);
      setResult(analysis);
      setShowForm(true);
    } catch (error) {
      alert("Ocorreu um erro na análise. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    generatePDF({
      ...formData,
      analise: result
    });
  };

  const getRiscoColor = (risco: string) => {
    switch (risco) {
      case "leve": return "text-green-600 bg-green-50 border-green-200";
      case "moderado": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "crítico": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-800 font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 md:p-2.5 rounded-xl shadow-lg shadow-orange-200">
              <User className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg leading-tight">Negreiros RH</h1>
              <p className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wider">Gestão Preventiva</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs md:text-sm bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
            <span className="font-medium">NR-01</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Intro */}
        {!result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 md:mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 px-2">
              Decisões seguras e humanizadas para suas equipes.
            </h2>
            <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed px-4">
              Sou seu assistente corporativo especializado em fatores psicossociais. Descreva a situação 
              ou o comportamento (estresse, conflitos) e ajudarei a registrar ações preventivas no PGR.
            </p>
          </motion.div>
        )}

        {/* Input Section */}
        <section className="mb-10 md:mb-12">
          <form onSubmit={handleAnalyze} className="relative">
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Ex: Minha equipe está cobrindo faltas frequentes, o que gerou sobrecarga e irritação..."
              className="w-full min-h-[140px] md:min-h-[160px] p-4 md:p-6 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none text-base md:text-lg leading-relaxed placeholder:text-slate-400 pb-20"
              disabled={loading}
            />
            
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse border border-red-100">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                Gravando...
              </div>
            )}

            <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 flex items-center gap-2 md:gap-4">
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={loading}
                  className={`p-3 md:p-3.5 rounded-xl transition-all shadow-sm ${
                    isRecording 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200 scale-105' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={isRecording ? "Parar gravação" : "Falar por voz"}
                >
                  {isRecording ? <MicOff className="w-5 h-5 md:w-5 md:h-5" /> : <Mic className="w-5 h-5 md:w-5 md:h-5" />}
                </button>
              )}

              <button
                type="submit"
                disabled={loading || !situation.trim()}
                className="bg-slate-900 text-white px-5 md:px-6 py-3 md:py-3.5 rounded-xl text-sm md:text-base font-semibold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-slate-200"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <User className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.div>
                ) : (
                  <>
                    <span className="hidden sm:inline">Analisar Caso</span>
                    <span className="sm:hidden">Analisar</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-4 flex flex-wrap gap-2 md:gap-3 px-1">
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest self-center mr-1">Sugestões:</span>
            <button onClick={() => setSituation("Equipe trabalhando com metas inatingíveis e sob pressão constante do gestor imediato.")} className="text-[11px] md:text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors truncate max-w-full">Pressão por Metas</button>
            <button onClick={() => setSituation("Conflito aberto entre colaboradores devido a falha de comunicação e sobrecarga.")} className="text-[11px] md:text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors truncate max-w-full">Conflito na Equipe</button>
            <button onClick={() => setSituation("Colaborador apresentando sinais de exaustão e desmotivação após longo período sem pausas compensatórias.")} className="text-[11px] md:text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors truncate max-w-full">Fadiga e Esgotamento</button>
          </div>
        </section>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 md:space-y-8"
            >
              {/* Diagnosis Card */}
              <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-5 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg hidden sm:block">
                        <Info className="w-5 h-5 text-slate-600" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold">Diagnóstico Preventivo</h3>
                    </div>
                    <div className={`px-4 py-2 rounded-full border text-xs md:text-sm font-bold flex items-center justify-center gap-2 ${getRiscoColor(result.classificacaoRisco)}`}>
                      <AlertTriangle className="w-4 h-4" />
                      Risco {result.classificacaoRisco}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[11px] md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Contexto Inferido</h4>
                        <p className="text-sm md:text-base text-slate-700 leading-relaxed mb-4">{result.contextoInferido}</p>
                        
                        <h4 className="text-[11px] md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Método de Identificação</h4>
                        <p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{result.metodoIdentificacao}</p>
                      </div>
                      <div>
                        <h4 className="text-[11px] md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Ações Imediatas Sugeridas</h4>
                        <ul className="space-y-3">
                          {result.acoesImediatas.map((acao, i) => (
                            <li key={i} className="flex items-start gap-2 md:gap-3 text-sm md:text-base text-slate-700">
                              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500 shrink-0 mt-0.5" />
                              <span>{acao}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                      <div className="bg-orange-50 p-4 md:p-6 rounded-2xl border border-orange-100">
                        <h4 className="text-[11px] md:text-sm font-bold text-orange-800 uppercase tracking-wider mb-3">Abordagem de Comunicação</h4>
                        <div className="space-y-3 italic text-orange-900 text-sm md:text-base">
                          {result.comunicacaoSugerida.map((frase, i) => (
                            <p key={i}>"{frase}"</p>
                          ))}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100">
                        <h4 className="text-[11px] md:text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Quando Escalar a Situação</h4>
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{result.quandoEscalar}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PGR Section */}
                <div className="bg-slate-900 text-white p-5 md:p-8">
                  <div className="flex items-center gap-3 mb-5 md:mb-6">
                    <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
                    <h3 className="text-base md:text-lg font-bold">Diretriz para o PGR (NR-01)</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 text-xs md:text-sm">
                    <div>
                      <span className="text-slate-400 block mb-1 text-[10px] md:text-xs uppercase font-bold">Fator</span>
                      <span className="font-medium text-slate-100">{result.registroPGR.fator}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1 text-[10px] md:text-xs uppercase font-bold">Risco</span>
                      <span className="font-medium text-slate-100">{result.registroPGR.risco}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1 text-[10px] md:text-xs uppercase font-bold">Responsável</span>
                      <span className="font-medium text-slate-100">{result.registroPGR.responsavel}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1 text-[10px] md:text-xs uppercase font-bold">Prazo</span>
                      <span className="font-medium text-slate-100">{result.registroPGR.prazo}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block mb-1 text-[10px] md:text-xs uppercase font-bold">Evidência Comprobatória</span>
                      <span className="font-medium text-slate-100">{result.registroPGR.evidencia}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Form */}
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-xl"
                >
                  <h3 className="text-lg md:text-xl font-bold mb-5 md:mb-6 flex items-center gap-2">
                    <Download className="w-5 h-5 text-orange-500" />
                    Gerar Laudo Profissional (PDF)
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="space-y-2">
                      <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Store className="w-3 h-3" /> Empresa Avaliada
                      </label>
                      <input
                        type="text"
                        value={formData.empresa}
                        onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                        placeholder="Ex: Empresa Modelo S/A"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm md:text-base bg-slate-50 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-3 h-3" /> Gestor Responsável
                      </label>
                      <input
                        type="text"
                        value={formData.responsavel}
                        onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                        placeholder="Seu nome"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm md:text-base bg-slate-50 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-3 h-3" /> Colaborador(a) Relacionado(a)
                      </label>
                      <input
                        type="text"
                        value={formData.funcionario}
                        onChange={(e) => setFormData({...formData, funcionario: e.target.value})}
                        placeholder="Nome do funcionário"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm md:text-base bg-slate-50 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Data do Laudo
                      </label>
                      <input
                        type="date"
                        value={formData.data}
                        onChange={(e) => setFormData({...formData, data: e.target.value})}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm md:text-base bg-slate-50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="w-full bg-orange-500 text-white py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
                  >
                    Baixar Termo e Laudo em PDF
                    <Download className="w-4 h-4 md:w-5 md:h-5 ml-1" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-10 md:py-12 text-center text-slate-400 text-xs md:text-sm border-t border-slate-100 mt-10">
        <p className="font-semibold text-slate-500">© {new Date().getFullYear()} Negreiros RH - Gestão de Fatores Psicossociais</p>
        <p className="mt-2 text-[10px] md:text-xs">Sistema de apoio e registro administrativo (NR-01). Não tem validade de laudo clínico.</p>
      </footer>
    </div>
  );
}
