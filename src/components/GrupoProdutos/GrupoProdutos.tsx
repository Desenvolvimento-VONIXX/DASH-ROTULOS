import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader } from "../ui/card";
import ModalVerDetalhes from "./VerDetalhes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useRotulos } from "@/hook/GrupoProdutos/getRotulosProdutos";
import NewRotulo from "./NewRotulo";
import { Input } from "../ui/input";
import React from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { ptBR } from "date-fns/locale";

interface Props { }

interface Rotulo {
    ID_ROTULO: number;
    CODPROD: number;
    DESCRPROD: string;
    STATUS2: string;
    ABERTOPDI: string;
    DATA_ENVIO: string;
    DATA_FINALIZACAO: string;
    DESENVOLVIMENTO: string;
}

const GrupoProduto: React.FC<Props> = () => {
    const [modalDetails, setModalDetails] = useState<boolean>(false);
    const [modalNewRotulo, setModalNewRotulo] = useState<boolean>(false);
    const [idClick, setIdClick] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { data: rotulos, refetch } = useRotulos();

    const onClose = () => {
        setModalDetails(false);
    };

    const onCloseNewRotulo = () => {
        setModalNewRotulo(false);
    };

    const uniqueStatuses: string[] = rotulos
        ? Array.from(new Set(rotulos.map((rotulo: Rotulo) => rotulo.STATUS2.trim())))
        : [];



    const [dateInicial, setDateInicial] = React.useState<DateRange | undefined>()
    const [dateFinal, setDateFinal] = React.useState<DateRange | undefined>()

    const [dateIni1, setDateIni1] = React.useState<string | null>(null)
    const [dateFin1, setDateFin1] = React.useState<string | null>(null)
    const [dateIni2, setDateIni2] = React.useState<string | null>(null)
    const [dateFin2, setDateFin2] = React.useState<string | null>(null)



    React.useEffect(() => {
        if (dateInicial?.from) {
            const fromDate = format(dateInicial.from, "dd/MM/yyyy");
            const toDate = dateInicial.to ? format(dateInicial.to, "dd/MM/yyyy") : null;
            setDateIni1(fromDate);
            setDateFin1(toDate);
        }

        if (dateFinal?.from) {
            const fromDate = format(dateFinal.from, "dd/MM/yyyy");
            const toDate = dateFinal.to ? format(dateFinal.to, "dd/MM/yyyy") : null;

            setDateIni2(fromDate);
            setDateFin2(toDate);
        }
    }, [dateInicial, dateFinal]);


    const filteredRotulos = (rotulos || []).filter((rotulo: Rotulo) => {
        const dataEnvio = rotulo.DATA_ENVIO ? (rotulo.DATA_ENVIO, "dd/MM/yyyy", new Date()) : null;
        const dataFinalizacao = rotulo.DATA_FINALIZACAO ? (rotulo.DATA_FINALIZACAO, "dd/MM/yyyy", new Date()) : null;

        const filtroDataEnvio =
            dateInicial?.from && dataEnvio
                ? dataEnvio >= dateInicial.from && (!dateInicial.to || dataEnvio <= dateInicial.to)
                : !dateInicial?.from;

        const filtroDataFinalizacao =
            dateFinal?.from && dataFinalizacao
                ? dataFinalizacao >= dateFinal.from && (!dateFinal.to || dataFinalizacao <= dateFinal.to)
                : !dateFinal?.from;


        return (
            (statusFilter && statusFilter !== "all" ? rotulo.STATUS2 === statusFilter : true) &&
            (rotulo.CODPROD.toString().includes(searchQuery) || rotulo.DESCRPROD.toLowerCase().includes(searchQuery.toLowerCase())) &&
            filtroDataEnvio &&
            filtroDataFinalizacao
        );
    });


    useEffect(() => {
        console.log(`Data Inicial de ${dateIni1} a ${dateFin1}`)
        console.log(`Data Final de ${dateIni2} a ${dateFin2}`)

    }, [dateIni1, dateFin1, dateIni2, dateFin2])

    return (
        <>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2 mb-7">
                    <h2 className="text-3xl font-bold tracking-tight ">Grupo Produtos - Rótulos</h2>
                    <div className="mt-5 mr-5 right-0 px-4 py-2 rounded z-50 fixed flex items-center space-x-2">
                        <Button className="px-4 py-2 rounded z-50" onClick={() => setModalNewRotulo(true)}>
                            Novo Rótulo
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div>

                        <span>Pesquisar </span>

                        <Input
                            type="text"
                            placeholder="Código ou Nome ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-[180px] h-[5vh] px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 "
                        />
                    </div>


                    <div className="flex flex-col">

                        <span>Data de Envio </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "justify-start text-left font-normal",
                                        !dateInicial && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon />
                                    {dateInicial?.from ? (
                                        dateInicial.to ? (
                                            <>
                                                {format(dateInicial.from, "dd/MM/yyyy")} -{" "}
                                                {format(dateInicial.to, "dd/MM/yyyy")}
                                            </>
                                        ) : (
                                            format(dateInicial.from, "dd/MM/yyyy")
                                        )
                                    ) : (
                                        <span>Selecionar data</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateInicial?.from}
                                    selected={dateInicial}
                                    onSelect={setDateInicial}
                                    numberOfMonths={2}
                                    locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex flex-col">

                        <span>Data de Finalização</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        " justify-start text-left font-normal",
                                        !dateFinal && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon />
                                    {dateFinal?.from ? (
                                        dateFinal.to ? (
                                            <>
                                                {format(dateFinal.from, "dd/MM/yyyy")} - {" "}
                                                {format(dateFinal.to, "dd/MM/yyyy")}
                                            </>
                                        ) : (
                                            format(dateFinal.from, "dd/MM/yyyy")
                                        )
                                    ) : (
                                        <span>Selecionar data</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateFinal?.from}
                                    selected={dateFinal}
                                    onSelect={setDateFinal}
                                    numberOfMonths={2}
                                    locale={ptBR}

                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <span>Status </span>
                        <Select onValueChange={(value) => setStatusFilter(value)}>
                            <SelectTrigger className="w-[180px] h-[5vh]  p-2">
                                <SelectValue placeholder="Filtrar por Status" />
                            </SelectTrigger>
                            <SelectContent className="p-2">
                                <SelectItem value="all">Todos</SelectItem>
                                {uniqueStatuses.map((status: string) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mt-12">
                    {filteredRotulos.map((rotulo: Rotulo) => (
                        <Card
                            key={rotulo.ID_ROTULO}
                            onClick={() => {
                                setModalDetails(true);
                                setIdClick(rotulo.ID_ROTULO);
                            }}
                            className="border transition-all transform hover:scale-105 hover:shadow-2xl duration-300"
                        >
                            <CardHeader className="rounded-t-xl p-4 ">
                                <p className="text-lg font-bold mt-1 uppercase">{rotulo.DESCRPROD}</p>
                                <p className="text-sm font-semibold">
                                    Código do Rótulo:
                                    <span className=" font-bold ml-1">{rotulo.CODPROD}</span>
                                </p>

                                {rotulo.DATA_ENVIO && (
                                    <p className="text-sm font-semibold">
                                        Dt. Envio:
                                        <span className=" font-bold ml-1">{rotulo.DATA_ENVIO}</span>
                                    </p>
                                )}

                                {rotulo.DATA_FINALIZACAO && (
                                    <p className="text-sm font-semibold">
                                        Dt. Finalização:
                                        <span className=" font-bold ml-1">{rotulo.DATA_FINALIZACAO}</span>
                                    </p>
                                )}

                                {rotulo.ABERTOPDI === 'S' && (
                                    <span className="font-extralight text-[12px] ">Rótulo aberto pelo PDI</span>
                                )}

                                {rotulo.DESENVOLVIMENTO === 'S' && (
                                    <span className="font-extralight text-[12px] ">Desenvolvimento*</span>
                                )}

                                <CardDescription
                                    className={`mt-2 text-sm font-medium ${rotulo.STATUS2.includes("Pendente de Avaliação")
                                        ? "text-yellow-600"
                                        : rotulo.STATUS2.includes("Enviado para Avalição")
                                            ? "text-blue-600"
                                            : rotulo.STATUS2.includes("Finalizada")
                                                ? "text-green-600"
                                                : rotulo.STATUS2.includes("Reprovado") ? "text-red-600"
                                                    : "text-grey-600"
                                        }`}
                                >
                                    {rotulo.STATUS2}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>

            {modalDetails && <ModalVerDetalhes open={modalDetails} onClose={onClose} idClick={idClick} refetchRotuloProduto={refetch} />}
            {modalNewRotulo && <NewRotulo open={modalNewRotulo} onClose={onCloseNewRotulo} refetch={refetch} />}
        </>
    );
};

export default GrupoProduto;
