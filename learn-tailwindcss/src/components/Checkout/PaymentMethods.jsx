import { useState } from 'react';
import { Landmark, Banknote, CreditCard, Copy, Check } from 'lucide-react';

import { useCheckoutStore } from '../../store/useCheckoutStore';
import { useThemeStore } from '../../store/useThemeStore';

const PaymentMethods = ({ cart, total, onConfirm, isCreatingOrder }) => {
  const { deliveryOption, paymentMethodsOption, setPMSelected } = useCheckoutStore();

  const { theme } = useThemeStore();

  const [copied, setCopied] = useState('');

  const datosTransferencia = {
    titular: 'Alfredo Enzo Gutierrez',
    cvu: '0000003100000000000000',
    alias: 'antonys',
  };

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(field);

      setTimeout(() => {
        setCopied('');
      }, 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  const methods = [
    {
      id: 'efectivo',
      label: 'Efectivo',
      description: deliveryOption === 'delivery' ? 'Pagás al recibir' : 'Pagás en el local',
      icon: <Banknote className="w-10 h-10" />,
    },
    {
      id: 'transferencia',
      label: 'Transferencia',
      description: 'Transferí y enviá el comprobante',
      icon: <Landmark className="w-10 h-10" />,
    },
    {
      id: 'mercado_pago',
      label: 'Mercado Pago',
      description: 'Pagá de forma online',
      icon: <CreditCard className="w-10 h-10" />,
    },
  ];

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-3">Método de pago</h3>

      {/* PAYMENT OPTIONS */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {methods.map((method) => (
          <div
            key={method.id}
            onClick={() => setPMSelected(method.id)}
            className={`
              cursor-pointer
              border
              rounded-xl
              p-4
              flex
              flex-col
              items-center
              justify-center
              gap-2
              text-center
              transition

              ${
                paymentMethodsOption === method.id
                  ? theme === 'cupcake'
                    ? `
                        border-neutral
                        bg-neutral/10
                        scale-105
                      `
                    : `
                        border-secondary
                        bg-secondary/10
                        scale-105
                      `
                  : `
                      border-base-300
                      hover:border-neutral
                      hover:scale-105
                    `
              }
            `}
          >
            {method.icon}

            <span className="font-medium">{method.label}</span>

            <span className="text-xs opacity-60">{method.description}</span>
          </div>
        ))}
      </div>

      {/* TRANSFER */}

      {paymentMethodsOption === 'transferencia' && (
        <div className="mt-6 p-5 border rounded-xl bg-base-100 shadow-sm animate-in fade-in duration-300">
          <h4 className="font-bold mb-4 text-center">Datos de la cuenta</h4>

          <div className="flex flex-col gap-4 text-sm md:text-base">
            {/* TITULAR */}

            <div className="flex justify-between items-center border-b pb-2 gap-4">
              <span className="text-gray-500">Titular:</span>

              <span className="font-medium text-right">{datosTransferencia.titular}</span>
            </div>

            {/* CVU */}

            <div className="flex justify-between items-center border-b pb-2 gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase font-bold">CVU</span>

                <span className="font-mono break-all">{datosTransferencia.cvu}</span>
              </div>

              <button
                type="button"
                className={`
                  btn
                  btn-circle
                  btn-ghost
                  btn-sm
                  shrink-0

                  ${copied === 'cvu' ? 'text-success' : ''}
                `}
                onClick={() => handleCopy(datosTransferencia.cvu, 'cvu')}
              >
                {copied === 'cvu' ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>

            {/* ALIAS */}

            <div className="flex justify-between items-center border-b pb-2 gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase font-bold">Alias</span>

                <span className="font-medium">{datosTransferencia.alias}</span>
              </div>

              <button
                type="button"
                className={`
                  btn
                  btn-circle
                  btn-ghost
                  btn-sm
                  shrink-0

                  ${copied === 'alias' ? 'text-success' : ''}
                `}
                onClick={() => handleCopy(datosTransferencia.alias, 'alias')}
              >
                {copied === 'alias' ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <p className="text-xs text-center text-gray-400 mt-4">Copiá los datos y enviá el comprobante por WhatsApp.</p>

          <button type="button" className="btn btn-primary w-full mt-4" onClick={onConfirm} disabled={isCreatingOrder}>
            {isCreatingOrder ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creando pedido...
              </>
            ) : (
              'Ya transferí / Confirmar pedido'
            )}
          </button>
        </div>
      )}

      {/* CASH */}

      {paymentMethodsOption === 'efectivo' && (
        <div className="mt-6 p-5 border rounded-xl bg-base-100 shadow-sm animate-in fade-in duration-300">
          <p className="italic text-sm text-center">
            {deliveryOption === 'delivery'
              ? '👉 Recordá que el pago en efectivo se realiza al recibir el pedido.'
              : '👉 Pagás en efectivo al retirar o consumir en el local.'}
          </p>

          <button type="button" className="btn btn-primary w-full mt-6" onClick={onConfirm} disabled={isCreatingOrder}>
            {isCreatingOrder ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creando pedido...
              </>
            ) : (
              'Confirmar pedido en efectivo'
            )}
          </button>
        </div>
      )}

      {/* MERCADO PAGO */}

      {paymentMethodsOption === 'mercado_pago' && (
        <div className="mt-6 p-5 border rounded-xl bg-base-100 shadow-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center text-center gap-3">
            <CreditCard className="w-12 h-12" />

            <h4 className="font-bold text-lg">Mercado Pago</h4>

            <p className="text-sm opacity-70">Vas a poder pagar tu pedido de forma online mediante Mercado Pago.</p>
          </div>

          <button type="button" className="btn btn-primary w-full mt-6" onClick={onConfirm} disabled={isCreatingOrder}>
            {isCreatingOrder ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creando pedido...
              </>
            ) : (
              'Continuar con Mercado Pago'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
