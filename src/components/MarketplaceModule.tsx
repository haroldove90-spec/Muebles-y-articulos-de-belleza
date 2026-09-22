import React, { useState } from 'react';
import { Product, ProductCategory } from '../types';
import {
  Search,
  Store,
  ShoppingCart,
  CheckCircle,
  Shield,
  Layers,
  Sparkles,
  Info,
  X,
  SlidersHorizontal,
} from 'lucide-react';

interface MarketplaceModuleProps {
  products: Product[];
  onAddToCartAndGoPOS: (product: Product) => void;
}

export const MarketplaceModule: React.FC<MarketplaceModuleProps> = ({
  products,
  onAddToCartAndGoPOS,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);

  const categories = ['Todos', 'Mobiliario', 'Aparatos', 'Tintes y Cuidado', 'Combos y Promos', 'Uñas y Estética'];

  const filtered = products.filter((p) => {
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div id="marketplace-module" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#F4F5F7]">
      {/* Top Banner / Marketplace Header */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-slate-700">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#E6007E]" />
            <span>Showroom Oficial de Mobiliario y Equipamiento</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-['Playfair_Display',serif] tracking-wide">
            Marketplace Palacio de Belleza
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Equipamiento profesional para estéticas, salones y barberías. Garantía de fábrica en bombas hidráulicas, vinil antibacterial y asesoría técnica directa.
          </p>
        </div>

        {/* Decorative castle glow in background */}
        <div className="absolute right-4 -bottom-6 opacity-15 pointer-events-none w-64 h-64 text-[#E6007E]">
          <svg viewBox="0 0 512 512" fill="currentColor" className="w-full h-full">
            <path d="M128 110 L194 110 L194 140 L204 150 L204 320 L118 320 L118 150 L128 140 Z" />
            <path d="M318 110 L384 110 L384 140 L394 150 L394 320 L308 320 L308 150 L318 140 Z" />
            <polygon points="256,170 310,215 310,325 202,325 202,215" />
          </svg>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por mueble, características, SKU..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#E6007E] bg-slate-50 text-[#1E293B]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                selectedCategory === c
                  ? 'bg-[#E6007E] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Showcase Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            id={`marketplace-card-${item.id}`}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200 group"
          >
            {/* Image Box */}
            <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-xs text-[11px] font-bold text-[#1E293B] shadow-2xs">
                {item.category}
              </span>
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#0F172A]/85 backdrop-blur-xs text-[11px] font-mono font-semibold text-white">
                {item.sku}
              </span>
            </div>

            {/* Content Info */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[#0F172A] leading-snug group-hover:text-[#E6007E] transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.description || 'Equipamiento de alta resistencia diseñado para uso rudo continuo en estéticas y barberías.'}
                </p>

                {/* Specs Snippets */}
                {item.specs && (
                  <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                    {item.specs.hydraulic && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 font-medium">
                        Bomba Hidráulica
                      </span>
                    )}
                    {item.specs.warranty && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-medium">
                        {item.specs.warranty}
                      </span>
                    )}
                    {item.specs.dimensions && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {item.specs.dimensions}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Price & Action Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Precio Público
                  </span>
                  <span className="text-xl font-extrabold text-[#0F172A]">
                    ${item.price.toLocaleString('es-MX')}
                  </span>
                  {item.wholesalePrice && (
                    <span className="text-xs text-emerald-700 font-bold block">
                      Mayoreo: ${item.wholesalePrice.toLocaleString('es-MX')}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedProductDetails(item)}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                    title="Ver Ficha Técnica"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  <button
                    id={`buy-in-pos-${item.id}`}
                    onClick={() => onAddToCartAndGoPOS(item)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#E6007E] hover:bg-[#D60072] text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Vender en POS</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Ficha Técnica */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold truncate pr-4">
                Ficha Técnica: {selectedProductDetails.name}
              </h3>
              <button
                onClick={() => setSelectedProductDetails(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700">
              <img
                src={selectedProductDetails.image}
                alt={selectedProductDetails.name}
                referrerPolicy="no-referrer"
                className="w-full h-48 object-cover rounded-xl bg-slate-100"
              />

              <div>
                <span className="text-xs font-bold text-[#E6007E] uppercase">
                  {selectedProductDetails.category} • SKU: {selectedProductDetails.sku}
                </span>
                <h4 className="text-lg font-bold text-[#0F172A] mt-1">
                  {selectedProductDetails.name}
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {selectedProductDetails.description}
                </p>
              </div>

              {selectedProductDetails.specs && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <p className="font-bold text-slate-900 mb-1">Especificaciones Técnicas:</p>
                  {selectedProductDetails.specs.dimensions && (
                    <p><span className="text-slate-500">Dimensiones:</span> {selectedProductDetails.specs.dimensions}</p>
                  )}
                  {selectedProductDetails.specs.material && (
                    <p><span className="text-slate-500">Material / Tapiz:</span> {selectedProductDetails.specs.material}</p>
                  )}
                  {selectedProductDetails.specs.warranty && (
                    <p><span className="text-slate-500">Garantía oficial:</span> {selectedProductDetails.specs.warranty}</p>
                  )}
                  {selectedProductDetails.specs.voltage && (
                    <p><span className="text-slate-500">Voltaje:</span> {selectedProductDetails.specs.voltage}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedProductDetails(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    const prod = selectedProductDetails;
                    setSelectedProductDetails(null);
                    onAddToCartAndGoPOS(prod);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#E6007E] text-white font-bold hover:bg-[#D60072]"
                >
                  Cargar al POS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
