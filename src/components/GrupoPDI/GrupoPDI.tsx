import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { useRotulosPdi } from "@/hook/GrupoPDI/getRotulos";
import ModalVerDetalhesPDI from "./VerDetalhesPDI";
import NewRotuloPDI from "./NovoRotuloPDI";

interface Props {}

interface Rotulo {
  ID_ROTULO: number;
  CODPROD: number;
  DESCRPROD: string;
  STATUS2: string;
  ABERTOPDI: string;
}

const GrupoPDI: React.FC<Props> = () => {
  const [idClick, setIdClick] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalDetails, setModalDetails] = useState<boolean>(false);
  const [modalNewRotulo, setModalNewRotulo] = useState<boolean>(false);

  const { data: rotulosPDI, refetch } = useRotulosPdi();

  const onClose = () => {
    setModalDetails(false);
  };

  const onCloseNewRotulo = () => {
    setModalNewRotulo(false);
  };

  const filteredRotulos = (rotulosPDI || []).filter(
    (rotulo: Rotulo) =>
      rotulo.CODPROD.toString().includes(searchQuery) ||
      rotulo.DESCRPROD.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2 mb-7">
          <h2 className="text-3xl font-bold tracking-tight ">
            Grupo PDI - Rótulos/Cartonados
          </h2>
          <div className="mt-5 mr-5 right-0 px-4 py-2 rounded z-50 fixed flex items-center space-x-2">
            <Button
              className="px-4 py-2 rounded z-50"
              onClick={() => setModalNewRotulo(true)}
            >
              Novo Rótulo/Cartonado
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[180px] h-[5vh] px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 "
          />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mt-12">
          {filteredRotulos.map((rotulo: Rotulo) => (
            <Card
              key={rotulo.ID_ROTULO}
              onClick={() => {
                setModalDetails(true);
                setIdClick(rotulo.ID_ROTULO);
              }}
              className="border transition-all transform hover:scale-105 hover:shadow-2xl duration-300"
            >
              <CardHeader className="rounded-t-xl p-4  ">
                <p className="text-lg font-bold mt-1 uppercase">
                  {rotulo.DESCRPROD}
                </p>
                <p className="text-sm font-semibold">
                  Código do Rótulo/Cartonado:
                  <span className=" font-bold ml-1">{rotulo.CODPROD}</span>
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {modalDetails && (
        <ModalVerDetalhesPDI
          open={modalDetails}
          onClose={onClose}
          idClick={idClick}
        />
      )}
      {modalNewRotulo && (
        <NewRotuloPDI
          open={modalNewRotulo}
          onClose={onCloseNewRotulo}
          refetch={refetch}
        />
      )}
    </>
  );
};

export default GrupoPDI;
