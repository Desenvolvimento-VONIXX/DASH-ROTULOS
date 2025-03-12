import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { FlaskConical } from "lucide-react";
import { useGetFormula } from "@/hook/GrupoProdutos/getFormula";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
    idClick: number | null;
}

const Formula: React.FC<Props> = ({ idClick }) => {
    const { data: formula } = useGetFormula(idClick);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-400 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 relative"
                >
                    <FlaskConical className="w-4 h-4 me-0" /> Fórmula
                </Button>
            </PopoverTrigger>

            {formula && (
                <PopoverContent className="w-80">
                    <ScrollArea className="max-h-64 overflow-y-auto p-2 ">
                        <div className="flex flex-col space-y-4 ">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none mb-2">Mudança na Fórmula</h4>

                                <div className="text-sm">
                                    <span className="font-semibold">Nova Fórmula: </span>
                                    <p>{formula.FORMULA}</p>
                                </div>

                                <div className="text-sm">
                                    <span className="font-semibold">Observação: </span>
                                    <p>{formula.OBS}</p>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </PopoverContent>
            )}
        </Popover>
    );
};

export default Formula;
