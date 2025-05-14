import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getCurrentDate } from "@/utils/nowDate";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  idClick: number | null;
  refetchRotulo: () => void;
  refetchRotuloProduto: () => void;
  refetchLinhaTempo: () => void;
}

const ModalReabrirRotulo: React.FC<Props> = ({
  open,
  onClose,
  idClick,
  refetchRotulo,
  refetchRotuloProduto,
  refetchLinhaTempo,
}) => {
  const dataAtual = getCurrentDate();

  const atualizarStatusRotulo = async () => {
    try {
      const response = await JX.salvar(
        { STATUS: "PENDENTE", DATA_ENVIO: "", DATA_FINALIZACAO: "" },
        "AD_ROTULOS",
        [{ ID_ROTULO: idClick }]
      );
      if (response.status === "1") {
        console.log("Status atualizado na AD_ROTULOS!");
      } else {
        console.error(response.statusMessage);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleConfirm = async () => {
    const response = await JX.salvar(
      {
        ID_ROTULO: idClick,
        STATUS: "REABERTO",
        DATA: dataAtual,
      },
      "AD_ROTULOSATIVIDADE",
      []
    );
    if (response.status === "1") {
      await atualizarStatusRotulo();
      refetchRotulo();
      refetchRotuloProduto();
      refetchLinhaTempo();
      toast.success("Rótulo/Cartonado Reaberto!", {
        duration: 4000,
        icon: <CheckCircle size={20} color="green" />,
      });
    } else {
      console.error(response.statusMessage);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reabrir Rótulo/Cartonado</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja reabrir este rótulo/Cartonado? Essa ação
            exigirá uma nova avaliação.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ModalReabrirRotulo;
