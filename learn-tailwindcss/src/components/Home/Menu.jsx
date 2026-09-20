import { useEffect } from 'react';
import axios from 'axios';
import Card from './Card';
//import menu from '../../data';  // harcodeado
import { useThemeStore } from '../../store/useThemeStore';
import { useMenuStore } from '../../store/useMenuStore';

const Menu = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const categories = useMenuStore((state) => state.categories);
  const setCategories = useMenuStore((state) => state.setCategories);

  const products = useMenuStore((state) => state.products);
  const setProducts = useMenuStore((state) => state.setProducts);

  const selectedCategory = useMenuStore((state) => state.selectedCategory);
  const setSelectedCategory = useMenuStore((state) => state.setSelectedCategory);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          axios.get(`${API_URL}/categories/getAllCategories`),
          axios.get(`${API_URL}/products/getAllProducts`),
        ]);

        if (categoriesRes.status === 200) {
          setCategories(categoriesRes.data);
        }

        if (productsRes.status === 200) {
          setProducts(productsRes.data);
        }
      } catch (error) {
        console.error('Error al actualizar el menú:', error);
      }
    };

    // Obtener datos al entrar al Home
    fetchMenu();

    // Actualizar menú cada 30 segundos
    const interval = setInterval(fetchMenu, 30000);

    // Limpiar intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, []);

  const { theme } = useThemeStore();

  // Categorías disponibles
  const activeCategories = categories.filter((category) => category.is_active);

  const activeCategoryIds = activeCategories.map((category) => category.id);

  const ctg = [{ id: 'todos', name: 'Todos' }, ...activeCategories];

  // Filtrar productos
  const filteredMenu =
    selectedCategory === 'todos'
      ? products.filter((item) => activeCategoryIds.includes(item.category_id))
      : products.filter((item) => item.category_id === selectedCategory);

  return (
    <div className={theme === 'cupcake' ? 'bg-base-100' : 'bg-base-300'}>
      <div className="text-center">
        <div id="menu" className="inline-block bg-primary text-neutral px-4 py-2 rounded-2xl text-2xl font-light my-5">
          Menu de comidas
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 px-4">
        {ctg.map((category) => (
          <button
            key={category.id}
            className={`btn btn-sm ${selectedCategory === category.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="h-0.5 w-full bg-[#EBE1D1] mb-6 rounded"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto px-4 pb-5 sm:px-6 lg:px-8">
        {filteredMenu?.map((item) => (
          <Card key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Menu;
