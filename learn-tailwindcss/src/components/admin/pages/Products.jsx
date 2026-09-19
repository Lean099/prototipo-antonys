import { useState } from 'react';
import ProductTable from '../components/ProductTable';
import { Plus } from 'lucide-react';
//import { fakeProducts } from '../data/fakeProducts';
import { useModalStore } from '../../../store/useModalStore';
import { useMenuStore } from '../../../store/useMenuStore';

const Products = () => {
  const [search, setSearch] = useState('');
  const products = useMenuStore((state) => state.products);
  const categories = useMenuStore((state) => state.categories);
  // Hay que trabajar con products y categories del store, para recrear un nuevo array para hacer uno parecido a products pero agregando un category_name a cada producto, para poder filtrar por nombre de categoría y mostrarlo en la tabla. Esto se puede hacer con un map y un find.
  const filteredProducts = products.filter((product) => {
    const searchTerm = search.toLowerCase();

    const category = categories.find((category) => category.id === product.category_id);

    return product.name.toLowerCase().includes(searchTerm) || category?.name.toLowerCase().includes(searchTerm);
  });
  const openModal = useModalStore((state) => state.openModal);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">Productos</h1>

        <button className="btn btn-primary" onClick={() => openModal('product')}>
          <Plus size={18} />
          Nuevo Producto
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar producto..."
        className="input input-bordered w-full"
      />

      <div>
        <div className="grid gap-4">
          <ProductTable products={filteredProducts} />
        </div>
      </div>
    </div>
  );
};

export default Products;
