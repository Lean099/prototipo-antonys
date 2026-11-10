import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useMenuStore } from '../../../../store/useMenuStore';

const API_URL = import.meta.env.VITE_API_URL;
const DELIVERY_FEE = 1000;

const formatPrice = (value) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getDefaultSize = (product) =>
  product?.sizes?.find((size) => size.name === 'simple')?.id ?? product?.sizes?.[0]?.id ?? '';

const parseItemNotes = (notes) => {
  const result = {};

  if (!notes) return result;

  notes.split(' | ').forEach((part) => {
    const match = part.match(/^Unidad (\d+):\s*(.*)$/);

    if (!match) return;

    const unitNumber = Number(match[1]);
    const observation = match[2].trim();

    if (unitNumber >= 1 && observation) {
      result[unitNumber] = observation;
    }
  });

  return result;
};

const serializeUnitNotes = (unitNotes) =>
  Object.entries(unitNotes ?? {})
    .filter(([, observation]) => observation?.trim())
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([unit, observation]) => `Unidad ${unit}: ${observation.trim()}`)
    .join(' | ');

const createLine = (product, item = null) => ({
  key: `${Date.now()}-${Math.random()}`,
  product_id: item?.product_id ?? product?.id ?? '',
  product_size_id: item?.product_size_id ?? getDefaultSize(product),
  quantity: item?.quantity ?? 1,
  unitNotes: parseItemNotes(item?.notes),
});

const AdminEditOrderModal = ({ order, onClose, onUpdated }) => {
  const products = useMenuStore((state) => state.products);
  const categories = useMenuStore((state) => state.categories);
  const setProducts = useMenuStore((state) => state.setProducts);

  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('todos');

  // El buscador permanece oculto hasta que el usuario quiera agregar productos.
  const [showProductMenu, setShowProductMenu] = useState(false);

  const [form, setForm] = useState({});
  const [items, setItems] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressMode, setAddressMode] = useState('manual');
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    if (!order) return;

    setForm({
      customer_name:
        order.customer_name ??
        (/^mesa\s*\d+$/i.test(order.customer_username ?? '') ? '' : (order.customer_username ?? '')),
      customer_phone: order.customer_phone ?? '',
      customer_email: order.customer_email ?? '',
      order_type: order.order_type ?? 'pickup',
      delivery_street: order.delivery_street ?? '',
      delivery_number: order.delivery_number ?? '',
      delivery_details: order.delivery_details ?? '',
      delivery_neighborhood: order.delivery_neighborhood ?? '',
      delivery_latitude: order.delivery_latitude ?? null,
      delivery_longitude: order.delivery_longitude ?? null,
      delivery_location_url: order.delivery_location_url ?? '',
      table_number: order.table_number ?? '',
      payment_method: order.payment_method ?? 'cash',
      notes: order.notes ?? '',
    });

    setItems((order.items ?? []).map((item) => createLine(null, item)));

    // Cada vez que se abre otro pedido, el menú comienza oculto.
    setShowProductMenu(false);
    setProductSearch('');
    setProductCategory('todos');

    setError('');
    setSuccess('');
  }, [order]);

  useEffect(() => {
    if (!order?.id || !order?.user_id) {
      setAddresses([]);
      setSelectedAddressId('');
      setAddressMode('manual');
      return;
    }

    let cancelled = false;

    const loadAddresses = async () => {
      setLoadingAddresses(true);
      setAddressError('');
      setAddresses([]);
      setSelectedAddressId('');
      setAddressMode('manual');

      try {
        const response = await axios.post(`${API_URL}/address/getAddresses/${order.user_id}`);

        if (cancelled) return;

        const savedAddresses = Array.isArray(response.data) ? response.data : [];

        setAddresses(savedAddresses);

        // Solo inicializamos una dirección si el pedido original era delivery.
        if (order.order_type !== 'delivery') return;

        const normalize = (value) =>
          String(value ?? '')
            .trim()
            .toLocaleLowerCase();

        const hasCurrentAddress = Boolean(order.delivery_street?.trim()) || Boolean(order.delivery_number?.trim());

        const currentAddress =
          savedAddresses.find((address) => order.address_id && String(address.id) === String(order.address_id)) ??
          savedAddresses.find(
            (address) =>
              normalize(address.street) === normalize(order.delivery_street) &&
              normalize(address.street_number) === normalize(order.delivery_number),
          );

        const defaultAddress = savedAddresses.find((address) => address.is_default);

        const addressToSelect = currentAddress ?? (!hasCurrentAddress ? defaultAddress : null);

        if (addressToSelect) {
          setAddressMode('saved');
          setSelectedAddressId(String(addressToSelect.id));

          setForm((current) => ({
            ...current,
            address_id: addressToSelect.id,
            delivery_street: addressToSelect.street ?? '',
            delivery_number: addressToSelect.street_number ?? '',
            delivery_neighborhood: addressToSelect.neighborhood ?? '',
            delivery_details: addressToSelect.details ?? '',
            delivery_latitude: addressToSelect.latitude ?? null,
            delivery_longitude: addressToSelect.longitude ?? null,
            delivery_location_url: addressToSelect.location_url ?? '',
          }));
        } else {
          setAddressMode('manual');
          setSelectedAddressId('');

          setForm((current) => ({
            ...current,
            address_id: null,
          }));
        }
      } catch {
        if (!cancelled) {
          setAddressError('No se pudieron cargar las direcciones guardadas. Podés ingresar una manualmente.');
        }
      } finally {
        if (!cancelled) {
          setLoadingAddresses(false);
        }
      }
    };

    loadAddresses();

    return () => {
      cancelled = true;
    };
  }, [order?.id, order?.user_id]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoadingProducts(true);

      try {
        if (products.length > 0) return;

        const response = await axios.get(`${API_URL}/products/getAllProducts`);

        if (!cancelled) {
          setProducts(response.data ?? []);
        }
      } catch {
        if (!cancelled) {
          setError('No se pudieron cargar los productos del menú.');
        }
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [products.length, setProducts]);

  // Normalizamos los IDs para evitar diferencias entre números y textos.
  const productById = useMemo(() => new Map(products.map((product) => [String(product.id), product])), [products]);

  // Buscador independiente para agregar productos al pedido.
  const filteredProducts = useMemo(() => {
    const normalizedSearch = productSearch.trim().toLocaleLowerCase();

    return products.filter((product) => {
      const matchesSearch = (product.name ?? '').toLocaleLowerCase().includes(normalizedSearch);

      const matchesCategory = productCategory === 'todos' || String(product.category_id) === String(productCategory);

      return product.is_available && matchesSearch && matchesCategory;
    });
  }, [products, productSearch, productCategory]);

  const subtotal = useMemo(
    () =>
      items.reduce((total, item) => {
        const product = productById.get(String(item.product_id));

        if (!product) return total;

        const size = product.sizes?.find((option) => String(option.id) === String(item.product_size_id));

        const price = product.sizes?.length ? (size?.price ?? 0) : product.price;

        return total + Number(price || 0) * Number(item.quantity || 0);
      }, 0),
    [items, productById],
  );

  const deliveryFee = form.order_type === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateItem = (key, field, value) => {
    setItems((current) =>
      current.map((item) => {
        if (item.key !== key) return item;

        if (field === 'quantity') {
          const quantity = Math.max(1, Number(value) || 1);
          const unitNotes = {};

          for (let unit = 1; unit <= quantity; unit++) {
            unitNotes[unit] = item.unitNotes?.[unit] ?? '';
          }

          return {
            ...item,
            quantity,
            unitNotes,
          };
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  };

  const changeProduct = (key, productId) => {
    const product = productById.get(String(productId));

    setItems((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              product_id: productId,
              product_size_id: getDefaultSize(product),
              unitNotes: Object.fromEntries(Array.from({ length: item.quantity }, (_, index) => [index + 1, ''])),
            }
          : item,
      ),
    );
  };

  const addProductToOrder = (product) => {
    if (!product || !product.is_available) return;

    setItems((current) => [...current, createLine(product)]);
    // No cerramos el menú: permite agregar varios productos seguidos.
  };

  const removeItem = (key) => {
    setItems((current) => current.filter((item) => item.key !== key));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!items.length) {
      setError('El pedido debe tener al menos un producto.');
      return;
    }

    for (const item of items) {
      const product = productById.get(String(item.product_id));

      if (!product) {
        setError('Hay un producto sin seleccionar o que ya no existe.');
        return;
      }

      if (Number(item.quantity) < 1) {
        setError('Cada producto debe tener una cantidad de al menos 1.');
        return;
      }

      if (
        product.sizes?.length > 0 &&
        !product.sizes.some((size) => String(size.id) === String(item.product_size_id))
      ) {
        setError(`Seleccioná un tamaño para ${product.name}.`);
        return;
      }
    }

    if (form.order_type === 'delivery' && (!form.delivery_street.trim() || !form.delivery_number.trim())) {
      setError('Para un envío, la calle y el número son obligatorios.');
      return;
    }

    if (form.order_type === 'table' && !String(form.table_number).trim()) {
      setError('Ingresá el número de mesa.');
      return;
    }

    if (['delivery', 'pickup'].includes(form.order_type) && !form.customer_phone.trim()) {
      setError('El teléfono es obligatorio para envíos y retiros.');
      return;
    }

    const payload = {
      expected_updated_at: order.updated_at,
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      customer_email: form.customer_email.trim() || null,
      order_type: form.order_type,
      payment_method: form.payment_method,
      notes: form.notes,
      items: items.map((item) => {
        const product = productById.get(String(item.product_id));

        return {
          product_id: item.product_id,
          product_size_id: product?.sizes?.length ? item.product_size_id : null,
          quantity: Number(item.quantity),
          notes: serializeUnitNotes(item.unitNotes) || null,
        };
      }),
    };

    if (form.order_type === 'delivery') {
      Object.assign(payload, {
        address_id: addressMode === 'saved' ? selectedAddressId || null : null,
        delivery_street: form.delivery_street.trim(),
        delivery_number: form.delivery_number.trim(),
        delivery_details: form.delivery_details.trim() || null,
        delivery_neighborhood: form.delivery_neighborhood.trim() || null,
        delivery_latitude: form.delivery_latitude,
        delivery_longitude: form.delivery_longitude,
        delivery_location_url: form.delivery_location_url.trim() || null,
      });
    } else if (form.order_type === 'table') {
      payload.table_number = String(form.table_number).trim();
    }

    try {
      setSaving(true);

      await axios.put(`${API_URL}/orders/adminUpdateOrder/${order.id}`, payload);

      setSuccess('Pedido actualizado correctamente.');
      await onUpdated?.();
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const statusCode = err.response?.status;

      if (statusCode === 409) {
        setError(
          typeof detail === 'string'
            ? detail
            : 'El pedido cambió mientras lo estabas editando. Tus cambios siguen en pantalla, pero no se guardaron. Cerrá el formulario y volvé a abrir el pedido para revisar la versión actual.',
        );
      } else {
        setError(
          typeof detail === 'string'
            ? detail
            : 'No se pudo actualizar el pedido. Revisá los datos e intentá nuevamente.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (!order) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl max-h-[90vh]">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-xl font-bold">Editar pedido #{order.id}</h3>
            <p className="text-sm opacity-60 mt-1">Modificá los datos del cliente, los productos y la entrega.</p>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {error && (
          <div role="alert" className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div role="status" className="alert alert-success mb-4">
            <span>{success}</span>
          </div>
        )}

        {loadingProducts ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-3">
              <h4 className="font-bold text-lg">Datos del cliente</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="form-control">
                  <span className="label-text mb-1">Nombre</span>
                  <input
                    className="input input-bordered w-full"
                    value={form.customer_name ?? ''}
                    onChange={(e) => updateField('customer_name', e.target.value)}
                    maxLength={30}
                    required={form.order_type !== 'table'}
                  />
                </label>

                <label className="form-control">
                  <span className="label-text mb-1">Teléfono</span>
                  <input
                    className="input input-bordered w-full"
                    value={form.customer_phone ?? ''}
                    onChange={(e) => updateField('customer_phone', e.target.value)}
                    maxLength={20}
                    required={form.order_type === 'delivery' || form.order_type === 'pickup'}
                  />
                </label>

                <label className="form-control">
                  <span className="label-text mb-1">Correo electrónico</span>
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    value={form.customer_email ?? ''}
                    onChange={(e) => updateField('customer_email', e.target.value)}
                    maxLength={100}
                  />
                </label>
              </div>
            </section>

            <div className="divider" />

            <section className="space-y-3">
              <h4 className="font-bold text-lg">Entrega y pago</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="form-control">
                  <span className="label-text mb-1">Tipo de pedido</span>
                  <select
                    className="select select-bordered w-full"
                    value={form.order_type ?? 'pickup'}
                    onChange={(e) => updateField('order_type', e.target.value)}
                  >
                    <option value="delivery">Envío a domicilio</option>
                    <option value="pickup">Retiro en el local</option>
                    <option value="table">Consumo en mesa</option>
                  </select>
                </label>

                <label className="form-control">
                  <span className="label-text mb-1">Método de pago</span>
                  <select
                    className="select select-bordered w-full"
                    value={form.payment_method ?? 'cash'}
                    onChange={(e) => updateField('payment_method', e.target.value)}
                  >
                    <option value="cash">Efectivo</option>
                    <option value="transfer">Transferencia</option>
                    <option value="mercado_pago">Mercado Pago</option>
                  </select>
                </label>
              </div>

              {form.order_type === 'delivery' && (
                <div className="rounded-box border border-base-300 p-4 space-y-3">
                  <h5 className="font-semibold">Dirección de entrega</h5>

                  {loadingAddresses ? (
                    <div className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm" />
                      Cargando direcciones...
                    </div>
                  ) : (
                    <>
                      {addresses.length > 0 && (
                        <label className="form-control">
                          <span className="label-text mb-1">Seleccionar dirección guardada</span>

                          <select
                            className="select select-bordered w-full"
                            value={addressMode === 'saved' ? String(selectedAddressId) : 'manual'}
                            onChange={(event) => {
                              const value = event.target.value;

                              if (value === 'manual') {
                                setAddressMode('manual');
                                setSelectedAddressId('');

                                setForm((current) => ({
                                  ...current,
                                  address_id: null,
                                  delivery_street: '',
                                  delivery_number: '',
                                  delivery_neighborhood: '',
                                  delivery_details: '',
                                  delivery_latitude: null,
                                  delivery_longitude: null,
                                  delivery_location_url: '',
                                }));

                                return;
                              }

                              const address = addresses.find((item) => String(item.id) === String(value));

                              if (!address) return;

                              setAddressMode('saved');
                              setSelectedAddressId(String(address.id));

                              setForm((current) => ({
                                ...current,
                                address_id: address.id,
                                delivery_street: address.street ?? '',
                                delivery_number: address.street_number ?? '',
                                delivery_neighborhood: address.neighborhood ?? '',
                                delivery_details: address.details ?? '',
                                delivery_latitude: address.latitude ?? null,
                                delivery_longitude: address.longitude ?? null,
                                delivery_location_url: address.location_url ?? '',
                              }));
                            }}
                          >
                            <option value="manual">Ingresar otra dirección</option>

                            {addresses.map((address) => (
                              <option key={address.id} value={String(address.id)}>
                                {address.label} — {address.street} {address.street_number}
                                {address.is_default ? ' (Predeterminada)' : ''}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}

                      {addressError && <p className="text-sm text-error">{addressError}</p>}
                    </>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="form-control">
                      <span className="label-text mb-1">Calle</span>
                      <input
                        className="input input-bordered w-full"
                        value={form.delivery_street ?? ''}
                        onChange={(e) => updateField('delivery_street', e.target.value)}
                        readOnly={addressMode === 'saved'}
                        required
                      />
                    </label>

                    <label className="form-control">
                      <span className="label-text mb-1">Número</span>
                      <input
                        className="input input-bordered w-full"
                        value={form.delivery_number ?? ''}
                        onChange={(e) => updateField('delivery_number', e.target.value)}
                        readOnly={addressMode === 'saved'}
                        required
                      />
                    </label>

                    <label className="form-control">
                      <span className="label-text mb-1">Barrio</span>
                      <input
                        className="input input-bordered w-full"
                        value={form.delivery_neighborhood ?? ''}
                        onChange={(e) => updateField('delivery_neighborhood', e.target.value)}
                        readOnly={addressMode === 'saved'}
                      />
                    </label>

                    <label className="form-control">
                      <span className="label-text mb-1">Detalles</span>
                      <input
                        className="input input-bordered w-full"
                        placeholder="Piso, departamento, referencia..."
                        value={form.delivery_details ?? ''}
                        onChange={(e) => updateField('delivery_details', e.target.value)}
                        readOnly={addressMode === 'saved'}
                      />
                    </label>
                  </div>

                  <label className="form-control">
                    <span className="label-text mb-1">Enlace de ubicación (opcional)</span>
                    <input
                      type="url"
                      className="input input-bordered w-full"
                      value={form.delivery_location_url ?? ''}
                      onChange={(e) => updateField('delivery_location_url', e.target.value)}
                      readOnly={addressMode === 'saved'}
                    />
                  </label>
                </div>
              )}

              {form.order_type === 'table' && (
                <label className="form-control max-w-xs">
                  <span className="label-text mb-1">Número de mesa</span>
                  <input
                    className="input input-bordered w-full"
                    value={form.table_number ?? ''}
                    onChange={(e) => updateField('table_number', e.target.value)}
                    required
                  />
                </label>
              )}
            </section>

            <div className="divider" />

            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="font-bold text-lg">Productos del pedido</h4>
                  <p className="text-sm text-base-content/60 mt-1">
                    Revisá los productos cargados o agregá otros si hace falta.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm sm:shrink-0"
                  onClick={() => setShowProductMenu((current) => !current)}
                  aria-expanded={showProductMenu}
                >
                  {showProductMenu ? <>✕ Ocultar menú</> : <>+ Agregar producto</>}
                </button>
              </div>

              {showProductMenu && (
                <div className="rounded-box border border-base-300 p-4 space-y-4">
                  <div>
                    <h5 className="font-semibold">Buscar productos</h5>
                    <p className="text-sm text-base-content/60 mt-1">Buscá por nombre o filtrá por categoría.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="form-control">
                      <span className="label-text mb-1">Buscar producto</span>
                      <input
                        type="search"
                        className="input input-bordered w-full"
                        placeholder="Ej.: hamburguesa, papas, gaseosa..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </label>

                    <label className="form-control">
                      <span className="label-text mb-1">Filtrar por categoría</span>
                      <select
                        className="select select-bordered w-full"
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                      >
                        <option value="todos">Todas las categorías</option>
                        {categories.map((category) => (
                          <option key={category.id} value={String(category.id)}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <p className="text-sm text-base-content/60 py-3">
                      No se encontraron productos disponibles con esos filtros.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredProducts.map((product) => {
                        const startingPrice = product.sizes?.length
                          ? Math.min(...product.sizes.map((size) => Number(size.price) || 0))
                          : Number(product.price) || 0;

                        return (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 rounded-box border border-base-300 p-3"
                          >
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                loading="lazy"
                                className="h-16 w-16 rounded-lg object-cover shrink-0"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-lg bg-base-200 flex items-center justify-center shrink-0">
                                <span className="text-xs text-base-content/50">Sin foto</span>
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="font-semibold break-words">{product.name}</p>
                              <p className="text-sm text-base-content/70">
                                {product.sizes?.length ? 'Desde ' : ''}
                                {formatPrice(startingPrice)}
                              </p>
                            </div>

                            <button
                              type="button"
                              className="btn btn-primary btn-sm shrink-0"
                              onClick={() => addProductToOrder(product)}
                            >
                              + Agregar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="divider">Detalle del pedido</div>

              {items.length === 0 ? (
                <p className="text-sm text-base-content/60 py-2">
                  Todavía no hay productos en el pedido. Usá «Agregar producto» para comenzar.
                </p>
              ) : (
                items.map((item, index) => {
                  const product = productById.get(String(item.product_id));
                  const hasSizes = Boolean(product?.sizes?.length);

                  const selectedSize = product?.sizes?.find((size) => String(size.id) === String(item.product_size_id));

                  const unitPrice = hasSizes ? (selectedSize?.price ?? 0) : (product?.price ?? 0);

                  return (
                    <div key={item.key} className="rounded-box border border-base-300 p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Producto {index + 1}</span>

                        <button
                          type="button"
                          className="btn btn-xs btn-ghost text-error"
                          onClick={() => removeItem(item.key)}
                          aria-label={`Quitar producto ${index + 1}`}
                        >
                          Quitar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                        <label className="form-control md:col-span-5">
                          <span className="label-text mb-1">Producto</span>

                          <select
                            className="select select-bordered w-full"
                            value={String(item.product_id)}
                            onChange={(e) => changeProduct(item.key, e.target.value)}
                            required
                          >
                            <option value="">Seleccionar producto</option>

                            {products.map((option) => (
                              <option
                                key={option.id}
                                value={String(option.id)}
                                disabled={!option.is_available && String(option.id) !== String(item.product_id)}
                              >
                                {option.name}
                                {!option.is_available ? ' (No disponible)' : ''}
                              </option>
                            ))}
                          </select>

                          {product?.image_url && (
                            <div className="flex items-center gap-3 mt-3">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                loading="lazy"
                                className="h-14 w-14 rounded-lg border border-base-300 object-cover shrink-0"
                              />
                              <span className="text-sm font-medium">{product.name}</span>
                            </div>
                          )}
                        </label>

                        <label className="form-control md:col-span-3">
                          <span className="label-text mb-1">Tamaño</span>

                          {hasSizes ? (
                            <select
                              className="select select-bordered w-full"
                              value={String(item.product_size_id ?? '')}
                              onChange={(e) => updateItem(item.key, 'product_size_id', e.target.value)}
                              required
                            >
                              <option value="">Elegir tamaño</option>

                              {product.sizes.map((size) => (
                                <option key={size.id} value={String(size.id)}>
                                  {size.name.charAt(0).toUpperCase() + size.name.slice(1)} — {formatPrice(size.price)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="input input-bordered flex items-center opacity-60">Sin tamaños</div>
                          )}
                        </label>

                        <label className="form-control md:col-span-2">
                          <span className="label-text mb-1">Cantidad</span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            className="input input-bordered w-full"
                            value={String(item.quantity)}
                            onChange={(e) => updateItem(item.key, 'quantity', Number(e.target.value))}
                            onWheel={(e) => e.target.blur()}
                            required
                          />
                        </label>

                        <div className="md:col-span-2 flex flex-col">
                          <span className="label-text mb-1">Subtotal</span>
                          <div className="flex items-center min-h-12">
                            <span className="font-bold whitespace-nowrap">
                              {formatPrice(unitPrice * Number(item.quantity || 0))}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="label-text font-medium block">Observaciones por unidad</span>

                        {Array.from({ length: item.quantity }, (_, index) => {
                          const unitNumber = index + 1;

                          return (
                            <label key={unitNumber} className="form-control">
                              <span className="label-text mb-1">Unidad {unitNumber}:</span>

                              <input
                                type="text"
                                className="input input-bordered w-full my-2"
                                placeholder="Sin observaciones"
                                value={item.unitNotes?.[unitNumber] ?? ''}
                                onChange={(e) => {
                                  const value = e.target.value;

                                  setItems((current) =>
                                    current.map((currentItem) =>
                                      currentItem.key === item.key
                                        ? {
                                            ...currentItem,
                                            unitNotes: {
                                              ...currentItem.unitNotes,
                                              [unitNumber]: value,
                                            },
                                          }
                                        : currentItem,
                                    ),
                                  );
                                }}
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </section>

            <label className="form-control">
              <span className="label-text mb-1">Notas generales del pedido</span>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={2}
                value={form.notes ?? ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Indicaciones generales..."
              />
            </label>

            <div className="rounded-box bg-base-200 my-4 p-4 space-y-2">
              <div className="flex justify-between gap-4">
                <span>Subtotal de productos</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span>Envío</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>

              <div className="divider my-1" />

              <div className="flex justify-between gap-4 text-lg font-bold">
                <span>Total estimado</span>
                <span>{formatPrice(total)}</span>
              </div>

              <p className="text-xs opacity-60">
                El importe es orientativo. El backend volverá a calcular los precios al guardar.
              </p>
            </div>

            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
                Cancelar
              </button>

              <button type="submit" className="btn btn-primary" disabled={saving || loadingProducts || !items.length}>
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <button type="button" className="modal-backdrop" onClick={onClose} disabled={saving} aria-label="Cerrar modal">
        Cerrar
      </button>
    </dialog>
  );
};

export default AdminEditOrderModal;
