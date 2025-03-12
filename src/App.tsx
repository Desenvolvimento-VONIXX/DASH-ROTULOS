import './App.css';
import GrupoSGI from './components/GrupoSGI/GrupoSGI';
import GrupoProduto from './components/GrupoProdutos/GrupoProdutos';
import GrupoPDI from './components/GrupoPDI/GrupoPDI';
import { useCodGrupo } from './hook/getGrupo';
import { Toaster } from 'sonner';
import { VariaveisProvider } from './context/variaveis';
import { useCodSubGrupo } from './hook/getSubGrupo';
function App() {
  const { data: codGrupo, isLoading: isLoadingGrupo, isError: isErrorGrupo } = useCodGrupo();
  const { data: codSubGrupo, isLoading: isLoadingSub, isError: isErrorSub } = useCodSubGrupo();

  if (isLoadingGrupo || isLoadingSub) {
    return (
      <div className="flex justify-center items-center h-screen text-center font-bold text-lg">
        Carregando ...
      </div>
    );
  }

  if (isErrorGrupo || isErrorSub) {
    return (
      <div className="flex justify-center items-center h-screen text-center font-bold text-lg">
        Ocorreu um erro ao carregar os dados.
      </div>
    );
  }


  return (
    <VariaveisProvider>
      {codGrupo === 53 || codSubGrupo === 53 ? (<GrupoProduto />)
        : codGrupo === 91 || codSubGrupo === 91 ? (
          <GrupoSGI />
        ) : codGrupo === 75 || codSubGrupo === 75 ? (
          <GrupoPDI />
        )
          : (
            <div className="flex justify-center items-center h-screen text-center font-bold text-lg">
              Você não possui acesso a nenhum dos módulos dessa tela.
            </div>
          )}
      <Toaster />
    </VariaveisProvider>
  );

}

export default App;
