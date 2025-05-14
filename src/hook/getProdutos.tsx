import { useQuery } from "@tanstack/react-query";

interface IResponse {
  CODPROD: number;
  DESCRPROD: string;
}
const fetchProdutos = async (): Promise<IResponse[]> => {
  const response = await JX.consultar(
    "SELECT CODPROD, DESCRPROD  FROM TGFPRO WHERE DESCRPROD LIKE 'ROT %' OR DESCRPROD LIKE 'CART %'"
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
