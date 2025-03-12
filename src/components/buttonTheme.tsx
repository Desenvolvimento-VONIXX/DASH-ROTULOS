import { Button } from "./ui/button";
import { useTheme } from "@/context/theme";



const ButtonTheme: React.FC = () => {
    const { darkMode, toggleTheme } = useTheme();
    
    return (
        <>
            <Button
                onClick={toggleTheme}
                className="px-4 py-2 rounded z-50"
            >
                {darkMode ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
            </Button>
        </>
    )
}

export default ButtonTheme;