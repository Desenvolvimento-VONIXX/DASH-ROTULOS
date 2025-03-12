import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import LinhaTempoSGI from "./LinhaTempoSGI";
import { useGetDetailsRot } from "@/hook/GrupoProdutos/getDetailsRotulo";
import Formula from "../GrupoProdutos/Formula";
import { useGetLinhaTempoSGI } from "@/hook/GrupoSGI/getLinhaTempoSGI";
import Checklist from "./Checklist";
import VerChecklist from "../GrupoProdutos/VerChecklist";

interface Props {
    open: boolean;
    onClose: () => void;
    idClick: number | null;
    refetchRotuloProduto: () => void;
}

const ModalVerDetalhesSGI: React.FC<Props> = ({ open, onClose, idClick, refetchRotuloProduto }) => {
    const [openRealizarChecklist, setOpenRealizarChecklist] = React.useState<boolean>(false);
    const [openVerChecklist, setOpenVerChecklist] = React.useState<boolean>(false);

    const { data: rotulo, refetch: refetchDetalhes } = useGetDetailsRot(idClick);
    const { data: linha_tempo, isError, isLoading, refetch: refetchLinhaTempo } = useGetLinhaTempoSGI(idClick);
    const [idAtividade, setIdAtividade] = React.useState<number | null>(null);

    const handleCloseChecklist = () => {
        setOpenRealizarChecklist(false)
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
                                <LinhaTempoSGI
                                    idClick={idClick}
                                    linha_tempo={linha_tempo}
                                    setIdAtividade={setIdAtividade}
                                    setOpenRealizarChecklist={setOpenRealizarChecklist}
                                    setOpenVerChecklist={setOpenVerChecklist} 
                                />
                            )}
                        </div>
                    </ScrollArea>

                    <DialogFooter>
                        <Button onClick={onClose}>Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {openRealizarChecklist && (
                <Checklist
                    open={openRealizarChecklist}
                    onClose={handleCloseChecklist}
                    idClick={idClick}
                    idAtividade={idAtividade}
                    refetchRotuloProduto={refetchRotuloProduto}
                    refetchLinhaTempo={refetchLinhaTempo}
                    refetchRotulo={refetchDetalhes}
                />
            )}

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

export default ModalVerDetalhesSGI;
