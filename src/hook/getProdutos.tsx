import { useQuery } from "@tanstack/react-query";

interface IResponse {
  CODPROD: number;
  DESCRPROD: string;
}
const fetchProdutos = async (): Promise<IResponse[]> => {
  const response = await JX.consultar(
    "SELECT CODPROD, DESCRPROD  FROM TGFPRO WHERE DESCRPROD LIKE 'ROT %' OR DESCRPROD LIKE 'CART %' OR CODPROD IN (2024500036 ,2024500035,2024300005)"
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
