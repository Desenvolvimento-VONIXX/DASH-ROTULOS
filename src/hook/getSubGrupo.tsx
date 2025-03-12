import { useQuery } from "@tanstack/react-query";


const fetchCodSubGrupo = async (): Promise<number | null> => {
  const response = await JX.consultar(
    "SELECT AD_CODSUBGRUPO FROM TSIUSU USU WHERE USU.CODUSU = SANKHYA.STP_GET_CODUSULOGADO()"
  );

  return response[0]?.AD_CODSUBGRUPO ?? null;  
};

export const useCodSubGrupo = () => {
  return useQuery<number | null, Error>({
    queryKey: ["codSubGrupo"],
    queryFn: fetchCodSubGrupo,
    retry: false,
  });
};
