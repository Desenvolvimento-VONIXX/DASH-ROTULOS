import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { useGetRespostasCheck } from "@/hook/GrupoProdutos/getRespostasChecklist";
import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../ui/table";
import { Button } from "../ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileDown } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  idClick: number | null;
  idAtividade: number | null;
}

interface Resposta {
  PERGUNTA: string;
  RESPOSTA: string;
  OBS?: string;
  NOME: string;
  DATA_FORMATADA: string;
  NOMEUSU: string;
}

const opcoesRespostas = ["CF", "NC", "NA"];

const VerChecklist: React.FC<Props> = ({
  open,
  onClose,
  idClick,
  idAtividade,
}) => {
  const { data: respostas } = useGetRespostasCheck(idClick, idAtividade);

  const calcularPorcentagens = (respostas: any[]) => {
    const totals = { CF: 0, NC: 0, NA: 0 };
    respostas.forEach((item) => {
      if (item.RESPOSTA === "CF") totals.CF++;
      if (item.RESPOSTA === "NC") totals.NC++;
      if (item.RESPOSTA === "NA") totals.NA++;
    });

    const totalRespostas = respostas.length;
    return {
      CF: (totals.CF / totalRespostas) * 100,
      NC: (totals.NC / totalRespostas) * 100,
      NA: (totals.NA / totalRespostas) * 100,
    };
  };

  const porcentagens = respostas
    ? calcularPorcentagens(respostas)
    : { CF: 0, NC: 0, NA: 0 };

  useEffect(() => {
    console.log(respostas);
  }, [respostas]);

  const exportarParaPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const marginLeft = 10;
    const imageWidth = 55;
    const imageHeight = 20;

    let startY = 10;
    let pageNumber = 1;

    const centerX = (pageWidth - imageWidth) / 2;

    doc.addImage(
      "/Imagem1.jpg",
      "JPEG",
      centerX,
      startY,
      imageWidth,
      imageHeight
    );
    startY += imageHeight + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Checklist de Avaliação", marginLeft, startY);
    startY += 10;

    if (!respostas || respostas.length === 0) {
      doc.setFontSize(12);
      doc.text("Nenhuma resposta encontrada.", marginLeft, startY);
      doc.text(
        `Página ${pageNumber}`,
        pageWidth - 30,
        doc.internal.pageSize.height - 10
      );
      doc.save(`Checklist_${idAtividade}.pdf`);
      return;
    }

    doc.setFontSize(12);
    doc.text(`Checklist: ${respostas[0].NOME}`, marginLeft, startY);
    startY += 6;

    doc.text(`Produto: ${respostas[0].PROD}`, marginLeft, startY);
    startY += 6;

    doc.text(
      `Data da realização: ${respostas[0].DATA_FORMATADA}`,
      marginLeft,
      startY
    );
    startY += 6;

    doc.text(
      `Responsável pela Verificação: ${respostas[0].NOMEUSU}`,
      marginLeft,
      startY
    );
    startY += 10;

    respostas.forEach((item: Resposta, index: number) => {
      doc.setFont("helvetica", "bold");
      const splitPergunta = doc.splitTextToSize(
        `${index + 1}. ${item.PERGUNTA}`,
        pageWidth - 20
      );

      if (
        startY + splitPergunta.length * 6 >
        doc.internal.pageSize.height - 20
      ) {
        doc.addPage();
        pageNumber++;
        startY = 20;
      }

      doc.text(splitPergunta, marginLeft, startY);
      startY += splitPergunta.length * 6;

      const opcoesRespostas = ["CF", "NC", "NA"];
      doc.setFont("helvetica", "normal");

      opcoesRespostas.forEach((opcao, index) => {
        const marcado = item.RESPOSTA === opcao ? "X" : " ";
        if (startY + 6 > doc.internal.pageSize.height - 20) {
          doc.addPage();
          pageNumber++;
          startY = 20;
        }
        doc.text(`[${marcado}] ${opcao}`, marginLeft + 5, startY + index * 6);
      });

      startY += opcoesRespostas.length * 6 + 2;

      if (item.OBS) {
        doc.setFont("helvetica", "italic");
        const splitObs = doc.splitTextToSize(
          `Observação: ${item.OBS}`,
          pageWidth - 30
        );

        if (startY + splitObs.length * 6 > doc.internal.pageSize.height - 20) {
          doc.addPage();
          pageNumber++;
          startY = 20;
        }
        doc.text(splitObs, marginLeft + 5, startY);
        startY += splitObs.length * 6 + 2;
      }

      startY += 2;

      if (startY > doc.internal.pageSize.height - 30) {
        doc.addPage();
        pageNumber++;
        startY = 20;
      }
    });

    if (startY > doc.internal.pageSize.height - 50) {
      doc.addPage();
      pageNumber++;
      startY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Resumo", marginLeft, startY);
    doc.setTextColor("black");
    startY += 10;

    autoTable(doc, {
      startY,
      head: [["Opção", "Porcentagem (%)"]],
      body: [
        ["CF", `${porcentagens.CF.toFixed(2)}%`],
        ["NC", `${porcentagens.NC.toFixed(2)}%`],
        ["NA", `${porcentagens.NA.toFixed(2)}%`],
      ],
      theme: "grid",
      styles: { fontSize: 12, halign: "center" },
      headStyles: { fillColor: [200, 200, 200] },
      columnStyles: { 1: { halign: "right" } },
    });

    doc.save(`Checklist_${idClick}_${idAtividade}.pdf`);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="min-w-[50%]">
        <SheetHeader>
          <SheetTitle className="text-2xl font-semibold text-gray-800 mb-3">
            Avaliação do Rótulo/Cartonado
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[80vh] rounded-md border">
          {respostas?.length > 0 ? (
            <div className="p-5 rounded-sm">
              <div className="bg-gray-200 p-4 rounded-md mb-6">
                <p className="text-md text-gray-700 uppercase">
                  <strong>Checklist:</strong> {respostas[0].NOME}
                </p>
                <Button
                  onClick={exportarParaPDF}
                  className="mt-2 w-full flex items-center gap-1"
                  variant={"outline"}
                >
                  <FileDown className="w-5 h-5" />
                  Baixar PDF
                </Button>
              </div>

              {respostas.map((item: any, index: number) => (
                <div
                  key={index}
                  className="mb-4 p-4 rounded-lg bg-white shadow-md border border-gray-300"
                >
                  <p className="font-medium text-gray-900 uppercase">
                    {item.PERGUNTA}
                  </p>

                  <div className="flex gap-6 mt-3">
                    {opcoesRespostas.map((opcao) => (
                      <label key={opcao} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.RESPOSTA === opcao}
                          disabled
                          className="w-5 h-5 accent-blue-600 cursor-not-allowed"
                        />
                        <span
                          className={`px-3 py-1 rounded-md text-sm font-semibold text-white
                            ${
                              opcao === "CF"
                                ? "bg-green-500"
                                : opcao === "NC"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }`}
                        >
                          {opcao}
                        </span>
                      </label>
                    ))}
                  </div>

                  {item.OBS && (
                    <p className="text-sm text-gray-600 mt-3 p-2 bg-gray-50 rounded-md border border-gray-200">
                      <strong>Observação:</strong> {item.OBS}
                    </p>
                  )}
                </div>
              ))}

              <div className="mt-6">
                <Table className="min-w-full table-auto bg-white rounded-lg shadow-sm overflow-hidden">
                  <TableHeader>
                    <TableRow className="bg-gray-100 text-gray-900">
                      <TableHead className="py-3 px-4 text-left text-sm font-semibold">
                        Opção
                      </TableHead>
                      <TableHead className="py-3 px-4 text-left text-sm font-semibold">
                        Porcentagem (%)
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow>
                      <TableCell className="py-3 px-4 text-sm text-green-700 border-t border-b ">
                        CF
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm text-gray-800 border-t border-b font-semibold">
                        {porcentagens.CF.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-3 px-4 text-sm text-red-700 border-t border-b">
                        NC
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm text-gray-800 border-t border-b font-semibold">
                        {porcentagens.NC.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-3 px-4 text-sm text-yellow-700 border-t border-b">
                        NA
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm text-gray-800 border-t border-b font-semibold">
                        {porcentagens.NA.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-5">
              Nenhuma resposta encontrada.
            </p>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default VerChecklist;
