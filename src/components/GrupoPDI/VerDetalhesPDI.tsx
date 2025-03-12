import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import { useGetDetailsRot } from "@/hook/GrupoProdutos/getDetailsRotulo";
import Formula from "../GrupoProdutos/Formula";

interface Props {
    open: boolean;
    onClose: () => void;
    idClick: number | null;
}

const ModalVerDetalhesPDI: React.FC<Props> = ({ open, onClose, idClick }) => {

    const { data: rotulo } = useGetDetailsRot(idClick);

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-[50%] max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>Detalhes</DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] overflow-y-auto p-2">
                        <div className="flex flex-col gap-2">
                            {rotulo ? (
                                <div key={rotulo.ID_ROTULO}>
                                    <p className="font-semibold mb-1">
                                        Rótulo: <span className="font-light">{rotulo.CODPROD} - {rotulo.DESCRPROD.trim()}</span>
                                    </p>

                                    <p className="font-semibold mb-1">
                                        Data de Criação: <span className="font-light">{rotulo.DATA}</span>
                                    </p>
                            
                                    <div className="flex gap-2 mb-5 mt-2">
                                        <Formula idClick={idClick} />
                                    </div>
                                </div>
                            ) : null}
                        </div>

                    </ScrollArea>

                    <DialogFooter>
                        <Button onClick={onClose}>Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </>
    );
};

export default ModalVerDetalhesPDI;
