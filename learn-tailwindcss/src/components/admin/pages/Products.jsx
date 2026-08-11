import ProductTable from '../components/ProductTable';
import { fakeProducts } from '../data/fakeProducts';
import { useModalStore } from '../../../store/useModalStore';

const Products = () => {
  const openModal = useModalStore((state) => state.openModal);
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">Productos</h1>

        <button className="btn btn-primary" onClick={() => openModal('product')}>
          Nuevo Producto
        </button>
      </div>

      <input type="text" placeholder="Buscar producto..." className="input input-bordered w-full" />

      <div>
        <div className="grid gap-4">
          <ProductTable products={fakeProducts} />
        </div>
      </div>
    </div>
  );
};

export default Products;
