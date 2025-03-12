import { useQuery } from "@tanstack/react-query";

const fetchPerguntasChecklist = async (idChecklist?: number | null) => {
    const response = await JX.consultar(
        `SELECT CP.ID_CKECKLIST, CP.ID_PERGUNTA, PERG.PERGUNTA, CHECKSGI.NOME 
        FROM AD_CHECKLISTPERGUNTAS CP 
        INNER JOIN AD_PERGUNTASSGI PERG ON PERG.ID_PERGUNTA = CP.ID_PERGUNTA 
        INNER JOIN AD_CHECKLISTSGI CHECKSGI ON CHECKSGI.ID_CKECKLIST = CP.ID_CKECKLIST 
        WHERE CP.ID_CKECKLIST = ${idChecklist}
        `
    );
    return response;
};

export function useGetPerguntasChecklist(idChecklist?: number | null) {
    return useQuery({
        queryKey: ["perguntasChecklist", idChecklist],
        queryFn: () => fetchPerguntasChecklist(idChecklist),
        retry: false,
        enabled: !!idChecklist,
    });
}
