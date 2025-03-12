import { useQuery } from "@tanstack/react-query";

const fetchFormula = async (idClick?: number | null) => {
    const response = await JX.consultar(
        `SELECT 
        FORMULA, 
        OBS 
        FROM AD_ROTULOSPDI 
        WHERE ID_ROTULO = ${idClick}`
    );
    return response[0];
};

export function useGetFormula(idClick?: number | null) {
    return useQuery({
        queryKey: ["formula", idClick],
        queryFn: () => fetchFormula(idClick),
        retry: false,
        enabled: !!idClick,
    });
}
