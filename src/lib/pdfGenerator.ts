import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AnalysisResult } from "./gemini";

interface PDFData {
  empresa: string;
  responsavel: string;
  funcionario: string;
  data: string;
  analise: AnalysisResult;
}

export function generatePDF(data: PDFData) {
  const doc = new jsPDF();
  const { empresa, responsavel, funcionario, data: dataDoc, analise } = data;

  // Configurações de estilo
  const margin = 20;
  let y = 30;

  // Cabeçalho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Contador de Padarias – Agente CP NR-1", 105, 15, { align: "center" });

  doc.setFontSize(14);
  doc.text("PLANO DE AÇÃO PSICOSSOCIAL / LAUDO DE RISCO HUMANIZADO", 105, 25, { align: "center" });

  // Informações Básicas
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Empresa:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(empresa || "Não informada", margin + 20, y);
  
  doc.setFont("helvetica", "bold");
  doc.text("Responsável:", 120, y);
  doc.setFont("helvetica", "normal");
  doc.text(responsavel || "Não informado", 145, y);
  
  y += 10;
  
  doc.setFont("helvetica", "bold");
  doc.text("Funcionário:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(funcionario || "Não informado", margin + 25, y);
  
  doc.setFont("helvetica", "bold");
  doc.text("Data:", 120, y);
  doc.setFont("helvetica", "normal");
  doc.text(dataDoc || new Date().toLocaleDateString("pt-BR"), 132, y);

  y += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y - 5, 190, y - 5);

  // Seções
  const sections = [
    { title: "Contexto inferido", content: analise.contextoInferido },
    { title: "Classificação do risco", content: `${analise.classificacaoRisco.toUpperCase()} - ${analise.justificativaRisco}` },
    { title: "Ações imediatas", content: analise.acoesImediatas.map(a => `• ${a}`).join("\n") },
    { title: "Comunicação sugerida", content: analise.comunicacaoSugerida.map(c => `"${c}"`).join("\n") },
  ];

  sections.forEach(section => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text(section.title, margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(section.content, 170);
    doc.text(splitText, margin, y);
    y += (splitText.length * 6) + 10;
  });

  // Tabela PGR
  if (y > 220) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.text("Registro (PGR – Programa de Gerenciamento de Riscos)", margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Fator", "Risco", "Ações", "Responsável", "Prazo", "Evidência"]],
    body: [[
      analise.registroPGR.fator,
      analise.registroPGR.risco,
      analise.registroPGR.acoes,
      analise.registroPGR.responsavel,
      analise.registroPGR.prazo,
      analise.registroPGR.evidencia
    ]],
    theme: "grid",
    headStyles: { fillColor: [100, 100, 100], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: margin, right: margin }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // Restante das seções
  const finalSections = [
    { title: "Revisão e métrica", content: `Prazo: ${analise.revisaoMetrica.prazo}\nIndicador: ${analise.revisaoMetrica.indicador}` },
    { title: "Quando escalar", content: analise.quandoEscalar },
    { title: "Pressupostos usados", content: analise.pressupostos.map(p => `• ${p}`).join("\n") },
  ];

  finalSections.forEach(section => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text(section.title, margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(section.content, 170);
    doc.text(splitText, margin, y);
    y += (splitText.length * 6) + 10;
  });

  doc.save(`Plano_Acao_NR1_${funcionario.replace(/\s+/g, "_") || "Geral"}.pdf`);
}
