import { useQuery } from "@tanstack/react-query";


const fetchCodUsu = async (): Promise<number | null> => {
  const response = await JX.consultar(
    "SELECT CODUSU FROM TSIUSU USU WHERE USU.CODUSU = SANKHYA.STP_GET_CODUSULOGADO()"
  );

  return response[0]?.CODUSU ?? null;  
};

export const useCodUsu = () => {
  return useQuery<number | null, Error>({
    queryKey: ["codUsu"],
    queryFn: fetchCodUsu,
    retry: false,
  });
};
