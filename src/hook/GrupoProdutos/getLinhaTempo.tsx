import { useQuery } from "@tanstack/react-query";

const fetchLinhaTempo = async (idClick?: number | null) => {
    const response = await JX.consultar(
        `SELECT 
        ID_ATIVIDADE, 
        OBS, 
        STATUS, 
        JUSTIFICATIVA,
        SANKHYA.OPTION_LABEL('AD_ROTULOSATIVIDADE', 'STATUS', STATUS) AS STATUS2, 
        FORMAT(DATA, 'dd/MM/yyyy HH:mm') AS DATA_FORMATADA, 
        USU.NOMEUSU AS NOMEUSU 
        FROM AD_ROTULOSATIVIDADE 
        INNER JOIN TSIUSU USU ON USU.CODUSU = AD_ROTULOSATIVIDADE.CODUSU 
        WHERE ID_ROTULO = ${idClick} 
        ORDER BY DATA desc, ID_ATIVIDADE desc`
    );
    return response;
};

export function useGetLinhaTempo(idClick?: number | null) {
    return useQuery({
        queryKey: ["linha_tempo", idClick],
        queryFn: () => fetchLinhaTempo(idClick),
        retry: false,
        enabled: !!idClick,
    });
}
