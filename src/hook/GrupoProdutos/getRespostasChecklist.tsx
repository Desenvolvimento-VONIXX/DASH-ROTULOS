import { useQuery } from "@tanstack/react-query";

const fetchRespostasCheck = async (idClick?: number | null, idAtividade?: number | null) => {
    const response = await JX.consultar(
        `SELECT 
        RESP.ID_CKECKLIST, 
        CHECKSGI.NOME, 
        PERG.ID_PERGUNTA, 
        PERG.PERGUNTA, 
        RESP.RESPOSTA, 
        RESP.OBS, 
        USU.NOMEUSU AS NOMEUSU, 
        FORMAT(ROT_ATV.DATA, 'dd/MM/yyyy HH:mm') AS DATA_FORMATADA 
        FROM AD_ROTULOSATIVIDADE ROT_ATV 
        INNER JOIN AD_RESPOSTACHECKLIST RESP ON RESP.ID_ATIVIDADE = ROT_ATV.ID_ATIVIDADE AND RESP.ID_ROTULO = ROT_ATV.ID_ROTULO 
        INNER JOIN AD_CHECKLISTSGI CHECKSGI ON CHECKSGI.ID_CKECKLIST = RESP.ID_CKECKLIST 
        INNER JOIN AD_PERGUNTASSGI PERG ON PERG.ID_PERGUNTA = RESP.ID_PERGUNTA 
        INNER JOIN TSIUSU USU ON USU.CODUSU = ROT_ATV.CODUSU 
        WHERE 
        ROT_ATV.ID_ROTULO = ${idClick} 
        AND ROT_ATV.ID_ATIVIDADE = ${idAtividade}`
    );
    return response;
};

export function useGetRespostasCheck(idClick?: number | null, idAtividade?: number | null) {
    return useQuery({
        queryKey: ["respostas", idClick, idAtividade],
        queryFn: () => fetchRespostasCheck(idClick, idAtividade),
        retry: false,
        enabled: !!idClick && !!idAtividade,
    });
}
