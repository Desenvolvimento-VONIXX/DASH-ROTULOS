import { useQuery } from "@tanstack/react-query";

const fetchDetailsRotulos = async (idClick?: number | null) => {
    const response = await JX.consultar(
        `SELECT ID_ROTULO, ROT.ABERTOPDI, ROT.CODPROD, PRO.DESCRPROD, ROT.STATUS, FORMAT(ROT.DATA_CRIACAO, 'dd/MM/yyyy HH:mm') AS DATA,
        SANKHYA.OPTION_LABEL('AD_ROTULOS', 'STATUS', ROT.STATUS) AS STATUS2 
        FROM AD_ROTULOS AS ROT 
        INNER JOIN TGFPRO PRO ON PRO.CODPROD = ROT.CODPROD
        WHERE ID_ROTULO = ${idClick}`
    );
    return response[0];
};

export function useGetDetailsRot(idClick?: number | null) {
    return useQuery({
        queryKey: ["rotulos", idClick],
        queryFn: () => fetchDetailsRotulos(idClick),
        retry: false,
        enabled: !!idClick,
    });
}
