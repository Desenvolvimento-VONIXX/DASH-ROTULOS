import { useQuery } from "@tanstack/react-query";

interface IResponse {
  CODPROD: number;
  DESCRPROD: string;

}
const fetchProdutos = async (): Promise<IResponse[]> => {
  const response = await JX.consultar(
    "SELECT CODPROD, DESCRPROD  FROM TGFPRO WHERE DESCRPROD LIKE 'ROT %'"
  );

  return response;
};

export const useGetProdutos = () => {
  return useQuery<IResponse[], Error>({

    queryKey: ["produtos"],
    queryFn: fetchProdutos,
    retry: false,
  });
};
