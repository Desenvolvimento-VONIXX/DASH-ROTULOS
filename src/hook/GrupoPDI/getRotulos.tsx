import { useQuery } from "@tanstack/react-query";

interface IResponse {
    ID_ROTULO: number;
    OBS: string;
    CODPROD: number;
    DESCRPROD: string;
    STATUS: string;
    STATUS2: string;
    ABERTOPDI: string;
}

const fetchRotulosPDI = async (): Promise<IResponse[]> => {
    const response = await JX.consultar(`
        SELECT ID_ROTULO, 
        ROT.DATA_CRIACAO, 
        ROT.ABERTOPDI, 
        ROT.CODPROD, 
        PRO.DESCRPROD, 
        SANKHYA.OPTION_LABEL('AD_ROTULOS', 'STATUS', ROT.STATUS) AS STATUS2 
        FROM AD_ROTULOS AS ROT 
        INNER JOIN TGFPRO PRO ON PRO.CODPROD = ROT.CODPROD 
        WHERE ROT.ABERTOPDI IN ('S') 
        ORDER BY DATA_CRIACAO DESC
        `
    );
    return response;
};


export const useRotulosPdi = () => {
    return useQuery<IResponse[], Error>({
        queryKey: ["rotulos"],
        queryFn: fetchRotulosPDI,
        retry: false,
    });
};
