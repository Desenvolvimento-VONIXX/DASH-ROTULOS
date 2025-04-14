import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "../ui/dialog";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "../ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, CheckCircle, ChevronsUpDown, CircleX } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn } from "@/lib/utils";
import { useGetProdutos } from "@/hook/getProdutos";
import { getCurrentDate } from "@/utils/nowDate";
import { toast } from "sonner";
import { getUsuLog } from "@/utils/usuarioLogado";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";

interface Props {
    open: boolean;
    onClose: () => void;
    refetch: () => void;
}

interface Produto {
    CODPROD: number;
    DESCRPROD: string;
}

const NewRotulo: React.FC<Props> = ({ open, onClose, refetch }) => {

    const codUsu = getUsuLog();

    const [openProd, setOpenProd] = React.useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const dataAtual = getCurrentDate();

    const { data: produtos } = useGetProdutos();

    const formSchema = z.object({
        codProd: z.number().nullable().refine(val => val !== null, {
            message: "Selecione um produto",
        }),
        desenvolvimento: z.string()
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            codProd: undefined,
            desenvolvimento: "N"
        },
    });


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await JX.salvar(
                {
                    CODPROD: values.codProd,
                    DESENVOLVIMENTO: values.desenvolvimento,
                    STATUS: "PENDENTE",
                    DATA_CRIACAO: dataAtual,
                    CODUSU: codUsu,
                    ABERTOPDI: 'N'
                },
                "AD_ROTULOS",
                []
            )
            if (response.status === "1") {
                refetch();
                form.reset();
                toast.success('Rótulo criado com sucesso!', {
                    duration: 4000,
                    icon: <CheckCircle size={20} color="green" />,
                });
            } else {
                console.error(response.statusMessage);
                toast.error('Ocorreu um erro ao criar o Rótulo!', {
                    duration: 4000,
                    icon: <CircleX size={20} color="red" />,
                });
            }
        } catch (error) {
            console.error("Erro ao enviar atividade:", error);
        } finally {
            onClose();
        }
    };


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Novo Rótulo</DialogTitle>
                    <DialogDescription>Preencha os campos abaixo para criar um novo rótulo.</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] overflow-y-auto p-2">
                    <div className="flex flex-col space-y-4 ">
                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <FormField
                                        control={form.control}
                                        name="codProd"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Produto</FormLabel>
                                                <Popover open={openProd} onOpenChange={setOpenProd}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={openProd}
                                                            className="w-full justify-between"
                                                            onClick={() => setOpenProd(true)}
                                                        >
                                                            <span>
                                                                {Array.isArray(produtos) && field.value
                                                                    ? produtos.find((f: Produto) => f.CODPROD === Number(field.value))?.DESCRPROD
                                                                    : "Selecione um produto"}
                                                            </span>

                                                            <ChevronsUpDown className="opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0" align="start">
                                                        <Command>
                                                            <CommandInput
                                                                placeholder="Pesquisar Produto..."
                                                                className="h-9"
                                                                value={searchTerm}
                                                                onValueChange={(value: string) => setSearchTerm(value)}
                                                            />

                                                            <CommandList className="max-h-[30vh] overflow-auto">
                                                                <CommandEmpty>Produto não encontrado</CommandEmpty>
                                                                <CommandGroup>
                                                                    {produtos &&
                                                                        Array.isArray(produtos) &&
                                                                        produtos
                                                                            .filter((produto) =>
                                                                                produto.DESCRPROD.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                                                produto.CODPROD.toString().includes(searchTerm)
                                                                            )
                                                                            .map((produto: Produto) => (
                                                                                <CommandItem
                                                                                    key={produto.CODPROD}
                                                                                    value={searchTerm}
                                                                                    onSelect={() => {
                                                                                        field.onChange(produto.CODPROD);
                                                                                        setOpenProd(false);
                                                                                    }}
                                                                                >
                                                                                    {produto.CODPROD} - {produto.DESCRPROD}
                                                                                    <Check
                                                                                        className={cn(
                                                                                            "ml-auto",
                                                                                            produto.CODPROD === Number(field.value) ? "opacity-100" : "opacity-0"
                                                                                        )}
                                                                                    />
                                                                                </CommandItem>
                                                                            ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 mt-3">
                                    <FormField
                                        control={form.control}
                                        name="desenvolvimento"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Desenvolvimento?</FormLabel>
                                                <Select onValueChange={field.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione um opção" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Selecionar</SelectLabel>
                                                            <SelectItem value="S">Sim</SelectItem>
                                                            <SelectItem value="N">Não</SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex justify-end items-end mt-5">
                                    <Button type="submit">Salvar</Button>
                                </div>
                            </form>
                        </FormProvider>

                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>

    );
};

export default NewRotulo;

