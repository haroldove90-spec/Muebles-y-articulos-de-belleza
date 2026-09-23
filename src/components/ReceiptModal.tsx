import React from 'react';
import { Sale } from '../types';
import { Printer, Check, X, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

interface ReceiptModalProps {
  sale: Sale;
  onClose: () => void;
  onNewSale?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  onClose,
  onNewSale,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        id="printable-ticket"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto"
      >
        {/* Top Header - Screen Only */}
        <div className="print:hidden bg-[#0F172A] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Comprobante de Venta</h3>
              <p className="text-xs text-slate-300">Folio: {sale.folio}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Paper Area */}
        <div className="p-6 text-slate-800 text-xs font-mono space-y-4 bg-[#FAFAFA] border-b border-dashed border-slate-300">
          {/* Brand Heading */}
          <div className="text-center space-y-1 pb-3 border-b border-slate-300">
            <div className="flex justify-center mb-1">
              <Logo size="sm" showSubtitle={false} />
            </div>
            <p className="font-bold text-sm text-[#0F172A] font-sans tracking-wide">
              PALACIO DE BELLEZA
            </p>
            <p className="text-[11px] text-[#E6007E] font-sans italic font-medium">
              Muebles y artículos de belleza
            </p>
            <p className="text-[10px] text-slate-500 font-sans">
              Av. Insurgentes Sur 1420 • CDMX • Tel: (55) 5566-7788
            </p>
            <p className="text-[10px] text-slate-500 font-sans">
              RFC: PBE-240101-HA8 • Reg. General de Ley
            </p>
          </div>

          {/* Ticket Metadata */}
          <div className="space-y-1 text-[11px] text-slate-600 pb-2 border-b border-slate-200">
            <div className="flex justify-between">
              <span className="font-semibold">Folio:</span>
              <span className="font-bold text-[#0F172A]">{sale.folio}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Sucursal:</span>
              <span className="font-bold text-slate-800">{sale.branchName || 'Sucursal Matriz'}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha y hora:</span>
              <span>{new Date(sale.date).toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between">
              <span>Atendido por:</span>
              <span>{sale.cashierName} ({sale.cashierRole})</span>
            </div>
            <div className="flex justify-between">
              <span>Cliente:</span>
              <span className="font-semibold truncate max-w-[200px]">{sale.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Estado:</span>
              <span className={`font-bold ${sale.status === 'Completada' ? 'text-emerald-600' : 'text-red-600'}`}>
                {sale.status}
              </span>
            </div>
          </div>

          {/* Product Items */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 font-bold text-slate-500 pb-1 border-b border-slate-200">
              <span className="col-span-6">Concepto</span>
              <span className="col-span-2 text-center">Cant.</span>
              <span className="col-span-4 text-right">Importe</span>
            </div>

            {sale.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 text-[11px] py-1 border-b border-slate-100 items-start">
                <div className="col-span-6 pr-1">
                  <p className="font-semibold text-slate-800 leading-tight">{item.product.name}</p>
                  <p className="text-[10px] text-slate-400">
                    SKU: {item.product.sku} {item.priceTier ? `• Precio P${item.priceTier}` : ''}
                  </p>
                </div>
                <div className="col-span-2 text-center font-bold">{item.quantity}</div>
                <div className="col-span-4 text-right font-medium">
                  ${(item.unitPrice * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>

          {/* Totals Calculation */}
          <div className="pt-2 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>${sale.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            {sale.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Descuento aplicado:</span>
                <span>-${sale.discountTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>IVA (16% Trasladado):</span>
              <span>${sale.tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#0F172A] pt-1 border-t border-slate-300">
              <span>TOTAL:</span>
              <span className="text-[#E6007E] font-sans">
                ${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-slate-100 p-2.5 rounded-lg space-y-1 text-[11px] text-slate-700">
            <div className="flex justify-between">
              <span>Forma de Pago:</span>
              <span className="font-bold">{sale.paymentMethod}</span>
            </div>
            {sale.paymentMethod === 'Efectivo' && (
              <>
                <div className="flex justify-between">
                  <span>Importe recibido:</span>
                  <span>${sale.amountPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Cambio devuelto:</span>
                  <span>${sale.changeDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center pt-2 space-y-1 text-[10px] text-slate-500 font-sans">
            <div className="flex items-center justify-center gap-1 text-slate-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E6007E]" />
              <span>Garantía oficial en mobiliario y equipos</span>
            </div>
            <p>¡Gracias por su preferencia! Visítenos nuevamente.</p>
            <p className="text-[9px] text-slate-400">www.palaciodebelleza.com</p>
          </div>
        </div>

        {/* Modal Actions - Screen Only */}
        <div className="print:hidden p-4 bg-white flex flex-col sm:flex-row gap-2.5">
          <button
            id="print-ticket-button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket</span>
          </button>

          {onNewSale ? (
            <button
              id="new-sale-button"
              onClick={onNewSale}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-sm transition shadow-sm active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Nueva Venta</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition cursor-pointer"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
