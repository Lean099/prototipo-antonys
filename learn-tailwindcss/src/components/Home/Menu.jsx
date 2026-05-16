import { useState } from "react";
import Card from "./Card";
import menu from "../../data";
import { useThemeStore } from "../../store/useThemeStore";

const Menu = () => {
    const { theme } = useThemeStore();

    const [selectedCategory, setSelectedCategory] = useState("Todos");

    // Crear categorías automáticamente
    const categories = [
        "Todos",
        ...new Set(menu.map(item => item.category))
    ];

    // Filtrar productos
    const filteredMenu =
        selectedCategory === "Todos"
            ? menu
            : menu.filter(item => item.category === selectedCategory);

    return (
        <div className={theme === "cupcake" ? "bg-base-100" : "bg-base-300"}>
            
            <div className="text-center">
                <div
                    id="menu"
                    className="inline-block bg-primary text-neutral px-4 py-2 rounded-2xl text-2xl font-light my-5"
                >
                    Menu de comidas
                </div>
            </div>

            {/* FILTROS */}
            <div className="flex flex-wrap justify-center gap-2 mb-6 px-4">
                {
                    categories.map(category => (
                        <button
                            key={category}
                            className={`btn btn-sm ${
                                selectedCategory === category
                                    ? "btn-primary"
                                    : "btn-outline"
                            }`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))
                }
            </div>

            <div className="h-0.5 w-full bg-[#EBE1D1] mb-6 rounded"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto px-4 pb-5 sm:px-6 lg:px-8">

                {
                    filteredMenu.map(item => (
                        <Card key={item.id} {...item} />
                    ))
                }

            </div>
        </div>
    );
};

export default Menu;