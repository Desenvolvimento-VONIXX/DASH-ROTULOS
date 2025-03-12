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
        anexo: z.array(z.instanceof(File)),
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
                { STATUS: "FINALIZADA", DATA_FINALIZACAO: dataAtual },
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


    const sanitizeFileName = (fileName: string) => {
        return fileName
            .normalize("NFD") // Remove acentos
            .replace(/[\u0300-\u036f]/g, "") // Remove marcas diacríticas (acentos)
            .replace(/[^a-zA-Z0-9._-]/g, "_") // Substitui caracteres especiais por "_"
            .replace(/\s+/g, "_") // Substitui espaços por "_"
            .toLowerCase(); // Converte para minúsculas
    };

    const generateUUID = () => {
        return (
            Date.now().toString(36) +
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15)
        );
    };

    const anexaArquivos = async (files: File[], id: number) => {
        console.log("Id Atividade", id)

        if (!files || files.length === 0) return;
        const newFiles: { file: File; sessionKey: string }[] = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append("arquivo", file);
            const sessionKeyValue = encodeURIComponent(
                `${sanitizeFileName(file.name)}_${generateUUID()}`
            );

            try {
                // Envio do arquivo via axios
                await axios.post(
                    `${window.location.origin}/mge/sessionUpload.mge?sessionkey=${sessionKeyValue}&fitem=S&salvar=S&useCache=N`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                console.log(
                    `Upload concluído para: ${file.name} com o sessionKey: ${sessionKeyValue}`
                );

                // Adiciona o arquivo e o sessionKey ao estado
                newFiles.push({ file, sessionKey: sessionKeyValue });

                const sessionKeyList = `\\\"$file.save{sessionkey=${sessionKeyValue}}\\\"`;

                await JX.novoSalvar(
                    { ANEXO: sessionKeyList },
                    "AD_ROTULOSATIVIDADE",
                    { ID_ROTULO: idRotulo, ID_ATIVIDADE: id }
                );

            } catch (error) {
                console.error(`Erro no upload do arquivo ${file.name}:`, error);
            }
        }

    };

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
                                                    <label className="p-2 flex flex-col items-center justify-center w-full min-h-[15vh] border-2 border-dashed rounded-lg cursor-pointer">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <svg className="w-8 h-8 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                                            </svg>
                                                            <p className="text-sm text-gray-500">
                                                                <span className="font-semibold">Click to upload</span>
                                                            </p>
                                                            <p className="text-center justify-center items-center">
                                                                {field.value && field.value.length > 0
                                                                    ? field.value.map((file, index) => (
                                                                        <span key={index} className="block">{`📄 ${file.name}`}</span>
                                                                    ))
                                                                    : "Nenhum arquivo adicionado"}
                                                            </p>


                                                        </div>
                                                        <input
                                                            id="dropzone-file"
                                                            type="file"
                                                            multiple
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                field.onChange(e.target.files ? Array.from(e.target.files) : []);
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
