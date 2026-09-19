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
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/categories/getAllCategories`);
        if (res.status === 200) {
          console.log('Categorías obtenidas:', res.data);
          setCategories(res.data);
        } else {
          console.error('Error al obtener las categorías:', res.statusText);
        }
      } catch (error) {
        console.error('Error al obtener las categorías:', error);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/getAllProducts`);
        if (res.status === 200) {
          console.log('Productos obtenidos:', res.data);
          setProducts(res.data);
        } else {
          console.error('Error al obtener los productos:', res.statusText);
        }
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      }
    };
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    console.log('Categorías actualizadas:', categories);
  }, [categories]);

  const { theme } = useThemeStore();

  // Crear categorías automáticament
  // e
  // Aca hay que corregir,
  const ctg = [{ id: 'todos', name: 'Todos' }, ...categories];
  console.log('Categorías únicas:', ctg);
  // Filtrar productos
  const filteredMenu =
    selectedCategory === 'todos' ? products : products.filter((item) => item.category_id === selectedCategory);

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
