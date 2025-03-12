import { createContext, useContext, useState, ReactNode } from "react";

interface VariaveisContextProps {
    notificacao: boolean;
    setNotificacao: (value: boolean) => void;
}

const VariaveisContext = createContext<VariaveisContextProps | undefined>(undefined);

export const VariaveisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notificacao, setNotificacao] = useState(false); 

    return (
        <VariaveisContext.Provider value={{ notificacao, setNotificacao }}>
            {children}
        </VariaveisContext.Provider>
    );
};

export const useVariaveis = () => {
    const context = useContext(VariaveisContext);
    if (!context) {
        throw new Error("useVariaveis deve ser usado dentro de um VariaveisProvider");
    }
    return context;
};
