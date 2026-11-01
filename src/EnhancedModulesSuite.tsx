// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Line
} from 'recharts';
import {
  TrendingUp, TrendingDown, Store, Users, DollarSign, BarChart3, PieChart as PieChartIcon,
  ArrowUpRight, ArrowDownRight, Sparkles, Lightbulb, Search, Filter, Package, Tag,
  Calculator, Layers, Database, X, Target, Award, AlertCircle, LayoutTemplate,
  AlertTriangle, ShieldCheck, Download, Scissors, Tags, GitMerge, CalendarDays,
  ListChecks, BadgePercent, LineChart, Percent, Activity
} from 'lucide-react';

// Utilidad universal para exportar cualquier tabla a CSV con BOM UTF-8
export const exportRowsToCsv = (filename, headers, rows) => {
  if (!rows || rows.length === 0) return;
  const csvContent = [
    headers.join(','),
    ...rows.map(r =>
      r.map(val => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',')
    )
  ].join('\n');
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], {
    type: 'text/csv;charset=utf-8;'
  });
  const link = document.createElement('a');
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ============================================================================
// MÓDULO 4.1 MEJORADO: ARQUITECTURA DE PRECIOS (AUR & ESCALERA ENTRY/CORE/PREMIUM)
// ============================================================================
export const EnhancedPricingModule = ({ ctx }) => {
  const {
    uniqueStores,
    uniqueCategories,
    uniqueVendors,
    filterAndConsolidate,
    formatCurrency,
    formatNumber,
    t,
    isDarkMode,
    COLORS
  } = ctx;

  const [storeFilter, setStoreFilter] = useState('Todas');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [vendorFilter, setVendorFilter] = useState('Todos');
  const [tierFilter, setTierFilter] = useState('Todos'); // 'Todos' | 'Entry' | 'Core' | 'Premium'
  const [searchTerm, setSearchTerm] = useState('');
  const [entryThresholdPct, setEntryThresholdPct] = useState(85); // <85% del promedio cat = Entry
  const [premiumThresholdPct, setPremiumThresholdPct] = useState(115); // >115% del promedio cat = Premium

  const pricingData = useMemo(() => {
    const items = filterAndConsolidate({
      store: storeFilter,
      category: categoryFilter,
      vendor: vendorFilter
    }).filter(p => (p.ty || 0) > 0 && (p.units || 0) > 0);

    if (items.length === 0) return null;

    const catMap = new Map();
    items.forEach(p => {
      const aur = p.ty / p.units;
      const cat = p.category || 'SIN CATEGORÍA';
      if (!catMap.has(cat)) {
        catMap.set(cat, { name: cat, items: [], totalTy: 0, totalUnits: 0 });
      }
      const c = catMap.get(cat);
      c.items.push({ ...p, aur });
      c.totalTy += p.ty;
      c.totalUnits += p.units;
    });

    const categoriesLadder = Array.from(catMap.values())
      .map(c => {
        c.items.sort((a, b) => a.aur - b.aur);
        const avgAur = c.totalUnits > 0 ? c.totalTy / c.totalUnits : 0;
        const minItem = c.items[0];
        const maxItem = c.items[c.items.length - 1];
        const spreadRatio = minItem.aur > 0 ? maxItem.aur / minItem.aur : 1;
        return {
          name: c.name,
          shortName: c.name.substring(0, 14),
          skuCount: c.items.length,
          totalTy: c.totalTy,
          minAur: Number(minItem.aur.toFixed(2)),
          avgAur: Number(avgAur.toFixed(2)),
          maxAur: Number(maxItem.aur.toFixed(2)),
          minItem,
          maxItem,
          spreadRatio
        };
      })
      .sort((a, b) => b.totalTy - a.totalTy);

    const catAvgLookup = {};
    categoriesLadder.forEach(c => {
      catAvgLookup[c.name] = c.avgAur;
    });

    let entrySales = 0, coreSales = 0, premiumSales = 0;
    let entryCount = 0, coreCount = 0, premiumCount = 0;

    const skusWithTier = items.map(p => {
      const aur = p.ty / p.units;
      const catAvg = catAvgLookup[p.category] || aur;
      const rpi = catAvg > 0 ? (aur / catAvg) * 100 : 100;
      let priceTier = 'Core';
      if (rpi < entryThresholdPct) {
        priceTier = 'Entry';
        entrySales += p.ty;
        entryCount++;
      } else if (rpi > premiumThresholdPct) {
        priceTier = 'Premium';
        premiumSales += p.ty;
        premiumCount++;
      } else {
        coreSales += p.ty;
        coreCount++;
      }
      return {
        ...p,
        aur,
        catAvg,
        rpi,
        priceTier
      };
    }).sort((a, b) => b.ty - a.ty);

    const totalSales = entrySales + coreSales + premiumSales;
    const filteredSkus = skusWithTier.filter(s => {
      const matchTier = tierFilter === 'Todos' || s.priceTier === tierFilter;
      const matchSearch = !searchTerm ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(s.upc || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchTier && matchSearch;
    });

    return {
      categoriesLadder,
      skus: filteredSkus,
      totalSales,
      tiers: {
        Entry: { count: entryCount, sales: entrySales, share: totalSales > 0 ? (entrySales / totalSales) * 100 : 0 },
        Core: { count: coreCount, sales: coreSales, share: totalSales > 0 ? (coreSales / totalSales) * 100 : 0 },
        Premium: { count: premiumCount, sales: premiumSales, share: totalSales > 0 ? (premiumSales / totalSales) * 100 : 0 }
      }
    };
  }, [storeFilter, categoryFilter, vendorFilter, tierFilter, searchTerm, entryThresholdPct, premiumThresholdPct, ctx]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}>
            <Tags className="w-6 h-6 text-amber-500" /> Arquitectura de Precios (AUR & Escalones Entry / Core / Premium)
          </h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            Analiza la escalera de precios por categoría, audita el índice relativo (RPI) de cada SKU y equilibra tu mezcla entre precios de Entrada, Masivos y Premium.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Store className="w-4 h-4 text-indigo-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
              <option value="Todas">Todas las Tiendas</option>
              {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Filter className="w-4 h-4 text-emerald-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="Todas">Todas las Categorías</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Users className="w-4 h-4 text-amber-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}>
              <option value="Todos">Todos los Suplidores</option>
              {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          {pricingData && (
            <button
              onClick={() => exportRowsToCsv(
                `Arquitectura_Precios_AUR.csv`,
                ['SKU', 'UPC', 'Categoria', 'Suplidor', 'Price Tier', 'AUR ($)', 'Promedio Cat ($)', 'Indice RPI (%)', 'Ventas TY ($)', 'Unidades'],
                pricingData.skus.map(s => [s.name, s.upc, s.category, s.vendor, s.priceTier, s.aur.toFixed(2), s.catAvg.toFixed(2), s.rpi.toFixed(1), s.ty, s.units])
              )}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-indigo-500 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>
          )}
        </div>
      </div>

      {/* Calibrador de Umbrales Entry / Core / Premium */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${t.card}`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider ${t.textSub}`}>
              Umbral Entry (&lt;{entryThresholdPct}% del AUR Cat):
            </span>
            <input type="range" min="60" max="95" value={entryThresholdPct} onChange={e => setEntryThresholdPct(Number(e.target.value))} className="w-24 h-1.5 accent-emerald-500 cursor-pointer" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider ${t.textSub}`}>
              Umbral Premium (&gt;{premiumThresholdPct}% del AUR Cat):
            </span>
            <input type="range" min="105" max="160" value={premiumThresholdPct} onChange={e => setPremiumThresholdPct(Number(e.target.value))} className="w-24 h-1.5 accent-amber-500 cursor-pointer" />
          </div>
        </div>
        <div className="flex gap-1.5">
          {['Todos', 'Entry', 'Core', 'Premium'].map(tf => (
            <button
              key={tf}
              onClick={() => setTierFilter(tf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                tierFilter === tf ? 'bg-indigo-600 text-white shadow' : t.card
              }`}
            >
              {tf === 'Todos' ? 'Todos los Escalones' : `Escalón ${tf}`}
            </button>
          ))}
        </div>
      </div>

      {pricingData ? (
        <>
          {/* 3 Tarjetas de Escalones de Precio (Good / Better / Best) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { key: 'Entry', title: '1. Escalón Entry (Primer Precio / Valor)', color: 'emerald', desc: `SKUs < ${entryThresholdPct}% del precio medio de su categoría` },
              { key: 'Core', title: '2. Escalón Core (Precio Masivo Central)', color: 'indigo', desc: `SKUs entre ${entryThresholdPct}% y ${premiumThresholdPct}% del promedio` },
              { key: 'Premium', title: '3. Escalón Premium (Trade-Up / Alto Margen)', color: 'amber', desc: `SKUs > ${premiumThresholdPct}% del promedio de su categoría` }
            ].map(tier => {
              const info = pricingData.tiers[tier.key];
              return (
                <div
                  key={tier.key}
                  onClick={() => setTierFilter(tierFilter === tier.key ? 'Todos' : tier.key)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    tierFilter === tier.key ? 'ring-2 ring-indigo-500 scale-[1.01]' : ''
                  } ${t.card}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-${tier.color}-500/15 text-${tier.color}-500`}>
                      {tier.title}
                    </span>
                    <span className={`text-xs font-mono font-black ${t.textSub}`}>{info.count} SKUs</span>
                  </div>
                  <p className={`text-2xl font-black mt-2 ${t.textTitle}`}>{formatCurrency(info.sales)}</p>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden my-2">
                    <div className={`h-full bg-${tier.color}-500`} style={{ width: `${info.share}%` }}></div>
                  </div>
                  <p className={`text-[11px] ${t.textSub}`}>
                    <strong>{info.share.toFixed(1)}%</strong> de las ventas • {tier.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Gráfica de Escalera de Precios por Categoría (Min vs Promedio vs Max AUR) */}
          <div className={`p-6 rounded-2xl border mb-6 ${t.card}`}>
            <h3 className={`font-bold text-base mb-1 flex items-center gap-2 ${t.textTitle}`}>
              <BarChart3 className="w-5 h-5 text-amber-500" /> Escalera de Precios por Categoría (Min Entry vs. Core Promedio vs. Max Premium)
            </h3>
            <p className={`text-xs mb-4 ${t.textSub}`}>
              Visualiza la amplitud tarifaria de cada categoría para detectar vacíos de precio o categorías demasiado planas
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={pricingData.categoriesLadder.slice(0, 10)} margin={{ top: 10, right: 20, left: 0, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                  <XAxis dataKey="shortName" angle={-25} textAnchor="end" interval={0} tick={{ fill: t.chartText, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: t.chartText, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '12px' }}
                    formatter={(val) => formatCurrency(val)}
                  />
                  <Legend verticalAlign="top" height={32} iconType="circle" />
                  <Bar dataKey="minAur" name="Min AUR (Entry $)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="avgAur" name="Promedio AUR (Core $)" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="maxAur" name="Max AUR (Premium $)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={18} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla de Dispersión por Categoría + Buscador de SKUs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={`lg:col-span-5 overflow-hidden rounded-2xl border ${t.tableWrapper}`}>
              <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                <h3 className={`font-black text-sm flex items-center gap-2 ${t.textTitle}`}>
                  <Layers className="w-4 h-4 text-indigo-500" /> Dispersión por Categoría ({pricingData.categoriesLadder.length})
                </h3>
              </div>
              <div className="max-h-[460px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className={`sticky top-0 z-10 ${t.tableHeader}`}>
                    <tr className="text-[10px] uppercase font-black">
                      <th className="px-3 py-3">Categoría</th>
                      <th className="px-3 py-3 text-right text-emerald-500">Entry</th>
                      <th className="px-3 py-3 text-right text-indigo-500">Core</th>
                      <th className="px-3 py-3 text-right text-amber-500">Premium</th>
                      <th className="px-3 py-3 text-center">Ratio</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {pricingData.categoriesLadder.map((c, idx) => (
                      <tr
                        key={idx}
                        onClick={() => setCategoryFilter(categoryFilter === c.name ? 'Todas' : c.name)}
                        className={`cursor-pointer transition-colors ${categoryFilter === c.name ? t.rowSelected : t.rowBase}`}
                      >
                        <td className="px-3 py-3">
                          <span className={`font-bold uppercase block ${t.textTitle}`}>{c.name}</span>
                          <span className={`text-[10px] ${t.textSub}`}>{c.skuCount} SKUs</span>
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-emerald-500">{formatCurrency(c.minAur)}</td>
                        <td className="px-3 py-3 text-right font-mono font-black text-indigo-500">{formatCurrency(c.avgAur)}</td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-amber-500">{formatCurrency(c.maxAur)}</td>
                        <td className="px-3 py-3 text-center font-mono text-[11px]">{c.spreadRatio.toFixed(1)}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`lg:col-span-7 overflow-hidden rounded-2xl border ${t.tableWrapper}`}>
              <div className={`p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                <h3 className={`font-black text-sm flex items-center gap-2 ${t.textTitle}`}>
                  <Tags className="w-4 h-4 text-amber-500" /> Posicionamiento Tarifario por SKU ({pricingData.skus.length})
                </h3>
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar SKU o UPC..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs font-medium focus:outline-none ${t.input}`}
                  />
                </div>
              </div>
              <div className="max-h-[460px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className={`sticky top-0 z-10 ${t.tableHeader}`}>
                    <tr className="text-[10px] uppercase font-black">
                      <th className="px-4 py-3">Producto & Categoría</th>
                      <th className="px-3 py-3 text-right">AUR SKU</th>
                      <th className="px-3 py-3 text-right">Prom. Cat</th>
                      <th className="px-3 py-3 text-center">Índice RPI</th>
                      <th className="px-3 py-3 text-center">Escalón</th>
                      <th className="px-4 py-3 text-right">Ventas TY</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {pricingData.skus.slice(0, 120).map((s, idx) => (
                      <tr key={idx} className={t.rowBase}>
                        <td className="px-4 py-3">
                          <span className={`font-bold uppercase block ${t.textTitle}`}>{s.name}</span>
                          <span className={`text-[10px] font-mono ${t.textSub}`}>UPC: {s.upc || 'N/A'} • {s.category}</span>
                        </td>
                        <td className={`px-3 py-3 text-right font-mono font-black ${t.textTitle}`}>{formatCurrency(s.aur)}</td>
                        <td className={`px-3 py-3 text-right font-mono ${t.textSub}`}>{formatCurrency(s.catAvg)}</td>
                        <td className="px-3 py-3 text-center font-mono font-bold">
                          {s.rpi.toFixed(0)}%
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            s.priceTier === 'Entry'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : s.priceTier === 'Premium'
                              ? 'bg-amber-500/15 text-amber-500'
                              : 'bg-indigo-500/15 text-indigo-500'
                          }`}>
                            {s.priceTier}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-mono font-bold ${t.textTitle}`}>{formatCurrency(s.ty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={`rounded-2xl p-12 text-center border-2 border-dashed ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
          <Tags className={`w-12 h-12 mx-auto mb-3 opacity-40 ${t.textSub}`} />
          <h3 className={`text-lg font-bold ${t.textTitle}`}>Carga datos o activa el Demo PR en la barra superior</h3>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MÓDULO 4.3 MEJORADO: SIMULADOR DE PROMOCIONES, MECÁNICAS RETAIL & ROI
// ============================================================================
export const EnhancedPromoRoiModule = ({ ctx }) => {
  const {
    displayProducts,
    uniqueStores,
    uniqueCategories,
    filterAndConsolidate,
    formatCurrency,
    formatNumber,
    t,
    isDarkMode
  } = ctx;

  const [storeFilter, setStoreFilter] = useState('Todas');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkuKey, setSelectedSkuKey] = useState(null);
  const [promoMargin, setPromoMargin] = useState(32);
  const [promoDiscount, setPromoDiscount] = useState(15);
  const [expectedLiftPct, setExpectedLiftPct] = useState(35);
  const [fixedPromoCost, setFixedPromoCost] = useState(0); // Costo fijo de exhibición / shopper

  const candidateProducts = useMemo(() => {
    return filterAndConsolidate({
      store: storeFilter,
      category: categoryFilter
    })
      .filter(p => (p.ty || 0) > 0 && (p.units || 0) > 0)
      .sort((a, b) => b.ty - a.ty);
  }, [displayProducts, storeFilter, categoryFilter]);

  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return candidateProducts.slice(0, 25);
    return candidateProducts
      .filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.upc || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 25);
  }, [candidateProducts, searchTerm]);

  const activeItem = useMemo(() => {
    if (selectedSkuKey) {
      const found = candidateProducts.find(p => p.key === selectedSkuKey);
      if (found) return found;
    }
    return candidateProducts[0] || null;
  }, [candidateProducts, selectedSkuKey]);

  const simulation = useMemo(() => {
    if (!activeItem || activeItem.units <= 0) return null;
    const aur = activeItem.ty / activeItem.units;
    const cost = aur * (1 - promoMargin / 100);
    const regularUnitProfit = aur - cost;
    const totalRegularProfit = regularUnitProfit * activeItem.units;

    const promoAur = aur * (1 - promoDiscount / 100);
    const promoUnitProfit = promoAur - cost;
    const isLoss = promoUnitProfit <= 0;

    const requiredUnitsBreakEven = !isLoss
      ? (totalRegularProfit + Number(fixedPromoCost || 0)) / promoUnitProfit
      : 0;
    const requiredLiftPct = !isLoss && activeItem.units > 0
      ? ((requiredUnitsBreakEven / activeItem.units) - 1) * 100
      : 0;

    // Resultado con el Lift Esperado por el usuario
    const expectedUnits = Math.round(activeItem.units * (1 + expectedLiftPct / 100));
    const expectedRevenue = expectedUnits * promoAur;
    const expectedGrossProfit = expectedUnits * promoUnitProfit - Number(fixedPromoCost || 0);
    const netProfitVariance = expectedGrossProfit - totalRegularProfit;

    const chartData = [0, 15, 30, 50, 75, 100, 150, 200].map(lift => {
      const u = activeItem.units * (1 + lift / 100);
      return {
        lift: `+${lift}%`,
        liftNum: lift,
        profitOriginal: Math.round(totalRegularProfit),
        profitPromo: Math.round(Math.max(0, u * promoUnitProfit - Number(fixedPromoCost || 0)))
      };
    });

    return {
      item: activeItem,
      aur,
      cost,
      regularUnitProfit,
      totalRegularProfit,
      promoAur,
      promoUnitProfit,
      isLoss,
      requiredUnitsBreakEven,
      requiredLiftPct,
      expectedUnits,
      expectedRevenue,
      expectedGrossProfit,
      netProfitVariance,
      chartData
    };
  }, [activeItem, promoMargin, promoDiscount, expectedLiftPct, fixedPromoCost]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}>
            <BadgePercent className="w-6 h-6 text-indigo-500" /> Laboratorio de Promociones & Simulador de Break-Even (Promo ROI)
          </h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            Simula mecánicas promocionales reales (BOGO, 2x, 3x2, Descuentos en Shopper), calcula el Lift de equilibrio y proyecta la ganancia neta según el volumen esperado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Store className="w-4 h-4 text-indigo-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
              <option value="Todas">Todas las Tiendas</option>
              {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Filter className="w-4 h-4 text-emerald-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="Todas">Todas las Categorías</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Presets de Mecánicas Promocionales de Supermercado */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-wrap items-center justify-between gap-3 ${t.card}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest mr-1 ${t.textSub}`}>
            Mecánicas Rápidas de Shopper:
          </span>
          {[
            { label: 'Rebaja Táctica (-10%)', disc: 10, lift: 25 },
            { label: 'Oferta Semanal (-15%)', disc: 15, lift: 45 },
            { label: 'Combo 2x (-20% Off)', disc: 20, lift: 75 },
            { label: 'BOGO 50% en 2do (-25%)', disc: 25, lift: 110 },
            { label: '3x2 Lleva 3 Paga 2 (-33%)', disc: 33, lift: 160 }
          ].map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setPromoDiscount(m.disc);
                setExpectedLiftPct(m.lift);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                promoDiscount === m.disc
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : t.card
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Selector de SKU y Sliders de Calibración */}
        <div className={`p-6 rounded-2xl border lg:col-span-4 flex flex-col gap-5 ${t.card}`}>
          <div>
            <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${t.textTitle}`}>
              1. Seleccionar Producto del Catálogo ({candidateProducts.length} disponibles)
            </label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por nombre o UPC..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-bold focus:outline-none ${t.input}`}
              />
            </div>
            <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200/60 dark:divide-slate-800">
              {filteredCandidates.map(p => {
                const isSel = activeItem?.key === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setSelectedSkuKey(p.key)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between gap-2 ${
                      isSel
                        ? 'bg-indigo-600 text-white font-black'
                        : isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="font-mono text-[10px] shrink-0 opacity-85">{formatCurrency(p.ty)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className={t.textTitle}>2. Margen Bruto Regular:</span>
              <strong className="text-emerald-500 font-mono">{promoMargin}%</strong>
            </div>
            <input type="range" min="10" max="70" value={promoMargin} onChange={e => setPromoMargin(Number(e.target.value))} className="w-full h-2 accent-emerald-500 cursor-pointer" />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className={t.textTitle}>3. Descuento Promocional (% Off):</span>
              <strong className="text-rose-500 font-mono">-{promoDiscount}%</strong>
            </div>
            <input type="range" min="2" max="55" value={promoDiscount} onChange={e => setPromoDiscount(Number(e.target.value))} className="w-full h-2 accent-rose-500 cursor-pointer" />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className={t.textTitle}>4. Lift de Unidades Esperado (%):</span>
              <strong className="text-indigo-500 font-mono">+{expectedLiftPct}%</strong>
            </div>
            <input type="range" min="0" max="250" step="5" value={expectedLiftPct} onChange={e => setExpectedLiftPct(Number(e.target.value))} className="w-full h-2 accent-indigo-500 cursor-pointer" />
          </div>

          <div>
            <label className={`block text-[11px] font-bold mb-1 ${t.textSub}`}>
              5. Costo Fijo de Pauta / Cabecera ($ Opcional):
            </label>
            <input
              type="number"
              min="0"
              value={fixedPromoCost}
              onChange={e => setFixedPromoCost(Math.max(0, Number(e.target.value) || 0))}
              className={`w-full p-2 rounded-xl border text-xs font-mono font-bold ${t.input}`}
            />
          </div>
        </div>

        {/* Columna Derecha: Resultados Financieros del Escenario */}
        <div className={`p-6 rounded-2xl border lg:col-span-8 flex flex-col justify-between ${t.card}`}>
          {simulation ? (
            <>
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-200/60 dark:border-slate-800 mb-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">
                      SKU en Laboratorio Promocional
                    </span>
                    <h3 className={`text-lg font-black uppercase ${t.textTitle}`}>{simulation.item.name}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    !simulation.isLoss && simulation.netProfitVariance >= 0
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'bg-rose-500/15 text-rose-500'
                  }`}>
                    {!simulation.isLoss && simulation.netProfitVariance >= 0
                      ? '✅ Promoción Rentable (Acrecenta Margen $)'
                      : '⚠️ Destrucción de Margen (Lift Insuficiente)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className={`p-3.5 rounded-xl border ${t.card}`}>
                    <span className={`text-[10px] font-bold uppercase block ${t.textSub}`}>Precio Regular → Promo</span>
                    <span className={`text-base font-mono font-black block mt-1 ${t.textTitle}`}>
                      {formatCurrency(simulation.aur)} → <strong className="text-indigo-500">{formatCurrency(simulation.promoAur)}</strong>
                    </span>
                    <span className={`text-[10px] font-mono ${t.textSub}`}>Costo u: {formatCurrency(simulation.cost)}</span>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${t.card}`}>
                    <span className={`text-[10px] font-bold uppercase block ${t.textSub}`}>Ganancia / Unidad</span>
                    <span className={`text-base font-mono font-black block mt-1 ${simulation.isLoss ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {formatCurrency(simulation.promoUnitProfit)} /u
                    </span>
                    <span className={`text-[10px] font-mono ${t.textSub}`}>Antes: {formatCurrency(simulation.regularUnitProfit)} /u</span>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-indigo-950/30 border-indigo-800' : 'bg-indigo-50 border-indigo-200'}`}>
                    <span className="text-[10px] font-bold uppercase block text-indigo-500">Lift Mínimo Break-Even</span>
                    <span className="text-xl font-mono font-black block mt-0.5 text-indigo-500">
                      {simulation.isLoss ? 'Imposible' : `+${simulation.requiredLiftPct.toFixed(0)}%`}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400">
                      {simulation.isLoss ? 'Precio < Costo' : `Exige ${formatNumber(simulation.requiredUnitsBreakEven)} u`}
                    </span>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${
                    simulation.netProfitVariance >= 0
                      ? isDarkMode ? 'bg-emerald-950/30 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                      : isDarkMode ? 'bg-rose-950/30 border-rose-800' : 'bg-rose-50 border-rose-200'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase block ${simulation.netProfitVariance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      Impacto Neto con +{expectedLiftPct}% Lift
                    </span>
                    <span className={`text-xl font-mono font-black block mt-0.5 ${simulation.netProfitVariance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {simulation.netProfitVariance >= 0 ? '+' : ''}{formatCurrency(simulation.netProfitVariance)}
                    </span>
                    <span className={`text-[10px] font-mono ${t.textSub}`}>
                      Utilidad Promo: {formatCurrency(simulation.expectedGrossProfit)}
                    </span>
                  </div>
                </div>
              </div>

              {!simulation.isLoss && (
                <div className="h-60 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={simulation.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                      <XAxis dataKey="lift" tick={{ fill: t.chartText, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '12px' }}
                        formatter={(val) => formatCurrency(val)}
                      />
                      <Legend verticalAlign="top" height={28} iconType="circle" />
                      <Bar dataKey="profitPromo" name="Utilidad Neta con Promo ($)" fill="#4f46e5" radius={[5, 5, 0, 0]} barSize={28} />
                      <Line type="monotone" dataKey="profitOriginal" name="Umbral Ganancia Base Sin Promo ($)" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <Calculator className={`w-12 h-12 mx-auto mb-3 opacity-30 ${t.textSub}`} />
              <p className={`text-sm font-bold ${t.textTitle}`}>Carga datos o activa el Demo PR para simular promociones</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MÓDULO 5.1 MEJORADO: COBERTURA DOS, QUIEBRES Y ORDEN DE REABASTO SUGERIDA
// ============================================================================
export const EnhancedDosModule = ({ ctx }) => {
  const {
    uniqueStores,
    uniqueCategories,
    uniqueVendors,
    filterAndConsolidate,
    formatCurrency,
    formatNumber,
    t,
    isDarkMode
  } = ctx;

  const [storeFilter, setStoreFilter] = useState('Todas');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [vendorFilter, setVendorFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos'); // 'Todos' | 'oos' | 'healthy' | 'overstock'
  const [searchTerm, setSearchTerm] = useState('');
  const [dosPeriodDays, setDosPeriodDays] = useState(365);
  const [targetDos, setTargetDos] = useState(18);
  const [maxDosAlert, setMaxDosAlert] = useState(35);

  const dosData = useMemo(() => {
    const raw = filterAndConsolidate({
      store: storeFilter,
      category: categoryFilter,
      vendor: vendorFilter
    });

    if (raw.length === 0) return null;

    let totalLostSales = 0;
    let totalOrderUnits = 0;
    let totalOrderDollars = 0;
    let totalExcessValue = 0;

    const items = raw.map(p => {
      const dailyUnits = (p.units || 0) / Math.max(1, dosPeriodDays);
      const dos = dailyUnits > 0 ? (p.inv || 0) / dailyUnits : 999;
      const aur = (p.units || 0) > 0 ? p.ty / p.units : 0;
      const targetUnits = Math.ceil(dailyUnits * targetDos);
      const suggestedOrderUnits = dailyUnits > 0 && targetUnits > (p.inv || 0)
        ? targetUnits - (p.inv || 0)
        : 0;
      const lostSales = suggestedOrderUnits * aur;
      const orderCostEst = suggestedOrderUnits * aur * 0.68;

      const excessUnits = dailyUnits > 0 && dos > maxDosAlert
        ? Math.max(0, (p.inv || 0) - Math.ceil(dailyUnits * maxDosAlert))
        : 0;
      const excessValue = excessUnits * aur * 0.68;

      let status = 'healthy';
      let statusLabel = 'Sano / Óptimo';
      if (dos < 7 && p.units > 0) {
        status = 'oos';
        statusLabel = 'Riesgo Quiebre (<7d)';
      } else if (dos > maxDosAlert && p.inv > 0) {
        status = 'overstock';
        statusLabel = `Exceso (>${maxDosAlert}d)`;
      }

      totalLostSales += lostSales;
      totalOrderUnits += suggestedOrderUnits;
      totalOrderDollars += orderCostEst;
      totalExcessValue += excessValue;

      return {
        ...p,
        dailyUnits,
        dos,
        aur,
        targetUnits,
        suggestedOrderUnits,
        lostSales,
        orderCostEst,
        excessUnits,
        excessValue,
        status,
        statusLabel
      };
    }).sort((a, b) => a.dos - b.dos);

    const counts = {
      oos: items.filter(i => i.status === 'oos').length,
      healthy: items.filter(i => i.status === 'healthy').length,
      overstock: items.filter(i => i.status === 'overstock').length
    };

    const validDos = items.filter(i => i.dos < 999);
    const avgDos = validDos.length > 0 ? validDos.reduce((s, x) => s + x.dos, 0) / validDos.length : 0;

    const visibleItems = items.filter(i => {
      const matchStatus = statusFilter === 'Todos' || i.status === statusFilter;
      const matchSearch = !searchTerm ||
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(i.upc || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });

    return {
      items: visibleItems,
      allCount: items.length,
      counts,
      avgDos,
      totalLostSales,
      totalOrderUnits,
      totalOrderDollars,
      totalExcessValue
    };
  }, [storeFilter, categoryFilter, vendorFilter, statusFilter, searchTerm, dosPeriodDays, targetDos, maxDosAlert, ctx]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}>
            <Activity className="w-6 h-6 text-rose-500" /> Cobertura DOS, Prevención de Quiebres & Orden de Compra Sugerida
          </h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            Audita los días de inventario físico (Days of Supply), cuantifica la venta en riesgo por desabasto y genera automáticamente el pedido sugerido de reposición.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Store className="w-4 h-4 text-indigo-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
              <option value="Todas">Todas las Tiendas</option>
              {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Filter className="w-4 h-4 text-emerald-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="Todas">Todas las Categorías</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Users className="w-4 h-4 text-amber-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}>
              <option value="Todos">Todos los Suplidores</option>
              {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          {dosData && (
            <button
              onClick={() => exportRowsToCsv(
                `Orden_Reabasto_DOS_${targetDos}d.csv`,
                ['UPC', 'Producto', 'Categoria', 'Suplidor', 'Stock Actual', 'DOS (Dias)', 'Estatus', 'Pedido Sugerido (Unidades)', 'Costo Pedido Est ($)', 'Venta Protegida ($)'],
                dosData.items.map(i => [i.upc, i.name, i.category, i.vendor, i.inv, i.dos >= 999 ? '999+' : i.dos.toFixed(1), i.statusLabel, i.suggestedOrderUnits, i.orderCostEst.toFixed(2), i.lostSales.toFixed(2)])
              )}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-emerald-500 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Exportar Orden (.CSV)
            </button>
          )}
        </div>
      </div>

      {/* Controles de Horizonte y Target DOS */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-wrap items-center justify-between gap-4 ${t.card}`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${t.textSub}`}>Cobertura Meta (Target DOS):</span>
            {[7, 14, 18, 21, 30].map(d => (
              <button
                key={d}
                onClick={() => setTargetDos(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                  targetDos === d ? 'bg-indigo-600 text-white border-indigo-600' : t.card
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${t.textSub}`}>Umbral Sobreinventario:</span>
            {[30, 45, 60].map(m => (
              <button
                key={m}
                onClick={() => setMaxDosAlert(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                  maxDosAlert === m ? 'bg-amber-500 text-slate-950 border-amber-400' : t.card
                }`}
              >
                &gt;{m}d
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar SKU o UPC..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs font-medium focus:outline-none ${t.input}`}
          />
        </div>
      </div>

      {dosData ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setStatusFilter(statusFilter === 'oos' ? 'Todos' : 'oos')}
              className={`p-5 rounded-2xl border text-left transition-all ${statusFilter === 'oos' ? 'ring-2 ring-rose-500' : ''} ${isDarkMode ? 'bg-rose-950/20 border-rose-900/50' : 'bg-rose-50/60 border-rose-200'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block">1. Alerta Quiebre (&lt;7 días)</span>
              <span className="text-3xl font-black text-rose-500 mt-1 block">{dosData.counts.oos} SKUs</span>
              <span className={`text-xs ${t.textSub}`}>Clic para filtrar urgencias</span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'healthy' ? 'Todos' : 'healthy')}
              className={`p-5 rounded-2xl border text-left transition-all ${statusFilter === 'healthy' ? 'ring-2 ring-emerald-500' : ''} ${t.card}`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block">2. Stock Sano (7 - {maxDosAlert}d)</span>
              <span className="text-3xl font-black text-emerald-500 mt-1 block">{dosData.counts.healthy} SKUs</span>
              <span className={`text-xs ${t.textSub}`}>DOS Promedio: {dosData.avgDos.toFixed(1)} días</span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'overstock' ? 'Todos' : 'overstock')}
              className={`p-5 rounded-2xl border text-left transition-all ${statusFilter === 'overstock' ? 'ring-2 ring-amber-500' : ''} ${isDarkMode ? 'bg-amber-950/20 border-amber-900/50' : 'bg-amber-50/60 border-amber-200'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block">3. Sobreinventario (&gt;{maxDosAlert}d)</span>
              <span className="text-3xl font-black text-amber-500 mt-1 block">{dosData.counts.overstock} SKUs</span>
              <span className={`text-xs ${t.textSub}`}>Exceso: {formatCurrency(dosData.totalExcessValue)}</span>
            </button>

            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-indigo-950/30 border-indigo-800' : 'bg-indigo-50/70 border-indigo-200'}`}>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 block">4. Pedido Sugerido ({targetDos}d)</span>
              <span className="text-2xl font-black text-indigo-500 mt-1 block">{formatNumber(dosData.totalOrderUnits)} unds</span>
              <span className={`text-xs ${t.textSub}`}>Protege {formatCurrency(dosData.totalLostSales)} en ventas</span>
            </div>
          </div>

          <div className={`overflow-hidden rounded-2xl border ${t.tableWrapper}`}>
            <div className="max-h-[520px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className={`sticky top-0 z-10 ${t.tableHeader}`}>
                  <tr className="text-[10px] uppercase font-black tracking-widest">
                    <th className="px-4 py-3.5">Producto & Categoría</th>
                    <th className="px-3 py-3.5 text-center">Venta Diaria</th>
                    <th className="px-3 py-3.5 text-center">Stock Actual</th>
                    <th className="px-3 py-3.5 text-center">Cobertura DOS</th>
                    <th className="px-3 py-3.5 text-center">Semáforo</th>
                    <th className="px-3 py-3.5 text-right">Pedido Sugerido ({targetDos}d)</th>
                    <th className="px-4 py-3.5 text-right">Venta en Riesgo ($)</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.tableDivide}`}>
                  {dosData.items.slice(0, 150).map((p, idx) => (
                    <tr key={idx} className={t.rowBase}>
                      <td className="px-4 py-3">
                        <span className={`font-bold uppercase block ${t.textTitle}`}>{p.name}</span>
                        <span className={`text-[10px] font-mono ${t.textSub}`}>UPC: {p.upc || 'N/A'} • {p.category} • {p.vendor}</span>
                      </td>
                      <td className={`px-3 py-3 text-center font-mono ${t.textSub}`}>
                        {p.dailyUnits.toFixed(1)} u/d
                      </td>
                      <td className={`px-3 py-3 text-center font-mono font-bold ${t.textTitle}`}>
                        {formatNumber(p.inv)} u
                      </td>
                      <td className={`px-3 py-3 text-center font-mono font-black ${
                        p.status === 'oos' ? 'text-rose-500' : p.status === 'overstock' ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {p.dos >= 999 ? '999+' : `${p.dos.toFixed(1)}d`}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          p.status === 'oos'
                            ? 'bg-rose-500/15 text-rose-500'
                            : p.status === 'overstock'
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-emerald-500/15 text-emerald-500'
                        }`}>
                          {p.statusLabel}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        {p.suggestedOrderUnits > 0 ? (
                          <span className="font-mono font-black text-indigo-500">
                            +{formatNumber(p.suggestedOrderUnits)} u
                          </span>
                        ) : (
                          <span className={`font-mono ${t.textSub}`}>0 u</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${p.lostSales > 0 ? 'text-rose-500' : t.textSub}`}>
                        {p.lostSales > 0 ? formatCurrency(p.lostSales) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

// ============================================================================
// MÓDULO 5.2 MEJORADO: LIQUIDACIÓN DE OBSOLETOS Y SIMULADOR DE CLEARANCE
// ============================================================================
export const EnhancedMarkdownsModule = ({ ctx }) => {
  const {
    uniqueStores,
    uniqueCategories,
    uniqueVendors,
    filterAndConsolidate,
    formatCurrency,
    formatNumber,
    t,
    isDarkMode
  } = ctx;

  const [storeFilter, setStoreFilter] = useState('Todas');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [vendorFilter, setVendorFilter] = useState('Todos');
  const [dropThresholdPct, setDropThresholdPct] = useState(-15); // Caída YoY peor que -15%
  const [minTrappedDollars, setMinTrappedDollars] = useState(40);
  const [clearanceDiscountPct, setClearanceDiscountPct] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');

  const markdownData = useMemo(() => {
    const raw = filterAndConsolidate({
      store: storeFilter,
      category: categoryFilter,
      vendor: vendorFilter
    });

    const discountRatio = clearanceDiscountPct / 100;
    let totalTrappedCost = 0;
    let totalRetailValue = 0;
    let totalCashRecovered = 0;
    let totalUnitsToClear = 0;

    const items = raw
      .map(p => {
        const growthPct = p.ly > 0 ? ((p.ty - p.ly) / p.ly) * 100 : 0;
        const aur = p.units > 0 ? p.ty / p.units : 8.5;
        const retailStockValue = (p.inv || 0) * aur;
        const trappedCapital = retailStockValue * 0.65; // Costo estimado
        const clearancePrice = aur * (1 - discountRatio);
        const cashRecovered = (p.inv || 0) * clearancePrice;
        const netMarginImpact = cashRecovered - trappedCapital;

        return {
          ...p,
          growthPct,
          aur,
          clearancePrice,
          retailStockValue,
          trappedCapital,
          cashRecovered,
          netMarginImpact
        };
      })
      .filter(p =>
        p.growthPct <= dropThresholdPct &&
        p.trappedCapital >= minTrappedDollars &&
        (!searchTerm ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(p.upc || '').toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => b.trappedCapital - a.trappedCapital);

    items.forEach(i => {
      totalTrappedCost += i.trappedCapital;
      totalRetailValue += i.retailStockValue;
      totalCashRecovered += i.cashRecovered;
      totalUnitsToClear += i.inv || 0;
    });

    return {
      items,
      totalTrappedCost,
      totalRetailValue,
      totalCashRecovered,
      totalUnitsToClear,
      netRecoveryVsCost: totalCashRecovered - totalTrappedCost
    };
  }, [storeFilter, categoryFilter, vendorFilter, dropThresholdPct, minTrappedDollars, clearanceDiscountPct, searchTerm, ctx]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}>
            <TrendingDown className="w-6 h-6 text-rose-500" /> Simulador de Liquidación (Markdowns) & Liberación de Capital
          </h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            Ajusta el umbral de caída interanual y el descuento de liquidación (Clearance) para calcular cuánto flujo de caja puedes recuperar del inventario lento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Store className="w-4 h-4 text-indigo-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
              <option value="Todas">Todas las Tiendas</option>
              {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Filter className="w-4 h-4 text-emerald-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="Todas">Todas las Categorías</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={() => exportRowsToCsv(
              `Plan_Liquidacion_Markdown_${clearanceDiscountPct}pct.csv`,
              ['UPC', 'Producto', 'Categoria', 'Caida YoY (%)', 'Unidades Stock', 'Precio Regular', 'Precio Liquidacion', 'Capital Atrapado ($)', 'Efectivo Recuperado ($)'],
              markdownData.items.map(i => [i.upc, i.name, i.category, i.growthPct.toFixed(1), i.inv, i.aur.toFixed(2), i.clearancePrice.toFixed(2), i.trappedCapital.toFixed(2), i.cashRecovered.toFixed(2)])
            )}
            className="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-rose-500 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Exportar Liquidación (.CSV)
          </button>
        </div>
      </div>

      {/* Controles de Sensibilidad de Liquidación */}
      <div className={`p-4 rounded-2xl border mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 ${t.card}`}>
        <div>
          <span className={`text-[10px] font-black uppercase block mb-1 ${t.textSub}`}>
            1. Caída YoY Mínima para Alerta: <strong className="text-rose-500">{dropThresholdPct}%</strong>
          </span>
          <input type="range" min="-50" max="-5" step="5" value={dropThresholdPct} onChange={e => setDropThresholdPct(Number(e.target.value))} className="w-full h-1.5 accent-rose-500 cursor-pointer" />
        </div>
        <div>
          <span className={`text-[10px] font-black uppercase block mb-1 ${t.textSub}`}>
            2. Descuento de Liquidación (Clearance): <strong className="text-amber-500">-{clearanceDiscountPct}% Off</strong>
          </span>
          <div className="flex gap-1.5 mt-1">
            {[15, 25, 30, 40, 50].map(d => (
              <button
                key={d}
                onClick={() => setClearanceDiscountPct(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                  clearanceDiscountPct === d ? 'bg-amber-500 text-slate-950 border-amber-400' : t.card
                }`}
              >
                -{d}%
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className={`text-[10px] font-black uppercase block mb-1 ${t.textSub}`}>
            3. Capital Mínimo por SKU: <strong className="text-indigo-500">${minTrappedDollars}</strong>
          </span>
          <input type="range" min="10" max="300" step="10" value={minTrappedDollars} onChange={e => setMinTrappedDollars(Number(e.target.value))} className="w-full h-1.5 accent-indigo-500 cursor-pointer" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-rose-950/20 border-rose-900/50' : 'bg-rose-50 border-rose-200'}`}>
          <span className="text-[10px] font-black uppercase text-rose-500 block">1. Capital Atrapado (Costo)</span>
          <span className="text-2xl font-black text-rose-500 mt-1 block">{formatCurrency(markdownData.totalTrappedCost)}</span>
          <span className={`text-xs ${t.textSub}`}>{markdownData.items.length} SKUs en declive</span>
        </div>
        <div className={`p-5 rounded-2xl border ${t.card}`}>
          <span className={`text-[10px] font-black uppercase block ${t.textSub}`}>2. Unidades a Liquidar</span>
          <span className={`text-2xl font-black mt-1 block ${t.textTitle}`}>{formatNumber(markdownData.totalUnitsToClear)} u</span>
          <span className={`text-xs ${t.textSub}`}>Valor Retail: {formatCurrency(markdownData.totalRetailValue)}</span>
        </div>
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200'}`}>
          <span className="text-[10px] font-black uppercase text-emerald-500 block">3. Efectivo Recuperado (-{clearanceDiscountPct}%)</span>
          <span className="text-2xl font-black text-emerald-500 mt-1 block">{formatCurrency(markdownData.totalCashRecovered)}</span>
          <span className={`text-xs ${t.textSub}`}>Liquidez inmediata para compras</span>
        </div>
        <div className={`p-5 rounded-2xl border ${t.card}`}>
          <span className={`text-[10px] font-black uppercase block ${t.textSub}`}>4. Balance Neto vs Costo</span>
          <span className={`text-2xl font-black mt-1 block ${markdownData.netRecoveryVsCost >= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {markdownData.netRecoveryVsCost >= 0 ? '+' : ''}{formatCurrency(markdownData.netRecoveryVsCost)}
          </span>
          <span className={`text-xs ${t.textSub}`}>{markdownData.netRecoveryVsCost >= 0 ? 'Recupera 100% del costo' : 'Sacrificio parcial de costo'}</span>
        </div>
      </div>

      <div className={`overflow-hidden rounded-2xl border ${t.tableWrapper}`}>
        <div className="max-h-[480px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className={`sticky top-0 z-10 ${t.tableHeader}`}>
              <tr className="text-[10px] uppercase font-black tracking-widest">
                <th className="px-4 py-3.5">Producto & UPC</th>
                <th className="px-3 py-3.5 text-center">Stock</th>
                <th className="px-3 py-3.5 text-right">Caída YoY</th>
                <th className="px-3 py-3.5 text-right">Precio Reg → Promo (-{clearanceDiscountPct}%)</th>
                <th className="px-3 py-3.5 text-right">Capital Atrapado</th>
                <th className="px-4 py-3.5 text-right">Efectivo a Recuperar</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${t.tableDivide}`}>
              {markdownData.items.slice(0, 120).map((p, idx) => (
                <tr key={idx} className={t.rowBase}>
                  <td className="px-4 py-3">
                    <span className={`font-bold uppercase block ${t.textTitle}`}>{p.name}</span>
                    <span className={`text-[10px] font-mono ${t.textSub}`}>UPC: {p.upc || 'N/A'} • {p.category}</span>
                  </td>
                  <td className={`px-3 py-3 text-center font-mono font-bold ${t.textTitle}`}>{formatNumber(p.inv)} u</td>
                  <td className="px-3 py-3 text-right font-mono font-black text-rose-500">{p.growthPct.toFixed(1)}%</td>
                  <td className="px-3 py-3 text-right font-mono">
                    <span className="line-through opacity-60 mr-1.5">{formatCurrency(p.aur)}</span>
                    <strong className="text-amber-500">{formatCurrency(p.clearancePrice)}</strong>
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-rose-500">{formatCurrency(p.trappedCapital)}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-emerald-500">{formatCurrency(p.cashRecovered)}</td>
                </tr>
              ))}
              {markdownData.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No hay productos que superen este umbral de caída/capital atrapado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MÓDULO 5.6 UNIFICADO: PRODUCTIVIDAD DE GÓNDOLA & ESPACIO LINEAL (CON PIETAJE Y CARAS)
// ============================================================================
export const EnhancedSpaceProductivityModule = ({ ctx }) => {
  const {
    uniqueStores,
    uniqueCategories,
    filterAndConsolidate,
    formatCurrency,
    formatNumber,
    t,
    isDarkMode,
    COLORS
  } = ctx;

  const [storeFilter, setStoreFilter] = useState('Todas');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [dimension, setDimension] = useState('category'); // 'category' | 'vendor' | 'sku'
  const [totalGondolaFeet, setTotalGondolaFeet] = useState(24);
  const [actionFilter, setActionFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const spaceData = useMemo(() => {
    const raw = filterAndConsolidate({
      store: storeFilter,
      category: categoryFilter
    }).filter(p => (p.ty || 0) > 0 || (p.inv || 0) > 0);

    if (raw.length === 0) return null;

    const groupMap = new Map();
    raw.forEach(p => {
      const key =
        dimension === 'category'
          ? p.category || 'SIN CATEGORÍA'
          : dimension === 'vendor'
          ? p.vendor || 'NO ESPECIFICADO'
          : p.name;

      if (!groupMap.has(key)) {
        groupMap.set(key, { name: key, ty: 0, ly: 0, inv: 0, units: 0, skuCount: 0, widthSum: 0 });
      }
      const g = groupMap.get(key);
      g.ty += p.ty || 0;
      g.ly += p.ly || 0;
      g.inv += p.inv || 0;
      g.units += p.units || 0;
      g.skuCount += 1;
      g.widthSum += Number(p.width) || 2.6;
    });

    let list = Array.from(groupMap.values());
    if (dimension === 'sku') list = list.sort((a, b) => b.ty - a.ty).slice(0, 40);

    const totalSales = list.reduce((s, x) => s + x.ty, 0);
    const totalInv = list.reduce((s, x) => s + x.inv, 0);
    if (totalSales <= 0 || totalInv <= 0) return null;

    const rows = list.map((g, idx) => {
      const shareOfSales = (g.ty / totalSales) * 100;
      const shareOfSpace = (g.inv / totalInv) * 100;
      const index = shareOfSpace > 0 ? shareOfSales / shareOfSpace : 1;
      const currentFeet = (shareOfSpace / 100) * totalGondolaFeet;
      const idealFeet = (shareOfSales / 100) * totalGondolaFeet;
      const deltaFeet = idealFeet - currentFeet;
      const avgWidth = g.skuCount > 0 ? g.widthSum / g.skuCount : 2.6;
      const deltaFacings = Math.round((deltaFeet * 12) / avgWidth);

      let action = 'Mantener Espacio';
      let statusKey = 'keep';
      if (index > 1.18) {
        action = `Expandir Góndola (+${deltaFeet.toFixed(1)} ft)`;
        statusKey = 'expand';
      } else if (index < 0.82 && shareOfSpace > 1) {
        action = `Reducir Góndola (${deltaFeet.toFixed(1)} ft)`;
        statusKey = 'reduce';
      }

      return {
        ...g,
        color: COLORS[idx % COLORS.length],
        shareOfSales,
        shareOfSpace,
        index,
        currentFeet,
        idealFeet,
        deltaFeet,
        deltaFacings,
        action,
        statusKey
      };
    }).sort((a, b) => b.shareOfSales - a.shareOfSales);

    const visibleRows = rows.filter(r => {
      const matchAct = actionFilter === 'Todos' || r.statusKey === actionFilter;
      const matchSearch = !searchTerm || r.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchAct && matchSearch;
    });

    return {
      rows: visibleRows,
      chartRows: rows.slice(0, 10),
      counts: {
        expand: rows.filter(r => r.statusKey === 'expand').length,
        keep: rows.filter(r => r.statusKey === 'keep').length,
        reduce: rows.filter(r => r.statusKey === 'reduce').length
      }
    };
  }, [storeFilter, categoryFilter, dimension, totalGondolaFeet, actionFilter, searchTerm, ctx]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}>
            <LayoutTemplate className="w-6 h-6 text-indigo-500" /> Space vs. Sales: Productividad y Asignación de Góndola
          </h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            Compara el % de Ventas frente al % de Espacio por Categoría, Suplidor o SKU y calcula cuántos pies lineales (ft) y caras (facings) debe ganar o ceder cada sección.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Store className="w-4 h-4 text-indigo-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
              <option value="Todas">Todas las Tiendas</option>
              {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {dimension !== 'category' && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
              <Filter className="w-4 h-4 text-emerald-400" />
              <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="Todas">Todas las Categorías</option>
                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          {spaceData && (
            <button
              onClick={() => exportRowsToCsv(
                `Productividad_Gondola_${dimension}.csv`,
                ['Nombre', 'Ventas TY ($)', 'Share Ventas (%)', 'Share Espacio (%)', 'Indice Space/Sales', 'Pies Actuales (ft)', 'Pies Ideales (ft)', 'Ajuste Caras', 'Accion'],
                spaceData.rows.map(r => [r.name, r.ty, r.shareOfSales.toFixed(1), r.shareOfSpace.toFixed(1), r.index.toFixed(2), r.currentFeet.toFixed(1), r.idealFeet.toFixed(1), r.deltaFacings, r.action])
              )}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-indigo-500 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>
          )}
        </div>
      </div>

      {/* Selector de Dimensión y Pietaje de Góndola */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${t.card}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest ${t.textSub}`}>Nivel de Auditoría:</span>
          {[
            { id: 'category', label: 'Por Categoría' },
            { id: 'vendor', label: 'Por Suplidor / Marca' },
            { id: 'sku', label: 'Por Top SKUs' }
          ].map(d => (
            <button
              key={d.id}
              onClick={() => setDimension(d.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                dimension === d.id ? 'bg-indigo-600 text-white shadow' : t.card
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest ${t.textSub}`}>Pietaje Total de Góndola:</span>
          {[8, 12, 16, 24, 32, 48].map(ft => (
            <button
              key={ft}
              onClick={() => setTotalGondolaFeet(ft)}
              className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                totalGondolaFeet === ft ? 'bg-emerald-600 text-white border-emerald-500' : t.card
              }`}
            >
              {ft} ft
            </button>
          ))}
        </div>
      </div>

      {spaceData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setActionFilter(actionFilter === 'expand' ? 'Todos' : 'expand')}
              className={`p-4 rounded-2xl border text-left transition-all ${actionFilter === 'expand' ? 'ring-2 ring-emerald-500' : ''} ${t.card}`}
            >
              <span className="text-[10px] font-black uppercase text-emerald-500 block">Merecen Más Góndola (Index &gt; 1.18x)</span>
              <span className="text-2xl font-black text-emerald-500 mt-1 block">{spaceData.counts.expand}</span>
            </button>
            <button
              onClick={() => setActionFilter(actionFilter === 'keep' ? 'Todos' : 'keep')}
              className={`p-4 rounded-2xl border text-left transition-all ${actionFilter === 'keep' ? 'ring-2 ring-indigo-500' : ''} ${t.card}`}
            >
              <span className="text-[10px] font-black uppercase text-indigo-500 block">En Equilibrio Justo (0.82x - 1.18x)</span>
              <span className="text-2xl font-black text-indigo-500 mt-1 block">{spaceData.counts.keep}</span>
            </button>
            <button
              onClick={() => setActionFilter(actionFilter === 'reduce' ? 'Todos' : 'reduce')}
              className={`p-4 rounded-2xl border text-left transition-all ${actionFilter === 'reduce' ? 'ring-2 ring-rose-500' : ''} ${t.card}`}
            >
              <span className="text-[10px] font-black uppercase text-rose-500 block">Sobre-Espaciados / Ceder Caras (&lt;0.82x)</span>
              <span className="text-2xl font-black text-rose-500 mt-1 block">{spaceData.counts.reduce}</span>
            </button>
          </div>

          <div className={`p-6 rounded-2xl border mb-6 ${t.card}`}>
            <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${t.textTitle}`}>
              <BarChart3 className="w-5 h-5 text-indigo-500" /> Comparativa % Share de Ventas vs. % Share de Espacio en Góndola
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={spaceData.chartRows} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                  <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} tick={{ fill: t.chartText, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis unit="%" tick={{ fill: t.chartText, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '12px' }}
                    formatter={(val) => `${Number(val).toFixed(1)}%`}
                  />
                  <Legend verticalAlign="top" height={28} iconType="circle" />
                  <Bar dataKey="shareOfSales" name="% Share de Ventas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
                  <Bar dataKey="shareOfSpace" name="% Share de Espacio" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={22} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`overflow-hidden rounded-2xl border ${t.tableWrapper}`}>
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className={`sticky top-0 z-10 ${t.tableHeader}`}>
                  <tr className="text-[10px] uppercase font-black tracking-widest">
                    <th className="px-4 py-3.5">Nombre ({dimension === 'category' ? 'Categoría' : dimension === 'vendor' ? 'Suplidor' : 'SKU'})</th>
                    <th className="px-3 py-3.5 text-center">% Ventas</th>
                    <th className="px-3 py-3.5 text-center">% Espacio</th>
                    <th className="px-3 py-3.5 text-center">Space Index</th>
                    <th className="px-3 py-3.5 text-right">Pies Actuales → Ideales ({totalGondolaFeet}ft)</th>
                    <th className="px-3 py-3.5 text-center">Ajuste Caras JDA</th>
                    <th className="px-4 py-3.5 text-center">Acción Recomendada</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.tableDivide}`}>
                  {spaceData.rows.map((c, idx) => (
                    <tr key={idx} className={t.rowBase}>
                      <td className="px-4 py-3">
                        <span className={`font-bold uppercase block ${t.textTitle}`}>{c.name}</span>
                        <span className={`text-[10px] font-mono ${t.textSub}`}>{formatCurrency(c.ty)} • {c.skuCount} SKUs</span>
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-emerald-500">{c.shareOfSales.toFixed(1)}%</td>
                      <td className="px-3 py-3 text-center font-mono text-indigo-400">{c.shareOfSpace.toFixed(1)}%</td>
                      <td className={`px-3 py-3 text-center font-mono font-black ${
                        c.index > 1.18 ? 'text-emerald-500' : c.index < 0.82 ? 'text-rose-500' : t.textTitle
                      }`}>
                        {c.index.toFixed(2)}x
                      </td>
                      <td className="px-3 py-3 text-right font-mono">
                        {c.currentFeet.toFixed(1)} ft → <strong className="text-indigo-500">{c.idealFeet.toFixed(1)} ft</strong>
                      </td>
                      <td className={`px-3 py-3 text-center font-mono font-black ${
                        c.deltaFacings > 0 ? 'text-emerald-500' : c.deltaFacings < 0 ? 'text-rose-500' : t.textSub
                      }`}>
                        {c.deltaFacings >= 0 ? '+' : ''}{c.deltaFacings} caras
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                          c.statusKey === 'expand'
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : c.statusKey === 'reduce'
                            ? 'bg-rose-500/15 text-rose-500'
                            : 'bg-slate-500/15 text-slate-400'
                        }`}>
                          {c.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
// ============================================================================
// MÓDULO 5.3 MEJORADO: DEPURACIÓN DE SURTIDO (SKU RATIONALIZATION) & TRANSFERENCIA
// ============================================================================
export const EnhancedRationalizationModule = ({ ctx }) => {
  const {
    uniqueStores,
    uniqueCategories,
    uniqueVendors,
    filterAndConsolidate,
    formatCurrency,
    formatNumber,
    t,
    isDarkMode
  } = ctx;

  const [storeFilter, setStoreFilter] = useState('Todas');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [vendorFilter, setVendorFilter] = useState('Todos');
  const [actionFilter, setActionFilter] = useState('Todos'); // 'Todos' | 'GROW' | 'KEEP' | 'WATCH' | 'REVIEW' | 'DROP'
  const [transferDemandPct, setTransferDemandPct] = useState(65); // % de demanda de SKUs DROP que migra a SKUs GROW/KEEP
  const [searchTerm, setSearchTerm] = useState('');

  const ratData = useMemo(() => {
    const raw = filterAndConsolidate({
      store: storeFilter,
      category: categoryFilter,
      vendor: vendorFilter
    }).sort((a, b) => b.ty - a.ty);

    if (raw.length === 0) return null;

    const totalSales = raw.reduce((s, p) => s + (p.ty || 0), 0);
    if (totalSales <= 0) return null;

    let cumSales = 0;
    const counts = { GROW: 0, KEEP: 0, WATCH: 0, REVIEW: 0, DROP: 0 };
    let dropSales = 0;
    let dropCapital = 0;

    const items = raw.map(p => {
      cumSales += p.ty || 0;
      const cumPct = (cumSales / totalSales) * 100;
      const growthPct = p.ly > 0 ? ((p.ty - p.ly) / p.ly) * 100 : (p.ty > 0 ? 100 : 0);
      const aur = p.units > 0 ? p.ty / p.units : 8.5;
      const invCost = (p.inv || 0) * aur * 0.65;

      let paretoClass = 'C';
      if (cumPct <= 80) paretoClass = 'A';
      else if (cumPct <= 95) paretoClass = 'B';

      let actionCode = 'KEEP';
      let actionLabel = 'Mantener (Base)';
      let reason = 'Aporte estable al surtido';

      if (paretoClass === 'A' && growthPct >= 0) {
        actionCode = 'GROW';
        actionLabel = 'Blindar & Expandir';
        reason = 'Top 80% ventas + Crecimiento positivo';
      } else if (paretoClass === 'A' && growthPct < 0) {
        actionCode = 'WATCH';
        actionLabel = 'Defender Tráfico';
        reason = 'Líder de ingresos con erosión YoY';
      } else if (paretoClass === 'C' && growthPct < -10) {
        actionCode = 'DROP';
        actionLabel = 'Eliminar / Deslistar';
        reason = 'Cola Pareto C (último 5%) y caída severa';
        dropSales += p.ty || 0;
        dropCapital += invCost;
      } else if (paretoClass === 'C') {
        actionCode = 'REVIEW';
        actionLabel = 'Evaluar Sustituto';
        reason = 'Baja rotación relativa en góndola';
      }

      counts[actionCode] = (counts[actionCode] || 0) + 1;

      return {
        ...p,
        paretoClass,
        cumPct,
        growthPct,
        invCost,
        actionCode,
        actionLabel,
        reason
      };
    });

    const retainedSalesFromDrop = dropSales * (transferDemandPct / 100);
    const netRiskSales = dropSales - retainedSalesFromDrop;

    const visibleItems = items.filter(i => {
      const matchAct = actionFilter === 'Todos' || i.actionCode === actionFilter;
      const matchSearch = !searchTerm ||
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(i.upc || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchAct && matchSearch;
    });

    return {
      items: visibleItems,
      totalSkus: items.length,
      counts,
      dropSales,
      dropCapital,
      retainedSalesFromDrop,
      netRiskSales
    };
  }, [storeFilter, categoryFilter, vendorFilter, actionFilter, transferDemandPct, searchTerm, ctx]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}>
            <Scissors className="w-6 h-6 text-rose-500" /> Racionalización de Surtido (SKU Depuration) & Transferencia de Demanda
          </h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            Cruza la clasificación Pareto (A/B/C) con la tendencia YoY y simula cuánta venta retiene la categoría al eliminar SKUs redundantes (Cola C).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Store className="w-4 h-4 text-indigo-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
              <option value="Todas">Todas las Tiendas</option>
              {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Filter className="w-4 h-4 text-emerald-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="Todas">Todas las Categorías</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Users className="w-4 h-4 text-amber-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}>
              <option value="Todos">Todos los Suplidores</option>
              {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          {ratData && (
            <button
              onClick={() => exportRowsToCsv(
                `Racionalizacion_SKUs_${categoryFilter}.csv`,
                ['UPC', 'Producto', 'Categoria', 'Suplidor', 'Clase Pareto', 'Ventas TY ($)', 'Var YoY (%)', 'Capital Stock ($)', 'Accion', 'Justificacion'],
                ratData.items.map(i => [i.upc, i.name, i.category, i.vendor, i.paretoClass, i.ty, i.growthPct.toFixed(1), i.invCost.toFixed(2), i.actionCode, i.reason])
              )}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-indigo-500 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>
          )}
        </div>
      </div>

      {ratData ? (
        <>
          {/* Simulador de Transferencia de Demanda */}
          <div className={`p-4 rounded-2xl border mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${t.card}`}>
            <div className="flex-1">
              <span className={`text-xs font-black uppercase tracking-wider block ${t.textTitle}`}>
                Simulador de Retención al Deslistar SKUs "DROP" (% Demanda Transferible a Líderes): <strong className="text-emerald-500">{transferDemandPct}%</strong>
              </span>
              <div className="flex items-center gap-3 mt-2">
                <input type="range" min="20" max="90" step="5" value={transferDemandPct} onChange={e => setTransferDemandPct(Number(e.target.value))} className="w-56 h-1.5 accent-emerald-500 cursor-pointer" />
                <span className={`text-xs ${t.textSub}`}>
                  Venta retenida por SKUs A/B: <strong className="text-emerald-500">{formatCurrency(ratData.retainedSalesFromDrop)}</strong> • Capital liberado: <strong className="text-indigo-500">{formatCurrency(ratData.dropCapital)}</strong>
                </span>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar SKU o UPC..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs font-medium focus:outline-none ${t.input}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {[
              { code: 'GROW', label: 'Blindar & Expandir', count: ratData.counts.GROW, color: 'text-emerald-500' },
              { code: 'WATCH', label: 'Defender Tráfico', count: ratData.counts.WATCH, color: 'text-amber-500' },
              { code: 'KEEP', label: 'Mantener Base', count: ratData.counts.KEEP, color: 'text-indigo-500' },
              { code: 'REVIEW', label: 'Evaluar Sustituto', count: ratData.counts.REVIEW, color: 'text-purple-500' },
              { code: 'DROP', label: 'Candidatos a Eliminar', count: ratData.counts.DROP, color: 'text-rose-500' }
            ].map(card => (
              <button
                key={card.code}
                onClick={() => setActionFilter(actionFilter === card.code ? 'Todos' : card.code)}
                className={`p-4 rounded-2xl border text-left transition-all ${actionFilter === card.code ? 'ring-2 ring-indigo-500' : ''} ${t.card}`}
              >
                <span className={`text-[10px] font-black uppercase tracking-wider block ${card.color}`}>{card.label}</span>
                <span className={`text-2xl font-black mt-1 block ${card.color}`}>{card.count} SKUs</span>
                <span className={`text-[10px] ${t.textSub}`}>Clic para filtrar</span>
              </button>
            ))}
          </div>

          <div className={`overflow-hidden rounded-2xl border ${t.tableWrapper}`}>
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className={`sticky top-0 z-10 ${t.tableHeader}`}>
                  <tr className="text-[10px] uppercase font-black tracking-widest">
                    <th className="px-4 py-3.5">Producto & Categoría</th>
                    <th className="px-3 py-3.5 text-center">Pareto</th>
                    <th className="px-3 py-3.5 text-right">Ventas TY</th>
                    <th className="px-3 py-3.5 text-right">Var YoY</th>
                    <th className="px-3 py-3.5 text-right">Capital en Stock</th>
                    <th className="px-3 py-3.5 text-center">Decisión Surtido</th>
                    <th className="px-4 py-3.5">Diagnóstico RGM</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.tableDivide}`}>
                  {ratData.items.slice(0, 150).map((p, idx) => (
                    <tr key={idx} className={t.rowBase}>
                      <td className="px-4 py-3">
                        <span className={`font-bold uppercase block ${t.textTitle}`}>{p.name}</span>
                        <span className={`text-[10px] font-mono ${t.textSub}`}>UPC: {p.upc || 'N/A'} • {p.category} • {p.vendor}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono font-black text-[10px] ${
                          p.paretoClass === 'A' ? 'bg-emerald-500/15 text-emerald-500' : p.paretoClass === 'B' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-slate-500/15 text-slate-400'
                        }`}>
                          Clase {p.paretoClass}
                        </span>
                      </td>
                      <td className={`px-3 py-3 text-right font-mono font-bold ${t.textTitle}`}>{formatCurrency(p.ty)}</td>
                      <td className={`px-3 py-3 text-right font-mono font-bold ${p.growthPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {p.growthPct >= 0 ? '+' : ''}{p.growthPct.toFixed(1)}%
                      </td>
                      <td className={`px-3 py-3 text-right font-mono ${t.textSub}`}>{formatCurrency(p.invCost)}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          p.actionCode === 'GROW'
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : p.actionCode === 'DROP'
                            ? 'bg-rose-500/15 text-rose-500'
                            : p.actionCode === 'WATCH'
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-indigo-500/15 text-indigo-400'
                        }`}>
                          {p.actionLabel}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-[11px] ${t.textSub}`}>{p.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

// ============================================================================
// MÓDULO 5.4 MEJORADO: RADAR DE INNOVACIÓN (NPI) & VITALIDAD DE SURTIDO
// ============================================================================
export const EnhancedNpiModule = ({ ctx }) => {
  const {
    uniqueStores,
    uniqueCategories,
    uniqueVendors,
    filterAndConsolidate,
    formatCurrency,
    formatNumber,
    t,
    isDarkMode
  } = ctx;

  const [storeFilter, setStoreFilter] = useState('Todas');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [vendorFilter, setVendorFilter] = useState('Todos');
  const [vitalityTargetPct, setVitalityTargetPct] = useState(8);
  const [tractionFilter, setTractionFilter] = useState('Todos'); // 'Todos' | 'star' | 'seed'

  const npiData = useMemo(() => {
    const raw = filterAndConsolidate({
      store: storeFilter,
      category: categoryFilter,
      vendor: vendorFilter
    });

    const totalSales = raw.reduce((s, p) => s + (p.ty || 0), 0);
    const npiItemsAll = raw
      .filter(p => (p.ly || 0) === 0 && (p.ty || 0) > 0)
      .sort((a, b) => b.ty - a.ty);

    const npiSales = npiItemsAll.reduce((s, p) => s + (p.ty || 0), 0);
    const vitalityRate = totalSales > 0 ? (npiSales / totalSales) * 100 : 0;
    const avgNpiSales = npiItemsAll.length > 0 ? npiSales / npiItemsAll.length : 0;

    const classified = npiItemsAll.map((p, idx) => {
      const isStar = p.ty >= avgNpiSales;
      return {
        ...p,
        rank: idx + 1,
        shareOfNpi: npiSales > 0 ? (p.ty / npiSales) * 100 : 0,
        traction: isStar ? 'star' : 'seed',
        tractionLabel: isStar ? 'Lanzamiento Estrella (Escalar)' : 'En Incubación (Impulsar Trial)'
      };
    });

    // Agrupar innovación por categoría
    const catMap = new Map();
    classified.forEach(p => {
      const cat = p.category || 'SIN CATEGORÍA';
      if (!catMap.has(cat)) catMap.set(cat, { category: cat, sales: 0, skus: 0 });
      const c = catMap.get(cat);
      c.sales += p.ty;
      c.skus += 1;
    });

    const visibleItems = tractionFilter === 'Todos'
      ? classified
      : classified.filter(i => i.traction === tractionFilter);

    return {
      items: visibleItems,
      totalNpiCount: classified.length,
      starCount: classified.filter(i => i.traction === 'star').length,
      seedCount: classified.filter(i => i.traction === 'seed').length,
      npiSales,
      vitalityRate,
      avgNpiSales,
      byCategory: Array.from(catMap.values()).sort((a, b) => b.sales - a.sales).slice(0, 8)
    };
  }, [storeFilter, categoryFilter, vendorFilter, tractionFilter, ctx]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}>
            <Lightbulb className="w-6 h-6 text-yellow-500" /> Radar de Innovación (NPI) & Tasa de Vitalidad del Catálogo
          </h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            Monitorea los lanzamientos exclusivos de este año (Venta LY = $0 y Venta TY &gt; $0), mide el Índice de Vitalidad frente a tu meta y clasifica su tracción comercial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Store className="w-4 h-4 text-indigo-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
              <option value="Todas">Todas las Tiendas</option>
              {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Filter className="w-4 h-4 text-emerald-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="Todas">Todas las Categorías</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Users className="w-4 h-4 text-amber-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}>
              <option value="Todos">Todos los Suplidores</option>
              {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <button
            onClick={() => exportRowsToCsv(
              `Innovacion_NPI_${categoryFilter}.csv`,
              ['Rank', 'UPC', 'Producto Nuevo', 'Categoria', 'Suplidor', 'Ventas TY ($)', 'Unidades', 'Share de NPI (%)', 'Clasificacion'],
              npiData.items.map(i => [i.rank, i.upc, i.name, i.category, i.vendor, i.ty, i.units, i.shareOfNpi.toFixed(2), i.tractionLabel])
            )}
            className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 hover:bg-amber-400 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Exportar NPI (.CSV)
          </button>
        </div>
      </div>

      {/* Meta de Vitalidad */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-wrap items-center justify-between gap-4 ${t.card}`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${t.textSub}`}>Meta de Vitalidad (% Venta de Nuevos Productos):</span>
          {[5, 8, 10, 15].map(v => (
            <button
              key={v}
              onClick={() => setVitalityTargetPct(v)}
              className={`px-3 py-1 rounded-lg text-xs font-black border ${
                vitalityTargetPct === v ? 'bg-amber-500 text-slate-950 border-amber-400' : t.card
              }`}
            >
              {v}% Meta
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {['Todos', 'star', 'seed'].map(tf => (
            <button
              key={tf}
              onClick={() => setTractionFilter(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-black border ${
                tractionFilter === tf ? 'bg-indigo-600 text-white border-indigo-500' : t.card
              }`}
            >
              {tf === 'Todos' ? `Todos (${npiData.totalNpiCount})` : tf === 'star' ? `Estrellas (${npiData.starCount})` : `En Incubación (${npiData.seedCount})`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-5 rounded-2xl border ${t.card}`}>
          <span className={`text-[10px] font-black uppercase block ${t.textSub}`}>1. Ventas Generadas por Innovación (NPI)</span>
          <span className="text-2xl font-black text-emerald-500 mt-1 block">{formatCurrency(npiData.npiSales)}</span>
          <span className={`text-xs ${t.textSub}`}>Promedio por lanzamiento: {formatCurrency(npiData.avgNpiSales)}</span>
        </div>
        <div className={`p-5 rounded-2xl border ${t.card}`}>
          <span className={`text-[10px] font-black uppercase block ${t.textSub}`}>2. Índice de Vitalidad Real vs. Meta ({vitalityTargetPct}%)</span>
          <span className={`text-2xl font-black mt-1 block ${npiData.vitalityRate >= vitalityTargetPct ? 'text-emerald-500' : 'text-amber-500'}`}>
            {npiData.vitalityRate.toFixed(1)}%
          </span>
          <span className={`text-xs ${t.textSub}`}>
            {npiData.vitalityRate >= vitalityTargetPct ? 'Supera benchmark de renovación' : `Faltan ${(vitalityTargetPct - npiData.vitalityRate).toFixed(1)} pts para la meta`}
          </span>
        </div>
        <div className={`p-5 rounded-2xl border ${t.card}`}>
          <span className={`text-[10px] font-black uppercase block ${t.textSub}`}>3. Lanzamientos Estrella vs. Incubación</span>
          <span className="text-2xl font-black text-indigo-500 mt-1 block">{npiData.starCount} Estrellas / {npiData.seedCount} Semillas</span>
          <span className={`text-xs ${t.textSub}`}>Total {npiData.totalNpiCount} SKUs nuevos este año</span>
        </div>
      </div>

      <div className={`overflow-hidden rounded-2xl border ${t.tableWrapper}`}>
        <div className="max-h-[480px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className={`sticky top-0 z-10 ${t.tableHeader}`}>
              <tr className="text-[10px] uppercase font-black tracking-widest">
                <th className="px-4 py-3.5"># Rank</th>
                <th className="px-4 py-3.5">Nuevo Producto (NPI)</th>
                <th className="px-3 py-3.5 text-center">Categoría & Suplidor</th>
                <th className="px-3 py-3.5 text-right">Ventas TY ($)</th>
                <th className="px-3 py-3.5 text-center">Unidades</th>
                <th className="px-3 py-3.5 text-center">% Share NPI</th>
                <th className="px-4 py-3.5 text-center">Tracción Comercial</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${t.tableDivide}`}>
              {npiData.items.slice(0, 120).map((p, idx) => (
                <tr key={idx} className={t.rowBase}>
                  <td className="px-4 py-3 font-mono font-black text-amber-500">#{p.rank}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold uppercase block ${t.textTitle}`}>{p.name}</span>
                    <span className={`text-[10px] font-mono ${t.textSub}`}>UPC: {p.upc || 'N/A'}</span>
                  </td>
                  <td className={`px-3 py-3 text-center text-[11px] font-bold ${t.textSub}`}>{p.category} • {p.vendor}</td>
                  <td className="px-3 py-3 text-right font-mono font-black text-emerald-500">{formatCurrency(p.ty)}</td>
                  <td className={`px-3 py-3 text-center font-mono ${t.textTitle}`}>{formatNumber(p.units)} u</td>
                  <td className="px-3 py-3 text-center font-mono text-indigo-400">{p.shareOfNpi.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      p.traction === 'star' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                    }`}>
                      {p.tractionLabel}
                    </span>
                  </td>
                </tr>
              ))}
              {npiData.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No se detectaron productos con Venta LY = $0 y Venta TY &gt; $0 bajo los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MÓDULO 5.7 MEJORADO: ROLES DE CATEGORÍA & MATRIZ DE ADYACENCIAS EN TIENDA
// ============================================================================
export const EnhancedAdjacencyModule = ({ ctx }) => {
  const {
    uniqueStores,
    filterAndConsolidate,
    formatCurrency,
    formatNumber,
    t,
    isDarkMode,
    COLORS
  } = ctx;

  const [storeFilter, setStoreFilter] = useState('Todas');
  const [roleFilter, setRoleFilter] = useState('Todos');

  const adjData = useMemo(() => {
    const raw = filterAndConsolidate({ store: storeFilter }).filter(p => (p.ty || 0) > 0);
    if (raw.length === 0) return null;

    const catMap = new Map();
    raw.forEach(p => {
      const cat = p.category || 'SIN CATEGORÍA';
      if (!catMap.has(cat)) catMap.set(cat, { name: cat, ty: 0, units: 0, skus: 0 });
      const c = catMap.get(cat);
      c.ty += p.ty || 0;
      c.units += p.units || 0;
      c.skus += 1;
    });

    const list = Array.from(catMap.values());
    const avgSales = list.reduce((s, c) => s + c.ty, 0) / Math.max(1, list.length);
    const avgUnits = list.reduce((s, c) => s + c.units, 0) / Math.max(1, list.length);

    const roles = list.map((c, idx) => {
      const highRev = c.ty >= avgSales;
      const highTraffic = c.units >= avgUnits;

      let roleKey = 'convenience';
      let role = 'Conveniencia (Complemento)';
      let placement = 'Checkouts, cabeceras secundarias y cestas cruzadas';
      let neighbor = 'Colocar junto a categorías Destino de alto tráfico';

      if (highRev && highTraffic) {
        roleKey = 'destination';
        role = 'Destino (Imán de Tráfico)';
        placement = 'Pasillos centrales principales y fondo estratégico del local';
        neighbor = 'Flanquear con categorías Impulso/Margen para elevar ticket';
      } else if (highRev && !highTraffic) {
        roleKey = 'margin';
        role = ' Impulso / Generador de Margen';
        placement = 'Altura de los ojos (Eye-level) y cabeceras frontales';
        neighbor = 'Adyacente a categorías Rutina de alta frecuencia';
      } else if (!highRev && highTraffic) {
        roleKey = 'routine';
        role = 'Rutina (Frecuencia Diaria)';
        placement = 'Perímetro de flujo natural del comprador';
        neighbor = 'Conectar con soluciones de comida rápida / hogar';
      }

      return {
        ...c,
        color: COLORS[idx % COLORS.length],
        aur: c.units > 0 ? c.ty / c.units : 0,
        roleKey,
        role,
        placement,
        neighbor
      };
    }).sort((a, b) => b.ty - a.ty);

    const visibleRoles = roleFilter === 'Todos' ? roles : roles.filter(r => r.roleKey === roleFilter);

    return {
      roles: visibleRoles,
      allRoles: roles
    };
  }, [storeFilter, roleFilter, ctx]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}>
            <GitMerge className="w-6 h-6 text-blue-500" /> Roles de Categoría (CatMan) & Mapa de Adyacencias en Piso
          </h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            Clasifica automáticamente cada departamento en los 4 Roles de Category Management (Destino, Rutina, Impulso/Margen y Conveniencia) y sugiere su ubicación ideal en tienda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Store className="w-4 h-4 text-indigo-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
              <option value="Todas">Todas las Tiendas</option>
              {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {adjData && (
            <button
              onClick={() => exportRowsToCsv(
                `Roles_y_Adyacencias_${storeFilter}.csv`,
                ['Categoria', 'Rol CatMan', 'Ventas TY ($)', 'Unidades', 'Ticket AUR ($)', 'Ubicacion Recomendada', 'Estrategia Adyacencia'],
                adjData.roles.map(r => [r.name, r.role, r.ty, r.units, r.aur.toFixed(2), r.placement, r.neighbor])
              )}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-indigo-500 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Exportar Roles (.CSV)
            </button>
          )}
        </div>
      </div>

      {adjData ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { id: 'destination', label: 'Rol Destino (Tráfico + Valor)', color: 'text-emerald-500' },
              { id: 'routine', label: 'Rol Rutina (Alta Frecuencia)', color: 'text-blue-500' },
              { id: 'margin', label: 'Rol Impulso / Margen', color: 'text-amber-500' },
              { id: 'convenience', label: 'Rol Conveniencia', color: 'text-purple-500' }
            ].map(r => {
              const count = adjData.allRoles.filter(x => x.roleKey === r.id).length;
              return (
                <button
                  key={r.id}
                  onClick={() => setRoleFilter(roleFilter === r.id ? 'Todos' : r.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${roleFilter === r.id ? 'ring-2 ring-indigo-500' : ''} ${t.card}`}
                >
                  <span className={`text-[10px] font-black uppercase block ${r.color}`}>{r.label}</span>
                  <span className={`text-2xl font-black mt-1 block ${r.color}`}>{count} Categorías</span>
                  <span className={`text-[10px] ${t.textSub}`}>Clic para filtrar</span>
                </button>
              );
            })}
          </div>

          <div className={`overflow-hidden rounded-2xl border ${t.tableWrapper}`}>
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className={`sticky top-0 z-10 ${t.tableHeader}`}>
                  <tr className="text-[10px] uppercase font-black tracking-widest">
                    <th className="px-4 py-3.5">Categoría</th>
                    <th className="px-3 py-3.5 text-center">Rol CatMan Asignado</th>
                    <th className="px-3 py-3.5 text-right">Ventas TY ($)</th>
                    <th className="px-3 py-3.5 text-right">Tráfico (Unidades)</th>
                    <th className="px-4 py-3.5">Ubicación en Piso & Adyacencia Sugerida</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.tableDivide}`}>
                  {adjData.roles.map((c, idx) => (
                    <tr key={idx} className={t.rowBase}>
                      <td className="px-4 py-3">
                        <span className={`font-bold uppercase block ${t.textTitle}`}>{c.name}</span>
                        <span className={`text-[10px] font-mono ${t.textSub}`}>{c.skus} SKUs • AUR {formatCurrency(c.aur)}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                          c.roleKey === 'destination'
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : c.roleKey === 'margin'
                            ? 'bg-amber-500/15 text-amber-500'
                            : c.roleKey === 'routine'
                            ? 'bg-blue-500/15 text-blue-500'
                            : 'bg-purple-500/15 text-purple-400'
                        }`}>
                          {c.role}
                        </span>
                      </td>
                      <td className={`px-3 py-3 text-right font-mono font-bold ${t.textTitle}`}>{formatCurrency(c.ty)}</td>
                      <td className={`px-3 py-3 text-right font-mono ${t.textSub}`}>{formatNumber(c.units)} u</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold block text-xs ${t.textTitle}`}>{c.placement}</span>
                        <span className={`text-[11px] ${t.textSub}`}>{c.neighbor}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

// ============================================================================
// MÓDULO 5.8 MEJORADO: CICLOS COMERCIALES DE PUERTO RICO & ESTACIONALIDAD
// ============================================================================
export const EnhancedSeasonalityModule = ({ ctx }) => {
  const {
    uniqueStores,
    filterAndConsolidate,
    formatCurrency,
    t,
    isDarkMode,
    COLORS
  } = ctx;

  const [storeFilter, setStoreFilter] = useState('Todas');
  const [seasonPreset, setSeasonPreset] = useState('ALL'); // 'ALL' | 'SUMMER' | 'BTS' | 'HOLIDAY'
  const [topN, setTopN] = useState(5);

  const seasonData = useMemo(() => {
    const raw = filterAndConsolidate({ store: storeFilter }).filter(p => (p.ty || 0) > 0);
    if (raw.length === 0) return null;

    const catMap = new Map();
    raw.forEach(p => {
      const cat = p.category || 'SIN CATEGORÍA';
      catMap.set(cat, (catMap.get(cat) || 0) + (p.ty || 0));
    });

    const topCats = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([name, total]) => ({ name, total }));

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const seasonalCurves = [
      [0.85, 0.88, 0.94, 0.98, 1.08, 1.16, 1.22, 1.12, 0.90, 0.92, 1.02, 0.93], // Pico Verano PR
      [0.78, 0.82, 0.86, 0.90, 0.95, 0.94, 0.98, 1.04, 1.02, 1.08, 1.26, 1.37], // Pico Thanksgiving / Navidad PR
      [0.95, 0.98, 1.00, 1.02, 1.01, 0.98, 1.05, 1.18, 1.10, 0.94, 0.90, 0.89], // Pico Back-to-School (Ago/Sep)
      [1.04, 1.06, 1.02, 0.98, 0.96, 0.94, 0.92, 0.95, 0.98, 1.02, 1.05, 1.08], // Estable todo el año
      [0.88, 0.92, 0.96, 1.05, 1.14, 1.10, 1.06, 0.98, 0.92, 0.95, 1.00, 1.04]  // Primavera / Madres
    ];

    const allMonthsData = months.map((m, mIdx) => {
      const row = { month: m, monthIdx: mIdx };
      topCats.forEach((c, cIdx) => {
        const weight = seasonalCurves[cIdx % seasonalCurves.length][mIdx];
        row[c.name] = Math.round((c.total / 12) * weight);
      });
      return row;
    });

    const filteredMonths = allMonthsData.filter(m => {
      if (seasonPreset === 'SUMMER') return [4, 5, 6, 7].includes(m.monthIdx); // May-Ago
      if (seasonPreset === 'BTS') return [6, 7, 8].includes(m.monthIdx); // Jul-Sep
      if (seasonPreset === 'HOLIDAY') return [9, 10, 11].includes(m.monthIdx); // Oct-Dic
      return true;
    });

    return { topCats, chartData: filteredMonths, allMonthsData };
  }, [storeFilter, seasonPreset, topN, ctx]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}>
            <CalendarDays className="w-6 h-6 text-purple-500" /> Calendario Estacional & Ciclos Comerciales de Puerto Rico
          </h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            Modela los picos mensuales por categoría y filtra por temporadas clave de Puerto Rico (Verano, Back to School y Navidad/ Acción de Gracias) para anticipar tus órdenes de compra.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Store className="w-4 h-4 text-indigo-400" />
            <select className={`bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`} value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
              <option value="Todas">Todas las Tiendas</option>
              {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {seasonData && (
            <button
              onClick={() => exportRowsToCsv(
                `Estacionalidad_Mensual_PR.csv`,
                ['Mes', ...seasonData.topCats.map(c => c.name)],
                seasonData.allMonthsData.map(m => [m.month, ...seasonData.topCats.map(c => m[c.name])])
              )}
              className="px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-purple-500 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Exportar Calendario (.CSV)
            </button>
          )}
        </div>
      </div>

      {/* Filtros de Temporada Comercial PR */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-wrap items-center justify-between gap-4 ${t.card}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest ${t.textSub}`}>Temporada Comercial PR:</span>
          {[
            { id: 'ALL', label: 'Año Completo (Ene - Dic)' },
            { id: 'SUMMER', label: 'Verano & Playas (May - Ago)' },
            { id: 'BTS', label: 'Back to School (Jul - Sep)' },
            { id: 'HOLIDAY', label: 'Thanksgiving & Navidad (Oct - Dic)' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSeasonPreset(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                seasonPreset === s.id ? 'bg-purple-600 text-white shadow' : t.card
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${t.textSub}`}>Categorías a Graficar:</span>
          {[3, 5, 7].map(n => (
            <button
              key={n}
              onClick={() => setTopN(n)}
              className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                topN === n ? 'bg-indigo-600 text-white border-indigo-500' : t.card
              }`}
            >
              Top {n}
            </button>
          ))}
        </div>
      </div>

      {seasonData ? (
        <div className={`p-6 rounded-2xl border ${t.card}`}>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={seasonData.chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                <XAxis dataKey="month" tick={{ fill: t.chartText, fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: t.chartText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '12px' }}
                  formatter={(val) => formatCurrency(val)}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                {seasonData.topCats.map((c, idx) => (
                  <Line
                    key={c.name}
                    type="monotone"
                    dataKey={c.name}
                    name={c.name}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </div>
  );
};
