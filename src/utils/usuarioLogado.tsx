import { useCodUsu } from "@/hook/getCodUsu";
export const getUsuLog = () => {
    const { data: codUsu } = useCodUsu();
    return codUsu;
};

