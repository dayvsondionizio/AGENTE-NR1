import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AnalysisResult } from "./groq";

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

  const margin = 20;
  let y = 25;

  // Cabeçalho Corporativo e Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text((empresa || "EMPRESA NÃO INFORMADA").toUpperCase(), 105, y, { align: "center" });
  y += 8;
  
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text("RELATÓRIO DE AVALIAÇÃO DE FATORES PSICOSSOCIAIS", 105, y, { align: "center" });
  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("DIRETRIZES DA NORMA REGULAMENTADORA Nº 01 (GRO/PGR)", 105, y, { align: "center" });
  y += 12;

  // Linha Separadora
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, y, 190, y);
  y += 10;

  // Informações de Identificação
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  doc.setFont("helvetica", "bold");
  doc.text("Data da Avaliação:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(dataDoc ? new Date(dataDoc).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR"), 55, y);

  doc.setFont("helvetica", "bold");
  doc.text("Responsável/Gestor:", 100, y);
  doc.setFont("helvetica", "normal");
  doc.text(responsavel || "Não informado", 140, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.text("Colaborador(a):", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(funcionario || "Não informado", 50, y);
  y += 12;

  // Bloco de Conformidade Legal (Disclaimer)
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, 170, 22, "F");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const disclaimerText = "Este relatório tem caráter exclusivamente administrativo e preventivo em obediência à NR-01, compondo o processo de Gerenciamento de Riscos Ocupacionais (GRO). Seu objetivo é registrar ações de melhoria nas condições de trabalho. Não substitui avaliação clínica, laudo médico ou diagnóstico psicológico/psiquiátrico.";
  const disclaimerSplit = doc.splitTextToSize(disclaimerText, 160);
  doc.text(disclaimerSplit, margin + 5, y + 6);
  y += 32;

  // Seções Descritivas (Ocultando a Estratégia de Comunicação do papel)
  doc.setTextColor(0, 0, 0);
  const sections = [
    { title: "1. CONTEXTO E MÉTODO DE AVALIAÇÃO", content: `CONTEXTO INFERIDO:\n${analise.contextoInferido}\n\nMÉTODO DE IDENTIFICAÇÃO DO RISCO:\n${analise.metodoIdentificacao}` },
    { title: "2. CLASSIFICAÇÃO DE RISCO", content: `NÍVEL ${analise.classificacaoRisco.toUpperCase()}:\n${analise.justificativaRisco}` },
    { title: "3. AÇÕES PREVENTIVAS IMEDIATAS", content: analise.acoesImediatas.map(a => `• ${a}`).join("\n") }
  ];

  sections.forEach(section => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(section.title, margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(section.content, 170);
    doc.text(splitText, margin, y);
    y += (splitText.length * 5) + 8;
  });

  // Tabela PGR
  if (y > 220) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.text("4. REGISTRO PARA O PROGRAMA DE GERENCIAMENTO DE RISCOS (PGR)", margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Fator Identificado", "Risco Ocupacional", "Medida/Ação", "Responsável", "Prazo", "Evidência"]],
    body: [[
      analise.registroPGR.fator,
      analise.registroPGR.risco,
      analise.registroPGR.acoes,
      analise.registroPGR.responsavel,
      analise.registroPGR.prazo,
      analise.registroPGR.evidencia
    ]],
    theme: "grid",
    headStyles: { fillColor: [50, 50, 50], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: margin, right: margin }
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // Informações Finais (Removido escalonamento corporativo para não vazar pro funcionário)
  const finalSections = [
    { title: "5. PRAZO DE REVISÃO E MÉTRICA DE ACOMPANHAMENTO", content: `Prazo: ${analise.revisaoMetrica.prazo}\nIndicador Observado: ${analise.revisaoMetrica.indicador}` }
  ];

  finalSections.forEach(section => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text(section.title, margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(section.content, 170);
    doc.text(splitText, margin, y);
    y += (splitText.length * 5) + 8;
  });

  // Bloco de Assinaturas (Termo de Ciência)
  if (y > 200) {
    doc.addPage();
    y = 20;
  } else {
    y += 10;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, 190, y);
  y += 10;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TERMO DE CIÊNCIA E ACORDO MÚTUO", 105, y, { align: "center" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const termo = `Declaro para os devidos fins de direito, e em cumprimento às normativas da Reforma Trabalhista e NR-01, estar ciente das medidas preventivas aqui registradas. Comprometo-me a contribuir com as estratégias de melhoria do ambiente laborativo descritas neste documento, atestando o suporte e acompanhamento fornecidos ativamente pela empresa.`;
  const termoSplit = doc.splitTextToSize(termo, 170);
  doc.text(termoSplit, margin, y);
  y += 25;

  // Campos de Assinatura
  doc.setDrawColor(0, 0, 0);
  
  // Colaborador
  doc.line(margin, y, 90, y);
  doc.text("Assinatura do Colaborador", 55, y + 4, { align: "center" });
  doc.text(funcionario || "Nome do Colaborador", 55, y + 8, { align: "center" });

  // Empresa
  doc.line(120, y, 190, y);
  doc.text("Assinatura do Gestor/Empresa", 155, y + 4, { align: "center" });
  doc.text(responsavel || "Nome do Responsável", 155, y + 8, { align: "center" });

  y += 15;
  doc.text("Local e Data: _________________________________, _____/_____/_______", 105, y, { align: "center" });

  doc.save(`Laudo_NR1_${empresa?.replace(/\s+/g, "") || "Empresa"}_${funcionario?.replace(/\s+/g, "_") || "Colaborador"}.pdf`);
}
