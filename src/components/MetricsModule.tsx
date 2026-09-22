import React, { useState, useMemo } from 'react';
import {
  Sale,
  Product,
  Customer,
  Supplier,
  UserRole,
} from '../types';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Receipt,
  CreditCard,
  Banknote,
  Send,
  Package,
  AlertTriangle,
  Users,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Clock,
  Printer,
  Sparkles,
} from 'lucide-react';

interface MetricsModuleProps {
  sales: Sale[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  currentRole: UserRole;
  onReprintSale?: (sale: Sale) => void;
}

type TimeRange = 'hoy' | 'semana' | 'mes' | 'todo';

export const MetricsModule: React.FC<MetricsModuleProps> = ({
  sales,
  products,
  customers,
  suppliers,
  currentRole,
  onReprintSale,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('todo');

  // Filter sales according to time range and role
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return sales.filter((sale) => {
      // Exclude cancelled sales from financial revenue totals
      if (sale.status === 'Cancelada') return false;

      // Pos: ventas only sees sales made today or by their role/user
      if (currentRole === 'Pos: ventas') {
        const isToday = sale.date.startsWith(todayStr);
        return isToday || sale.cashierRole === 'Pos: ventas';
      }

      if (timeRange === 'todo') return true;

      const saleDate = new Date(sale.date);
      if (timeRange === 'hoy') {
        return sale.date.startsWith(todayStr);
      }
      if (timeRange === 'semana') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return saleDate >= sevenDaysAgo;
      }
      if (timeRange === 'mes') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return saleDate >= thirtyDaysAgo;
      }
      return true;
    });
  }, [sales, timeRange, currentRole]);

  // Aggregate Metrics Calculations
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalItemsSold = 0;
    let totalCost = 0;

    const paymentMethods: Record<string, number> = {
      Efectivo: 0,
      'Tarjeta de Crédito / Débito': 0,
      'Transferencia SPEI': 0,
      'Crédito Tienda': 0,
    };

    const categoryRevenue: Record<string, number> = {};
    const productSoldCounts: Record<string, { product: Product; qty: number; revenue: number }> = {};
    const cashierPerformance: Record<string, { count: number; total: number }> = {};

    filteredSales.forEach((sale) => {
      totalRevenue += sale.total;

      // Payment Breakdown
      if (paymentMethods[sale.paymentMethod] !== undefined) {
        paymentMethods[sale.paymentMethod] += sale.total;
      } else {
        paymentMethods[sale.paymentMethod] = sale.total;
      }

      // Cashier
      const cashierKey = sale.cashierName || sale.cashierRole;
      if (!cashierPerformance[cashierKey]) {
        cashierPerformance[cashierKey] = { count: 0, total: 0 };
      }
      cashierPerformance[cashierKey].count += 1;
      cashierPerformance[cashierKey].total += sale.total;

      // Items
      sale.items.forEach((item) => {
        totalItemsSold += item.quantity;
        const itemCost = (item.product.costPrice || 0) * item.quantity;
        totalCost += itemCost;

        // By Category
        const cat = item.product.category || 'Otros';
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + item.unitPrice * item.quantity;

        // Top Products
        if (!productSoldCounts[item.product.id]) {
          productSoldCounts[item.product.id] = {
            product: item.product,
            qty: 0,
            revenue: 0,
          };
        }
        productSoldCounts[item.product.id].qty += item.quantity;
        productSoldCounts[item.product.id].revenue += item.unitPrice * item.quantity;
      });
    });

    const averageTicket = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Top 5 Products
    const topProducts = Object.values(productSoldCounts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Inventory metrics
    let totalInventoryValue = 0;
    let totalInventoryCost = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      totalInventoryValue += p.price * p.stock;
      totalInventoryCost += p.costPrice * p.stock;
      if (p.stock <= 0) outOfStockCount++;
      else if (p.stock <= p.minStock) lowStockCount++;
    });

    return {
      totalRevenue,
      totalItemsSold,
      totalCost,
      averageTicket,
      grossProfit,
      profitMargin,
      paymentMethods,
      categoryRevenue,
      cashierPerformance,
      topProducts,
      totalInventoryValue,
      totalInventoryCost,
      lowStockCount,
      outOfStockCount,
      completedSalesCount: filteredSales.length,
    };
  }, [filteredSales, products]);

  // Today Cash Breakdown for POS role
  const posCashBreakdown = useMemo(() => {
    return {
      efectivo: metrics.paymentMethods['Efectivo'] || 0,
      tarjeta: metrics.paymentMethods['Tarjeta de Crédito / Débito'] || 0,
      spei: metrics.paymentMethods['Transferencia SPEI'] || 0,
      credito: metrics.paymentMethods['Crédito Tienda'] || 0,
      total: metrics.totalRevenue,
      tickets: metrics.completedSalesCount,
    };
  }, [metrics]);

  return (
    <div id="metrics-module-container" className="flex-1 overflow-y-auto bg-[#F4F5F7] p-3 sm:p-5 md:p-6 space-y-5">
      {/* Header and Filter Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-[#E6007E]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">
                {currentRole === 'Admin'
                  ? 'Métricas Ejecutivas e Inteligencia'
                  : currentRole === 'Gerente'
                  ? 'Rendimiento y Métricas de Tienda'
                  : 'Corte de Caja y Métricas del Turno'}
              </h1>
              <p className="text-xs text-slate-500">
                {currentRole === 'Admin'
                  ? 'Visión global de ingresos, rentabilidad, inventario y desempeño del negocio'
                  : currentRole === 'Gerente'
                  ? 'Control operativo, rotación de artículos y metas comerciales'
                  : 'Arqueo de caja, resumen de cobros por método y operaciones del día'}
              </p>
            </div>
          </div>
        </div>

        {/* Time Range Pills (Only for Admin & Gerente) */}
        {currentRole !== 'Pos: ventas' ? (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setTimeRange('hoy')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeRange === 'hoy'
                  ? 'bg-white text-[#E6007E] font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setTimeRange('semana')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeRange === 'semana'
                  ? 'bg-white text-[#E6007E] font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              7 Días
            </button>
            <button
              onClick={() => setTimeRange('mes')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeRange === 'mes'
                  ? 'bg-white text-[#E6007E] font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              30 Días
            </button>
            <button
              onClick={() => setTimeRange('todo')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeRange === 'todo'
                  ? 'bg-white text-[#E6007E] font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Todo
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Turno Actual de Caja</span>
          </div>
        )}
      </div>

      {/* POS ROLE SPECIFIC VIEW: CASH REGISTER ARQUEO & SHIFT CUT */}
      {currentRole === 'Pos: ventas' && (
        <div className="space-y-5">
          {/* Main Shift Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Cobrado</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  ${posCashBreakdown.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </h3>
                <span className="text-[11px] text-emerald-600 font-bold">
                  {posCashBreakdown.tickets} ventas registradas
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Efectivo en Caja</p>
                <h3 className="text-xl sm:text-2xl font-black text-green-800">
                  ${posCashBreakdown.efectivo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Para conteo de billetes</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Terminal Bancaria</p>
                <h3 className="text-xl sm:text-2xl font-black text-blue-900">
                  ${posCashBreakdown.tarjeta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Validar con vouchers</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Transferencias SPEI</p>
                <h3 className="text-xl sm:text-2xl font-black text-purple-900">
                  ${posCashBreakdown.spei.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Confirmaciones bancarias</span>
              </div>
            </div>
          </div>

          {/* Quick Ticket History of Shift */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#E6007E]" />
                <span>Tickets Emitidos en tu Turno</span>
              </h3>
              <span className="text-xs text-slate-500">{filteredSales.length} comprobantes</span>
            </div>

            {filteredSales.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600">Aún no hay ventas en este turno</p>
                <p className="text-xs mt-1">Realiza cobros en el módulo POS para ver el desglose en tiempo real</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {filteredSales.map((sale) => (
                  <div key={sale.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">{sale.folio}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                          {sale.paymentMethod}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {sale.customerName} • {new Date(sale.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-slate-900">
                        ${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      {onReprintSale && (
                        <button
                          onClick={() => onReprintSale(sale)}
                          className="p-1.5 text-slate-400 hover:text-[#E6007E] hover:bg-pink-50 rounded-lg transition cursor-pointer"
                          title="Reimprimir ticket"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN & GERENTE VIEWS: EXECUTIVE KPIS */}
      {currentRole !== 'Pos: ventas' && (
        <>
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ingresos Totales
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                ${metrics.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span className="font-semibold text-emerald-600">{metrics.completedSalesCount} ventas</span>
                <span>• {metrics.totalItemsSold} artículos</span>
              </p>
            </div>

            {/* Ticket Promedio */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ticket Promedio
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                ${metrics.averageTicket.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Gasto promedio por transacción
              </p>
            </div>

            {/* Margen Bruto / Utilidad (Admin Only) or Inventario Valorizado (Gerente) */}
            {currentRole === 'Admin' ? (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Utilidad Bruta Est.
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-pink-100 text-[#E6007E] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-[#E6007E]">
                  ${metrics.grossProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Margen: <span className="font-bold text-slate-800">{metrics.profitMargin.toFixed(1)}%</span>
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Valor de Inventario
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  ${metrics.totalInventoryValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {products.length} productos en tienda
                </p>
              </div>
            )}

            {/* Inventario Crítico Alert */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Alertas de Stock
                </span>
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-rose-600">
                {metrics.lowStockCount + metrics.outOfStockCount}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {metrics.outOfStockCount} agotados • {metrics.lowStockCount} bajo stock
              </p>
            </div>
          </div>

          {/* Grid: Payment Methods Breakdown & Sales by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Payment Methods */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#E6007E]" />
                <span>Desglose por Método de Pago</span>
              </h3>

              <div className="space-y-3">
                {Object.entries(metrics.paymentMethods).map(([method, amount]) => {
                  const percentage = metrics.totalRevenue > 0 ? (amount / metrics.totalRevenue) * 100 : 0;
                  return (
                    <div key={method} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700">
                        <span className="flex items-center gap-1.5">
                          {method === 'Efectivo' && <Banknote className="w-3.5 h-3.5 text-emerald-600" />}
                          {method.includes('Tarjeta') && <CreditCard className="w-3.5 h-3.5 text-blue-600" />}
                          {method.includes('SPEI') && <Send className="w-3.5 h-3.5 text-purple-600" />}
                          <span>{method}</span>
                        </span>
                        <div className="space-x-2">
                          <span className="font-bold text-slate-900">
                            ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-slate-400 text-[11px]">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#E6007E]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sales by Category */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Ventas por Categoría de Belleza</span>
              </h3>

              <div className="space-y-3">
                {Object.entries(metrics.categoryRevenue).length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No hay ventas registradas en el periodo</p>
                ) : (
                  Object.entries(metrics.categoryRevenue).map(([cat, amount]) => {
                    const percentage = metrics.totalRevenue > 0 ? (amount / metrics.totalRevenue) * 100 : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-700">
                          <span>{cat}</span>
                          <div className="space-x-2">
                            <span className="font-bold text-slate-900">
                              ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-slate-400 text-[11px]">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-600"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Top Productos Más Vendidos</span>
            </h3>

            {metrics.topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Sin registros de ventas aún</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {metrics.topProducts.map(({ product, qty, revenue }, index) => (
                  <div
                    key={product.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-[#E6007E] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        #{index + 1}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono truncate">{product.sku}</span>
                    </div>

                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-24 object-cover rounded-lg bg-white border border-slate-200 mb-2"
                    />

                    <div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                        {product.name}
                      </p>
                      <div className="mt-2 pt-1.5 border-t border-slate-200 flex justify-between items-center text-xs">
                        <span className="text-slate-500">{qty} pzas</span>
                        <span className="font-extrabold text-[#E6007E]">
                          ${revenue.toLocaleString('es-MX')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin / Executive Overview of Business Assets */}
          {currentRole === 'Admin' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Patrimonio e Inventario en Tienda</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                  <p className="text-blue-700 font-medium">Valor Total al Precio de Venta</p>
                  <p className="text-lg font-black text-blue-950 mt-1">
                    ${metrics.totalInventoryValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-600 font-medium">Costo de Inversión en Almacén</p>
                  <p className="text-lg font-black text-slate-900 mt-1">
                    ${metrics.totalInventoryCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <p className="text-emerald-700 font-medium">Margen Potencial de Ganancia</p>
                  <p className="text-lg font-black text-emerald-950 mt-1">
                    ${(metrics.totalInventoryValue - metrics.totalInventoryCost).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
