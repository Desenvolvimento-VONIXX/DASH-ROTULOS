import { useQuery } from "@tanstack/react-query";


const fetchCodGrupo = async (): Promise<number | null> => {
  const response = await JX.consultar(
    "SELECT CODGRUPO FROM TSIUSU USU WHERE USU.CODUSU = SANKHYA.STP_GET_CODUSULOGADO()"
  );

  return response[0]?.CODGRUPO ?? null;  
};

export const useCodGrupo = () => {
  return useQuery<number | null, Error>({
    queryKey: ["codGrupo"],
    queryFn: fetchCodGrupo,
    retry: false,
  });
};
