import { useThemeStore } from "../../store/useThemeStore";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = ()=>{
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-circle btn-ghost"
    >
      {theme === "cupcake" ? (
        <Moon size={20} />
      ) : (
        <Sun size={20} />
      )}
    </button>
  );
}

export default ThemeToggle;