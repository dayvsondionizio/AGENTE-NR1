import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coffee, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Send, 
  User, 
  Store, 
  Calendar,
  ChevronRight,
  Info,
  ShieldCheck
} from "lucide-react";
import { analyzeSituation, AnalysisResult } from "./lib/groq";
import { generatePDF } from "./lib/pdfGenerator";

export default function App() {
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    empresa: "",
    responsavel: "",
    funcionario: "",
    data: new Date().toISOString().split("T")[0]
  });

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
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-200">
              <Coffee className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Agente CP NR-1</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Decisão Humanizada</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Conformidade NR-1</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Intro */}
        {!result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Decisões seguras para quem cuida do pão de cada dia.
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Sou seu assistente especializado em fatores psicossociais. Descreva uma situação com seu colaborador 
              (estresse, fadiga, conflitos) e eu ajudarei você a agir com equilíbrio e segurança jurídica.
            </p>
          </motion.div>
        )}

        {/* Input Section */}
        <section className="mb-12">
          <form onSubmit={handleAnalyze} className="relative">
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Ex: Meu balconista está muito irritado nos horários de pico e começou a cometer erros no caixa..."
              className="w-full min-h-[160px] p-6 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none text-lg leading-relaxed placeholder:text-slate-300"
              disabled={loading}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-4">
              <button
                type="submit"
                disabled={loading || !situation.trim()}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200"
              >
                {loading ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Coffee className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    Analisar Agora
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sugestões:</span>
            <button onClick={() => setSituation("Fornada atrasada e equipe sob pressão constante.")} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full transition-colors">Fornada atrasada</button>
            <button onClick={() => setSituation("Conflito entre atendente e cliente no balcão.")} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full transition-colors">Conflito no balcão</button>
            <button onClick={() => setSituation("Sinais de cansaço extremo no padeiro do turno da noite.")} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full transition-colors">Fadiga noturna</button>
          </div>
        </section>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Diagnosis Card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <Info className="w-5 h-5 text-slate-600" />
                      </div>
                      <h3 className="text-xl font-bold">Diagnóstico Humanizado</h3>
                    </div>
                    <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 ${getRiscoColor(result.classificacaoRisco)}`}>
                      <AlertTriangle className="w-4 h-4" />
                      Risco {result.classificacaoRisco}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Contexto Inferido</h4>
                        <p className="text-slate-700 leading-relaxed">{result.contextoInferido}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Ações Imediatas</h4>
                        <ul className="space-y-3">
                          {result.acoesImediatas.map((acao, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-700">
                              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                              <span>{acao}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                        <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-3">Como falar com a equipe</h4>
                        <div className="space-y-3 italic text-orange-900">
                          {result.comunicacaoSugerida.map((frase, i) => (
                            <p key={i}>"{frase}"</p>
                          ))}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Quando Escalar</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{result.quandoEscalar}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PGR Section */}
                <div className="bg-slate-900 text-white p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck className="w-6 h-6 text-orange-400" />
                    <h3 className="text-lg font-bold">Registro PGR (Programa de Gerenciamento de Riscos)</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <span className="text-slate-400 block mb-1">Fator</span>
                      <span className="font-medium">{result.registroPGR.fator}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Risco</span>
                      <span className="font-medium">{result.registroPGR.risco}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Responsável</span>
                      <span className="font-medium">{result.registroPGR.responsavel}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Prazo</span>
                      <span className="font-medium">{result.registroPGR.prazo}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block mb-1">Evidência</span>
                      <span className="font-medium">{result.registroPGR.evidencia}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Form */}
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl"
                >
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Download className="w-5 h-5 text-orange-500" />
                    Gerar Laudo em PDF
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Store className="w-3 h-3" /> Nome da Padaria
                      </label>
                      <input
                        type="text"
                        value={formData.empresa}
                        onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                        placeholder="Ex: Padaria do Sol"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-3 h-3" /> Sócio Responsável
                      </label>
                      <input
                        type="text"
                        value={formData.responsavel}
                        onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                        placeholder="Seu nome"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-3 h-3" /> Nome do Funcionário
                      </label>
                      <input
                        type="text"
                        value={formData.funcionario}
                        onChange={(e) => setFormData({...formData, funcionario: e.target.value})}
                        placeholder="Nome do colaborador"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Data
                      </label>
                      <input
                        type="date"
                        value={formData.data}
                        onChange={(e) => setFormData({...formData, data: e.target.value})}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
                  >
                    Baixar Plano de Ação Completo
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-12 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Contador de Padarias - Agente CP NR-1</p>
        <p className="mt-2">Este agente auxilia na gestão humanizada, mas não substitui consultoria jurídica ou psicológica especializada.</p>
      </footer>
    </div>
  );
}
