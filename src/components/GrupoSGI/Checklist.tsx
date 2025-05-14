import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { useEffect, useState } from "react";
import { useGetPerguntasChecklist } from "@/hook/GrupoSGI/getPerguntasChecklist";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { getCurrentDate } from "@/utils/nowDate";
import { toast } from "sonner";
import { getUsuLog } from "@/utils/usuarioLogado";
import { CheckCircle, MoveLeft } from "lucide-react";
import { useGetRespostasCheckLog } from "@/hook/GrupoSGI/getLogRespostas";

interface Props {
  open: boolean;
  onClose: () => void;
  idClick: number | null;
  idAtividade: number | null;
  refetchRotulo: () => void;
  refetchRotuloProduto: () => void;
  refetchLinhaTempo: () => void;
}

interface Checklist {
  ID_CKECKLIST: number;
  NOME: string;
}

const opcoesRespostas = ["CF", "NC", "NA"];

const Checklist: React.FC<Props> = ({
  open,
  onClose,
  idClick,
  idAtividade,
  refetchLinhaTempo,
  refetchRotulo,
  refetchRotuloProduto,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const [idChecklist, setIdChecklist] = useState<number | null>(null);
  const [checklists, setChecklists] = useState<Checklist[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [respostas, setRespostas] = useState<{
    [key: number]: { resposta: string; observacao: string; idLog?: number };
  }>({});
  const codUsuLog = getUsuLog();
  const dataAtual = getCurrentDate();

  const { data: respostasLog, refetch: refetchRespostaLog } =
    useGetRespostasCheckLog(idClick, idAtividade);

  const { data: perguntas, refetch: refetchPerguntasCheck } =
    useGetPerguntasChecklist(idChecklist);
  console.log(dataAtual);

  useEffect(() => {
    const fetchChecklists = async () => {
      setLoading(true);
      const response: Checklist[] = await JX.consultar(
        "SELECT ID_CKECKLIST, NOME FROM AD_CHECKLISTSGI WHERE ATIVO = 'S'"
      );
      setChecklists(response || []);
      setLoading(false);
    };

    fetchChecklists();
  }, []);

  useEffect(() => {
    if (respostasLog && respostasLog.length > 0 && idChecklist === null) {
      setIdChecklist(respostasLog[0].ID_CHECKLIST);
    }
  }, [respostasLog]);

  useEffect(() => {
    if (idChecklist && respostasLog && respostasLog.length > 0) {
      const respostasPreenchidas: {
        [key: number]: { resposta: string; observacao: string; idLog?: number };
      } = {};

      respostasLog.forEach((item: any) => {
        if (item.ID_CHECKLIST === idChecklist) {
          respostasPreenchidas[item.ID_PERGUNTA] = {
            resposta: item.RESPOSTA,
            observacao: item.OBS || "",
            idLog: item.ID_LOG,
          };
        }
      });

      setRespostas(respostasPreenchidas);
    }
  }, [idChecklist, respostasLog]);

  const handleRespostaChange = (idPergunta: number, resposta: string) => {
    setRespostas((prev) => {
      const novaResposta = { ...prev[idPergunta], resposta };
      salvarLogResposta({
        idPergunta,
        resposta,
        observacao: novaResposta.observacao,
      });
      return {
        ...prev,
        [idPergunta]: novaResposta,
      };
    });
  };

  const handleObservacaoChange = (idPergunta: number, observacao: string) => {
    setRespostas((prev) => {
      const novaResposta = { ...prev[idPergunta], observacao };
      salvarLogResposta({
        idPergunta,
        resposta: novaResposta.resposta,
        observacao,
      });
      return {
        ...prev,
        [idPergunta]: novaResposta,
      };
    });
  };

  const todasRespondidas = perguntas?.every(
    (item: any) => respostas[item.ID_PERGUNTA]?.resposta
  );

  const handleSubmit = async () => {
    setIsSaving(true);

    let status = "APROVADO";

    for (const item of perguntas || []) {
      if (respostas[item.ID_PERGUNTA]?.resposta === "NC") {
        status = "REPROVADO";
        break;
      }
    }

    try {
      const response = await JX.salvar(
        {
          ID_ROTULO: idClick,
          DATA: dataAtual,
          STATUS: status,
          CODUSU: codUsuLog,
          CHECKLISTREALIZADO: "S",
        },
        "AD_ROTULOSATIVIDADE",
        []
      );

      if (response.status === "1") {
        const id = response.responseBody.entities.entity.ID_ATIVIDADE.$;

        await Promise.all([
          enviaRespostas(id),
          atualizaCheckRealizado(),
          atualizarStatusRotulo(status),
          refetchLinhaTempo(),
          refetchRotulo(),
          refetchRotuloProduto(),
        ]);

        toast.success("Rótulo/Cartonado avaliado com sucesso!", {
          duration: 4000,
          icon: <CheckCircle size={20} color="green" />,
        });
      } else {
        console.error(response.statusMessage);
      }
    } catch (error) {
      console.error("Erro ao enviar atividade:", error);
    } finally {
      setIsSaving(false);
      refetchLinhaTempo(), refetchRotulo(), refetchRotuloProduto(), onClose();
    }
  };

  const atualizaCheckRealizado = async () => {
    try {
      const response = await JX.salvar(
        { CHECKLISTREALIZADO: "S" },
        "AD_ROTULOSATIVIDADE",
        [{ ID_ROTULO: idClick, ID_ATIVIDADE: idAtividade }]
      );
      if (response.status === "1") {
        console.log("Check realizado atualizado na AD_ROTULOS!");
      } else {
        console.error(response.statusMessage);
      }
    } catch (error) {
      console.error("Erro ao atualizar check realizado:", error);
    }
  };

  const atualizarStatusRotulo = async (status: string) => {
    let statusRotulo = null;
    if (status === "APROVADO") {
      statusRotulo = "FINALIZADA";
    } else if (status === "REPROVADO") {
      statusRotulo = "REPROVADA";
    }

    try {
      let response;
      if (status === "APROVADO") {
        response = await JX.salvar(
          {
            STATUS: statusRotulo,
            FINALIZADOSGI: "S",
            DATA_FINALIZACAO: dataAtual,
          },
          "AD_ROTULOS",
          [{ ID_ROTULO: idClick }]
        );
      } else {
        response = await JX.salvar(
          { STATUS: statusRotulo, FINALIZADOSGI: "S" },
          "AD_ROTULOS",
          [{ ID_ROTULO: idClick }]
        );
      }

      if (response.status === "1") {
        console.log("Status atualizado na AD_ROTULOS!");
      } else {
        console.error(response.statusMessage);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const enviaRespostas = async (idAtividade: number) => {
    for (const item of perguntas || []) {
      await JX.salvar(
        {
          ID_ROTULO: idClick,
          ID_ATIVIDADE: idAtividade,
          CODUSU: codUsuLog,
          ID_CKECKLIST: idChecklist,
          ID_PERGUNTA: item.ID_PERGUNTA,
          RESPOSTA: respostas[item.ID_PERGUNTA]?.resposta || "",
          OBS: respostas[item.ID_PERGUNTA]?.observacao || "",
          DATA: dataAtual,
        },
        "AD_RESPOSTACHECKLIST",
        []
      );
    }
  };

  const salvarLogResposta = async ({
    idPergunta,
    resposta,
    observacao,
  }: {
    idPergunta: number;
    resposta?: string;
    observacao?: string;
  }) => {
    try {
      const idLogExistente = respostas[idPergunta]?.idLog;

      const dados = {
        ID_ROTULO: idClick,
        ID_ATIVIDADE: idAtividade,
        ID_CHECKLIST: idChecklist,
        ID_PERGUNTA: idPergunta,
        RESPOSTA: resposta || "",
        OBS: observacao || "",
      };

      const chaves = idLogExistente ? [{ ID_LOG: idLogExistente }] : [];

      const response = await JX.salvar(dados, "AD_LOGRESPCHECK", chaves);

      if (response.status === "1" && !idLogExistente) {
        const novoId = response.responseBody?.entities?.entity?.ID_LOG?.$;
        if (novoId) {
          setRespostas((prev) => ({
            ...prev,
            [idPergunta]: {
              ...prev[idPergunta],
              idLog: novoId,
            },
          }));
        }
      }

      console.log(
        idLogExistente
          ? "Registro atualizado no log."
          : "Registro criado no log."
      );
    } catch (error) {
      console.error("Erro ao salvar log:", error);
    }
  };

  const desfazerAlteracoes = async () => {
    if (!respostas || Object.keys(respostas).length === 0) {
      toast.warning("Nenhuma alteração para desfazer.");
      return;
    }

    try {
      const deletarArray = Object.entries(respostas)
        .map(([idPergunta, resposta]) => {
          if (resposta.idLog) {
            return {
              ID_ROTULO: idClick,
              ID_ATIVIDADE: idAtividade,
              ID_CHECKLIST: idChecklist,
              ID_PERGUNTA: Number(idPergunta),
              ID_LOG: resposta.idLog,
            };
          }
          return null;
        })
        .filter(
          (
            item
          ): item is {
            ID_ROTULO: number;
            ID_ATIVIDADE: number;
            ID_CHECKLIST: number;
            ID_PERGUNTA: number;
            ID_LOG: number;
          } => item !== null
        );

      if (deletarArray.length === 0) {
        toast.warning("Nenhum registro com ID_LOG encontrado para deletar.");
        return;
      }

      const deletar = await JX.deletar("AD_LOGRESPCHECK", deletarArray);

      if (deletar.status === "1") {
        setRespostas({});
        setIdChecklist(null);
        refetchRespostaLog();
        refetchPerguntasCheck();
        toast.success("Alterações desfeitas com sucesso!");
      } else {
        toast.error("Erro ao desfazer alterações.");
      }
    } catch (error) {
      console.error("Erro ao deletar log:", error);
      toast.error("Erro ao desfazer alterações.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={() => !isSaving && onClose()}>
      <SheetContent className="min-w-[50%] p-6">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-lg font-semibold text-gray-900">
            Checklist de Avaliação
          </SheetTitle>
          {idChecklist === null && (
            <SheetDescription>
              Para iniciar, primeiro selecione o checklist que deseja responder.
            </SheetDescription>
          )}
        </SheetHeader>

        {loading ? (
          <p className="text-gray-500 text-center mt-5">
            Carregando checklists...
          </p>
        ) : idChecklist === null && checklists?.length ? (
          <div className="mt-3 gap-4">
            {checklists.map((item) => (
              <div
                key={item.ID_CKECKLIST}
                onClick={() => setIdChecklist(item.ID_CKECKLIST)}
                className="mt-3 cursor-pointer bg-white hover:bg-gray-100 p-4 rounded-xl shadow-md flex items-center gap-4 transition-all border border-gray-200"
              >
                <CheckCircle className="w-5 h-5 text-gray-500" />
                <span className="uppercase font-semibold text-gray-800">
                  {item.NOME}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-[80vh] rounded-md border">
            <div className="p-5 rounded-sm">
              {perguntas && perguntas.length > 0 && (
                <>
                  {Object.values(respostas).some((r) => r.resposta) ? (
                    <Button
                      onClick={desfazerAlteracoes}
                      variant={"outline"}
                      className="p-2"
                    >
                      🗑️ Desfazer alterações
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setIdChecklist(null), setRespostas([]);
                      }}
                      variant={"outline"}
                      className="p-2"
                    >
                      <MoveLeft /> Voltar
                    </Button>
                  )}

                  <div className="bg-gray-200 p-4 rounded-md mb-6 mt-6">
                    <p className="text-md text-gray-700 uppercase">
                      <strong>Checklist:</strong> {perguntas[0].NOME}
                    </p>
                  </div>
                </>
              )}

              <div className="grid">
                {perguntas?.map((item: any) => (
                  <div
                    key={item.ID_PERGUNTA}
                    className="mb-4 p-4 rounded-lg bg-white shadow-md border border-gray-300"
                  >
                    <p className="font-medium text-gray-900 uppercase">
                      {item.PERGUNTA}
                    </p>

                    <div className="mt-2 flex gap-4">
                      {opcoesRespostas.map((opcao) => (
                        <label key={opcao} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`pergunta-${item.ID_PERGUNTA}`}
                            value={opcao}
                            checked={
                              respostas[item.ID_PERGUNTA]?.resposta === opcao
                            }
                            onChange={() =>
                              handleRespostaChange(item.ID_PERGUNTA, opcao)
                            }
                          />
                          {opcao}
                        </label>
                      ))}
                    </div>
                    <Textarea
                      className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Observação"
                      value={respostas[item.ID_PERGUNTA]?.observacao || ""}
                      onChange={(e) =>
                        handleObservacaoChange(item.ID_PERGUNTA, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {todasRespondidas && (
              <div className="p-5">
                <Button
                  onClick={handleSubmit}
                  className="mt-1 w-full"
                  disabled={isSaving}
                >
                  {isSaving ? "Salvando..." : "Enviar Respostas"}
                </Button>
              </div>
            )}
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Checklist;
