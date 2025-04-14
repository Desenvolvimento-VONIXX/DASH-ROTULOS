import { useQuery } from "@tanstack/react-query";

const fetchRespostasCheckLog = async (idClick?: number | null, idAtividade?: number | null) => {
    const response = await JX.consultar(
        `SELECT 
        LOGR.ID_LOG,
        LOGR.ID_CHECKLIST, 
        CHECKSGI.NOME, 
        PERG.ID_PERGUNTA, 
        PERG.PERGUNTA, 
        LOGR.RESPOSTA, 
        LOGR.OBS, 
        USU.NOMEUSU AS NOMEUSU, 
        FORMAT(ROT_ATV.DATA, 'dd/MM/yyyy HH:mm') AS DATA_FORMATADA 
        FROM AD_ROTULOSATIVIDADE ROT_ATV 
        INNER JOIN AD_LOGRESPCHECK LOGR ON LOGR.ID_ATIVIDADE = ROT_ATV.ID_ATIVIDADE AND LOGR.ID_ROTULO =  ROT_ATV.ID_ROTULO 
        INNER JOIN AD_CHECKLISTSGI CHECKSGI ON CHECKSGI.ID_CKECKLIST = LOGR.ID_CHECKLIST 
        INNER JOIN AD_PERGUNTASSGI PERG ON PERG.ID_PERGUNTA = LOGR.ID_PERGUNTA 
        INNER JOIN TSIUSU USU ON USU.CODUSU = ROT_ATV.CODUSU 
        WHERE 
        ROT_ATV.ID_ROTULO = ${idClick} 
        AND ROT_ATV.ID_ATIVIDADE = ${idAtividade}
        AND (ROT_ATV.CHECKLISTREALIZADO IN ('N') OR ROT_ATV.CHECKLISTREALIZADO IS NULL)
        `
    );
    return response;
};

export function useGetRespostasCheckLog(idClick?: number | null, idAtividade?: number | null) {
    return useQuery({
        queryKey: ["respostas-log", idClick, idAtividade],
        queryFn: () => fetchRespostasCheckLog(idClick, idAtividade),
        retry: false,
        enabled: !!idClick && !!idAtividade,
    });
}
