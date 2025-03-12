import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { Textarea } from "../ui/textarea";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { getCurrentDate } from "@/utils/nowDate";
import { toast } from 'sonner';
import { CheckCircle } from "lucide-react";
import axios from "axios";
import { getUsuLog } from "@/utils/usuarioLogado";

interface Props {
    open: boolean;
    onClose: () => void;
    idClick: number | null;
    refetchRotulo: () => void;
    refetchRotuloProduto: () => void;
    refetchLinhaTempo: () => void;
}

const FinalizarRotulo: React.FC<Props> = ({ open, onClose, idClick, refetchRotulo, refetchRotuloProduto, refetchLinhaTempo }) => {
    const dataAtual = getCurrentDate();
    const codUsuLog = getUsuLog();
    
    const formSchema = z.object({
        justificativa: z.string().min(1, "A justificativa é obrigatória"),
        obs: z.string().optional(),
        anexo: z.instanceof(File),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            obs: "",
            justificativa: "",
        },
    });

    const atualizarStatusRotulo = async () => {
        try {
            const response = await JX.salvar(
                { STATUS: "FINALIZADA",  DATA_FINALIZACAO: dataAtual},
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

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await JX.salvar(
                {
                    ID_ROTULO: idClick,
                    OBS: values.obs,
                    STATUS: "FINALIZADO",
                    JUSTIFICATIVA: values.justificativa,
                    DATA: dataAtual,
                    CODUSU: codUsuLog
                },
                "AD_ROTULOSATIVIDADE",
                []
            );
            if (response.status === "1") {
                const id = response.responseBody.entities.entity.ID_ATIVIDADE.$;
                anexaArquivos(values.anexo, id);
                await atualizarStatusRotulo();
                refetchRotulo();
                refetchRotuloProduto();
                refetchLinhaTempo();
                form.reset();
                toast.success('Rótulo Finalizado!', {
                    duration: 4000,
                    icon: <CheckCircle size={20} color="green" />,
                });
            } else {
                console.error(response.statusMessage);
            }
        } catch (error) {
            console.error("Erro ao enviar atividade:", error);
        } finally {
            onClose();
        }
    };

    const idRotulo: number = idClick ?? 0;

    const anexaArquivos = async (anexos: any, id: number) => {

        const formData = new FormData();
        formData.append("arquivo", anexos);
        const sessionkey = `AD_ROTULOSATIVIDADE_ANEXO_${new Date().getTime()}`;
        await axios.post(
            `${window.location.origin}/mge/sessionUpload.mge?sessionkey=${sessionkey}&fitem=S&salvar=S&useCache=N`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        await JX.novoSalvar(
            { ANEXO: `$file.session.key{${sessionkey}}` },
            "AD_ROTULOSATIVIDADE",
            { ID_ROTULO: idRotulo, ID_ATIVIDADE: id }
        );

    }



    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Finalizar Rótulo</SheetTitle>
                    <SheetDescription>
                        Caso o rótulo não precise ser avaliado pelo SGI, você pode finalizá-lo diretamente. Preencha os campos abaixo para concluir o processo.
                    </SheetDescription>
                </SheetHeader>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-4 py-1 mt-5">

                            <div className="flex flex-col gap-4">
                                <FormField
                                    control={form.control}
                                    name="justificativa"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Justificativa*</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="" {...field} className="h-20 border-2 border-gray-300 dark:border-gray-500 rounded-lg" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex flex-col gap-4">
                                <FormField
                                    control={form.control}
                                    name="obs"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Observação</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="" {...field} className="h-20 border-2 border-gray-300 dark:border-gray-500 rounded-lg" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex flex-col gap-4">
                                <FormField
                                    control={form.control}
                                    name="anexo"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Inserir Anexo *</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center justify-center w-full">
                                                    <label className="flex flex-col items-center justify-center w-full h-[15vh] border-2 border-dashed rounded-lg cursor-pointer">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <svg className="w-8 h-8 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                                            </svg>
                                                            <p className="text-sm text-gray-500">
                                                                <span className="font-semibold">Click to upload</span>
                                                            </p>
                                                            <p className="text-center justify-center items-center">
                                                                {field.value
                                                                    ? `Arquivo adicionado: ${field.value.name}`
                                                                    : "Nenhum arquivo adicionado"}
                                                            </p>
                                                        </div>
                                                        <input
                                                            id="dropzone-file"
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    if (!file.type.startsWith("image/")) {
                                                                        toast.error("Apenas arquivos de imagem são permitidos.", {
                                                                            position: "bottom-left", 
                                                                            style: { background: "#1E293B", color: "#fff" }
                                                                        });


                                                                        e.target.value = "";
                                                                        return;
                                                                    }
                                                                    field.onChange(file);
                                                                } else {
                                                                    field.onChange(null);
                                                                }
                                                            }}

                                                        />

                                                    </label>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button className="mt-5" type="submit">Enviar</Button>
                        </div>
                    </form>
                </FormProvider>
            </SheetContent>
        </Sheet>
    );
};

export default FinalizarRotulo;
