import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import LinhaTempo from "./LinhaTempo";
import EnviarAtividade from "./EnviarAtividade";
import React from "react";
import { useGetDetailsRot } from "@/hook/GrupoProdutos/getDetailsRotulo";
import { Check, RotateCcw, Send } from "lucide-react";
import { useGetLinhaTempo } from "@/hook/GrupoProdutos/getLinhaTempo";
import FinalizarRotulo from "./FinalizaRotulo";
import ModalReabrirRotulo from "./ModalReabrirRotulo";
import VerChecklist from "./VerChecklist";
import Formula from "./Formula";

interface Props {
    open: boolean;
    onClose: () => void;
    idClick: number | null;
    refetchRotuloProduto: () => void;
}

const ModalVerDetalhes: React.FC<Props> = ({ open, onClose, idClick, refetchRotuloProduto }) => {
    const [openEnviar, setOpenEnviar] = React.useState<boolean>(false);
    const [openFinalizar, setOpenFinalizar] = React.useState<boolean>(false);
    const [openReabrirRotulo, setOpenReabrirRotulo] = React.useState<boolean>(false);
    const [openVerChecklist, setOpenVerChecklist] = React.useState<boolean>(false);
    const [idAtividade, setIdAtividade] = React.useState<number | null>(null);

    const { data: rotulo, refetch } = useGetDetailsRot(idClick);
    const { data: linha_tempo, isError, isLoading, refetch: refetchLinhaTempo } = useGetLinhaTempo(idClick);

    const onCloseEnviar = () => {
        setOpenEnviar(false);
    };

    const onCloseFinalizar = () => {
        setOpenFinalizar(false);
    };

    const onCloseReabrirRotulo = () => {
        setOpenReabrirRotulo(false);
    };

    const onCloseVerChecklist = () => {
        setOpenVerChecklist(false);
    };


    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-[50%] max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>Detalhes do Processo</DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] overflow-y-auto p-2">
                        <div className="flex flex-col gap-2">
                            {rotulo ? (
                                <div key={rotulo.ID_ROTULO}>
                                    <p className="font-semibold mb-1">
                                        Rótulo: <span className="font-light">{rotulo.CODPROD} - {rotulo.DESCRPROD.trim()}</span>
                                    </p>
                                    <p className="font-semibold mb-1">
                                        Status: <span className="font-light">{rotulo.STATUS2}</span>
                                    </p>
                                    <p className="font-semibold mb-1">
                                        Data de Criação: <span className="font-light">{rotulo.DATA}</span>
                                    </p>

                                    <div className="flex gap-2 mb-5 mt-2">
                                        {rotulo.STATUS === "PENDENTE" || rotulo.STATUS === "REPROVADA" ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => setOpenEnviar(true)}
                                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-400 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                                                >
                                                    <Send className="w-4 h-4 me-0" />
                                                    Enviar para Avaliação
                                                </Button>
                                                {(rotulo.ABERTOPDI === 'N' || rotulo.ABERTOPDI === null) && rotulo.STATUS === "PENDENTE" && (
                                                    <Button
                                                        onClick={() => setOpenFinalizar(true)}
                                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-400 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                                                    >
                                                        <Check className="w-4 h-4 me-0" />
                                                        Finalizar Rótulo
                                                    </Button>
                                                )}
                                            </div>
                                        ) : rotulo.STATUS === "FINALIZADA" ? (
                                            (rotulo.ABERTOPDI === 'N' || rotulo.ABERTOPDI === null) && (
                                                <Button
                                                    onClick={() => setOpenReabrirRotulo(true)}
                                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-400 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                                                >
                                                    <RotateCcw className="w-4 h-4 me-0" />
                                                    Reabrir
                                                </Button>
                                            )
                                        ) : null}

                                        {rotulo.ABERTOPDI === 'S' && (
                                            <Formula idClick={idClick} />
                                        )}
                                    </div>

                                </div>
                            ) : null}
                        </div>


                        <div className="mt-2 p-2">
                            {isLoading ? (
                                <p>Carregando...</p>
                            ) : isError ? (
                                <p>Ocorreu um erro ao carregar os dados.</p>
                            ) : (
                                <LinhaTempo
                                    idClick={idClick}
                                    linha_tempo={linha_tempo}
                                    setOpenVerChecklist={setOpenVerChecklist}
                                    setIdAtividade={setIdAtividade}
                                />
                            )}
                        </div>
                    </ScrollArea>

                    <DialogFooter>
                        <Button onClick={onClose}>Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {openEnviar &&
                <EnviarAtividade
                    refetchRotulo={refetch}
                    open={openEnviar}
                    onClose={onCloseEnviar}
                    idClick={idClick}
                    refetchRotuloProduto={refetchRotuloProduto}
                    refetchLinhaTempo={refetchLinhaTempo}
                />
            }
            {openFinalizar &&
                <FinalizarRotulo
                    refetchRotulo={refetch}
                    open={openFinalizar}
                    onClose={onCloseFinalizar}
                    idClick={idClick}
                    refetchRotuloProduto={refetchRotuloProduto}
                    refetchLinhaTempo={refetchLinhaTempo}
                />
            }
            {openReabrirRotulo &&
                <ModalReabrirRotulo
                    refetchRotulo={refetch}
                    open={openReabrirRotulo}
                    onClose={onCloseReabrirRotulo}
                    idClick={idClick}
                    refetchRotuloProduto={refetchRotuloProduto}
                    refetchLinhaTempo={refetchLinhaTempo}
                />
            }

            {openVerChecklist &&
                <VerChecklist
                    open={openVerChecklist}
                    onClose={onCloseVerChecklist}
                    idClick={idClick}
                    idAtividade={idAtividade}
                />
            }


        </>
    );
};

export default ModalVerDetalhes;
