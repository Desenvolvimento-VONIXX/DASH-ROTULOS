import axios from "axios";

// Configuração do axios (opcional)
const axiosInstance = axios.create({
  baseURL: `${window.location.origin}/mge`,
  withCredentials: true, // Inclui cookies automaticamente
  headers: {
    "Content-Type": "application/json; charset=UTF-8",
  },
});

// Função genérica para requisições POST
const postRequest = async <T>(
  url: string,
  body: any,
  options: { headers?: any; raw?: boolean } = {}
): Promise<T> => {
  const { headers = {}, raw = false } = options;

  try {
    const response = await axiosInstance.post(url, body, {
      headers,
    });

    const data = response.data;
    if (data.status !== "1") {
      throw new Error(
        `${data.statusMessage || "Erro desconhecido."}`
      );
    }
    return raw ? (response as any) : data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || `Erro na requisição: ${error.message}`
    );
  }
};

// Função para parsear datas personalizadas
const parseCustomDate = (dateString: string): string | null => {
  const regex = /^(d{2})(d{2})(d{4})/; // Captura dia, mês e ano
  const match = dateString?.match(regex);

  if (!match) return null;

  const [, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day); // Cria o objeto Date
  return date.toISOString();
};

// Função para parsear o retorno da query
const parseQueryResponse = (response: any) => {
  let parsedData =
    typeof response === "string" ? JSON.parse(response) : response;

  parsedData = parsedData.data?.responseBody || parsedData.responseBody || {};
  const fields = parsedData.fieldsMetadata || [];
  const rows = parsedData.rows || [];

  return rows.map((row: any) =>
    fields.reduce((acc: any, field: any, i: number) => {
      let value = row[i];

      if (typeof value === "string" && /^d{8}/.test(value)) {
        const parsedDate = parseCustomDate(value);
        value = parsedDate || value;
      }

      return { ...acc, [field.name]: value };
    }, {})
  );
};

// Função para executar queries
export const fetchQuery = async (queryText: string) => {
  if (!queryText) throw new Error("Query não pode estar vazia.");

  const formattedQuery = queryText.replace(/(\r\n|\n|\r)/gm, "");
  const url = `/service.sbr?serviceName=DbExplorerSP.executeQuery&outputType=json`;
  const body = {
    serviceName: "DbExplorerSP.executeQuery",
    requestBody: { sql: formattedQuery },
  };

  const response = await postRequest(url, body);
  return parseQueryResponse(response);
};
