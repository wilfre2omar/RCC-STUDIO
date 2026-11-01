import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ComposedChart, Line
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Store, Users, DollarSign, 
  BarChart3, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight,
  Sparkles, Lightbulb, Loader2, Search, Filter,
  Package, Tag, Info, Upload, FileSpreadsheet, CheckSquare, Calculator, Layers,
  MapPin, Sun, Moon, Trash2, ChevronLeft, ChevronRight,
  Database, X, Eye, EyeOff, Target, Award, AlertCircle, LayoutTemplate,
  Trophy, ArrowDownAZ, ArrowUpAZ, AlertTriangle, ShieldCheck,
  Download, BookOpen, Wand2, DownloadCloud, Map as MapIcon, Navigation,
  Network, Scissors, Tags, GitMerge, CalendarDays, Minus, ListChecks,
  HeartPulse, BadgePercent, LineChart, Percent, Activity, Plus,
  FileText, Printer
} from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#f43f5e'];

const PR_REGIONS = {
  Metro: [
    'Bayamón', 'Carolina', 'Cataño', 'Guaynabo', 'San Juan', 'Toa Alta', 'Toa Baja', 'Trujillo Alto'
  ],
  Norte: [
    'Arecibo', 'Barceloneta', 'Camuy', 'Ciales', 'Dorado', 'Florida',
    'Hatillo', 'Manatí', 'Morovis', 'Quebradillas', 'Vega Alta', 'Vega Baja'
  ],
  Centro: [
    'Adjuntas', 'Aguas Buenas', 'Aibonito', 'Barranquitas', 'Caguas', 'Cayey',
    'Cidra', 'Comerío', 'Corozal', 'Jayuya', 'Lares', 'Naranjito', 'Orocovis', 'Utuado'
  ],
  Este: [
    'Canóvanas', 'Ceiba', 'Culebra', 'Fajardo', 'Gurabo', 'Humacao', 'Juncos', 'Las Piedras',
    'Loíza', 'Luquillo', 'Maunabo', 'Naguabo', 'Río Grande', 'San Lorenzo', 'Vieques', 'Yabucoa'
  ],
  Sur: [
    'Arroyo', 'Coamo', 'Guánica', 'Guayama', 'Guayanilla', 'Juana Díaz',
    'Patillas', 'Peñuelas', 'Ponce', 'Salinas', 'Santa Isabel', 'Villalba', 'Yauco'
  ],
  Oeste: [
    'Aguada', 'Aguadilla', 'Añasco', 'Cabo Rojo', 'Hormigueros', 'Isabela', 'Lajas',
    'Las Marías', 'Maricao', 'Mayagüez', 'Moca', 'Rincón', 'Sabana Grande', 'San Germán', 'San Sebastián'
  ]
};

/**
 * MATRIZ CARTOGRÁFICA DE PUERTO RICO (78 MUNICIPIOS SIN COORDENADAS GPS)
 * Organiza la isla en 5 franjas geográficas reales (0 = Costa Norte, 1 = Llanos Norte,
 * 2 = Cordillera Central, 3 = Valles Sur/Este, 4 = Costa Sur) de Oeste (Col 0) a Este (Col 16: Vieques/Culebra).
 */
const PR_ISLAND_GRID = [
  // Franja 0: Costa Norte (Océano Atlántico)
  [null, 'Aguadilla', 'Isabela', 'Quebradillas', 'Camuy', 'Hatillo', 'Arecibo', 'Barceloneta', 'Manatí', 'Vega Baja', 'Dorado', 'Toa Baja', 'Cataño', 'San Juan', 'Carolina', 'Loíza', null],
  // Franja 1: Punta Oeste (Rincón) + Llanos Costeros del Norte + Isla Municipio Culebra
  ['Rincón', 'Aguada', 'Moca', 'San Sebastián', 'Lares', 'Utuado', 'Florida', 'Ciales', 'Morovis', 'Vega Alta', 'Toa Alta', 'Bayamón', 'Guaynabo', 'Trujillo Alto', 'Canóvanas', 'Río Grande', 'Culebra'],
  // Franja 2: Cordillera Central (Incluye Naranjito en el corazón de la isla) + Costa Noreste
  [null, 'Añasco', 'Las Marías', 'Maricao', 'Adjuntas', 'Jayuya', 'Orocovis', 'Corozal', 'Naranjito', 'Comerío', 'Barranquitas', 'Aguas Buenas', 'Caguas', 'Gurabo', 'Luquillo', 'Fajardo', null],
  // Franja 3: Valles del Suroeste, Cordillera Sur, Valle de Caguas/Oriental + Isla Municipio Vieques
  [null, 'Mayagüez', 'Hormigueros', 'San Germán', 'Sabana Grande', 'Yauco', 'Peñuelas', 'Villalba', 'Aibonito', 'Cidra', 'Cayey', 'San Lorenzo', 'Juncos', 'Las Piedras', 'Naguabo', 'Ceiba', 'Vieques'],
  // Franja 4: Costa Sur (Mar Caribe) y Sureste
  [null, 'Cabo Rojo', 'Lajas', 'Guánica', 'Guayanilla', 'Ponce', 'Juana Díaz', 'Coamo', 'Santa Isabel', 'Salinas', 'Guayama', 'Arroyo', 'Patillas', 'Maunabo', 'Yabucoa', 'Humacao', null]
];

const REGION_VISUAL_THEME = {
  Metro: {
    badge: 'bg-indigo-600 text-white',
    soft: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30',
    tileActive: 'bg-indigo-600 text-white border-indigo-400 shadow-md',
    tileEmptyDark: 'bg-indigo-950/45 text-indigo-300/80 border-indigo-800/60 hover:bg-indigo-900/60',
    tileEmptyLight: 'bg-indigo-50/90 text-indigo-900 border-indigo-200 hover:bg-indigo-100',
    dot: 'bg-indigo-500'
  },
  Norte: {
    badge: 'bg-sky-600 text-white',
    soft: 'bg-sky-500/15 text-sky-500 border-sky-500/30',
    tileActive: 'bg-sky-600 text-white border-sky-400 shadow-md',
    tileEmptyDark: 'bg-sky-950/45 text-sky-300/80 border-sky-800/60 hover:bg-sky-900/60',
    tileEmptyLight: 'bg-sky-50/90 text-sky-900 border-sky-200 hover:bg-sky-100',
    dot: 'bg-sky-500'
  },
  Centro: {
    badge: 'bg-amber-600 text-white',
    soft: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    tileActive: 'bg-amber-500 text-slate-950 border-amber-300 shadow-md',
    tileEmptyDark: 'bg-amber-950/45 text-amber-300/80 border-amber-800/60 hover:bg-amber-900/60',
    tileEmptyLight: 'bg-amber-50/90 text-amber-900 border-amber-200 hover:bg-amber-100',
    dot: 'bg-amber-500'
  },
  Este: {
    badge: 'bg-emerald-600 text-white',
    soft: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    tileActive: 'bg-emerald-600 text-white border-emerald-400 shadow-md',
    tileEmptyDark: 'bg-emerald-950/45 text-emerald-300/80 border-emerald-800/60 hover:bg-emerald-900/60',
    tileEmptyLight: 'bg-emerald-50/90 text-emerald-900 border-emerald-200 hover:bg-emerald-100',
    dot: 'bg-emerald-500'
  },
  Sur: {
    badge: 'bg-rose-600 text-white',
    soft: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    tileActive: 'bg-rose-600 text-white border-rose-400 shadow-md',
    tileEmptyDark: 'bg-rose-950/45 text-rose-300/80 border-rose-800/60 hover:bg-rose-900/60',
    tileEmptyLight: 'bg-rose-50/90 text-rose-900 border-rose-200 hover:bg-rose-100',
    dot: 'bg-rose-500'
  },
  Oeste: {
    badge: 'bg-purple-600 text-white',
    soft: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
    tileActive: 'bg-purple-600 text-white border-purple-400 shadow-md',
    tileEmptyDark: 'bg-purple-950/45 text-purple-300/80 border-purple-800/60 hover:bg-purple-900/60',
    tileEmptyLight: 'bg-purple-50/90 text-purple-900 border-purple-200 hover:bg-purple-100',
    dot: 'bg-purple-500'
  }
};

// ============================================================================
// 1. UTILIDADES PURAS Y MOTORES DE DATOS (FUERA DE APP PARA MAYOR LIMPIEZA)
// ============================================================================

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
const formatNumber = (val) => new Intl.NumberFormat('en-US').format(Math.round(val || 0));

/**
 * Filtra y consolida productos automáticamente cuando se elige "Todas" las tiendas.
 * Evita repetir bloques new Map() en cada herramienta nueva.
 */
const filterAndConsolidateProducts = (products, { store = "Todas", category = "Todas", segment = "Todos", vendor = "Todos", minSales = null } = {}) => {
  let filtered = (products || []).filter(p =>
    (store === "Todas" || p.store === store) &&
    (category === "Todas" || p.category === category) &&
    (segment === "Todos" || p.segment === segment) &&
    (vendor === "Todos" || p.vendor === vendor) &&
    (minSales === null || (p.ty || 0) > minSales)
  );

  if (store === "Todas") {
    const pMap = new Map();
    filtered.forEach(p => {
      const key = p.upc || p.name;
      if (!pMap.has(key)) {
        pMap.set(key, { ...p, key, ty: 0, ly: 0, units: 0, lyUnits: 0, inv: 0, storeCount: 0, store: 'Consolidado' });
      }
      const item = pMap.get(key);
      item.ty += p.ty || 0;
      item.ly += p.ly || 0;
      item.units += p.units || 0;
      item.lyUnits += p.lyUnits || 0;
      item.inv += p.inv || 0;
      item.storeCount += 1;
    });
    return Array.from(pMap.values());
  }

  return filtered.map(p => ({ ...p, key: p.id || (p.upc || p.name), storeCount: 1 }));
};

/**
 * Generador centralizado de tokens de diseño (Modo Claro / Oscuro)
 */
const buildThemeTokens = (isDarkMode) => ({
  app: isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900',
  header: isDarkMode ? 'bg-slate-900 border-b border-slate-800 text-white' : 'bg-indigo-950 text-white shadow-md',
  headerBtnText: isDarkMode ? 'text-slate-400 font-light' : 'text-indigo-400 font-light',
  tabActive: isDarkMode ? 'bg-slate-950 text-indigo-400 border-b-2 border-indigo-500' : 'bg-slate-50 text-indigo-950 border-b-2 border-indigo-500',
  tabInactive: isDarkMode ? 'bg-slate-900 text-slate-400 hover:bg-slate-800' : 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800/50',
  card: isDarkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-100 shadow-sm',
  cardHover: isDarkMode ? 'hover:border-indigo-500 bg-slate-900' : 'hover:border-indigo-200 bg-white',
  cardSelected: isDarkMode ? 'bg-indigo-950/50 border-indigo-500' : 'bg-indigo-50 border-indigo-500',
  textTitle: isDarkMode ? 'text-white' : 'text-slate-800',
  textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
  input: isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500',
  masterBox: isDarkMode ? 'bg-slate-900 border border-slate-800 shadow-xl' : 'bg-indigo-950 shadow-2xl',
  masterBoxText: isDarkMode ? 'text-slate-200' : 'text-white',
  masterInput: isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500' : 'bg-indigo-900/50 border-indigo-800 text-white placeholder:text-indigo-400',
  tableWrapper: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm',
  tableHeader: isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-100 text-slate-400',
  tableDivide: isDarkMode ? 'divide-slate-800/50' : 'divide-slate-50',
  rowBase: isDarkMode ? 'hover:bg-slate-800/50 border-l-4 border-transparent' : 'hover:bg-slate-50 border-l-4 border-transparent',
  rowSelected: isDarkMode ? 'bg-indigo-900/20 border-l-4 border-indigo-500' : 'bg-indigo-50/50 border-l-4 border-indigo-500',
  rowTextMain: isDarkMode ? 'text-slate-200 group-hover:text-indigo-300' : 'text-slate-700 group-hover:text-indigo-600',
  rowTextSelected: isDarkMode ? 'text-indigo-300' : 'text-indigo-800',
  chartGrid: isDarkMode ? '#334155' : '#f1f5f9',
  chartText: isDarkMode ? '#94a3b8' : '#64748b',
  chartTooltipBg: isDarkMode ? '#1e293b' : '#ffffff',
  chartTooltipBorder: isDarkMode ? '#334155' : '#f1f5f9',
  chartTooltipText: isDarkMode ? '#f8fafc' : '#0f172a'
});

/**
 * Mapa estático de estilos semánticos para evitar clases dinámicas (`bg-${color}`)
 * que el compilador JIT de Tailwind puede omitir.
 */
const TONE_PALETTE = {
  emerald: {
    cardDark: 'bg-emerald-950/20 border-emerald-900/50',
    cardLight: 'bg-emerald-50 border-emerald-200',
    labelDark: 'text-emerald-400',
    labelLight: 'text-emerald-700',
    valDark: 'text-emerald-300',
    valLight: 'text-emerald-800',
    badgeDark: 'bg-emerald-900/40 text-emerald-400',
    badgeLight: 'bg-emerald-100 text-emerald-700'
  },
  blue: {
    cardDark: 'bg-blue-950/20 border-blue-900/50',
    cardLight: 'bg-blue-50 border-blue-200',
    labelDark: 'text-blue-400',
    labelLight: 'text-blue-700',
    valDark: 'text-blue-300',
    valLight: 'text-blue-800',
    badgeDark: 'bg-blue-900/40 text-blue-400',
    badgeLight: 'bg-blue-100 text-blue-700'
  },
  indigo: {
    cardDark: 'bg-indigo-950/20 border-indigo-900/50',
    cardLight: 'bg-indigo-50 border-indigo-200',
    labelDark: 'text-indigo-400',
    labelLight: 'text-indigo-700',
    valDark: 'text-indigo-300',
    valLight: 'text-indigo-800',
    badgeDark: 'bg-indigo-900/40 text-indigo-400',
    badgeLight: 'bg-indigo-100 text-indigo-700'
  },
  amber: {
    cardDark: 'bg-amber-950/20 border-amber-900/50',
    cardLight: 'bg-amber-50 border-amber-200',
    labelDark: 'text-amber-400',
    labelLight: 'text-amber-700',
    valDark: 'text-amber-300',
    valLight: 'text-amber-800',
    badgeDark: 'bg-amber-900/40 text-amber-400',
    badgeLight: 'bg-amber-100 text-amber-700'
  },
  orange: {
    cardDark: 'bg-orange-950/20 border-orange-900/50',
    cardLight: 'bg-orange-50 border-orange-200',
    labelDark: 'text-orange-400',
    labelLight: 'text-orange-700',
    valDark: 'text-orange-300',
    valLight: 'text-orange-800',
    badgeDark: 'bg-orange-900/40 text-orange-400',
    badgeLight: 'bg-orange-100 text-orange-700'
  },
  rose: {
    cardDark: 'bg-rose-950/20 border-rose-900/50',
    cardLight: 'bg-rose-50 border-rose-200',
    labelDark: 'text-rose-400',
    labelLight: 'text-rose-700',
    valDark: 'text-rose-300',
    valLight: 'text-rose-800',
    badgeDark: 'bg-rose-900/40 text-rose-400',
    badgeLight: 'bg-rose-100 text-rose-700'
  },
  slate: {
    cardDark: 'bg-slate-900 border-slate-800',
    cardLight: 'bg-slate-50 border-slate-200',
    labelDark: 'text-slate-400',
    labelLight: 'text-slate-600',
    valDark: 'text-slate-300',
    valLight: 'text-slate-800',
    badgeDark: 'bg-slate-800 text-slate-300',
    badgeLight: 'bg-slate-100 text-slate-700'
  }
};

const getToneClasses = (color = 'slate', isDarkMode = false) => {
  const palette = TONE_PALETTE[color] || TONE_PALETTE.slate;
  return {
    card: isDarkMode ? palette.cardDark : palette.cardLight,
    label: isDarkMode ? palette.labelDark : palette.labelLight,
    val: isDarkMode ? palette.valDark : palette.valLight,
    badge: isDarkMode ? palette.badgeDark : palette.badgeLight
  };
};

const parseCSV = (str) => {
  const arr = [];
  let quote = false;
  let col = 0, row = 0;
  for (let c = 0; c < str.length; c++) {
    let cc = str[c], nc = str[c + 1];
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || '';
    if (cc === '"' && quote && nc === '"') { arr[row][col] += cc; ++c; continue; }
    if (cc === '"') { quote = !quote; continue; }
    if (cc === ',' && !quote) { ++col; continue; }
    if (cc === '\r' && nc === '\n' && !quote) { ++row; col = 0; ++c; continue; }
    if (cc === '\n' && !quote) { ++row; col = 0; continue; }
    if (cc === '\r' && !quote) { ++row; col = 0; continue; }
    arr[row][col] += cc;
  }
  return arr;
};

const extractProductsFromSheet = (data, fileName = '') => {
  if (!data || data.length < 2) return [];
  let headerRowIndex = 0;
  let bestHeaders = [];
  let maxKeywords = 0;

  for (let r = 0; r < Math.min(20, data.length); r++) {
    const rowLabels = Array.from(data[r] || []).map(h => h ? String(h).trim().toLowerCase() : '');
    let score = 0;
    if (rowLabels.some(h => h.includes('desc') || h.includes('producto'))) score++;
    if (rowLabels.some(h => h.includes('upc') || h.includes('codigo') || h.includes('barcode'))) score++;
    if (rowLabels.some(h => h.includes('ty ') || h.includes('sales') || h.includes('venta') || h === 'ty')) score++;
    if (rowLabels.some(h => h.includes('ly ') || h.includes('lysales') || h === 'ly')) score++;
    if (score > maxKeywords) {
      maxKeywords = score;
      headerRowIndex = r;
      bestHeaders = rowLabels;
    }
  }

  const headers = bestHeaders;
  const findCol = (keywords, avoid = []) => headers.findIndex(h =>
    keywords.some(k => h.includes(k)) && !avoid.some(a => h.includes(a))
  );

  const iStore = findCol(['store', 'tienda', 'local', 'sucursal']);
  const iDesc = findCol(['desc', 'producto', 'articulo']);
  const iUPC = findCol(['upc', 'barcode', 'codigo', 'código', 'ean']);
  const iCat = findCol(['category', 'categoria', 'categoría', 'catg name'], ['minor', 'sub']);
  const iSeg = findCol(['segment', 'segmento']);
  const iSubCat = findCol(['minor', 'sub', 'clase', 'familia']);
  const iVen = findCol(['ven', 'suplid', 'distrib', 'provee', 'marca']);
  const iTY = findCol(['ty sales', 'actual', 'sales $', 'ventas ty', 'venta', 'importe', 'ty'], ['units', 'shr', 'avg', 'qty', 'mov']);
  const iLY = findCol(['ly sales', 'lysales', 'pasado', 'ventas ly', 'anterior', 'ly'], ['units', 'shr', 'avg', 'qty', 'mov']);
  const iUnits = findCol(['ty units', 'units', 'unidades', 'cantidad', 'qty'], ['ly', 'lysales', 'pasado', 'anterior']);
  const iLYUnits = findCol(['ly units', 'lyunits', 'unidades ly', 'unidades anterior', 'qty ly']);
  const iInv = findCol(['inv', 'stock', 'on hand', 'capacidad', 'capacity', 'inventario']);
  const iId = findCol(['item id', 'id', 'código interno'], ['bitmap', 'image', 'foto', 'override', 'width', 'liquid', 'store', 'vendor']);
  const iBrand = findCol(['brand', 'marca']);
  const iHeight = findCol(['height', 'alto', 'altura']);
  const iWidth = findCol(['width', 'ancho']);
  const iDepth = findCol(['depth', 'profundidad', 'largo']);
  const iBitmap = findCol(['bitmap', 'image id', 'override']);

  const parsed = [];
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row.length) continue;

    let productName = '';
    if (iDesc >= 0 && row[iDesc]) {
      productName = String(row[iDesc]).trim();
    } else if (row.length > 2) {
      const textCols = row.filter(c => typeof c === 'string' && c.length > 5 && isNaN(Number(c)));
      if (textCols.length > 0) productName = textCols[0].trim();
    }

    if (!productName || productName === '' || productName.toLowerCase().includes('total')) continue;

    let storeName = 'Varias';
    if (iStore >= 0 && row[iStore]) {
      storeName = String(row[iStore]).replace(/econo /i, '').trim();
    } else if (fileName) {
      const fn = fileName.toLowerCase();
      if (fn.includes('bayamon')) storeName = 'Sierra Bayamón';
      else if (fn.includes('humacao')) storeName = 'Humacao';
      else if (fn.includes('barranquitas')) storeName = 'Barranquitas';
      else if (fn.includes('naguabo')) storeName = 'Naguabo';
      else storeName = fileName.replace('.csv', '').replace('.xlsx', '');
    }

    const units = parseFloat(String(iUnits >= 0 ? row[iUnits] || '0' : '0').replace(/[^0-9.-]+/g, "")) || 0;
    const lyUnits = iLYUnits >= 0 ? (parseFloat(String(row[iLYUnits] || '0').replace(/[^0-9.-]+/g, "")) || 0) : 0;
    const simulatedInv = Math.floor((units / 365) * (Math.random() * 35 + 3)) + 1;
    const inv = iInv >= 0 ? parseFloat(String(iInv >= 0 ? row[iInv] || '0' : '0').replace(/[^0-9.-]+/g, "")) || 0 : simulatedInv;

    const jdaId = iId >= 0 && row[iId] ? String(row[iId]) : (iUPC >= 0 && row[iUPC] ? String(row[iUPC]) : '');
    const brand = iBrand >= 0 && row[iBrand] ? String(row[iBrand]) : '';
    const height = parseFloat(String(iHeight >= 0 ? row[iHeight] || '8.0' : '8.0').replace(/[^0-9.-]+/g, "")) || 8.0;
    const width = parseFloat(String(iWidth >= 0 ? row[iWidth] || '2.5' : '2.5').replace(/[^0-9.-]+/g, "")) || 2.5;
    const depth = parseFloat(String(iDepth >= 0 ? row[iDepth] || '2.5' : '2.5').replace(/[^0-9.-]+/g, "")) || 2.5;

    parsed.push({
      id: 'imp_' + i + '_' + Math.random().toString(36).substr(2, 9),
      jdaId,
      bitmapId: iBitmap >= 0 && row[iBitmap] ? String(row[iBitmap]) : '',
      name: productName,
      store: storeName,
      upc: iUPC >= 0 && row[iUPC] ? String(row[iUPC]) : '',
      category: iCat >= 0 && row[iCat] ? String(row[iCat]) : 'DESCONOCIDA',
      segment: iSeg >= 0 && row[iSeg] ? String(row[iSeg]) : '',
      subCategory: iSubCat >= 0 && row[iSubCat] ? String(row[iSubCat]) : 'NO APLICA',
      vendor: iVen >= 0 && row[iVen] ? String(row[iVen]) : 'N/A',
      brand,
      height,
      width,
      depth,
      ty: parseFloat(String(iTY >= 0 ? row[iTY] || '0' : '0').replace(/[^0-9.-]+/g, "")) || 0,
      ly: parseFloat(String(iLY >= 0 ? row[iLY] || '0' : '0').replace(/[^0-9.-]+/g, "")) || 0,
      units,
      lyUnits,
      inv
    });
  }
  return parsed;
};

const extractLibraryFromSheet = (data) => {
  if (!data || data.length < 2) return { items: [], rawHeaders: [] };
  let headerRowIndex = 0;
  let maxKeywords = 0;
  let bestHeaders = [];

  for (let r = 0; r < Math.min(10, data.length); r++) {
    const rowLabels = Array.from(data[r] || []).map(h => h ? String(h).trim().toLowerCase() : '');
    let score = 0;
    if (rowLabels.includes('upc') || rowLabels.includes('barcode')) score++;
    if (rowLabels.includes('id') || rowLabels.includes('item id')) score++;
    if (rowLabels.includes('height') || rowLabels.includes('alto')) score++;
    if (rowLabels.includes('width') || rowLabels.includes('ancho')) score++;
    if (rowLabels.includes('depth') || rowLabels.includes('profundidad')) score++;
    if (rowLabels.includes('bitmap') || rowLabels.includes('override')) score++;
    if (score > maxKeywords) {
      maxKeywords = score;
      headerRowIndex = r;
      bestHeaders = rowLabels;
    }
  }

  const rawHeaders = Array.from(data[headerRowIndex] || []).map(h => h ? String(h) : '');
  const headersLower = bestHeaders;
  const findCol = (keywords, avoid = []) => headersLower.findIndex(h =>
    keywords.some(k => h.includes(k)) && (!avoid || !avoid.some(a => h.includes(a)))
  );

  const iUPC = findCol(['upc', 'barcode']);
  const iID = findCol(['item id', 'id'], ['bitmap', 'override', 'image', 'foto', 'picture', 'width', 'store']);
  const iName = findCol(['name', 'desc']);
  const iHeight = findCol(['height', 'alto']);
  const iWidth = findCol(['width', 'ancho']);
  const iDepth = findCol(['depth', 'profundidad']);
  const iBitmap = findCol(['bitmap', 'override', 'image id']);
  const iBrand = findCol(['brand', 'marca']);
  const iCat = findCol(['category', 'categoría']);
  const iSubCat = findCol(['subcategory', 'subcategoría', 'sub category']);
  const iSup = findCol(['supplier', 'vendor', 'proveedor', 'manufacturer']);

  const lib = [];
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row.length) continue;
    const upcVal = iUPC >= 0 && row[iUPC] ? String(row[iUPC]).trim() : '';
    const idVal = iID >= 0 && row[iID] ? String(row[iID]).trim() : '';
    if (!upcVal && !idVal) continue;

    lib.push({
      upc: upcVal,
      id: idVal,
      bitmapId: iBitmap >= 0 && row[iBitmap] ? String(row[iBitmap]).trim() : '',
      name: iName >= 0 && row[iName] ? String(row[iName]).trim() : '',
      height: parseFloat(String(iHeight >= 0 ? row[iHeight] || '0' : '0').replace(/[^0-9.-]+/g, "")) || null,
      width: parseFloat(String(iWidth >= 0 ? row[iWidth] || '0' : '0').replace(/[^0-9.-]+/g, "")) || null,
      depth: parseFloat(String(iDepth >= 0 ? row[iDepth] || '0' : '0').replace(/[^0-9.-]+/g, "")) || null,
      brand: iBrand >= 0 && row[iBrand] ? String(row[iBrand]).trim() : '',
      category: iCat >= 0 && row[iCat] ? String(row[iCat]).trim() : '',
      subcategory: iSubCat >= 0 && row[iSubCat] ? String(row[iSubCat]).trim() : '',
      supplier: iSup >= 0 && row[iSup] ? String(row[iSup]).trim() : ''
    });
  }
  return { items: lib, rawHeaders };
};

// ============================================================================
// 2. UI KIT MODULAR (COMPONENTES REUTILIZABLES PARA CUALQUIER HERRAMIENTA)
// ============================================================================

/**
 * Encabezado estándar para cualquier pestaña/herramienta
 */
const ToolHeader = ({ icon: Icon, iconColor = "text-indigo-500", title, subtitle, t, children }) => (
  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
    <div>
      <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}>
        {Icon && <Icon className={`w-6 h-6 ${iconColor}`} />} {title}
      </h2>
      {subtitle && <p className={`text-sm mt-1 ${t.textSub}`}>{subtitle}</p>}
    </div>
    {children && <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">{children}</div>}
  </div>
);

/**
 * Selector rápido reutilizable de Tienda / Categoría / Suplidor
 */
const ToolFilterSelect = ({ icon: Icon = Filter, iconColor = "text-indigo-400", value, onChange, options = [], allLabel = "Todas", allValue = "Todas", t }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
    <Icon className={`w-4 h-4 ${iconColor} shrink-0`} />
    <select
      className={`bg-transparent border-none text-xs font-bold focus:outline-none cursor-pointer ${t.textTitle}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value={allValue} className="text-slate-900">{allLabel}</option>
      {options.map(opt => (
        <option key={opt} value={opt} className="text-slate-900">{opt}</option>
      ))}
    </select>
  </div>
);

/**
 * Tarjeta KPI estándar reutilizable
 */
const KpiStatCard = ({ label, value, subtext, valueColor = "", t, highlightClass = "" }) => (
  <div className={`p-5 rounded-2xl border transition-colors ${highlightClass || t.card}`}>
    <p className={`text-[10px] uppercase font-bold tracking-widest ${t.textSub}`}>{label}</p>
    <p className={`text-2xl font-black mt-1 ${valueColor || t.textTitle}`}>{value}</p>
    {subtext && <p className={`text-xs mt-1 ${t.textSub}`}>{subtext}</p>}
  </div>
);

/**
 * Tabla de datos estándar con cabecera fija, barra superior y mensaje de tabla vacía
 */
const DataTable = ({ title, icon: Icon = Database, iconColor = "text-indigo-500", rightHeader, columns = [], data = [], renderRow, emptyMessage = "No hay registros disponibles.", maxHeight = "max-h-[520px]", t, isDarkMode }) => (
  <div className={`overflow-hidden rounded-2xl border transition-colors ${t.tableWrapper}`}>
    {title && (
      <div className={`p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
        <h3 className={`font-black flex items-center gap-2 ${t.textTitle}`}>
          {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />} {title}
        </h3>
        {rightHeader && <div className="flex items-center gap-2 w-full sm:w-auto">{rightHeader}</div>}
      </div>
    )}
    <div className={`${maxHeight} overflow-y-auto`}>
      <table className="w-full text-left border-collapse">
        <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
          <tr className="text-[10px] uppercase font-black tracking-widest">
            {columns.map((col, i) => (
              <th key={i} className={`px-4 py-4 ${col.className || ''}`}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
          {data.length > 0 ? (
            data.map((item, idx) => renderRow(item, idx))
          ) : (
            <tr>
              <td colSpan={columns.length || 1} className="px-6 py-12 text-center text-sm font-medium text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * Familias de navegación para mantener ordenados 20+ módulos
 */
const TOOL_GROUPS = [
  { id: 'ALL', label: 'Flujo Completo', description: 'Secuencia integral de principio a fin' },
  { id: 'DATA', label: '1. Ingesta & Catálogo', description: 'Preparación, ETL y auditoría de datos base' },
  { id: 'EXEC', label: '2. Diagnóstico Ejecutivo', description: 'Puente de ingresos, Pareto, Rankings, Salud 360° y Cuotas' },
  { id: 'GEO', label: '3. Inteligencia Territorial', description: 'Cartografía comercial, sucursales y tiering A/B/C' },
  { id: 'FIN', label: '4. Revenue & Finanzas (RGM)', description: 'Arquitectura de precios, elasticidad, promos, GMROI y S&OP' },
  { id: 'MERCH', label: '5. Surtido, Stock & Góndola', description: 'Abastecimiento DOS, liquidaciones, surtido, NPIs, canibalización y espacio' },
  { id: 'REPORT', label: '6. Exportación & Dossier PDF', description: 'Generador de reporte ejecutivo integral en PDF' }
];

// ============================================================================
// 3. ZONA DE EXPANSIÓN PLUG & PLAY (AÑADE NUEVAS HERRAMIENTAS AQUÍ)
// ============================================================================
const PvmBridgeModule = ({ ctx }) => {
  const {
    displayProducts,
    uniqueStores,
    uniqueCategories,
    uniqueVendors,
    filterAndConsolidate,
    formatCurrency,
    formatNumber,
    t,
    isDarkMode
  } = ctx;

  const [storeFilter, setStoreFilter] = useState("Todas");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [vendorFilter, setVendorFilter] = useState("Todos");
  const [groupByMode, setGroupByMode] = useState("sku"); // 'sku' | 'category' | 'vendor'
  const [searchTerm, setSearchTerm] = useState("");
  const [assumedInflationPct, setAssumedInflationPct] = useState(3.5);

  const pvmAnalysis = useMemo(() => {
    const rawItems = filterAndConsolidate({
      store: storeFilter,
      category: categoryFilter,
      vendor: vendorFilter
    }).filter(p => (p.ty || 0) > 0 || (p.ly || 0) > 0);

    if (rawItems.length === 0) return null;

    const infRatio = assumedInflationPct / 100;
    let totalTy = 0;
    let totalLy = 0;
    let npiEffect = 0;
    let dropEffect = 0;
    let compTySales = 0;
    let compLySales = 0;
    let compTyUnits = 0;
    let compLyUnits = 0;
    let observedLyUnitsCount = 0;

    // 1. Preparar base de SKUs y estimar LY Units cuando el reporte no incluya esa columna
    const preparedSkus = rawItems.map(p => {
      const ty = p.ty || 0;
      const ly = p.ly || 0;
      const q1 = p.units > 0 ? p.units : (ty > 0 ? Math.max(1, Math.round(ty / 8.5)) : 0);
      let q0 = p.lyUnits || 0;
      let hasObservedQ0 = q0 > 0;

      if (hasObservedQ0) observedLyUnitsCount++;

      // Si el producto tuvo ventas LY pero el Excel no trajo columna LY Units,
      // estimamos el AUR_LY a partir de la inflación de referencia calibrada
      if (ly > 0 && q0 <= 0) {
        const currentAur = q1 > 0 && ty > 0 ? (ty / q1) : 8.5;
        const estimatedLyAur = Math.max(0.5, currentAur / Math.max(0.2, 1 + infRatio));
        q0 = Math.max(1, Math.round(ly / estimatedLyAur));
      }

      const isNpi = ly <= 0 && ty > 0;
      const isDrop = ly > 0 && ty <= 0;
      const isComp = ly > 0 && ty > 0 && q0 > 0 && q1 > 0;

      totalTy += ty;
      totalLy += ly;

      if (isNpi) npiEffect += ty;
      else if (isDrop) dropEffect -= ly;
      else if (isComp) {
        compTySales += ty;
        compLySales += ly;
        compTyUnits += q1;
        compLyUnits += q0;
      }

      return {
        ...p,
        ty,
        ly,
        q1,
        q0,
        hasObservedQ0,
        isNpi,
        isDrop,
        isComp,
        p1: q1 > 0 ? ty / q1 : 0,
        p0: q0 > 0 ? ly / q0 : 0
      };
    });

    // Precio promedio ponderado del portafolio comparable en LY (P_bar_0) y TY (P_bar_1)
    const portfolioAvgP0 = compLyUnits > 0 ? (compLySales / compLyUnits) : 0;
    const portfolioAvgP1 = compTyUnits > 0 ? (compTySales / compTyUnits) : 0;

    let totalVolEffect = 0;
    let totalPriceEffect = 0;
    let totalMixEffect = 0;

    // 2. Descomposición exacta a nivel de cada SKU
    const skuBreakdown = preparedSkus.map(item => {
      let volEff = 0;
      let priceEff = 0;
      let mixEff = 0;
      let npiEff = 0;
      let dropEff = 0;

      if (item.isNpi) {
        npiEff = item.ty;
      } else if (item.isDrop) {
        dropEff = -item.ly;
      } else if (item.isComp && compLyUnits > 0 && compTyUnits > 0) {
        const s0 = item.q0 / compLyUnits;
        const s1 = item.q1 / compTyUnits;

        // Identidad exacta PVM:
        // Efecto Volumen + Efecto Mix + Efecto Precio === TY - LY
        volEff = (compTyUnits - compLyUnits) * s0 * item.p0;
        mixEff = compTyUnits * (s1 - s0) * (item.p0 - portfolioAvgP0);
        priceEff = (item.p1 - item.p0) * item.q1;
      }

      totalVolEffect += volEff;
      totalPriceEffect += priceEff;
      totalMixEffect += mixEff;

      const netVariance = item.ty - item.ly;

      // Clasificación del Driver Dominante
      let dominantDriver = "Estable";
      let driverBadge = "slate";
      if (item.isNpi) {
        dominantDriver = "Innovación (NPI)";
        driverBadge = "indigo";
      } else if (item.isDrop) {
        dominantDriver = "Baja / Sin Venta TY";
        driverBadge = "rose";
      } else {
        const absV = Math.abs(volEff);
        const absP = Math.abs(priceEff);
        const absM = Math.abs(mixEff);
        const maxAbs = Math.max(absV, absP, absM);

        if (maxAbs < 1) {
          dominantDriver = "Sin Variación";
          driverBadge = "slate";
        } else if (maxAbs === absP) {
          dominantDriver = priceEff >= 0 ? "Impulso por Precio (+AUR)" : "Inversión Promocional (-AUR)";
          driverBadge = priceEff >= 0 ? "emerald" : "amber";
        } else if (maxAbs === absV) {
          dominantDriver = volEff >= 0 ? "Expansión de Tráfico (+Vol)" : "Contracción de Demanda (-Vol)";
          driverBadge = volEff >= 0 ? "emerald" : "rose";
        } else {
          dominantDriver = mixEff >= 0 ? "Premiumización (Trade-Up)" : "Migración Valor (Trade-Down)";
          driverBadge = mixEff >= 0 ? "blue" : "amber";
        }
      }

      return {
        ...item,
        volEff,
        priceEff,
        mixEff,
        npiEff,
        dropEff,
        netVariance,
        dominantDriver,
        driverBadge
      };
    });

    // Ajuste residual milimétrico por si algún ítem tenía ventas pero 0 unidades
    const accountedDelta = totalVolEffect + totalPriceEffect + totalMixEffect + npiEffect + dropEffect;
    const totalDelta = totalTy - totalLy;
    const residual = totalDelta - accountedDelta;
    if (Math.abs(residual) > 0.01) {
      totalVolEffect += residual;
    }

    // 3. Construcción de los escalones flotantes para la Gráfica Waterfall (Cascada PVM)
    const stepsRaw = [
      { name: 'Ventas LY', delta: totalLy, isTotal: true },
      { name: 'Efecto Volumen', delta: totalVolEffect, isTotal: false },
      { name: 'Efecto Precio', delta: totalPriceEffect, isTotal: false },
      { name: 'Efecto Mix', delta: totalMixEffect, isTotal: false },
      { name: 'Innovación Neta', delta: npiEffect + dropEffect, isTotal: false },
      { name: 'Ventas TY', delta: totalTy, isTotal: true }
    ];

    let running = 0;
    const waterfallData = stepsRaw.map(step => {
      if (step.isTotal) {
        running = step.delta;
        return {
          name: step.name,
          base: 0,
          barValue: Math.max(0, step.delta),
          rawDelta: step.delta,
          pctOfLy: totalLy > 0 ? (step.delta / totalLy) * 100 : 100,
          fill: '#4f46e5',
          isTotal: true
        };
      }
      const start = running;
      const end = running + step.delta;
      running = end;
      const base = Math.min(start, end);
      const barValue = Math.abs(step.delta);
      return {
        name: step.name,
        base: Math.max(0, base),
        barValue,
        rawDelta: step.delta,
        pctOfLy: totalLy > 0 ? (step.delta / totalLy) * 100 : 0,
        fill: step.delta >= 0 ? '#10b981' : '#ef4444',
        isTotal: false
      };
    });

    // 4. Agrupación dinámica para la tabla y gráfica secundaria (SKU, Categoría o Suplidor)
    let displayRows = [];
    if (groupByMode === "sku") {
      displayRows = skuBreakdown.map(s => ({
        key: s.key,
        title: s.name,
        subtitle: `UPC: ${s.upc || 'N/A'} • ${s.category}`,
        ly: s.ly,
        ty: s.ty,
        volEff: s.volEff,
        priceEff: s.priceEff,
        mixEff: s.mixEff,
        npiNet: s.npiEff + s.dropEff,
        netVariance: s.netVariance,
        p0: s.p0,
        p1: s.p1,
        dominantDriver: s.dominantDriver,
        driverBadge: s.driverBadge
      }));
    } else {
      const groupField = groupByMode === "category" ? "category" : "vendor";
      const gMap = new Map();
      skuBreakdown.forEach(s => {
        const gKey = s[groupField] || "SIN CLASIFICAR";
        if (!gMap.has(gKey)) {
          gMap.set(gKey, {
            key: gKey,
            title: gKey,
            skuCount: 0,
            ly: 0,
            ty: 0,
            q0: 0,
            q1: 0,
            volEff: 0,
            priceEff: 0,
            mixEff: 0,
            npiNet: 0,
            netVariance: 0
          });
        }
        const g = gMap.get(gKey);
        g.skuCount += 1;
        g.ly += s.ly;
        g.ty += s.ty;
        g.q0 += s.q0;
        g.q1 += s.q1;
        g.volEff += s.volEff;
        g.priceEff += s.priceEff;
        g.mixEff += s.mixEff;
        g.npiNet += (s.npiEff + s.dropEff);
        g.netVariance += s.netVariance;
      });

      displayRows = Array.from(gMap.values()).map(g => {
        const absV = Math.abs(g.volEff);
        const absP = Math.abs(g.priceEff);
        const absM = Math.abs(g.mixEff);
        const maxAbs = Math.max(absV, absP, absM);
        let dominantDriver = "Mix Balanceado";
        let driverBadge = "indigo";
        if (maxAbs === absP) {
          dominantDriver = g.priceEff >= 0 ? "Impulso por Precio" : "Descuento / Promo";
          driverBadge = g.priceEff >= 0 ? "emerald" : "amber";
        } else if (maxAbs === absV) {
          dominantDriver = g.volEff >= 0 ? "Tracción de Volumen" : "Caída de Volumen";
          driverBadge = g.volEff >= 0 ? "emerald" : "rose";
        } else if (maxAbs === absM) {
          dominantDriver = g.mixEff >= 0 ? "Trade-Up (Mix +)" : "Trade-Down (Mix -)";
          driverBadge = g.mixEff >= 0 ? "blue" : "amber";
        }
        return {
          ...g,
          subtitle: `${g.skuCount} SKUs activos`,
          p0: g.q0 > 0 ? g.ly / g.q0 : 0,
          p1: g.q1 > 0 ? g.ty / g.q1 : 0,
          dominantDriver,
          driverBadge
        };
      });
    }

    displayRows.sort((a, b) => Math.abs(b.netVariance) - Math.abs(a.netVariance));

    const filteredRows = displayRows.filter(r =>
      !searchTerm ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Top 8 categorías para gráfica comparativa de efectos
    const catComparisonMap = new Map();
    skuBreakdown.forEach(s => {
      const cName = s.category || "OTRAS";
      if (!catComparisonMap.has(cName)) {
        catComparisonMap.set(cName, { name: cName.substring(0, 14), Volumen: 0, Precio: 0, Mix: 0, totalTy: 0 });
      }
      const c = catComparisonMap.get(cName);
      c.Volumen += Math.round(s.volEff);
      c.Precio += Math.round(s.priceEff);
      c.Mix += Math.round(s.mixEff);
      c.totalTy += s.ty;
    });
    const categoryDriversChart = Array.from(catComparisonMap.values())
      .sort((a, b) => b.totalTy - a.totalTy)
      .slice(0, 8);

    return {
      totalLy,
      totalTy,
      totalDelta,
      totalGrowthPct: totalLy > 0 ? (totalDelta / totalLy) * 100 : (totalTy > 0 ? 100 : 0),
      totalVolEffect,
      totalPriceEffect,
      totalMixEffect,
      npiNetEffect: npiEffect + dropEffect,
      portfolioAvgP0,
      portfolioAvgP1,
      hasDirectLyUnits: observedLyUnitsCount > 0,
      waterfallData,
      categoryDriversChart,
      rows: filteredRows,
      totalRowsCount: displayRows.length
    };
  }, [displayProducts, storeFilter, categoryFilter, vendorFilter, groupByMode, searchTerm, assumedInflationPct]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ToolHeader
        icon={GitMerge}
        iconColor="text-indigo-500"
        title="Puente de Descomposición de Ventas: Precio vs. Volumen vs. Mix (PVM Bridge)"
        subtitle="Aísla matemáticamente cuánto de tu crecimiento o caída proviene de tráfico real (Volumen), aumentos o rebajas de precio (Precio), migración hacia productos premium/económicos (Mix) e Innovación (NPI)."
        t={t}
      >
        <ToolFilterSelect icon={Store} value={storeFilter} onChange={setStoreFilter} options={uniqueStores} allLabel="Todas las Tiendas" allValue="Todas" t={t} />
        <ToolFilterSelect icon={Filter} iconColor="text-emerald-400" value={categoryFilter} onChange={setCategoryFilter} options={uniqueCategories} allLabel="Todas las Categorías" allValue="Todas" t={t} />
        <ToolFilterSelect icon={Users} iconColor="text-amber-400" value={vendorFilter} onChange={setVendorFilter} options={uniqueVendors} allLabel="Todos los Suplidores" allValue="Todos" t={t} />
      </ToolHeader>

      {/* BARRA DE CALIBRACIÓN Y NIVEL DE AGRUPACIÓN */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${t.card}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest mr-1 ${t.textSub}`}>Nivel de Auditoría:</span>
          {[
            { id: 'sku', label: 'Por Producto (SKU)' },
            { id: 'category', label: 'Por Categoría' },
            { id: 'vendor', label: 'Por Suplidor / Marca' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setGroupByMode(mode.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                groupByMode === mode.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : (isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${t.textSub}`}>
              Inflación Base Ref. (si falta LY Units):{' '}
              <strong className="text-indigo-500">{assumedInflationPct >= 0 ? `+${assumedInflationPct}%` : `${assumedInflationPct}%`}</strong>
            </span>
            <input
              type="range"
              min="-5"
              max="15"
              step="0.5"
              value={assumedInflationPct}
              onChange={(e) => setAssumedInflationPct(Number(e.target.value))}
              className="w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
          {pvmAnalysis && (
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
              pvmAnalysis.hasDirectLyUnits
                ? 'bg-emerald-500/15 text-emerald-500'
                : 'bg-indigo-500/15 text-indigo-400'
            }`}>
              {pvmAnalysis.hasDirectLyUnits ? 'LY Units Reales Detectadas' : 'LY Units Estimadas con Inflación Ref.'}
            </span>
          )}
        </div>
      </div>

      {pvmAnalysis ? (
        <>
          {/* 6 TARJETAS DEL PUENTE FINANCIERO: LY -> VOL -> PRECIO -> MIX -> NPI -> TY */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
            <KpiStatCard
              label="1. Base Ventas LY"
              value={formatCurrency(pvmAnalysis.totalLy)}
              subtext={`AUR Base: ${formatCurrency(pvmAnalysis.portfolioAvgP0)}`}
              t={t}
            />
            <KpiStatCard
              label="2. Efecto Volumen"
              value={`${pvmAnalysis.totalVolEffect >= 0 ? '+' : ''}${formatCurrency(pvmAnalysis.totalVolEffect)}`}
              valueColor={pvmAnalysis.totalVolEffect >= 0 ? 'text-emerald-500' : 'text-rose-500'}
              subtext={`${pvmAnalysis.totalLy > 0 ? ((pvmAnalysis.totalVolEffect / pvmAnalysis.totalLy) * 100).toFixed(1) : '0.0'}% impacto tráfico`}
              t={t}
            />
            <KpiStatCard
              label="3. Efecto Precio"
              value={`${pvmAnalysis.totalPriceEffect >= 0 ? '+' : ''}${formatCurrency(pvmAnalysis.totalPriceEffect)}`}
              valueColor={pvmAnalysis.totalPriceEffect >= 0 ? 'text-emerald-500' : 'text-rose-500'}
              subtext={`${pvmAnalysis.totalLy > 0 ? ((pvmAnalysis.totalPriceEffect / pvmAnalysis.totalLy) * 100).toFixed(1) : '0.0'}% impacto tarifa`}
              t={t}
            />
            <KpiStatCard
              label="4. Efecto Mix Surtido"
              value={`${pvmAnalysis.totalMixEffect >= 0 ? '+' : ''}${formatCurrency(pvmAnalysis.totalMixEffect)}`}
              valueColor={pvmAnalysis.totalMixEffect >= 0 ? 'text-blue-500' : 'text-amber-500'}
              subtext={pvmAnalysis.totalMixEffect >= 0 ? 'Trade-Up (Premium)' : 'Trade-Down (Valor)'}
              t={t}
            />
            <KpiStatCard
              label="5. Innovación Neta"
              value={`${pvmAnalysis.npiNetEffect >= 0 ? '+' : ''}${formatCurrency(pvmAnalysis.npiNetEffect)}`}
              valueColor={pvmAnalysis.npiNetEffect >= 0 ? 'text-indigo-500' : 'text-rose-500'}
              subtext="NPIs menos Bajas"
              t={t}
            />
            <KpiStatCard
              label="6. Cierre Ventas TY"
              value={formatCurrency(pvmAnalysis.totalTy)}
              valueColor="text-indigo-500"
              subtext={`Neto: ${pvmAnalysis.totalDelta >= 0 ? '+' : ''}${formatCurrency(pvmAnalysis.totalDelta)} (${pvmAnalysis.totalGrowthPct >= 0 ? '+' : ''}${pvmAnalysis.totalGrowthPct.toFixed(1)}%)`}
              highlightClass={isDarkMode ? 'bg-indigo-950/30 border-indigo-800' : 'bg-indigo-50/70 border-indigo-200'}
              t={t}
            />
          </div>

          {/* DIAGNÓSTICO EJECUTIVO AUTOMÁTICO */}
          <div className={`p-4 rounded-2xl border mb-6 flex items-start sm:items-center gap-3.5 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-500 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs leading-relaxed">
              <span className={`font-black uppercase tracking-wider block mb-0.5 ${t.textTitle}`}>
                Diagnóstico Ejecutivo del Puente PVM:
              </span>
              <span className={t.textSub}>
                La variación total de{' '}
                <strong className={pvmAnalysis.totalDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                  {pvmAnalysis.totalDelta >= 0 ? '+' : ''}{formatCurrency(pvmAnalysis.totalDelta)} ({pvmAnalysis.totalGrowthPct >= 0 ? '+' : ''}{pvmAnalysis.totalGrowthPct.toFixed(1)}%)
                </strong>{' '}
                está explicada por{' '}
                <strong>{formatCurrency(pvmAnalysis.totalVolEffect)}</strong> en Volumen físico,{' '}
                <strong>{formatCurrency(pvmAnalysis.totalPriceEffect)}</strong> por variación de Precios (AUR pasó de {formatCurrency(pvmAnalysis.portfolioAvgP0)} a {formatCurrency(pvmAnalysis.portfolioAvgP1)}) y{' '}
                <strong>{formatCurrency(pvmAnalysis.totalMixEffect)}</strong> por cambio en el Mix de compra ({pvmAnalysis.totalMixEffect >= 0 ? 'los clientes están eligiendo SKUs más caros que el promedio' : 'los clientes están rotando hacia opciones más económicas'}).
              </span>
            </div>
          </div>

          {/* GRÁFICAS: 1) WATERFALL PVM BRIDGE + 2) DRIVERS POR CATEGORÍA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <div className={`p-6 rounded-2xl border lg:col-span-7 flex flex-col ${t.card}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`font-bold text-base flex items-center gap-2 ${t.textTitle}`}>
                    <BarChart3 className="w-5 h-5 text-indigo-500" /> Cascada Financiera PVM (Waterfall Bridge LY → TY)
                  </h3>
                  <p className={`text-xs mt-0.5 ${t.textSub}`}>
                    Escalones verdes suman ingresos vs LY; escalones rojos restan ingresos
                  </p>
                </div>
              </div>
              <div className="h-72 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={pvmAnalysis.waterfallData} margin={{ top: 15, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                    <XAxis dataKey="name" tick={{ fill: t.chartText, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                      contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '12px' }}
                      formatter={(val, name, props) => {
                        if (name === 'base') return [null, null];
                        const raw = props?.payload?.rawDelta || 0;
                        const pct = props?.payload?.pctOfLy || 0;
                        const prefix = !props?.payload?.isTotal && raw >= 0 ? '+' : '';
                        return [`${prefix}${formatCurrency(raw)} (${prefix}${pct.toFixed(1)}%)`, props?.payload?.name];
                      }}
                    />
                    <Bar dataKey="base" stackId="waterfall" fill="transparent" isAnimationActive={false} />
                    <Bar dataKey="barValue" stackId="waterfall" radius={[6, 6, 6, 6]} barSize={46}>
                      {pvmAnalysis.waterfallData.map((entry, idx) => (
                        <Cell key={`wf_${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border lg:col-span-5 flex flex-col ${t.card}`}>
              <h3 className={`font-bold text-base mb-1 flex items-center gap-2 ${t.textTitle}`}>
                <Layers className="w-5 h-5 text-emerald-500" /> Efecto Precio vs. Volumen vs. Mix por Categoría
              </h3>
              <p className={`text-xs mb-4 ${t.textSub}`}>
                Comparativa en dólares ($) de los 3 motores en las principales categorías
              </p>
              <div className="h-72 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pvmAnalysis.categoryDriversChart} margin={{ top: 10, right: 15, left: 0, bottom: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                    <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fill: t.chartText, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                      contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '12px' }}
                      formatter={(val) => `${val >= 0 ? '+' : ''}${formatCurrency(val)}`}
                    />
                    <Legend verticalAlign="top" height={32} iconType="circle" />
                    <Bar dataKey="Volumen" name="Efecto Volumen ($)" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Precio" name="Efecto Precio ($)" fill="#4f46e5" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Mix" name="Efecto Mix ($)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* TABLA DE DESCOMPOSICIÓN PVM */}
          <DataTable
            title={`Desglose Matemático PVM (${pvmAnalysis.rows.length} de ${pvmAnalysis.totalRowsCount} registros)`}
            icon={Database}
            iconColor="text-indigo-500"
            t={t}
            isDarkMode={isDarkMode}
            rightHeader={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar nombre, categoría o UPC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs font-medium focus:outline-none ${t.input}`}
                />
              </div>
            }
            columns={[
              { label: groupByMode === 'sku' ? 'Producto & Categoría' : (groupByMode === 'category' ? 'Categoría' : 'Suplidor / Marca') },
              { label: 'Ventas LY', className: 'text-right' },
              { label: 'Efecto Volumen', className: 'text-right' },
              { label: 'Efecto Precio', className: 'text-right' },
              { label: 'Efecto Mix', className: 'text-right' },
              { label: 'Ventas TY (Neto Δ)', className: 'text-right' },
              { label: 'Driver Dominante', className: 'text-center' }
            ]}
            data={pvmAnalysis.rows.slice(0, 150)}
            renderRow={(row, idx) => (
              <tr key={`pvm_row_${idx}`} className={`transition-colors ${t.rowBase}`}>
                <td className="px-4 py-3.5">
                  <span className={`font-bold text-xs uppercase block ${t.textTitle}`}>{row.title}</span>
                  <span className={`text-[10px] font-mono ${t.textSub}`}>
                    {row.subtitle} • AUR: {formatCurrency(row.p0)} → {formatCurrency(row.p1)}
                  </span>
                </td>
                <td className={`px-4 py-3.5 text-right font-mono text-xs ${t.textSub}`}>
                  {formatCurrency(row.ly)}
                </td>
                <td className={`px-4 py-3.5 text-right font-mono font-bold text-xs ${row.volEff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {row.volEff >= 0 ? '+' : ''}{formatCurrency(row.volEff)}
                </td>
                <td className={`px-4 py-3.5 text-right font-mono font-bold text-xs ${row.priceEff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {row.priceEff >= 0 ? '+' : ''}{formatCurrency(row.priceEff)}
                </td>
                <td className={`px-4 py-3.5 text-right font-mono font-bold text-xs ${row.mixEff >= 0 ? 'text-blue-500' : 'text-amber-500'}`}>
                  {row.mixEff >= 0 ? '+' : ''}{formatCurrency(row.mixEff)}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span className={`font-mono font-black text-xs block ${t.textTitle}`}>{formatCurrency(row.ty)}</span>
                  <span className={`text-[10px] font-mono font-bold ${row.netVariance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {row.netVariance >= 0 ? '+' : ''}{formatCurrency(row.netVariance)}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${
                    row.driverBadge === 'emerald'
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : row.driverBadge === 'rose'
                      ? 'bg-rose-500/15 text-rose-500'
                      : row.driverBadge === 'blue'
                      ? 'bg-blue-500/15 text-blue-500'
                      : row.driverBadge === 'amber'
                      ? 'bg-amber-500/15 text-amber-500'
                      : row.driverBadge === 'indigo'
                      ? 'bg-indigo-500/15 text-indigo-500'
                      : 'bg-slate-500/15 text-slate-400'
                  }`}>
                    {row.dominantDriver}
                  </span>
                </td>
              </tr>
            )}
          />
        </>
      ) : (
        <div className={`rounded-2xl p-12 text-center border-2 border-dashed ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
          <GitMerge className={`w-12 h-12 mx-auto mb-3 opacity-40 ${t.textSub}`} />
          <h3 className={`text-lg font-bold ${t.textTitle}`}>Sincroniza un archivo de ventas para construir el Puente PVM</h3>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            El motor descompondrá automáticamente la diferencia entre Ventas LY y Ventas TY en Volumen, Precio, Mix e Innovación.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * MÓDULO 2.5: TERMÓMETRO DE METAS Y CUOTAS (PACING & QUOTA TRACKING)
 * Evalúa el cumplimiento de cuotas comerciales, proyecta el cierre (Run-Rate) según el tiempo transcurrido
 * y calcula la venta diaria requerida por Tienda, Categoría, Suplidor o Región.
 */
const QuotaPacingModule = ({ ctx }) => {
  const {
    displayProducts,
    uniqueStores,
    uniqueCategories,
    getRegionAndTownForStore,
    formatCurrency,
    formatNumber,
    t,
    isDarkMode
  } = ctx;

  const [dimension, setDimension] = useState("store"); // 'store' | 'category' | 'vendor' | 'region'
  const [storeFilter, setStoreFilter] = useState("Todas");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos"); // 'Todos' | 'on_track' | 'warning' | 'critical'
  const [searchTerm, setSearchTerm] = useState("");
  const [targetGrowthPct, setTargetGrowthPct] = useState(10); // +10% sobre LY por defecto
  const [periodTotalDays, setPeriodTotalDays] = useState(30); // 30 (Mes), 90 (Trimestre), 365 (Año)
  const [daysElapsed, setDaysElapsed] = useState(22); // Días transcurridos del periodo
  const [globalQuotaInput, setGlobalQuotaInput] = useState(""); // Cuota global manual opcional
  const [customQuotas, setCustomQuotas] = useState({}); // Cuotas manuales por fila

  // Asegurar que daysElapsed no supere periodTotalDays al cambiar horizonte
  const handlePeriodChange = (newTotalDays) => {
    const ratio = daysElapsed / Math.max(1, periodTotalDays);
    setPeriodTotalDays(newTotalDays);
    setDaysElapsed(Math.max(1, Math.min(newTotalDays, Math.round(newTotalDays * ratio))));
  };

  const pacingAnalysis = useMemo(() => {
    const filteredRaw = (displayProducts || []).filter(p =>
      (storeFilter === "Todas" || p.store === storeFilter) &&
      (categoryFilter === "Todas" || p.category === categoryFilter)
    );

    if (filteredRaw.length === 0) return null;

    const pctTimeElapsed = Math.min(100, Math.max(1, (daysElapsed / Math.max(1, periodTotalDays)) * 100));
    const timeRatio = pctTimeElapsed / 100;
    const daysRemaining = Math.max(0, periodTotalDays - daysElapsed);
    const growthMultiplier = 1 + (targetGrowthPct / 100);

    // 1. Agrupar por la dimensión seleccionada (Tienda, Categoría, Suplidor o Región)
    const groupMap = new Map();
    filteredRaw.forEach(p => {
      let key = "";
      let subtitle = "";
      if (dimension === "store") {
        key = p.store || "SIN TIENDA";
        const { region, town } = getRegionAndTownForStore(key);
        subtitle = `Región ${region} (${town})`;
      } else if (dimension === "category") {
        key = p.category || "SIN CATEGORÍA";
        subtitle = "Categoría Comercial";
      } else if (dimension === "vendor") {
        key = p.vendor || "NO ESPECIFICADO";
        subtitle = "Suplidor / Marca";
      } else {
        const { region } = getRegionAndTownForStore(p.store);
        key = region || "Sin Asignar";
        subtitle = "Región Geográfica PR";
      }

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          key,
          name: key,
          subtitle,
          ty: 0,
          ly: 0,
          units: 0,
          skus: new Set(),
          stores: new Set()
        });
      }
      const g = groupMap.get(key);
      g.ty += p.ty || 0;
      g.ly += p.ly || 0;
      g.units += p.units || 0;
      g.skus.add(p.upc || p.name);
      g.stores.add(p.store);
    });

    const rawEntities = Array.from(groupMap.values());
    const totalTyAll = rawEntities.reduce((s, e) => s + e.ty, 0);
    const totalLyAll = rawEntities.reduce((s, e) => s + e.ly, 0);
    const parsedGlobalQuota = parseFloat(String(globalQuotaInput).replace(/[^0-9.]/g, "")) || 0;

    // 2. Calcular Cuota Meta, Cuota al Día de Hoy, Run-Rate y Brecha por unidad
    let totalQuota = 0;
    let totalProjected = 0;
    let totalQuotaToDate = 0;

    const entities = rawEntities.map(e => {
      // Base automática: LY * (1 + % Meta) o estimación sobre TY si es nuevo (LY = 0)
      let baseAutoQuota = e.ly > 0 ? e.ly * growthMultiplier : e.ty * Math.max(1.05, growthMultiplier);

      // Si el usuario definió una Cuota Global Manual, la distribuimos proporcionalmente al peso de cada entidad
      if (parsedGlobalQuota > 0) {
        const weight = totalLyAll > 0
          ? (e.ly > 0 ? e.ly / totalLyAll : (totalTyAll > 0 ? e.ty / totalTyAll : 1 / rawEntities.length))
          : (totalTyAll > 0 ? e.ty / totalTyAll : 1 / rawEntities.length);
        baseAutoQuota = parsedGlobalQuota * weight;
      }

      const manualVal = customQuotas[`${dimension}__${e.key}`];
      const hasManualQuota = manualVal !== undefined && manualVal !== "" && !isNaN(Number(manualVal)) && Number(manualVal) > 0;
      const quota = hasManualQuota ? Number(manualVal) : Math.max(1, baseAutoQuota);

      const quotaToDate = quota * timeRatio;
      const attainmentPct = quota > 0 ? (e.ty / quota) * 100 : 0;
      const projectedSales = timeRatio > 0 ? (e.ty / timeRatio) : e.ty;
      const pacingPct = quota > 0 ? (projectedSales / quota) * 100 : 0;
      const gapToQuota = Math.max(0, quota - e.ty);
      const projectedVariance = projectedSales - quota;

      const currentDailySales = daysElapsed > 0 ? e.ty / daysElapsed : 0;
      const requiredDailySales = daysRemaining > 0 ? gapToQuota / daysRemaining : gapToQuota;
      const requiredAccelerationPct = currentDailySales > 0 && daysRemaining > 0
        ? ((requiredDailySales / currentDailySales) - 1) * 100
        : 0;

      // Clasificación por Semáforo de Pacing
      let status = "on_track";
      let statusLabel = "En Meta / Superando";
      let actionPlan = "Mantener exhibición y proteger stock de líderes";
      if (pacingPct >= 100 || attainmentPct >= 100) {
        status = "on_track";
        statusLabel = attainmentPct >= 100 ? "Cuota Cumplida" : "En Ritmo (On-Track)";
        actionPlan = "Asegurar reabasto (DOS) para sostener sobrecumplimiento";
      } else if (pacingPct >= 90) {
        status = "warning";
        statusLabel = "En Riesgo Leve (90-99%)";
        actionPlan = daysRemaining > 0
          ? `Acelerar ritmo diario +${Math.max(1, requiredAccelerationPct).toFixed(0)}% (${formatCurrency(requiredDailySales)}/día)`
          : "Activar impulso promocional de cierre";
      } else {
        status = "critical";
        statusLabel = "Atraso Crítico (<90%)";
        actionPlan = daysRemaining > 0
          ? `Plan de Choque: exige vender ${formatCurrency(requiredDailySales)}/día los próximos ${daysRemaining}d`
          : "Revisión estructural de surtido, precio y tráfico";
      }

      totalQuota += quota;
      totalProjected += projectedSales;
      totalQuotaToDate += quotaToDate;

      return {
        ...e,
        skuCount: e.skus.size,
        storeCount: e.stores.size,
        quota,
        hasManualQuota,
        quotaToDate,
        attainmentPct,
        projectedSales,
        pacingPct,
        gapToQuota,
        projectedVariance,
        currentDailySales,
        requiredDailySales,
        requiredAccelerationPct,
        status,
        statusLabel,
        actionPlan
      };
    }).sort((a, b) => b.ty - a.ty);

    const globalAttainmentPct = totalQuota > 0 ? (totalTyAll / totalQuota) * 100 : 0;
    const globalPacingPct = totalQuota > 0 ? (totalProjected / totalQuota) * 100 : 0;
    const globalGap = Math.max(0, totalQuota - totalTyAll);
    const globalVariance = totalProjected - totalQuota;
    const globalCurrentDaily = daysElapsed > 0 ? totalTyAll / daysElapsed : 0;
    const globalRequiredDaily = daysRemaining > 0 ? globalGap / daysRemaining : globalGap;

    const counts = {
      on_track: entities.filter(e => e.status === "on_track").length,
      warning: entities.filter(e => e.status === "warning").length,
      critical: entities.filter(e => e.status === "critical").length
    };

    const visibleEntities = entities.filter(e => {
      const matchesStatus = statusFilter === "Todos" || e.status === statusFilter;
      const matchesSearch = !searchTerm ||
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    const chartData = entities.slice(0, 10).map(e => ({
      name: e.name.substring(0, 14),
      fullName: e.name,
      Actual: Math.round(e.ty),
      Proyectado: Math.round(e.projectedSales),
      Cuota: Math.round(e.quota),
      pacingPct: Number(e.pacingPct.toFixed(1)),
      status: e.status
    }));

    return {
      entities: visibleEntities,
      allCount: entities.length,
      totalTyAll,
      totalLyAll,
      totalQuota,
      totalQuotaToDate,
      totalProjected,
      globalAttainmentPct,
      globalPacingPct,
      globalGap,
      globalVariance,
      globalCurrentDaily,
      globalRequiredDaily,
      pctTimeElapsed,
      daysRemaining,
      counts,
      chartData
    };
  }, [displayProducts, dimension, storeFilter, categoryFilter, statusFilter, searchTerm, targetGrowthPct, periodTotalDays, daysElapsed, globalQuotaInput, customQuotas]);

  const manualKeysCount = Object.keys(customQuotas).filter(k => customQuotas[k] !== "").length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ToolHeader
        icon={Target}
        iconColor="text-rose-500"
        title="Termómetro de Metas y Cuotas Comerciales (Pacing & Run-Rate)"
        subtitle="Monitorea en tiempo real el avance hacia la cuota, proyecta el cierre del periodo según la velocidad actual (Run-Rate) y calcula cuánto debes vender por día para cerrar la brecha."
        t={t}
      >
        {dimension !== "store" && (
          <ToolFilterSelect icon={Store} value={storeFilter} onChange={setStoreFilter} options={uniqueStores} allLabel="Todas las Tiendas" allValue="Todas" t={t} />
        )}
        {dimension !== "category" && (
          <ToolFilterSelect icon={Filter} iconColor="text-emerald-400" value={categoryFilter} onChange={setCategoryFilter} options={uniqueCategories} allLabel="Todas las Categorías" allValue="Todas" t={t} />
        )}
      </ToolHeader>

      {/* PANEL DE CONFIGURACIÓN DE DIMENSIÓN, META Y RELOJ DE AVANCE */}
      <div className={`p-5 rounded-3xl border mb-6 grid grid-cols-1 lg:grid-cols-12 gap-6 ${t.card}`}>
        {/* 1. Selector de Dimensión */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${t.textSub}`}>
              1. Unidad de Auditoría de Cuota:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'store', label: 'Por Tienda', icon: Store },
                { id: 'category', label: 'Categoría', icon: Layers },
                { id: 'vendor', label: 'Suplidor', icon: Users },
                { id: 'region', label: 'Región PR', icon: MapIcon }
              ].map(dim => {
                const DimIcon = dim.icon;
                return (
                  <button
                    key={dim.id}
                    onClick={() => setDimension(dim.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      dimension === dim.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : t.cardHover
                    }`}
                  >
                    <DimIcon className="w-4 h-4" />
                    <span>{dim.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Presets de Meta vs LY y Cuota Global Manual */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-1">
                <span className={t.textSub}>Meta vs Año Pasado (LY):</span>
                <strong className="text-indigo-500">{targetGrowthPct >= 0 ? `+${targetGrowthPct}%` : `${targetGrowthPct}%`}</strong>
              </div>
              <input
                type="range"
                min="-10"
                max="35"
                step="1"
                value={targetGrowthPct}
                onChange={(e) => setTargetGrowthPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex gap-1.5 mt-2">
                {[5, 10, 15, 20].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTargetGrowthPct(pct)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      targetGrowthPct === pct ? 'bg-indigo-600 text-white border-indigo-600' : t.card
                    }`}
                  >
                    +{pct}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${t.textSub}`}>
                Cuota Global Manual ($ Opcional):
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Ej. 500000 (Auto si vacío)"
                  value={globalQuotaInput}
                  onChange={(e) => setGlobalQuotaInput(e.target.value)}
                  className={`w-full p-2 rounded-xl border text-xs font-mono font-bold focus:outline-none ${t.input}`}
                />
                {globalQuotaInput && (
                  <button
                    onClick={() => setGlobalQuotaInput("")}
                    className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                    title="Restaurar cálculo automático"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Reloj de Pacing (Tiempo Transcurrido del Periodo) */}
        <div className={`lg:col-span-7 p-4 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-indigo-50/40 border-indigo-100'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">
                2. Reloj de Ritmo Comercial (Calendario de Pacing)
              </span>
              <p className={`text-xs ${t.textSub}`}>
                Ajusta el día actual del ciclo para medir si la velocidad de venta alcanzará la meta al cierre:
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border dark:border-slate-800">
              {[
                { days: 30, label: 'Mensual (30d)' },
                { days: 90, label: 'Trimestral (90d)' },
                { days: 365, label: 'Anual (365d)' }
              ].map(p => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => handlePeriodChange(p.days)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                    periodTotalDays === p.days ? 'bg-indigo-600 text-white shadow-sm' : t.textSub
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className={t.textTitle}>
                Día Transcurrido: <strong className="text-indigo-500">Día {daysElapsed} de {periodTotalDays}</strong> ({((daysElapsed / periodTotalDays) * 100).toFixed(0)}% del tiempo)
              </span>
              <span className="text-amber-500 font-mono">
                Quedan {Math.max(0, periodTotalDays - daysElapsed)} días para el cierre
              </span>
            </div>
            <input
              type="range"
              min="1"
              max={periodTotalDays}
              step="1"
              value={daysElapsed}
              onChange={(e) => setDaysElapsed(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Inicio (25%)', ratio: 0.25 },
                  { label: 'Mitad Periodo (50%)', ratio: 0.50 },
                  { label: 'Recta Final (75%)', ratio: 0.75 },
                  { label: 'Últimos Días (90%)', ratio: 0.90 },
                  { label: 'Cierre (100%)', ratio: 1.0 }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDaysElapsed(Math.max(1, Math.round(periodTotalDays * preset.ratio)))}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      Math.round((daysElapsed / periodTotalDays) * 100) === Math.round(preset.ratio * 100)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : t.card
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              {manualKeysCount > 0 && (
                <button
                  type="button"
                  onClick={() => setCustomQuotas({})}
                  className="text-[10px] font-black text-rose-500 hover:underline"
                >
                  Borrar {manualKeysCount} cuota(s) manual(es)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {pacingAnalysis ? (
        <>
          {/* TERMÓMETRO VISUAL MAESTRO DE TODA LA OPERACIÓN */}
          <div className={`p-6 rounded-3xl border mb-6 shadow-sm ${t.card}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500">
                    Termómetro Maestro Consolidado
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    pacingAnalysis.globalPacingPct >= 100
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : pacingAnalysis.globalPacingPct >= 90
                      ? 'bg-amber-500/15 text-amber-500'
                      : 'bg-rose-500/15 text-rose-500'
                  }`}>
                    {pacingAnalysis.globalPacingPct >= 100
                      ? 'En Ritmo de Superar Meta'
                      : pacingAnalysis.globalPacingPct >= 90
                      ? 'Alerta Moderada de Pacing'
                      : 'Peligro de Incumplimiento'}
                  </span>
                </div>
                <h3 className={`text-xl font-black mt-1.5 ${t.textTitle}`}>
                  Avance Actual: {formatCurrency(pacingAnalysis.totalTyAll)} de {formatCurrency(pacingAnalysis.totalQuota)} ({pacingAnalysis.globalAttainmentPct.toFixed(1)}% completado)
                </h3>
              </div>

              <div className="text-left md:text-right">
                <span className={`text-[10px] font-bold uppercase block ${t.textSub}`}>Cierre Proyectado (Run-Rate)</span>
                <span className={`text-2xl font-mono font-black ${
                  pacingAnalysis.globalPacingPct >= 100 ? 'text-emerald-500' : pacingAnalysis.globalPacingPct >= 90 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {formatCurrency(pacingAnalysis.totalProjected)} ({pacingAnalysis.globalPacingPct.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Tubo del Termómetro con Marcador de Tiempo Transcurrido */}
            <div className="relative pt-6 pb-3">
              {/* Marcador flotante de "Meta Esperada Hoy" */}
              <div
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center z-20 transition-all duration-300"
                style={{ left: `${Math.min(96, Math.max(4, pacingAnalysis.pctTimeElapsed))}%` }}
              >
                <span className="px-2 py-0.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black whitespace-nowrap shadow">
                  Deberías ir en {pacingAnalysis.pctTimeElapsed.toFixed(0)}% ({formatCurrency(pacingAnalysis.totalQuotaToDate)})
                </span>
                <div className="w-0.5 h-8 bg-slate-900 dark:bg-white"></div>
              </div>

              {/* Barra del Termómetro */}
              <div className="w-full h-6 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-black text-white ${
                    pacingAnalysis.globalPacingPct >= 100
                      ? 'bg-gradient-to-r from-indigo-600 via-emerald-500 to-emerald-400'
                      : pacingAnalysis.globalPacingPct >= 90
                      ? 'bg-gradient-to-r from-indigo-600 via-amber-500 to-amber-400'
                      : 'bg-gradient-to-r from-rose-700 via-rose-500 to-orange-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(3, pacingAnalysis.globalAttainmentPct))}%` }}
                >
                  {pacingAnalysis.globalAttainmentPct >= 8 && `${pacingAnalysis.globalAttainmentPct.toFixed(1)}%`}
                </div>
              </div>

              <div className="flex justify-between text-[10px] font-mono font-bold mt-1.5 opacity-75">
                <span>$0 (0%)</span>
                <span>25% Cuota</span>
                <span>50% Cuota</span>
                <span>75% Cuota</span>
                <span>Meta 100% ({formatCurrency(pacingAnalysis.totalQuota)})</span>
              </div>
            </div>
          </div>

          {/* 5 TARJETAS KPI DE CONTROL DE CUOTAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <KpiStatCard
              label="1. Ventas Acumuladas (TY)"
              value={formatCurrency(pacingAnalysis.totalTyAll)}
              subtext={`LY Base: ${formatCurrency(pacingAnalysis.totalLyAll)}`}
              t={t}
            />
            <KpiStatCard
              label="2. Cuota Meta Total"
              value={formatCurrency(pacingAnalysis.totalQuota)}
              valueColor="text-indigo-500"
              subtext={`Exigido hoy: ${formatCurrency(pacingAnalysis.totalQuotaToDate)}`}
              t={t}
            />
            <KpiStatCard
              label="3. Proyección Run-Rate"
              value={formatCurrency(pacingAnalysis.totalProjected)}
              valueColor={pacingAnalysis.globalVariance >= 0 ? 'text-emerald-500' : 'text-rose-500'}
              subtext={`${pacingAnalysis.globalVariance >= 0 ? 'Superávit' : 'Déficit'}: ${pacingAnalysis.globalVariance >= 0 ? '+' : ''}${formatCurrency(pacingAnalysis.globalVariance)}`}
              t={t}
            />
            <KpiStatCard
              label="4. Brecha por Vender"
              value={formatCurrency(pacingAnalysis.globalGap)}
              valueColor={pacingAnalysis.globalGap === 0 ? 'text-emerald-500' : 'text-amber-500'}
              subtext={pacingAnalysis.daysRemaining > 0
                ? ` Meta diaria: ${formatCurrency(pacingAnalysis.globalRequiredDaily)}/día`
                : 'Periodo concluido'}
              t={t}
            />
            <KpiStatCard
              label="5. Ritmo Diario Actual"
              value={`${formatCurrency(pacingAnalysis.globalCurrentDaily)}/d`}
              valueColor={pacingAnalysis.globalCurrentDaily >= pacingAnalysis.globalRequiredDaily ? 'text-emerald-500' : 'text-rose-500'}
              subtext={`En Meta: ${pacingAnalysis.counts.on_track} | Alerta: ${pacingAnalysis.counts.warning} | Crítico: ${pacingAnalysis.counts.critical}`}
              t={t}
            />
          </div>

          {/* BOTONES DE FILTRO POR SEMÁFORO DE CUMPLIMIENTO */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { id: 'Todos', label: 'Todas las Unidades', count: pacingAnalysis.allCount, badge: 'bg-indigo-500/15 text-indigo-500' },
              { id: 'on_track', label: 'En Meta / Superando (≥100%)', count: pacingAnalysis.counts.on_track, badge: 'bg-emerald-500/15 text-emerald-500' },
              { id: 'warning', label: 'En Riesgo Leve (90% - 99%)', count: pacingAnalysis.counts.warning, badge: 'bg-amber-500/15 text-amber-500' },
              { id: 'critical', label: 'Atraso Crítico (<90%)', count: pacingAnalysis.counts.critical, badge: 'bg-rose-500/15 text-rose-500' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  statusFilter === st.id ? 'ring-2 ring-indigo-500 scale-[1.01]' : ''
                } ${t.card}`}
              >
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${st.badge}`}>
                  {st.label}
                </span>
                <span className={`text-2xl font-black mt-1.5 block ${t.textTitle}`}>{st.count}</span>
              </button>
            ))}
          </div>

          {/* GRÁFICAS: 1) VENTAS ACTUALES VS RUN-RATE VS CUOTA + 2) RANKING DE PACING % */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <div className={`p-6 rounded-2xl border lg:col-span-7 flex flex-col ${t.card}`}>
              <h3 className={`font-bold text-base mb-1 flex items-center gap-2 ${t.textTitle}`}>
                <BarChart3 className="w-5 h-5 text-indigo-500" /> Ventas Actuales vs. Run-Rate Proyectado vs. Cuota Meta ($)
              </h3>
              <p className={`text-xs mb-4 ${t.textSub}`}>
                Comparativa de las principales unidades de negocio frente a su objetivo comercial
              </p>
              <div className="h-72 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={pacingAnalysis.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                    <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fill: t.chartText, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                      contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '12px' }}
                      formatter={(val) => formatCurrency(val)}
                    />
                    <Legend verticalAlign="top" height={32} iconType="circle" />
                    <Bar dataKey="Actual" name="Venta Actual (TY)" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="Proyectado" name="Run-Rate Cierre ($)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                    <Line type="monotone" dataKey="Cuota" name="Cuota Meta ($)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border lg:col-span-5 flex flex-col ${t.card}`}>
              <h3 className={`font-bold text-base mb-1 flex items-center gap-2 ${t.textTitle}`}>
                <Activity className="w-5 h-5 text-emerald-500" /> Índice de Cumplimiento Proyectado (% Pacing)
              </h3>
              <p className={`text-xs mb-4 ${t.textSub}`}>
                Verde ≥100% (Cumple Meta) • Ámbar 90-99% (Alerta) • Rojo &lt;90% (Crítico)
              </p>
              <div className="h-72 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pacingAnalysis.chartData} layout="vertical" margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={t.chartGrid} />
                    <XAxis type="number" domain={[0, 'dataMax + 15']} hide />
                    <YAxis dataKey="name" type="category" width={105} tick={{ fill: t.chartText, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                      contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '12px' }}
                      formatter={(val) => [`${val}% de la Cuota`, 'Pacing Proyectado']}
                    />
                    <Bar dataKey="pacingPct" name="% Pacing" radius={[0, 6, 6, 0]} barSize={18}>
                      {pacingAnalysis.chartData.map((entry, idx) => (
                        <Cell
                          key={`pace_cell_${idx}`}
                          fill={entry.status === 'on_track' ? '#10b981' : entry.status === 'warning' ? '#f59e0b' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* TABLA INTERACTIVA DE CUOTAS CON EDICIÓN MANUAL POR FILA */}
          <DataTable
            title={`Tablero de Control de Cuotas y Pacing (${pacingAnalysis.entities.length} registros)`}
            icon={Target}
            iconColor="text-rose-500"
            t={t}
            isDarkMode={isDarkMode}
            rightHeader={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar tienda, categoría o suplidor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs font-medium focus:outline-none ${t.input}`}
                />
              </div>
            }
            columns={[
              { label: 'Unidad de Negocio' },
              { label: 'Cuota Meta ($ Editable)', className: 'text-right' },
              { label: 'Venta Actual TY', className: 'text-right' },
              { label: 'Termómetro (% Logrado)', className: 'w-44 text-center' },
              { label: 'Run-Rate Proyectado', className: 'text-right' },
              { label: 'Brecha / Meta Diaria', className: 'text-right' },
              { label: 'Semáforo & Plan de Acción' }
            ]}
            data={pacingAnalysis.entities}
            renderRow={(row, idx) => {
              const quotaKey = `${dimension}__${row.key}`;
              const barColor = row.status === 'on_track'
                ? 'bg-emerald-500'
                : row.status === 'warning'
                ? 'bg-amber-500'
                : 'bg-rose-500';

              return (
                <tr key={`quota_row_${idx}`} className={`transition-colors ${t.rowBase}`}>
                  <td className="px-4 py-3.5">
                    <span className={`font-bold text-xs uppercase block ${t.textTitle}`}>{row.name}</span>
                    <span className={`text-[10px] font-mono ${t.textSub}`}>
                      {row.subtitle} • {row.skuCount} SKUs • LY: {formatCurrency(row.ly)}
                    </span>
                  </td>

                  {/* Input para editar Cuota Manualmente por fila */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <span className={`text-xs font-mono font-bold ${row.hasManualQuota ? 'text-indigo-500' : t.textSub}`}>$</span>
                      <input
                        type="number"
                        value={customQuotas[quotaKey] !== undefined ? customQuotas[quotaKey] : Math.round(row.quota)}
                        onChange={(e) => setCustomQuotas(prev => ({ ...prev, [quotaKey]: e.target.value }))}
                        className={`w-28 px-2 py-1 text-right rounded-lg border text-xs font-mono font-black focus:outline-none ${
                          row.hasManualQuota
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500'
                            : t.input
                        }`}
                        title="Haz clic para escribir una cuota personalizada"
                      />
                    </div>
                    <span className={`text-[9px] block mt-0.5 ${t.textSub}`}>
                      Hoy ({pacingAnalysis.pctTimeElapsed.toFixed(0)}%): {formatCurrency(row.quotaToDate)}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <span className={`font-mono font-black text-xs block ${t.textTitle}`}>{formatCurrency(row.ty)}</span>
                    <span className={`text-[10px] font-mono ${t.textSub}`}>
                      {formatCurrency(row.currentDailySales)}/día actual
                    </span>
                  </td>

                  {/* Termómetro visual individual */}
                  <td className="px-4 py-3.5">
                    <div className="flex justify-between items-center text-[10px] font-mono font-black mb-1">
                      <span className={t.textTitle}>{row.attainmentPct.toFixed(1)}%</span>
                      <span className={t.textSub}>Meta: 100%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${Math.min(100, Math.max(2, row.attainmentPct))}%` }}
                      ></div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <span className={`font-mono font-black text-xs block ${
                      row.status === 'on_track' ? 'text-emerald-500' : row.status === 'warning' ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {formatCurrency(row.projectedSales)}
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${
                      row.projectedVariance >= 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      Pacing: {row.pacingPct.toFixed(1)}% ({row.projectedVariance >= 0 ? '+' : ''}{formatCurrency(row.projectedVariance)})
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    {row.gapToQuota > 0 ? (
                      <>
                        <span className="font-mono font-bold text-xs text-amber-500 block">
                          Faltan {formatCurrency(row.gapToQuota)}
                        </span>
                        <span className={`text-[10px] font-mono ${t.textSub}`}>
                          Req: {formatCurrency(row.requiredDailySales)}/día
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-mono font-black text-emerald-500">
                        ¡Meta Superada!
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full inline-block mb-1 ${
                      row.status === 'on_track'
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : row.status === 'warning'
                        ? 'bg-amber-500/15 text-amber-500'
                        : 'bg-rose-500/15 text-rose-500'
                    }`}>
                      {row.statusLabel}
                    </span>
                    <span className={`text-[11px] font-medium block ${t.textTitle}`}>
                      {row.actionPlan}
                    </span>
                  </td>
                </tr>
              );
            }}
          />
        </>
      ) : (
        <div className={`rounded-2xl p-12 text-center border-2 border-dashed ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
          <Target className={`w-12 h-12 mx-auto mb-3 opacity-40 ${t.textSub}`} />
          <h3 className={`text-lg font-bold ${t.textTitle}`}>Sincroniza un archivo de ventas para activar el Termómetro de Cuotas</h3>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            El módulo calculará automáticamente tus cuotas por Tienda, Categoría, Suplidor o Región y medirá el ritmo de cierre (Run-Rate).
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * MÓDULO 5.5: ANÁLISIS DE CANIBALIZACIÓN VS. CRECIMIENTO INCREMENTAL
 * Audita si el crecimiento de SKUs ganadores y lanzamientos (NPIs) genera dinero nuevo real
 * para la categoría/marca o si simplemente absorbe ventas de otros SKUs propios (Sustitución Interna).
 */
const CannibalizationModule = ({ ctx }) => {
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

  const [storeFilter, setStoreFilter] = useState("Todas");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [groupDimension, setGroupDimension] = useState("category"); // 'category' | 'vendor' | 'cat_vendor'
  const [analysisScope, setAnalysisScope] = useState("all_growth"); // 'all_growth' | 'npi_only'
  const [regimeFilter, setRegimeFilter] = useState("Todos"); // 'Todos' | 'incremental' | 'partial' | 'severe' | 'bleed'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupKey, setSelectedGroupKey] = useState(null);

  const cannibalizationAnalysis = useMemo(() => {
    const consolidated = filterAndConsolidate({
      store: storeFilter,
      category: categoryFilter
    }).filter(p => (p.ty || 0) > 0 || (p.ly || 0) > 0);

    if (consolidated.length === 0) return null;

    // 1. Agrupar SKUs según el nivel de ecosistema elegido (Categoría, Suplidor o Categoría + Suplidor)
    const ecoMap = new Map();

    consolidated.forEach(p => {
      const catName = p.category || "SIN CATEGORÍA";
      const venName = p.vendor || "NO ESPECIFICADO";
      let gKey = catName;
      let gTitle = catName;
      let gSubtitle = "Ecosistema de Categoría";

      if (groupDimension === "vendor") {
        gKey = venName;
        gTitle = venName;
        gSubtitle = "Portafolio de Suplidor / Marca";
      } else if (groupDimension === "cat_vendor") {
        gKey = `${catName}__${venName}`;
        gTitle = `${venName} (${catName})`;
        gSubtitle = `Intra-Marca en ${catName}`;
      }

      if (!ecoMap.has(gKey)) {
        ecoMap.set(gKey, {
          key: gKey,
          title: gTitle,
          subtitle: gSubtitle,
          skus: []
        });
      }

      const ty = p.ty || 0;
      const ly = p.ly || 0;
      const delta = ty - ly;
      const isNpi = ly <= 0 && ty > 0;
      const aur = (p.units || 0) > 0 ? ty / p.units : 0;

      ecoMap.get(gKey).skus.push({
        ...p,
        ty,
        ly,
        delta,
        isNpi,
        aur
      });
    });

    // 2. Evaluar Ganadores (Atacantes), Perdedores (Víctimas), Canibalización e Incremento Neto
    let totalGrossGain = 0;
    let totalNpiGain = 0;
    let totalInternalLoss = 0;
    let totalCannibalized = 0;
    let totalTrueIncremental = 0;

    const groups = Array.from(ecoMap.values()).map(g => {
      const allGrowing = g.skus.filter(s => s.delta > 0).sort((a, b) => b.delta - a.delta);
      const npiSkus = g.skus.filter(s => s.isNpi).sort((a, b) => b.ty - a.ty);
      const victims = g.skus.filter(s => s.delta < 0).sort((a, b) => a.delta - b.delta); // Más negativos primero

      const activeAttackers = analysisScope === "npi_only" ? npiSkus : allGrowing;

      const totalTy = g.skus.reduce((sum, s) => sum + s.ty, 0);
      const totalLy = g.skus.reduce((sum, s) => sum + s.ly, 0);
      const grossGain = activeAttackers.reduce((sum, s) => sum + s.delta, 0);
      const npiGain = npiSkus.reduce((sum, s) => sum + s.ty, 0);
      const internalLoss = victims.reduce((sum, s) => sum + Math.abs(s.delta), 0);

      // La venta canibalizada es la parte de la ganancia bruta que simplemente reemplazó pérdidas de SKUs hermanos
      const cannibalizedDollars = Math.min(grossGain, internalLoss);
      // El crecimiento incremental real es el excedente que genuinamente expandió el tamaño de la categoría/marca
      const trueIncrementalDollars = Math.max(0, grossGain - internalLoss);
      const netEcosystemDelta = grossGain - internalLoss;

      const cannibalizationRate = grossGain > 0
        ? (cannibalizedDollars / grossGain) * 100
        : (internalLoss > 0 ? 100 : 0);

      const incrementalQualityPct = grossGain > 0
        ? (trueIncrementalDollars / grossGain) * 100
        : 0;

      // Clasificación diagnóstica del grupo
      let regime = "incremental";
      let regimeLabel = "Expansión Incremental Sólida";
      let badgeTone = "emerald";
      let prescription = "Acelerar distribución: los ganadores traen tráfico nuevo sin dañar el Core.";

      if (grossGain <= 0 && internalLoss > 0) {
        regime = "bleed";
        regimeLabel = "Fuga Neta (Sin Ganadores)";
        badgeTone = "rose";
        prescription = "Urgente: categoría en contracción pura; requiere innovación o ajuste de precio.";
      } else if (netEcosystemDelta < 0) {
        regime = "bleed";
        regimeLabel = "Canibalización Total + Fuga";
        badgeTone = "rose";
        prescription = "Los nuevos SKUs no compensan la caída de los líderes; proteger facings del Core.";
      } else if (cannibalizationRate > 75) {
        regime = "severe";
        regimeLabel = "Sustitución / Canibalización Crítica";
        badgeTone = "amber";
        prescription = "Alto solapamiento: diferenciar precios (AUR) o empaques para evitar auto-robo.";
      } else if (cannibalizationRate > 35) {
        regime = "partial";
        regimeLabel = "Canibalización Moderada";
        badgeTone = "blue";
        prescription = "Transición natural de portafolio; monitorear margen del SKU atacante vs víctima.";
      }

      totalGrossGain += grossGain;
      totalNpiGain += npiGain;
      totalInternalLoss += internalLoss;
      totalCannibalized += cannibalizedDollars;
      totalTrueIncremental += trueIncrementalDollars;

      return {
        ...g,
        skuCount: g.skus.length,
        attackerCount: activeAttackers.length,
        npiCount: npiSkus.length,
        victimCount: victims.length,
        totalTy,
        totalLy,
        grossGain,
        npiGain,
        internalLoss,
        cannibalizedDollars,
        trueIncrementalDollars,
        netEcosystemDelta,
        cannibalizationRate,
        incrementalQualityPct,
        topAttacker: activeAttackers[0] || null,
        topVictim: victims[0] || null,
        attackers: activeAttackers,
        victims,
        regime,
        regimeLabel,
        badgeTone,
        prescription
      };
    }).filter(g => g.grossGain > 0 || g.internalLoss > 0)
      .sort((a, b) => b.grossGain - a.grossGain || b.internalLoss - a.internalLoss);

    const portfolioCannibalizationRate = totalGrossGain > 0
      ? (totalCannibalized / totalGrossGain) * 100
      : 0;
    const portfolioIncrementalRate = totalGrossGain > 0
      ? (totalTrueIncremental / totalGrossGain) * 100
      : 0;

    const counts = {
      incremental: groups.filter(g => g.regime === "incremental").length,
      partial: groups.filter(g => g.regime === "partial").length,
      severe: groups.filter(g => g.regime === "severe").length,
      bleed: groups.filter(g => g.regime === "bleed").length
    };

    const visibleGroups = groups.filter(g => {
      const matchesRegime = regimeFilter === "Todos" || g.regime === regimeFilter;
      const matchesSearch = !searchTerm ||
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.topAttacker?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.topVictim?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRegime && matchesSearch;
    });

    const activeInspectedGroup =
      groups.find(g => g.key === selectedGroupKey) ||
      visibleGroups[0] ||
      groups[0] ||
      null;

    const chartData = groups.slice(0, 10).map(g => ({
      name: g.title.substring(0, 15),
      fullName: g.title,
      Incremental: Math.round(g.trueIncrementalDollars),
      Canibalizado: Math.round(g.cannibalizedDollars),
      BalanceNeto: Math.round(g.netEcosystemDelta),
      cannibPct: Number(g.cannibalizationRate.toFixed(1))
    }));

    return {
      groups: visibleGroups,
      allCount: groups.length,
      totalGrossGain,
      totalNpiGain,
      totalInternalLoss,
      totalCannibalized,
      totalTrueIncremental,
      portfolioCannibalizationRate,
      portfolioIncrementalRate,
      counts,
      chartData,
      activeInspectedGroup
    };
  }, [displayProducts, storeFilter, categoryFilter, groupDimension, analysisScope, regimeFilter, searchTerm, selectedGroupKey]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ToolHeader
        icon={GitMerge}
        iconColor="text-amber-500"
        title="Análisis de Canibalización vs. Crecimiento Incremental"
        subtitle="Audita cuánto del crecimiento de tus SKUs ganadores e innovaciones (NPIs) es dinero nuevo real para la categoría (Incremental) y cuánto proviene de robarle ventas a tus propios productos existentes (Canibalización)."
        t={t}
      >
        <ToolFilterSelect icon={Store} value={storeFilter} onChange={setStoreFilter} options={uniqueStores} allLabel="Todas las Tiendas" allValue="Todas" t={t} />
        <ToolFilterSelect icon={Filter} iconColor="text-emerald-400" value={categoryFilter} onChange={setCategoryFilter} options={uniqueCategories} allLabel="Todas las Categorías" allValue="Todas" t={t} />
      </ToolHeader>

      {/* BARRA DE CONFIGURACIÓN DEL ECOSISTEMA Y ENFOQUE */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${t.card}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest mr-1 ${t.textSub}`}>1. Ecosistema de Sustitución:</span>
          {[
            { id: 'category', label: 'Intra-Categoría (SKUs de la misma Categoría)' },
            { id: 'vendor', label: 'Intra-Suplidor (SKUs de la misma Marca)' },
            { id: 'cat_vendor', label: 'Marca dentro de Categoría' }
          ].map(dim => (
            <button
              key={dim.id}
              onClick={() => { setGroupDimension(dim.id); setSelectedGroupKey(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                groupDimension === dim.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : (isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
              }`}
            >
              {dim.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest mr-1 ${t.textSub}`}>2. Motor Atacante:</span>
          {[
            { id: 'all_growth', label: 'Todos los Ganadores (NPIs + SKUs Crecientes)' },
            { id: 'npi_only', label: 'Solo Lanzamientos Nuevos (NPIs LY=$0)' }
          ].map(sc => (
            <button
              key={sc.id}
              onClick={() => setAnalysisScope(sc.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                analysisScope === sc.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : (isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {cannibalizationAnalysis ? (
        <>
          {/* 5 TARJETAS KPI DE DESCOMPOSICIÓN INCREMENTAL VS CANIBALIZADO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <KpiStatCard
              label="1. Ganancia Bruta (Atacantes)"
              value={`+${formatCurrency(cannibalizationAnalysis.totalGrossGain)}`}
              valueColor="text-indigo-500"
              subtext={`Incluye ${formatCurrency(cannibalizationAnalysis.totalNpiGain)} de NPIs`}
              t={t}
            />
            <KpiStatCard
              label="2. Venta Canibalizada (Interna)"
              value={`-${formatCurrency(cannibalizationAnalysis.totalCannibalized)}`}
              valueColor="text-amber-500"
              subtext="Absorbida de SKUs hermanos en caída"
              t={t}
            />
            <KpiStatCard
              label="3. Crecimiento Incremental Real"
              value={`+${formatCurrency(cannibalizationAnalysis.totalTrueIncremental)}`}
              valueColor="text-emerald-500"
              subtext={`${cannibalizationAnalysis.portfolioIncrementalRate.toFixed(1)}% de calidad incremental`}
              highlightClass={isDarkMode ? 'bg-emerald-950/25 border-emerald-800/70' : 'bg-emerald-50/70 border-emerald-200'}
              t={t}
            />
            <KpiStatCard
              label="4. Tasa de Canibalización"
              value={`${cannibalizationAnalysis.portfolioCannibalizationRate.toFixed(1)}%`}
              valueColor={
                cannibalizationAnalysis.portfolioCannibalizationRate <= 35
                  ? 'text-emerald-500'
                  : cannibalizationAnalysis.portfolioCannibalizationRate <= 70
                  ? 'text-amber-500'
                  : 'text-rose-500'
              }
              subtext={
                cannibalizationAnalysis.portfolioCannibalizationRate <= 35
                  ? 'Nivel Saludable (<35%)'
                  : cannibalizationAnalysis.portfolioCannibalizationRate <= 70
                  ? 'Sustitución Moderada'
                  : 'Alerta de Auto-Robo (>70%)'
              }
              t={t}
            />
            <KpiStatCard
              label="5. Erosión Total de Víctimas"
              value={`-${formatCurrency(cannibalizationAnalysis.totalInternalLoss)}`}
              valueColor="text-rose-500"
              subtext={`En ${cannibalizationAnalysis.allCount} ecosistemas auditados`}
              t={t}
            />
          </div>

          {/* BOTONES DE FILTRO POR RÉGIMEN DE CANIBALIZACIÓN */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[
              { id: 'Todos', label: 'Todos los Grupos', count: cannibalizationAnalysis.allCount, badge: 'bg-indigo-500/15 text-indigo-500' },
              { id: 'incremental', label: 'Incremental Sólido (≤35%)', count: cannibalizationAnalysis.counts.incremental, badge: 'bg-emerald-500/15 text-emerald-500' },
              { id: 'partial', label: 'Canibalización Moderada', count: cannibalizationAnalysis.counts.partial, badge: 'bg-blue-500/15 text-blue-500' },
              { id: 'severe', label: 'Sustitución Crítica (>75%)', count: cannibalizationAnalysis.counts.severe, badge: 'bg-amber-500/15 text-amber-500' },
              { id: 'bleed', label: 'Fuga Neta de Categoría', count: cannibalizationAnalysis.counts.bleed, badge: 'bg-rose-500/15 text-rose-500' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRegimeFilter(tab.id)}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  regimeFilter === tab.id ? 'ring-2 ring-indigo-500 scale-[1.01]' : ''
                } ${t.card}`}
              >
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${tab.badge}`}>
                  {tab.label}
                </span>
                <span className={`text-2xl font-black mt-1.5 block ${t.textTitle}`}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* SECCIÓN GRÁFICA + INSPECTOR DE DUELO (ATACANTES VS VÍCTIMAS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Gráfica 1: Crecimiento Incremental Real vs Venta Canibalizada */}
            <div className={`p-6 rounded-2xl border lg:col-span-6 flex flex-col ${t.card}`}>
              <h3 className={`font-bold text-base mb-1 flex items-center gap-2 ${t.textTitle}`}>
                <BarChart3 className="w-5 h-5 text-emerald-500" /> Dinero Nuevo Incremental vs. Venta Canibalizada ($)
              </h3>
              <p className={`text-xs mb-4 ${t.textSub}`}>
                Verde = Expansión Incremental Real • Ámbar = Venta Robada a SKUs Hermanos
              </p>
              <div className="h-72 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={cannibalizationAnalysis.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                    <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fill: t.chartText, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                      contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '12px' }}
                      formatter={(val, name) => [formatCurrency(val), name]}
                    />
                    <Legend verticalAlign="top" height={32} iconType="circle" />
                    <Bar dataKey="Canibalizado" stackId="growth" name="Venta Canibalizada ($)" fill="#f59e0b" radius={[0, 0, 4, 4]} barSize={28} />
                    <Bar dataKey="Incremental" stackId="growth" name="Crecimiento Incremental Real ($)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inspector de Duelo de SKUs: Atacantes vs Víctimas en el Grupo Seleccionado */}
            <div className={`p-6 rounded-2xl border lg:col-span-6 flex flex-col ${t.card}`}>
              {cannibalizationAnalysis.activeInspectedGroup ? (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-slate-200/60 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block">
                        Radiografía de Transferencia Interna (Clic en la tabla inferior para cambiar)
                      </span>
                      <h3 className={`font-black text-base uppercase ${t.textTitle}`}>
                        {cannibalizationAnalysis.activeInspectedGroup.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-500">
                        Canibalización: {cannibalizationAnalysis.activeInspectedGroup.cannibalizationRate.toFixed(1)}%
                      </span>
                      <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-500">
                        Incremental: +{formatCurrency(cannibalizationAnalysis.activeInspectedGroup.trueIncrementalDollars)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                    {/* Columna SKUs Atacantes */}
                    <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-emerald-950/15 border-emerald-900/50' : 'bg-emerald-50/50 border-emerald-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" /> SKUs Atacantes (Ganan $)
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-500">
                          +{formatCurrency(cannibalizationAnalysis.activeInspectedGroup.grossGain)}
                        </span>
                      </div>
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {cannibalizationAnalysis.activeInspectedGroup.attackers.slice(0, 5).map((sku, idx) => (
                          <div key={idx} className={`p-2 rounded-lg border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <div className="flex items-center justify-between gap-1">
                              <span className={`font-bold truncate ${t.textTitle}`} title={sku.name}>{sku.name}</span>
                              {sku.isNpi && (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-indigo-500 text-white shrink-0">
                                  NPI
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-1 text-[10px] font-mono">
                              <span className={t.textSub}>AUR: {formatCurrency(sku.aur)}</span>
                              <span className="font-black text-emerald-500">+{formatCurrency(sku.delta)}</span>
                            </div>
                          </div>
                        ))}
                        {cannibalizationAnalysis.activeInspectedGroup.attackers.length === 0 && (
                          <p className={`text-xs italic py-6 text-center ${t.textSub}`}>Sin SKUs ganadores en este filtro.</p>
                        )}
                      </div>
                    </div>

                    {/* Columna SKUs Víctimas */}
                    <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-rose-950/15 border-rose-900/50' : 'bg-rose-50/50 border-rose-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1">
                          <ArrowDownRight className="w-3.5 h-3.5" /> SKUs Víctimas (Pierden $)
                        </span>
                        <span className="text-[10px] font-mono font-bold text-rose-500">
                          -{formatCurrency(cannibalizationAnalysis.activeInspectedGroup.internalLoss)}
                        </span>
                      </div>
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {cannibalizationAnalysis.activeInspectedGroup.victims.slice(0, 5).map((sku, idx) => (
                          <div key={idx} className={`p-2 rounded-lg border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <span className={`font-bold truncate block ${t.textTitle}`} title={sku.name}>{sku.name}</span>
                            <div className="flex justify-between items-center mt-1 text-[10px] font-mono">
                              <span className={t.textSub}>AUR: {formatCurrency(sku.aur)}</span>
                              <span className="font-black text-rose-500">{formatCurrency(sku.delta)}</span>
                            </div>
                          </div>
                        ))}
                        {cannibalizationAnalysis.activeInspectedGroup.victims.length === 0 && (
                          <p className="text-xs font-bold text-emerald-500 py-6 text-center">
                            ¡0% Canibalización! Ningún SKU hermano perdió ventas.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* TABLA MAESTRA DE AUDITORÍA DE CANIBALIZACIÓN E INCREMENTALIDAD */}
          <DataTable
            title={`Matriz de Calidad Incremental vs. Canibalización (${cannibalizationAnalysis.groups.length} ecosistemas)`}
            icon={GitMerge}
            iconColor="text-amber-500"
            t={t}
            isDarkMode={isDarkMode}
            rightHeader={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar categoría, marca o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs font-medium focus:outline-none ${t.input}`}
                />
              </div>
            }
            columns={[
              { label: 'Categoría / Ecosistema' },
              { label: 'Ganancia Bruta (+)', className: 'text-right' },
              { label: 'Pérdida Interna (-)', className: 'text-right' },
              { label: '% Canibalización vs Incremental', className: 'w-44 text-center' },
              { label: 'Dinero Nuevo Incremental', className: 'text-right' },
              { label: 'Diagnóstico & Acción Comercial' }
            ]}
            data={cannibalizationAnalysis.groups}
            renderRow={(row, idx) => {
              const isSelected = cannibalizationAnalysis.activeInspectedGroup?.key === row.key;
              return (
                <tr
                  key={`cannib_row_${idx}`}
                  onClick={() => setSelectedGroupKey(row.key)}
                  className={`cursor-pointer transition-colors ${isSelected ? t.rowSelected : t.rowBase}`}
                >
                  <td className="px-4 py-3.5">
                    <span className={`font-bold text-xs uppercase block ${t.textTitle}`}>{row.title}</span>
                    <span className={`text-[10px] font-mono ${t.textSub}`}>
                      {row.attackerCount} ganadores ({row.npiCount} NPIs) vs {row.victimCount} en caída
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <span className="font-mono font-black text-xs text-emerald-500 block">
                      +{formatCurrency(row.grossGain)}
                    </span>
                    {row.topAttacker && (
                      <span className={`text-[9px] truncate block max-w-[150px] ml-auto ${t.textSub}`} title={row.topAttacker.name}>
                        Líder: {row.topAttacker.name}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <span className="font-mono font-bold text-xs text-rose-500 block">
                      -{formatCurrency(row.internalLoss)}
                    </span>
                    {row.topVictim && (
                      <span className={`text-[9px] truncate block max-w-[150px] ml-auto ${t.textSub}`} title={row.topVictim.name}>
                        Víctima: {row.topVictim.name}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex justify-between items-center text-[10px] font-mono font-black mb-1">
                      <span className="text-amber-500">{row.cannibalizationRate.toFixed(0)}% Canib.</span>
                      <span className="text-emerald-500">{row.incrementalQualityPct.toFixed(0)}% Incr.</span>
                    </div>
                    <div className="w-full h-2.5 bg-emerald-500/30 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${Math.min(100, Math.max(0, row.cannibalizationRate))}%` }}
                      ></div>
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${Math.min(100, Math.max(0, row.incrementalQualityPct))}%` }}
                      ></div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <span className="font-mono font-black text-xs text-emerald-500 block">
                      +{formatCurrency(row.trueIncrementalDollars)}
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${row.netEcosystemDelta >= 0 ? 'text-indigo-400' : 'text-rose-500'}`}>
                      Neto Cat: {row.netEcosystemDelta >= 0 ? '+' : ''}{formatCurrency(row.netEcosystemDelta)}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full inline-block mb-1 ${
                      row.badgeTone === 'emerald'
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : row.badgeTone === 'blue'
                        ? 'bg-blue-500/15 text-blue-500'
                        : row.badgeTone === 'amber'
                        ? 'bg-amber-500/15 text-amber-500'
                        : 'bg-rose-500/15 text-rose-500'
                    }`}>
                      {row.regimeLabel}
                    </span>
                    <span className={`text-[11px] font-medium block ${t.textTitle}`}>
                      {row.prescription}
                    </span>
                  </td>
                </tr>
              );
            }}
          />
        </>
      ) : (
        <div className={`rounded-2xl p-12 text-center border-2 border-dashed ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
          <GitMerge className={`w-12 h-12 mx-auto mb-3 opacity-40 ${t.textSub}`} />
          <h3 className={`text-lg font-bold ${t.textTitle}`}>Sincroniza un archivo de ventas para auditar la Canibalización</h3>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            El motor comparará automáticamente los SKUs ganadores e innovaciones (NPIs) frente a los SKUs con pérdida dentro de cada categoría y suplidor.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * MÓDULO 5.9: FAIR SHARE — VENTAS VS. ESPACIO VISUAL (SPACE-TO-SALES EQUITY)
 * Compara visualmente el % de Ventas contra el % de Espacio en Góndola por Marca/Suplidor, Categoría,
 * Segmento o SKU, y calcula cuántos Pies Lineales (ft) y Caras (Facings JDA) debe ganar o ceder cada jugador.
 */
const FairShareVisualModule = ({ ctx }) => {
  const {
    displayProducts,
    uniqueStores,
    uniqueCategories,
    filterAndConsolidate,
    formatCurrency,
    formatNumber,
    t,
    isDarkMode,
    COLORS
  } = ctx;

  const [storeFilter, setStoreFilter] = useState("Todas");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [dimension, setDimension] = useState("vendor"); // 'vendor' | 'category' | 'segment' | 'sku'
  const [spaceBasis, setSpaceBasis] = useState("jda_width"); // 'jda_width' | 'inv_units' | 'sku_count'
  const [salesBasis, setSalesBasis] = useState("ty_dollars"); // 'ty_dollars' | 'ty_units'
  const [totalGondolaFeet, setTotalGondolaFeet] = useState(16);
  const [shelfLevels, setShelfLevels] = useState(5);
  const [statusFilter, setStatusFilter] = useState("Todos"); // 'Todos' | 'under_spaced' | 'aligned' | 'over_spaced'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntityKey, setSelectedEntityKey] = useState(null);

  const fairShareData = useMemo(() => {
    const consolidated = filterAndConsolidate({
      store: storeFilter,
      category: categoryFilter
    }).filter(p => (p.ty || 0) > 0 || (p.inv || 0) > 0 || (p.units || 0) > 0);

    if (consolidated.length === 0) return null;

    // 1. Agrupar según la dimensión elegida (Suplidor/Marca, Categoría, Segmento o Top SKUs)
    const groupMap = new Map();

    consolidated.forEach(p => {
      let key = "";
      let title = "";
      let subtitle = "";

      if (dimension === "vendor") {
        key = p.vendor && p.vendor !== "N/A" ? p.vendor : (p.brand || "NO ESPECIFICADO");
        title = key;
        subtitle = "Suplidor / Marca";
      } else if (dimension === "category") {
        key = p.category || "SIN CATEGORÍA";
        title = key;
        subtitle = "Categoría Comercial";
      } else if (dimension === "segment") {
        key = p.segment || p.subCategory || "GENERAL";
        title = key;
        subtitle = `Segmento (${p.category || 'Cat'})`;
      } else {
        key = p.upc || p.name;
        title = p.name;
        subtitle = `UPC: ${p.upc || 'N/A'} • ${p.vendor || ''}`;
      }

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          key,
          title,
          subtitle,
          ty: 0,
          ly: 0,
          units: 0,
          inv: 0,
          skuCount: 0,
          physicalInchesProxy: 0,
          widthSum: 0,
          skus: []
        });
      }

      const g = groupMap.get(key);
      const itemWidth = Number(p.width) > 0 ? Number(p.width) : 2.6;
      const itemDepth = Number(p.depth) > 0 ? Number(p.depth) : 2.6;
      const unitsPerFacingDeep = Math.max(2, Math.floor(18 / itemDepth));
      const estimatedFacings = Math.max(1, Math.ceil((p.inv || 1) / unitsPerFacingDeep));

      g.ty += p.ty || 0;
      g.ly += p.ly || 0;
      g.units += p.units || 0;
      g.inv += p.inv || 0;
      g.skuCount += 1;
      g.widthSum += itemWidth;
      // Pulgadas lineales estimadas combinando el inventario/capacidad con el ancho JDA del producto
      g.physicalInchesProxy += estimatedFacings * itemWidth;
      g.skus.push({ ...p, itemWidth, estimatedFacings });
    });

    let rawGroups = Array.from(groupMap.values());
    if (dimension === "sku") {
      rawGroups = rawGroups.sort((a, b) => b.ty - a.ty).slice(0, 30);
    }

    const totalSalesMetric = rawGroups.reduce((s, g) => s + (salesBasis === "ty_dollars" ? g.ty : g.units), 0);
    const totalSpaceMetric = rawGroups.reduce((s, g) => {
      if (spaceBasis === "jda_width") return s + g.physicalInchesProxy;
      if (spaceBasis === "inv_units") return s + g.inv;
      return s + g.skuCount;
    }, 0);

    if (totalSalesMetric <= 0 || totalSpaceMetric <= 0) return null;

    const totalLinearFeetCapacity = Math.max(4, Number(totalGondolaFeet) || 16);
    const totalShelfLinearInches = totalLinearFeetCapacity * 12 * Math.max(1, shelfLevels);

    let totalMisallocatedPct = 0;
    let totalRevenueOpportunity = 0;

    const entities = rawGroups.map((g, idx) => {
      const salesVal = salesBasis === "ty_dollars" ? g.ty : g.units;
      const spaceVal = spaceBasis === "jda_width"
        ? g.physicalInchesProxy
        : (spaceBasis === "inv_units" ? g.inv : g.skuCount);

      const shareSales = (salesVal / totalSalesMetric) * 100;
      const shareSpace = (spaceVal / totalSpaceMetric) * 100;
      const gapPct = shareSales - shareSpace; // Positivo = merece más espacio; Negativo = tiene exceso de espacio
      const fairShareIndex = shareSpace > 0 ? (shareSales / shareSpace) : (shareSales > 0 ? 2.0 : 1.0);

      const avgWidth = g.skuCount > 0 ? (g.widthSum / g.skuCount) : 2.6;

      // Traducción a Pies Lineales de Góndola y Caras (Facings)
      const currentFeet = (shareSpace / 100) * totalLinearFeetCapacity;
      const targetFairFeet = (shareSales / 100) * totalLinearFeetCapacity;
      const deltaFeet = targetFairFeet - currentFeet;

      const currentInchesTotal = (shareSpace / 100) * totalShelfLinearInches;
      const targetInchesTotal = (shareSales / 100) * totalShelfLinearInches;
      const currentFacings = Math.max(1, Math.round(currentInchesTotal / avgWidth));
      const targetFacings = Math.max(1, Math.round(targetInchesTotal / avgWidth));
      const deltaFacings = targetFacings - currentFacings;

      const growthYoY = g.ly > 0 ? ((g.ty / g.ly) - 1) * 100 : (g.ty > 0 ? 100 : 0);

      // Estimación conservadora de venta incremental al corregir sub-espacio (elasticidad de espacio ~0.22)
      const spaceLiftPotential = gapPct > 1.5
        ? g.ty * ((gapPct / Math.max(shareSpace, 2)) * 0.18)
        : 0;

      totalMisallocatedPct += Math.abs(gapPct) / 2;
      totalRevenueOpportunity += spaceLiftPotential;

      let status = "aligned";
      let statusLabel = "En Equilibrio (Fair Share)";
      let badgeTone = "blue";
      let actionRecommendation = "Mantener espacio actual en góndola";

      if (fairShareIndex >= 1.15 && gapPct >= 1.0) {
        status = "under_spaced";
        statusLabel = "Sub-Espaciado (Merece +Espacio)";
        badgeTone = "emerald";
        actionRecommendation = `Expandir +${deltaFeet.toFixed(1)} ft (+${Math.max(1, deltaFacings)} caras)`;
      } else if (fairShareIndex <= 0.85 && gapPct <= -1.0) {
        status = "over_spaced";
        statusLabel = "Sobre-Espaciado (Ceder Espacio)";
        badgeTone = "rose";
        actionRecommendation = `Reducir ${deltaFeet.toFixed(1)} ft (${deltaFacings} caras)`;
      }

      return {
        ...g,
        color: COLORS[idx % COLORS.length],
        avgWidth,
        shareSales,
        shareSpace,
        gapPct,
        fairShareIndex,
        currentFeet,
        targetFairFeet,
        deltaFeet,
        currentFacings,
        targetFacings,
        deltaFacings,
        growthYoY,
        spaceLiftPotential,
        status,
        statusLabel,
        badgeTone,
        actionRecommendation,
        topSkus: [...g.skus].sort((a, b) => (b.ty || 0) - (a.ty || 0)).slice(0, 6)
      };
    }).sort((a, b) => b.shareSales - a.shareSales);

    // Asignar colores consistentes a los Top jugadores luego de ordenar
    entities.forEach((e, idx) => {
      e.color = COLORS[idx % COLORS.length];
    });

    const alignmentScore = Math.max(0, Math.min(100, 100 - totalMisallocatedPct));

    const counts = {
      under_spaced: entities.filter(e => e.status === "under_spaced").length,
      aligned: entities.filter(e => e.status === "aligned").length,
      over_spaced: entities.filter(e => e.status === "over_spaced").length
    };

    const visibleEntities = entities.filter(e => {
      const matchesStatus = statusFilter === "Todos" || e.status === statusFilter;
      const matchesSearch = !searchTerm ||
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    // Top 8 + "Otros" para la cinta visual de góndola 100%
    const topRibbonItems = entities.slice(0, 8);
    const otherEntities = entities.slice(8);
    const ribbonSegments = [...topRibbonItems];
    if (otherEntities.length > 0) {
      ribbonSegments.push({
        key: "__OTHERS__",
        title: `Otros (${otherEntities.length})`,
        color: "#64748b",
        shareSales: otherEntities.reduce((s, x) => s + x.shareSales, 0),
        shareSpace: otherEntities.reduce((s, x) => s + x.shareSpace, 0),
        currentFeet: otherEntities.reduce((s, x) => s + x.currentFeet, 0),
        targetFairFeet: otherEntities.reduce((s, x) => s + x.targetFairFeet, 0)
      });
    }

    const chartData = entities.slice(0, 10).map(e => ({
      name: e.title.substring(0, 14),
      fullName: e.title,
      ShareVentas: Number(e.shareSales.toFixed(1)),
      ShareEspacio: Number(e.shareSpace.toFixed(1)),
      IndiceFairShare: Number(e.fairShareIndex.toFixed(2)),
      DeltaPies: Number(e.deltaFeet.toFixed(2))
    }));

    const activeInspected =
      entities.find(e => e.key === selectedEntityKey) ||
      visibleEntities[0] ||
      entities[0] ||
      null;

    return {
      entities: visibleEntities,
      allEntities: entities,
      allCount: entities.length,
      alignmentScore,
      totalMisallocatedPct,
      totalRevenueOpportunity,
      totalLinearFeetCapacity,
      counts,
      ribbonSegments,
      chartData,
      activeInspected
    };
  }, [displayProducts, storeFilter, categoryFilter, dimension, spaceBasis, salesBasis, totalGondolaFeet, shelfLevels, statusFilter, searchTerm, selectedEntityKey]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ToolHeader
        icon={LayoutTemplate}
        iconColor="text-indigo-500"
        title="Fair Share: Ventas vs. Espacio Visual en Góndola"
        subtitle="Audita si el espacio visual que ocupa cada Marca, Categoría o SKU en la góndola corresponde de forma justa (Fair Share 1:1) con las ventas que genera, y calcula cuántos pies lineales y caras (facings) debes reasignar."
        t={t}
      >
        <ToolFilterSelect icon={Store} value={storeFilter} onChange={setStoreFilter} options={uniqueStores} allLabel="Todas las Tiendas" allValue="Todas" t={t} />
        <ToolFilterSelect icon={Filter} iconColor="text-emerald-400" value={categoryFilter} onChange={setCategoryFilter} options={uniqueCategories} allLabel="Todas las Categorías" allValue="Todas" t={t} />
      </ToolHeader>

      {/* PANEL DE CONTROL: DIMENSIÓN, MÉTRICA DE ESPACIO Y PIETAJE DE GÓNDOLA */}
      <div className={`p-5 rounded-3xl border mb-6 grid grid-cols-1 lg:grid-cols-12 gap-6 ${t.card}`}>
        {/* 1. Dimensión y Base de Espacio */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${t.textSub}`}>
              1. Nivel de Auditoría Fair Share:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'vendor', label: 'Por Marca / Suplidor', icon: Users },
                { id: 'category', label: 'Por Categoría', icon: Layers },
                { id: 'segment', label: 'Por Segmento', icon: Tag },
                { id: 'sku', label: 'Top 30 SKUs', icon: Package }
              ].map(dim => {
                const DimIcon = dim.icon;
                return (
                  <button
                    key={dim.id}
                    type="button"
                    onClick={() => { setDimension(dim.id); setSelectedEntityKey(null); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      dimension === dim.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : t.cardHover
                    }`}
                  >
                    <DimIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{dim.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <div>
              <span className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${t.textSub}`}>
                2. Medición del Espacio Visual Actual:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'jda_width', label: 'Ancho Físico JDA (Width" × Caras)' },
                  { id: 'inv_units', label: 'Capacidad / Stock (Unidades)' },
                  { id: 'sku_count', label: 'Variedad (# SKUs)' }
                ].map(sb => (
                  <button
                    key={sb.id}
                    type="button"
                    onClick={() => setSpaceBasis(sb.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                      spaceBasis === sb.id
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : t.card
                    }`}
                  >
                    {sb.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${t.textSub}`}>
                3. Base de Demanda (Share Ventas):
              </span>
              <div className="flex gap-1.5">
                {[
                  { id: 'ty_dollars', label: 'Ventas en Dólares ($ TY)' },
                  { id: 'ty_units', label: 'Volumen Unidades (TY Units)' }
                ].map(sl => (
                  <button
                    key={sl.id}
                    type="button"
                    onClick={() => setSalesBasis(sl.id)}
                    className={`flex-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                      salesBasis === sl.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : t.card
                    }`}
                  >
                    {sl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Selector de Pietaje de Góndola y Niveles */}
        <div className={`lg:col-span-5 p-4 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-indigo-50/40 border-indigo-100'}`}>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                4. Pietaje Total de Góndola a Repartir (Space Planning)
              </span>
              <span className="text-xs font-mono font-black text-indigo-500">
                {totalGondolaFeet} ft ({totalGondolaFeet * 12}")
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {[4, 8, 12, 16, 20, 24, 32].map(ft => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setTotalGondolaFeet(ft)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
                    Number(totalGondolaFeet) === ft
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : t.card
                  }`}
                >
                  {ft} ft
                </button>
              ))}
              <input
                type="number"
                min="4"
                max="120"
                value={totalGondolaFeet}
                onChange={(e) => setTotalGondolaFeet(Math.max(4, Number(e.target.value) || 4))}
                className={`w-16 px-2 py-1 text-center rounded-lg border text-xs font-mono font-black focus:outline-none ${t.input}`}
                title="Pies lineales manuales"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800">
            <span className={`text-[11px] font-bold ${t.textSub}`}>Tablillas / Niveles por Sección:</span>
            <div className="flex gap-1.5">
              {[3, 4, 5, 6].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setShelfLevels(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
                    shelfLevels === lvl
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : t.card
                  }`}
                >
                  {lvl} Niveles
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {fairShareData ? (
        <>
          {/* 4 TARJETAS KPI DE EQUIDAD DE ESPACIO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiStatCard
              label="1. Índice de Equidad Visual"
              value={`${fairShareData.alignmentScore.toFixed(1)}%`}
              valueColor={fairShareData.alignmentScore >= 80 ? 'text-emerald-500' : fairShareData.alignmentScore >= 65 ? 'text-amber-500' : 'text-rose-500'}
              subtext={`Desviación de espacio: ${fairShareData.totalMisallocatedPct.toFixed(1)}%`}
              t={t}
            />
            <KpiStatCard
              label="2. Sub-Espaciados (Ganadores)"
              value={`${fairShareData.counts.under_spaced}`}
              valueColor="text-emerald-500"
              subtext="Generan más % ventas que el % de góndola asignado"
              t={t}
            />
            <KpiStatCard
              label="3. Sobre-Espaciados (Donantes)"
              value={`${fairShareData.counts.over_spaced}`}
              valueColor="text-rose-500"
              subtext="Acaparan más góndola de lo que justifican sus ventas"
              t={t}
            />
            <KpiStatCard
              label="4. Potencial por Rebalanceo"
              value={`+${formatCurrency(fairShareData.totalRevenueOpportunity)}`}
              valueColor="text-indigo-500"
              subtext={`Al alinear la góndola de ${fairShareData.totalLinearFeetCapacity} ft al Fair Share`}
              highlightClass={isDarkMode ? 'bg-indigo-950/25 border-indigo-800/70' : 'bg-indigo-50/70 border-indigo-200'}
              t={t}
            />
          </div>

          {/* COMPARADOR VISUAL DE GÓNDOLA: CINTA DE VENTAS VS CINTA DE ESPACIO ACTUAL VS GÓNDOLA FAIR SHARE */}
          <div className={`p-6 rounded-3xl border mb-6 shadow-sm ${t.card}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500">
                  Radiografía Visual de Góndola ({fairShareData.totalLinearFeetCapacity} Pies Lineales)
                </span>
                <h3 className={`text-lg font-black mt-1 ${t.textTitle}`}>
                  Comparativa Directa: % Aporte de Ventas vs. % Espacio Visual Actual
                </h3>
              </div>
              <p className={`text-xs ${t.textSub}`}>
                Haz clic en cualquier bloque de color para inspeccionar su plan de ajuste de caras
              </p>
            </div>

            <div className="space-y-5">
              {/* Cinta 1: Share de Ventas (Lo que pide el Shopper / Fair Share Ideal) */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-1.5 text-emerald-500">
                    <DollarSign className="w-4 h-4" /> A. PARTICIPACIÓN DE VENTAS (ESPACIO IDEAL FAIR SHARE 1:1)
                  </span>
                  <span className={`font-mono ${t.textSub}`}>Meta: 100% ({fairShareData.totalLinearFeetCapacity} ft)</span>
                </div>
                <div className="w-full h-11 rounded-2xl overflow-hidden flex border border-slate-300 dark:border-slate-700 shadow-inner">
                  {fairShareData.ribbonSegments.map((seg, idx) => (
                    <div
                      key={`sales_rib_${idx}`}
                      onClick={() => seg.key !== "__OTHERS__" && setSelectedEntityKey(seg.key)}
                      style={{
                        width: `${Math.max(1.5, seg.shareSales)}%`,
                        backgroundColor: seg.color
                      }}
                      title={`${seg.title}: ${seg.shareSales.toFixed(1)}% Ventas -> Merece ${seg.targetFairFeet.toFixed(1)} ft`}
                      className="h-full flex flex-col items-center justify-center px-1 text-white border-r border-white/20 cursor-pointer hover:brightness-110 transition-all overflow-hidden"
                    >
                      {seg.shareSales >= 6 && (
                        <>
                          <span className="text-[10px] font-black truncate max-w-full leading-tight">
                            {seg.title}
                          </span>
                          <span className="text-[9px] font-mono font-bold opacity-90 leading-none">
                            {seg.shareSales.toFixed(1)}% ({seg.targetFairFeet.toFixed(1)}ft)
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cinta 2: Share de Espacio Visual Actual */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-1.5 text-indigo-500">
                    <LayoutTemplate className="w-4 h-4" /> B. ESPACIO VISUAL ACTUAL EN GÓNDOLA (% SHARE OF SPACE)
                  </span>
                  <span className={`font-mono ${t.textSub}`}>Actual: 100% ({fairShareData.totalLinearFeetCapacity} ft)</span>
                </div>
                <div className="w-full h-11 rounded-2xl overflow-hidden flex border border-slate-300 dark:border-slate-700 shadow-inner">
                  {fairShareData.ribbonSegments.map((seg, idx) => (
                    <div
                      key={`space_rib_${idx}`}
                      onClick={() => seg.key !== "__OTHERS__" && setSelectedEntityKey(seg.key)}
                      style={{
                        width: `${Math.max(1.5, seg.shareSpace)}%`,
                        backgroundColor: seg.color
                      }}
                      title={`${seg.title}: ${seg.shareSpace.toFixed(1)}% Espacio Actual (${seg.currentFeet.toFixed(1)} ft)`}
                      className="h-full flex flex-col items-center justify-center px-1 text-white border-r border-white/20 cursor-pointer hover:brightness-110 transition-all overflow-hidden opacity-90"
                    >
                      {seg.shareSpace >= 6 && (
                        <>
                          <span className="text-[10px] font-black truncate max-w-full leading-tight">
                            {seg.title}
                          </span>
                          <span className="text-[9px] font-mono font-bold opacity-90 leading-none">
                            {seg.shareSpace.toFixed(1)}% ({seg.currentFeet.toFixed(1)}ft)
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Leyenda interactiva con brecha de pies lineales */}
              <div className="flex flex-wrap gap-2 pt-2">
                {fairShareData.ribbonSegments.map((seg, idx) => {
                  const diffFeet = seg.targetFairFeet - seg.currentFeet;
                  return (
                    <button
                      key={`leg_${idx}`}
                      type="button"
                      onClick={() => seg.key !== "__OTHERS__" && setSelectedEntityKey(seg.key)}
                      className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                        fairShareData.activeInspected?.key === seg.key ? 'ring-2 ring-indigo-500' : ''
                      } ${t.card}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                      <span className={`truncate max-w-[120px] ${t.textTitle}`}>{seg.title}</span>
                      <span className={`font-mono text-[10px] font-black ${
                        Math.abs(diffFeet) < 0.2 ? t.textSub : diffFeet > 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        ({diffFeet >= 0 ? '+' : ''}{diffFeet.toFixed(1)}ft)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FILTROS RÁPIDOS POR ESTATUS DE EQUIDAD */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { id: 'Todos', label: 'Todos los Jugadores', count: fairShareData.allCount, badge: 'bg-indigo-500/15 text-indigo-500' },
              { id: 'under_spaced', label: 'Sub-Espaciados (Expandir Góndola)', count: fairShareData.counts.under_spaced, badge: 'bg-emerald-500/15 text-emerald-500' },
              { id: 'aligned', label: 'En Fair Share (Equilibrados)', count: fairShareData.counts.aligned, badge: 'bg-blue-500/15 text-blue-500' },
              { id: 'over_spaced', label: 'Sobre-Espaciados (Reducir Góndola)', count: fairShareData.counts.over_spaced, badge: 'bg-rose-500/15 text-rose-500' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  statusFilter === tab.id ? 'ring-2 ring-indigo-500 scale-[1.01]' : ''
                } ${t.card}`}
              >
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${tab.badge}`}>
                  {tab.label}
                </span>
                <span className={`text-2xl font-black mt-1.5 block ${t.textTitle}`}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* GRÁFICA COMPARATIVA + INSPECTOR DE AJUSTE DE PIES Y CARAS JDA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <div className={`p-6 rounded-2xl border lg:col-span-7 flex flex-col ${t.card}`}>
              <h3 className={`font-bold text-base mb-1 flex items-center gap-2 ${t.textTitle}`}>
                <BarChart3 className="w-5 h-5 text-indigo-500" /> % Share de Ventas vs. % Share de Espacio Visual (Top 10)
              </h3>
              <p className={`text-xs mb-4 ${t.textSub}`}>
                Cuando la barra Verde (% Ventas) supera la Gris (% Espacio), la marca merece ganar pies lineales en góndola
              </p>
              <div className="h-72 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={fairShareData.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                    <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fill: t.chartText, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" unit="%" tick={{ fill: t.chartText, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 'dataMax + 0.5']} hide />
                    <Tooltip
                      cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                      contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '12px' }}
                      formatter={(val, name) => name.includes('Índice') ? [`${val}x`, name] : [`${val}%`, name]}
                    />
                    <Legend verticalAlign="top" height={32} iconType="circle" />
                    <Bar yAxisId="left" dataKey="ShareVentas" name="% Share Ventas (Demanda)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar yAxisId="left" dataKey="ShareEspacio" name="% Share Espacio Actual" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                    <Line yAxisId="right" type="monotone" dataKey="IndiceFairShare" name="Índice Fair Share (Ventas/Espacio)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inspector de Prescripción Física JDA */}
            <div className={`p-6 rounded-2xl border lg:col-span-5 flex flex-col justify-between ${t.card}`}>
              {fairShareData.activeInspected ? (
                <>
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">
                          Prescripción de Espacio Físico (Clic en la tabla para cambiar)
                        </span>
                        <h3 className={`font-black text-lg uppercase mt-0.5 ${t.textTitle}`}>
                          {fairShareData.activeInspected.title}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${
                        fairShareData.activeInspected.badgeTone === 'emerald'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : fairShareData.activeInspected.badgeTone === 'rose'
                          ? 'bg-rose-500/15 text-rose-500'
                          : 'bg-blue-500/15 text-blue-500'
                      }`}>
                        Índice: {fairShareData.activeInspected.fairShareIndex.toFixed(2)}x
                      </span>
                    </div>

                    {/* Comparativa Actual vs Fair Share Ideal en Pies y Caras */}
                    <div className="grid grid-cols-3 gap-2.5 my-4">
                      <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <span className={`text-[9px] font-bold uppercase block ${t.textSub}`}>Espacio Actual</span>
                        <span className={`text-base font-mono font-black block mt-0.5 ${t.textTitle}`}>
                          {fairShareData.activeInspected.currentFeet.toFixed(1)} ft
                        </span>
                        <span className={`text-[10px] font-mono ${t.textSub}`}>
                          ~{fairShareData.activeInspected.currentFacings} caras
                        </span>
                      </div>

                      <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-indigo-950/30 border-indigo-800/60' : 'bg-indigo-50 border-indigo-200'}`}>
                        <span className="text-[9px] font-bold uppercase block text-indigo-500">Meta Fair Share</span>
                        <span className="text-base font-mono font-black block mt-0.5 text-indigo-500">
                          {fairShareData.activeInspected.targetFairFeet.toFixed(1)} ft
                        </span>
                        <span className="text-[10px] font-mono text-indigo-400">
                          ~{fairShareData.activeInspected.targetFacings} caras
                        </span>
                      </div>

                      <div className={`p-3 rounded-xl border ${
                        fairShareData.activeInspected.deltaFeet >= 0
                          ? (isDarkMode ? 'bg-emerald-950/30 border-emerald-800/60' : 'bg-emerald-50 border-emerald-200')
                          : (isDarkMode ? 'bg-rose-950/30 border-rose-800/60' : 'bg-rose-50 border-rose-200')
                      }`}>
                        <span className={`text-[9px] font-bold uppercase block ${fairShareData.activeInspected.deltaFeet >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          Ajuste Sugerido
                        </span>
                        <span className={`text-base font-mono font-black block mt-0.5 ${fairShareData.activeInspected.deltaFeet >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {fairShareData.activeInspected.deltaFeet >= 0 ? '+' : ''}{fairShareData.activeInspected.deltaFeet.toFixed(1)} ft
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${fairShareData.activeInspected.deltaFacings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {fairShareData.activeInspected.deltaFacings >= 0 ? '+' : ''}{fairShareData.activeInspected.deltaFacings} caras
                        </span>
                      </div>
                    </div>

                    {/* Top SKUs de esta Marca/Categoría para dar o quitar caras */}
                    <span className={`text-[10px] font-black uppercase tracking-wider block mb-2 ${t.textSub}`}>
                      SKUs Principales a Ajustar en Góndola (Ancho JDA Prom: {fairShareData.activeInspected.avgWidth.toFixed(1)}"):
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {fairShareData.activeInspected.topSkus.map((sku, sIdx) => (
                        <div key={sIdx} className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="min-w-0">
                            <span className={`font-bold truncate block ${t.textTitle}`}>{sIdx + 1}. {sku.name}</span>
                            <span className={`text-[10px] font-mono ${t.textSub}`}>
                              Ancho JDA: {sku.itemWidth.toFixed(1)}" • Stock: {formatNumber(sku.inv)}u
                            </span>
                          </div>
                          <span className="font-mono font-black text-xs text-emerald-500 shrink-0">
                            {formatCurrency(sku.ty)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`mt-4 p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                    fairShareData.activeInspected.badgeTone === 'emerald'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : fairShareData.activeInspected.badgeTone === 'rose'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                  }`}>
                    <span>Acción: {fairShareData.activeInspected.actionRecommendation}</span>
                    {fairShareData.activeInspected.spaceLiftPotential > 0 && (
                      <span className="font-mono font-black">
                        Lift Est: +{formatCurrency(fairShareData.activeInspected.spaceLiftPotential)}
                      </span>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* TABLA MAESTRA DE FAIR SHARE (VENTAS VS ESPACIO VISUAL) */}
          <DataTable
            title={`Matriz Prescriptiva Fair Share: Ventas vs. Espacio Visual (${fairShareData.entities.length} registros)`}
            icon={LayoutTemplate}
            iconColor="text-indigo-500"
            t={t}
            isDarkMode={isDarkMode}
            rightHeader={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar marca, categoría o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs font-medium focus:outline-none ${t.input}`}
                />
              </div>
            }
            columns={[
              { label: 'Jugador (Marca / Categoría / SKU)' },
              { label: 'Ventas TY ($)', className: 'text-right' },
              { label: '% Ventas vs % Espacio Visual', className: 'w-52 text-center' },
              { label: 'Brecha (% Gap)', className: 'text-right' },
              { label: 'Índice Fair Share', className: 'text-center' },
              { label: `Góndola Actual vs Ideal (${fairShareData.totalLinearFeetCapacity}ft)`, className: 'text-right' },
              { label: 'Diagnóstico & Ajuste de Caras' }
            ]}
            data={fairShareData.entities}
            renderRow={(row, idx) => {
              const isSelected = fairShareData.activeInspected?.key === row.key;
              return (
                <tr
                  key={`fs_row_${idx}`}
                  onClick={() => setSelectedEntityKey(row.key)}
                  className={`cursor-pointer transition-colors ${isSelected ? t.rowSelected : t.rowBase}`}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: row.color }}></span>
                      <div>
                        <span className={`font-bold text-xs uppercase block ${t.textTitle}`}>{row.title}</span>
                        <span className={`text-[10px] font-mono ${t.textSub}`}>
                          {row.subtitle} • {row.skuCount} SKUs • Ancho Prom: {row.avgWidth.toFixed(1)}"
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <span className={`font-mono font-black text-xs block ${t.textTitle}`}>{formatCurrency(row.ty)}</span>
                    <span className={`text-[10px] font-mono font-bold ${row.growthYoY >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {row.growthYoY >= 0 ? '+' : ''}{row.growthYoY.toFixed(1)}% YoY
                    </span>
                  </td>

                  {/* Doble Barra Visual: Verde = % Ventas | Indigo = % Espacio */}
                  <td className="px-4 py-3.5">
                    <div className="space-y-1">
                      <div>
                        <div className="flex justify-between text-[9px] font-mono font-bold text-emerald-500">
                          <span>Ventas</span>
                          <span>{row.shareSales.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.max(2, row.shareSales))}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] font-mono font-bold text-indigo-400">
                          <span>Espacio</span>
                          <span>{row.shareSpace.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, Math.max(2, row.shareSpace))}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <span className={`font-mono font-black text-xs block ${
                      Math.abs(row.gapPct) < 1 ? t.textSub : row.gapPct > 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {row.gapPct >= 0 ? '+' : ''}{row.gapPct.toFixed(1)} pts
                    </span>
                    <span className={`text-[10px] font-mono ${t.textSub}`}>
                      {row.gapPct >= 0 ? 'Sub-espaciado' : 'Sobre-espaciado'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <span className={`font-mono font-black text-sm px-2.5 py-1 rounded-xl ${
                      row.fairShareIndex >= 1.15
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : row.fairShareIndex <= 0.85
                        ? 'bg-rose-500/15 text-rose-500'
                        : 'bg-blue-500/15 text-blue-500'
                    }`}>
                      {row.fairShareIndex.toFixed(2)}x
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <span className={`font-mono text-xs font-bold block ${t.textTitle}`}>
                      {row.currentFeet.toFixed(1)} ft → <strong className="text-indigo-500">{row.targetFairFeet.toFixed(1)} ft</strong>
                    </span>
                    <span className={`text-[10px] font-mono font-black ${
                      Math.abs(row.deltaFeet) < 0.2 ? t.textSub : row.deltaFeet > 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {row.deltaFeet >= 0 ? '+' : ''}{row.deltaFeet.toFixed(1)} ft ({row.deltaFacings >= 0 ? '+' : ''}{row.deltaFacings} caras)
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full inline-block mb-1 ${
                      row.badgeTone === 'emerald'
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : row.badgeTone === 'rose'
                        ? 'bg-rose-500/15 text-rose-500'
                        : 'bg-blue-500/15 text-blue-500'
                    }`}>
                      {row.statusLabel}
                    </span>
                    <span className={`text-[11px] font-bold block ${t.textTitle}`}>
                      {row.actionRecommendation}
                    </span>
                  </td>
                </tr>
              );
            }}
          />
        </>
      ) : (
        <div className={`rounded-2xl p-12 text-center border-2 border-dashed ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
          <LayoutTemplate className={`w-12 h-12 mx-auto mb-3 opacity-40 ${t.textSub}`} />
          <h3 className={`text-lg font-bold ${t.textTitle}`}>Sincroniza un archivo de ventas para activar el Fair Share Visual</h3>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            El módulo comparará automáticamente el % de Ventas frente al % de Espacio Visual en Góndola y calculará cuántas caras y pies lineales merece cada marca o categoría.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * MÓDULO 6.1: CENTRO DE EXPORTACIÓN Y GENERADOR DE DOSSIER EJECUTIVO EN PDF
 * Consolida automáticamente todas las pestañas del dashboard en un reporte PDF multipágina bien organizado.
 */
const ExecutivePdfReportModule = ({ ctx }) => {
  const {
    displayProducts,
    uniqueStores,
    uniqueCategories,
    filterAndConsolidate,
    getRegionAndTownForStore,
    formatCurrency,
    formatNumber,
    t,
    isDarkMode
  } = ctx;

  const [reportTitle, setReportTitle] = useState("Dossier Ejecutivo de Inteligencia Retail & RGM");
  const [reportSubtitle, setReportSubtitle] = useState("Auditoría Integral de Ventas, Precios, Inventario, Suplidores y Surtido — Puerto Rico");
  const [preparedBy, setPreparedBy] = useState("Dirección Comercial & Category Management");
  const [storeFilter, setStoreFilter] = useState("Todas");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [assumedMarginPct, setAssumedMarginPct] = useState(30);
  const [forecastGrowthPct, setForecastGrowthPct] = useState(5);
  const [includePdfCharts, setIncludePdfCharts] = useState(true);
  const [customNotes, setCustomNotes] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfEngineReady, setPdfEngineReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Capítulos seleccionables para organizar el PDF
  const [sections, setSections] = useState({
    execSummary: true,
    visualCharts: true,
    pvmBridge: true,
    leaderboard: true,
    pareto: true,
    health360: true,
    territorialMap: true,
    storeClustering: true,
    vendorScorecard: true,
    pricingElasticity: true,
    gmroiFinance: true,
    forecastSop: true,
    dosInventory: true,
    assortmentSpace: true
  });

  // Cargar librerías jsPDF y jsPDF-AutoTable para generación nativa de vectores en PDF
  useEffect(() => {
    const loadPdfLibraries = async () => {
      if (window.jspdf && window.jspdf.jsPDF) {
        setPdfEngineReady(true);
        return;
      }
      try {
        await new Promise((resolve, reject) => {
          const s1 = document.createElement('script');
          s1.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          s1.onload = resolve;
          s1.onerror = reject;
          document.body.appendChild(s1);
        });
        await new Promise((resolve, reject) => {
          const s2 = document.createElement('script');
          s2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js";
          s2.onload = resolve;
          s2.onerror = reject;
          document.body.appendChild(s2);
        });
        setPdfEngineReady(true);
      } catch (e) {
        console.error("Error cargando motor PDF:", e);
      }
    };
    loadPdfLibraries();
  }, []);

  const masterReport = useMemo(() => {
    const rawFiltered = (displayProducts || []).filter(p =>
      (storeFilter === "Todas" || p.store === storeFilter) &&
      (categoryFilter === "Todas" || p.category === categoryFilter)
    );

    const consolidatedSkus = filterAndConsolidate({
      store: storeFilter,
      category: categoryFilter
    });

    if (consolidatedSkus.length === 0) return null;

    // 1. KPIs Globales
    const totalTy = consolidatedSkus.reduce((s, p) => s + (p.ty || 0), 0);
    const totalLy = consolidatedSkus.reduce((s, p) => s + (p.ly || 0), 0);
    const totalDelta = totalTy - totalLy;
    const totalGrowthPct = totalLy > 0 ? ((totalTy / totalLy) - 1) * 100 : (totalTy > 0 ? 100 : 0);
    const totalUnits = consolidatedSkus.reduce((s, p) => s + (p.units || 0), 0);
    const totalInv = consolidatedSkus.reduce((s, p) => s + (p.inv || 0), 0);
    const avgAur = totalUnits > 0 ? totalTy / totalUnits : 0;
    const activeStoresSet = new Set(rawFiltered.map(p => p.store).filter(Boolean));
    const activeCategoriesSet = new Set(consolidatedSkus.map(p => p.category).filter(Boolean));
    const activeVendorsSet = new Set(consolidatedSkus.map(p => p.vendor).filter(Boolean));

    // 2. Puente PVM (Precio vs Volumen vs Mix vs Innovación)
    let npiSales = 0;
    let dropSales = 0;
    let compTy = 0, compLy = 0, compQ1 = 0, compQ0 = 0;
    const pvmSkus = consolidatedSkus.map(p => {
      const ty = p.ty || 0;
      const ly = p.ly || 0;
      const q1 = p.units > 0 ? p.units : (ty > 0 ? Math.max(1, Math.round(ty / 8.5)) : 0);
      const curAur = q1 > 0 && ty > 0 ? ty / q1 : 8.5;
      const q0 = p.lyUnits > 0 ? p.lyUnits : (ly > 0 ? Math.max(1, Math.round(ly / (curAur / 1.035))) : 0);
      const isNpi = ly <= 0 && ty > 0;
      const isDrop = ly > 0 && ty <= 0;
      const isComp = ly > 0 && ty > 0 && q0 > 0 && q1 > 0;

      if (isNpi) npiSales += ty;
      else if (isDrop) dropSales -= ly;
      else if (isComp) {
        compTy += ty; compLy += ly; compQ1 += q1; compQ0 += q0;
      }
      return { ...p, ty, ly, q1, q0, isNpi, isDrop, isComp, p1: q1 > 0 ? ty / q1 : 0, p0: q0 > 0 ? ly / q0 : 0 };
    });

    const avgP0 = compQ0 > 0 ? compLy / compQ0 : 0;
    let volEffect = 0, priceEffect = 0, mixEffect = 0;
    pvmSkus.forEach(item => {
      if (item.isComp && compQ0 > 0 && compQ1 > 0) {
        const s0 = item.q0 / compQ0;
        const s1 = item.q1 / compQ1;
        volEffect += (compQ1 - compQ0) * s0 * item.p0;
        mixEffect += compQ1 * (s1 - s0) * (item.p0 - avgP0);
        priceEffect += (item.p1 - item.p0) * item.q1;
      }
    });
    const pvmResidual = totalDelta - (volEffect + priceEffect + mixEffect + npiSales + dropSales);
    volEffect += pvmResidual;

    // Datos de Cascada PVM para Gráfica
    const pvmStepsRaw = [
      { name: 'Ventas LY', delta: totalLy, isTotal: true },
      { name: 'Volumen', delta: volEffect, isTotal: false },
      { name: 'Precio', delta: priceEffect, isTotal: false },
      { name: 'Mix', delta: mixEffect, isTotal: false },
      { name: 'Innovación', delta: npiSales + dropSales, isTotal: false },
      { name: 'Ventas TY', delta: totalTy, isTotal: true }
    ];
    let wfRunning = 0;
    const waterfallChartData = pvmStepsRaw.map(step => {
      if (step.isTotal) {
        wfRunning = step.delta;
        return {
          name: step.name,
          base: 0,
          barValue: Math.max(0, step.delta),
          rawDelta: step.delta,
          fill: '#4f46e5',
          isTotal: true
        };
      }
      const start = wfRunning;
      const end = wfRunning + step.delta;
      wfRunning = end;
      return {
        name: step.name,
        base: Math.max(0, Math.min(start, end)),
        barValue: Math.abs(step.delta),
        rawDelta: step.delta,
        fill: step.delta >= 0 ? '#10b981' : '#ef4444',
        isTotal: false
      };
    });

    // 3. Leaderboard & Pareto 80/20
    const sortedBySales = [...consolidatedSkus].sort((a, b) => b.ty - a.ty);
    let runningSales = 0;
    const top80Ids = new Set();
    let vitalSales = 0;
    let marginalInv = 0;
    const marginRatio = assumedMarginPct / 100;
    const forecastRatio = forecastGrowthPct / 100;

    const enrichedSkus = sortedBySales.map((p, idx) => {
      runningSales += p.ty;
      const sharePct = totalTy > 0 ? (p.ty / totalTy) * 100 : 0;
      const cumPct = totalTy > 0 ? (runningSales / totalTy) * 100 : 0;
      const isVital = runningSales <= totalTy * 0.8 || top80Ids.size === 0;
      if (isVital) {
        top80Ids.add(p.key);
        vitalSales += p.ty;
      } else {
        marginalInv += p.inv || 0;
      }
      const growth = p.ly > 0 ? ((p.ty / p.ly) - 1) * 100 : (p.ty > 0 ? 100 : 0);
      const aur = p.units > 0 ? p.ty / p.units : 0;
      const dailyUnits = (p.units || 0) / 365;
      const dos = dailyUnits > 0 ? (p.inv || 0) / dailyUnits : 999;
      const trappedCap = (p.inv || 0) * aur * (1 - marginRatio);

      // Health Score 360°
      const volScore = isVital ? 30 : (p.ty > 0 ? 10 : 0);
      const growthScore = growth > 10 ? 30 : (growth > 0 ? 20 : (growth > -10 ? 10 : 0));
      const invScore = (dos >= 7 && dos <= 45) ? 40 : ((dos > 45 && dos <= 90) ? 20 : (dos < 7 && dailyUnits > 0 ? 5 : 0));
      const healthScore = volScore + growthScore + invScore;
      const grade = healthScore >= 90 ? 'A+' : (healthScore >= 80 ? 'A' : (healthScore >= 70 ? 'B' : (healthScore >= 60 ? 'C' : 'F')));

      // Racionalización
      let ratAction = 'KEEP';
      if (growth > 20 && p.ty > 1000) ratAction = 'GROW';
      else if (growth < -20 && p.ty > 500) ratAction = 'REVIEW';
      else if ((dos > 90 && p.ty < 500) || (p.ty < 100 && p.ly < 100)) ratAction = 'DROP';
      else if (p.ly === 0 && p.ty > 0) ratAction = 'WATCH';

      return {
        ...p,
        rank: idx + 1,
        sharePct,
        cumPct,
        isVital,
        growth,
        aur,
        dos,
        trappedCap,
        healthScore,
        grade,
        ratAction
      };
    });

    const healthCounts = {
      'A+': enrichedSkus.filter(s => s.grade === 'A+').length,
      'A': enrichedSkus.filter(s => s.grade === 'A').length,
      'B': enrichedSkus.filter(s => s.grade === 'B').length,
      'C': enrichedSkus.filter(s => s.grade === 'C').length,
      'F': enrichedSkus.filter(s => s.grade === 'F').length
    };
    const healthChartData = [
      { name: 'Grado A+ (90-100)', short: 'A+', count: healthCounts['A+'], fill: '#10b981' },
      { name: 'Grado A (80-89)', short: 'A', count: healthCounts['A'], fill: '#3b82f6' },
      { name: 'Grado B (70-79)', short: 'B', count: healthCounts['B'], fill: '#6366f1' },
      { name: 'Grado C (60-69)', short: 'C', count: healthCounts['C'], fill: '#f59e0b' },
      { name: 'Grado F (<60)', short: 'F', count: healthCounts['F'], fill: '#ef4444' }
    ];
    const avgHealthScore = enrichedSkus.reduce((s, i) => s + i.healthScore, 0) / Math.max(1, enrichedSkus.length);

    // 4. Inteligencia Territorial (Regiones de PR) y Tiendas (Clustering A/B/C)
    const regionMap = {};
    const storeMap = {};
    rawFiltered.forEach(p => {
      const { region, town } = getRegionAndTownForStore(p.store);
      if (!regionMap[region]) {
        regionMap[region] = { name: region, ty: 0, ly: 0, units: 0, stores: new Set(), towns: new Set(), categories: {} };
      }
      regionMap[region].ty += p.ty || 0;
      regionMap[region].ly += p.ly || 0;
      regionMap[region].units += p.units || 0;
      regionMap[region].stores.add(p.store);
      if (town !== 'Sin Asignar') regionMap[region].towns.add(town);
      regionMap[region].categories[p.category] = (regionMap[region].categories[p.category] || 0) + (p.ty || 0);

      if (!storeMap[p.store]) {
        storeMap[p.store] = { name: p.store, region, town, ty: 0, ly: 0, units: 0, inv: 0, skuCount: 0 };
      }
      storeMap[p.store].ty += p.ty || 0;
      storeMap[p.store].ly += p.ly || 0;
      storeMap[p.store].units += p.units || 0;
      storeMap[p.store].inv += p.inv || 0;
      storeMap[p.store].skuCount += 1;
    });

    const regionsSummary = Object.values(regionMap)
      .map(r => ({
        name: r.name,
        ty: r.ty,
        ly: r.ly,
        growth: r.ly > 0 ? ((r.ty / r.ly) - 1) * 100 : (r.ty > 0 ? 100 : 0),
        sharePct: totalTy > 0 ? (r.ty / totalTy) * 100 : 0,
        storeCount: r.stores.size,
        townCount: r.towns.size,
        topCategory: Object.entries(r.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
      }))
      .sort((a, b) => b.ty - a.ty);

    let storeRunningTy = 0;
    const storesSummary = Object.values(storeMap)
      .sort((a, b) => b.ty - a.ty)
      .map((st, idx) => {
        storeRunningTy += st.ty;
        const cumPct = totalTy > 0 ? (storeRunningTy / totalTy) * 100 : 0;
        const tier = cumPct <= 70 || idx === 0 ? 'A' : (cumPct <= 90 ? 'B' : 'C');
        const feet = tier === 'A' ? 16 : (tier === 'B' ? 8 : 4);
        return {
          ...st,
          rank: idx + 1,
          growth: st.ly > 0 ? ((st.ty / st.ly) - 1) * 100 : (st.ty > 0 ? 100 : 0),
          sharePct: totalTy > 0 ? (st.ty / totalTy) * 100 : 0,
          salesPerSku: st.skuCount > 0 ? st.ty / st.skuCount : 0,
          tier,
          feet,
          salesPerFoot: st.ty / feet
        };
      });

    // 5. Categorías y Suplidores (Vendor Scorecard)
    const catMap = new Map();
    const venMap = new Map();

    enrichedSkus.forEach(p => {
      const cName = p.category || 'SIN CATEGORIA';
      if (!catMap.has(cName)) {
        catMap.set(cName, {
          name: cName,
          ty: 0,
          ly: 0,
          units: 0,
          inv: 0,
          invCost: 0,
          skuCount: 0,
          minAur: Infinity,
          maxAur: 0
        });
      }
      const c = catMap.get(cName);
      c.ty += p.ty;
      c.ly += p.ly;
      c.units += p.units;
      c.inv += p.inv;
      c.skuCount += 1;
      if (p.aur > 0) {
        if (p.aur < c.minAur) c.minAur = p.aur;
        if (p.aur > c.maxAur) c.maxAur = p.aur;
      }
      const unitCost = (p.aur > 0 ? p.aur : 8.5) * (1 - marginRatio);
      c.invCost += (p.inv || 0) * unitCost;

      const vName = p.vendor || 'NO ESPECIFICADO';
      if (!venMap.has(vName)) {
        venMap.set(vName, {
          name: vName,
          ty: 0,
          ly: 0,
          units: 0,
          inv: 0,
          skuCount: 0
        });
      }
      const v = venMap.get(vName);
      v.ty += p.ty;
      v.ly += p.ly;
      v.units += p.units;
      v.inv += p.inv;
      v.skuCount += 1;
    });

    const categoriesSummary = Array.from(catMap.values())
      .map(c => {
        const shareSales = totalTy > 0 ? (c.ty / totalTy) * 100 : 0;
        const shareSpace = totalInv > 0 ? (c.inv / totalInv) * 100 : 0;
        const spaceIndex = shareSpace > 0 ? shareSales / shareSpace : 0;
        const grossMarginDollars = c.ty * marginRatio;
        const gmroi = c.invCost > 0 ? grossMarginDollars / c.invCost : 0;
        const growth = c.ly > 0 ? ((c.ty / c.ly) - 1) * 100 : (c.ty > 0 ? 100 : 0);
        const organicRatio = c.ly > 0 ? Math.max(-0.4, Math.min(0.8, (c.ty - c.ly) / c.ly)) : 0.10;
        const forecastNy = Math.max(0, c.ty * (1 + organicRatio * 0.5 + forecastRatio));
        const role = shareSales > 15 ? 'Destino' : (shareSales >= 5 ? 'Rutina' : 'Conveniencia');
        const spaceAction = spaceIndex > 1.2 ? 'Expandir Góndola' : (spaceIndex < 0.8 && shareSpace > 1 ? 'Reducir Góndola' : 'Mantener Espacio');

        return {
          ...c,
          minAur: c.minAur === Infinity ? 0 : c.minAur,
          avgAur: c.units > 0 ? c.ty / c.units : 0,
          shareSales,
          shareSpace,
          spaceIndex,
          spaceAction,
          grossMarginDollars,
          gmroi,
          growth,
          forecastNy,
          role
        };
      })
      .sort((a, b) => b.ty - a.ty);

    const vendorsSummary = Array.from(venMap.values())
      .map((v, idx) => ({
        ...v,
        rank: idx + 1,
        shareSales: totalTy > 0 ? (v.ty / totalTy) * 100 : 0,
        growth: v.ly > 0 ? ((v.ty / v.ly) - 1) * 100 : (v.ty > 0 ? 100 : 0),
        avgAur: v.units > 0 ? v.ty / v.units : 0,
        grossMarginDollars: v.ty * marginRatio
      }))
      .sort((a, b) => b.ty - a.ty)
      .map((v, idx) => ({ ...v, rank: idx + 1 }));

    // 6. Finanzas Globales, Inventario DOS, Racionalización e Innovación
    const totalGrossMargin = totalTy * marginRatio;
    const totalInvCost = categoriesSummary.reduce((s, c) => s + c.invCost, 0);
    const globalGmroi = totalInvCost > 0 ? totalGrossMargin / totalInvCost : 0;
    const totalForecastNy = categoriesSummary.reduce((s, c) => s + c.forecastNy, 0);

    const oosRiskSkus = enrichedSkus.filter(p => p.dos < 7 && p.units > 0).map(p => {
      const reqInv = (p.units / 365) * 14;
      const lostSales = reqInv > p.inv ? (reqInv - p.inv) * p.aur : 0;
      return { ...p, lostSales };
    });
    const overstockSkus = enrichedSkus.filter(p => p.dos > 30 && p.inv > 0);
    const validDosList = enrichedSkus.filter(p => p.dos < 999);
    const avgDos = validDosList.length > 0 ? validDosList.reduce((s, p) => s + p.dos, 0) / validDosList.length : 0;

    const lostSalesOos = oosRiskSkus.reduce((s, p) => s + p.lostSales, 0);

    const markdownSkus = enrichedSkus
      .filter(p => p.growth < -20 && p.trappedCap > 50)
      .sort((a, b) => b.trappedCap - a.trappedCap);

    const trappedCapital = markdownSkus.reduce((s, p) => s + p.trappedCap, 0);

    const npiList = enrichedSkus.filter(p => p.ly === 0 && p.ty > 0).sort((a, b) => b.ty - a.ty);
    const vitalityIndex = totalTy > 0 ? (npiSales / totalTy) * 100 : 0;

    const ratCounts = {
      GROW: enrichedSkus.filter(p => p.ratAction === 'GROW').length,
      KEEP: enrichedSkus.filter(p => p.ratAction === 'KEEP').length,
      WATCH: enrichedSkus.filter(p => p.ratAction === 'WATCH').length,
      REVIEW: enrichedSkus.filter(p => p.ratAction === 'REVIEW').length,
      DROP: enrichedSkus.filter(p => p.ratAction === 'DROP').length
    };

    return {
      totalTy,
      totalLy,
      totalDelta,
      totalGrowthPct,
      totalUnits,
      totalInv,
      avgAur,
      skuCount: consolidatedSkus.length,
      storeCount: activeStoresSet.size,
      categoryCount: activeCategoriesSet.size,
      vendorCount: activeVendorsSet.size,
      pvm: { volEffect, priceEffect, mixEffect, npiNet: npiSales + dropSales },
      waterfallChartData,
      pareto: {
        vitalCount: top80Ids.size,
        marginalCount: Math.max(0, consolidatedSkus.length - top80Ids.size),
        vitalPct: consolidatedSkus.length > 0 ? (top80Ids.size / consolidatedSkus.length) * 100 : 0,
        vitalSales,
        marginalInvPct: totalInv > 0 ? (marginalInv / totalInv) * 100 : 0
      },
      healthCounts,
      healthChartData,
      avgHealthScore,
      regionsSummary,
      storesSummary,
      categoriesSummary,
      vendorsSummary: vendorsSummary.slice(0, 15),
      topSkus: enrichedSkus.slice(0, 20),
      atRiskSkus: oosRiskSkus.sort((a, b) => b.lostSales - a.lostSales || b.ty - a.ty).slice(0, 15),
      markdownSkus: markdownSkus.slice(0, 15),
      npiList: npiList.slice(0, 15),
      npiTotalCount: npiList.length,
      npiSales,
      vitalityIndex,
      totalGrossMargin,
      totalInvCost,
      globalGmroi,
      totalForecastNy,
      avgDos,
      oosCount: oosRiskSkus.length,
      overstockCount: overstockSkus.length,
      lostSalesOos,
      trappedCapital,
      ratCounts
    };
  }, [displayProducts, storeFilter, categoryFilter, assumedMarginPct, forecastGrowthPct]);

  // Redactor automático de Conclusiones Ejecutivas basadas en los datos
  const generateSmartExecutiveNotes = () => {
    if (!masterReport) return;
    const topCat = masterReport.categoriesSummary[0]?.name || 'Principal';
    const topStore = masterReport.storesSummary[0]?.name || 'Líder';
    const topVendor = masterReport.vendorsSummary[0]?.name || 'Principal';
    const summaryText = [
      `1. DESEMPEÑO DE INGRESOS (PVM): El portafolio registra ventas TY de ${formatCurrency(masterReport.totalTy)} (${masterReport.totalGrowthPct >= 0 ? '+' : ''}${masterReport.totalGrowthPct.toFixed(1)}% vs LY), impulsado por un efecto Volumen de ${formatCurrency(masterReport.pvm.volEffect)}, un efecto Precio de ${formatCurrency(masterReport.pvm.priceEffect)} y un efecto Mix de ${formatCurrency(masterReport.pvm.mixEffect)}.`,
      `2. CONCENTRACIÓN PARETO Y SALUD 360°: El ${masterReport.pareto.vitalPct.toFixed(1)}% del catálogo (${masterReport.pareto.vitalCount} SKUs vitales) sostiene el 80% de la facturación. El Health Score promedio es de ${masterReport.avgHealthScore.toFixed(1)}/100 pts.`,
      `3. LIDERAZGO COMERCIAL: La categoría dominante es ${topCat}, el suplidor #1 es ${topVendor} y la tienda líder es ${topStore}.`,
      `4. PLAN DE ACCIÓN INMEDIATO: Reabastecer con urgencia los ${masterReport.oosCount} SKUs con riesgo de quiebre (<7 días DOS) para proteger ${formatCurrency(masterReport.lostSalesOos)} en venta perdida estimada, y ejecutar liquidación sobre los ${masterReport.ratCounts.DROP} SKUs en baja (DROP) liberando ${formatCurrency(masterReport.trappedCapital)} en capital atrapado.`
    ].join('\n');
    setCustomNotes(summaryText);
  };

  const handleDownloadVectorPdf = () => {
    if (!masterReport) return;
    if (!window.jspdf || !window.jspdf.jsPDF) {
      setStatusMessage("Cargando motor PDF... Por favor intenta de nuevo en 2 segundos o usa 'Imprimir / Guardar PDF'.");
      return;
    }

    setIsGeneratingPdf(true);
    setStatusMessage("");

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      let yPos = 15;

      const checkPageBreak = (neededHeight = 35) => {
        if (yPos + neededHeight > pageHeight - 16) {
          doc.addPage();
          yPos = 18;
        }
      };

      const drawSectionBanner = (code, title, subtitle) => {
        checkPageBreak(24);
        doc.setFillColor(185, 28, 28); // Rojo Ejecutivo (Red 700)
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 11, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`${code}  |  ${title.toUpperCase()}`, margin + 4, yPos + 5.2);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(254, 226, 226);
        doc.text(subtitle, margin + 4, yPos + 9.2);
        yPos += 14;
      };

      // =========================================================================
      // CABECERA EJECUTIVA DE PORTADA
      // =========================================================================
      doc.setFillColor(24, 24, 27); // Slate/Zinc 900
      doc.rect(0, 0, pageWidth, 42, 'F');
      doc.setFillColor(220, 38, 38); // Línea acento Roja (Red 600)
      doc.rect(0, 40, pageWidth, 2.5, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15.5);
      doc.text(reportTitle.toUpperCase(), margin, 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(254, 202, 202);
      doc.text(reportSubtitle, margin, 21);

      const dateStr = new Date().toLocaleDateString('es-PR', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.setFontSize(8);
      doc.setTextColor(226, 232, 240);
      doc.text(`Preparado por: ${preparedBy}   |   Fecha: ${dateStr}`, margin, 29);
      doc.text(
        `Alcance: Tienda = ${storeFilter}  •  Categoría = ${categoryFilter}  •  SKUs = ${formatNumber(masterReport.skuCount)}  •  Tiendas = ${masterReport.storeCount}  •  Suplidores = ${masterReport.vendorCount}`,
        margin,
        35
      );

      yPos = 48;

      // =========================================================================
      // 1. RESUMEN EJECUTIVO GLOBAL & NOTAS
      // =========================================================================
      if (sections.execSummary) {
        drawSectionBanner("SECCIÓN 1", "Resumen Ejecutivo & KPIs Maestros del Portafolio", "Consolidado general de ingresos, volumen, precios, margen, inventario y proyección S&OP");

        doc.autoTable({
          startY: yPos,
          margin: { left: margin, right: margin },
          head: [['Ventas TY ($)', 'Ventas LY ($)', 'Crecimiento YoY', 'Unidades TY', 'Precio Prom (AUR)', 'Margen Bruto Est.', 'GMROI Global', 'Forecast S&OP (NY)']],
          body: [[
            formatCurrency(masterReport.totalTy),
            formatCurrency(masterReport.totalLy),
            `${masterReport.totalGrowthPct >= 0 ? '+' : ''}${masterReport.totalGrowthPct.toFixed(1)}% (${formatCurrency(masterReport.totalDelta)})`,
            formatNumber(masterReport.totalUnits),
            formatCurrency(masterReport.avgAur),
            `${formatCurrency(masterReport.totalGrossMargin)} (${assumedMarginPct}%)`,
            `$${masterReport.globalGmroi.toFixed(2)}x`,
            formatCurrency(masterReport.totalForecastNy)
          ]],
          theme: 'grid',
          headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 7.2, fontStyle: 'bold', halign: 'center' },
          bodyStyles: { fontSize: 7.8, fontStyle: 'bold', halign: 'center', textColor: [15, 23, 42] }
        });
        yPos = doc.lastAutoTable.finalY + 5;

        const notesToPrint = customNotes.trim() || [
          `• Variación neta de ingresos de ${formatCurrency(masterReport.totalDelta)} (${masterReport.totalGrowthPct >= 0 ? '+' : ''}${masterReport.totalGrowthPct.toFixed(1)}% vs LY) sobre ${masterReport.skuCount} SKUs únicos, ${masterReport.storeCount} tiendas y ${masterReport.vendorCount} suplidores.`,
          `• El ${masterReport.pareto.vitalPct.toFixed(1)}% de los SKUs (${masterReport.pareto.vitalCount} productos vitales) genera el 80% de las ventas totales.`,
          `• Existen ${masterReport.oosCount} SKUs con riesgo de quiebre (<7 días DOS) por ${formatCurrency(masterReport.lostSalesOos)} en venta en riesgo y ${masterReport.ratCounts.DROP} SKUs candidatos a baja (DROP).`
        ].join('\n');

        checkPageBreak(26);
        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(252, 165, 165);
        const splitNotes = doc.splitTextToSize(notesToPrint, pageWidth - margin * 2 - 8);
        const boxHeight = Math.max(18, splitNotes.length * 4.3 + 9);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, boxHeight, 2, 2, 'FD');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(185, 28, 28);
        doc.text("CONCLUSIONES Y PLAN DE ACCIÓN EJECUTIVO:", margin + 4, yPos + 5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.6);
        doc.setTextColor(30, 41, 59);
        doc.text(splitNotes, margin + 4, yPos + 10);
        yPos += boxHeight + 6;
      }

      // =========================================================================
      // PANEL DE GRÁFICAS VECTORIALES NATIVAS EN EL PDF (PVM + SALUD 360° + REGIONES + CATEGORÍAS)
      // =========================================================================
      if (includePdfCharts && sections.visualCharts) {
        drawSectionBanner("PANEL GRÁFICO", "Visualizaciones Ejecutivas del Portafolio (Gráficas Vectoriales)", "Cascada PVM de ingresos, distribución de Salud 360°, desempeño por Región PR y Top Categorías");

        // FILA 1 DE GRÁFICAS: Izquierda = Cascada PVM | Derecha = Distribución Salud 360°
        checkPageBreak(58);
        const boxW = (pageWidth - margin * 2 - 6) / 2;
        const boxH = 52;
        const leftX = margin;
        const rightX = margin + boxW + 6;

        // Marco Izquierdo: Cascada PVM
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(leftX, yPos, boxW, boxH, 2, 2, 'FD');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text("GRÁFICA 1: CASCADA DE INGRESOS PVM (LY -> TY)", leftX + 4, yPos + 5.5);

        const wfSteps = masterReport.waterfallChartData;
        const maxWfVal = Math.max(...wfSteps.map(s => s.base + s.barValue), 1);
        const chartAreaTop = yPos + 12;
        const chartAreaH = 30;
        const barColW = (boxW - 12) / wfSteps.length;

        wfSteps.forEach((st, idx) => {
          const bx = leftX + 6 + idx * barColW;
          const bw = Math.min(11, barColW - 3);
          const totalH = ((st.base + st.barValue) / maxWfVal) * chartAreaH;
          const baseH = (st.base / maxWfVal) * chartAreaH;
          const barH = Math.max(1.5, totalH - baseH);
          const by = chartAreaTop + chartAreaH - totalH;

          if (st.isTotal) doc.setFillColor(79, 70, 229);
          else if (st.rawDelta >= 0) doc.setFillColor(16, 185, 129);
          else doc.setFillColor(239, 68, 68);

          doc.roundedRect(bx, by, bw, barH, 1, 1, 'F');

          // Valor sobre la barra
          doc.setFont("helvetica", "bold");
          doc.setFontSize(5.8);
          doc.setTextColor(51, 65, 85);
          const shortVal = Math.abs(st.rawDelta) >= 1000
            ? `${st.rawDelta < 0 ? '-' : ''}$${(Math.abs(st.rawDelta) / 1000).toFixed(0)}k`
            : `$${Math.round(st.rawDelta)}`;
          doc.text(shortVal, bx + bw / 2, Math.max(yPos + 10, by - 1.2), { align: 'center' });

          // Etiqueta eje X
          doc.setFont("helvetica", "normal");
          doc.setFontSize(5.8);
          doc.text(st.name.substring(0, 9), bx + bw / 2, chartAreaTop + chartAreaH + 4.5, { align: 'center' });
        });

        // Marco Derecho: Distribución Salud 360°
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(rightX, yPos, boxW, boxH, 2, 2, 'FD');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(`GRÁFICA 2: SCORECARD SALUD 360° (PROM: ${masterReport.avgHealthScore.toFixed(1)} PTS)`, rightX + 4, yPos + 5.5);

        const maxGradeCount = Math.max(...masterReport.healthChartData.map(g => g.count), 1);
        const gradeColorsRgb = {
          'A+': [16, 185, 129],
          'A': [59, 130, 246],
          'B': [99, 102, 241],
          'C': [245, 158, 11],
          'F': [239, 68, 68]
        };

        masterReport.healthChartData.forEach((g, idx) => {
          const rowY = yPos + 11 + idx * 7.8;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(6.8);
          doc.setTextColor(51, 65, 85);
          doc.text(g.name, rightX + 4, rowY + 3.5);

          const barTrackX = rightX + 34;
          const barMaxW = boxW - 58;
          doc.setFillColor(226, 232, 240);
          doc.roundedRect(barTrackX, rowY, barMaxW, 4.5, 1, 1, 'F');

          const fillW = Math.max(2, (g.count / maxGradeCount) * barMaxW);
          const rgb = gradeColorsRgb[g.short] || [100, 116, 139];
          doc.setFillColor(rgb[0], rgb[1], rgb[2]);
          doc.roundedRect(barTrackX, rowY, fillW, 4.5, 1, 1, 'F');

          const pct = masterReport.skuCount > 0 ? ((g.count / masterReport.skuCount) * 100).toFixed(0) : 0;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(6.5);
          doc.text(`${g.count} (${pct}%)`, barTrackX + barMaxW + 2, rowY + 3.5);
        });

        yPos += boxH + 5;

        // FILA 2 DE GRÁFICAS: Izquierda = Ventas por Región PR | Derecha = Top Categorías (TY vs Forecast NY)
        checkPageBreak(56);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(leftX, yPos, boxW, boxH, 2, 2, 'FD');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text("GRÁFICA 3: VENTAS TY POR REGIÓN DE PUERTO RICO", leftX + 4, yPos + 5.5);

        const topRegions = masterReport.regionsSummary.slice(0, 5);
        const maxRegSales = Math.max(...topRegions.map(r => r.ty), 1);
        topRegions.forEach((r, idx) => {
          const rowY = yPos + 11 + idx * 7.8;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(6.5);
          doc.setTextColor(51, 65, 85);
          doc.text(String(r.name).substring(0, 12), leftX + 4, rowY + 3.5);

          const barTrackX = leftX + 26;
          const barMaxW = boxW - 56;
          doc.setFillColor(226, 232, 240);
          doc.roundedRect(barTrackX, rowY, barMaxW, 4.5, 1, 1, 'F');

          const fillW = Math.max(2, (r.ty / maxRegSales) * barMaxW);
          doc.setFillColor(14, 116, 144);
          doc.roundedRect(barTrackX, rowY, fillW, 4.5, 1, 1, 'F');

          doc.setFontSize(6.2);
          doc.text(`${formatCurrency(r.ty)} (${r.sharePct.toFixed(0)}%)`, barTrackX + barMaxW + 2, rowY + 3.5);
        });

        // Marco Derecho: Top 5 Categorías (TY vs Forecast NY)
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(rightX, yPos, boxW, boxH, 2, 2, 'FD');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text("GRÁFICA 4: TOP CATEGORÍAS (TY ACTUAL VS S&OP NY)", rightX + 4, yPos + 5.5);

        const topCats = masterReport.categoriesSummary.slice(0, 5);
        const maxCatVal = Math.max(...topCats.map(c => Math.max(c.ty, c.forecastNy)), 1);
        topCats.forEach((c, idx) => {
          const rowY = yPos + 11 + idx * 7.8;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(6.2);
          doc.setTextColor(51, 65, 85);
          doc.text(String(c.name).substring(0, 12), rightX + 4, rowY + 3.5);

          const barTrackX = rightX + 28;
          const barMaxW = boxW - 58;
          const tyW = Math.max(2, (c.ty / maxCatVal) * barMaxW);
          const nyW = Math.max(2, (c.forecastNy / maxCatVal) * barMaxW);

          // Barra TY (Gris/Indigo oscuro) y Barra NY (Verde Esmeralda)
          doc.setFillColor(100, 116, 139);
          doc.rect(barTrackX, rowY, tyW, 2.1, 'F');
          doc.setFillColor(16, 185, 129);
          doc.rect(barTrackX, rowY + 2.4, nyW, 2.1, 'F');

          doc.setFontSize(6);
          doc.text(`NY: ${formatCurrency(c.forecastNy)}`, barTrackX + barMaxW + 2, rowY + 3.5);
        });

        yPos += boxH + 7;
      }

      // =========================================================================
      // 2. PUENTE DE INGRESOS PVM (PRECIO VS VOLUMEN VS MIX)
      // =========================================================================
      if (sections.pvmBridge) {
        drawSectionBanner("SECCIÓN 2", "Puente de Ingresos PVM (Precio vs. Volumen vs. Mix)", "Descomposición matemática de la variación entre Ventas LY y Ventas TY");

        doc.autoTable({
          startY: yPos,
          margin: { left: margin, right: margin },
          head: [['1. Base Ventas LY', '2. Efecto Volumen', '3. Efecto Precio', '4. Efecto Mix', '5. Innovación Neta', '6. Cierre Ventas TY']],
          body: [[
            formatCurrency(masterReport.totalLy),
            `${masterReport.pvm.volEffect >= 0 ? '+' : ''}${formatCurrency(masterReport.pvm.volEffect)}`,
            `${masterReport.pvm.priceEffect >= 0 ? '+' : ''}${formatCurrency(masterReport.pvm.priceEffect)}`,
            `${masterReport.pvm.mixEffect >= 0 ? '+' : ''}${formatCurrency(masterReport.pvm.mixEffect)}`,
            `${masterReport.pvm.npiNet >= 0 ? '+' : ''}${formatCurrency(masterReport.pvm.npiNet)}`,
            formatCurrency(masterReport.totalTy)
          ]],
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 7.5, fontStyle: 'bold', halign: 'center' },
          bodyStyles: { fontSize: 8, fontStyle: 'bold', halign: 'center' }
        });
        yPos = doc.lastAutoTable.finalY + 7;
      }

      // =========================================================================
      // 3. LEADERBOARD TOP 20 SKUs
      // =========================================================================
      if (sections.leaderboard) {
        drawSectionBanner("SECCIÓN 3", "Leaderboard: Top 20 Productos Líderes del Portafolio", "SKUs de mayor facturación con su crecimiento YoY, precio promedio (AUR), DOS y Health Score");

        doc.autoTable({
          startY: yPos,
          margin: { left: margin, right: margin },
          head: [['#', 'UPC', 'Descripción del Producto', 'Categoría', 'Ventas TY', 'Share %', 'Crec. YoY', 'AUR ($)', 'DOS', 'Salud']],
          body: masterReport.topSkus.map(p => [
            p.rank,
            p.upc || 'N/A',
            String(p.name || '').substring(0, 34),
            String(p.category || '').substring(0, 16),
            formatCurrency(p.ty),
            `${p.sharePct.toFixed(1)}%`,
            `${p.growth >= 0 ? '+' : ''}${p.growth.toFixed(1)}%`,
            formatCurrency(p.aur),
            p.dos >= 999 ? '999+' : `${p.dos.toFixed(0)}d`,
            `${p.grade} (${p.healthScore})`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 7, fontStyle: 'bold' },
          bodyStyles: { fontSize: 7 },
          columnStyles: {
            0: { halign: 'center', cellWidth: 8 },
            4: { halign: 'right', fontStyle: 'bold' },
            5: { halign: 'right' },
            6: { halign: 'right' },
            7: { halign: 'right' },
            8: { halign: 'center' },
            9: { halign: 'center', fontStyle: 'bold' }
          }
        });
        yPos = doc.lastAutoTable.finalY + 7;
      }

      // =========================================================================
      // 4. LEY DE PARETO 80/20 Y SCORECARD DE SALUD 360°
      // =========================================================================
      if (sections.pareto || sections.health360) {
        drawSectionBanner("SECCIÓN 4", "Concentración Pareto (80/20) & Scorecard de Salud 360°", "Eficiencia de surtido vital vs. cola larga y distribución de calificaciones de salud");

        doc.autoTable({
          startY: yPos,
          margin: { left: margin, right: margin },
          head: [['SKUs Vitales (Top 80%)', 'SKUs Marginales (20%)', '% Inv. en Cola Larga', 'Grado A+ (90-100)', 'Grado A (80-89)', 'Grado B (70-79)', 'Grado C (60-69)', 'Grado F (<60)']],
          body: [[
            `${masterReport.pareto.vitalCount} SKUs (${masterReport.pareto.vitalPct.toFixed(1)}%)`,
            `${masterReport.pareto.marginalCount} SKUs`,
            `${masterReport.pareto.marginalInvPct.toFixed(1)}% del stock`,
            `${masterReport.healthCounts['A+']} SKUs`,
            `${masterReport.healthCounts['A']} SKUs`,
            `${masterReport.healthCounts['B']} SKUs`,
            `${masterReport.healthCounts['C']} SKUs`,
            `${masterReport.healthCounts['F']} SKUs`
          ]],
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 7, fontStyle: 'bold', halign: 'center' },
          bodyStyles: { fontSize: 7.5, fontStyle: 'bold', halign: 'center' }
        });
        yPos = doc.lastAutoTable.finalY + 7;
      }

      // =========================================================================
      // 5. INTELIGENCIA TERRITORIAL: REGIONES DE PUERTO RICO
      // =========================================================================
      if (sections.territorialMap && masterReport.regionsSummary.length > 0) {
        drawSectionBanner("SECCIÓN 5", "Inteligencia Territorial: Desempeño por Región de Puerto Rico", "Distribución geográfica de ventas, crecimiento interanual, sucursales y categoría dominante");

        doc.autoTable({
          startY: yPos,
          margin: { left: margin, right: margin },
          head: [['Región Geográfica PR', 'Tiendas', 'Pueblos Activos', 'Ventas TY ($)', 'Ventas LY ($)', 'Share Isla %', 'Crec. YoY %', 'Categoría Líder']],
          body: masterReport.regionsSummary.map(r => [
            r.name,
            r.storeCount,
            r.townCount,
            formatCurrency(r.ty),
            formatCurrency(r.ly),
            `${r.sharePct.toFixed(1)}%`,
            `${r.growth >= 0 ? '+' : ''}${r.growth.toFixed(1)}%`,
            r.topCategory
          ]),
          theme: 'striped',
          headStyles: { fillColor: [14, 116, 144], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
          bodyStyles: { fontSize: 7.5 },
          columnStyles: {
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'right', fontStyle: 'bold' },
            4: { halign: 'right' },
            5: { halign: 'right' },
            6: { halign: 'right', fontStyle: 'bold' }
          }
        });
        yPos = doc.lastAutoTable.finalY + 7;
      }

      // =========================================================================
      // 6. BENCHMARKING DE TIENDAS & CLUSTERING (TIERS A / B / C)
      // =========================================================================
      if (sections.storeClustering && masterReport.storesSummary.length > 0) {
        drawSectionBanner("SECCIÓN 6", "Benchmarking de Sucursales & Clustering Space Planning (A/B/C)", "Clasificación por volumen, productividad por SKU y retorno por pie lineal de góndola");

        doc.autoTable({
          startY: yPos,
          margin: { left: margin, right: margin },
          head: [['#', 'Tier', 'Tienda / Sucursal', 'Región (Pueblo)', 'Ventas TY ($)', 'Share %', 'Crec. YoY', 'Venta/SKU', 'Góndola', 'Venta / Pie']],
          body: masterReport.storesSummary.slice(0, 25).map(st => [
            st.rank,
            `Tier ${st.tier}`,
            st.name,
            `${st.region} (${st.town})`,
            formatCurrency(st.ty),
            `${st.sharePct.toFixed(1)}%`,
            `${st.growth >= 0 ? '+' : ''}${st.growth.toFixed(1)}%`,
            formatCurrency(st.salesPerSku),
            `${st.feet} ft`,
            `${formatCurrency(st.salesPerFoot)}/ft`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 7, fontStyle: 'bold' },
          bodyStyles: { fontSize: 7 },
          columnStyles: {
            0: { halign: 'center', cellWidth: 8 },
            1: { halign: 'center', fontStyle: 'bold' },
            4: { halign: 'right', fontStyle: 'bold' },
            5: { halign: 'right' },
            6: { halign: 'right' },
            7: { halign: 'right' },
            8: { halign: 'center' },
            9: { halign: 'right', fontStyle: 'bold' }
          }
        });
        yPos = doc.lastAutoTable.finalY + 7;
      }

      // =========================================================================
      // 7. SCORECARD DE SUPLIDORES Y MARCAS LÍDERES
      // =========================================================================
      if (sections.vendorScorecard && masterReport.vendorsSummary.length > 0) {
        drawSectionBanner("SECCIÓN 7", "Scorecard de Suplidores y Marcas Líderes (Top 15)", "Participación de mercado por proveedor, crecimiento YoY, unidades, AUR y contribución al margen bruto");

        doc.autoTable({
          startY: yPos,
          margin: { left: margin, right: margin },
          head: [['#', 'Suplidor / Proveedor', 'SKUs', 'Ventas TY ($)', 'Ventas LY ($)', 'Share %', 'Crec. YoY', 'AUR Prom', 'Margen Est. ($)']],
          body: masterReport.vendorsSummary.map(v => [
            v.rank,
            String(v.name || '').substring(0, 28),
            v.skuCount,
            formatCurrency(v.ty),
            formatCurrency(v.ly),
            `${v.shareSales.toFixed(1)}%`,
            `${v.growth >= 0 ? '+' : ''}${v.growth.toFixed(1)}%`,
            formatCurrency(v.avgAur),
            formatCurrency(v.grossMarginDollars)
          ]),
          theme: 'striped',
          headStyles: { fillColor: [109, 40, 217], textColor: 255, fontSize: 7, fontStyle: 'bold' },
          bodyStyles: { fontSize: 7 },
          columnStyles: {
            0: { halign: 'center', cellWidth: 8 },
            2: { halign: 'center' },
            3: { halign: 'right', fontStyle: 'bold' },
            4: { halign: 'right' },
            5: { halign: 'right' },
            6: { halign: 'right', fontStyle: 'bold' },
            7: { halign: 'right' },
            8: { halign: 'right', fontStyle: 'bold' }
          }
        });
        yPos = doc.lastAutoTable.finalY + 7;
      }

      // =========================================================================
      // 8. MATRIZ DE CATEGORÍAS: PRECIOS (AUR), GMROI, FORECAST NY Y GÓNDOLA
      // =========================================================================
      if (sections.pricingElasticity || sections.gmroiFinance || sections.forecastSop || sections.assortmentSpace) {
        drawSectionBanner("SECCIÓN 8", "Auditoría por Categoría: AUR, GMROI, Forecast S&OP y Góndola", "Estructura de precios Entry/Core/Premium, retorno sobre inventario, proyección NY y Space vs. Sales");

        doc.autoTable({
          startY: yPos,
          margin: { left: margin, right: margin },
          head: [['Categoría', 'Ventas TY', 'Share %', 'AUR Min / Prom / Max', 'Margen ($)', 'GMROI', 'Forecast NY ($)', 'Space Index', 'Rol & Acción Góndola']],
          body: masterReport.categoriesSummary.slice(0, 20).map(c => [
            String(c.name || '').substring(0, 18),
            formatCurrency(c.ty),
            `${c.shareSales.toFixed(1)}%`,
            `${formatCurrency(c.minAur)} / ${formatCurrency(c.avgAur)} / ${formatCurrency(c.maxAur)}`,
            formatCurrency(c.grossMarginDollars),
            `$${c.gmroi.toFixed(2)}x`,
            formatCurrency(c.forecastNy),
            c.spaceIndex.toFixed(2),
            `${c.role} • ${c.spaceAction}`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 6.8, fontStyle: 'bold' },
          bodyStyles: { fontSize: 6.8 },
          columnStyles: {
            1: { halign: 'right', fontStyle: 'bold' },
            2: { halign: 'right' },
            3: { halign: 'center' },
            4: { halign: 'right' },
            5: { halign: 'center', fontStyle: 'bold' },
            6: { halign: 'right', fontStyle: 'bold' },
            7: { halign: 'center' }
          }
        });
        yPos = doc.lastAutoTable.finalY + 7;
      }

      // =========================================================================
      // 9. COBERTURA DOS, RIESGO DE QUIEBRES, LIQUIDACIONES & INNOVACIÓN NPI
      // =========================================================================
      if (sections.dosInventory) {
        drawSectionBanner("SECCIÓN 9", "Abastecimiento (DOS), Quiebres, Liquidación & Innovación NPI", "Control de días de inventario, venta perdida por quiebres, capital atrapado y lanzamientos NPI");

        doc.autoTable({
          startY: yPos,
          margin: { left: margin, right: margin },
          head: [['DOS Promedio', 'Alerta Quiebre (<7d)', 'Sobreinventario (>30d)', 'Venta Perdida OOS', 'Capital Atrapado', 'Vitalidad NPI %', 'Matriz Surtido (Grow/Keep/Drop)']],
          body: [[
            `${masterReport.avgDos.toFixed(1)} días`,
            `${masterReport.oosCount} SKUs`,
            `${masterReport.overstockCount} SKUs`,
            formatCurrency(masterReport.lostSalesOos),
            formatCurrency(masterReport.trappedCapital),
            `${masterReport.vitalityIndex.toFixed(1)}% (${masterReport.npiTotalCount} NPIs)`,
            `G:${masterReport.ratCounts.GROW} | K:${masterReport.ratCounts.KEEP} | D:${masterReport.ratCounts.DROP}`
          ]],
          theme: 'grid',
          headStyles: { fillColor: [225, 29, 72], textColor: 255, fontSize: 7, fontStyle: 'bold', halign: 'center' },
          bodyStyles: { fontSize: 7.5, fontStyle: 'bold', halign: 'center' }
        });
        yPos = doc.lastAutoTable.finalY + 5;

        if (masterReport.atRiskSkus.length > 0) {
          doc.autoTable({
            startY: yPos,
            margin: { left: margin, right: margin },
            head: [['UPC', 'Top SKUs con Urgencia de Reabasto (DOS < 7 días)', 'Categoría', 'Ventas TY', 'Inv. Actual', 'DOS (Días)', 'Venta en Riesgo']],
            body: masterReport.atRiskSkus.slice(0, 10).map(p => [
              p.upc || 'N/A',
              String(p.name || '').substring(0, 34),
              String(p.category || '').substring(0, 15),
              formatCurrency(p.ty),
              formatNumber(p.inv),
              `${p.dos.toFixed(1)}d`,
              formatCurrency(p.lostSales)
            ]),
            theme: 'striped',
            headStyles: { fillColor: [190, 18, 60], textColor: 255, fontSize: 7, fontStyle: 'bold' },
            bodyStyles: { fontSize: 7 },
            columnStyles: {
              3: { halign: 'right', fontStyle: 'bold' },
              4: { halign: 'center' },
              5: { halign: 'center', fontStyle: 'bold' },
              6: { halign: 'right', fontStyle: 'bold' }
            }
          });
          yPos = doc.lastAutoTable.finalY + 5;
        }

        if (masterReport.markdownSkus.length > 0) {
          doc.autoTable({
            startY: yPos,
            margin: { left: margin, right: margin },
            head: [['UPC', 'Top SKUs con Capital Atrapado / Candidatos a Liquidación', 'Categoría', 'Caída YoY', 'Stock Físico', 'Capital Atrapado Est.']],
            body: masterReport.markdownSkus.slice(0, 8).map(p => [
              p.upc || 'N/A',
              String(p.name || '').substring(0, 36),
              String(p.category || '').substring(0, 16),
              `${p.growth.toFixed(1)}%`,
              formatNumber(p.inv),
              formatCurrency(p.trappedCap)
            ]),
            theme: 'striped',
            headStyles: { fillColor: [217, 119, 6], textColor: 255, fontSize: 7, fontStyle: 'bold' },
            bodyStyles: { fontSize: 7 },
            columnStyles: {
              3: { halign: 'right', fontStyle: 'bold' },
              4: { halign: 'center' },
              5: { halign: 'right', fontStyle: 'bold' }
            }
          });
          yPos = doc.lastAutoTable.finalY + 7;
        }
      }

      // Numeración y pie de página en todas las hojas del PDF
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Retail Intelligence & RGM Suite  •  ${reportTitle}`,
          margin,
          pageHeight - 5.5
        );
        doc.text(
          `Página ${p} de ${totalPages}`,
          pageWidth - margin - 22,
          pageHeight - 5.5
        );
      }

      const safeFileName = `Reporte_Ejecutivo_Retail_${storeFilter.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(safeFileName);
      setStatusMessage(`¡PDF generado exitosamente (${totalPages} páginas con gráficas y tablas): ${safeFileName}!`);
    } catch (error) {
      console.error("Error construyendo PDF:", error);
      setStatusMessage("Ocurrió un error al construir el PDF. Puedes usar el botón 'Imprimir Dossier en Pantalla'.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const toggleSection = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ToolHeader
        icon={FileText}
        iconColor="text-red-500"
        title="Generador de Dossier & Reporte Ejecutivo en PDF (Con Gráficas y Auditoría Total)"
        subtitle="Consolida automáticamente las gráficas ejecutivas, hallazgos, tablas y KPIs de todas las pestañas de la suite en un documento PDF profesional listo para directorio o comité comercial."
        t={t}
      >
        <ToolFilterSelect icon={Store} value={storeFilter} onChange={setStoreFilter} options={uniqueStores} allLabel="Todas las Tiendas" allValue="Todas" t={t} />
        <ToolFilterSelect icon={Filter} iconColor="text-emerald-400" value={categoryFilter} onChange={setCategoryFilter} options={uniqueCategories} allLabel="Todas las Categorías" allValue="Todas" t={t} />
      </ToolHeader>

      {/* PANEL DE PERSONALIZACIÓN Y DESCARGA DIRECTA DEL PDF */}
      <div className={`p-6 rounded-3xl border mb-8 shadow-sm ${t.card}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Configuración de Títulos y Parámetros */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${t.textTitle}`}>
              <Sparkles className="w-4 h-4 text-red-500" /> 1. Configuración de Portada y Parámetros del Reporte
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`text-[11px] font-bold block mb-1 ${t.textSub}`}>Título del Reporte PDF:</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold focus:outline-none ${t.input}`}
                />
              </div>
              <div>
                <label className={`text-[11px] font-bold block mb-1 ${t.textSub}`}>Preparado por / Departamento:</label>
                <input
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold focus:outline-none ${t.input}`}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={`text-[11px] font-bold block mb-1 ${t.textSub}`}>Subtítulo / Alcance Comercial:</label>
                <input
                  type="text"
                  value={reportSubtitle}
                  onChange={(e) => setReportSubtitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none ${t.input}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${t.textSub}`}>
                  Margen Bruto GMROI: <strong className="text-emerald-500">{assumedMarginPct}%</strong>
                </span>
                <input
                  type="range"
                  min="10"
                  max="65"
                  value={assumedMarginPct}
                  onChange={(e) => setAssumedMarginPct(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
                />
              </div>
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${t.textSub}`}>
                  Ajuste S&OP NY: <strong className="text-indigo-500">{forecastGrowthPct >= 0 ? `+${forecastGrowthPct}%` : `${forecastGrowthPct}%`}</strong>
                </span>
                <input
                  type="range"
                  min="-15"
                  max="25"
                  value={forecastGrowthPct}
                  onChange={(e) => setForecastGrowthPct(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                />
              </div>
              <label
                onClick={() => setIncludePdfCharts(!includePdfCharts)}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  includePdfCharts
                    ? (isDarkMode ? 'bg-red-950/30 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-900')
                    : (isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500')
                }`}
              >
                <div>
                  <span className="text-[10px] font-black uppercase block">Gráficas en el PDF</span>
                  <span className="text-[10px] opacity-80 block">Vectores de alta nitidez</span>
                </div>
                <input type="checkbox" checked={includePdfCharts} readOnly className="w-4 h-4 accent-red-600 pointer-events-none" />
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-[11px] font-bold ${t.textSub}`}>Notas y Conclusiones Ejecutivas (se incluyen en la Portada del PDF):</label>
                <button
                  type="button"
                  onClick={generateSmartExecutiveNotes}
                  disabled={!masterReport}
                  className="text-[11px] font-black text-red-500 hover:underline flex items-center gap-1 disabled:opacity-40"
                >
                  <Wand2 className="w-3.5 h-3.5" /> Redactar Resumen Automático con Datos Reales
                </button>
              </div>
              <textarea
                rows={3}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Haz clic en 'Redactar Resumen Automático' o escribe tus observaciones clave para el comité..."
                className={`w-full p-3 rounded-xl border text-xs leading-relaxed focus:outline-none ${t.input}`}
              />
            </div>
          </div>

          {/* Selección de Capítulos y Botones de Exportación */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${t.textTitle}`}>
                  <ListChecks className="w-4 h-4 text-red-500" /> 2. Módulos y Gráficas a Incluir en el PDF
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const allTrue = Object.values(sections).every(Boolean);
                    const nextVal = !allTrue;
                    setSections({
                      execSummary: nextVal, visualCharts: nextVal, pvmBridge: nextVal, leaderboard: nextVal,
                      pareto: nextVal, health360: nextVal, territorialMap: nextVal, storeClustering: nextVal,
                      vendorScorecard: nextVal, pricingElasticity: nextVal, gmroiFinance: nextVal,
                      forecastSop: nextVal, dosInventory: nextVal, assortmentSpace: nextVal
                    });
                  }}
                  className="text-[11px] font-bold text-red-500 hover:underline"
                >
                  Marcar / Desmarcar Todos
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                {[
                  { key: 'execSummary', label: '1. Resumen Ejecutivo & KPIs' },
                  { key: 'visualCharts', label: '2. Panel de Gráficas Ejecutivas' },
                  { key: 'pvmBridge', label: '3. Puente PVM (Precio/Vol/Mix)' },
                  { key: 'leaderboard', label: '4. Top 20 SKUs Líderes' },
                  { key: 'pareto', label: '5. Ley de Pareto (80/20)' },
                  { key: 'health360', label: '6. Scorecard Salud 360°' },
                  { key: 'territorialMap', label: '7. Regiones & Pueblos PR' },
                  { key: 'storeClustering', label: '8. Tiendas & Tiers (A/B/C)' },
                  { key: 'vendorScorecard', label: '9. Scorecard de Suplidores' },
                  { key: 'pricingElasticity', label: '10. Precios AUR por Categoría' },
                  { key: 'gmroiFinance', label: '11. Rentabilidad GMROI' },
                  { key: 'forecastSop', label: '12. Proyección S&OP (NY)' },
                  { key: 'dosInventory', label: '13. Cobertura DOS & Quiebres' },
                  { key: 'assortmentSpace', label: '14. Góndola, Liquidación & NPI' }
                ].map(sec => (
                  <label
                    key={sec.key}
                    onClick={() => toggleSection(sec.key)}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      sections[sec.key]
                        ? (isDarkMode ? 'bg-red-950/30 border-red-600 text-red-200' : 'bg-red-50 border-red-300 text-red-900')
                        : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400')
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sections[sec.key]}
                      readOnly
                      className="w-3.5 h-3.5 rounded accent-red-600 pointer-events-none"
                    />
                    <span className="truncate">{sec.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleDownloadVectorPdf}
                disabled={!masterReport || isGeneratingPdf}
                className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm shadow-xl shadow-red-600/30 border border-red-500 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPdf ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Generando PDF Ejecutivo...</>
                ) : (
                  <><Download className="w-5 h-5" /> Exportar PDF Ejecutivo con Gráficas (.PDF)</>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                disabled={!masterReport}
                className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${t.cardHover}`}
              >
                <Printer className="w-4 h-4 text-red-500" /> Imprimir Dossier Completo en Pantalla
              </button>

              {statusMessage && (
                <div className={`p-2.5 rounded-xl text-xs font-bold text-center ${
                  statusMessage.includes('exitosamente')
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : 'bg-amber-500/15 text-amber-500'
                }`}>
                  {statusMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {}
      {/* VISTA PREVIA EN VIVO DEL DOSSIER COMPLETO CON GRÁFICAS */}
      {masterReport ? (
        <div className="space-y-6">
          {/* Portada de Vista Previa */}
          <div className="rounded-3xl overflow-hidden border border-red-500/30 shadow-xl">
            <div className="bg-gradient-to-r from-slate-950 via-red-950 to-slate-900 text-white p-6 sm:p-8 border-b-4 border-red-600">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-full bg-red-500/30 text-red-200 border border-red-400/30">
                    Vista Previa en Vivo del Dossier PDF (Gráficas + Tablas)
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-3">{reportTitle}</h3>
                  <p className="text-sm text-red-200 mt-1">{reportSubtitle}</p>
                </div>
                <div className="text-xs text-slate-200 bg-black/35 p-4 rounded-2xl border border-white/10 shrink-0">
                  <p><strong>Preparado por:</strong> {preparedBy}</p>
                  <p className="mt-1"><strong>Filtro Tienda:</strong> {storeFilter} • <strong>Categoría:</strong> {categoryFilter}</p>
                  <p className="mt-1"><strong>Alcance:</strong> {formatNumber(masterReport.skuCount)} SKUs • {masterReport.storeCount} Tiendas • {masterReport.vendorCount} Suplidores</p>
                </div>
              </div>
            </div>

            {/* 1. Resumen Ejecutivo & Puente PVM (12 KPIs Globales) */}
            {(sections.execSummary || sections.pvmBridge) && (
              <div className={`p-6 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                <h4 className={`text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 ${t.textTitle}`}>
                  <Award className="w-4 h-4 text-red-500" /> Capítulo 1 & 2: Resumen Ejecutivo Global, Rentabilidad y Puente PVM
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                  <KpiStatCard label="Ventas TY" value={formatCurrency(masterReport.totalTy)} valueColor="text-indigo-500" subtext={`LY: ${formatCurrency(masterReport.totalLy)}`} t={t} />
                  <KpiStatCard
                    label="Crecimiento YoY"
                    value={`${masterReport.totalGrowthPct >= 0 ? '+' : ''}${masterReport.totalGrowthPct.toFixed(1)}%`}
                    valueColor={masterReport.totalGrowthPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}
                    subtext={`Neto: ${formatCurrency(masterReport.totalDelta)}`}
                    t={t}
                  />
                  <KpiStatCard label="Unidades & AUR" value={formatNumber(masterReport.totalUnits)} subtext={`AUR Prom: ${formatCurrency(masterReport.avgAur)}`} t={t} />
                  <KpiStatCard label="Efecto Volumen" value={formatCurrency(masterReport.pvm.volEffect)} valueColor={masterReport.pvm.volEffect >= 0 ? 'text-emerald-500' : 'text-rose-500'} subtext="Tráfico físico" t={t} />
                  <KpiStatCard label="Efecto Precio" value={formatCurrency(masterReport.pvm.priceEffect)} valueColor={masterReport.pvm.priceEffect >= 0 ? 'text-emerald-500' : 'text-rose-500'} subtext="Variación tarifa" t={t} />
                  <KpiStatCard label="Efecto Mix" value={formatCurrency(masterReport.pvm.mixEffect)} valueColor="text-blue-500" subtext={`NPI Neto: ${formatCurrency(masterReport.pvm.npiNet)}`} t={t} />
                  <KpiStatCard label="Margen Bruto Est." value={formatCurrency(masterReport.totalGrossMargin)} valueColor="text-emerald-500" subtext={`Al ${assumedMarginPct}% margen`} t={t} />
                  <KpiStatCard label="GMROI Global" value={`$${masterReport.globalGmroi.toFixed(2)}x`} valueColor="text-emerald-500" subtext={`Costo Inv: ${formatCurrency(masterReport.totalInvCost)}`} t={t} />
                  <KpiStatCard label="Forecast S&OP (NY)" value={formatCurrency(masterReport.totalForecastNy)} valueColor="text-indigo-500" subtext={` Escenario ${forecastGrowthPct >= 0 ? `+${forecastGrowthPct}%` : `${forecastGrowthPct}%`}`} t={t} />
                  <KpiStatCard label="Concentración Pareto" value={`${masterReport.pareto.vitalPct.toFixed(1)}%`} subtext={`${masterReport.pareto.vitalCount} SKUs hacen el 80%`} t={t} />
                  <KpiStatCard label="Salud Catálogo 360°" value={`${masterReport.avgHealthScore.toFixed(1)} pts`} valueColor="text-emerald-500" subtext={`A+/A: ${masterReport.healthCounts['A+'] + masterReport.healthCounts['A']} SKUs`} t={t} />
                  <KpiStatCard label="Riesgo Quiebre OOS" value={`${masterReport.oosCount} SKUs`} valueColor="text-rose-500" subtext={`En riesgo: ${formatCurrency(masterReport.lostSalesOos)}`} t={t} />
                </div>

                {customNotes && (
                  <div className={`p-4 rounded-2xl border text-xs whitespace-pre-line leading-relaxed ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-red-50/50 border-red-100 text-slate-700'}`}>
                    <strong className="block text-red-500 uppercase tracking-wider mb-1">Notas Ejecutivas Incluidas en el PDF:</strong>
                    {customNotes}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. GALERÍA DE GRÁFICAS EJECUTIVAS DEL DOSSIER */}
          {sections.visualCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfica 1: Cascada Financiera PVM */}
              <div className={`p-6 rounded-2xl border flex flex-col ${t.card}`}>
                <h4 className={`font-black text-sm uppercase tracking-wider mb-1 flex items-center gap-2 ${t.textTitle}`}>
                  <BarChart3 className="w-4 h-4 text-indigo-500" /> Gráfica 1: Puente de Ingresos PVM (LY → TY)
                </h4>
                <p className={`text-xs mb-4 ${t.textSub}`}>Descomposición visual de ganancias y pérdidas por factor comercial</p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={masterReport.waterfallChartData} margin={{ top: 10, right: 15, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                      <XAxis dataKey="name" tick={{ fill: t.chartText, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                        contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '10px' }}
                        formatter={(val, name, props) => {
                          if (name === 'base') return [null, null];
                          return [formatCurrency(props?.payload?.rawDelta || 0), props?.payload?.name];
                        }}
                      />
                      <Bar dataKey="base" stackId="wf" fill="transparent" isAnimationActive={false} />
                      <Bar dataKey="barValue" stackId="wf" radius={[5, 5, 5, 5]} barSize={38}>
                        {masterReport.waterfallChartData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfica 2: Top Categorías (Ventas LY vs TY vs Proyección S&OP NY) */}
              <div className={`p-6 rounded-2xl border flex flex-col ${t.card}`}>
                <h4 className={`font-black text-sm uppercase tracking-wider mb-1 flex items-center gap-2 ${t.textTitle}`}>
                  <LineChart className="w-4 h-4 text-emerald-500" /> Gráfica 2: Evolución 3 Horizontes por Categoría (LY / TY / NY)
                </h4>
                <p className={`text-xs mb-4 ${t.textSub}`}>Comparativa de ventas históricas, actuales y proyección S&OP</p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={masterReport.categoriesSummary.slice(0, 7)} margin={{ top: 10, right: 15, left: 0, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                      <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} tick={{ fill: t.chartText, fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                        contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '10px' }}
                        formatter={(val) => formatCurrency(val)}
                      />
                      <Legend verticalAlign="top" height={28} iconType="circle" />
                      <Bar dataKey="ly" name="Ventas LY" fill="#94a3b8" radius={[3, 3, 0, 0]} barSize={16} />
                      <Bar dataKey="ty" name="Ventas TY" fill="#4f46e5" radius={[3, 3, 0, 0]} barSize={16} />
                      <Bar dataKey="forecastNy" name="Forecast S&OP (NY)" fill="#10b981" radius={[3, 3, 0, 0]} barSize={16} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfica 3: Distribución Regional Puerto Rico */}
              <div className={`p-6 rounded-2xl border flex flex-col ${t.card}`}>
                <h4 className={`font-black text-sm uppercase tracking-wider mb-1 flex items-center gap-2 ${t.textTitle}`}>
                  <MapIcon className="w-4 h-4 text-sky-500" /> Gráfica 3: Ventas TY y Crecimiento por Región de PR
                </h4>
                <p className={`text-xs mb-4 ${t.textSub}`}>Desempeño territorial en las regiones activas de la isla</p>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={masterReport.regionsSummary} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                      <XAxis dataKey="name" tick={{ fill: t.chartText, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" hide />
                      <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fill: t.chartText, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '10px' }}
                        formatter={(val, name) => String(name).includes('%') ? `${Number(val).toFixed(1)}%` : formatCurrency(val)}
                      />
                      <Legend verticalAlign="top" height={28} iconType="circle" />
                      <Bar yAxisId="left" dataKey="ty" name="Ventas TY ($)" fill="#0284c7" radius={[5, 5, 0, 0]} barSize={32} />
                      <Line yAxisId="right" type="monotone" dataKey="growth" name="Crecimiento YoY (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfica 4: Scorecard de Salud 360° */}
              <div className={`p-6 rounded-2xl border flex flex-col ${t.card}`}>
                <h4 className={`font-black text-sm uppercase tracking-wider mb-1 flex items-center gap-2 ${t.textTitle}`}>
                  <HeartPulse className="w-4 h-4 text-rose-500" /> Gráfica 4: Distribución de Salud del Catálogo 360°
                </h4>
                <p className={`text-xs mb-4 ${t.textSub}`}>Cantidad de SKUs según su calificación integral (Volumen + Crecimiento + DOS)</p>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={masterReport.healthChartData} layout="vertical" margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={t.chartGrid} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={115} tick={{ fill: t.chartText, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '10px' }}
                        formatter={(val) => [`${val} SKUs`, 'Cantidad']}
                      />
                      <Bar dataKey="count" name="SKUs" radius={[0, 6, 6, 0]} barSize={20}>
                        {masterReport.healthChartData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* 3. Top SKUs Líderes */}
          {sections.leaderboard && (
            <DataTable
              title="Capítulo 3: Top 20 Productos Líderes (Leaderboard, Pareto & Health Score)"
              icon={Trophy}
              iconColor="text-amber-500"
              t={t}
              isDarkMode={isDarkMode}
              maxHeight="max-h-[420px]"
              columns={[
                { label: '#', className: 'text-center w-10' },
                { label: 'Producto & UPC' },
                { label: 'Categoría & Suplidor' },
                { label: 'Ventas TY ($)', className: 'text-right' },
                { label: 'Share %', className: 'text-right' },
                { label: 'Crec. YoY', className: 'text-right' },
                { label: 'AUR ($)', className: 'text-right' },
                { label: 'DOS', className: 'text-center' },
                { label: 'Salud 360°', className: 'text-center' }
              ]}
              data={masterReport.topSkus}
              renderRow={(p, idx) => (
                <tr key={idx} className={t.rowBase}>
                  <td className={`px-4 py-3 text-center font-mono text-xs font-bold ${t.textSub}`}>{p.rank}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-xs uppercase block ${t.textTitle}`}>{p.name}</span>
                    <span className={`text-[10px] font-mono ${t.textSub}`}>UPC: {p.upc || 'N/A'}</span>
                  </td>
                  <td className={`px-4 py-3 text-xs ${t.textSub}`}>
                    <span className="font-bold block">{p.category}</span>
                    <span className="text-[10px]">{p.vendor}</span>
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-bold text-xs ${t.textTitle}`}>{formatCurrency(p.ty)}</td>
                  <td className={`px-4 py-3 text-right font-mono text-xs ${t.textSub}`}>{p.sharePct.toFixed(1)}%</td>
                  <td className={`px-4 py-3 text-right font-mono font-bold text-xs ${p.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {p.growth >= 0 ? '+' : ''}{p.growth.toFixed(1)}%
                  </td>
                  <td className={`px-4 py-3 text-right font-mono text-xs ${t.textTitle}`}>{formatCurrency(p.aur)}</td>
                  <td className={`px-4 py-3 text-center font-mono text-xs ${t.textSub}`}>{p.dos >= 999 ? '999+' : `${p.dos.toFixed(0)}d`}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/15 text-indigo-500">
                      {p.grade} ({p.healthScore})
                    </span>
                  </td>
                </tr>
              )}
            />
          )}

          {/* 4. Regiones de Puerto Rico & Benchmarking de Tiendas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sections.territorialMap && (
              <DataTable
                title="Capítulo 5: Desempeño por Región de Puerto Rico"
                icon={MapIcon}
                iconColor="text-indigo-500"
                t={t}
                isDarkMode={isDarkMode}
                maxHeight="max-h-[380px]"
                columns={[
                  { label: 'Región PR' },
                  { label: 'Tiendas', className: 'text-center' },
                  { label: 'Ventas TY', className: 'text-right' },
                  { label: 'Share %', className: 'text-right' },
                  { label: 'Crec. YoY', className: 'text-right' }
                ]}
                data={masterReport.regionsSummary}
                renderRow={(r, idx) => (
                  <tr key={idx} className={t.rowBase}>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-xs block ${t.textTitle}`}>{r.name}</span>
                      <span className={`text-[10px] ${t.textSub}`}>Líder: {r.topCategory}</span>
                    </td>
                    <td className={`px-4 py-3 text-center font-mono text-xs ${t.textTitle}`}>{r.storeCount} ({r.townCount} pueblos)</td>
                    <td className={`px-4 py-3 text-right font-mono font-bold text-xs ${t.textTitle}`}>{formatCurrency(r.ty)}</td>
                    <td className={`px-4 py-3 text-right font-mono text-xs ${t.textSub}`}>{r.sharePct.toFixed(1)}%</td>
                    <td className={`px-4 py-3 text-right font-mono font-bold text-xs ${r.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {r.growth >= 0 ? '+' : ''}{r.growth.toFixed(1)}%
                    </td>
                  </tr>
                )}
              />
            )}

            {sections.storeClustering && (
              <DataTable
                title="Capítulo 6: Benchmarking de Tiendas & Clustering (A/B/C)"
                icon={Network}
                iconColor="text-emerald-500"
                t={t}
                isDarkMode={isDarkMode}
                maxHeight="max-h-[380px]"
                columns={[
                  { label: 'Tier', className: 'text-center' },
                  { label: 'Tienda & Región' },
                  { label: 'Ventas TY', className: 'text-right' },
                  { label: 'Venta/SKU', className: 'text-right' },
                  { label: 'Venta/Pie', className: 'text-right' }
                ]}
                data={masterReport.storesSummary}
                renderRow={(st, idx) => (
                  <tr key={idx} className={t.rowBase}>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-black text-xs ${
                        st.tier === 'A' ? 'bg-emerald-500 text-white' : st.tier === 'B' ? 'bg-blue-500 text-white' : 'bg-slate-500 text-white'
                      }`}>
                        {st.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-xs uppercase block ${t.textTitle}`}>{st.name}</span>
                      <span className={`text-[10px] ${t.textSub}`}>{st.region} • {st.town}</span>
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-bold text-xs ${t.textTitle}`}>{formatCurrency(st.ty)}</td>
                    <td className={`px-4 py-3 text-right font-mono text-xs ${t.textSub}`}>{formatCurrency(st.salesPerSku)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-xs text-emerald-500">{formatCurrency(st.salesPerFoot)}/ft</td>
                  </tr>
                )}
              />
            )}
          </div>

          {/* 5. Scorecard de Suplidores / Marcas Líderes */}
          {sections.vendorScorecard && (
            <DataTable
              title="Capítulo 7: Scorecard de Suplidores y Marcas Líderes (Top 15 Proveedores)"
              icon={Users}
              iconColor="text-purple-500"
              t={t}
              isDarkMode={isDarkMode}
              maxHeight="max-h-[380px]"
              columns={[
                { label: '#', className: 'text-center w-10' },
                { label: 'Suplidor / Marca' },
                { label: 'SKUs Activos', className: 'text-center' },
                { label: 'Ventas TY ($)', className: 'text-right' },
                { label: 'Ventas LY ($)', className: 'text-right' },
                { label: 'Share %', className: 'text-right' },
                { label: 'Crec. YoY', className: 'text-right' },
                { label: 'AUR Prom ($)', className: 'text-right' },
                { label: 'Margen Bruto Est.', className: 'text-right' }
              ]}
              data={masterReport.vendorsSummary}
              renderRow={(v, idx) => (
                <tr key={idx} className={t.rowBase}>
                  <td className={`px-4 py-3 text-center font-mono text-xs font-bold ${t.textSub}`}>{v.rank}</td>
                  <td className={`px-4 py-3 font-bold text-xs uppercase ${t.textTitle}`}>{v.name}</td>
                  <td className={`px-4 py-3 text-center font-mono text-xs ${t.textSub}`}>{v.skuCount}</td>
                  <td className={`px-4 py-3 text-right font-mono font-bold text-xs ${t.textTitle}`}>{formatCurrency(v.ty)}</td>
                  <td className={`px-4 py-3 text-right font-mono text-xs ${t.textSub}`}>{formatCurrency(v.ly)}</td>
                  <td className={`px-4 py-3 text-right font-mono text-xs ${t.textSub}`}>{v.shareSales.toFixed(1)}%</td>
                  <td className={`px-4 py-3 text-right font-mono font-bold text-xs ${v.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {v.growth >= 0 ? '+' : ''}{v.growth.toFixed(1)}%
                  </td>
                  <td className={`px-4 py-3 text-right font-mono text-xs ${t.textTitle}`}>{formatCurrency(v.avgAur)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-xs text-emerald-500">{formatCurrency(v.grossMarginDollars)}</td>
                </tr>
              )}
            />
          )}

          {/* 6. Matriz Consolidada de Categorías (Precios AUR, GMROI, Forecast NY y Góndola) */}
          {(sections.pricingElasticity || sections.gmroiFinance || sections.forecastSop || sections.assortmentSpace) && (
            <DataTable
              title="Capítulo 8: Matriz Consolidada por Categoría (AUR, GMROI, Forecast S&OP y Góndola)"
              icon={Layers}
              iconColor="text-indigo-500"
              t={t}
              isDarkMode={isDarkMode}
              maxHeight="max-h-[420px]"
              columns={[
                { label: 'Categoría' },
                { label: 'Ventas TY ($)', className: 'text-right' },
                { label: 'AUR (Min / Prom / Max)', className: 'text-center' },
                { label: 'Margen Bruto', className: 'text-right' },
                { label: 'GMROI', className: 'text-center' },
                { label: 'Forecast NY ($)', className: 'text-right' },
                { label: 'Space Index & Rol', className: 'text-center' }
              ]}
              data={masterReport.categoriesSummary}
              renderRow={(c, idx) => (
                <tr key={idx} className={t.rowBase}>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-xs uppercase block ${t.textTitle}`}>{c.name}</span>
                    <span className={`text-[10px] ${t.textSub}`}>{c.skuCount} SKUs • {c.shareSales.toFixed(1)}% Share</span>
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-bold text-xs ${t.textTitle}`}>{formatCurrency(c.ty)}</td>
                  <td className={`px-4 py-3 text-center font-mono text-xs ${t.textSub}`}>
                    {formatCurrency(c.minAur)} / <strong className={t.textTitle}>{formatCurrency(c.avgAur)}</strong> / {formatCurrency(c.maxAur)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-xs text-emerald-500">{formatCurrency(c.grossMarginDollars)}</td>
                  <td className="px-4 py-3 text-center font-mono font-black text-xs text-indigo-500">${c.gmroi.toFixed(2)}x</td>
                  <td className={`px-4 py-3 text-right font-mono font-bold text-xs ${t.textTitle}`}>{formatCurrency(c.forecastNy)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      c.spaceAction.includes('Expandir') ? 'bg-emerald-500/15 text-emerald-500' :
                      c.spaceAction.includes('Reducir') ? 'bg-rose-500/15 text-rose-500' : 'bg-slate-500/15 text-slate-400'
                    }`}>
                      {c.spaceIndex.toFixed(2)}x • {c.role} ({c.spaceAction})
                    </span>
                  </td>
                </tr>
              )}
            />
          )}

          {/* 7. Auditoría de Abastecimiento (DOS), Quiebres OOS, Capital Atrapado y Racionalización */}
          {sections.dosInventory && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataTable
                title={`Capítulo 9A: Top SKUs con Riesgo de Quiebre OOS (${masterReport.oosCount} alertas < 7d)`}
                icon={AlertTriangle}
                iconColor="text-rose-500"
                t={t}
                isDarkMode={isDarkMode}
                maxHeight="max-h-[360px]"
                columns={[
                  { label: 'Producto & UPC' },
                  { label: 'Stock', className: 'text-center' },
                  { label: 'DOS', className: 'text-center' },
                  { label: 'Venta en Riesgo', className: 'text-right' }
                ]}
                data={masterReport.atRiskSkus}
                emptyMessage="Excelente: No hay SKUs con menos de 7 días de inventario."
                renderRow={(p, idx) => (
                  <tr key={idx} className={t.rowBase}>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-xs uppercase block ${t.textTitle}`}>{p.name}</span>
                      <span className={`text-[10px] font-mono ${t.textSub}`}>UPC: {p.upc || 'N/A'} • {p.category}</span>
                    </td>
                    <td className={`px-4 py-3 text-center font-mono text-xs ${t.textTitle}`}>{formatNumber(p.inv)}</td>
                    <td className="px-4 py-3 text-center font-mono font-black text-xs text-rose-500">{p.dos.toFixed(1)}d</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-xs text-rose-500">{formatCurrency(p.lostSales)}</td>
                  </tr>
                )}
              />

              <DataTable
                title={`Capítulo 9B: Capital Atrapado & Candidatos a Liquidación (${formatCurrency(masterReport.trappedCapital)})`}
                icon={TrendingDown}
                iconColor="text-amber-500"
                t={t}
                isDarkMode={isDarkMode}
                maxHeight="max-h-[360px]"
                columns={[
                  { label: 'Producto Declinante' },
                  { label: 'Caída YoY', className: 'text-right' },
                  { label: 'Stock', className: 'text-center' },
                  { label: 'Capital Atrapado', className: 'text-right' }
                ]}
                data={masterReport.markdownSkus}
                emptyMessage="Sin productos críticos con capital atrapado."
                renderRow={(p, idx) => (
                  <tr key={idx} className={t.rowBase}>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-xs uppercase block ${t.textTitle}`}>{p.name}</span>
                      <span className={`text-[10px] font-mono ${t.textSub}`}>UPC: {p.upc || 'N/A'} • Acción: {p.ratAction}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-xs text-rose-500">{p.growth.toFixed(1)}%</td>
                    <td className={`px-4 py-3 text-center font-mono text-xs ${t.textTitle}`}>{formatNumber(p.inv)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-xs text-amber-500">{formatCurrency(p.trappedCap)}</td>
                  </tr>
                )}
              />
            </div>
          )}
        </div>
      ) : (
        <div className={`rounded-2xl p-12 text-center border-2 border-dashed ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
          <FileText className={`w-12 h-12 mx-auto mb-3 opacity-40 ${t.textSub}`} />
          <h3 className={`text-lg font-bold ${t.textTitle}`}>Carga o limpia un archivo primero para generar tu Dossier PDF</h3>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            En cuanto tengas datos en el dashboard, esta pestaña armará automáticamente el reporte PDF con gráficas vectoriales y todas las secciones organizadas.
          </p>
        </div>
      )}
    </div>
  );
};

const EXTRA_TOOLS_MODULES = [
  {
    id: 'pvm_bridge',
    code: '2.1',
    order: 21,
    label: 'Puente PVM (Ingresos)',
    group: 'EXEC',
    icon: GitMerge,
    iconColor: 'text-indigo-400',
    Component: PvmBridgeModule
  },
  {
    id: 'quota_pacing',
    code: '2.5',
    order: 25,
    label: 'Termómetro de Cuotas',
    group: 'EXEC',
    icon: Target,
    iconColor: 'text-rose-400',
    Component: QuotaPacingModule
  },
  {
    id: 'cannibalization',
    code: '5.5',
    order: 55,
    label: 'Canibalización & Incremento',
    group: 'MERCH',
    icon: GitMerge,
    iconColor: 'text-amber-400',
    Component: CannibalizationModule
  },
  {
    id: 'fair_share_visual',
    code: '5.9',
    order: 59,
    label: 'Fair Share (Ventas vs Espacio)',
    group: 'MERCH',
    icon: LayoutTemplate,
    iconColor: 'text-emerald-400',
    Component: FairShareVisualModule
  },
  {
    id: 'pdf_executive_report',
    code: '6.1',
    order: 61,
    label: 'Reporte PDF Ejecutivo',
    group: 'REPORT',
    icon: FileText,
    iconColor: 'text-emerald-400',
    Component: ExecutivePdfReportModule
  }
];

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("cleaner"); 
  const [activeNavGroup, setActiveNavGroup] = useState("ALL");
  
  // Limpiador Automático
  const [cleanerStep, setCleanerStep] = useState(1); 
  const [rawCleanData, setRawCleanData] = useState([]); 
  const [cleanerHeaders, setCleanerHeaders] = useState([]);
  const [cleanerMapping, setCleanerMapping] = useState({});
  const [cleanerStoreName, setCleanerStoreName] = useState("");
  const [cleanerStoreMode, setCleanerStoreMode] = useState("single"); // 'single' | 'multi' | 'parallel_cols'
  const [cleanerMultiColMode, setCleanerMultiColMode] = useState("sum"); // 'sum' | 'split_stores'
  const [cleanerMergeMode, setCleanerMergeMode] = useState("name"); // 'name' | 'name_or_upc' | 'none'
  const [cleanerSlotStores, setCleanerSlotStores] = useState({});
  const [cleanedData, setCleanedData] = useState(null);
  const [isCleaning, setIsCleaning] = useState(false);

  // Explorador
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStoreFilter, setSelectedStoreFilter] = useState("Todas");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("Todas");
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState("Todos");
  const [selectedVendorFilter, setSelectedVendorFilter] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; 
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Tiendas & Clustering (Lote 2)
  const [storeSearchTerm, setStoreSearchTerm] = useState("");
  const [selectedAnalysisStores, setSelectedAnalysisStores] = useState([]);
  const [storeSortBy, setStoreSortBy] = useState("ty");
  const [clusterTierFilter, setClusterTierFilter] = useState("Todos");
  const [tierLinearFeet, setTierLinearFeet] = useState({ A: "", B: "", C: "" });

  // Filtros Avanzados: Pareto, Ranking y Health Score (Lote 1)
  const [paretoStoreFilter, setParetoStoreFilter] = useState("Todas");
  const [paretoCategoryFilter, setParetoCategoryFilter] = useState("Todas");
  const [paretoViewMode, setParetoViewMode] = useState("top80");
  const [rankingStoreFilter, setRankingStoreFilter] = useState("Todas");
  const [rankingCategoryFilter, setRankingCategoryFilter] = useState("Todas");
  const [rankingVendorFilter, setRankingVendorFilter] = useState("Todos");
  const [rankingMetric, setRankingMetric] = useState("ty"); 
  const [rankingOrder, setRankingOrder] = useState("desc"); 
  const [rankingLimit, setRankingLimit] = useState(50);

  // DOS & Health Score
  const [dosPeriodDays, setDosPeriodDays] = useState(365); 
  const [targetDos, setTargetDos] = useState(14);
  const [healthCategoryFilter, setHealthCategoryFilter] = useState("Todas");
  const [healthStoreFilter, setHealthStoreFilter] = useState("Todas");
  const [healthGradeFilter, setHealthGradeFilter] = useState("Todas");
  const [healthSearchTerm, setHealthSearchTerm] = useState("");

  // Promo ROI Simulator
  const [promoSearchTerm, setPromoSearchTerm] = useState("");
  const [selectedPromoProductId, setSelectedPromoProductId] = useState(null);
  const [promoMargin, setPromoMargin] = useState(30); 
  const [promoDiscount, setPromoDiscount] = useState(15); 

  // Elasticidad de Precio y Optimización (Price Optimization)
  const [elasticityStoreFilter, setElasticityStoreFilter] = useState("Todas");
  const [elasticityCategoryFilter, setElasticityCategoryFilter] = useState("Todas");
  const [elasticityRegimeFilter, setElasticityRegimeFilter] = useState("Todos");
  const [elasticitySearchTerm, setElasticitySearchTerm] = useState("");
  const [simPriceChangePct, setSimPriceChangePct] = useState(6);
  const [elasticityBaseMargin, setElasticityBaseMargin] = useState(32);
  const [selectedElasticitySkuKey, setSelectedElasticitySkuKey] = useState(null);

  // GMROI y Proyecciones (Lote 2)
  const [globalMargin, setGlobalMargin] = useState(30);
  const [gmroiStoreFilter, setGmroiStoreFilter] = useState("Todas");
  const [gmroiCategoryFilter, setGmroiCategoryFilter] = useState("Todas");
  const [gmroiQuadrantFilter, setGmroiQuadrantFilter] = useState("Todos");
  const [targetGmroiThreshold, setTargetGmroiThreshold] = useState(2.5);

  const [marketAdjustment, setMarketAdjustment] = useState(0);
  const [priceInflationAdj, setPriceInflationAdj] = useState(2);
  const [forecastStoreFilter, setForecastStoreFilter] = useState("Todas");
  const [forecastCategoryFilter, setForecastCategoryFilter] = useState("Todas");

  // Mapas y Archivos
  const [selectedMapRegion, setSelectedMapRegion] = useState(null);
  const [selectedMapTown, setSelectedMapTown] = useState(null);
  const [mapViewMode, setMapViewMode] = useState('island_map'); // 'island_map' | 'regions' | 'towns' | 'matrix'
  const [mapColorMetric, setMapColorMetric] = useState('region'); // 'region' | 'ty' | 'growth' | 'salesPerStore'
  const [mapTownSearch, setMapTownSearch] = useState('');
  const [mapRegionFilter, setMapRegionFilter] = useState('Todas');
  const [mapStatusFilter, setMapStatusFilter] = useState('Todos'); // 'Todos' | 'active' | 'whitespace'
  const [mapTownSort, setMapTownSort] = useState('alpha'); // 'alpha' | 'ty' | 'growth'
  const [showStoreTownMapper, setShowStoreTownMapper] = useState(false);
  const [customTownOverrides, setCustomTownOverrides] = useState({});
  const [regionalPanelTab, setRegionalPanelTab] = useState('stores'); // 'stores' | 'skus' | 'gaps' | 'categories' | 'expansion'
  const [whiteSpaceCapturePct, setWhiteSpaceCapturePct] = useState(80);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showFileManager, setShowFileManager] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [excelLoaded, setExcelLoaded] = useState(false);
  const [jdaLibrary, setJdaLibrary] = useState([]);
  const [jdaHeaders, setJdaHeaders] = useState([]); 
  const [isImportingLibrary, setIsImportingLibrary] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showFileRequirementsModal, setShowFileRequirementsModal] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => setExcelLoaded(true);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const globalData = { allProducts: [] };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsImporting(true);
    try {
      const newFilesData = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop().toLowerCase();
        const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              if (fileExt === 'csv') resolve(extractProductsFromSheet(parseCSV(event.target.result), file.name));
              else if (fileExt === 'xlsx' || fileExt === 'xls') {
                if (!window.XLSX) { resolve([]); return; }
                const workbook = window.XLSX.read(new Uint8Array(event.target.result), { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                resolve(extractProductsFromSheet(window.XLSX.utils.sheet_to_json(worksheet, { header: 1 }), file.name));
              } else resolve([]);
            } catch (err) { resolve([]); }
          };
          reader.onerror = reject;
          if (fileExt === 'csv') reader.readAsText(file);
          else reader.readAsArrayBuffer(file);
        });
        if (fileData.length > 0) newFilesData.push({ id: 'file_' + Math.random().toString(36).substr(2, 9), name: file.name, data: fileData, isActive: true, count: fileData.length });
      }
      setUploadedFiles(prev => [...prev, ...newFilesData]);
      setSelectedProducts([]); setSelectedAnalysisStores([]);
    } catch (error) { console.error(error); } 
    finally { setIsImporting(false); e.target.value = ''; }
  };

  const handleLibraryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsImportingLibrary(true); setUploadError("");
    try {
      const file = files[0]; const fileExt = file.name.split('.').pop().toLowerCase();
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const result = event.target.result;
            if (fileExt === 'csv') resolve(extractLibraryFromSheet(parseCSV(result)));
            else if (['psp','pst','psg'].includes(fileExt)) {
              // Manejo simplificado JDA...
              resolve(extractLibraryFromSheet(parseCSV(result))); // Placeholder fallback
            }
            else if (['xlsx', 'xls'].includes(fileExt)) {
              if (!window.XLSX) { resolve({ error: "Librería Excel no cargada. Intenta de nuevo." }); return; }
              const workbook = window.XLSX.read(new Uint8Array(result), { type: 'array' });
              const worksheet = workbook.Sheets[workbook.SheetNames[0]];
              resolve(extractLibraryFromSheet(window.XLSX.utils.sheet_to_json(worksheet, { header: 1 })));
            } else resolve({ items: [], rawHeaders: [] });
          } catch (err) { resolve({ error: "Error procesando." }); }
        };
        if (['csv','psp','pst','psg'].includes(fileExt)) reader.readAsText(file);
        else reader.readAsArrayBuffer(file);
      });
      if (fileData.error) setUploadError(fileData.error);
      else {
        if (fileData.rawHeaders && fileData.rawHeaders.length > 0) setJdaHeaders(fileData.rawHeaders);
        if (fileData.items && fileData.items.length > 0) setJdaLibrary(fileData.items);
      }
    } catch (error) { console.error(error); } 
    finally { setIsImportingLibrary(false); e.target.value = ''; }
  };

  const handleRawFileClean = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsCleaning(true); setCleanedData(null); setCleanerStep(1); setUploadError("");
    try {
      const fileExt = file.name.split('.').pop().toLowerCase();
      let data = [];
      if (fileExt === 'csv') {
         const text = await new Promise((resolve, reject) => {
           const reader = new FileReader();
           reader.onload = (event) => resolve(event.target.result);
           reader.readAsText(file);
         });
         data = parseCSV(text);
      } else if (['xlsx', 'xls'].includes(fileExt)) {
         if (!window.XLSX) { setUploadError("Librería Excel no cargada aún. Intenta en unos segundos."); setIsCleaning(false); return; }
         const buffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.readAsArrayBuffer(file);
         });
         const workbook = window.XLSX.read(new Uint8Array(buffer), { type: 'array' });
         const worksheet = workbook.Sheets[workbook.SheetNames[0]];
         data = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      }
      if (data.length < 2) { setUploadError("El archivo está vacío o no tiene formato tabular válido."); setIsCleaning(false); return; }

      setRawCleanData(data);
      let detectedStore = file.name.replace(".csv", "").replace(".xlsx", "").replace(/[-_]/g, " ").trim();
      setCleanerStoreName(detectedStore);

      let headerRowIdx = -1; let maxScore = 0;
      for (let r = 0; r < Math.min(20, data.length); r++) {
          const rowLabels = data[r].map(c => String(c || "").toLowerCase().trim());
          let score = 0;
          if (rowLabels.includes("upc") || rowLabels.includes("barcode")) score += 2;
          if (rowLabels.some(l => l.includes("desc") || l.includes("producto"))) score += 2;
          if (rowLabels.some(l => l.includes("ty sales") || l.includes("venta") || l === "ty")) score += 2;
          if (score > maxScore) { maxScore = score; headerRowIdx = r; }
      }

      if (headerRowIdx === -1) { setUploadError("No se detectó una fila de encabezados válida en las primeras 20 filas."); setIsCleaning(false); return; }
      const headers = data[headerRowIdx].map(c => String(c || "").trim());
      setCleanerHeaders(headers);
      
      const headersLower = headers.map(h => h.toLowerCase());
      const findCol = (keywords, avoid = []) => {
        const idx = headersLower.findIndex(h => keywords.some(k => h.includes(k)) && !avoid.some(a => h.includes(a)));
        return idx >= 0 ? [idx.toString()] : [""];
      };
      const findAllCols = (keywords, avoid = []) => {
        const indices = [];
        headersLower.forEach((h, idx) => {
          if (h && keywords.some(k => h.includes(k)) && !avoid.some(a => h.includes(a))) {
            indices.push(idx.toString());
          }
        });
        return indices.length > 0 ? indices : [""];
      };

      const detectedStores = findAllCols(['store', 'tienda', 'local', 'sucursal']);
      const detectedTySales = findAllCols(['ty sales', 'actual', 'ventas ty', 'venta ty', 'sales $', 'ty $'], ['units', 'ly', 'shr', 'avg']);
      const detectedLySales = findAllCols(['ly sales', 'lysales', 'pasado', 'ventas ly', 'venta ly', 'ly $'], ['units', 'shr', 'avg']);
      const detectedTyUnits = findAllCols(['ty units', 'units', 'unidades', 'qty'], ['ly', 'sales', '$']);

      const initialMapping = {
        store: detectedStores,
        upc: findCol(['upc', 'barcode', 'ean', 'bar code'], ['id', 'interno', 'item id']),
        itemId: findCol(['item id', 'id', 'código', 'codigo', 'sku', 'item no', 'item #', 'cod'], ['upc', 'barcode', 'ean', 'store', 'tienda', 'vendor', 'suplidor']),
        desc: findCol(['desc', 'producto', 'name', 'artículo', 'articulo']),
        sz: findCol(['sz', 'size', 'tamaño', 'tamano']),
        category: findCol(['category', 'categoria', 'categoría', 'dept'], ['sub', 'minor']),
        segment: findCol(['segment', 'subcat', 'minor']),
        vendor: findCol(['vendor', 'suplid', 'proveedor', 'marca']),
        tySales: detectedTySales[0] !== "" ? detectedTySales : findCol(['ty sales', 'actual', 'ventas ty', 'venta', 'ty'], ['units', 'ly']),
        lySales: detectedLySales[0] !== "" ? detectedLySales : findCol(['ly sales', 'lysales', 'pasado', 'ly'], ['units']),
        tyUnits: detectedTyUnits[0] !== "" ? detectedTyUnits : findCol(['ty units', 'units', 'unidades', 'qty'], ['ly']),
        inv: findCol(['inv', 'stock', 'on hand', 'capacidad', 'existencia'])
      };
      setCleanerMapping(initialMapping);

      // Si hay múltiples columnas de TY Sales o Tiendas, sugerir nombres para cada encasillado (#1, #2, #3...)
      const maxSlots = Math.max(
        initialMapping.tySales.length,
        initialMapping.lySales.length,
        initialMapping.tyUnits.length,
        initialMapping.store.length
      );
      const autoSlotNames = {};
      for (let s = 0; s < maxSlots; s++) {
        const tyColIdx = initialMapping.tySales[s];
        const stColIdx = initialMapping.store[s];
        const rawHeader = (tyColIdx !== undefined && tyColIdx !== "" ? headers[Number(tyColIdx)] : "") ||
                          (stColIdx !== undefined && stColIdx !== "" ? headers[Number(stColIdx)] : "");
        const cleanHeaderStore = rawHeader
          .replace(/ty\s*sales|ly\s*sales|ty\s*units|ventas\s*ty|ventas|sales|\$|units|unidades/gi, '')
          .replace(/[-_()]/g, ' ')
          .trim();
        autoSlotNames[s] = cleanHeaderStore || `${detectedStore || 'Tienda'} #${s + 1}`;
      }
      setCleanerSlotStores(autoSlotNames);

      if (initialMapping.store[0] !== "") setCleanerStoreMode("multi");
      else if (initialMapping.tySales.length > 1) setCleanerStoreMode("parallel_cols");
      else setCleanerStoreMode("single");

      setCleanerMultiColMode(initialMapping.tySales.length > 1 && initialMapping.store[0] === "" ? "split_stores" : "sum");
      setCleanerStep(2); 
    } catch (err) { console.error(err); setUploadError("Error leyendo el archivo seleccionado."); } 
    finally { setIsCleaning(false); e.target.value = ''; }
  };

  const getMappedCols = (key) => {
    const val = cleanerMapping[key];
    if (Array.isArray(val)) return val.length > 0 ? val : [""];
    if (val !== undefined && val !== null && val !== "") return [String(val)];
    return [""];
  };

  const hasValidMappedCol = (key) => getMappedCols(key).some(c => c !== "" && c !== undefined && c !== null);

  const handleMappingSlotChange = (key, slotIndex, colValue) => {
    setCleanerMapping(prev => {
      const current = Array.isArray(prev[key]) ? [...prev[key]] : [prev[key] || ""];
      current[slotIndex] = colValue;
      return { ...prev, [key]: current };
    });
  };

  const addMappingSlot = (key, defaultCol = "") => {
    setCleanerMapping(prev => {
      const current = Array.isArray(prev[key]) ? [...prev[key]] : [prev[key] || ""];
      return { ...prev, [key]: [...current, defaultCol] };
    });
  };

  const removeMappingSlot = (key, slotIndex) => {
    setCleanerMapping(prev => {
      const current = Array.isArray(prev[key]) ? [...prev[key]] : [prev[key] || ""];
      const next = current.filter((_, idx) => idx !== slotIndex);
      return { ...prev, [key]: next.length > 0 ? next : [""] };
    });
  };

  const autoConnectMatchingColumns = (key, keywords, avoid = []) => {
    const headersLower = cleanerHeaders.map(h => String(h || "").toLowerCase());
    const matched = [];
    headersLower.forEach((h, idx) => {
      if (h && keywords.some(k => h.includes(k)) && !avoid.some(a => h.includes(a))) {
        matched.push(idx.toString());
      }
    });
    if (matched.length > 0) {
      setCleanerMapping(prev => ({ ...prev, [key]: matched }));
    }
  };

  const processCleanData = () => {
      setIsCleaning(true);
      try {
          const data = rawCleanData;
          const rawExtracted = [];
          const upcCols = getMappedCols('upc').filter(c => c !== "");
          const idCols = getMappedCols('itemId').filter(c => c !== "");
          const descCols = getMappedCols('desc').filter(c => c !== "");
          const storeCols = getMappedCols('store').filter(c => c !== "");
          const szCols = getMappedCols('sz').filter(c => c !== "");
          const catCols = getMappedCols('category').filter(c => c !== "");
          const segCols = getMappedCols('segment').filter(c => c !== "");
          const venCols = getMappedCols('vendor').filter(c => c !== "");
          const tyCols = getMappedCols('tySales').filter(c => c !== "");
          const lyCols = getMappedCols('lySales').filter(c => c !== "");
          const unitCols = getMappedCols('tyUnits').filter(c => c !== "");
          const invCols = getMappedCols('inv').filter(c => c !== "");

          let startRow = 0;
          const firstMappedCol = upcCols.length > 0
            ? Number(upcCols[0])
            : (idCols.length > 0 ? Number(idCols[0]) : (descCols.length > 0 ? Number(descCols[0]) : 0));
          for (let r = 0; r < Math.min(20, data.length); r++) {
              if (data[r] && data[r][firstMappedCol] === cleanerHeaders[firstMappedCol]) { startRow = r + 1; break; }
          }

          const parseNum = (val) => parseFloat(String(val || "0").replace(/[^0-9.-]+/g, "")) || 0;
          const cleanText = (val) => val ? String(val).trim().replace(/\s+/g, ' ').toUpperCase() : "";
          const getFirstValidText = (row, cols, slotIdx = null) => {
              if (!cols || cols.length === 0) return "";
              if (slotIdx !== null && cols[slotIdx] !== undefined) {
                  const v = String(row[Number(cols[slotIdx])] || "").trim().replace(/\s+/g, ' ');
                  if (v) return v;
              }
              for (const c of cols) {
                  const v = String(row[Number(c)] || "").trim().replace(/\s+/g, ' ');
                  if (v) return v;
              }
              return "";
          };

          const isSplitByStoreSlots = cleanerStoreMode === 'parallel_cols' || cleanerMultiColMode === 'split_stores';
          const numStoreSlots = Math.max(tyCols.length, lyCols.length, unitCols.length, storeCols.length, 1);

          for (let i = startRow; i < data.length; i++) {
              const row = data[i];
              if (!row || !row.length) continue;

              const baseDesc = getFirstValidText(row, descCols);
              const baseUpc = getFirstValidText(row, upcCols);
              const baseItemId = getFirstValidText(row, idCols);
              const lowerDesc = baseDesc.toLowerCase();
              if (baseDesc === "" || lowerDesc.includes("total") || lowerDesc.includes("página") || lowerDesc.includes("pagina")) continue;

              if (isSplitByStoreSlots && numStoreSlots > 1) {
                  // Modo Desglose por Tienda: El encasillado #1 corresponde a la Tienda #1, el #2 a la Tienda #2, etc.
                  for (let s = 0; s < numStoreSlots; s++) {
                      const desc = getFirstValidText(row, descCols, s) || baseDesc;
                      const upc = getFirstValidText(row, upcCols, s) || baseUpc;
                      const itemId = getFirstValidText(row, idCols, s) || baseItemId;
                      const tySales = tyCols[s] !== undefined ? parseNum(row[Number(tyCols[s])]) : 0;
                      const lySales = lyCols[s] !== undefined ? parseNum(row[Number(lyCols[s])]) : 0;
                      const tyUnits = unitCols[s] !== undefined ? parseNum(row[Number(unitCols[s])]) : 0;
                      const invVal = invCols[s] !== undefined ? parseNum(row[Number(invCols[s])]) : (invCols[0] !== undefined ? parseNum(row[Number(invCols[0])]) : 0);

                      if (upc === "" && itemId === "" && tySales === 0 && lySales === 0 && tyUnits === 0) continue;

                      let storeNameForSlot = "";
                      if (storeCols[s] !== undefined) {
                          storeNameForSlot = String(row[Number(storeCols[s])] || "").trim();
                      }
                      if (!storeNameForSlot) {
                          storeNameForSlot = cleanerSlotStores[s] || `${cleanerStoreName || 'Tienda'} #${s + 1}`;
                      }

                      rawExtracted.push({
                          store: cleanText(storeNameForSlot),
                          upc: String(upc || "").trim(),
                          itemId: String(itemId || "").trim(),
                          desc: cleanText(desc),
                          category: cleanText(getFirstValidText(row, catCols, s)) || "SIN CATEGORIA",
                          segment: cleanText(getFirstValidText(row, segCols, s)),
                          sz: cleanText(getFirstValidText(row, szCols, s)),
                          vendor: cleanText(getFirstValidText(row, venCols, s)) || "NO ESPECIFICADO",
                          tySales: tySales,
                          lySales: lySales,
                          tyUnits: tyUnits,
                          inv: invVal,
                          occurrences: 1
                      });
                  }
              } else {
                  // Modo Suma / Consolidación: Suma todas las columnas conectadas en TY, LY y Unidades
                  const tySales = tyCols.reduce((sum, c) => sum + parseNum(row[Number(c)]), 0);
                  const lySales = lyCols.reduce((sum, c) => sum + parseNum(row[Number(c)]), 0);
                  const tyUnits = unitCols.reduce((sum, c) => sum + parseNum(row[Number(c)]), 0);
                  const invVal = invCols.reduce((sum, c) => sum + parseNum(row[Number(c)]), 0);

                  if (baseUpc === "" && baseItemId === "" && tySales === 0 && lySales === 0 && tyUnits === 0) continue;

                  const rowStore = cleanerStoreMode === 'multi' && storeCols.length > 0
                      ? storeCols.map(c => String(row[Number(c)] || "").trim()).filter(Boolean).join(" - ")
                      : (cleanerStoreName || "Consolidado");

                  rawExtracted.push({
                      store: cleanText(rowStore || cleanerStoreName || "Consolidado"),
                      upc: String(baseUpc || "").trim(),
                      itemId: String(baseItemId || "").trim(),
                      desc: cleanText(baseDesc),
                      category: cleanText(getFirstValidText(row, catCols)) || "SIN CATEGORIA",
                      segment: cleanText(getFirstValidText(row, segCols)),
                      sz: cleanText(getFirstValidText(row, szCols)),
                      vendor: cleanText(getFirstValidText(row, venCols)) || "NO ESPECIFICADO",
                      tySales: tySales,
                      lySales: lySales,
                      tyUnits: tyUnits,
                      inv: invVal,
                      occurrences: 1
                  });
              }
          }

          // Consolidación automática de productos repetidos (suma TY, LY, Unidades e Inventario)
          let cleaned = [];
          let mergedDuplicatesCount = 0;

          if (cleanerMergeMode === "none") {
              cleaned = rawExtracted;
          } else {
              const mergedMap = new Map();
              const upcToKeyMap = new Map();

              rawExtracted.forEach(item => {
                  const normStore = item.store || "CONSOLIDADO";
                  const normDesc = item.desc || "";
                  const normUpc = item.upc ? item.upc.replace(/^0+/, '') : "";
                  const normId = item.itemId ? item.itemId.replace(/^0+/, '') : "";

                  let groupKey = `${normStore}__NAME__${normDesc || normUpc || normId}`;

                  if (cleanerMergeMode === "name_or_upc" && (normUpc || normId)) {
                      const codeLookupKey = `${normStore}__CODE__${normUpc || normId}`;
                      if (upcToKeyMap.has(codeLookupKey)) {
                          groupKey = upcToKeyMap.get(codeLookupKey);
                      } else {
                          upcToKeyMap.set(codeLookupKey, groupKey);
                      }
                  }

                  if (mergedMap.has(groupKey)) {
                      const existing = mergedMap.get(groupKey);
                      existing.tySales += item.tySales;
                      existing.lySales += item.lySales;
                      existing.tyUnits += item.tyUnits;
                      existing.inv += item.inv;
                      existing.occurrences = (existing.occurrences || 1) + 1;
                      mergedDuplicatesCount += 1;

                      if (!existing.upc && item.upc) existing.upc = item.upc;
                      if (!existing.itemId && item.itemId) existing.itemId = item.itemId;
                      if ((!existing.category || existing.category === "SIN CATEGORIA") && item.category && item.category !== "SIN CATEGORIA") {
                          existing.category = item.category;
                      }
                      if (!existing.segment && item.segment) existing.segment = item.segment;
                      if (!existing.sz && item.sz) existing.sz = item.sz;
                      if ((!existing.vendor || existing.vendor === "NO ESPECIFICADO") && item.vendor && item.vendor !== "NO ESPECIFICADO") {
                          existing.vendor = item.vendor;
                      }
                  } else {
                      mergedMap.set(groupKey, { ...item, occurrences: 1 });
                  }
              });

              cleaned = Array.from(mergedMap.values());
          }

          const mergedProductsList = cleaned
              .filter(item => (item.occurrences || 1) > 1)
              .sort((a, b) => b.tySales - a.tySales);

          setCleanedData({
              storeName: cleanerStoreName || "Multi_Tienda",
              items: cleaned,
              rawRowsCount: rawExtracted.length,
              mergedDuplicatesCount,
              mergedProductsList
          });
          setCleanerStep(3);
      } catch (err) {
          console.error(err);
          setUploadError("Error durante la limpieza de datos.");
      } finally {
          setIsCleaning(false);
      }
  };

  const sendCleanedDataToDashboard = () => {
    if (!cleanedData || !cleanedData.items.length) return;
    const formattedForDashboard = cleanedData.items.map((p, idx) => {
      const units = p.tyUnits || 0;
      const simulatedInv = Math.floor((units / 365) * 18) + 2;
      return {
        id: `clean_${Date.now()}_${idx}`,
        jdaId: p.itemId || p.upc || '',
        itemId: p.itemId || '',
        bitmapId: '',
        name: p.desc,
        store: p.store || 'Consolidado',
        upc: p.upc || p.itemId || '',
        category: p.category || 'SIN CATEGORIA',
        segment: p.segment || '',
        subCategory: p.sz || 'NO APLICA',
        vendor: p.vendor || 'NO ESPECIFICADO',
        brand: p.vendor || '',
        height: 8.0,
        width: 2.5,
        depth: 2.5,
        ty: p.tySales || 0,
        ly: p.lySales || 0,
        units: units,
        lyUnits: 0,
        inv: p.inv > 0 ? p.inv : simulatedInv
      };
    });

    setUploadedFiles(prev => [
      ...prev,
      {
        id: 'file_clean_' + Date.now(),
        name: `Limpio_${cleanedData.storeName}.xlsx`,
        data: formattedForDashboard,
        isActive: true,
        count: formattedForDashboard.length
      }
    ]);
    setActiveTab('inventory');
  };

  const downloadCleanedData = () => {
    if (!cleanedData || !cleanedData.items.length) return;
    const headers = ["Store Name", "UPC", "Item ID / Código", "Description", "Category", "Segment", "SZ", "Vendor Name", "TY Sales $$", "LY Sales $", "TY Units"];
    const rows = cleanedData.items.map(p => [p.store, p.upc || "", p.itemId || "", p.desc, p.category, p.segment, p.sz, p.vendor, p.tySales, p.lySales, p.tyUnits]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(val => typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val).join(","))].join("\n");
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Limpio_${cleanedData.storeName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCleanedDataExcel = () => {
    if (!cleanedData || !cleanedData.items.length || !window.XLSX) return;
    const headers = ["Store Name", "UPC", "Item ID / Código", "Description", "Category", "Segment", "SZ", "Vendor Name", "TY Sales $$", "LY Sales $", "TY Units"];
    const rows = cleanedData.items.map(p => [p.store, p.upc || "", p.itemId || "", p.desc, p.category, p.segment, p.sz, p.vendor, p.tySales, p.lySales, p.tyUnits]);
    const worksheet = window.XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Data_Limpia");
    const wbout = window.XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Limpio_${cleanedData.storeName}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetCleaner = () => { setCleanerStep(1); setRawCleanData([]); setCleanedData(null); setCleanerStoreMode("single"); setCleanerMultiColMode("sum"); setCleanerMergeMode("name"); setCleanerSlotStores({}); };
  const handleClearAllData = () => { setUploadedFiles([]); setSelectedProducts([]); setSelectedAnalysisStores([]); setJdaLibrary([]); setJdaHeaders([]); };
  const toggleFileActive = (fileId) => { setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, isActive: !f.isActive } : f)); setSelectedProducts([]); setSelectedAnalysisStores([]); };
  const deleteFile = (fileId) => { setUploadedFiles(prev => prev.filter(f => f.id !== fileId)); setSelectedProducts([]); setSelectedAnalysisStores([]); };

  const importedProducts = useMemo(() => {
    const activeFiles = uploadedFiles.filter(f => f.isActive);
    if (activeFiles.length === 0) return [];
    const combined = activeFiles.flatMap(f => f.data);
    const uniqueMap = new Map();
    combined.forEach(p => {
      const normStore = String(p.store || 'Varias').trim().toUpperCase();
      const normName = String(p.name || '').trim().replace(/\s+/g, ' ').toUpperCase();
      const normUpc = String(p.upc || '').trim();
      const key = normName ? `${normStore}__NAME__${normName}` : `${normStore}__UPC__${normUpc}`;

      if (uniqueMap.has(key)) {
        const existing = uniqueMap.get(key);
        existing.ty = (existing.ty || 0) + (p.ty || 0);
        existing.ly = (existing.ly || 0) + (p.ly || 0);
        existing.units = (existing.units || 0) + (p.units || 0);
        existing.lyUnits = (existing.lyUnits || 0) + (p.lyUnits || 0);
        existing.inv = (existing.inv || 0) + (p.inv || 0);
        existing.occurrences = (existing.occurrences || 1) + 1;
        if (!existing.upc && p.upc) existing.upc = p.upc;
        if ((!existing.category || existing.category === 'DESCONOCIDA' || existing.category === 'SIN CATEGORIA') && p.category) {
          existing.category = p.category;
        }
        if ((!existing.vendor || existing.vendor === 'N/A' || existing.vendor === 'NO ESPECIFICADO') && p.vendor) {
          existing.vendor = p.vendor;
        }
      } else {
        uniqueMap.set(key, { ...p, occurrences: p.occurrences || 1 });
      }
    });
    const deduplicated = Array.from(uniqueMap.values());
    deduplicated.sort((a, b) => b.ty - a.ty);
    return deduplicated;
  }, [uploadedFiles]);

  const displayProducts = useMemo(() => {
    const baseProducts = uploadedFiles.length > 0 ? importedProducts : globalData.allProducts;
    if (jdaLibrary.length === 0) return baseProducts;
    const libMap = new Map();
    jdaLibrary.forEach(item => {
      if (item.upc) libMap.set(item.upc.replace(/^0+/, ''), item); 
      if (item.id) libMap.set(item.id, item); 
    });
    return baseProducts.map(p => {
      const cleanUpc = p.upc ? String(p.upc).replace(/^0+/, '') : '';
      const match = libMap.get(cleanUpc) || libMap.get(p.upc) || libMap.get(p.jdaId);
      if (match) {
        return {
          ...p,
          jdaId: match.id || p.jdaId,
          bitmapId: match.bitmapId || p.bitmapId,
          name: match.name || p.name,
          vendor: match.supplier || p.vendor,
          brand: match.brand || p.brand,
          category: match.category || p.category,
          subCategory: match.subcategory || p.subCategory,
          height: match.height || p.height || 8.0,
          width: match.width || p.width || 2.5,
          depth: match.depth || p.depth || 2.5,
          hasJdaMeasures: Boolean(match.width || match.height || match.depth)
        };
      }
      return p;
    });
  }, [importedProducts, uploadedFiles, jdaLibrary]);

  const uniqueStores = useMemo(() => [...new Set(displayProducts.map(p => p.store))].filter(Boolean), [displayProducts]);
  const uniqueCategories = useMemo(() => [...new Set(displayProducts.map(p => p.category))].filter(Boolean), [displayProducts]);
  const uniqueSegments = useMemo(() => [...new Set(displayProducts.map(p => p.segment))].filter(Boolean), [displayProducts]);
  const uniqueVendors = useMemo(() => [...new Set(displayProducts.map(p => p.vendor))].filter(Boolean), [displayProducts]);

  const getRegionAndTownForStore = (storeName) => {
    if (customTownOverrides[storeName]) {
      const assignedTown = customTownOverrides[storeName];
      for (const [region, towns] of Object.entries(PR_REGIONS)) {
        if (towns.includes(assignedTown)) return { region, town: assignedTown };
      }
    }
    const cleanStr = (s) => String(s || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const lower = cleanStr(storeName);

    // Ordenamos los municipios de mayor a menor longitud para priorizar nombres compuestos (ej. "Toa Alta", "Vega Baja")
    const allPairs = [];
    for (const [region, towns] of Object.entries(PR_REGIONS)) {
      towns.forEach(town => allPairs.push({ region, town, cleanTown: cleanStr(town) }));
    }
    allPairs.sort((a, b) => b.cleanTown.length - a.cleanTown.length);

    const match = allPairs.find(item => lower.includes(item.cleanTown));
    if (match) return { region: match.region, town: match.town };

    return { region: 'Sin Asignar', town: 'Sin Asignar' };
  };

  const getRegionForStore = (storeName) => getRegionAndTownForStore(storeName).region;

  const mapData = useMemo(() => {
    const totalIslandTy = displayProducts.reduce((sum, p) => sum + (p.ty || 0), 0);
    const regions = {
      Metro: { name: 'Metro', zoneLabel: 'Área Metropolitana', ty: 0, ly: 0, units: 0, inv: 0, stores: new Set(), skus: new Set(), categories: {}, vendors: {}, pueblos: {} },
      Norte: { name: 'Norte', zoneLabel: 'Costa Norte & Atlántico', ty: 0, ly: 0, units: 0, inv: 0, stores: new Set(), skus: new Set(), categories: {}, vendors: {}, pueblos: {} },
      Centro: { name: 'Centro', zoneLabel: 'Cordillera Central & Caguas', ty: 0, ly: 0, units: 0, inv: 0, stores: new Set(), skus: new Set(), categories: {}, vendors: {}, pueblos: {} },
      Este: { name: 'Este', zoneLabel: 'Valle Oriental & Islas Municipio', ty: 0, ly: 0, units: 0, inv: 0, stores: new Set(), skus: new Set(), categories: {}, vendors: {}, pueblos: {} },
      Sur: { name: 'Sur', zoneLabel: 'Llanura Costera del Caribe', ty: 0, ly: 0, units: 0, inv: 0, stores: new Set(), skus: new Set(), categories: {}, vendors: {}, pueblos: {} },
      Oeste: { name: 'Oeste', zoneLabel: 'Porta del Sol & Mayagüez', ty: 0, ly: 0, units: 0, inv: 0, stores: new Set(), skus: new Set(), categories: {}, vendors: {}, pueblos: {} },
      'Sin Asignar': { name: 'Sin Asignar', zoneLabel: 'Pendiente de Municipio', ty: 0, ly: 0, units: 0, inv: 0, stores: new Set(), skus: new Set(), categories: {}, vendors: {}, pueblos: {} }
    };

    displayProducts.forEach(p => {
      const { region, town: pueblo } = getRegionAndTownForStore(p.store);

      if (regions[region]) {
        regions[region].ty += p.ty || 0;
        regions[region].ly += p.ly || 0;
        regions[region].units += p.units || 0;
        regions[region].inv += p.inv || 0;
        regions[region].stores.add(p.store);
        regions[region].skus.add(p.upc || p.name);
        regions[region].categories[p.category] = (regions[region].categories[p.category] || 0) + (p.ty || 0);
        regions[region].vendors[p.vendor] = (regions[region].vendors[p.vendor] || 0) + (p.ty || 0);
        
        if (pueblo !== 'Sin Asignar') {
            if (!regions[region].pueblos[pueblo]) {
                regions[region].pueblos[pueblo] = { name: pueblo, region, ty: 0, ly: 0, units: 0, inv: 0, stores: new Set(), skus: new Set(), categories: {}, vendors: {} };
            }
            regions[region].pueblos[pueblo].ty += p.ty || 0;
            regions[region].pueblos[pueblo].ly += p.ly || 0;
            regions[region].pueblos[pueblo].units += p.units || 0;
            regions[region].pueblos[pueblo].inv += p.inv || 0;
            regions[region].pueblos[pueblo].stores.add(p.store);
            regions[region].pueblos[pueblo].skus.add(p.upc || p.name);
            regions[region].pueblos[pueblo].categories[p.category] = (regions[region].pueblos[pueblo].categories[p.category] || 0) + (p.ty || 0);
            regions[region].pueblos[pueblo].vendors[p.vendor] = (regions[region].pueblos[pueblo].vendors[p.vendor] || 0) + (p.ty || 0);
        }
      }
    });
    return Object.values(regions).map(r => {
      const storeCount = r.stores.size;
      const totalTownsInRegion = PR_REGIONS[r.name] ? PR_REGIONS[r.name].length : 0;
      const activeTownsCount = Object.keys(r.pueblos || {}).length;
      const growth = r.ly > 0 ? ((r.ty / r.ly) - 1) * 100 : (r.ty > 0 ? 100 : 0);
      const aur = r.units > 0 ? r.ty / r.units : 0;
      return {
        ...r,
        storeCount,
        totalTownsInRegion,
        activeTownsCount,
        penetrationPct: totalTownsInRegion > 0 ? (activeTownsCount / totalTownsInRegion) * 100 : 0,
        skuCount: r.skus.size,
        storeNames: Array.from(r.stores),
        growth,
        aur,
        shareOfIsland: totalIslandTy > 0 ? (r.ty / totalIslandTy) * 100 : 0,
        salesPerStore: storeCount > 0 ? r.ty / storeCount : 0,
        topCategory: Object.entries(r.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
        topVendor: Object.entries(r.vendors).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
      };
    });
  }, [displayProducts, customTownOverrides]);

  const regionalDetails = useMemo(() => {
    if (!selectedMapRegion && !selectedMapTown) return null;
    const totalIslandTy = displayProducts.reduce((sum, p) => sum + (p.ty || 0), 0);

    let targetObj = null;
    let targetStores = [];
    let isTownLevel = false;

    if (selectedMapTown) {
      isTownLevel = true;
      let foundTownData = null;
      let parentRegionName = 'Metro';
      for (const [rName, tList] of Object.entries(PR_REGIONS)) {
        if (tList.includes(selectedMapTown)) { parentRegionName = rName; break; }
      }
      for (const r of mapData) {
        if (r.pueblos && r.pueblos[selectedMapTown]) {
          foundTownData = r.pueblos[selectedMapTown];
          parentRegionName = r.name;
          break;
        }
      }
      const stCount = foundTownData ? foundTownData.stores.size : 0;
      const tyVal = foundTownData ? foundTownData.ty : 0;
      const lyVal = foundTownData ? foundTownData.ly : 0;
      const unitsVal = foundTownData ? foundTownData.units : 0;
      targetStores = foundTownData ? Array.from(foundTownData.stores) : [];
      targetObj = {
        name: selectedMapTown,
        parentRegion: parentRegionName,
        ty: tyVal,
        ly: lyVal,
        units: unitsVal,
        aur: unitsVal > 0 ? tyVal / unitsVal : 0,
        storeCount: stCount,
        skuCount: foundTownData ? foundTownData.skus.size : 0,
        growth: lyVal > 0 ? ((tyVal / lyVal) - 1) * 100 : (tyVal > 0 ? 100 : 0),
        salesPerStore: stCount > 0 ? tyVal / stCount : 0,
        shareOfIsland: totalIslandTy > 0 ? (tyVal / totalIslandTy) * 100 : 0,
        topCategory: foundTownData ? (Object.entries(foundTownData.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A') : 'N/A',
        topVendor: foundTownData ? (Object.entries(foundTownData.vendors).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A') : 'N/A',
        pueblos: {}
      };
    } else {
      targetObj = mapData.find(r => r.name === selectedMapRegion);
      targetStores = targetObj?.storeNames || [];
    }

    const storesPerform = targetStores.map(storeName => {
      const storeProducts = displayProducts.filter(p => p.store === storeName);
      const ty = storeProducts.reduce((sum, p) => sum + p.ty, 0);
      const ly = storeProducts.reduce((sum, p) => sum + p.ly, 0);
      const units = storeProducts.reduce((sum, p) => sum + p.units, 0);
      const townInfo = getRegionAndTownForStore(storeName);
      return {
        name: storeName,
        town: townInfo.town,
        ty,
        ly,
        units,
        growth: ly > 0 ? ((ty / ly) - 1) * 100 : (ty > 0 ? 100 : 0),
        shareInRegion: targetObj?.ty > 0 ? (ty / targetObj.ty) * 100 : 0
      };
    }).sort((a, b) => b.ty - a.ty);

    const pMap = new Map();
    const catMap = new Map();
    const presentSkuKeys = new Set();

    displayProducts.filter(p => targetStores.includes(p.store)).forEach(p => {
      const key = p.upc || p.name;
      if (p.ty > 0) presentSkuKeys.add(key);
      if (!pMap.has(key)) pMap.set(key, { ...p, ty: 0, ly: 0, units: 0 });
      pMap.get(key).ty += p.ty;
      pMap.get(key).ly += p.ly;
      pMap.get(key).units += p.units;

      if (!catMap.has(p.category)) catMap.set(p.category, { name: p.category, value: 0 });
      catMap.get(p.category).value += p.ty;
    });

    // Brechas de Surtido (Gap Analysis): Productos Top en toda la Isla que NO se están vendiendo en este Pueblo/Región
    const islandSkuMap = new Map();
    const totalIslandStores = Math.max(1, uniqueStores.length);
    displayProducts.forEach(p => {
      const key = p.upc || p.name;
      if (!islandSkuMap.has(key)) {
        islandSkuMap.set(key, { name: p.name, upc: p.upc, category: p.category, vendor: p.vendor, islandTy: 0, storesSelling: new Set() });
      }
      const item = islandSkuMap.get(key);
      item.islandTy += p.ty || 0;
      if ((p.ty || 0) > 0) item.storesSelling.add(p.store);
    });

    const missingTopSkus = Array.from(islandSkuMap.entries())
      .filter(([key, val]) => !presentSkuKeys.has(key) && val.islandTy > 0)
      .map(([key, val]) => {
        const avgPerStore = val.islandTy / Math.max(1, val.storesSelling.size);
        const targetStoreMultiplier = Math.max(1, targetStores.length);
        return {
          ...val,
          storePenetration: (val.storesSelling.size / totalIslandStores) * 100,
          estimatedOpportunity: avgPerStore * targetStoreMultiplier * 0.65
        };
      })
      .sort((a, b) => b.islandTy - a.islandTy)
      .slice(0, 15);

    const topProducts = Array.from(pMap.values()).map(p => ({
      ...p,
      growth: p.ly > 0 ? ((p.ty / p.ly) - 1) * 100 : (p.ty > 0 ? 100 : 0),
      aur: p.units > 0 ? p.ty / p.units : 0
    })).sort((a, b) => b.ty - a.ty).slice(0, 15);

    // Índice de Afinidad Regional por Categoría (CDI: Category Development Index vs Isla)
    const islandCatMap = new Map();
    displayProducts.forEach(p => {
      islandCatMap.set(p.category, (islandCatMap.get(p.category) || 0) + (p.ty || 0));
    });

    const categoryMix = Array.from(catMap.values()).map(c => {
      const localShare = (targetObj?.ty || 0) > 0 ? (c.value / targetObj.ty) * 100 : 0;
      const islandCatTy = islandCatMap.get(c.name) || 0;
      const islandShare = totalIslandTy > 0 ? (islandCatTy / totalIslandTy) * 100 : 0;
      const affinityIndex = islandShare > 0 ? (localShare / islandShare) * 100 : 100;
      return { ...c, localShare, islandShare, affinityIndex };
    }).sort((a, b) => b.value - a.value).slice(0, 6);

    // Benchmark para Simulador de Expansión White Space (Potencial de Apertura en el Municipio/Región)
    const parentRegName = isTownLevel ? targetObj?.parentRegion : targetObj?.name;
    const parentRegObj = mapData.find(r => r.name === parentRegName);
    const activeRegionsWithStores = mapData.filter(r => r.name !== 'Sin Asignar' && r.storeCount > 0);
    const islandAvgPerStore = activeRegionsWithStores.length > 0
      ? totalIslandTy / Math.max(1, uniqueStores.length)
      : 125000;
    const regionalBenchmarkPerStore = (parentRegObj && parentRegObj.salesPerStore > 0)
      ? parentRegObj.salesPerStore
      : (islandAvgPerStore > 0 ? islandAvgPerStore : 125000);

    // Kit Recomendado de Apertura (Top 10 SKUs de la Región o de la Isla para sembrar en este pueblo)
    const regionStoresList = parentRegObj?.storeNames?.length > 0 ? parentRegObj.storeNames : uniqueStores;
    const seedSkuMap = new Map();
    displayProducts.filter(p => regionStoresList.includes(p.store)).forEach(p => {
      const k = p.upc || p.name;
      if (!seedSkuMap.has(k)) seedSkuMap.set(k, { name: p.name, upc: p.upc, category: p.category, ty: 0, units: 0 });
      seedSkuMap.get(k).ty += p.ty || 0;
      seedSkuMap.get(k).units += p.units || 0;
    });
    const recommendedLaunchKit = Array.from(seedSkuMap.values())
      .sort((a, b) => b.ty - a.ty)
      .slice(0, 10);

    return {
      regionObj: targetObj,
      isTownLevel,
      storesPerform,
      topProducts,
      missingTopSkus,
      categoryMix,
      regionalBenchmarkPerStore,
      islandAvgPerStore,
      recommendedLaunchKit
    };
  }, [selectedMapRegion, selectedMapTown, mapData, displayProducts, customTownOverrides, uniqueStores]);

  const storeStats = useMemo(() => {
    const stats = {};
    const totalChainSales = displayProducts.reduce((s, p) => s + (p.ty || 0), 0);
    displayProducts.forEach(p => {
      if (!stats[p.store]) {
        const { region, town } = getRegionAndTownForStore(p.store);
        stats[p.store] = {
          name: p.store,
          region,
          town,
          ty: 0,
          ly: 0,
          units: 0,
          inv: 0,
          categories: {},
          vendors: {},
          productCount: 0
        };
      }
      stats[p.store].ty += p.ty;
      stats[p.store].ly += p.ly;
      stats[p.store].units += p.units || 0;
      stats[p.store].inv += p.inv || 0;
      stats[p.store].productCount += 1;
      stats[p.store].categories[p.category] = (stats[p.store].categories[p.category] || 0) + p.ty;
      stats[p.store].vendors[p.vendor] = (stats[p.store].vendors[p.vendor] || 0) + p.ty;
    });
    return Object.values(stats).map(s => {
      const growth = s.ly > 0 ? ((s.ty / s.ly) - 1) * 100 : (s.ty > 0 ? 100 : 0);
      const salesPerSku = s.productCount > 0 ? s.ty / s.productCount : 0;
      const aur = s.units > 0 ? s.ty / s.units : 0;
      const dos = s.units > 0 ? s.inv / (s.units / 365) : 0;
      const shareOfChain = totalChainSales > 0 ? (s.ty / totalChainSales) * 100 : 0;
      const topCategory = Object.entries(s.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      return { ...s, growth, salesPerSku, aur, dos, shareOfChain, topCategory };
    }).sort((a, b) => b.ty - a.ty);
  }, [displayProducts, customTownOverrides]);

  const filteredStores = useMemo(() => {
    const list = storeStats.filter(s =>
      s.name.toLowerCase().includes(storeSearchTerm.toLowerCase()) ||
      s.region.toLowerCase().includes(storeSearchTerm.toLowerCase()) ||
      (s.town && s.town.toLowerCase().includes(storeSearchTerm.toLowerCase()))
    );
    return [...list].sort((a, b) => (b[storeSortBy] || 0) - (a[storeSortBy] || 0));
  }, [storeSearchTerm, storeStats, storeSortBy]);

  const toggleStoreAnalysisSelection = (storeName) => setSelectedAnalysisStores(prev => prev.includes(storeName) ? prev.filter(s => s !== storeName) : [...prev, storeName]);

  const selectedStoresData = useMemo(() => {
    const totalChainSales = storeStats.reduce((s, st) => s + st.ty, 0);
    const data = {
      tyTotal: 0,
      lyTotal: 0,
      unitsTotal: 0,
      invTotal: 0,
      skuCountTotal: 0,
      shareOfChain: 0,
      weightedGrowth: 0,
      avgAur: 0,
      salesPerSku: 0,
      comparisonChart: [],
      categoriesChart: [],
      vendorsChart: [],
      topSkusInSelection: []
    };
    if (selectedAnalysisStores.length === 0) return data;
    const categoriesMap = {};
    const vendorsMap = {};
    const skuMap = new Map();

    selectedAnalysisStores.forEach(storeName => {
      const store = storeStats.find(s => s.name === storeName);
      if (store) {
        data.tyTotal += store.ty;
        data.lyTotal += store.ly;
        data.unitsTotal += store.units;
        data.invTotal += store.inv;
        data.skuCountTotal += store.productCount;
        data.comparisonChart.push({
          name: store.name,
          ty: store.ty,
          ly: store.ly,
          growth: Number(store.growth.toFixed(1)),
          salesPerSku: Math.round(store.salesPerSku)
        });
        Object.entries(store.categories).forEach(([cat, val]) => categoriesMap[cat] = (categoriesMap[cat] || 0) + val);
        Object.entries(store.vendors).forEach(([ven, val]) => vendorsMap[ven] = (vendorsMap[ven] || 0) + val);
      }
    });

    displayProducts.filter(p => selectedAnalysisStores.includes(p.store)).forEach(p => {
      const key = p.upc || p.name;
      if (!skuMap.has(key)) skuMap.set(key, { ...p, ty: 0, ly: 0, units: 0, storesPresent: new Set() });
      skuMap.get(key).ty += p.ty;
      skuMap.get(key).ly += p.ly;
      skuMap.get(key).units += p.units;
      skuMap.get(key).storesPresent.add(p.store);
    });

    data.shareOfChain = totalChainSales > 0 ? (data.tyTotal / totalChainSales) * 100 : 0;
    data.weightedGrowth = data.lyTotal > 0 ? ((data.tyTotal / data.lyTotal) - 1) * 100 : 0;
    data.avgAur = data.unitsTotal > 0 ? data.tyTotal / data.unitsTotal : 0;
    data.salesPerSku = data.skuCountTotal > 0 ? data.tyTotal / data.skuCountTotal : 0;
    data.categoriesChart = Object.entries(categoriesMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    data.vendorsChart = Object.entries(vendorsMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
    data.topSkusInSelection = Array.from(skuMap.values()).map(item => ({
      ...item,
      storeCount: item.storesPresent.size,
      growth: item.ly > 0 ? ((item.ty / item.ly) - 1) * 100 : (item.ty > 0 ? 100 : 0)
    })).sort((a, b) => b.ty - a.ty).slice(0, 12);

    return data;
  }, [selectedAnalysisStores, storeStats, displayProducts]);

  const filteredProducts = useMemo(() => {
    return displayProducts.filter(product => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (product.name && product.name.toLowerCase().includes(term)) ||
        (product.upc && String(product.upc).toLowerCase().includes(term)) ||
        (product.itemId && String(product.itemId).toLowerCase().includes(term)) ||
        (product.jdaId && String(product.jdaId).toLowerCase().includes(term)) ||
        (product.id && String(product.id).toLowerCase().includes(term)) ||
        (product.category && product.category.toLowerCase().includes(term)) ||
        (product.vendor && product.vendor.toLowerCase().includes(term));
      const safeMatch = (val, filterVal) => String(val).trim().toLowerCase() === String(filterVal).trim().toLowerCase();
      return matchesSearch && (selectedStoreFilter === "Todas" || safeMatch(product.store, selectedStoreFilter)) && (selectedCategoryFilter === "Todas" || safeMatch(product.category, selectedCategoryFilter)) && (selectedSegmentFilter === "Todos" || safeMatch(product.segment, selectedSegmentFilter)) && (selectedVendorFilter === "Todos" || safeMatch(product.vendor, selectedVendorFilter));
    });
  }, [searchTerm, selectedStoreFilter, selectedCategoryFilter, selectedSegmentFilter, selectedVendorFilter, displayProducts]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedStoreFilter, selectedCategoryFilter, selectedSegmentFilter, selectedVendorFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const toggleProductSelection = (id) => setSelectedProducts(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  const toggleAllSelection = () => setSelectedProducts(selectedProducts.length === filteredProducts.length ? [] : filteredProducts.map(p => p.id));
  const selectedTotals = useMemo(() => { let ty = 0, ly = 0; displayProducts.forEach(p => { if (selectedProducts.includes(p.id)) { ty += p.ty; ly += p.ly; } }); return { ty, ly }; }, [selectedProducts, displayProducts]);
  const selectedProductsChartData = useMemo(() => displayProducts.filter(p => selectedProducts.includes(p.id)).map(p => ({ ...p, chartLabel: `${p.name.substring(0, 18)} (${p.store.substring(0, 3).toUpperCase()})` })), [selectedProducts, displayProducts]);

  const paretoAnalysis = useMemo(() => {
    const filtered = filterAndConsolidateProducts(displayProducts, {
      store: paretoStoreFilter,
      category: paretoCategoryFilter
    }).sort((a, b) => b.ty - a.ty);
    const totalSales = filtered.reduce((s, p) => s + p.ty, 0);
    const totalUnits = filtered.reduce((s, p) => s + p.units, 0);
    const totalInv = filtered.reduce((s, p) => s + p.inv, 0);
    let accumulated = 0;
    const top80 = [];
    const bottom20 = [];
    const enrichedAll = filtered.map((p, idx) => {
      accumulated += p.ty;
      const sharePct = totalSales > 0 ? (p.ty / totalSales) * 100 : 0;
      const cumPct = totalSales > 0 ? (accumulated / totalSales) * 100 : 0;
      const growth = p.ly > 0 ? ((p.ty / p.ly) - 1) * 100 : (p.ty > 0 ? 100 : 0);
      const isVital = accumulated <= totalSales * 0.8 || top80.length === 0;
      const itemWithMeta = { ...p, rank: idx + 1, sharePct, cumPct, growth, isVital };
      if (isVital) top80.push(itemWithMeta);
      else bottom20.push(itemWithMeta);
      return itemWithMeta;
    });

    const topSales = top80.reduce((s, p) => s + p.ty, 0);
    const bottomSales = bottom20.reduce((s, p) => s + p.ty, 0);
    const bottomInv = bottom20.reduce((s, p) => s + p.inv, 0);

    const curveChartData = enrichedAll.slice(0, 25).map(p => ({
      name: p.name.substring(0, 14),
      ty: p.ty,
      cumPct: Number(p.cumPct.toFixed(1))
    }));

    return {
      totalItems: filtered.length,
      totalSales,
      totalUnits,
      totalInv,
      topItemsCount: top80.length,
      bottomItemsCount: bottom20.length,
      topPercentage: filtered.length > 0 ? (top80.length / filtered.length) * 100 : 0,
      topSales,
      bottomSales,
      salesPerVitalSku: top80.length > 0 ? topSales / top80.length : 0,
      salesPerMarginalSku: bottom20.length > 0 ? bottomSales / bottom20.length : 0,
      bottomInvShare: totalInv > 0 ? (bottomInv / totalInv) * 100 : 0,
      top80,
      bottom20,
      curveChartData
    };
  }, [displayProducts, paretoStoreFilter, paretoCategoryFilter]);

  const rankedProducts = useMemo(() => {
    const consolidated = filterAndConsolidateProducts(displayProducts, {
      store: rankingStoreFilter,
      category: rankingCategoryFilter,
      vendor: rankingVendorFilter
    });
    const totalViewSales = consolidated.reduce((sum, p) => sum + p.ty, 0);
    let items = consolidated.map(p => {
      const growth = p.ly > 0 ? ((p.ty / p.ly) - 1) * 100 : (p.ty > 0 ? 100 : 0);
      const aur = p.units > 0 ? p.ty / p.units : 0;
      const dos = p.units > 0 ? p.inv / (p.units / 365) : 999;
      const shareOfTotal = totalViewSales > 0 ? (p.ty / totalViewSales) * 100 : 0;
      const deltaDollars = p.ty - p.ly;
      return { ...p, growth, aur, dos, shareOfTotal, deltaDollars };
    });
    items.sort((a, b) => rankingOrder === 'desc' ? (b[rankingMetric] || 0) - (a[rankingMetric] || 0) : (a[rankingMetric] || 0) - (b[rankingMetric] || 0));
    return items;
  }, [displayProducts, rankingStoreFilter, rankingCategoryFilter, rankingVendorFilter, rankingMetric, rankingOrder]);

  const rankingKpis = useMemo(() => {
    const subset = rankedProducts.slice(0, rankingLimit);
    const totalPortfolioTy = rankedProducts.reduce((s, p) => s + p.ty, 0);
    const subsetTy = subset.reduce((s, p) => s + p.ty, 0);
    const subsetLy = subset.reduce((s, p) => s + p.ly, 0);
    const subsetUnits = subset.reduce((s, p) => s + p.units, 0);
    return {
      subsetTy,
      shareOfPortfolio: totalPortfolioTy > 0 ? (subsetTy / totalPortfolioTy) * 100 : 0,
      avgAur: subsetUnits > 0 ? subsetTy / subsetUnits : 0,
      weightedGrowth: subsetLy > 0 ? ((subsetTy / subsetLy) - 1) * 100 : 0,
      maxMetricVal: subset.length > 0 ? Math.max(...subset.map(p => Math.abs(p[rankingMetric] || 0)), 1) : 1
    };
  }, [rankedProducts, rankingLimit, rankingMetric]);

  const top10RankedChart = useMemo(() => rankedProducts.slice(0, 10).map(p => ({ name: p.name.substring(0, 15), value: p[rankingMetric] || 0, fullName: p.name })), [rankedProducts, rankingMetric]);

  const dosAnalysis = useMemo(() => {
    let filtered = filterAndConsolidateProducts(displayProducts, {
      store: paretoStoreFilter,
      category: paretoCategoryFilter
    });
    let globalLostSales = 0; let globalLostUnits = 0;
    filtered = filtered.map(p => {
      const dailyMovement = p.units / dosPeriodDays;
      const dos = dailyMovement > 0 ? (p.inv / dailyMovement) : 999;
      const requiredInventoryForTarget = dailyMovement * targetDos;
      let lostUnits = 0; let lostSales = 0;
      if (requiredInventoryForTarget > p.inv && dailyMovement > 0) {
        lostUnits = requiredInventoryForTarget - p.inv;
        lostSales = lostUnits * (p.units > 0 ? p.ty / p.units : 0);
      }
      globalLostUnits += lostUnits; globalLostSales += lostSales;
      return { ...p, dailyMovement, dos, lostUnits, lostSales };
    }).sort((a, b) => a.dos - b.dos);
    const validDos = filtered.filter(p => p.dos < 999);
    return { items: filtered, outOfStockRisk: filtered.filter(p => p.dos < 7 && p.units > 0), overstocked: filtered.filter(p => p.dos > 30 && p.inv > 0), healthy: filtered.filter(p => p.dos >= 7 && p.dos <= 30), avgDos: validDos.length > 0 ? validDos.reduce((s, p) => s + p.dos, 0) / validDos.length : 0, globalLostSales, globalLostUnits };
  }, [displayProducts, paretoStoreFilter, paretoCategoryFilter, dosPeriodDays, targetDos]);

  const rationalizationAnalysis = useMemo(() => {
    const all = displayProducts.map(p => {
      const growth = p.ly > 0 ? (p.ty - p.ly) / p.ly : 1;
      const dos = (p.units > 0) ? (p.inv / (p.units / 365)) : 999;
      let action = 'KEEP'; let reason = 'Rendimiento Promedio';
      if (growth > 0.2 && p.ty > 1000) { action = 'GROW'; reason = 'Alto Crecimiento'; }
      else if (growth < -0.2 && p.ty > 500) { action = 'REVIEW'; reason = 'Caída Fuerte'; }
      else if (dos > 90 && p.ty < 500) { action = 'DROP'; reason = 'Lento Movimiento'; }
      else if (p.ty < 100 && p.ly < 100) { action = 'DROP'; reason = 'Baja Venta Crónica'; }
      else if (p.ly === 0 && p.ty > 0) { action = 'WATCH'; reason = 'Producto Nuevo'; }
      return { ...p, action, reason, growth };
    }).sort((a,b) => b.ty - a.ty);
    return { all, summary: { GROW: all.filter(p => p.action === 'GROW'), KEEP: all.filter(p => p.action === 'KEEP'), WATCH: all.filter(p => p.action === 'WATCH'), REVIEW: all.filter(p => p.action === 'REVIEW'), DROP: all.filter(p => p.action === 'DROP') } };
  }, [displayProducts]);

  const pricingAnalysis = useMemo(() => {
    const catMap = new Map();
    displayProducts.forEach(p => {
      if(p.units <= 0 || p.ty <= 0 || p.category === 'SIN CATEGORIA') return;
      const aur = p.ty / p.units;
      if(!catMap.has(p.category)) catMap.set(p.category, { name: p.category, items: [], totalTy: 0, totalUnits: 0 });
      catMap.get(p.category).items.push({...p, aur});
      catMap.get(p.category).totalTy += p.ty; catMap.get(p.category).totalUnits += p.units;
    });
    return Array.from(catMap.values()).filter(c => c.items.length >= 3).map(c => {
      c.items.sort((a,b) => a.aur - b.aur);
      return { name: c.name, minAurItem: c.items[0], maxAurItem: c.items[c.items.length - 1], avgAur: c.totalTy / c.totalUnits };
    }).sort((a,b) => b.totalTy - a.totalTy).slice(0, 15);
  }, [displayProducts]);

  const elasticityAnalysis = useMemo(() => {
    if (!displayProducts || displayProducts.length === 0) return null;

    const filtered = filterAndConsolidateProducts(displayProducts, {
      store: elasticityStoreFilter,
      category: elasticityCategoryFilter,
      minSales: 0
    }).filter(p => p.units > 0);

    if (filtered.length === 0) return null;

    // Benchmarks por categoría para calcular posición relativa de precio (RPI) y velocidad
    const catBenchmarks = new Map();
    filtered.forEach(p => {
      if (!catBenchmarks.has(p.category)) {
        catBenchmarks.set(p.category, { totalTy: 0, totalUnits: 0, count: 0 });
      }
      const c = catBenchmarks.get(p.category);
      c.totalTy += p.ty;
      c.totalUnits += p.units;
      c.count += 1;
    });

    const marginRatio = elasticityBaseMargin / 100;
    const priceChangeRatio = simPriceChangePct / 100;

    let totalWeightedEd = 0;
    let totalPortfolioTy = 0;
    let inelasticOpportunityDollars = 0;
    const catSummaryMap = new Map();

    const items = filtered.map(p => {
      const aur = p.ty / p.units;
      const unitCost = aur * (1 - marginRatio);
      const catStats = catBenchmarks.get(p.category) || { totalTy: p.ty, totalUnits: p.units, count: 1 };
      const catAvgAur = catStats.totalUnits > 0 ? catStats.totalTy / catStats.totalUnits : aur;
      const catAvgUnits = catStats.count > 0 ? catStats.totalUnits / catStats.count : p.units;

      const rpi = catAvgAur > 0 ? (aur / catAvgAur) : 1.0;
      const velocityIndex = catAvgUnits > 0 ? (p.units / catAvgUnits) : 1.0;
      const yoyGrowth = p.ly > 0 ? ((p.ty - p.ly) / p.ly) : 0.12;

      // Si existen unidades del año pasado y cambio de precio real, usamos elasticidad arco observada;
      // de lo contrario, estimamos elasticidad estructural cruzando RPI, Velocidad relativa y Tracción YoY.
      let ed = -1.05;
      if (p.lyUnits > 0 && p.ly > 0) {
        const aurLy = p.ly / p.lyUnits;
        const pctP = aurLy > 0 ? (aur - aurLy) / aurLy : 0;
        const pctQ = (p.units - p.lyUnits) / p.lyUnits;
        if (Math.abs(pctP) >= 0.015) {
          ed = pctQ / pctP;
          if (ed > -0.15) ed = -0.35; // Normalización económica de curva de demanda
        } else {
          ed = -1.0 - (rpi - 1) * 0.48 + Math.min(0.45, Math.max(-0.45, yoyGrowth * 0.55)) + (velocityIndex > 1.25 ? 0.30 : (velocityIndex < 0.65 ? -0.30 : 0));
        }
      } else {
        ed = -1.02 - (rpi - 1) * 0.48 + Math.min(0.45, Math.max(-0.45, yoyGrowth * 0.55)) + (velocityIndex > 1.25 ? 0.30 : (velocityIndex < 0.65 ? -0.30 : 0));
      }
      ed = Math.max(-2.65, Math.min(-0.25, ed));

      const absEd = Math.abs(ed);
      let regime = 'Moderado';
      if (absEd < 0.95) regime = 'Inelástico';
      else if (absEd > 1.35) regime = 'Elástico';

      // Simulación con el ajuste de precio elegido (simPriceChangePct)
      const volumeDeltaPct = Math.max(-0.85, ed * priceChangeRatio);
      const simulatedAur = aur * (1 + priceChangeRatio);
      const simulatedUnits = Math.max(0, Math.round(p.units * (1 + volumeDeltaPct)));
      const currentProfit = p.units * (aur - unitCost);
      const simulatedProfit = simulatedUnits * (simulatedAur - unitCost);
      const profitDelta = simulatedProfit - currentProfit;
      const simulatedRevenue = simulatedUnits * simulatedAur;
      const revenueDelta = simulatedRevenue - p.ty;

      // Búsqueda del punto óptimo de precio para maximizar utilidad neta (entre -15% y +20%)
      let bestPriceAdjPct = 0;
      let maxPotentialProfit = currentProfit;
      for (let stepPct = -15; stepPct <= 20; stepPct += 2.5) {
        const sRatio = stepPct / 100;
        const vDelta = Math.max(-0.80, ed * sRatio);
        if (vDelta < -0.35) continue; // Tope de seguridad para no destruir más de 35% de unidades
        const sPrice = aur * (1 + sRatio);
        const sUnits = p.units * (1 + vDelta);
        const sProfit = sUnits * (sPrice - unitCost);
        if (sProfit > maxPotentialProfit) {
          maxPotentialProfit = sProfit;
          bestPriceAdjPct = stepPct;
        }
      }

      let actionText = "Mantener Precio Actual (Equilibrio)";
      if (regime === 'Inelástico') {
        actionText = `Subir Precio +${Math.max(3, Math.round(bestPriceAdjPct))}% (Capturar Margen)`;
      } else if (regime === 'Elástico') {
        actionText = rpi > 1.1 ? "Bajar Precio -5% / Promo (Recuperar Tráfico)" : "Proteger Precio Entrada (No Subir)";
      } else if (bestPriceAdjPct > 0) {
        actionText = `Ajuste Táctico +${bestPriceAdjPct}% (Optimizar)`;
      }

      totalWeightedEd += ed * p.ty;
      totalPortfolioTy += p.ty;
      if (regime === 'Inelástico' && profitDelta > 0) {
        inelasticOpportunityDollars += profitDelta;
      }

      if (!catSummaryMap.has(p.category)) {
        catSummaryMap.set(p.category, { name: p.category, weightedEd: 0, sales: 0, oppProfit: 0 });
      }
      const cEntry = catSummaryMap.get(p.category);
      cEntry.weightedEd += Math.abs(ed) * p.ty;
      cEntry.sales += p.ty;
      if (profitDelta > 0) cEntry.oppProfit += profitDelta;

      return {
        ...p,
        aur,
        unitCost,
        rpi,
        ed,
        absEd,
        regime,
        simulatedAur,
        simulatedUnits,
        volumeDeltaPct,
        currentProfit,
        simulatedProfit,
        profitDelta,
        simulatedRevenue,
        revenueDelta,
        bestPriceAdjPct,
        maxPotentialProfit,
        optimalProfitGain: Math.max(0, maxPotentialProfit - currentProfit),
        actionText
      };
    }).sort((a, b) => b.profitDelta - a.profitDelta);

    const visibleItems = items.filter(item => {
      const matchesRegime = elasticityRegimeFilter === "Todos" || item.regime === elasticityRegimeFilter;
      const matchesSearch = !elasticitySearchTerm ||
        item.name.toLowerCase().includes(elasticitySearchTerm.toLowerCase()) ||
        String(item.upc).toLowerCase().includes(elasticitySearchTerm.toLowerCase());
      return matchesRegime && matchesSearch;
    });

    const activeSelectedItem = items.find(i => i.key === selectedElasticitySkuKey) || visibleItems[0] || items[0];

    // Generar curva de respuesta para el SKU seleccionado (-15% a +20%)
    const selectedSkuCurve = activeSelectedItem ? [-15, -10, -5, 0, 5, 10, 15, 20].map(pct => {
      const sRatio = pct / 100;
      const vDelta = Math.max(-0.85, activeSelectedItem.ed * sRatio);
      const sPrice = activeSelectedItem.aur * (1 + sRatio);
      const sUnits = Math.max(0, Math.round(activeSelectedItem.units * (1 + vDelta)));
      const sRev = sUnits * sPrice;
      const sProfit = Math.max(0, sUnits * (sPrice - activeSelectedItem.unitCost));
      return {
        label: `${pct >= 0 ? '+' : ''}${pct}% (${formatCurrency(sPrice)})`,
        pct,
        revenue: Math.round(sRev),
        profit: Math.round(sProfit),
        units: sUnits
      };
    }) : [];

    const categoryChartData = Array.from(catSummaryMap.values())
      .map(c => ({
        name: c.name.substring(0, 14),
        elasticity: c.sales > 0 ? Number((c.weightedEd / c.sales).toFixed(2)) : 1.0,
        oppProfit: Math.round(c.oppProfit)
      }))
      .sort((a, b) => b.oppProfit - a.oppProfit)
      .slice(0, 8);

    const counts = {
      Inelástico: items.filter(i => i.regime === 'Inelástico').length,
      Moderado: items.filter(i => i.regime === 'Moderado').length,
      Elástico: items.filter(i => i.regime === 'Elástico').length
    };

    return {
      items: visibleItems,
      allCount: items.length,
      portfolioElasticity: totalPortfolioTy > 0 ? (totalWeightedEd / totalPortfolioTy) : -1.0,
      inelasticOpportunityDollars,
      counts,
      categoryChartData,
      activeSelectedItem,
      selectedSkuCurve
    };
  }, [displayProducts, elasticityStoreFilter, elasticityCategoryFilter, elasticityRegimeFilter, elasticitySearchTerm, simPriceChangePct, elasticityBaseMargin, selectedElasticitySkuKey]);

  const markdownAnalysis = useMemo(() => {
    let totalTrapped = 0;
    const items = displayProducts.map(p => {
      const growth = p.ly > 0 ? (p.ty - p.ly) / p.ly : 0;
      const aur = p.units > 0 ? p.ty / p.units : 0;
      const trappedCapital = p.inv * (aur * 0.6);
      return { ...p, growth, trappedCapital };
    }).filter(p => p.growth < -0.2 && p.trappedCapital > 50).sort((a,b) => b.trappedCapital - a.trappedCapital);
    items.forEach(p => totalTrapped += p.trappedCapital);
    return { items, totalTrapped, markdown30: totalTrapped * 0.3, markdown50: totalTrapped * 0.5 };
  }, [displayProducts]);

  const spaceVsSalesAnalysis = useMemo(() => {
    const catMap = new Map(); let totalSales = 0; let totalInv = 0;
    displayProducts.forEach(p => {
      if(!catMap.has(p.category)) catMap.set(p.category, { name: p.category, ty: 0, inv: 0 });
      catMap.get(p.category).ty += p.ty; catMap.get(p.category).inv += p.inv;
      totalSales += p.ty; totalInv += p.inv;
    });
    if (totalSales === 0 || totalInv === 0) return [];
    return Array.from(catMap.values()).filter(c => c.ty > 0).map(c => {
      const shareOfSales = (c.ty / totalSales) * 100;
      const shareOfSpace = (c.inv / totalInv) * 100;
      const index = shareOfSpace > 0 ? shareOfSales / shareOfSpace : 0;
      return { ...c, shareOfSales, shareOfSpace, index, action: index > 1.2 ? 'Expandir Góndola' : (index < 0.8 && shareOfSpace > 1 ? 'Reducir Góndola' : 'Mantener Espacio') };
    }).sort((a,b) => b.shareOfSales - a.shareOfSales).slice(0, 20);
  }, [displayProducts]);

  const adjacencyFlow = useMemo(() => {
    const catMap = new Map(); let totalSales = 0;
    displayProducts.forEach(p => {
      if(!catMap.has(p.category)) catMap.set(p.category, { name: p.category, ty: 0 });
      catMap.get(p.category).ty += p.ty; totalSales += p.ty;
    });
    if(totalSales === 0) return [];
    return Array.from(catMap.values()).map(c => {
      const share = (c.ty / totalSales) * 100;
      return { ...c, share, role: share > 15 ? 'Destino (Destination)' : (share >= 5 ? 'Rutina (Routine)' : 'Conveniencia / Impulso') };
    }).sort((a,b) => b.share - a.share);
  }, [displayProducts]);

  const seasonalityData = useMemo(() => {
    const catMap = new Map();
    displayProducts.forEach(p => {
      if(!catMap.has(p.category)) catMap.set(p.category, { name: p.category, ty: 0 });
      catMap.get(p.category).ty += p.ty;
    });
    const topCategories = Array.from(catMap.values()).sort((a,b) => b.ty - a.ty).slice(0, 5);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const chartData = months.map((m, i) => {
      const point = { name: m };
      topCategories.forEach((c, cIdx) => {
        const phaseShift = cIdx * 0.65;
        const seasonalWave = Math.sin(((i / 11) * Math.PI * 2) + phaseShift) * 0.28 + Math.cos((i + cIdx) * 1.3) * 0.06;
        point[c.name] = Math.max(0, (c.ty / 12) * (1 + seasonalWave));
      });
      return point;
    });
    return { topCategories, chartData };
  }, [displayProducts]);

  const npiAnalysis = useMemo(() => {
    const newItems = displayProducts.filter(p => p.ly === 0 && p.ty > 0).sort((a,b) => b.ty - a.ty);
    const npiSales = newItems.reduce((s, p) => s + p.ty, 0);
    const totalSales = displayProducts.reduce((s, p) => s + p.ty, 0);
    return { newItems, npiSales, vitalityIndex: totalSales > 0 ? (npiSales / totalSales) * 100 : 0 };
  }, [displayProducts]);

  const storeClusteringAnalysis = useMemo(() => {
    if (!storeStats || storeStats.length === 0) return null;
    const totalSales = storeStats.reduce((sum, s) => sum + s.ty, 0);
    const totalInv = storeStats.reduce((sum, s) => sum + s.inv, 0);
    let runningTotal = 0;
    
    const clustered = storeStats.map((s, idx) => {
      runningTotal += s.ty;
      const cumulativePct = totalSales > 0 ? (runningTotal / totalSales) * 100 : 0;
      const tier = cumulativePct <= 70 || idx === 0 ? 'A' : (cumulativePct <= 90 ? 'B' : 'C');
      const assignedFeet = Number(tierLinearFeet[tier]) || 0;
      const salesPerFoot = assignedFeet > 0 ? s.ty / assignedFeet : 0;
      const strategy = tier === 'A'
        ? 'Surtido Completo + NPIs + Doble Facing en Top 20'
        : (tier === 'B' ? 'Surtido Core + Regionales Líderes' : 'Surtido Esencial (Solo Top 80% Pareto)');
      return {
        ...s,
        rank: idx + 1,
        tier,
        cumulativePct,
        assignedFeet,
        salesPerFoot,
        strategy
      };
    });

    const summary = {
      A: clustered.filter(c => c.tier === 'A'),
      B: clustered.filter(c => c.tier === 'B'),
      C: clustered.filter(c => c.tier === 'C')
    };

    const tierMetrics = ['A', 'B', 'C'].map(tKey => {
      const group = summary[tKey];
      const groupSales = group.reduce((s, x) => s + x.ty, 0);
      const groupInv = group.reduce((s, x) => s + x.inv, 0);
      const avgStoreSales = group.length > 0 ? groupSales / group.length : 0;
      const avgStoreInv = group.length > 0 ? groupInv / group.length : 0;
      const avgSalesPerFoot = group.length > 0 ? group.reduce((s, x) => s + x.salesPerFoot, 0) / group.length : 0;
      const shareOfSales = totalSales > 0 ? (groupSales / totalSales) * 100 : 0;
      const shareOfInv = totalInv > 0 ? (groupInv / totalInv) * 100 : 0;
      
      return {
        tier: `Tier ${tKey}`,
        key: tKey,
        count: group.length,
        totalSales: groupSales,
        totalInv: groupInv,
        avgStoreSales,
        avgStoreInv,
        avgSalesPerFoot,
        shareOfSales,
        shareOfInv
      };
    });

    const visibleClusters = clusterTierFilter === "Todos" ? clustered : clustered.filter(c => c.tier === clusterTierFilter);
    return { clustered, visibleClusters, summary, tierMetrics, totalSales, totalInv };
  }, [storeStats, tierLinearFeet, clusterTierFilter]);

  const healthScoreAnalysis = useMemo(() => {
    if (!displayProducts || displayProducts.length === 0) return null;
    const filtered = filterAndConsolidateProducts(displayProducts, {
      store: healthStoreFilter,
      category: healthCategoryFilter
    });

    const totalSales = filtered.reduce((sum, p) => sum + p.ty, 0);
    const sortedBySales = [...filtered].sort((a,b) => b.ty - a.ty);
    let accumulated = 0; const top80Ids = new Set();
    for (const p of sortedBySales) { accumulated += p.ty; top80Ids.add(p.key); if (accumulated > totalSales * 0.8) break; }

    const catScoreMap = new Map();
    const scoredItems = filtered.map(p => {
        let volScore = 0; let growthScore = 0; let invScore = 0; let reasons = [];
        if (top80Ids.has(p.key)) { volScore = 30; reasons.push("Top 80% Ventas (+30)"); } 
        else if (p.ty > 0) { volScore = 10; reasons.push("Cola Larga 20% (+10)"); } 
        else { reasons.push("Sin Ventas (0)"); }

        const growth = p.ly > 0 ? ((p.ty / p.ly) - 1) * 100 : (p.ty > 0 ? 100 : 0);
        if (growth > 10) { growthScore = 30; reasons.push("Alto Crecimiento (+30)"); } 
        else if (growth > 0) { growthScore = 20; reasons.push("Crecimiento Estable (+20)"); } 
        else if (growth > -10) { growthScore = 10; reasons.push("Contracción Leve (+10)"); } 
        else { reasons.push("Caída Severa vs LY (0)"); }

        const dailyMovement = (p.units || 0) / 365;
        const dos = dailyMovement > 0 ? (p.inv || 0) / dailyMovement : 999;
        if (dos >= 7 && dos <= 45) { invScore = 40; reasons.push("DOS Óptimo 7-45d (+40)"); } 
        else if (dos > 45 && dos <= 90) { invScore = 20; reasons.push("Sobreinventario Moderado (+20)"); } 
        else if (dos < 7 && dailyMovement > 0) { invScore = 5; reasons.push("Alerta Quiebre <7d (+5)"); } 
        else { reasons.push("Stock Estancado >90d (0)"); }

        const score = volScore + growthScore + invScore;
        let grade = score >= 90 ? 'A+' : (score >= 80 ? 'A' : (score >= 70 ? 'B' : (score >= 60 ? 'C' : 'F')));
        
        let recommendation = "Mantener exhibición actual";
        if (grade === 'A+' || grade === 'A') recommendation = dos < 10 ? "Urgente: Subir reabasto y proteger facings" : "Expandir caras en góndola (SKU Estrella)";
        else if (grade === 'B') recommendation = growth < 0 ? "Activar promo táctica para defender volumen" : "Ajustar inventario hacia 21 días";
        else if (grade === 'C') recommendation = dos > 45 ? "Frenar órdenes de compra y reducir espacio" : "Revisar competitividad de precio (AUR)";
        else recommendation = "Candidato a Racionalización / Liquidación";

        if (!catScoreMap.has(p.category)) catScoreMap.set(p.category, { name: p.category, totalScore: 0, count: 0, sales: 0 });
        catScoreMap.get(p.category).totalScore += score;
        catScoreMap.get(p.category).count += 1;
        catScoreMap.get(p.category).sales += p.ty;

        return { ...p, score, volScore, growthScore, invScore, grade, reasons, growth, dos, recommendation };
    }).sort((a, b) => b.score - a.score || b.ty - a.ty);

    const summary = {
      'A+': scoredItems.filter(i => i.grade === 'A+').length,
      'A': scoredItems.filter(i => i.grade === 'A').length,
      'B': scoredItems.filter(i => i.grade === 'B').length,
      'C': scoredItems.filter(i => i.grade === 'C').length,
      'F': scoredItems.filter(i => i.grade === 'F').length
    };

    const avgScore = scoredItems.length > 0 ? scoredItems.reduce((s, i) => s + i.score, 0) / scoredItems.length : 0;
    const healthyPct = scoredItems.length > 0 ? ((summary['A+'] + summary['A'] + summary['B']) / scoredItems.length) * 100 : 0;
    const criticalSales = scoredItems.filter(i => i.grade === 'F').reduce((s, i) => s + i.ty, 0);

    const categoryHealthChart = Array.from(catScoreMap.values())
      .map(c => ({ name: c.name, avgScore: Number((c.totalScore / c.count).toFixed(1)), count: c.count }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 8);

    const gradeDistributionChart = [
      { name: 'A+ (90-100)', count: summary['A+'], fill: '#10b981' },
      { name: 'A (80-89)', count: summary['A'], fill: '#3b82f6' },
      { name: 'B (70-79)', count: summary['B'], fill: '#6366f1' },
      { name: 'C (60-69)', count: summary['C'], fill: '#f59e0b' },
      { name: 'F (<60)', count: summary['F'], fill: '#ef4444' }
    ];

    const visibleItems = scoredItems.filter(item => {
      const matchesGrade = healthGradeFilter === "Todas" || item.grade === healthGradeFilter;
      const matchesSearch = !healthSearchTerm || item.name.toLowerCase().includes(healthSearchTerm.toLowerCase()) || String(item.upc).includes(healthSearchTerm);
      return matchesGrade && matchesSearch;
    });

    return { items: visibleItems, allCount: scoredItems.length, summary, avgScore, healthyPct, criticalSales, categoryHealthChart, gradeDistributionChart };
  }, [displayProducts, healthCategoryFilter, healthStoreFilter, healthGradeFilter, healthSearchTerm]);

  const promoProductOptions = useMemo(() => promoSearchTerm ? displayProducts.filter(p => p.ty > 0 && p.units > 0 && (p.name.toLowerCase().includes(promoSearchTerm.toLowerCase()) || String(p.upc).includes(promoSearchTerm.toLowerCase()))).slice(0, 10) : [], [displayProducts, promoSearchTerm]);

  const promoSimulation = useMemo(() => {
    if (!selectedPromoProductId) return null;
    const item = displayProducts.find(p => p.id === selectedPromoProductId);
    if (!item || item.units === 0) return null;
    const aur = item.ty / item.units; const cost = aur * (1 - (promoMargin / 100)); const originalProfitPerUnit = aur - cost; const totalOriginalProfit = originalProfitPerUnit * item.units;
    const newAur = aur * (1 - (promoDiscount / 100)); const newProfitPerUnit = newAur - cost;
    const requiredUnitsBreakEven = newProfitPerUnit > 0 ? totalOriginalProfit / newProfitPerUnit : 0;
    const requiredLiftPct = item.units > 0 ? ((requiredUnitsBreakEven / item.units) - 1) * 100 : 0;
    const isLoss = newProfitPerUnit <= 0;
    const chartData = [0, 20, 50, 100, 150, 200, 300].map(lift => ({ lift: `${lift}% Lift`, liftNum: lift, profitOriginal: totalOriginalProfit, profitPromo: Math.max(0, (item.units * (1 + (lift/100))) * newProfitPerUnit) }));
    return { item, aur, cost, originalProfitPerUnit, totalOriginalProfit, newAur, newProfitPerUnit, requiredUnitsBreakEven, requiredLiftPct, isLoss, chartData };
  }, [displayProducts, selectedPromoProductId, promoMargin, promoDiscount]);

  const gmroiAnalysis = useMemo(() => {
    if (!displayProducts || displayProducts.length === 0) return null;
    const filtered = filterAndConsolidateProducts(displayProducts, {
      store: gmroiStoreFilter,
      category: gmroiCategoryFilter,
      minSales: 0
    });

    const marginMultiplier = globalMargin / 100;
    let totalMargin = 0;
    let totalInvCost = 0;
    let totalCogs = 0;
    const categoryMap = new Map();
    const avgSalesBenchmark = filtered.length > 0 ? filtered.reduce((s, x) => s + x.ty, 0) / filtered.length : 0;

    const items = filtered.map(p => {
      const price = p.units > 0 ? p.ty / p.units : p.ty;
      const cost = price * (1 - marginMultiplier);
      const grossMargin = p.ty * marginMultiplier;
      const cogs = p.ty * (1 - marginMultiplier);
      const invCost = (p.inv || 0) * cost;
      const gmroi = invCost > 0 ? (grossMargin / invCost) : (grossMargin > 0 ? 99.9 : 0);
      const turns = invCost > 0 ? (cogs / invCost) : 0;
      const sellThrough = (p.units + p.inv) > 0 ? (p.units / (p.units + p.inv)) * 100 : 0;

      let quadrant = 'Vaca Lechera';
      if (gmroi >= targetGmroiThreshold && p.ty >= avgSalesBenchmark) quadrant = 'Estrella';
      else if (gmroi >= targetGmroiThreshold && p.ty < avgSalesBenchmark) quadrant = 'Alta Eficiencia';
      else if (gmroi < targetGmroiThreshold && p.ty >= avgSalesBenchmark) quadrant = 'Generador Tráfico';
      else quadrant = 'Capital Lento';

      totalMargin += grossMargin;
      totalInvCost += invCost;
      totalCogs += cogs;

      if (!categoryMap.has(p.category)) categoryMap.set(p.category, { name: p.category, margin: 0, invCost: 0, sales: 0 });
      categoryMap.get(p.category).margin += grossMargin;
      categoryMap.get(p.category).invCost += invCost;
      categoryMap.get(p.category).sales += p.ty;

      return { ...p, price, cost, grossMargin, cogs, invCost, gmroi, turns, sellThrough, quadrant };
    }).sort((a, b) => b.gmroi - a.gmroi);

    const visibleItems = gmroiQuadrantFilter === "Todos" ? items : items.filter(i => i.quadrant === gmroiQuadrantFilter);
    const categories = Array.from(categoryMap.values()).map(c => ({
      ...c,
      gmroi: c.invCost > 0 ? Number((c.margin / c.invCost).toFixed(2)) : 0,
      marginRounded: Math.round(c.margin)
    })).sort((a, b) => b.gmroi - a.gmroi).slice(0, 10);

    const quadrantCounts = {
      'Estrella': items.filter(i => i.quadrant === 'Estrella').length,
      'Alta Eficiencia': items.filter(i => i.quadrant === 'Alta Eficiencia').length,
      'Generador Tráfico': items.filter(i => i.quadrant === 'Generador Tráfico').length,
      'Capital Lento': items.filter(i => i.quadrant === 'Capital Lento').length
    };

    return {
      items: visibleItems,
      allCount: items.length,
      totalSales: items.reduce((sum, p) => sum + p.ty, 0),
      totalMargin,
      totalInvCost,
      globalGmroi: totalInvCost > 0 ? (totalMargin / totalInvCost) : 0,
      globalTurns: totalInvCost > 0 ? (totalCogs / totalInvCost) : 0,
      categories,
      quadrantCounts
    };
  }, [displayProducts, globalMargin, gmroiStoreFilter, gmroiCategoryFilter, gmroiQuadrantFilter, targetGmroiThreshold]);

  const forecastAnalysis = useMemo(() => {
    if (!displayProducts || displayProducts.length === 0) return null;
    const filtered = filterAndConsolidateProducts(displayProducts, {
      store: forecastStoreFilter,
      category: forecastCategoryFilter
    }).filter(p => (p.ty || 0) > 0 || (p.ly || 0) > 0);

    let totalTy = 0;
    let totalLy = 0;
    let totalNy = 0;
    let totalUnitsTy = 0;
    let totalUnitsNy = 0;
    const categoryMap = new Map();

    const items = filtered.map(p => {
      const baseOrganicGrowth = Math.max(-0.5, Math.min(1.0, p.ly > 0 ? ((p.ty - p.ly) / p.ly) : 0.12));
      const volumeGrowth = baseOrganicGrowth + (marketAdjustment / 100);
      const totalRevenueGrowth = volumeGrowth + (priceInflationAdj / 100);
      const projectedSales = Math.max(0, p.ty * (1 + totalRevenueGrowth));
      const projectedUnits = Math.max(0, Math.round((p.units || 0) * (1 + volumeGrowth)));
      const deltaDollars = projectedSales - p.ty;
      const suggestedStock = Math.max(2, Math.round((projectedUnits / 365) * 21));

      totalTy += p.ty;
      totalLy += p.ly;
      totalNy += projectedSales;
      totalUnitsTy += (p.units || 0);
      totalUnitsNy += projectedUnits;

      if (!categoryMap.has(p.category)) categoryMap.set(p.category, { name: p.category, ly: 0, ty: 0, ny: 0 });
      categoryMap.get(p.category).ly += p.ly;
      categoryMap.get(p.category).ty += p.ty;
      categoryMap.get(p.category).ny += projectedSales;

      return {
        ...p,
        adjustedGrowth: totalRevenueGrowth,
        projectedSales,
        projectedUnits,
        deltaDollars,
        suggestedStock
      };
    }).sort((a, b) => b.projectedSales - a.projectedSales);

    return {
      items,
      totalTy,
      totalLy,
      totalNy,
      totalUnitsTy,
      totalUnitsNy,
      globalGrowth: totalTy > 0 ? ((totalNy - totalTy) / totalTy) * 100 : 0,
      absoluteDelta: totalNy - totalTy,
      categories: Array.from(categoryMap.values()).sort((a, b) => b.ny - a.ny).slice(0, 10)
    };
  }, [displayProducts, marketAdjustment, priceInflationAdj, forecastStoreFilter, forecastCategoryFilter]);

  const exportCleanDataToCSV = () => {
    if (!filteredProducts || filteredProducts.length === 0) return;
    const headers = ["Store Name", "UPC", "JDA ID", "Product Name", "Category", "Segment", "SubCategory", "Vendor", "Brand", "TY Sales ($)", "LY Sales ($)", "TY Units", "Inventory/Capacity"];
    const rows = filteredProducts.map(p => [p.store, p.upc || "", p.jdaId || "", p.name || "", p.category || "", p.segment || "", p.subCategory || "", p.vendor || "", p.brand || "", p.ty || 0, p.ly || 0, p.units || 0, p.inv || 0]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(val => typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val).join(","))].join("\n");
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); link.setAttribute("href", URL.createObjectURL(blob)); link.setAttribute("download", `Data_Retail_${new Date().getTime()}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const t = useMemo(() => buildThemeTokens(isDarkMode), [isDarkMode]);

  const renderFileManagerModal = () => (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl border transition-colors overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
          <div>
            <h2 className={`text-xl font-black flex items-center gap-2 ${t.textTitle}`}><Database className="w-6 h-6 text-indigo-500" />Gestor de Archivos</h2>
            <p className={`text-sm mt-1 ${t.textSub}`}>Activa, desactiva o elimina los archivos que componen tu análisis actual.</p>
          </div>
          <button onClick={() => setShowFileManager(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-500 hover:text-slate-900'}`}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-3">
            {uploadedFiles.map(file => (
              <div key={file.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${!file.isActive ? (isDarkMode ? 'bg-slate-950 border-slate-800 opacity-60' : 'bg-slate-50 border-slate-200 opacity-60') : (isDarkMode ? 'bg-indigo-950/20 border-indigo-900' : 'bg-indigo-50/50 border-indigo-100')}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${file.isActive ? 'bg-indigo-500 text-white' : 'bg-slate-400 text-white'}`}><FileSpreadsheet className="w-5 h-5" /></div>
                  <div>
                    <h4 className={`font-bold text-sm ${t.textTitle} ${!file.isActive && 'line-through decoration-slate-400'}`}>{file.name}</h4>
                    <p className={`text-xs font-medium mt-0.5 ${t.textSub}`}>{file.count} productos detectados</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleFileActive(file.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${file.isActive ? (isDarkMode ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50' : 'bg-amber-50 text-amber-600 hover:bg-amber-100') : (isDarkMode ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100')}`}>
                    {file.isActive ? <><EyeOff className="w-3.5 h-3.5" /> Ocultar</> : <><Eye className="w-3.5 h-3.5" /> Mostrar</>}
                  </button>
                  <button onClick={() => deleteFile(file.id)} className={`p-1.5 rounded-xl transition-colors ${isDarkMode ? 'bg-rose-900/30 text-rose-400 hover:bg-rose-900/50' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
          {uploadedFiles.length === 0 && (
            <div className={`text-center py-8 ${t.textSub}`}><Database className="w-10 h-10 mx-auto mb-3 opacity-20" /><p>No hay archivos cargados.</p></div>
          )}
        </div>
        <div className={`p-6 border-t flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
          <button onClick={handleClearAllData} disabled={uploadedFiles.length === 0} className="text-rose-500 font-bold text-sm hover:underline disabled:opacity-50">Borrar Todos Los Archivos</button>
          <button onClick={() => setShowFileManager(false)} className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 transition-all">Cerrar y Actualizar</button>
        </div>
      </div>
    </div>
  );

  const renderRequirementsModal = () => (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl border transition-colors overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'bg-indigo-950/50 border-slate-800' : 'bg-indigo-50 border-slate-100'}`}>
          <div>
            <h2 className={`text-xl font-black flex items-center gap-2 ${t.textTitle}`}><Database className="w-6 h-6 text-indigo-500" />Guía de Archivos</h2>
            <p className={`text-sm mt-1 ${t.textSub}`}>¿Qué necesitas subir para operar?</p>
          </div>
          <button onClick={() => setShowFileRequirementsModal(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-500 hover:text-slate-900'}`}><X className="w-5 h-5" /></button>
        </div>
        <div className={`p-6 overflow-y-auto flex-1 text-sm ${isDarkMode ? 'bg-slate-950 text-slate-300' : 'bg-white text-slate-700'}`}>
          <p className="mb-6 text-base leading-relaxed">Solo necesitas cargar un archivo exportado de tu sistema (POS, SAP, etc.) con ventas e inventarios reales. Cárgalo en "Sincronizar Data" o pásalo por el "Limpiador".</p>
          <div className="mb-6 p-5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20">
            <h3 className="text-lg font-black mb-3 text-indigo-600 dark:text-indigo-400 flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /> Columnas Recomendadas</h3>
            <ul className="list-disc list-inside space-y-1 ml-2 opacity-90 font-mono">
              <li>UPC / Item ID</li><li>Name / Description</li><li>Category / Vendor</li><li>TY Sales ($) / LY Sales ($)</li><li>TY Units</li><li>Inventory / Capacity</li>
            </ul>
          </div>
        </div>
        <div className={`p-5 border-t flex justify-end ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <button onClick={() => setShowFileRequirementsModal(false)} className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 transition-all">Entendido</button>
        </div>
      </div>
    </div>
  );

  const renderCleanerTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {cleanerStep === 1 && (
        <>
          <div className={`p-8 rounded-3xl border mb-6 transition-colors shadow-lg flex flex-col lg:flex-row gap-8 justify-between items-center ${t.masterBox}`}>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mb-2">
                <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-500/20'}`}>
                  <Wand2 className="w-10 h-10 text-indigo-400" />
                </div>
                <div>
                  <h2 className={`text-3xl font-black ${t.masterBoxText}`}>Limpiador Inteligente de Data</h2>
                  <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-indigo-200' : 'text-indigo-100'}`}>Transforma reportes desordenados en tablas perfectas con Inteligencia Artificial.</p>
                </div>
              </div>
              <p className={`text-sm mt-4 max-w-3xl leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-indigo-50'}`}>Este asistente lee tus archivos brutos de Excel, te permite confirmar qué columna es cuál visualmente, y destruye la "basura" automáticamente para darte un archivo perfecto para importar.</p>
            </div>
            <div className={`w-full lg:w-auto min-w-[320px] p-5 rounded-2xl border shadow-xl flex flex-col gap-4 ${isDarkMode ? 'bg-slate-900 border-indigo-900/50' : 'bg-white border-indigo-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Upload className="w-5 h-5 text-indigo-500" />
                <h3 className={`font-bold text-base ${t.textTitle}`}>Paso 1: Subir Reporte</h3>
              </div>
              <input type="file" accept=".csv, .xlsx, .xls" onChange={handleRawFileClean} className="hidden" id="raw-file-cleaner" />
              <label htmlFor="raw-file-cleaner" className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-8 cursor-pointer transition-all ${isDarkMode ? 'border-slate-700 hover:border-indigo-500 hover:bg-indigo-950/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50'} ${isCleaning ? 'opacity-50 pointer-events-none' : ''}`}>
                {isCleaning ? <Loader2 className={`w-10 h-10 animate-spin mb-3 ${t.textSub}`} /> : <FileSpreadsheet className={`w-10 h-10 mb-3 text-indigo-400`} />}
                <span className={`font-bold text-base ${t.textTitle}`}>{isCleaning ? 'Analizando Archivo...' : 'Cargar Excel / CSV Bruto'}</span>
                <span className={`text-xs mt-2 text-center max-w-[200px] ${t.textSub}`}>No importa si tiene subtotales o encabezados mal alineados.</span>
              </label>
            </div>
          </div>
        </>
      )}
      {cleanerStep === 2 && (
        <div className="animate-in fade-in slide-in-from-right-4">
          <div className={`p-6 md:p-8 rounded-3xl border mb-6 transition-colors shadow-lg ${t.card}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b pb-6 dark:border-slate-800 border-slate-200">
              <div>
                <h2 className={`text-2xl font-black flex items-center gap-2 ${t.textTitle}`}><Wand2 className="w-6 h-6 text-indigo-500" /> Paso 2: Confirma el Mapeo (Soporte Multi-Columna y Multi-Tienda)</h2>
                <p className={`text-sm mt-1 ${t.textSub}`}>Puedes añadir varios encasillados en cualquier campo usando el botón <strong>"+ Añadir encasillado"</strong> para sumar columnas o separar tiendas.</p>
              </div>
              <button onClick={resetCleaner} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>Cancelar y Subir Otro</button>
            </div>

            {}
            <div className={`p-5 rounded-2xl border mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6 ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-indigo-50/40 border-indigo-100'}`}>
              <div>
                <label className={`text-xs font-black uppercase tracking-wider block mb-2 ${t.textTitle}`}>
                  1. ¿Cómo vienen las Tiendas en este archivo?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'single', label: 'Una Sola Tienda', desc: 'Nombre fijo para todo el archivo' },
                    { id: 'multi', label: 'Columna de Tienda', desc: 'Hay una columna con el nombre de tienda' },
                    { id: 'parallel_cols', label: 'Tiendas en Columnas', desc: 'Varias columnas TY/LY (#1, #2, #3...)' }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setCleanerStoreMode(mode.id);
                        if (mode.id === 'parallel_cols') setCleanerMultiColMode('split_stores');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        cleanerStoreMode === mode.id
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : t.card
                      }`}
                    >
                      <span className="font-black text-xs block">{mode.label}</span>
                      <span className={`text-[10px] mt-0.5 block ${cleanerStoreMode === mode.id ? 'text-indigo-100' : t.textSub}`}>{mode.desc}</span>
                    </button>
                  ))}
                </div>

                {cleanerStoreMode === 'single' && (
                  <div className="mt-3">
                    <label className={`text-[11px] font-bold block mb-1 ${t.textSub}`}>Nombre de la Tienda o Reporte:</label>
                    <input
                      type="text"
                      value={cleanerStoreName}
                      onChange={(e) => setCleanerStoreName(e.target.value)}
                      placeholder="Ej. Bayamón, Humacao, Consolidado..."
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold focus:outline-none ${t.input}`}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={`text-xs font-black uppercase tracking-wider block mb-2 ${t.textTitle}`}>
                  2. ¿Qué hacer cuando eliges más de un encasillado en TY / LY / Unidades?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCleanerMultiColMode('sum')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      cleanerMultiColMode === 'sum' && cleanerStoreMode !== 'parallel_cols'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : t.card
                    }`}
                  >
                    <span className="font-black text-xs block">Sumar Encasillados (+)</span>
                    <span className={`text-[10px] mt-0.5 block ${cleanerMultiColMode === 'sum' && cleanerStoreMode !== 'parallel_cols' ? 'text-emerald-100' : t.textSub}`}>
                      Suma todas las columnas TY, LY o Unidades conectadas en un solo total por fila.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCleanerMultiColMode('split_stores');
                      setCleanerStoreMode('parallel_cols');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      cleanerMultiColMode === 'split_stores' || cleanerStoreMode === 'parallel_cols'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : t.card
                    }`}
                  >
                    <span className="font-black text-xs block">Separar por Tienda (#1, #2, #3...)</span>
                    <span className={`text-[10px] mt-0.5 block ${cleanerMultiColMode === 'split_stores' || cleanerStoreMode === 'parallel_cols' ? 'text-indigo-100' : t.textSub}`}>
                      El encasillado #1 de TY/LY/Units va a la Tienda #1, el #2 a la Tienda #2, etc.
                    </span>
                  </button>
                </div>

                {/* Nombres de Tienda por cada bloque #1, #2, #3 cuando se separa por tiendas */}
                {(cleanerMultiColMode === 'split_stores' || cleanerStoreMode === 'parallel_cols') && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                    <span className={`text-[10px] font-black uppercase tracking-wider block mb-2 text-indigo-500`}>
                      Nombre asignado a cada grupo de columnas (#1, #2...):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-28 overflow-y-auto pr-1">
                      {Array.from({
                        length: Math.max(
                          getMappedCols('tySales').length,
                          getMappedCols('lySales').length,
                          getMappedCols('tyUnits').length,
                          getMappedCols('store').length,
                          1
                        )
                      }).map((_, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black px-1.5 py-1 rounded bg-indigo-500 text-white shrink-0">
                            #{sIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={cleanerSlotStores[sIdx] || ""}
                            onChange={(e) => setCleanerSlotStores(prev => ({ ...prev, [sIdx]: e.target.value }))}
                            placeholder={`Tienda #${sIdx + 1}`}
                            className={`w-full p-1.5 rounded-lg border text-xs font-bold focus:outline-none ${t.input}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 pt-4 border-t border-slate-200/70 dark:border-slate-800">
                <label className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 mb-2 ${t.textTitle}`}>
                  <GitMerge className="w-4 h-4 text-emerald-500" />
                  3. ¿Qué hacer si un mismo Producto aparece repetido varias veces en la columna?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'name',
                      label: 'Sumar por Mismo Nombre (Recomendado)',
                      desc: 'Si el producto tiene el mismo nombre en la tienda, suma sus ventas TY ($), LY ($) y Unidades.'
                    },
                    {
                      id: 'name_or_upc',
                      label: 'Sumar por Mismo Nombre o UPC',
                      desc: 'Suma TY y LY si coincide el nombre del producto o si comparten el mismo código UPC.'
                    },
                    {
                      id: 'none',
                      label: 'No Sumar (Dejar Filas Separadas)',
                      desc: 'Conserva cada línea individualmente tal como viene en el Excel.'
                    }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCleanerMergeMode(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        cleanerMergeMode === opt.id
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : t.card
                      }`}
                    >
                      <span className="font-black text-xs block">{opt.label}</span>
                      <span className={`text-[10px] mt-0.5 block ${cleanerMergeMode === opt.id ? 'text-emerald-100' : t.textSub}`}>
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <h3 className={`font-bold text-lg mb-4 flex items-center justify-between ${t.textTitle}`}>
              <span>Mapeo de Columnas (Conecta uno o varios encasillados por fila)</span>
              <span className={`text-xs font-medium ${t.textSub}`}>
                {cleanerHeaders.length} columnas detectadas en tu archivo
              </span>
            </h3>

            {}
            <div className={`overflow-hidden rounded-2xl border ${t.tableWrapper} mb-8`}>
              <table className="w-full text-left text-sm">
                <thead className={t.tableHeader}>
                  <tr>
                    <th className="px-5 py-3 font-black w-1/3">Dato Requerido</th>
                    <th className="px-5 py-3 font-black">Encasillados conectados de tu Excel (Puedes añadir varios)</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.tableDivide}`}>
                  {[
                    { key: 'store', label: 'Tienda / Sucursal', icon: <MapPin className="w-4 h-4 text-indigo-500" />, req: cleanerStoreMode === 'multi', keywords: ['store', 'tienda', 'local', 'sucursal'], avoid: [] },
                    { key: 'upc', label: 'UPC (Código de Barras)', icon: <Tag className="w-4 h-4 text-indigo-500" />, req: !hasValidMappedCol('itemId'), keywords: ['upc', 'barcode', 'ean', 'bar code'], avoid: ['id', 'interno', 'item id'] },
                    { key: 'itemId', label: 'ID o Código Interno (Item ID / SKU)', icon: <Database className="w-4 h-4 text-violet-500" />, req: !hasValidMappedCol('upc'), keywords: ['item id', 'id', 'código', 'codigo', 'sku', 'item no', 'item #', 'cod'], avoid: ['upc', 'barcode', 'ean', 'store', 'tienda', 'vendor', 'suplidor'] },
                    { key: 'desc', label: 'Descripción de Producto', icon: <BookOpen className="w-4 h-4 text-indigo-500" />, req: true, keywords: ['desc', 'producto', 'name', 'articulo'], avoid: [] },
                    { key: 'sz', label: 'Tamaño / Size (SZ)', icon: <Package className="w-4 h-4 text-slate-400" />, req: false, keywords: ['sz', 'size', 'tamaño', 'tamano'], avoid: [] },
                    { key: 'category', label: 'Categoría', icon: <Layers className="w-4 h-4 text-emerald-500" />, req: false, keywords: ['category', 'categoria', 'categoría', 'dept'], avoid: ['sub', 'minor'] },
                    { key: 'segment', label: 'Segmento / Sub-Cat', icon: <Filter className="w-4 h-4 text-amber-500" />, req: false, keywords: ['segment', 'subcat', 'minor'], avoid: [] },
                    { key: 'vendor', label: 'Suplidor / Marca', icon: <Users className="w-4 h-4 text-purple-500" />, req: false, keywords: ['vendor', 'suplid', 'proveedor', 'marca'], avoid: [] },
                    { key: 'tySales', label: 'Ventas Actuales ($ TY)', icon: <DollarSign className="w-4 h-4 text-emerald-500" />, req: true, keywords: ['ty sales', 'actual', 'ventas ty', 'venta', 'ty'], avoid: ['units', 'ly', 'shr'] },
                    { key: 'lySales', label: 'Ventas Pasadas ($ LY)', icon: <DollarSign className="w-4 h-4 opacity-60" />, req: false, keywords: ['ly sales', 'lysales', 'pasado', 'ventas ly', 'ly'], avoid: ['units', 'shr'] },
                    { key: 'tyUnits', label: 'Unidades Vendidas (TY Units)', icon: <Package className="w-4 h-4 text-orange-500" />, req: false, keywords: ['ty units', 'units', 'unidades', 'qty'], avoid: ['ly', 'sales', '$'] },
                    { key: 'inv', label: 'Inventario / Stock', icon: <Database className="w-4 h-4 text-sky-500" />, req: false, keywords: ['inv', 'stock', 'on hand', 'capacidad'], avoid: [] },
                  ].map((field) => {
                    if (field.key === 'store' && cleanerStoreMode === 'single') return null;
                    const selectedSlots = getMappedCols(field.key);
                    const matchingCount = cleanerHeaders.filter(h => {
                      const hl = String(h || "").toLowerCase();
                      return hl && field.keywords.some(k => hl.includes(k)) && !field.avoid.some(a => hl.includes(a));
                    }).length;

                    return (
                      <tr key={field.key} className={t.rowBase}>
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-2">
                            {field.icon}
                            <span className={`font-bold ${t.textTitle}`}>{field.label}</span>
                            {field.req && <span className="text-rose-500 font-black">*</span>}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-semibold ${t.textSub}`}>
                              {selectedSlots.filter(c => c !== "").length} encasillado(s) activo(s)
                            </span>
                            {matchingCount > 1 && selectedSlots.filter(c => c !== "").length < matchingCount && (
                              <button
                                type="button"
                                onClick={() => autoConnectMatchingColumns(field.key, field.keywords, field.avoid)}
                                className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 transition-colors flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" /> Conectar las {matchingCount} detectadas
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-2.5">
                            {selectedSlots.map((slotVal, sIdx) => (
                              <div key={`${field.key}_slot_${sIdx}`} className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-mono font-black px-2 py-1.5 rounded-lg shrink-0 ${
                                    selectedSlots.length > 1
                                      ? 'bg-indigo-600 text-white'
                                      : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')
                                  }`}
                                  title={`Encasillado #${sIdx + 1}`}
                                >
                                  #{sIdx + 1}
                                </span>
                                <select
                                  className={`w-full p-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-colors ${
                                    slotVal === ""
                                      ? (field.req && sIdx === 0
                                          ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                                          : 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300')
                                      : t.input
                                  }`}
                                  value={slotVal}
                                  onChange={(e) => handleMappingSlotChange(field.key, sIdx, e.target.value)}
                                >
                                  <option value="">-- No incluir / Seleccionar columna --</option>
                                  {cleanerHeaders.map((header, idx) => (
                                    <option key={idx} value={idx.toString()}>
                                      Columna {idx + 1}: {header || `[Columna Vacía ${idx + 1}]`}
                                    </option>
                                  ))}
                                </select>
                                {selectedSlots.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeMappingSlot(field.key, sIdx)}
                                    className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors shrink-0"
                                    title="Quitar este encasillado"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}

                            <div className="pt-1 flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => addMappingSlot(field.key, "")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black border border-dashed transition-all flex items-center gap-1.5 ${
                                  isDarkMode
                                    ? 'border-indigo-500/50 text-indigo-400 hover:bg-indigo-950/40'
                                    : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5" /> Añadir otro encasillado de {field.label}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button
                onClick={processCleanData}
                disabled={
                  isCleaning ||
                  (!hasValidMappedCol('upc') && !hasValidMappedCol('itemId')) ||
                  !hasValidMappedCol('desc') ||
                  !hasValidMappedCol('tySales') ||
                  (cleanerStoreMode === 'multi' && !hasValidMappedCol('store'))
                }
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCleaning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} Limpiar y Formatear Ahora
              </button>
            </div>
          </div>
        </div>
      )}
      {cleanerStep === 3 && cleanedData && (
        <div className="animate-in zoom-in-95 duration-500">
          <div className={`p-8 rounded-3xl border mb-6 flex flex-col items-center text-center shadow-2xl ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50/50 border-emerald-200'}`}>
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/40"><ShieldCheck className="w-10 h-10" /></div>
            <h2 className={`text-3xl font-black mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>¡Limpieza y Consolidación Exitosa!</h2>
            <p className={`text-base mb-4 max-w-2xl ${t.textTitle}`}>
              Se leyeron <span className="font-black">{cleanedData.rawRowsCount || cleanedData.items.length}</span> filas válidas y quedaron{' '}
              <span className="font-black text-emerald-500 text-lg">{cleanedData.items.length}</span> productos únicos en{' '}
              <span className="font-black text-indigo-500">{new Set(cleanedData.items.map(i => i.store)).size}</span> tienda(s).
            </p>

            {cleanedData.mergedDuplicatesCount > 0 ? (
              <div className={`w-full max-w-3xl mb-8 p-4 rounded-2xl border text-left ${isDarkMode ? 'bg-slate-900/90 border-emerald-800/60' : 'bg-white border-emerald-200 shadow-sm'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <GitMerge className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className={`font-black text-sm ${t.textTitle}`}>
                      ¡Se detectaron y sumaron {cleanedData.mergedDuplicatesCount} filas de productos repetidos!
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500">
                    TY ($) y LY ($) Consolidados
                  </span>
                </div>
                <p className={`text-xs mt-2 mb-3 ${t.textSub}`}>
                  Estos productos aparecían varias veces con el mismo nombre y el limpiador sumó automáticamente sus ventas TY, LY y Unidades para no perder ningún dato:
                </p>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className={t.tableHeader}>
                      <tr>
                        <th className="px-3 py-2 font-black">Producto Consolidado</th>
                        <th className="px-3 py-2 font-black">Tienda</th>
                        <th className="px-3 py-2 font-black text-center">Veces Sumado</th>
                        <th className="px-3 py-2 font-black text-right">Total TY ($)</th>
                        <th className="px-3 py-2 font-black text-right">Total LY ($)</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.tableDivide}`}>
                      {(cleanedData.mergedProductsList || []).slice(0, 30).map((mp, idx) => (
                        <tr key={idx} className={t.rowBase}>
                          <td className={`px-3 py-2 font-bold ${t.textTitle}`}>{mp.desc}</td>
                          <td className={`px-3 py-2 ${t.textSub}`}>{mp.store}</td>
                          <td className="px-3 py-2 text-center">
                            <span className="px-2 py-0.5 rounded-full font-black bg-indigo-500/15 text-indigo-500">
                              {mp.occurrences}x filas
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-emerald-500">
                            {formatCurrency(mp.tySales)}
                          </td>
                          <td className={`px-3 py-2 text-right font-mono ${t.textSub}`}>
                            {formatCurrency(mp.lySales)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className={`text-xs mb-6 px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
                No se detectaron productos repetidos en la misma tienda (cada fila ya tenía un nombre único).
              </p>
            )}

            <div className="flex flex-col gap-4 w-full justify-center max-w-xl">
              <button
                onClick={sendCleanedDataToDashboard}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-black text-base shadow-xl shadow-indigo-500/30 transition-all"
              >
                <Sparkles className="w-5 h-5" /> Enviar Directo al Dashboard y Analizar Ahora
              </button>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button onClick={downloadCleanedDataExcel} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/30 transition-all"><FileSpreadsheet className="w-5 h-5" /> Descargar Excel</button>
                <button onClick={downloadCleanedData} className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-700/30 transition-all"><DownloadCloud className="w-5 h-5" /> Descargar CSV</button>
              </div>
              <button onClick={resetCleaner} className="w-full flex items-center justify-center gap-2 bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 px-6 py-3 rounded-2xl font-black text-sm shadow-md transition-all"><Wand2 className="w-5 h-5" /> Limpiar Otro Archivo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderInventoryTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`p-6 rounded-3xl border mb-6 transition-colors ${t.masterBox}`}>
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-500/20'}`}><Package className="w-6 h-6 text-indigo-400" /></div>
            <div>
              <h3 className={`font-bold text-xl ${t.masterBoxText}`}>Explorador Maestro de Productos</h3>
              <p className={`text-xs uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-indigo-300'}`}>{importedProducts.length > 0 ? `Cargados ${importedProducts.length} productos` : 'Base de datos vacía. Sube tu data.'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportCleanDataToCSV} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white text-indigo-600 hover:bg-indigo-50'}`} title="Descargar esta vista limpia a CSV"><Download className="w-4 h-4" /><span className="hidden sm:inline">Exportar CSV</span></button>
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-950/50 border-slate-700 text-slate-300' : 'bg-indigo-900/50 border-white/5 text-white'}`}><Tag className="w-4 h-4 text-indigo-400" /><span className="text-xs font-bold">{filteredProducts.length} Resultados</span></div>
          </div>
        </div>
        <p className={`text-sm mb-6 ${t.textSub}`}>Explora, filtra y busca en tu catálogo completo por Nombre, UPC o ID/Código Interno. Selecciona productos utilizando las casillas para generar comparativas gráficas personalizadas instantáneas.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Buscar producto por Nombre, UPC, ID / Código Interno, Categoría o Suplidor..." className={`w-full rounded-xl py-3.5 pl-12 pr-4 transition-all font-medium focus:outline-none ${t.masterInput}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-2"><Store className="text-indigo-400 w-4 h-4 shrink-0" /><select className={`w-full rounded-xl py-3 px-3 text-sm focus:outline-none cursor-pointer font-medium ${t.masterInput}`} value={selectedStoreFilter} onChange={(e) => setSelectedStoreFilter(e.target.value)}><option value="Todas" className="text-slate-900 bg-white dark:text-slate-200 dark:bg-slate-900">Todas las Tiendas</option>{uniqueStores.map(s => <option key={s} value={s} className="text-slate-900 bg-white dark:text-slate-200 dark:bg-slate-900">{s}</option>)}</select></div>
          <div className="flex items-center gap-2"><Filter className="text-indigo-400 w-4 h-4 shrink-0" /><select className={`w-full rounded-xl py-3 px-3 text-sm focus:outline-none cursor-pointer font-medium ${t.masterInput}`} value={selectedCategoryFilter} onChange={(e) => setSelectedCategoryFilter(e.target.value)}><option value="Todas" className="text-slate-900 bg-white dark:text-slate-200 dark:bg-slate-900">Todas las Categorías</option>{uniqueCategories.map(c => <option key={c} value={c} className="text-slate-900 bg-white dark:text-slate-200 dark:bg-slate-900">{c}</option>)}</select></div>
          <div className="flex items-center gap-2"><Layers className="text-indigo-400 w-4 h-4 shrink-0" /><select className={`w-full rounded-xl py-3 px-3 text-sm focus:outline-none cursor-pointer font-medium ${t.masterInput}`} value={selectedSegmentFilter} onChange={(e) => setSelectedSegmentFilter(e.target.value)}><option value="Todos" className="text-slate-900 bg-white dark:text-slate-200 dark:bg-slate-900">Todos los Segmentos</option>{uniqueSegments.map(s => <option key={s} value={s} className="text-slate-900 bg-white dark:text-slate-200 dark:bg-slate-900">{s}</option>)}</select></div>
          <div className="flex items-center gap-2"><Users className="text-indigo-400 w-4 h-4 shrink-0" /><select className={`w-full rounded-xl py-3 px-3 text-sm focus:outline-none cursor-pointer font-medium ${t.masterInput}`} value={selectedVendorFilter} onChange={(e) => setSelectedVendorFilter(e.target.value)}><option value="Todos" className="text-slate-900 bg-white dark:text-slate-200 dark:bg-slate-900">Todos los Suplidores</option>{uniqueVendors.map(v => <option key={v} value={v} className="text-slate-900 bg-white dark:text-slate-200 dark:bg-slate-900">{v}</option>)}</select></div>
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <div className="bg-indigo-600 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Calculator className="w-6 h-6 text-white" /></div>
            <div>
              <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Total Selección ({selectedProducts.length} ítems)</p>
              <div className="flex items-baseline gap-3"><span className="text-2xl font-black text-white">{formatCurrency(selectedTotals.ty)}</span><span className="text-sm text-indigo-300 line-through">{formatCurrency(selectedTotals.ly)}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-indigo-900/30 px-5 py-2.5 rounded-xl border border-white/10">
            <div className="text-center">
              <p className="text-[10px] text-indigo-300 uppercase font-bold">Diferencia</p>
              <p className={`font-mono font-bold text-sm ${selectedTotals.ty >= selectedTotals.ly ? 'text-emerald-400' : 'text-rose-400'}`}>{selectedTotals.ty >= selectedTotals.ly ? '+' : ''}{formatCurrency(selectedTotals.ty - selectedTotals.ly)}</p>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
              <p className="text-[10px] text-indigo-300 uppercase font-bold">Crecimiento</p>
              <p className={`font-black flex items-center justify-center gap-0.5 ${selectedTotals.ty >= selectedTotals.ly ? 'text-emerald-400' : 'text-rose-400'}`}>{selectedTotals.ly > 0 ? ((selectedTotals.ty / selectedTotals.ly - 1) * 100).toFixed(1) + '%' : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {selectedProducts.length > 0 && (
        <div className={`p-6 rounded-2xl mb-6 border transition-colors ${t.card}`}>
          <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${t.textTitle}`}><Layers className="w-5 h-5 text-indigo-500" /> Comparativa Gráfica Seleccionada</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={selectedProductsChartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} /><XAxis dataKey="chartLabel" axisLine={false} tickLine={false} fontSize={11} angle={-35} textAnchor="end" interval={0} tick={{ fill: t.chartText, fontWeight: 600 }} /><YAxis hide /><Tooltip cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}} contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '16px'}} formatter={(value) => formatCurrency(value)} /><Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ color: t.chartText }} /><Bar dataKey="ty" name="Año Actual (TY)" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={35} /><Bar dataKey="ly" name="Año Pasado (LY)" fill={isDarkMode ? '#475569' : '#cbd5e1'} radius={[6, 6, 0, 0]} barSize={35} /></BarChart></ResponsiveContainer>
          </div>
        </div>
      )}
      <div className={`overflow-hidden rounded-2xl border transition-colors ${t.tableWrapper}`}>
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
              <tr className="text-[10px] uppercase font-black tracking-widest"><th className="px-4 py-4 w-12 text-center"><button onClick={toggleAllSelection} className="text-indigo-400 hover:text-indigo-500 transition-colors"><CheckSquare className={`w-5 h-5 ${selectedProducts.length > 0 && selectedProducts.length === filteredProducts.length ? 'text-indigo-600 fill-indigo-100' : ''}`} /></button></th><th className="px-4 py-4">Producto, UPC & ID</th><th className="px-4 py-4">Clasificación</th><th className="px-4 py-4">Tienda</th><th className="px-4 py-4 text-right">Ventas TY</th><th className="px-4 py-4 text-right">Ventas LY</th></tr>
            </thead>
            <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
              {currentProducts.map((p) => {
                const isSelected = selectedProducts.includes(p.id); const growth = p.ly === 0 ? 100 : ((p.ty / p.ly) - 1) * 100;
                return (
                  <tr key={p.id} className={`transition-colors group cursor-pointer ${isSelected ? t.rowSelected : t.rowBase}`} onClick={() => toggleProductSelection(p.id)}>
                    <td className="px-4 py-4 text-center"><input type="checkbox" checked={isSelected} readOnly className={`w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-none ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'border-slate-300'}`} /></td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className={`font-bold text-sm transition-colors uppercase leading-tight ${isSelected ? t.rowTextSelected : t.rowTextMain}`}>{p.name}</span>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`text-[10px] font-mono ${t.textSub}`}>
                            UPC: {p.upc || 'N/A'}
                          </span>
                          {(p.itemId || p.jdaId) && (
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
                              ID: {p.itemId || p.jdaId}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><div className="flex flex-col gap-1"><div className="flex flex-wrap gap-1"><span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>{p.category}</span></div><span className={`text-[10px] uppercase font-medium ${t.textSub}`}>{p.vendor}</span></div></td>
                    <td className="px-4 py-4"><span className={`text-xs font-bold uppercase tracking-tighter ${t.textSub}`}>{p.store}</span></td>
                    <td className={`px-4 py-4 text-right font-mono font-bold text-sm ${t.textTitle}`}>{formatCurrency(p.ty)}</td>
                    <td className="px-4 py-4 text-right"><div className="flex flex-col items-end"><span className={`font-mono text-sm ${t.textSub}`}>{formatCurrency(p.ly)}</span><span className={`text-[10px] font-black inline-flex items-center gap-0.5 mt-0.5 ${growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{growth >= 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}{p.ly === 0 && p.ty > 0 ? "NUEVO" : `${Math.abs(growth).toFixed(1)}%`}</span></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
            <span className={`text-xs font-medium ${t.textSub}`}>Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} de {filteredProducts.length} resultados</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`p-2 rounded-lg transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : (isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-700')}`}><ChevronLeft className="w-5 h-5" /></button>
              <span className={`text-xs font-bold ${t.textTitle}`}>Página {currentPage} de {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`p-2 rounded-lg transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : (isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-700')}`}><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStoresTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><Store className="w-6 h-6 text-indigo-500" /> Desempeño y Productividad por Localidad</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Benchmarking operativo entre sucursales. Selecciona tiendas para consolidar su volumen, auditar su productividad ($/SKU) y descubrir sus productos líderes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setSelectedAnalysisStores(filteredStores.map(s => s.name))} className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-sm">
            Seleccionar Todas ({filteredStores.length})
          </button>
          <button onClick={() => setSelectedAnalysisStores(storeStats.slice(0, 3).map(s => s.name))} className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${t.card}`}>
            Top 3 Líderes
          </button>
          {selectedAnalysisStores.length > 0 && (
            <button onClick={() => setSelectedAnalysisStores([])} className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all">
              Limpiar ({selectedAnalysisStores.length})
            </button>
          )}
        </div>
      </div>

      {/* Buscador y Ordenamiento de Tiendas */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${t.card}`}>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <Search className="text-slate-400 w-5 h-5 ml-2 shrink-0" />
          <input type="text" placeholder="Buscar tienda por nombre o región (Ej. Metro, Norte, Bayamón)..." className={`w-full bg-transparent border-none py-1.5 focus:outline-none text-sm font-medium ${t.textTitle}`} value={storeSearchTerm} onChange={(e) => setStoreSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Ordenar tarjetas:</span>
          <select value={storeSortBy} onChange={(e) => setStoreSortBy(e.target.value)} className={`p-2 rounded-xl border text-xs font-bold focus:outline-none ${t.input}`}>
            <option value="ty">Mayor Venta TY ($)</option>
            <option value="growth">Mayor Crecimiento (%)</option>
            <option value="salesPerSku">Productividad ($ / SKU)</option>
            <option value="units">Unidades Vendidas</option>
          </select>
        </div>
      </div>

      {/* Grid de Tarjetas de Tiendas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {filteredStores.map(store => {
          const isSelected = selectedAnalysisStores.includes(store.name);
          return (
            <div key={store.name} onClick={() => toggleStoreAnalysisSelection(store.name)} className={`p-5 rounded-2xl cursor-pointer transition-all border-2 flex flex-col justify-between h-full ${isSelected ? t.cardSelected + ' shadow-lg scale-[1.01]' : t.cardHover}`}>
              <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}><Store className="w-5 h-5" /></div>
                    <div>
                      <h3 className={`font-black text-sm leading-tight ${t.textTitle}`}>{store.name}</h3>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded inline-block mt-1 ${isDarkMode ? 'bg-indigo-950 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>{store.region} • {store.shareOfChain.toFixed(1)}% Share</span>
                    </div>
                  </div>
                  <input type="checkbox" checked={isSelected} readOnly className="w-4 h-4 text-indigo-600 rounded bg-transparent border-slate-400 shrink-0" />
                </div>
                <div className="mt-4 space-y-2">
                  <div>
                    <p className={`text-[10px] uppercase font-bold ${t.textSub}`}>Ventas TY</p>
                    <p className={`text-xl font-mono font-black ${t.textTitle}`}>{formatCurrency(store.ty)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                    <div>
                      <span className={`text-[10px] block uppercase font-bold ${t.textSub}`}>Venta/SKU</span>
                      <span className={`text-xs font-mono font-bold ${t.textTitle}`}>{formatCurrency(store.salesPerSku)}</span>
                    </div>
                    <div>
                      <span className={`text-[10px] block uppercase font-bold ${t.textSub}`}>Unidades</span>
                      <span className={`text-xs font-mono font-bold ${t.textTitle}`}>{formatNumber(store.units)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`flex justify-between items-center mt-4 pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={`text-[11px] font-semibold ${t.textSub}`}>{store.productCount} SKUs • Top: {store.topCategory}</span>
                <span className={`text-xs font-black flex items-center gap-0.5 ${store.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{store.growth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}{Math.abs(store.growth).toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedAnalysisStores.length > 0 ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* KPIs Consolidados de Selección */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border ${t.card}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Ventas Consolidadas ({selectedAnalysisStores.length} Tiendas)</p>
              <p className={`text-2xl font-black mt-1 text-indigo-500`}>{formatCurrency(selectedStoresData.tyTotal)}</p>
              <p className={`text-xs mt-1 ${t.textSub}`}>{selectedStoresData.shareOfChain.toFixed(1)}% del total de la cadena</p>
            </div>
            <div className={`p-5 rounded-2xl border ${t.card}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Crecimiento Ponderado vs LY</p>
              <p className={`text-2xl font-black mt-1 ${selectedStoresData.weightedGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {selectedStoresData.weightedGrowth >= 0 ? '+' : ''}{selectedStoresData.weightedGrowth.toFixed(1)}%
              </p>
              <p className={`text-xs mt-1 ${t.textSub}`}>LY: {formatCurrency(selectedStoresData.lyTotal)}</p>
            </div>
            <div className={`p-5 rounded-2xl border ${t.card}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Productividad Media ($ / SKU)</p>
              <p className={`text-2xl font-black mt-1 ${t.textTitle}`}>{formatCurrency(selectedStoresData.salesPerSku)}</p>
              <p className={`text-xs mt-1 ${t.textSub}`}>{selectedStoresData.skuCountTotal} registros activos</p>
            </div>
            <div className={`p-5 rounded-2xl border ${t.card}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Precio Promedio (AUR Selección)</p>
              <p className="text-2xl font-black mt-1 text-amber-500">{formatCurrency(selectedStoresData.avgAur)}</p>
              <p className={`text-xs mt-1 ${t.textSub}`}>{formatNumber(selectedStoresData.unitsTotal)} unidades movidas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border lg:col-span-2 transition-colors ${t.card}`}>
              <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${t.textTitle}`}><BarChart3 className="w-5 h-5 text-indigo-500" /> Comparativa de Ventas (TY vs LY) y Crecimiento %</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={selectedStoresData.comparisonChart} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} fontWeight="bold" tick={{ fill: t.chartText }} />
                    <YAxis yAxisId="left" hide />
                    <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fill: t.chartText, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}} contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '12px'}} formatter={(val, name) => name.includes('%') ? `${val}%` : formatCurrency(val)} />
                    <Legend iconType="circle" wrapperStyle={{ color: t.chartText }} />
                    <Bar yAxisId="left" dataKey="ty" name="Año Actual (TY)" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={36} />
                    <Bar yAxisId="left" dataKey="ly" name="Año Pasado (LY)" fill={isDarkMode ? '#475569' : '#cbd5e1'} radius={[6, 6, 0, 0]} barSize={36} />
                    <Line yAxisId="right" type="monotone" dataKey="growth" name="Crecimiento (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border transition-colors ${t.card}`}>
              <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${t.textTitle}`}><PieChartIcon className="w-5 h-5 text-emerald-500" /> Mix de Categorías en Tiendas Seleccionadas</h3>
              <div className="h-64 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={selectedStoresData.categoriesChart} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                      {selectedStoresData.categoriesChart.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '8px'}} formatter={(val) => formatCurrency(val)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
                  {selectedStoresData.categoriesChart.map((cat, i) => (
                    <div key={i} className={`flex justify-between items-center text-xs ${t.textTitle}`}>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: COLORS[i % COLORS.length]}}></div><span className="font-semibold truncate max-w-[110px]">{cat.name}</span></div>
                      <span className="font-mono font-bold">{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border transition-colors ${t.card}`}>
              <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${t.textTitle}`}><Users className="w-5 h-5 text-orange-500" /> Top Suplidores Consolidados</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedStoresData.vendorsChart} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={t.chartGrid} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={110} tick={{fontSize: 10, fontWeight: 600, fill: t.chartText}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}} contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '8px'}} formatter={(val) => formatCurrency(val)} />
                    <Bar dataKey="value" name="Ventas TY" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={18}>
                      {selectedStoresData.vendorsChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tabla de Productos Impulsores en las Tiendas Seleccionadas */}
          <div className={`overflow-hidden rounded-2xl border transition-colors ${t.tableWrapper}`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className={`font-black flex items-center gap-2 ${t.textTitle}`}><Award className="w-5 h-5 text-amber-500" /> Top 12 SKUs Impulsores en la Selección</h3>
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
                  <tr className="text-[10px] uppercase font-black tracking-widest">
                    <th className="px-4 py-3.5 text-center">#</th>
                    <th className="px-4 py-3.5">Producto & Categoría</th>
                    <th className="px-4 py-3.5 text-center">Presencia</th>
                    <th className="px-4 py-3.5 text-right">Unidades</th>
                    <th className="px-4 py-3.5 text-right">Ventas TY</th>
                    <th className="px-4 py-3.5 text-right">Crec. vs LY</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
                  {selectedStoresData.topSkusInSelection.map((item, idx) => (
                    <tr key={idx} className={t.rowBase}>
                      <td className={`px-4 py-3 text-center font-mono text-xs font-bold ${t.textSub}`}>{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-xs uppercase block ${t.textTitle}`}>{item.name}</span>
                        <span className={`text-[10px] font-mono ${t.textSub}`}>UPC: {item.upc} • {item.category}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-indigo-950 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
                          {item.storeCount} / {selectedAnalysisStores.length} tiendas
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-xs ${t.textTitle}`}>{formatNumber(item.units)}</td>
                      <td className={`px-4 py-3 text-right font-mono font-bold text-xs ${t.textTitle}`}>{formatCurrency(item.ty)}</td>
                      <td className={`px-4 py-3 text-right font-mono font-bold text-xs ${item.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {item.growth >= 0 ? '+' : ''}{item.growth.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl p-12 text-center border-2 border-dashed ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
          <Store className={`w-12 h-12 mx-auto mb-3 opacity-50 ${t.textSub}`} />
          <h3 className={`text-lg font-bold ${t.textTitle}`}>Selecciona tiendas para auditar su desempeño</h3>
          <p className={`text-sm mt-1 ${t.textSub}`}>Haz clic en las tarjetas superiores o usa el botón "Seleccionar Todas" para activar las comparativas.</p>
        </div>
      )}
    </div>
  );

  const renderMapTab = () => {
    const orderedRegionKeys = ['Metro', 'Norte', 'Centro', 'Este', 'Sur', 'Oeste'];
    const activeRegions = orderedRegionKeys.map(k => mapData.find(r => r.name === k)).filter(Boolean);
    const unassignedRegion = mapData.find(r => r.name === 'Sin Asignar');
    const leadingRegion = [...activeRegions].sort((a, b) => b.ty - a.ty)[0];
    const fastestGrowingRegion = [...activeRegions].filter(r => r.ty > 0).sort((a, b) => b.growth - a.growth)[0];
    const maxRegionTy = Math.max(...activeRegions.map(r => r.ty), 1);
    const maxSalesPerStore = Math.max(...activeRegions.map(r => r.salesPerStore), 1);

    // Diccionario completo de los 78 municipios de Puerto Rico
    const allTownsStatsMap = {};
    const allTownsList = [];
    let maxTownTy = 1;

    orderedRegionKeys.forEach((regName) => {
      const towns = PR_REGIONS[regName] || [];
      const regObj = mapData.find(r => r.name === regName);
      towns.forEach(twn => {
        const pData = regObj?.pueblos?.[twn];
        const ty = pData ? pData.ty : 0;
        const ly = pData ? pData.ly : 0;
        const units = pData ? pData.units : 0;
        const stCount = pData ? pData.stores.size : 0;
        const skuCount = pData ? pData.skus.size : 0;
        const topCat = pData ? (Object.entries(pData.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A') : 'N/A';
        if (ty > maxTownTy) maxTownTy = ty;

        const townObj = {
          name: twn,
          region: regName,
          ty,
          ly,
          units,
          skuCount,
          topCat,
          storeCount: stCount,
          storeNames: pData ? Array.from(pData.stores) : [],
          growth: ly > 0 ? ((ty / ly) - 1) * 100 : (ty > 0 ? 100 : 0),
          salesPerStore: stCount > 0 ? ty / stCount : 0
        };
        allTownsStatsMap[twn] = townObj;
        allTownsList.push(townObj);
      });
    });

    const totalActiveTownsCount = allTownsList.filter(twn => twn.ty > 0).length;

    // Filtrado y ordenamiento para el Directorio de los 78 Municipios
    const filteredTownsDirectory = allTownsList
      .filter(twn => {
        const matchesRegion = mapRegionFilter === 'Todas' || twn.region === mapRegionFilter;
        const matchesStatus =
          mapStatusFilter === 'Todos' ||
          (mapStatusFilter === 'active' && twn.ty > 0) ||
          (mapStatusFilter === 'whitespace' && twn.ty <= 0);
        const matchesSearch =
          !mapTownSearch ||
          twn.name.toLowerCase().includes(mapTownSearch.toLowerCase()) ||
          twn.region.toLowerCase().includes(mapTownSearch.toLowerCase()) ||
          twn.storeNames.some(s => s.toLowerCase().includes(mapTownSearch.toLowerCase()));
        return matchesRegion && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (mapTownSort === 'ty') return b.ty - a.ty || a.name.localeCompare(b.name);
        if (mapTownSort === 'growth') return b.growth - a.growth || b.ty - a.ty;
        return a.name.localeCompare(b.name, 'es');
      });

    const getTileColorClasses = (item, isSelected, isRegionTile = true) => {
      if (isSelected) {
        return 'ring-4 ring-amber-400 bg-indigo-600 text-white border-indigo-300 shadow-xl scale-[1.03] z-20';
      }
      const regTheme = REGION_VISUAL_THEME[item?.region || item?.name] || REGION_VISUAL_THEME.Metro;

      // Modo Colorear por Región Geográfica (Ideal para ver los 78 pueblos agrupados por su región)
      if (mapColorMetric === 'region') {
        if (item && item.ty > 0) {
          return `${regTheme.tileActive} hover:brightness-110`;
        }
        return isDarkMode ? regTheme.tileEmptyDark : regTheme.tileEmptyLight;
      }

      if (!item || item.ty <= 0) {
        return isDarkMode
          ? 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
          : 'bg-white/80 border-slate-200/90 text-slate-500 hover:border-indigo-300';
      }

      if (mapColorMetric === 'growth') {
        if (item.growth >= 10) return 'bg-emerald-600 text-white border-emerald-500 shadow-md hover:bg-emerald-500';
        if (item.growth >= 0) return 'bg-emerald-500 text-white border-emerald-400 shadow-sm hover:bg-emerald-400';
        if (item.growth >= -10) return 'bg-amber-500 text-white border-amber-400 shadow-sm hover:bg-amber-400';
        return 'bg-rose-600 text-white border-rose-500 shadow-md hover:bg-rose-500';
      }

      if (mapColorMetric === 'salesPerStore') {
        const denom = isRegionTile ? maxSalesPerStore : maxTownTy;
        const ratio = Math.min(1, (item.salesPerStore || 0) / Math.max(denom, 1));
        if (ratio > 0.65) return 'bg-sky-700 text-white border-sky-500 shadow-md hover:bg-sky-600';
        if (ratio > 0.35) return 'bg-sky-600 text-white border-sky-400 shadow-sm hover:bg-sky-500';
        return 'bg-sky-500 text-white border-sky-300 hover:bg-sky-400';
      }

      const denom = isRegionTile ? maxRegionTy : maxTownTy;
      const ratio = Math.min(1, item.ty / Math.max(denom, 1));
      if (ratio > 0.7) return 'bg-indigo-800 text-white border-indigo-600 shadow-md hover:bg-indigo-700';
      if (ratio > 0.4) return 'bg-indigo-600 text-white border-indigo-500 shadow-sm hover:bg-indigo-500';
      if (ratio > 0.15) return 'bg-indigo-500 text-white border-indigo-400 hover:bg-indigo-400';
      return isDarkMode
        ? 'bg-indigo-950/90 text-indigo-200 border-indigo-800 hover:bg-indigo-900'
        : 'bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-200';
    };

    // Bloque Regional organizado con todos sus municipios ordenados alfabéticamente
    const renderRegionBentoBlock = (regName, layoutClass = "") => {
      const region = activeRegions.find(r => r.name === regName);
      if (!region) return null;
      const isSelected = selectedMapRegion === region.name && !selectedMapTown;
      const townsInRegion = PR_REGIONS[regName] || [];
      const activeTownsInReg = townsInRegion.filter(twn => allTownsStatsMap[twn]?.ty > 0);
      const tileClasses = getTileColorClasses(region, isSelected, true);
      const hasData = region.ty > 0;

      return (
        <div
          key={regName}
          onClick={() => {
            setSelectedMapTown(null);
            setSelectedMapRegion(isSelected ? null : regName);
          }}
          className={`${layoutClass} p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden group ${tileClasses}`}
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest block opacity-80">
                  {region.zoneLabel}
                </span>
                <h4 className="text-lg font-black tracking-tight leading-tight flex items-center gap-1.5">
                  Región {region.name}
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/15">
                    {townsInRegion.length} pueblos
                  </span>
                </h4>
              </div>
              {hasData && (
                <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded-lg bg-black/20 backdrop-blur-sm">
                  {region.growth >= 0 ? '+' : ''}{region.growth.toFixed(1)}%
                </span>
              )}
            </div>

            <div className="mt-2.5 flex items-baseline justify-between gap-2">
              <div>
                <p className="text-xl font-mono font-black leading-none">
                  {hasData
                    ? (mapColorMetric === 'salesPerStore'
                        ? formatCurrency(region.salesPerStore)
                        : formatCurrency(region.ty))
                    : '$0.00'}
                </p>
                <p className="text-[10px] font-bold opacity-85 mt-1">
                  {hasData
                    ? `${region.shareOfIsland.toFixed(1)}% Isla • ${region.storeCount} tienda(s) • ${region.skuCount} SKUs`
                    : `Sin tiendas asignadas aún`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black block opacity-90">
                  Cobertura: {activeTownsInReg.length}/{townsInRegion.length}
                </span>
                <span className="text-[9px] opacity-75 block">
                  ({region.penetrationPct.toFixed(0)}% municipios)
                </span>
              </div>
            </div>
          </div>

          {/* Lista completa de los pueblos de la región */}
          <div className="mt-3 pt-2.5 border-t border-current/15">
            <div className="flex items-center justify-between text-[10px] font-bold mb-1.5 opacity-90">
              <span>Municipios de {region.name}:</span>
              <span className="underline opacity-75 group-hover:opacity-100">Clic para auditar pueblo</span>
            </div>
            <div className="flex flex-wrap gap-1 max-h-[84px] overflow-y-auto pr-1">
              {townsInRegion.map(twn => {
                const tStat = allTownsStatsMap[twn];
                const tActive = tStat?.ty > 0;
                const isTownSel = selectedMapTown === twn;
                return (
                  <button
                    key={twn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMapRegion(regName);
                      setSelectedMapTown(isTownSel ? null : twn);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                      isTownSel
                        ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-white shadow'
                        : tActive
                        ? 'bg-white/25 hover:bg-white/40 font-extrabold'
                        : 'bg-black/10 hover:bg-black/20 opacity-75'
                    }`}
                    title={tActive ? `${twn}: ${formatCurrency(tStat.ty)} (${tStat.storeCount} tiendas)` : `${twn} (${regName}): Oportunidad White Space`}
                  >
                    {tActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>}
                    {twn}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* ENCABEZADO Y CONTROLES DE GEOGRAFÍA */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}>
              <MapIcon className="w-6 h-6 text-indigo-500" /> Geografía Comercial de Puerto Rico (Mapa Isla 78 Pueblos & 6 Regiones)
            </h2>
            <p className={`text-sm mt-1 ${t.textSub}`}>
              Mapa cartográfico de la isla sin coordenadas complejas: visualiza los 78 municipios en su posición real de Norte a Sur y de Oeste a Este, filtra por región y simula aperturas en territorios White Space.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Botón para abrir/cerrar el Asignador de Pueblos para todas las tiendas */}
            <button
              onClick={() => setShowStoreTownMapper(!showStoreTownMapper)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                showStoreTownMapper
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : t.cardHover
              }`}
            >
              <MapPin className="w-4 h-4 text-amber-500" />
              Asignar Pueblos ({uniqueStores.length} Tiendas)
            </button>

            {/* Selector de Capa de Color */}
            <div className={`flex items-center gap-1 p-1.5 rounded-xl border ${t.card}`}>
              <Layers className="w-4 h-4 text-indigo-500 ml-1.5" />
              <span className={`text-[10px] font-black uppercase tracking-wider mr-1 ${t.textSub}`}>Color:</span>
              {[
                { id: 'region', label: 'Por Región (6)' },
                { id: 'ty', label: 'Ventas ($)' },
                { id: 'growth', label: 'Crec. (%)' },
                { id: 'salesPerStore', label: '$/Tienda' }
              ].map(layer => (
                <button
                  key={layer.id}
                  onClick={() => setMapColorMetric(layer.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${mapColorMetric === layer.id ? 'bg-indigo-600 text-white shadow-sm' : t.textSub}`}
                >
                  {layer.label}
                </button>
              ))}
            </div>

            {/* Selector de Modo de Vista */}
            <div className={`flex bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-xl border ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
              <button
                onClick={() => setMapViewMode('island_map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mapViewMode === 'island_map' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : t.textSub}`}
              >
                1. Mapa Isla (78 Pueblos)
              </button>
              <button
                onClick={() => setMapViewMode('regions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mapViewMode === 'regions' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : t.textSub}`}
              >
                2. Mapa 6 Regiones
              </button>
              <button
                onClick={() => setMapViewMode('towns')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mapViewMode === 'towns' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : t.textSub}`}
              >
                3. Directorio 78
              </button>
              <button
                onClick={() => setMapViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mapViewMode === 'matrix' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : t.textSub}`}
              >
                4. Matriz
              </button>
            </div>
          </div>
        </div>

        {/* KPIs EJECUTIVOS TERRITORIALES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-2xl border ${t.card}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Región Dominante ($)</p>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-xl font-black text-indigo-500">{leadingRegion?.ty > 0 ? leadingRegion.name : 'Sin Datos'}</p>
              {leadingRegion?.ty > 0 && <span className="text-xs font-mono font-bold text-indigo-400">{leadingRegion.shareOfIsland.toFixed(1)}% Isla</span>}
            </div>
            <p className={`text-xs mt-1 font-mono ${t.textSub}`}>{leadingRegion?.ty > 0 ? formatCurrency(leadingRegion.ty) : 'Sube un archivo para evaluar'}</p>
          </div>

          <div className={`p-4 rounded-2xl border ${t.card}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Líder en Expansión (% YoY)</p>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-xl font-black text-emerald-500">{fastestGrowingRegion ? fastestGrowingRegion.name : 'Sin Datos'}</p>
              {fastestGrowingRegion && (
                <span className={`text-xs font-mono font-black ${fastestGrowingRegion.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {fastestGrowingRegion.growth >= 0 ? '+' : ''}{fastestGrowingRegion.growth.toFixed(1)}%
                </span>
              )}
            </div>
            <p className={`text-xs mt-1 ${t.textSub}`}>Cat. Líder: {fastestGrowingRegion?.topCategory || 'N/A'}</p>
          </div>

          <div className={`p-4 rounded-2xl border ${t.card}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Penetración Municipal PR</p>
            <div className="flex items-baseline justify-between mt-1">
              <p className={`text-xl font-black ${t.textTitle}`}>
                {totalActiveTownsCount} / 78 Pueblos
              </p>
              <span className="text-xs font-bold text-emerald-500">
                {((totalActiveTownsCount / 78) * 100).toFixed(0)}% Isla
              </span>
            </div>
            <p className={`text-xs mt-1 ${t.textSub}`}>
              {78 - totalActiveTownsCount} municipios White Space para crecer
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${t.card}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Asignación de Sucursales</p>
            <div className="flex items-baseline justify-between mt-1">
              <p className={`text-xl font-black ${unassignedRegion?.storeCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {unassignedRegion?.storeCount > 0 ? `${unassignedRegion.storeCount} Sin Pueblo` : '100% Ubicadas'}
              </p>
              <Navigation className="w-4 h-4 text-indigo-400" />
            </div>
            <p className={`text-xs mt-1 ${t.textSub}`}>
              {unassignedRegion?.storeCount > 0 ? 'Asígnalas en el panel inferior con 1 clic' : `${uniqueStores.length} tienda(s) vinculadas a su pueblo`}
            </p>
          </div>
        </div>

        {/* PANEL DESPLEGABLE DE ASIGNACIÓN DE TIENDAS A LOS 78 PUEBLOS (AGRUPADO POR REGIÓN) */}
        {(showStoreTownMapper || unassignedRegion?.storeCount > 0) && uniqueStores.length > 0 && (
          <div className={`p-5 rounded-2xl border mb-6 transition-all ${
            unassignedRegion?.storeCount > 0
              ? (isDarkMode ? 'bg-amber-950/20 border-amber-800/60' : 'bg-amber-50/90 border-amber-200')
              : t.card
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div>
                <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${unassignedRegion?.storeCount > 0 ? 'text-amber-500' : 'text-indigo-500'}`}>
                  <MapPin className="w-4 h-4" /> Gestor de Ubicación Municipal por Tienda (78 Pueblos organizados por Región)
                </h4>
                <p className={`text-xs mt-0.5 ${t.textSub}`}>
                  Selecciona o cambia el pueblo de cualquier tienda (ej. <strong>Naranjito</strong> en Región Centro, Bayamón en Metro, etc.) y el mapa se actualizará al instante:
                </p>
              </div>
              {showStoreTownMapper && (
                <button
                  onClick={() => setShowStoreTownMapper(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-200 self-end sm:self-auto"
                >
                  Ocultar Panel
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {uniqueStores.map(stName => {
                const detected = getRegionAndTownForStore(stName);
                const isUnassigned = detected.town === 'Sin Asignar';
                return (
                  <div
                    key={stName}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 ${
                      isUnassigned
                        ? 'border-amber-500/60 bg-amber-500/10'
                        : (isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-200')
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`font-black text-xs truncate ${t.textTitle}`} title={stName}>{stName}</span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        isUnassigned ? 'bg-amber-500 text-slate-950' : 'bg-indigo-500/15 text-indigo-500'
                      }`}>
                        {detected.region}
                      </span>
                    </div>
                    <select
                      value={detected.town === 'Sin Asignar' ? "" : detected.town}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          setCustomTownOverrides(prev => ({ ...prev, [stName]: val }));
                        }
                      }}
                      className={`w-full p-1.5 rounded-lg border text-xs font-bold focus:outline-none cursor-pointer ${t.input}`}
                    >
                      <option value="">-- Seleccionar Pueblo (78) --</option>
                      {orderedRegionKeys.map(rKey => (
                        <optgroup key={rKey} label={`Región ${rKey} (${PR_REGIONS[rKey].length} pueblos)`}>
                          {PR_REGIONS[rKey].map(twn => (
                            <option key={twn} value={twn}>{twn}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SPLIT-SCREEN: PANEL GEOGRÁFICO IZQUIERDO (7 COLS) + INSPECTOR PROFUNDO DERECHO (5 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMNA IZQUIERDA: MAPA DE LA ISLA / REGIONES / DIRECTORIO / MATRIZ */}
          <div className={`lg:col-span-7 rounded-3xl border overflow-hidden shadow-lg transition-colors flex flex-col ${isDarkMode ? 'bg-[#081121] border-slate-800' : 'bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-50/50 border-sky-200'}`}>
            {/* Barra de Estado Activo + Filtro Rápido de Región sobre el Mapa */}
            <div className={`px-4 py-3 border-b flex flex-col gap-2.5 ${isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-300' : 'bg-white/95 border-sky-100 text-slate-700'}`}>
              <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-black uppercase tracking-wider">
                    {selectedMapTown
                      ? `Pueblo Seleccionado: ${selectedMapTown} (Región ${selectedMapRegion})`
                      : selectedMapRegion
                      ? `Región Seleccionada: ${selectedMapRegion} (${PR_REGIONS[selectedMapRegion]?.length || 0} Pueblos)`
                      : mapViewMode === 'island_map'
                      ? 'Mapa Cartográfico de Puerto Rico • 78 Municipios en su Posición Real'
                      : mapViewMode === 'regions'
                      ? 'Mapa de Bloques Regionales • 6 Regiones Comerciales'
                      : mapViewMode === 'towns'
                      ? `Directorio Oficial • ${filteredTownsDirectory.length} de 78 Municipios`
                      : 'Matriz Comparativa Regional & Cobertura Municipal'}
                  </span>
                </div>

                {(selectedMapRegion || selectedMapTown || mapRegionFilter !== 'Todas') && (
                  <button
                    onClick={() => {
                      setSelectedMapRegion(null);
                      setSelectedMapTown(null);
                      setMapRegionFilter('Todas');
                    }}
                    className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-500 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <X className="w-3 h-3" /> Ver Toda la Isla (78)
                  </button>
                )}
              </div>

              {/* Barra interactiva de las 6 Regiones para resaltar/filtrar en vivo sobre el mapa */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className={`text-[10px] font-black uppercase tracking-wider mr-1 ${t.textSub}`}>Enfocar Región:</span>
                <button
                  onClick={() => {
                    setMapRegionFilter('Todas');
                    setSelectedMapRegion(null);
                    setSelectedMapTown(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                    mapRegionFilter === 'Todas' && !selectedMapRegion
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : (isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                  }`}
                >
                  Toda la Isla (78)
                </button>
                {orderedRegionKeys.map(rKey => {
                  const rTheme = REGION_VISUAL_THEME[rKey];
                  const isFocused = mapRegionFilter === rKey || selectedMapRegion === rKey;
                  const regData = activeRegions.find(r => r.name === rKey);
                  return (
                    <button
                      key={rKey}
                      onClick={() => {
                        const nextReg = mapRegionFilter === rKey ? 'Todas' : rKey;
                        setMapRegionFilter(nextReg);
                        setSelectedMapTown(null);
                        setSelectedMapRegion(nextReg === 'Todas' ? null : rKey);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1.5 border ${
                        isFocused
                          ? `${rTheme.badge} border-transparent shadow-md scale-[1.03]`
                          : (isDarkMode ? 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100')
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isFocused ? 'bg-white' : rTheme.dot}`}></span>
                      <span>{rKey} ({PR_REGIONS[rKey].length})</span>
                      {regData?.storeCount > 0 && (
                        <span className="text-[9px] font-mono opacity-85">• {regData.storeCount}t</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {mapViewMode === 'island_map' && (
              /* VISTA 1 (NUEVA): MAPA CARTOGRÁFICO DE LA ISLA DE PUERTO RICO (78 PUEBLOS EN SU SILUETA GEOMÉTRICA REAL) */
              <div className="p-3 sm:p-5 flex flex-col gap-3">
                {/* Buscador rápido sobre el Mapa de la Isla */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border flex-1 ${t.card}`}>
                    <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Resaltar pueblo en el mapa (ej. Naranjito, Ponce, Bayamón, Fajardo, Vieques)..."
                      value={mapTownSearch}
                      onChange={(e) => setMapTownSearch(e.target.value)}
                      className={`w-full bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`}
                    />
                    {mapTownSearch && (
                      <button onClick={() => setMapTownSearch('')} className="text-slate-400 hover:text-slate-200">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold px-2">
                    <span className="flex items-center gap-1 text-emerald-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30"></span> Con Tienda Activa ({totalActiveTownsCount})
                    </span>
                    <span className={`flex items-center gap-1 ${t.textSub}`}>
                      <span className="w-2 h-2 rounded-full border border-current opacity-60"></span> White Space ({78 - totalActiveTownsCount})
                    </span>
                  </div>
                </div>

                {/* Marco Oceánico Cartográfico de Puerto Rico */}
                <div className={`rounded-2xl border p-3 sm:p-4 overflow-x-auto relative ${
                  isDarkMode
                    ? 'bg-gradient-to-b from-slate-950 via-[#0a192f] to-slate-950 border-sky-900/40'
                    : 'bg-gradient-to-b from-sky-100/80 via-sky-50 to-cyan-100/70 border-sky-200/80'
                }`}>
                  <div className="text-center text-[9px] font-black uppercase tracking-[0.35em] text-sky-500/70 mb-2 select-none">
                    🌊 Océano Atlántico • Costa Norte (Oeste → Este) 🌊
                  </div>

                  {/* Cuadrícula de 17 Columnas x 5 Franjas que dibuja la silueta de Puerto Rico + Rincón + Vieques y Culebra */}
                  <div className="min-w-[760px] space-y-1.5">
                    {PR_ISLAND_GRID.map((rowTowns, rowIdx) => {
                      const rowLabels = [
                        'Costa Norte',
                        'Llanos Norte',
                        'Cordillera',
                        'Valles Sur',
                        'Costa Sur'
                      ];
                      return (
                        <div key={`pr_row_${rowIdx}`} className="grid grid-cols-17 gap-1 items-stretch" style={{ gridTemplateColumns: 'repeat(17, minmax(0, 1fr))' }}>
                          {rowTowns.map((townName, colIdx) => {
                            if (!townName) {
                              // Espacio marítimo (Canal de la Mona al oeste o Sonda de Vieques al este)
                              return (
                                <div key={`sea_${rowIdx}_${colIdx}`} className="flex items-center justify-center select-none pointer-events-none">
                                  {colIdx === 0 && rowIdx === 0 && (
                                    <span className="text-[8px] font-black uppercase text-sky-500/40">{rowLabels[rowIdx]}</span>
                                  )}
                                  {colIdx === 16 && rowIdx === 2 && (
                                    <span className="text-[7px] font-black uppercase text-sky-500/50 text-center leading-tight">Sonda<br/>Vieques</span>
                                  )}
                                </div>
                              );
                            }

                            const tStat = allTownsStatsMap[townName];
                            const isSelected = selectedMapTown === townName;
                            const isRegionFocused =
                              (mapRegionFilter === 'Todas' && !selectedMapRegion) ||
                              mapRegionFilter === tStat?.region ||
                              selectedMapRegion === tStat?.region;
                            const matchesSearch =
                              mapTownSearch &&
                              townName.toLowerCase().includes(mapTownSearch.toLowerCase());
                            const isSearchDimmed =
                              mapTownSearch && !matchesSearch;

                            const tileColors = getTileColorClasses(tStat, isSelected, false);
                            const hasStores = (tStat?.storeCount || 0) > 0;
                            const shortName = townName
                              .replace('San Sebastián', 'S.Sebast.')
                              .replace('Sabana Grande', 'Sab.Gde')
                              .replace('Trujillo Alto', 'Truj.Alto')
                              .replace('Aguas Buenas', 'Ag.Buenas')
                              .replace('Quebradillas', 'Quebrad.')
                              .replace('Barranquitas', 'Barranq.')
                              .replace('San Lorenzo', 'S.Lorenzo')
                              .replace('Santa Isabel', 'Sta.Isabel')
                              .replace('Las Piedras', 'L.Piedras')
                              .replace('San Germán', 'S.Germán')
                              .replace('Hormigueros', 'Hormig.')
                              .replace('Guayanilla', 'Guayan.')
                              .replace('Barceloneta', 'Barcel.')
                              .replace('Las Marías', 'L.Marías')
                              .replace('Juana Díaz', 'J.Díaz')
                              .replace('Río Grande', 'Río Gde')
                              .replace('Canóvanas', 'Canóv.');

                            return (
                              <button
                                key={townName}
                                type="button"
                                onClick={() => {
                                  setSelectedMapRegion(tStat?.region || 'Metro');
                                  setSelectedMapTown(isSelected ? null : townName);
                                }}
                                title={`${townName} (Región ${tStat?.region}) • ${hasStores ? `${formatCurrency(tStat.ty)} | ${tStat.storeCount} tienda(s)` : 'White Space (Sin tienda aún)'}`}
                                className={`h-[50px] p-1 rounded-lg border text-left transition-all duration-200 flex flex-col justify-between relative group ${tileColors} ${
                                  !isRegionFocused || isSearchDimmed ? 'opacity-25 scale-95' : 'opacity-100'
                                } ${matchesSearch ? 'ring-2 ring-amber-400 scale-105 z-20' : ''}`}
                              >
                                <div className="flex items-start justify-between gap-0.5 w-full">
                                  <span className="text-[8.5px] font-black leading-tight tracking-tighter truncate block">
                                    {shortName}
                                  </span>
                                  {hasStores ? (
                                    <span className="w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-white/60 shrink-0"></span>
                                  ) : (
                                    <span className="text-[7px] font-mono opacity-60 shrink-0">{tStat?.region?.slice(0, 1)}</span>
                                  )}
                                </div>

                                <div className="w-full">
                                  {hasStores ? (
                                    <span className="text-[8px] font-mono font-black block truncate leading-none bg-black/25 text-white px-1 py-0.5 rounded">
                                      {tStat.ty >= 1000 ? `$${(tStat.ty / 1000).toFixed(0)}k` : formatCurrency(tStat.ty)}
                                    </span>
                                  ) : (
                                    <span className="text-[7.5px] font-semibold opacity-65 block truncate leading-none">
                                      {tStat?.region}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.25em] text-sky-500/70 mt-2.5 pt-1 border-t border-sky-500/15 select-none">
                    <span>← Canal de la Mona (Oeste)</span>
                    <span>☀️ Mar Caribe • Costa Sur ☀️</span>
                    <span>Islas Municipio (Vieques / Culebra) →</span>
                  </div>
                </div>
              </div>
            )}

            {mapViewMode === 'regions' && (
              /* VISTA 2: MAPA ANATÓMICO BENTO DE LAS 6 REGIONES DE PUERTO RICO */
              <div className="p-4 sm:p-6 flex flex-col gap-3">
                <div className="text-center text-[10px] font-black uppercase tracking-[0.3em] opacity-40 select-none">
                  ↑ Océano Atlántico • Costa Norte & Área Metro ↑
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch min-h-[450px]">
                  {/* Oeste (15 municipios) */}
                  <div className="md:col-span-3 flex flex-col">
                    {renderRegionBentoBlock('Oeste', 'flex-1')}
                  </div>

                  {/* Cuerpo Central: Norte (12) + Metro (8) arriba, Centro (14 - incluye Naranjito) al medio, Sur (13) abajo */}
                  <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {renderRegionBentoBlock('Norte', 'sm:col-span-6')}
                    {renderRegionBentoBlock('Metro', 'sm:col-span-6')}
                    {renderRegionBentoBlock('Centro', 'sm:col-span-12')}
                    {renderRegionBentoBlock('Sur', 'sm:col-span-12')}
                  </div>

                  {/* Este + Vieques y Culebra (16 municipios) */}
                  <div className="md:col-span-3 flex flex-col">
                    {renderRegionBentoBlock('Este', 'flex-1')}
                  </div>
                </div>

                <div className="text-center text-[10px] font-black uppercase tracking-[0.3em] opacity-40 select-none">
                  ↓ Mar Caribe • Llanura Costera del Sur ↓
                </div>
              </div>
            )}

            {mapViewMode === 'towns' && (
              /* VISTA 3: DIRECTORIO COMPLETO Y ORGANIZADO DE LOS 78 MUNICIPIOS */
              <div className="p-4 sm:p-5 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 ${t.card}`}>
                    <Search className="w-4 h-4 text-indigo-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Buscar cualquiera de los 78 pueblos (ej. Naranjito, Caguas, Ponce, Vieques)..."
                      value={mapTownSearch}
                      onChange={(e) => setMapTownSearch(e.target.value)}
                      className={`w-full bg-transparent text-xs font-bold focus:outline-none ${t.textTitle}`}
                    />
                    {mapTownSearch && (
                      <button onClick={() => setMapTownSearch('')} className="text-slate-400 hover:text-slate-200">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <select
                    value={mapStatusFilter}
                    onChange={(e) => setMapStatusFilter(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none ${t.card} ${t.textTitle}`}
                  >
                    <option value="Todos">Todos (78 Pueblos)</option>
                    <option value="active">Con Ventas Activas ({totalActiveTownsCount})</option>
                    <option value="whitespace">White Space / Sin Tienda ({78 - totalActiveTownsCount})</option>
                  </select>

                  <select
                    value={mapTownSort}
                    onChange={(e) => setMapTownSort(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none ${t.card} ${t.textTitle}`}
                  >
                    <option value="alpha">Orden: Alfabético (A-Z)</option>
                    <option value="ty">Orden: Mayor Venta ($)</option>
                    <option value="growth">Orden: Mayor Crecimiento (%)</option>
                  </select>
                </div>

                {/* Cuadrícula Organizada por Región de los Municipios Filtrados */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {orderedRegionKeys.map(regName => {
                    const regTowns = filteredTownsDirectory.filter(twn => twn.region === regName);
                    if (regTowns.length === 0) return null;
                    const regObj = activeRegions.find(r => r.name === regName);

                    return (
                      <div
                        key={regName}
                        className={`p-4 rounded-2xl border transition-all ${
                          selectedMapRegion === regName && !selectedMapTown
                            ? 'ring-2 ring-indigo-500 ' + t.card
                            : t.card
                        }`}
                      >
                        <div
                          onClick={() => { setSelectedMapTown(null); setSelectedMapRegion(regName); }}
                          className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200/60 dark:border-slate-800 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-500" />
                            <span className={`font-black text-sm ${t.textTitle}`}>
                              Región {regName}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                              {regObj?.zoneLabel} • {regTowns.length} pueblos mostrados
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-mono font-bold text-indigo-500">
                              {formatCurrency(regObj?.ty || 0)}
                            </span>
                            <span className={`font-mono font-bold ${(regObj?.growth || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {(regObj?.growth || 0) >= 0 ? '+' : ''}{(regObj?.growth || 0).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {regTowns.map(tStat => {
                            const isTownSel = selectedMapTown === tStat.name;
                            const tileClass = getTileColorClasses(tStat, isTownSel, false);
                            return (
                              <button
                                key={tStat.name}
                                onClick={() => {
                                  setSelectedMapRegion(regName);
                                  setSelectedMapTown(isTownSel ? null : tStat.name);
                                }}
                                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[62px] ${tileClass}`}
                              >
                                <div className="flex items-center justify-between gap-1 w-full">
                                  <span className="font-black text-xs truncate">{tStat.name}</span>
                                  {tStat.storeCount > 0 && (
                                    <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-black/20 shrink-0">
                                      {tStat.storeCount}t
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1.5">
                                  {tStat.ty > 0 ? (
                                    <div className="flex items-baseline justify-between gap-1">
                                      <span className="font-mono text-[11px] font-black truncate">
                                        {mapColorMetric === 'growth'
                                          ? `${tStat.growth >= 0 ? '+' : ''}${tStat.growth.toFixed(1)}%`
                                          : formatCurrency(mapColorMetric === 'salesPerStore' ? tStat.salesPerStore : tStat.ty)}
                                      </span>
                                      <span className="text-[9px] font-mono opacity-80">
                                        {tStat.skuCount} SKUs
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[9px] uppercase tracking-wider opacity-65 block">
                                      White Space
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {filteredTownsDirectory.length === 0 && (
                    <div className="p-8 text-center text-xs font-bold text-slate-400">
                      No se encontraron municipios con ese filtro.
                    </div>
                  )}
                </div>
              </div>
            )}

            {mapViewMode === 'matrix' && (
              /* VISTA 4: MATRIZ EJECUTIVA DE REGIONES & COBERTURA MUNICIPAL */
              <div className="p-4 sm:p-5 space-y-4">
                <div className={`p-4 rounded-2xl border ${t.card}`}>
                  <h4 className={`text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 ${t.textTitle}`}>
                    <BarChart3 className="w-4 h-4 text-indigo-500" /> Comparativa de Ventas TY vs Crecimiento YoY por Región
                  </h4>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={activeRegions} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                        <XAxis dataKey="name" tick={{ fill: t.chartText, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" hide />
                        <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fill: t.chartText, fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '10px' }}
                          formatter={(val, name) => String(name).includes('%') ? `${Number(val).toFixed(1)}%` : formatCurrency(val)}
                        />
                        <Legend verticalAlign="top" height={28} iconType="circle" />
                        <Bar yAxisId="left" dataKey="ty" name="Ventas TY ($)" fill="#4f46e5" radius={[5, 5, 0, 0]} barSize={32} />
                        <Line yAxisId="right" type="monotone" dataKey="growth" name="Crecimiento YoY (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`overflow-hidden rounded-2xl border ${t.tableWrapper}`}>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className={t.tableHeader}>
                      <tr className="text-[10px] uppercase font-black tracking-widest">
                        <th className="px-4 py-3">Región</th>
                        <th className="px-3 py-3 text-center">Pueblos Activos</th>
                        <th className="px-3 py-3 text-center">Tiendas</th>
                        <th className="px-4 py-3 text-right">Ventas TY ($)</th>
                        <th className="px-3 py-3 text-right">Share %</th>
                        <th className="px-3 py-3 text-right">Crec. YoY</th>
                        <th className="px-4 py-3">Categoría Líder</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.tableDivide}`}>
                      {[...activeRegions].sort((a, b) => b.ty - a.ty).map(reg => (
                        <tr
                          key={reg.name}
                          onClick={() => { setSelectedMapTown(null); setSelectedMapRegion(reg.name); }}
                          className={`cursor-pointer transition-colors ${selectedMapRegion === reg.name ? t.rowSelected : t.rowBase}`}
                        >
                          <td className="px-4 py-3">
                            <span className={`font-black block ${t.textTitle}`}>{reg.name}</span>
                            <span className={`text-[10px] ${t.textSub}`}>{reg.zoneLabel}</span>
                          </td>
                          <td className="px-3 py-3 text-center font-mono font-bold">
                            {reg.activeTownsCount} / {reg.totalTownsInRegion}
                          </td>
                          <td className={`px-3 py-3 text-center font-mono ${t.textTitle}`}>{reg.storeCount}</td>
                          <td className={`px-4 py-3 text-right font-mono font-black ${t.textTitle}`}>{formatCurrency(reg.ty)}</td>
                          <td className={`px-3 py-3 text-right font-mono ${t.textSub}`}>{reg.shareOfIsland.toFixed(1)}%</td>
                          <td className={`px-3 py-3 text-right font-mono font-bold ${reg.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {reg.growth >= 0 ? '+' : ''}{reg.growth.toFixed(1)}%
                          </td>
                          <td className={`px-4 py-3 font-bold text-[11px] ${t.textTitle}`}>{reg.topCategory}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pie del Mapa: Leyenda */}
            <div className={`px-5 py-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-sky-100'}`}>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`font-black uppercase tracking-wider ${t.textSub}`}>Leyenda:</span>
                {mapColorMetric === 'region' ? (
                  <div className="flex flex-wrap items-center gap-2 font-bold text-[10px]">
                    {orderedRegionKeys.map(rKey => (
                      <span key={rKey} className="flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded-sm ${REGION_VISUAL_THEME[rKey].dot}`}></span> {rKey}
                      </span>
                    ))}
                  </div>
                ) : mapColorMetric === 'growth' ? (
                  <div className="flex items-center gap-2 font-bold">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> &gt;10%</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> 0-10%</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Caída Leve</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-600"></span> &lt;-10%</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className={t.textSub}>White Space</span>
                    <span className="w-4 h-2.5 rounded-sm border border-slate-400/40 bg-slate-200 dark:bg-slate-800"></span>
                    <span className="w-4 h-2.5 rounded-sm bg-indigo-400"></span>
                    <span className="w-4 h-2.5 rounded-sm bg-indigo-600"></span>
                    <span className="w-4 h-2.5 rounded-sm bg-indigo-800"></span>
                    <span className={t.textSub}>Líder</span>
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-semibold ${t.textSub}`}>
                78 Municipios • Clic en cualquier pueblo o región
              </span>
            </div>
          </div>

          {/* COLUMNA DERECHA: PANEL DE INSPECCIÓN TERRITORIAL + BRECHAS + SIMULADOR WHITE SPACE */}
          <div className={`lg:col-span-5 rounded-3xl border overflow-hidden transition-colors flex flex-col ${t.card}`}>
            {(selectedMapRegion || selectedMapTown) && regionalDetails ? (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                <div className={`p-5 border-b ${isDarkMode ? 'bg-indigo-950/40 border-slate-800' : 'bg-indigo-50/80 border-indigo-100'}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">
                        {regionalDetails.isTownLevel
                          ? `Auditoría Municipal • Región ${regionalDetails.regionObj?.parentRegion}`
                          : `Auditoría Regional • ${regionalDetails.regionObj?.zoneLabel || ''}`}
                      </span>
                      <h3 className={`text-2xl font-black mt-0.5 ${t.textTitle}`}>
                        {regionalDetails.isTownLevel ? `Municipio de ${regionalDetails.regionObj?.name}` : `Región ${regionalDetails.regionObj?.name}`}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {regionalDetails.isTownLevel && (
                        <button
                          onClick={() => setSelectedMapTown(null)}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold ${t.card}`}
                        >
                          ← Región {regionalDetails.regionObj?.parentRegion}
                        </button>
                      )}
                      <button
                        onClick={() => { setSelectedMapRegion(null); setSelectedMapTown(null); }}
                        className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 ${t.card}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mini KPIs del Pueblo o Región */}
                  <div className="grid grid-cols-3 gap-2.5 mt-4">
                    <div className={`p-3 rounded-xl border ${t.card}`}>
                      <span className={`text-[9px] font-bold uppercase block ${t.textSub}`}>Ventas TY</span>
                      <span className={`text-sm font-mono font-black ${t.textTitle}`}>
                        {formatCurrency(regionalDetails.regionObj?.ty || 0)}
                      </span>
                      <span className={`text-[10px] font-bold block mt-0.5 ${(regionalDetails.regionObj?.growth || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {(regionalDetails.regionObj?.growth || 0) >= 0 ? '+' : ''}{(regionalDetails.regionObj?.growth || 0).toFixed(1)}% vs LY
                      </span>
                    </div>
                    <div className={`p-3 rounded-xl border ${t.card}`}>
                      <span className={`text-[9px] font-bold uppercase block ${t.textSub}`}>Prom / Tienda</span>
                      <span className={`text-sm font-mono font-black ${t.textTitle}`}>
                        {formatCurrency(regionalDetails.regionObj?.salesPerStore || 0)}
                      </span>
                      <span className={`text-[10px] block mt-0.5 ${t.textSub}`}>
                        {regionalDetails.regionObj?.storeCount || 0} sucursal(es)
                      </span>
                    </div>
                    <div className={`p-3 rounded-xl border ${t.card}`}>
                      <span className={`text-[9px] font-bold uppercase block ${t.textSub}`}>AUR / Surtido</span>
                      <span className="text-sm font-mono font-black text-indigo-500 block">
                        {formatCurrency(regionalDetails.regionObj?.aur || 0)}
                      </span>
                      <span className={`text-[10px] truncate block mt-0.5 ${t.textSub}`}>
                        {regionalDetails.regionObj?.skuCount || 0} SKUs activos
                      </span>
                    </div>
                  </div>

                  {/* 5 Pestañas Internas del Inspector (Incluye Brechas y Simulador de Expansión) */}
                  <div className="grid grid-cols-5 gap-1 bg-slate-200/70 dark:bg-slate-900 p-1 rounded-xl mt-4">
                    {[
                      { id: 'stores', label: 'Tiendas' },
                      { id: 'skus', label: 'Top SKUs' },
                      { id: 'gaps', label: 'Brechas' },
                      { id: 'categories', label: 'Afinidad' },
                      { id: 'expansion', label: 'Expansión' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setRegionalPanelTab(tab.id)}
                        className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${regionalPanelTab === tab.id ? 'bg-indigo-600 text-white shadow' : t.textSub}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cuerpo del Inspector */}
                <div className="p-5 flex-1 max-h-[440px] overflow-y-auto">
                  {regionalPanelTab === 'stores' && (
                    <div className="space-y-3">
                      <h4 className={`text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${t.textSub}`}>
                        <Store className="w-4 h-4 text-emerald-500" /> Sucursales en {regionalDetails.regionObj?.name}
                      </h4>
                      {regionalDetails.storesPerform.length > 0 ? regionalDetails.storesPerform.map((st, i) => (
                        <div key={i} className={`p-3.5 rounded-xl border ${t.rowBase} ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <div>
                              <span className={`font-black text-xs uppercase ${t.textTitle}`}>{i + 1}. {st.name}</span>
                              <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded font-bold ${isDarkMode ? 'bg-slate-800 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
                                {st.town}
                              </span>
                            </div>
                            <span className={`font-mono font-black text-xs ${t.textTitle}`}>{formatCurrency(st.ty)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden my-1.5">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, st.shareInRegion)}%` }}></div>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className={t.textSub}>{st.shareInRegion.toFixed(1)}% de aporte • {formatNumber(st.units)} unds</span>
                            <span className={`font-black ${st.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {st.growth >= 0 ? '+' : ''}{st.growth.toFixed(1)}% YoY
                            </span>
                          </div>
                        </div>
                      )) : (
                        <div className={`p-5 rounded-2xl border border-dashed text-center ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                          <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                          <p className={`text-xs font-bold ${t.textTitle}`}>Territorio White Space en {regionalDetails.regionObj?.name}</p>
                          <p className={`text-[11px] mt-1 ${t.textSub}`}>
                            Potencial estimado de apertura en este municipio:{' '}
                            <strong className="text-emerald-500">
                              +{formatCurrency(regionalDetails.regionalBenchmarkPerStore * (whiteSpaceCapturePct / 100))} / año
                            </strong>
                          </p>
                          <div className="mt-3 flex flex-wrap justify-center gap-2">
                            <button
                              onClick={() => setRegionalPanelTab('expansion')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
                            >
                              Abrir Simulador de Expansión & Kit Inicial →
                            </button>
                          </div>
                          {uniqueStores.length > 0 && selectedMapTown && (
                            <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800">
                              <select
                                onChange={(e) => {
                                  if (e.target.value && selectedMapTown) {
                                    setCustomTownOverrides(prev => ({ ...prev, [e.target.value]: selectedMapTown }));
                                  }
                                }}
                                value=""
                                className={`p-2 rounded-xl border text-xs font-bold w-full ${t.input}`}
                              >
                                <option value="">+ O vincular una tienda existente a {selectedMapTown}...</option>
                                {uniqueStores.map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {regionalPanelTab === 'skus' && (
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5 ${t.textSub}`}>
                        <Award className="w-4 h-4 text-amber-500" /> Top 15 SKUs en {regionalDetails.regionObj?.name}
                      </h4>
                      {regionalDetails.topProducts.length > 0 ? (
                        <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
                          {regionalDetails.topProducts.map((p, idx) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${idx < 3 ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                  {idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <p className={`text-xs font-bold uppercase truncate ${t.textTitle}`}>{p.name}</p>
                                  <p className={`text-[10px] font-mono ${t.textSub}`}>AUR: {formatCurrency(p.aur)} • {p.category}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className={`text-xs font-mono font-black ${t.textTitle}`}>{formatCurrency(p.ty)}</p>
                                <p className={`text-[10px] font-mono font-bold ${p.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {p.growth >= 0 ? '+' : ''}{p.growth.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-xs italic py-8 text-center ${t.textSub}`}>Sin ventas registradas en esta localidad.</p>
                      )}
                    </div>
                  )}

                  {regionalPanelTab === 'gaps' && (
                    <div>
                      <div className="mb-3">
                        <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-emerald-500">
                          <Lightbulb className="w-4 h-4" /> Oportunidad de Surtido (SKUs Faltantes en {regionalDetails.regionObj?.name})
                        </h4>
                        <p className={`text-[11px] mt-0.5 ${t.textSub}`}>
                          Productos líderes en el resto de Puerto Rico que tienen <strong>$0 ventas</strong> en {regionalDetails.regionObj?.name} (Brecha de Distribución):
                        </p>
                      </div>
                      {regionalDetails.missingTopSkus.length > 0 ? (
                        <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
                          {regionalDetails.missingTopSkus.map((item, idx) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className={`text-xs font-bold uppercase truncate ${t.textTitle}`}>{idx + 1}. {item.name}</p>
                                <p className={`text-[10px] font-mono ${t.textSub}`}>
                                  {item.category} • Activo en {item.storePenetration.toFixed(0)}% de tiendas PR
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 block">
                                  Potencial: +{formatCurrency(item.estimatedOpportunity)}
                                </span>
                                <span className={`text-[9px] font-mono ${t.textSub}`}>
                                  Isla: {formatCurrency(item.islandTy)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center rounded-2xl border border-dashed border-emerald-500/30">
                          <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className={`text-xs font-bold ${t.textTitle}`}>¡Cobertura de Catálogo al 100%!</p>
                          <p className={`text-[11px] mt-1 ${t.textSub}`}>
                            Todos los SKUs líderes de la isla ya tienen presencia activa en {regionalDetails.regionObj?.name}.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {regionalPanelTab === 'categories' && (
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1.5 ${t.textSub}`}>
                        <PieChartIcon className="w-4 h-4 text-indigo-500" /> Mix & Índice de Afinidad Regional (CDI) en {regionalDetails.regionObj?.name}
                      </h4>
                      <p className={`text-[11px] mb-3 ${t.textSub}`}>
                        Un CDI &gt; 100 indica que la categoría tiene mayor preferencia local aquí que en el promedio de Puerto Rico:
                      </p>
                      {regionalDetails.categoryMix.length > 0 ? (
                        <>
                          <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={regionalDetails.categoryMix} innerRadius={42} outerRadius={68} paddingAngle={4} dataKey="value" stroke="none">
                                  {regionalDetails.categoryMix.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '8px'}} formatter={(val) => formatCurrency(val)} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-2 mt-2">
                            {regionalDetails.categoryMix.map((c, i) => (
                              <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl border border-slate-200/50 dark:border-slate-800">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                                  <span className={`font-bold truncate ${t.textTitle}`}>{c.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono font-bold">{formatCurrency(c.value)} ({c.localShare.toFixed(1)}%)</span>
                                  <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                                    c.affinityIndex >= 110
                                      ? 'bg-emerald-500/15 text-emerald-500'
                                      : c.affinityIndex <= 90
                                      ? 'bg-amber-500/15 text-amber-500'
                                      : 'bg-indigo-500/15 text-indigo-400'
                                  }`}>
                                    CDI: {c.affinityIndex.toFixed(0)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className={`text-xs italic py-8 text-center ${t.textSub}`}>Sin datos de categorías en esta localidad.</p>
                      )}
                    </div>
                  )}

                  {regionalPanelTab === 'expansion' && (
                    <div className="space-y-4">
                      {/* Simulador White Space & Pueblos de la Región */}
                      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-emerald-950/20 border-emerald-800/50' : 'bg-emerald-50/70 border-emerald-200'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block">
                          Simulador de Apertura / Expansión Territorial
                        </span>
                        <h4 className={`text-sm font-black mt-0.5 ${t.textTitle}`}>
                          Potencial de Nuevo Punto de Venta en {regionalDetails.regionObj?.name}
                        </h4>

                        <div className="mt-3">
                          <div className="flex justify-between text-[11px] font-bold mb-1">
                            <span className={t.textSub}>Factor de Captura vs Benchmark Regional:</span>
                            <strong className="text-emerald-500">{whiteSpaceCapturePct}%</strong>
                          </div>
                          <input
                            type="range"
                            min="40"
                            max="130"
                            step="5"
                            value={whiteSpaceCapturePct}
                            onChange={(e) => setWhiteSpaceCapturePct(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 mt-3">
                          <div className={`p-2.5 rounded-xl border ${t.card}`}>
                            <span className={`text-[9px] font-bold uppercase block ${t.textSub}`}>Benchmark Tienda Región</span>
                            <span className={`text-xs font-mono font-black ${t.textTitle}`}>
                              {formatCurrency(regionalDetails.regionalBenchmarkPerStore)}
                            </span>
                          </div>
                          <div className={`p-2.5 rounded-xl border ${t.card}`}>
                            <span className="text-[9px] font-bold uppercase block text-emerald-500">Ingreso Anual Proyectado</span>
                            <span className="text-sm font-mono font-black text-emerald-500">
                              +{formatCurrency(regionalDetails.regionalBenchmarkPerStore * (whiteSpaceCapturePct / 100))}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Kit de Apertura Recomendado (Top 10 SKUs Regionales) */}
                      <div>
                        <h5 className={`text-[11px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${t.textTitle}`}>
                          <Package className="w-3.5 h-3.5 text-indigo-500" /> Kit de Surtido Inicial Recomendado (Top SKUs de la Zona)
                        </h5>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {regionalDetails.recommendedLaunchKit.map((sku, idx) => (
                            <div key={idx} className={`px-3 py-1.5 rounded-lg border text-xs flex items-center justify-between ${t.card}`}>
                              <span className={`font-bold truncate pr-2 ${t.textTitle}`}>{idx + 1}. {sku.name}</span>
                              <span className="font-mono text-[10px] font-bold text-indigo-500 shrink-0">{formatCurrency(sku.ty)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Selector rápido de Pueblos Hermanos de la Región */}
                      <div>
                        <h5 className={`text-[10px] font-black uppercase tracking-wider mb-2 ${t.textSub}`}>
                          Todos los Municipios de la Región {regionalDetails.isTownLevel ? regionalDetails.regionObj?.parentRegion : regionalDetails.regionObj?.name}:
                        </h5>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(PR_REGIONS[regionalDetails.isTownLevel ? regionalDetails.regionObj?.parentRegion : regionalDetails.regionObj?.name] || []).map(town => {
                            const tStat = allTownsStatsMap[town];
                            const isCurrentTown = selectedMapTown === town;
                            return (
                              <button
                                key={town}
                                onClick={() => setSelectedMapTown(isCurrentTown ? null : town)}
                                className={`p-2 rounded-xl border text-left text-xs transition-all flex flex-col ${
                                  isCurrentTown
                                    ? 'ring-2 ring-indigo-500 bg-indigo-600 text-white'
                                    : tStat?.ty > 0
                                    ? (isDarkMode ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800')
                                    : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600')
                                }`}
                              >
                                <span className="font-black flex items-center justify-between gap-1">
                                  {town}
                                  {tStat?.ty > 0 ? <CheckSquare className="w-3 h-3 text-emerald-400 shrink-0" /> : <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />}
                                </span>
                                <span className="text-[10px] font-mono mt-0.5">
                                  {tStat?.ty > 0 ? `${formatCurrency(tStat.ty)} (${tStat.storeCount}t)` : 'White Space'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* VISTA RESUMEN ISLA CUANDO NO HAY SELECCIÓN ACTIVA */
              <div className="p-5 flex flex-col h-full">
                <div className="mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">
                    Resumen Geográfico Isla (78 Pueblos)
                  </span>
                  <h3 className={`text-xl font-black mt-0.5 ${t.textTitle}`}>
                    Ranking de las 6 Regiones Comerciales
                  </h3>
                  <p className={`text-xs mt-0.5 ${t.textSub}`}>
                    Haz clic en cualquier pueblo del mapa (ej. Naranjito, Caguas, Bayamón, Ponce) o en una región para inspeccionar su radiografía y potencial.
                  </p>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                  {[...activeRegions].sort((a, b) => b.ty - a.ty).map((reg, idx) => (
                    <div
                      key={reg.name}
                      onClick={() => { setSelectedMapTown(null); setSelectedMapRegion(reg.name); }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${t.cardHover}`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center ${REGION_VISUAL_THEME[reg.name]?.badge || 'bg-indigo-600 text-white'}`}>
                            {idx + 1}
                          </span>
                          <div>
                            <span className={`font-black text-sm ${t.textTitle}`}>Región {reg.name}</span>
                            <span className={`text-[10px] ml-2 font-bold ${t.textSub}`}>
                              ({reg.storeCount} tiendas • {reg.activeTownsCount}/{reg.totalTownsInRegion} pueblos)
                            </span>
                          </div>
                        </div>
                        <span className={`font-mono font-black text-sm ${t.textTitle}`}>{formatCurrency(reg.ty)}</span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden my-1.5">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, reg.shareOfIsland)}%` }}></div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] pt-1">
                        <span className={`font-semibold ${t.textSub}`}>Share Isla: <strong>{reg.shareOfIsland.toFixed(1)}%</strong> • Líder: {reg.topCategory}</span>
                        <span className={`font-mono font-black ${reg.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {reg.growth >= 0 ? '+' : ''}{reg.growth.toFixed(1)}% YoY
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderClusteringTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><Network className="w-6 h-6 text-emerald-500" /> Clasificación de Tiendas & Space Planning (Clustering A/B/C)</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Segmentación por volumen acumulado y simulador de productividad por Pie Lineal (Linear Foot) para asignar tamaños óptimos de góndola.</p>
        </div>
        {/* Simulador de Pies Lineales por Tier (Vacio por defecto) */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center gap-4 ${isDarkMode ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-indigo-50/50 border-indigo-200'}`}>
          <div className="flex flex-col">
            <span className={`text-[10px] font-black uppercase tracking-widest text-indigo-500`}>Ajuste Manual: Pies Lineales</span>
            <span className={`text-[10px] font-medium ${t.textSub}`}>Ingresa el espacio para calcular el retorno ($/ft)</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {['A', 'B', 'C'].map(tierKey => (
              <div key={tierKey} className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border dark:border-slate-800 shadow-sm">
                <span className={`text-xs font-black px-2 py-1 rounded-lg ${tierKey === 'A' ? 'bg-emerald-500/20 text-emerald-500' : tierKey === 'B' ? 'bg-blue-500/20 text-blue-500' : 'bg-slate-500/20 text-slate-400'}`}>Tier {tierKey}:</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ej. 16"
                  value={tierLinearFeet[tierKey]}
                  onChange={(e) => setTierLinearFeet(prev => ({ ...prev, [tierKey]: e.target.value === "" ? "" : Math.max(0, Number(e.target.value)) }))}
                  className={`w-16 p-1 text-center rounded focus:outline-none bg-transparent text-xs font-mono font-bold ${t.textTitle} placeholder:text-slate-300 dark:placeholder:text-slate-600`}
                />
                <span className={`text-[10px] pr-1 font-bold ${t.textSub}`}>ft</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {storeClusteringAnalysis && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div onClick={() => setClusterTierFilter(clusterTierFilter === 'A' ? 'Todos' : 'A')} className={`p-6 rounded-2xl border cursor-pointer transition-all ${clusterTierFilter === 'A' ? 'ring-2 ring-emerald-500 scale-[1.01]' : ''} ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50/50 border-emerald-200'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-black text-xl flex items-center gap-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Tier A (Flagship) <Award className="w-5 h-5"/></h3>
                  <p className={`text-[11px] mt-1 font-bold px-2 py-0.5 rounded-full inline-block ${isDarkMode ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-200/50 text-emerald-800'}`}>Generan el {storeClusteringAnalysis.tierMetrics[0].shareOfSales.toFixed(1)}% del Volumen</p>
                </div>
                <span className="text-3xl font-black text-emerald-500">{storeClusteringAnalysis.summary.A.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-emerald-500/20">
                <div><span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Prom. Ventas/Tienda</span><span className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(storeClusteringAnalysis.tierMetrics[0].avgStoreSales)}</span></div>
                <div><span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Prom. Inv Físico/Tienda</span><span className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-300">{formatNumber(storeClusteringAnalysis.tierMetrics[0].avgStoreInv)} unds</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-500/10 flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Retorno Espacio ({Number(tierLinearFeet.A) || '?'} ft):</span>
                <span className={`text-sm font-mono font-black ${Number(tierLinearFeet.A) > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-emerald-500/50 italic'}`}>
                  {Number(tierLinearFeet.A) > 0 ? `${formatCurrency(storeClusteringAnalysis.tierMetrics[0].avgSalesPerFoot)}/ft` : 'Falta Dato'}
                </span>
              </div>
            </div>

            <div onClick={() => setClusterTierFilter(clusterTierFilter === 'B' ? 'Todos' : 'B')} className={`p-6 rounded-2xl border cursor-pointer transition-all ${clusterTierFilter === 'B' ? 'ring-2 ring-blue-500 scale-[1.01]' : ''} ${isDarkMode ? 'bg-blue-950/20 border-blue-900/50' : 'bg-blue-50/50 border-blue-200'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-black text-xl flex items-center gap-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Tier B (Estándar) <CheckSquare className="w-5 h-5"/></h3>
                  <p className={`text-[11px] mt-1 font-bold px-2 py-0.5 rounded-full inline-block ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-200/50 text-blue-800'}`}>Aportan el {storeClusteringAnalysis.tierMetrics[1].shareOfSales.toFixed(1)}% del Volumen</p>
                </div>
                <span className="text-3xl font-black text-blue-500">{storeClusteringAnalysis.summary.B.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-blue-500/20">
                <div><span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">Prom. Ventas/Tienda</span><span className="text-sm font-mono font-black text-blue-700 dark:text-blue-300">{formatCurrency(storeClusteringAnalysis.tierMetrics[1].avgStoreSales)}</span></div>
                <div><span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">Prom. Inv Físico/Tienda</span><span className="text-sm font-mono font-black text-blue-700 dark:text-blue-300">{formatNumber(storeClusteringAnalysis.tierMetrics[1].avgStoreInv)} unds</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-500/10 flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Retorno Espacio ({Number(tierLinearFeet.B) || '?'} ft):</span>
                <span className={`text-sm font-mono font-black ${Number(tierLinearFeet.B) > 0 ? 'text-blue-700 dark:text-blue-300' : 'text-blue-500/50 italic'}`}>
                  {Number(tierLinearFeet.B) > 0 ? `${formatCurrency(storeClusteringAnalysis.tierMetrics[1].avgSalesPerFoot)}/ft` : 'Falta Dato'}
                </span>
              </div>
            </div>

            <div onClick={() => setClusterTierFilter(clusterTierFilter === 'C' ? 'Todos' : 'C')} className={`p-6 rounded-2xl border cursor-pointer transition-all ${clusterTierFilter === 'C' ? 'ring-2 ring-indigo-500 scale-[1.01]' : ''} ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-black text-xl flex items-center gap-2 ${t.textTitle}`}>Tier C (Compacto) <Minus className="w-5 h-5"/></h3>
                  <p className={`text-[11px] mt-1 font-bold px-2 py-0.5 rounded-full inline-block ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>Último {storeClusteringAnalysis.tierMetrics[2].shareOfSales.toFixed(1)}% del Volumen</p>
                </div>
                <span className={`text-3xl font-black ${t.textSub}`}>{storeClusteringAnalysis.summary.C.length}</span>
              </div>
              <div className={`grid grid-cols-2 gap-2 mt-4 pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div><span className={`text-[10px] uppercase font-bold block ${t.textSub}`}>Prom. Ventas/Tienda</span><span className={`text-sm font-mono font-black ${t.textTitle}`}>{formatCurrency(storeClusteringAnalysis.tierMetrics[2].avgStoreSales)}</span></div>
                <div><span className={`text-[10px] uppercase font-bold block ${t.textSub}`}>Prom. Inv Físico/Tienda</span><span className={`text-sm font-mono font-black ${t.textTitle}`}>{formatNumber(storeClusteringAnalysis.tierMetrics[2].avgStoreInv)} unds</span></div>
              </div>
              <div className={`mt-3 pt-3 border-t flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={`text-[10px] uppercase font-bold ${t.textSub}`}>Retorno Espacio ({Number(tierLinearFeet.C) || '?'} ft):</span>
                <span className={`text-sm font-mono font-black ${Number(tierLinearFeet.C) > 0 ? t.textTitle : 'opacity-40 italic'}`}>
                  {Number(tierLinearFeet.C) > 0 ? `${formatCurrency(storeClusteringAnalysis.tierMetrics[2].avgSalesPerFoot)}/ft` : 'Falta Dato'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Gráfica 1: Curva de Concentración de Tiendas */}
            <div className={`p-6 rounded-2xl border transition-colors ${t.card}`}>
              <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${t.textTitle}`}><BarChart3 className="w-5 h-5 text-emerald-500" /> Curva de Concentración por Sucursal (Ventas TY vs % Acumulado)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={storeClusteringAnalysis.clustered} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                    <XAxis dataKey="name" tick={{ fill: t.chartText, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" hide />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" tick={{ fill: t.chartText, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '10px'}} formatter={(val, name) => name.includes('%') ? `${Number(val).toFixed(1)}%` : formatCurrency(val)} />
                    <Legend verticalAlign="top" height={32} iconType="circle" />
                    <Bar yAxisId="left" dataKey="ty" name="Ventas TY ($)" radius={[4, 4, 0, 0]} barSize={24}>
                      {storeClusteringAnalysis.clustered.map((entry, idx) => (
                        <Cell key={idx} fill={entry.tier === 'A' ? '#10b981' : entry.tier === 'B' ? '#3b82f6' : '#64748b'} />
                      ))}
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="cumulativePct" name="% Acumulado Cadena" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3, fill: '#f59e0b' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfica 2: Equidad de Inventario vs Ventas (NUEVO) */}
            <div className={`p-6 rounded-2xl border transition-colors ${t.card}`}>
              <h3 className={`font-bold text-base mb-1 flex items-center gap-2 ${t.textTitle}`}>
                <Layers className="w-5 h-5 text-indigo-500" /> Equidad de Asignación: Ventas vs. Inventario
              </h3>
              <p className={`text-xs mb-4 ${t.textSub}`}>Identifica si los Tiers inferiores (C) están acaparando inventario que debería estar en tiendas de alto flujo (A).</p>
              <div className="h-72 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={storeClusteringAnalysis.tierMetrics} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={t.chartGrid} />
                    <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: t.chartText, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="tier" type="category" width={60} tick={{ fill: t.chartText, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '10px'}} formatter={(val) => `${Number(val).toFixed(1)}%`} />
                    <Legend verticalAlign="top" height={32} iconType="circle" />
                    <Bar dataKey="shareOfSales" name="% Aporte Ventas" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="shareOfInv" name="% Inventario Asignado" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={`overflow-hidden rounded-2xl border transition-colors ${t.tableWrapper}`}>
            <div className={`p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className={`font-black flex items-center gap-2 ${t.textTitle}`}><Database className="w-5 h-5 text-indigo-500" /> Matriz de Asignación de Planogramas por Tienda ({storeClusteringAnalysis.visibleClusters.length})</h3>
              {clusterTierFilter !== "Todos" && (
                <button onClick={() => setClusterTierFilter("Todos")} className="text-xs font-bold text-indigo-500 hover:underline">Mostrar Todos los Tiers</button>
              )}
            </div>
            <div className="max-h-[550px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
                  <tr className="text-[10px] uppercase font-black tracking-widest">
                    <th className="px-4 py-4 text-center">Tier</th>
                    <th className="px-4 py-4">Tienda & Región</th>
                    <th className="px-4 py-4 text-right">Ventas TY (Share)</th>
                    <th className="px-4 py-4 text-center">Inv. Físico</th>
                    <th className="px-4 py-4 text-center">Góndola Sugerida</th>
                    <th className="px-4 py-4 text-right">Venta / Pie Lineal</th>
                    <th className="px-5 py-4">Estrategia de Surtido Recomendada</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
                  {storeClusteringAnalysis.visibleClusters.map((store, index) => (
                    <tr key={`clus_${index}`} className={`transition-colors ${t.rowBase}`}>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm ${store.tier === 'A' ? 'bg-emerald-500 text-white' : store.tier === 'B' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                          {store.tier}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`font-bold text-sm uppercase block ${t.textTitle}`}>{store.name}</span>
                        <span className={`text-[10px] font-mono ${t.textSub}`}>Región {store.region} • {store.productCount} SKUs</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`font-mono font-bold text-sm block ${t.textTitle}`}>{formatCurrency(store.ty)}</span>
                        <span className={`text-[10px] font-mono font-bold text-indigo-500`}>{store.cumulativePct.toFixed(1)}% acum.</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-mono text-sm block ${t.textTitle}`}>{formatNumber(store.inv)} u</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg ${Number(tierLinearFeet[store.tier]) > 0 ? (isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800') : 'text-slate-400 italic'}`}>
                          {Number(tierLinearFeet[store.tier]) > 0 ? `${store.assignedFeet} ft` : 'Sin asignar'}
                        </span>
                      </td>
                      <td className={`px-4 py-4 text-right font-mono font-bold text-xs ${store.assignedFeet > 0 ? 'text-emerald-500' : 'text-slate-400 italic'}`}>
                        {store.assignedFeet > 0 ? `${formatCurrency(store.salesPerFoot)} / ft` : 'N/A'}
                      </td>
                      <td className={`px-5 py-4 text-xs font-semibold ${t.textTitle}`}>{store.strategy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderHealthTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><HeartPulse className="w-6 h-6 text-rose-500" /> Índice de Salud del Producto (Health Score 360°)</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Diagnóstico multicriterio: pondera Volumen Pareto (30 pts), Velocidad de Crecimiento (30 pts) y Salud de Inventario DOS (40 pts) con recomendaciones prescriptivas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Store className="text-indigo-400 w-4 h-4 shrink-0" />
            <select className={`bg-transparent border-none text-sm focus:outline-none cursor-pointer font-bold ${t.textTitle}`} value={healthStoreFilter} onChange={(e) => setHealthStoreFilter(e.target.value)}>
              <option value="Todas">Todas las Tiendas</option>
              {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Filter className="text-emerald-400 w-4 h-4 shrink-0" />
            <select className={`bg-transparent border-none text-sm focus:outline-none cursor-pointer font-bold ${t.textTitle}`} value={healthCategoryFilter} onChange={(e) => setHealthCategoryFilter(e.target.value)}>
              <option value="Todas">Todas las Categorías</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {healthScoreAnalysis && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className={`p-5 rounded-2xl border ${t.card} flex items-center justify-between`}>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Score Promedio Global</p>
                <p className={`text-3xl font-black mt-1 ${healthScoreAnalysis.avgScore >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{healthScoreAnalysis.avgScore.toFixed(1)} <span className="text-sm font-normal opacity-60">/ 100</span></p>
              </div>
              <HeartPulse className="w-10 h-10 text-rose-500/20" />
            </div>
            <div className={`p-5 rounded-2xl border ${t.card} flex items-center justify-between`}>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Catálogo Saludable (Grados A+ a B)</p>
                <p className="text-3xl font-black mt-1 text-indigo-500">{healthScoreAnalysis.healthyPct.toFixed(1)}%</p>
              </div>
              <ShieldCheck className="w-10 h-10 text-indigo-500/20" />
            </div>
            <div className={`p-5 rounded-2xl border ${t.card} flex items-center justify-between`}>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Ventas en SKUs Críticos (Grado F)</p>
                <p className="text-3xl font-black mt-1 text-rose-500">{formatCurrency(healthScoreAnalysis.criticalSales)}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-rose-500/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
            <button onClick={() => setHealthGradeFilter("Todas")} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${healthGradeFilter === "Todas" ? 'ring-2 ring-indigo-500 bg-indigo-500/10 border-indigo-500' : t.card}`}>
              <span className={`text-xs font-bold uppercase tracking-widest ${t.textSub}`}>Todos</span>
              <span className={`text-2xl font-black mt-1 ${t.textTitle}`}>{healthScoreAnalysis.allCount}</span>
            </button>
            {[
              { g: 'A+', label: 'Excelente (A+)', color: 'emerald' },
              { g: 'A', label: 'Sano (A)', color: 'blue' },
              { g: 'B', label: 'Regular (B)', color: 'indigo' },
              { g: 'C', label: 'Estancado (C)', color: 'amber' },
              { g: 'F', label: 'Crítico (F)', color: 'rose' }
            ].map(card => {
              const tone = getToneClasses(card.color, isDarkMode);
              return (
                <button key={card.g} onClick={() => setHealthGradeFilter(healthGradeFilter === card.g ? "Todas" : card.g)} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${healthGradeFilter === card.g ? 'ring-2 ring-indigo-500 scale-[1.02]' : ''} ${tone.card}`}>
                  <span className={`text-xs font-bold uppercase tracking-widest ${tone.label}`}>{card.label}</span>
                  <span className={`text-2xl font-black mt-1 ${tone.val}`}>{healthScoreAnalysis.summary[card.g]}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className={`p-6 rounded-2xl border ${t.card}`}>
              <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${t.textTitle}`}><BarChart3 className="w-5 h-5 text-rose-500" /> Distribución de Calificaciones (SKUs)</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthScoreAnalysis.gradeDistributionChart} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: t.chartText, fontSize: 11, fontWeight: 700 }} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}} contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '10px'}} />
                    <Bar dataKey="count" name="Cantidad de SKUs" radius={[6, 6, 0, 0]} barSize={38}>
                      {healthScoreAnalysis.gradeDistributionChart.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={`p-6 rounded-2xl border ${t.card}`}>
              <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${t.textTitle}`}><Award className="w-5 h-5 text-emerald-500" /> Salud Promedio por Categoría (Top 8)</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthScoreAnalysis.categoryHealthChart} layout="vertical" margin={{ top: 0, right: 25, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={t.chartGrid} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fill: t.chartText, fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}} contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '10px'}} formatter={(val) => `${val} pts`} />
                    <Bar dataKey="avgScore" name="Score Promedio" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={`overflow-hidden rounded-2xl border transition-colors ${t.tableWrapper}`}>
            <div className={`p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className={`font-black flex items-center gap-2 ${t.textTitle}`}><Database className="w-5 h-5 text-indigo-500" /> Diagnóstico Prescriptivo por SKU ({healthScoreAnalysis.items.length})</h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Filtrar SKU o UPC..." value={healthSearchTerm} onChange={(e) => setHealthSearchTerm(e.target.value)} className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs font-medium focus:outline-none ${t.input}`} />
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
                  <tr className="text-[10px] uppercase font-black tracking-widest">
                    <th className="px-4 py-4 text-center">Nota</th>
                    <th className="px-4 py-4 text-center">Score (Vol/Crec/Inv)</th>
                    <th className="px-4 py-4">Producto & Categoría</th>
                    <th className="px-4 py-4 text-right">Ventas / Crec.</th>
                    <th className="px-4 py-4 text-center">DOS</th>
                    <th className="px-6 py-4">Acción Prescriptiva Sugerida</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
                  {healthScoreAnalysis.items.slice(0, 150).map((p, index) => {
                    let badgeClass = 'bg-slate-100 text-slate-700';
                    if (p.grade.includes('A')) badgeClass = 'bg-emerald-500 text-white'; else if (p.grade === 'B') badgeClass = 'bg-blue-500 text-white'; else if (p.grade === 'C') badgeClass = 'bg-amber-500 text-white'; else if (p.grade === 'F') badgeClass = 'bg-rose-500 text-white';
                    return (
                      <tr key={`health_${index}`} className={`transition-colors ${t.rowBase}`}>
                        <td className="px-4 py-4 text-center"><div className={`w-9 h-9 mx-auto rounded-xl flex items-center justify-center font-black text-sm ${badgeClass}`}>{p.grade}</div></td>
                        <td className="px-4 py-4 text-center">
                          <span className={`font-mono font-black text-base block ${t.textTitle}`}>{p.score} pts</span>
                          <span className={`text-[10px] font-mono ${t.textSub}`}>{p.volScore} / {p.growthScore} / {p.invScore}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className={`font-bold text-xs uppercase leading-tight ${t.textTitle}`}>{p.name}</span>
                            <span className={`text-[10px] font-mono mt-0.5 ${t.textSub}`}>UPC: {p.upc || 'N/A'} • {p.category}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`font-mono font-bold text-xs ${t.textTitle}`}>{formatCurrency(p.ty)}</span>
                            <span className={`text-[10px] font-black flex items-center gap-0.5 mt-0.5 ${p.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {p.growth >= 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}{Math.abs(p.growth).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className={`px-4 py-4 text-center font-mono text-xs font-bold ${p.dos < 7 ? 'text-rose-500' : (p.dos > 45 ? 'text-amber-500' : 'text-emerald-500')}`}>
                          {p.dos >= 999 ? '999+' : `${p.dos.toFixed(0)}d`}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold block ${t.textTitle}`}>{p.recommendation}</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {p.reasons.map((r, i) => (
                              <span key={i} className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${r.includes('+') ? (isDarkMode ? 'bg-emerald-950/60 text-emerald-400' : 'bg-emerald-50 text-emerald-700') : (isDarkMode ? 'bg-rose-950/60 text-rose-400' : 'bg-rose-50 text-rose-700')}`}>{r}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderParetoTab = () => {
    const activeList = paretoViewMode === 'top80' ? paretoAnalysis?.top80 : paretoAnalysis?.bottom20;
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ToolHeader
          icon={Target}
          iconColor="text-emerald-500"
          title="Ley de Pareto (Concentración 80/20)"
          subtitle="Curva de concentración de ingresos y eficiencia de surtido. Compara la productividad por SKU entre tu Minoría Vital (80%) y tu Cola Larga (20%)."
          t={t}
        >
          <ToolFilterSelect icon={Store} value={paretoStoreFilter} onChange={setParetoStoreFilter} options={uniqueStores} allLabel="Todas las Tiendas" allValue="Todas" t={t} />
          <ToolFilterSelect icon={Filter} value={paretoCategoryFilter} onChange={setParetoCategoryFilter} options={uniqueCategories} allLabel="Todas las Categorías" allValue="Todas" t={t} />
        </ToolHeader>
        {paretoAnalysis && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className={`p-5 rounded-2xl border transition-colors ${t.card}`}>
                <p className={`text-[10px] uppercase font-bold ${t.textSub}`}>Concentración Vital</p>
                <h3 className={`text-3xl font-black mt-1 text-indigo-500`}>{paretoAnalysis.topPercentage.toFixed(1)}%</h3>
                <p className={`text-xs mt-1 ${t.textSub}`}>{paretoAnalysis.topItemsCount} de {paretoAnalysis.totalItems} SKUs generan el 80%</p>
              </div>
              <div className={`p-5 rounded-2xl border transition-colors ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50/50 border-emerald-200'}`}>
                <p className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Productividad SKU Vital</p>
                <p className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>{formatCurrency(paretoAnalysis.salesPerVitalSku)}</p>
                <p className={`text-xs mt-1 ${t.textSub}`}>Venta promedio por SKU en Top 80%</p>
              </div>
              <div className={`p-5 rounded-2xl border transition-colors ${t.card}`}>
                <p className={`text-[10px] uppercase font-bold ${t.textSub}`}>Productividad SKU Marginal</p>
                <p className={`text-2xl font-black mt-1 ${t.textTitle}`}>{formatCurrency(paretoAnalysis.salesPerMarginalSku)}</p>
                <p className={`text-xs mt-1 ${t.textSub}`}>Venta promedio en Bottom 20%</p>
              </div>
              <div className={`p-5 rounded-2xl border transition-colors ${isDarkMode ? 'bg-amber-950/20 border-amber-900/50' : 'bg-amber-50/50 border-amber-200'}`}>
                <p className={`text-[10px] uppercase font-bold text-amber-500`}>Inventario en Cola Larga</p>
                <p className={`text-2xl font-black mt-1 text-amber-500`}>{paretoAnalysis.bottomInvShare.toFixed(1)}%</p>
                <p className={`text-xs mt-1 ${t.textSub}`}>Stock físico atrapado en el Bottom 20%</p>
              </div>
            </div>

            {paretoAnalysis.curveChartData.length > 0 && (
              <div className={`p-6 rounded-2xl border mb-8 transition-colors ${t.card}`}>
                <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${t.textTitle}`}><LineChart className="w-5 h-5 text-emerald-500" /> Curva de Pareto (Top 25 SKUs: Ventas $ vs % Acumulado)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={paretoAnalysis.curveChartData} margin={{ top: 10, right: 20, left: 10, bottom: 45 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                      <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} tick={{ fill: t.chartText, fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" hide />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" tick={{ fill: t.chartText, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '10px'}} formatter={(val, name) => name.includes('%') ? `${val}%` : formatCurrency(val)} />
                      <Legend verticalAlign="top" height={32} iconType="circle" />
                      <Bar yAxisId="left" dataKey="ty" name="Ventas TY ($)" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={24} />
                      <Line yAxisId="right" type="monotone" dataKey="cumPct" name="% Acumulado" stroke="#10b981" strokeWidth={3} dot={{ r: 3, fill: '#10b981' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className={`overflow-hidden rounded-2xl border transition-colors ${t.tableWrapper}`}>
              <div className={`p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                <h3 className={`font-black flex items-center gap-2 ${t.textTitle}`}>
                  <Award className="w-5 h-5 text-emerald-500" /> 
                  {paretoViewMode === 'top80' ? `Minoría Vital: Top 80% Ventas (${paretoAnalysis.top80.length} SKUs)` : `Cola Larga: Bottom 20% Ventas (${paretoAnalysis.bottom20.length} SKUs)`}
                </h3>
                <div className="flex items-center gap-2 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
                  <button onClick={() => setParetoViewMode('top80')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${paretoViewMode === 'top80' ? 'bg-emerald-600 text-white shadow' : t.textSub}`}>Ver Top 80% (Vitales)</button>
                  <button onClick={() => setParetoViewMode('bottom20')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${paretoViewMode === 'bottom20' ? 'bg-amber-600 text-white shadow' : t.textSub}`}>Ver Bottom 20% (Marginales)</button>
                </div>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
                    <tr className="text-[10px] uppercase font-black tracking-widest">
                      <th className="px-4 py-4 text-center">#</th>
                      <th className="px-4 py-4">Producto & UPC</th>
                      <th className="px-4 py-4">Categoría</th>
                      <th className="px-4 py-4 text-right">Ventas TY</th>
                      <th className="px-4 py-4 text-right">Aporte %</th>
                      <th className="px-4 py-4 text-right">% Acumulado</th>
                      <th className="px-4 py-4 text-center">Clasificación</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
                    {(activeList || []).slice(0, 150).map((p, index) => (
                      <tr key={`par_${index}`} className={`transition-colors ${t.rowBase}`}>
                        <td className={`px-4 py-3.5 text-center font-mono text-xs font-bold ${t.textSub}`}>{p.rank}</td>
                        <td className="px-4 py-3.5"><div className="flex flex-col"><span className={`font-bold text-xs uppercase leading-tight ${t.textTitle}`}>{p.name}</span><span className={`text-[10px] font-mono mt-0.5 ${t.textSub}`}>UPC: {p.upc || 'N/A'}</span></div></td>
                        <td className="px-4 py-3.5"><span className={`text-xs font-medium uppercase ${t.textSub}`}>{p.category}</span></td>
                        <td className={`px-4 py-3.5 text-right font-mono font-bold text-xs ${t.textTitle}`}>{formatCurrency(p.ty)}</td>
                        <td className={`px-4 py-3.5 text-right font-mono text-xs ${t.textSub}`}>{p.sharePct.toFixed(2)}%</td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-xs text-indigo-500">{p.cumPct.toFixed(1)}%</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${p.isVital ? (isDarkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (isDarkMode ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-700')}`}>
                            {p.isVital ? 'Vital 80%' : 'Marginal 20%'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderRankingTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><Trophy className="w-6 h-6 text-amber-500" /> Ranking Multidimensional de Desempeño</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Audita los líderes y rezagados de tu portafolio cruzando Ventas, Unidades, Variación en Dólares, AUR y Días de Inventario.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}><Store className="w-4 h-4 text-indigo-400" /><select className={`bg-transparent border-none text-xs font-bold focus:outline-none ${t.textTitle}`} value={rankingStoreFilter} onChange={(e) => setRankingStoreFilter(e.target.value)}><option value="Todas">Todas las Tiendas</option>{uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}><Filter className="w-4 h-4 text-indigo-400" /><select className={`bg-transparent border-none text-xs font-bold focus:outline-none ${t.textTitle}`} value={rankingCategoryFilter} onChange={(e) => setRankingCategoryFilter(e.target.value)}><option value="Todas">Todas las Categorías</option>{uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}><Users className="w-4 h-4 text-indigo-400" /><select className={`bg-transparent border-none text-xs font-bold focus:outline-none ${t.textTitle}`} value={rankingVendorFilter} onChange={(e) => setRankingVendorFilter(e.target.value)}><option value="Todos">Todos los Suplidores</option>{uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-5 rounded-2xl border ${t.card}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Ventas Top {rankingLimit} Selección</p>
          <p className={`text-2xl font-black mt-1 ${t.textTitle}`}>{formatCurrency(rankingKpis.subsetTy)}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${t.card}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Peso sobre el Portafolio</p>
          <p className="text-2xl font-black mt-1 text-indigo-500">{rankingKpis.shareOfPortfolio.toFixed(1)}%</p>
        </div>
        <div className={`p-5 rounded-2xl border ${t.card}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Precio Promedio (AUR)</p>
          <p className="text-2xl font-black mt-1 text-amber-500">{formatCurrency(rankingKpis.avgAur)}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${t.card}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Crecimiento Ponderado</p>
          <p className={`text-2xl font-black mt-1 ${rankingKpis.weightedGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{rankingKpis.weightedGrowth >= 0 ? '+' : ''}{rankingKpis.weightedGrowth.toFixed(1)}%</p>
        </div>
      </div>
      
      <div className={`p-4 rounded-2xl border mb-6 flex flex-wrap justify-between items-center gap-4 transition-colors ${t.card}`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-xs font-bold uppercase tracking-widest ${t.textSub}`}>Ordenar Por:</span>
          <select className={`p-2 rounded-xl border text-xs font-bold focus:outline-none transition-colors ${t.input}`} value={rankingMetric} onChange={(e) => setRankingMetric(e.target.value)}>
            <option value="ty">Ventas Actuales ($ TY)</option>
            <option value="ly">Ventas Año Pasado ($ LY)</option>
            <option value="deltaDollars">Ganancia / Pérdida Neta ($ vs LY)</option>
            <option value="units">Unidades Vendidas</option>
            <option value="growth">Crecimiento (%)</option>
            <option value="aur">Precio Promedio (AUR $)</option>
          </select>
          <select className={`p-2 rounded-xl border text-xs font-bold focus:outline-none transition-colors ${t.input}`} value={rankingLimit} onChange={(e) => setRankingLimit(Number(e.target.value))}>
            <option value={25}>Mostrar Top 25</option>
            <option value={50}>Mostrar Top 50</option>
            <option value={100}>Mostrar Top 100</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
          <button onClick={() => setRankingOrder('desc')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${rankingOrder === 'desc' ? (isDarkMode ? 'bg-slate-700 text-white shadow' : 'bg-white text-slate-800 shadow-sm') : t.textSub}`}><ArrowDownAZ className="w-4 h-4"/> Líderes (Mayor a Menor)</button>
          <button onClick={() => setRankingOrder('asc')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${rankingOrder === 'asc' ? (isDarkMode ? 'bg-slate-700 text-white shadow' : 'bg-white text-slate-800 shadow-sm') : t.textSub}`}><ArrowUpAZ className="w-4 h-4"/> Rezagados (Menor a Mayor)</button>
        </div>
      </div>

      {rankedProducts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-2xl border lg:col-span-1 transition-colors flex flex-col ${t.card}`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${t.textTitle}`}><BarChart3 className="w-5 h-5 text-amber-500" /> Top 10 ({rankingOrder === 'desc' ? 'Líderes' : 'Rezagados'})</h3>
            <div className="flex-1 w-full min-h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10RankedChart} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={t.chartGrid} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fill: t.chartText, fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}} contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '8px'}} formatter={(val) => rankingMetric === 'units' ? formatNumber(val) : (rankingMetric === 'growth' ? `${Number(val).toFixed(1)}%` : formatCurrency(val))} />
                  <Bar dataKey="value" fill={rankingOrder === 'desc' ? '#f59e0b' : '#ef4444'} radius={[0, 4, 4, 0]} barSize={16}>
                    {top10RankedChart.map((entry, index) => (<Cell key={`cell-rank-${index}`} fill={rankingOrder === 'desc' ? COLORS[index % COLORS.length] : '#ef4444'} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={`overflow-hidden rounded-2xl border lg:col-span-2 transition-colors ${t.tableWrapper}`}>
            <div className="max-h-[520px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
                  <tr className="text-[10px] uppercase font-black tracking-widest">
                    <th className="px-4 py-4 w-10 text-center">#</th>
                    <th className="px-4 py-4">Producto & Suplidor</th>
                    <th className="px-4 py-4 text-right">Ventas TY (Share)</th>
                    <th className="px-4 py-4 text-right">AUR / DOS</th>
                    <th className="px-4 py-4 text-right">Métrica Activa</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
                  {rankedProducts.slice(0, rankingLimit).map((p, index) => {
                    const barPct = Math.min(100, (Math.abs(p[rankingMetric] || 0) / rankingKpis.maxMetricVal) * 100);
                    return (
                      <tr key={`rank_${index}`} className={`transition-colors ${t.rowBase}`}>
                        <td className="px-4 py-3.5 text-center"><span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs ${index < 3 && rankingOrder === 'desc' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{index + 1}</span></td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className={`font-bold text-xs uppercase leading-tight ${t.textTitle}`}>{p.name}</span>
                            <span className={`text-[10px] font-mono mt-0.5 ${t.textSub}`}>{p.vendor} • {p.category}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`font-mono font-bold text-xs block ${t.textTitle}`}>{formatCurrency(p.ty)}</span>
                          <span className={`text-[10px] font-mono ${t.textSub}`}>{p.shareOfTotal.toFixed(2)}% del total</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`font-mono text-xs font-semibold block ${t.textTitle}`}>{formatCurrency(p.aur)}</span>
                          <span className={`text-[10px] font-mono ${p.dos < 7 ? 'text-rose-500' : t.textSub}`}>{p.dos >= 999 ? '999+ d' : `${p.dos.toFixed(0)}d inv`}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right min-w-[130px]">
                          <span className={`text-xs font-mono font-black inline-block ${rankingMetric === 'growth' || rankingMetric === 'deltaDollars' ? ((p[rankingMetric] || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500') : 'text-indigo-500'}`}>
                            {rankingMetric === 'growth' ? `${p.growth >= 0 ? '+' : ''}${p.growth.toFixed(1)}%` : (rankingMetric === 'units' ? `${formatNumber(p.units)} u` : formatCurrency(p[rankingMetric]))}
                          </span>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div className={`h-full rounded-full ${rankingOrder === 'desc' ? 'bg-indigo-500' : 'bg-rose-500'}`} style={{ width: `${barPct}%` }}></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDOSTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><Activity className="w-6 h-6 text-rose-500" /> DOS (Days of Supply) & Quiebres</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Predice cuántos días te dura el inventario actual. Identifica riesgos de venta perdida (Out-of-Stock) y sobreinventario atascado.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}><span className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Días Análisis:</span><input type="number" min="7" max="365" value={dosPeriodDays} onChange={(e) => setDosPeriodDays(Number(e.target.value) || 365)} className={`w-16 bg-transparent border-none text-sm font-bold focus:outline-none text-right ${t.textTitle}`} /></div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}><span className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Target DOS:</span><input type="number" min="1" max="90" value={targetDos} onChange={(e) => setTargetDos(Number(e.target.value) || 14)} className={`w-16 bg-transparent border-none text-sm font-bold focus:outline-none text-right ${t.textTitle}`} /></div>
        </div>
      </div>
      {dosAnalysis && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className={`p-6 rounded-2xl border transition-colors ${isDarkMode ? 'bg-rose-950/20 border-rose-900/50' : 'bg-rose-50/50 border-rose-200'}`}>
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2"><AlertTriangle className="w-5 h-5" /><span className="text-xs font-bold uppercase tracking-widest">Riesgo Quiebre</span></div>
              <p className={`text-3xl font-black ${isDarkMode ? 'text-rose-300' : 'text-rose-700'}`}>{dosAnalysis.outOfStockRisk.length}</p>
              <p className={`text-[10px] mt-1 font-medium ${isDarkMode ? 'text-rose-500/70' : 'text-rose-600/70'}`}>SKUs con menos de 7 días</p>
            </div>
            <div className={`p-6 rounded-2xl border transition-colors ${isDarkMode ? 'bg-amber-950/20 border-amber-900/50' : 'bg-amber-50/50 border-amber-200'}`}>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2"><Layers className="w-5 h-5" /><span className="text-xs font-bold uppercase tracking-widest">Sobreinventario</span></div>
              <p className={`text-3xl font-black ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>{dosAnalysis.overstocked.length}</p>
              <p className={`text-[10px] mt-1 font-medium ${isDarkMode ? 'text-amber-500/70' : 'text-amber-600/70'}`}>SKUs con más de 30 días</p>
            </div>
            <div className={`p-6 rounded-2xl border transition-colors ${t.card}`}>
              <div className={`flex items-center gap-2 mb-2 ${t.textSub}`}><DollarSign className="w-5 h-5" /><span className="text-xs font-bold uppercase tracking-widest">Venta Perdida Est.</span></div>
              <p className={`text-3xl font-black text-rose-500`}>{formatCurrency(dosAnalysis.globalLostSales)}</p>
              <p className={`text-[10px] mt-1 font-medium ${t.textSub}`}>Costo por no llegar al Target DOS</p>
            </div>
            <div className={`p-6 rounded-2xl border transition-colors ${t.card}`}>
              <div className={`flex items-center gap-2 mb-2 ${t.textSub}`}><Activity className="w-5 h-5" /><span className="text-xs font-bold uppercase tracking-widest">DOS Promedio</span></div>
              <p className={`text-3xl font-black ${t.textTitle}`}>{dosAnalysis.avgDos.toFixed(1)}</p>
              <p className={`text-[10px] mt-1 font-medium ${t.textSub}`}>Días de cobertura global</p>
            </div>
          </div>
          <div className={`overflow-hidden rounded-2xl border transition-colors ${t.tableWrapper}`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className={`font-black flex items-center gap-2 ${t.textTitle}`}><Database className="w-5 h-5 text-indigo-500" /> Monitoreo de Inventario por SKU</h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
                    <tr className="text-[10px] uppercase font-black tracking-widest"><th className="px-6 py-4">Producto & UPC</th><th className="px-4 py-4 text-center">Inv. Actual</th><th className="px-4 py-4 text-center">DOS</th><th className="px-4 py-4 text-center">Estatus</th><th className="px-4 py-4 text-right">Lost Sales (OOS)</th></tr>
                </thead>
                <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
                    {dosAnalysis.items.slice(0, 150).map((p, index) => {
                        let statusClass = 'bg-slate-100 text-slate-700'; let statusText = 'Desconocido';
                        if (p.dos < 7 && p.units > 0) { statusClass = 'bg-rose-100 text-rose-700'; statusText = 'Riesgo Quiebre'; } else if (p.dos > 30) { statusClass = 'bg-amber-100 text-amber-700'; statusText = 'Exceso'; } else if (p.dos >= 7 && p.dos <= 30) { statusClass = 'bg-emerald-100 text-emerald-700'; statusText = 'Sano'; }
                        return (
                        <tr key={`dos_${index}`} className={`transition-colors ${t.rowBase} hover:bg-opacity-50`}>
                            <td className="px-6 py-4"><div className="flex flex-col"><span className={`font-bold text-sm uppercase leading-tight ${t.textTitle}`}>{p.name}</span><span className={`text-[10px] font-mono mt-1 ${t.textSub}`}>UPC: {p.upc} | Cat: {p.category}</span></div></td>
                            <td className={`px-4 py-4 text-center font-mono text-sm ${t.textTitle}`}>{formatNumber(p.inv)}</td>
                            <td className={`px-4 py-4 text-center font-mono font-black text-sm ${p.dos < 7 ? 'text-rose-500' : t.textTitle}`}>{p.dos === 999 ? '999+' : p.dos.toFixed(1)}</td>
                            <td className="px-4 py-4 text-center"><span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border ${statusClass}`}>{statusText}</span></td>
                            <td className={`px-4 py-4 text-right font-mono font-bold text-sm ${p.lostSales > 0 ? 'text-rose-500' : t.textSub}`}>{p.lostSales > 0 ? formatCurrency(p.lostSales) : '-'}</td>
                        </tr>
                        )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderRationalizationTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><Scissors className="w-6 h-6 text-rose-500" /> Racionalización de Surtido</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Motor de decisión basado en cuadrantes. Sugiere qué productos proteger, expandir o eliminar cruzando ventas, crecimiento e inventario.</p>
        </div>
      </div>
      {rationalizationAnalysis && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                  { key: 'GROW', label: 'Expandir (Grow)', count: rationalizationAnalysis.summary.GROW.length, color: 'emerald' },
                  { key: 'KEEP', label: 'Mantener (Keep)', count: rationalizationAnalysis.summary.KEEP.length, color: 'blue' },
                  { key: 'WATCH', label: 'Observar (Watch)', count: rationalizationAnalysis.summary.WATCH.length, color: 'amber' },
                  { key: 'REVIEW', label: 'Revisar (Review)', count: rationalizationAnalysis.summary.REVIEW.length, color: 'orange' },
                  { key: 'DROP', label: 'Eliminar (Drop)', count: rationalizationAnalysis.summary.DROP.length, color: 'rose' }
              ].map(action => {
                  const tone = getToneClasses(action.color, isDarkMode);
                  return (
                    <div key={action.key} className={`p-4 rounded-xl border text-center transition-colors ${tone.card}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${tone.label}`}>{action.label}</span>
                        <span className={`block text-3xl font-black mt-2 ${tone.val}`}>{action.count}</span>
                    </div>
                  );
              })}
          </div>
          <div className={`overflow-hidden rounded-2xl border transition-colors ${t.tableWrapper}`}>
              <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                <h3 className={`font-black flex items-center gap-2 ${t.textTitle}`}><ListChecks className="w-5 h-5 text-indigo-500" /> Matriz de Acción SKU</h3>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                      <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
                          <tr className="text-[10px] uppercase font-black tracking-widest"><th className="px-6 py-4">Producto & UPC</th><th className="px-4 py-4 text-center">Acción Recomendada</th><th className="px-4 py-4 text-right">Ventas TY</th><th className="px-6 py-4">Motivo Principal Algorítmico</th></tr>
                      </thead>
                      <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
                          {rationalizationAnalysis.all.map((p, index) => {
                              let badgeColor = 'slate';
                              if (p.action === 'GROW') badgeColor = 'emerald'; else if (p.action === 'KEEP') badgeColor = 'blue'; else if (p.action === 'WATCH') badgeColor = 'amber'; else if (p.action === 'REVIEW') badgeColor = 'orange'; else if (p.action === 'DROP') badgeColor = 'rose';
                              const tone = getToneClasses(badgeColor, isDarkMode);
                              return (
                                  <tr key={`rat_${index}`} className={`transition-colors ${t.rowBase} hover:bg-opacity-50`}>
                                      <td className="px-6 py-4"><div className="flex flex-col"><span className={`font-bold text-sm uppercase leading-tight ${t.textTitle}`}>{p.name}</span><span className={`text-[10px] font-mono mt-1 ${t.textSub}`}>UPC: {p.upc} | Cat: {p.category}</span></div></td>
                                      <td className="px-4 py-4 text-center"><span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${tone.badge}`}>{p.action}</span></td>
                                      <td className={`px-4 py-4 text-right font-mono font-bold text-sm ${t.textTitle}`}>{formatCurrency(p.ty)}</td>
                                      <td className={`px-6 py-4 text-xs font-medium uppercase ${t.textSub}`}>{p.reason}</td>
                                  </tr>
                              )
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
        </>
      )}
    </div>
  );

  const renderPricingTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><Tags className="w-6 h-6 text-amber-500" /> AUR & Estructura de Precio</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Auditoría de precios (Average Unit Retail). Analiza la dispersión de precios por categoría para identificar y crear estrategias de niveles: Entry, Core y Premium.</p>
        </div>
      </div>
      {pricingAnalysis && (
        <div className={`overflow-hidden rounded-2xl border transition-colors ${t.tableWrapper}`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                <h3 className={`font-black flex items-center gap-2 ${t.textTitle}`}><Layers className="w-5 h-5 text-indigo-500" /> Dispersión de Precios por Categoría</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
                        <tr className="text-[10px] uppercase font-black tracking-widest"><th className="px-6 py-4">Categoría</th><th className="px-4 py-4 text-right text-emerald-500">Min AUR (Entry)</th><th className="px-4 py-4 text-right text-indigo-500">Avg AUR (Core Base)</th><th className="px-4 py-4 text-right text-amber-500">Max AUR (Premium)</th></tr>
                    </thead>
                    <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
                        {pricingAnalysis.map((c, index) => (
                            <tr key={`prc_${index}`} className={`transition-colors ${t.rowBase} hover:bg-opacity-50`}>
                                <td className="px-6 py-4"><span className={`font-bold text-sm uppercase ${t.textTitle}`}>{c.name}</span></td>
                                <td className="px-4 py-4 text-right">
                                  <div className="flex flex-col items-end">
                                    <span className={`font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400`}>{formatCurrency(c.minAurItem.aur)}</span>
                                    <span className={`text-[9px] uppercase font-medium mt-1 truncate w-32 ${t.textSub}`} title={c.minAurItem.name}>{c.minAurItem.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-right"><span className={`font-mono font-black text-lg text-indigo-600 dark:text-indigo-400`}>{formatCurrency(c.avgAur)}</span></td>
                                <td className="px-4 py-4 text-right">
                                  <div className="flex flex-col items-end">
                                    <span className={`font-mono font-bold text-sm text-amber-600 dark:text-amber-400`}>{formatCurrency(c.maxAurItem.aur)}</span>
                                    <span className={`text-[9px] uppercase font-medium mt-1 truncate w-32 ${t.textSub}`} title={c.maxAurItem.name}>{c.maxAurItem.name}</span>
                                  </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );

  const renderElasticityTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}>
            <Calculator className="w-6 h-6 text-indigo-500" /> Elasticidad de Precio & Simulador de Optimización (Price ROI)
          </h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            Modelado econométrico de sensibilidad al precio ($E_d = \%\Delta Q / \%\Delta P$). Identifica productos con poder de marca (inelásticos) donde puedes incrementar precio ganando margen neto sin sacrificar tracción.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Store className="w-4 h-4 text-indigo-400" />
            <select
              className={`bg-transparent border-none text-xs font-bold focus:outline-none ${t.textTitle}`}
              value={elasticityStoreFilter}
              onChange={(e) => setElasticityStoreFilter(e.target.value)}
            >
              <option value="Todas">Todas las Tiendas</option>
              {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Filter className="w-4 h-4 text-emerald-400" />
            <select
              className={`bg-transparent border-none text-xs font-bold focus:outline-none ${t.textTitle}`}
              value={elasticityCategoryFilter}
              onChange={(e) => setElasticityCategoryFilter(e.target.value)}
            >
              <option value="Todas">Todas las Categorías</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* PANEL DE CONTROL GLOBAL DE SIMULACIÓN DE PRECIOS */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 ${t.card}`}>
        <div>
          <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${t.textSub}`}>
            Estrategia Rápida de Simulación:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Descuento Tráfico (-8%)', pct: -8 },
              { label: 'Micro-Ajuste Inflación (+3%)', pct: 3 },
              { label: 'Captura de Margen (+6%)', pct: 6 },
              { label: 'Cosecha Premium (+10%)', pct: 10 }
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setSimPriceChangePct(preset.pct)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  simPriceChangePct === preset.pct
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : t.card
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
          <div className="flex flex-col flex-1 sm:flex-initial">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${t.textSub}`}>
              Ajuste de Precio Simulado:{' '}
              <strong className={simPriceChangePct >= 0 ? 'text-emerald-500' : 'text-amber-500'}>
                {simPriceChangePct >= 0 ? '+' : ''}{simPriceChangePct}%
              </strong>
            </span>
            <input
              type="range"
              min="-15"
              max="20"
              step="1"
              value={simPriceChangePct}
              onChange={(e) => setSimPriceChangePct(Number(e.target.value))}
              className="w-44 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
            />
          </div>
          <div className="flex flex-col flex-1 sm:flex-initial">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${t.textSub}`}>
              Margen Bruto Base:{' '}
              <strong className="text-indigo-500">{elasticityBaseMargin}%</strong>
            </span>
            <input
              type="range"
              min="15"
              max="65"
              step="1"
              value={elasticityBaseMargin}
              onChange={(e) => setElasticityBaseMargin(Number(e.target.value))}
              className="w-36 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
            />
          </div>
        </div>
      </div>

      {elasticityAnalysis ? (
        <>
          {/* 4 KPIs EJECUTIVOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`p-5 rounded-2xl border ${t.card}`}>
              <p className={`text-[10px] uppercase font-bold tracking-widest ${t.textSub}`}>Elasticidad Ponderada ($E_d$)</p>
              <div className="flex items-baseline justify-between mt-1">
                <p className="text-3xl font-black text-indigo-500">{elasticityAnalysis.portfolioElasticity.toFixed(2)}</p>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${Math.abs(elasticityAnalysis.portfolioElasticity) < 1 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                  {Math.abs(elasticityAnalysis.portfolioElasticity) < 1 ? 'Portafolio Inelástico' : 'Sensibilidad Media'}
                </span>
              </div>
              <p className={`text-xs mt-1 ${t.textSub}`}>Cambio en % Unidades por cada +1% en Precio</p>
            </div>

            <div className={`p-5 rounded-2xl border border-emerald-500/40 ${isDarkMode ? 'bg-emerald-950/20' : 'bg-emerald-50/50'}`}>
              <p className={`text-[10px] uppercase font-bold tracking-widest ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                Dinero en la Mesa (Utilidad Incremental)
              </p>
              <p className={`text-3xl font-black mt-1 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                +{formatCurrency(elasticityAnalysis.inelasticOpportunityDollars)}
              </p>
              <p className={`text-xs mt-1 ${t.textSub}`}>
                Ganancia neta extra aplicando {simPriceChangePct >= 0 ? `+${simPriceChangePct}%` : `${simPriceChangePct}%`} en Inelásticos
              </p>
            </div>

            <div className={`p-5 rounded-2xl border ${t.card}`}>
              <p className={`text-[10px] uppercase font-bold tracking-widest ${t.textSub}`}>SKUs con Poder de Marca (Inelásticos)</p>
              <p className="text-3xl font-black mt-1 text-emerald-500">
                {elasticityAnalysis.counts.Inelástico}{' '}
                <span className={`text-xs font-bold ${t.textSub}`}>
                  ({elasticityAnalysis.allCount > 0 ? ((elasticityAnalysis.counts.Inelástico / elasticityAnalysis.allCount) * 100).toFixed(0) : 0}%)
                </span>
              </p>
              <p className={`text-xs mt-1 ${t.textSub}`}>Resisten subidas de precio ($|E_d| &lt; 0.95$)</p>
            </div>

            <div className={`p-5 rounded-2xl border ${t.card}`}>
              <p className={`text-[10px] uppercase font-bold tracking-widest ${t.textSub}`}>SKUs Hiper-Sensibles (Elásticos)</p>
              <p className="text-3xl font-black mt-1 text-rose-500">
                {elasticityAnalysis.counts.Elástico}{' '}
                <span className={`text-xs font-bold ${t.textSub}`}>
                  ({elasticityAnalysis.allCount > 0 ? ((elasticityAnalysis.counts.Elástico / elasticityAnalysis.allCount) * 100).toFixed(0) : 0}%)
                </span>
              </p>
              <p className={`text-xs mt-1 ${t.textSub}`}>Peligro de fuga de volumen si subes precio ($|E_d| &gt; 1.35$)</p>
            </div>
          </div>

          {/* BOTONES DE FILTRO POR RÉGIMEN DE ELASTICIDAD */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { id: 'Todos', label: 'Todo el Catálogo', count: elasticityAnalysis.allCount, color: 'indigo' },
              { id: 'Inelástico', label: 'Inelásticos (Subir Precio)', count: elasticityAnalysis.counts.Inelástico, color: 'emerald' },
              { id: 'Moderado', label: 'Moderados (Mantener / Cuidar)', count: elasticityAnalysis.counts.Moderado, color: 'blue' },
              { id: 'Elástico', label: 'Elásticos (Usar en Promos)', count: elasticityAnalysis.counts.Elástico, color: 'rose' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setElasticityRegimeFilter(tab.id)}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  elasticityRegimeFilter === tab.id ? 'ring-2 ring-indigo-500 scale-[1.01]' : ''
                } ${t.card}`}
              >
                <span className={`text-[10px] font-bold uppercase block ${t.textSub}`}>{tab.label}</span>
                <span className={`text-2xl font-black mt-1 block ${t.textTitle}`}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* GRÁFICAS: 1) OPORTUNIDAD POR CATEGORÍA + 2) CURVA DE OPTIMIZACIÓN DEL SKU SELECCIONADO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <div className={`p-6 rounded-2xl border lg:col-span-5 flex flex-col ${t.card}`}>
              <h3 className={`font-bold text-base mb-1 flex items-center gap-2 ${t.textTitle}`}>
                <BarChart3 className="w-5 h-5 text-emerald-500" /> Margen Incremental vs Sensibilidad por Categoría
              </h3>
              <p className={`text-xs mb-4 ${t.textSub}`}>
                Barras = Ganancia Neta Extra ($) • Línea = Sensibilidad Promedio ($|E_d|$)
              </p>
              <div className="h-64 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={elasticityAnalysis.categoryChartData} margin={{ top: 10, right: 15, left: 0, bottom: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                    <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fill: t.chartText, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" hide />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 2.5]} tick={{ fill: t.chartText, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '10px' }}
                      formatter={(val, name) => name.includes('Sensibilidad') ? `${val}x` : formatCurrency(val)}
                    />
                    <Legend verticalAlign="top" height={30} iconType="circle" />
                    <Bar yAxisId="left" dataKey="oppProfit" name="Utilidad Incremental ($)" fill="#10b981" radius={[5, 5, 0, 0]} barSize={24} />
                    <Line yAxisId="right" type="monotone" dataKey="elasticity" name="Sensibilidad (|Ed|)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3, fill: '#f59e0b' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border lg:col-span-7 flex flex-col ${t.card}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">
                    Curva de Optimización de Precio (Haz clic en cualquier fila abajo para cambiar SKU)
                  </span>
                  <h3 className={`font-black text-base uppercase truncate max-w-md ${t.textTitle}`}>
                    {elasticityAnalysis.activeSelectedItem?.name || 'Selecciona un SKU'}
                  </h3>
                </div>
                {elasticityAnalysis.activeSelectedItem && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500">
                      Ed: {elasticityAnalysis.activeSelectedItem.ed.toFixed(2)} ({elasticityAnalysis.activeSelectedItem.regime})
                    </span>
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">
                      Óptimo: {elasticityAnalysis.activeSelectedItem.bestPriceAdjPct >= 0 ? '+' : ''}{elasticityAnalysis.activeSelectedItem.bestPriceAdjPct}%
                    </span>
                  </div>
                )}
              </div>

              <div className="h-64 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={elasticityAnalysis.selectedSkuCurve} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                    <XAxis dataKey="label" tick={{ fill: t.chartText, fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '10px' }}
                      formatter={(val, name) => name.includes('Unidades') ? `${formatNumber(val)} u` : formatCurrency(val)}
                    />
                    <Legend verticalAlign="top" height={30} iconType="circle" />
                    <Bar dataKey="revenue" name="Ingresos Proyectados ($)" fill={isDarkMode ? '#334155' : '#cbd5e1'} radius={[5, 5, 0, 0]} barSize={28} />
                    <Line type="monotone" dataKey="profit" name="Utilidad Neta Proyectada ($)" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* TABLA PRESCRIPTIVA DE ELASTICIDAD Y SIMULACIÓN POR SKU */}
          <div className={`overflow-hidden rounded-2xl border transition-colors ${t.tableWrapper}`}>
            <div className={`p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
              <div>
                <h3 className={`font-black flex items-center gap-2 ${t.textTitle}`}>
                  <Sparkles className="w-5 h-5 text-indigo-500" /> Matriz de Elasticidad y Simulación Tarifaria ({elasticityAnalysis.items.length} SKUs)
                </h3>
                <p className={`text-xs mt-0.5 ${t.textSub}`}>
                  Haz clic en cualquier producto para graficar su curva de demanda y utilidad óptima arriba.
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar producto o UPC..."
                  value={elasticitySearchTerm}
                  onChange={(e) => setElasticitySearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs font-medium focus:outline-none ${t.input}`}
                />
              </div>
            </div>

            <div className="max-h-[540px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
                  <tr className="text-[10px] uppercase font-black tracking-widest">
                    <th className="px-4 py-4">Producto & Categoría</th>
                    <th className="px-4 py-4 text-right">AUR Actual (RPI)</th>
                    <th className="px-4 py-4 text-center">Elasticidad ($E_d$)</th>
                    <th className="px-4 py-4 text-right">Nuevo Precio ({simPriceChangePct >= 0 ? `+${simPriceChangePct}%` : `${simPriceChangePct}%`})</th>
                    <th className="px-4 py-4 text-right">Impacto Unidades</th>
                    <th className="px-4 py-4 text-right">Efecto en Utilidad ($)</th>
                    <th className="px-5 py-4">Recomendación Prescriptiva</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
                  {elasticityAnalysis.items.slice(0, 120).map((item, idx) => {
                    const isSelected = elasticityAnalysis.activeSelectedItem?.key === item.key;
                    return (
                      <tr
                        key={`elas_${idx}`}
                        onClick={() => setSelectedElasticitySkuKey(item.key)}
                        className={`cursor-pointer transition-colors ${isSelected ? t.rowSelected : t.rowBase}`}
                      >
                        <td className="px-4 py-3.5">
                          <span className={`font-bold text-xs uppercase block ${t.textTitle}`}>{item.name}</span>
                          <span className={`text-[10px] font-mono ${t.textSub}`}>UPC: {item.upc || 'N/A'} • {item.category}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`font-mono font-bold text-xs block ${t.textTitle}`}>{formatCurrency(item.aur)}</span>
                          <span className={`text-[10px] font-mono ${item.rpi > 1.15 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {(item.rpi * 100).toFixed(0)}% vs Cat.
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`font-mono font-black text-xs block ${t.textTitle}`}>{item.ed.toFixed(2)}</span>
                          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            item.regime === 'Inelástico'
                              ? 'bg-emerald-500/20 text-emerald-500'
                              : item.regime === 'Moderado'
                              ? 'bg-blue-500/20 text-blue-500'
                              : 'bg-rose-500/20 text-rose-500'
                          }`}>
                            {item.regime}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="font-mono font-black text-xs text-indigo-500 block">{formatCurrency(item.simulatedAur)}</span>
                          <span className={`text-[10px] font-mono ${t.textSub}`}>Costo: {formatCurrency(item.unitCost)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`font-mono font-bold text-xs block ${t.textTitle}`}>{formatNumber(item.simulatedUnits)} u</span>
                          <span className={`text-[10px] font-mono font-bold ${item.volumeDeltaPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {item.volumeDeltaPct >= 0 ? '+' : ''}{(item.volumeDeltaPct * 100).toFixed(1)}% ({formatNumber(item.simulatedUnits - item.units)})
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`font-mono font-black text-xs block ${item.profitDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {item.profitDelta >= 0 ? '+' : ''}{formatCurrency(item.profitDelta)}
                          </span>
                          <span className={`text-[10px] font-mono ${t.textSub}`}>
                            Total: {formatCurrency(item.simulatedProfit)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-bold block ${t.textTitle}`}>{item.actionText}</span>
                          {item.optimalProfitGain > 15 && (
                            <span className="text-[10px] font-mono text-emerald-500 block">
                              Potencial Máx: +{formatCurrency(item.optimalProfitGain)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className={`rounded-2xl p-12 text-center border-2 border-dashed ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
          <Calculator className={`w-12 h-12 mx-auto mb-3 opacity-40 ${t.textSub}`} />
          <h3 className={`text-lg font-bold ${t.textTitle}`}>Sincroniza un archivo de ventas para calcular la Elasticidad</h3>
          <p className={`text-sm mt-1 ${t.textSub}`}>
            El motor econométrico requiere productos con Ventas ($) y Unidades mayores a cero para modelar las curvas de precio-demanda.
          </p>
        </div>
      )}
    </div>
  );

  const renderMarkdownsTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><TrendingDown className="w-6 h-6 text-rose-500" /> Riesgo de Markdowns (Capital Atrapado)</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Identifica inventario obsoleto en productos con caídas fuertes en ventas (&lt;-20%) y estima el impacto financiero de rebajas (Clearance).</p>
        </div>
      </div>
      {markdownAnalysis && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`p-6 rounded-2xl border transition-colors ${t.card} bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50`}>
                  <p className={`text-xs uppercase font-bold text-rose-600 dark:text-rose-400`}>Capital Atrapado (Est. Total)</p>
                  <p className={`text-3xl font-black mt-2 text-rose-700 dark:text-rose-300`}>{formatCurrency(markdownAnalysis.totalTrapped)}</p>
                  <p className={`text-xs mt-2 text-rose-600/70 dark:text-rose-400/70`}>Valor estimado del inventario declinante.</p>
              </div>
              <div className={`p-6 rounded-2xl border transition-colors ${t.card}`}>
                  <p className={`text-xs uppercase font-bold ${t.textSub}`}>Costo de Liquidación (Rebaja 30%)</p>
                  <p className={`text-3xl font-black mt-2 text-amber-500`}>{formatCurrency(markdownAnalysis.markdown30)}</p>
                  <p className={`text-xs mt-2 ${t.textSub}`}>Impacto en margen si se rebaja un 30%.</p>
              </div>
              <div className={`p-6 rounded-2xl border transition-colors ${t.card}`}>
                  <p className={`text-xs uppercase font-bold ${t.textSub}`}>Costo de Liquidación (Clearance 50%)</p>
                  <p className={`text-3xl font-black mt-2 text-rose-500`}>{formatCurrency(markdownAnalysis.markdown50)}</p>
                  <p className={`text-xs mt-2 ${t.textSub}`}>Impacto directo si se fuerza salida al 50%.</p>
              </div>
          </div>
          <div className={`overflow-hidden rounded-2xl border transition-colors ${t.tableWrapper}`}>
              <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                  <h3 className={`font-black flex items-center gap-2 ${t.textTitle}`}><AlertCircle className="w-5 h-5 text-rose-500" /> Inventario Declinante para Liquidar</h3>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                      <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
                          <tr className="text-[10px] uppercase font-black tracking-widest"><th className="px-6 py-4">Producto & UPC</th><th className="px-4 py-4 text-center">Inv. Units Est.</th><th className="px-4 py-4 text-right">Capital Est. Atrapado</th><th className="px-4 py-4 text-right">Caída vs LY</th></tr>
                      </thead>
                      <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
                          {markdownAnalysis.items.slice(0, 100).map((p, index) => (
                              <tr key={`mkd_${index}`} className={`transition-colors ${t.rowBase} hover:bg-opacity-50`}>
                                  <td className="px-6 py-4"><div className="flex flex-col"><span className={`font-bold text-sm uppercase leading-tight ${t.textTitle}`}>{p.name}</span><span className={`text-[10px] font-mono mt-1 ${t.textSub}`}>UPC: {p.upc || 'N/A'}</span></div></td>
                                  <td className={`px-4 py-4 text-center font-mono font-bold text-sm ${t.textTitle}`}>{formatNumber(p.inv)}</td>
                                  <td className={`px-4 py-4 text-right font-mono font-black text-sm text-rose-500`}>{formatCurrency(p.trappedCapital)}</td>
                                  <td className="px-4 py-4 text-right"><span className="text-[10px] font-black inline-flex items-center gap-0.5 text-rose-500"><ArrowDownRight className="w-3 h-3" /> {Math.abs(p.growth * 100).toFixed(1)}%</span></td>
                              </tr>
                          ))}
                          {markdownAnalysis.items.length === 0 && <tr><td colSpan="4" className="px-6 py-12 text-center text-sm font-medium text-slate-400">No se detectó inventario atrapado significativo.</td></tr>}
                      </tbody>
                  </table>
              </div>
          </div>
        </>
      )}
    </div>
  );

  const renderSpaceTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><LayoutTemplate className="w-6 h-6 text-indigo-500" /> Space vs Sales (Justificación de Góndola)</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Índice de Rendimiento de Espacio. Compara equidad: evalúa si una categoría recibe un porcentaje de espacio (% Inventario) que se justifique con su % de Ventas Totales.</p>
        </div>
      </div>
      {spaceVsSalesAnalysis && (
        <div className={`overflow-hidden rounded-2xl border transition-colors ${t.tableWrapper}`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                <h3 className={`font-black flex items-center gap-2 ${t.textTitle}`}><Database className="w-5 h-5 text-indigo-500" /> Índice Macro de Rendimiento por Categoría</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
                        <tr className="text-[10px] uppercase font-black tracking-widest"><th className="px-6 py-4">Categoría</th><th className="px-4 py-4 text-center">Share of Sales (%)</th><th className="px-4 py-4 text-center">Share of Space (%)</th><th className="px-4 py-4 text-center">Space/Sales Index</th><th className="px-4 py-4 text-center">Acción de Góndola Recomendada</th></tr>
                    </thead>
                    <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
                        {spaceVsSalesAnalysis.map((c, index) => {
                            let badgeColor = 'slate';
                            if (c.action.includes('Expandir')) badgeColor = 'emerald'; else if (c.action.includes('Reducir')) badgeColor = 'rose';
                            const tone = getToneClasses(badgeColor, isDarkMode);
                            return (
                                <tr key={`spc_${index}`} className={`transition-colors ${t.rowBase} hover:bg-opacity-50`}>
                                    <td className="px-6 py-4"><span className={`font-bold text-sm uppercase ${t.textTitle}`}>{c.name}</span></td>
                                    <td className={`px-4 py-4 text-center font-mono font-bold text-sm ${t.textTitle}`}>{c.shareOfSales.toFixed(1)}%</td>
                                    <td className={`px-4 py-4 text-center font-mono text-sm ${t.textSub}`}>{c.shareOfSpace.toFixed(1)}%</td>
                                    <td className={`px-4 py-4 text-center font-mono font-black text-sm ${c.index > 1.2 ? 'text-emerald-500' : (c.index < 0.8 && c.shareOfSpace > 1 ? 'text-rose-500' : t.textSub)}`}>{c.index.toFixed(2)}</td>
                                    <td className="px-4 py-4 text-center"><span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${tone.badge}`}>{c.action}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );

  const renderAdjacencyTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><GitMerge className="w-6 h-6 text-blue-500" /> Estrategia de Flujo y Macro-Adyacencias</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Estrategia de Macro-Space. Clasifica las categorías por su rol de consumo para optimizar el recorrido del shopper en el piso de ventas.</p>
        </div>
      </div>
      {adjacencyFlow && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className={`rounded-2xl border transition-colors flex flex-col ${isDarkMode ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-indigo-50/50 border-indigo-200'}`}>
                <div className="p-5 border-b border-indigo-500/20"><h3 className="font-black text-lg text-indigo-700 dark:text-indigo-400 flex items-center gap-2"><Target className="w-5 h-5"/> Categorías Destino</h3><p className="text-[10px] uppercase font-bold mt-1 text-indigo-600/70 dark:text-indigo-400/70">Atraen tráfico. Ubicar al fondo (Perímetro).</p></div>
                <div className="p-5 flex-1 flex flex-col gap-3">
                    {adjacencyFlow.filter(c => c.role.includes('Destino')).map((c, i) => (<div key={i} className={`p-3 rounded-xl shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}><p className={`font-bold text-sm uppercase ${t.textTitle}`}>{c.name}</p><p className={`text-[10px] font-mono mt-1 ${t.textSub}`}>{c.share.toFixed(1)}% Share of Sales</p></div>))}
                    {adjacencyFlow.filter(c => c.role.includes('Destino')).length === 0 && <p className="text-xs italic opacity-50 px-2 py-4">Ninguna categoría supera el umbral de Destino.</p>}
                </div>
            </div>
            <div className={`rounded-2xl border transition-colors flex flex-col ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50/50 border-emerald-200'}`}>
                <div className="p-5 border-b border-emerald-500/20"><h3 className="font-black text-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-2"><Layers className="w-5 h-5"/> Categorías Rutina</h3><p className="text-[10px] uppercase font-bold mt-1 text-emerald-600/70 dark:text-emerald-400/70">Basket Builders. Ubicar en pasillos centrales.</p></div>
                <div className="p-5 flex-1 flex flex-col gap-3">
                    {adjacencyFlow.filter(c => c.role.includes('Rutina')).map((c, i) => (<div key={i} className={`p-3 rounded-xl shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}><p className={`font-bold text-sm uppercase ${t.textTitle}`}>{c.name}</p><p className={`text-[10px] font-mono mt-1 ${t.textSub}`}>{c.share.toFixed(1)}% Share of Sales</p></div>))}
                </div>
            </div>
            <div className={`rounded-2xl border transition-colors flex flex-col ${isDarkMode ? 'bg-amber-950/20 border-amber-900/50' : 'bg-amber-50/50 border-amber-200'}`}>
                <div className="p-5 border-b border-amber-500/20"><h3 className="font-black text-lg text-amber-700 dark:text-amber-400 flex items-center gap-2"><Tag className="w-5 h-5"/> Conveniencia / Impulso</h3><p className="text-[10px] uppercase font-bold mt-1 text-amber-600/70 dark:text-amber-400/70">Compra rápida. Checkout, Cabeceras o Front End.</p></div>
                <div className="p-5 flex-1 flex flex-col gap-3 max-h-[500px] overflow-y-auto">
                    {adjacencyFlow.filter(c => c.role.includes('Conveniencia')).map((c, i) => (<div key={i} className={`p-3 rounded-xl shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}><p className={`font-bold text-sm uppercase ${t.textTitle}`}>{c.name}</p><p className={`text-[10px] font-mono mt-1 ${t.textSub}`}>{c.share.toFixed(1)}% Share of Sales</p></div>))}
                </div>
            </div>
        </div>
      )}
    </div>
  );

  const renderSeasonalityTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><CalendarDays className="w-6 h-6 text-purple-500" /> Curva de Estacionalidad (Mockup Proyectado)</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Visualiza las tendencias de ventas estacionales estimadas. Muestra los picos y valles de las Top 5 Categorías para mejorar tu planeación comercial mensual.</p>
        </div>
      </div>
      {seasonalityData && (
        <div className={`p-6 rounded-2xl border transition-colors ${t.card}`}>
            <h3 className={`font-bold mb-6 flex items-center gap-2 ${t.textTitle}`}><LineChart className="w-5 h-5 text-purple-500" /> Tendencia Mensual (Ene - Dic)</h3>
            <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={seasonalityData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: t.chartText, fontWeight: 600 }} />
                        <YAxis hide />
                        <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '8px'}} formatter={(val) => formatCurrency(val)} />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ color: t.chartText }} />
                        {seasonalityData.topCategories.map((c, i) => (<Line key={c.name} type="monotone" dataKey={c.name} name={c.name} stroke={COLORS[i % COLORS.length]} strokeWidth={3} dot={{r: 3, fill: COLORS[i % COLORS.length]}} activeDot={{r: 6}} />))}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
      )}
    </div>
  );

  const renderNPITab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><Lightbulb className="w-6 h-6 text-yellow-500" /> NPI - New Product Introductions (Innovación)</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Mide el impacto de la innovación en tu negocio. Extrae automáticamente aquellos productos que reportan Ventas Activas sin historial de Ventas el año pasado (LY = 0).</p>
        </div>
      </div>
      {npiAnalysis && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`p-6 rounded-2xl border transition-colors ${t.card} bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/50`}>
                  <p className={`text-xs uppercase font-bold text-yellow-600 dark:text-yellow-400`}>Índice de Vitalidad Global (%)</p>
                  <p className={`text-4xl font-black mt-2 text-yellow-700 dark:text-yellow-300`}>{npiAnalysis.vitalityIndex.toFixed(1)}%</p>
                  <p className={`text-xs mt-2 text-yellow-600/70 dark:text-yellow-400/70`}>Porcentaje total de ingresos provenientes de NPIs.</p>
              </div>
              <div className={`p-6 rounded-2xl border transition-colors ${t.card}`}>
                  <p className={`text-xs uppercase font-bold ${t.textSub}`}>Ventas Totales de Innovación</p>
                  <p className={`text-3xl font-black mt-2 ${t.textTitle}`}>{formatCurrency(npiAnalysis.npiSales)}</p>
              </div>
              <div className={`p-6 rounded-2xl border transition-colors ${t.card}`}>
                  <p className={`text-xs uppercase font-bold ${t.textSub}`}>SKUs Nuevos Introducidos</p>
                  <p className={`text-3xl font-black mt-2 ${t.textTitle}`}>{npiAnalysis.newItems.length}</p>
              </div>
          </div>
          <div className={`overflow-hidden rounded-2xl border transition-colors ${t.tableWrapper}`}>
              <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                  <h3 className={`font-black flex items-center gap-2 ${t.textTitle}`}><Sparkles className="w-5 h-5 text-yellow-500" /> Ranking de Innovaciones Exitosas</h3>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                      <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
                          <tr className="text-[10px] uppercase font-black tracking-widest"><th className="px-6 py-4">Producto Nuevo (NPI) & UPC</th><th className="px-4 py-4">Categoría de Penetración</th><th className="px-4 py-4 text-right">Ingresos Generados (TY)</th><th className="px-4 py-4 text-center">Unidades Vendidas</th></tr>
                      </thead>
                      <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
                          {npiAnalysis.newItems.map((p, index) => (
                              <tr key={`npi_${index}`} className={`transition-colors ${t.rowBase} hover:bg-opacity-50`}>
                                  <td className="px-6 py-4"><div className="flex flex-col"><span className={`font-bold text-sm uppercase leading-tight ${t.textTitle}`}>{p.name}</span><span className={`text-[10px] font-mono mt-1 ${t.textSub}`}>UPC: {p.upc || 'N/A'}</span></div></td>
                                  <td className="px-4 py-4"><span className={`text-xs font-medium uppercase ${t.textSub}`}>{p.category}</span></td>
                                  <td className={`px-4 py-4 text-right font-mono font-bold text-sm text-emerald-500`}>{formatCurrency(p.ty)}</td>
                                  <td className={`px-4 py-4 text-center font-mono text-sm ${t.textTitle}`}>{formatNumber(p.units)}</td>
                              </tr>
                          ))}
                          {npiAnalysis.newItems.length === 0 && <tr><td colSpan="4" className="px-6 py-12 text-center text-sm font-medium text-slate-400">No hay productos clasificados como NPI (Todos tienen ventas LY mayores a cero).</td></tr>}
                      </tbody>
                  </table>
              </div>
          </div>
        </>
      )}
    </div>
  );

  const renderPromoTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><BadgePercent className="w-6 h-6 text-indigo-500" /> Simulador de Break-Even (Promo ROI)</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Simulador de elasticidad promocional. Calcula matemáticamente cuánto "Lift" (volumen extra) necesitas vender para cubrir el descuento y no destruir el margen.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-2xl border flex flex-col gap-6 lg:col-span-1 transition-colors ${t.card}`}>
              <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${t.textTitle}`}><Search className="w-4 h-4 text-indigo-500" /> 1. Buscar Producto</label>
                  <input type="text" placeholder="Nombre o UPC..." className={`w-full p-3 rounded-xl border text-sm font-medium focus:outline-none transition-colors mb-2 ${t.input}`} value={promoSearchTerm} onChange={(e) => setPromoSearchTerm(e.target.value)} />
                  {promoSearchTerm && promoProductOptions.length > 0 && !selectedPromoProductId && (
                      <div className={`border rounded-xl mt-1 overflow-hidden shadow-sm max-h-40 overflow-y-auto ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                          {promoProductOptions.map(p => (
                              <button key={p.id} onClick={() => { setSelectedPromoProductId(p.id); setPromoSearchTerm(""); }} className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase border-b last:border-b-0 transition-colors ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-100 hover:bg-slate-50 text-slate-700'}`}>
                                  {p.name} <span className="opacity-50 ml-1">({p.upc})</span>
                              </button>
                          ))}
                      </div>
                  )}
                  {selectedPromoProductId && promoSimulation && (
                      <div className={`mt-2 p-3 rounded-xl border flex justify-between items-center ${isDarkMode ? 'bg-indigo-950/30 border-indigo-900/50' : 'bg-indigo-50/50 border-indigo-200'}`}>
                          <div className="min-w-0 flex-1">
                              <p className="text-[10px] uppercase font-bold text-indigo-500 mb-0.5">Producto Seleccionado</p>
                              <p className={`text-xs font-bold uppercase truncate ${t.textTitle}`}>{promoSimulation.item.name}</p>
                          </div>
                          <button onClick={() => setSelectedPromoProductId(null)} className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors"><X className="w-4 h-4"/></button>
                      </div>
                  )}
              </div>
              <div className={!selectedPromoProductId ? 'opacity-30 pointer-events-none' : ''}>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${t.textTitle}`}><Target className="w-4 h-4 text-emerald-500" /> 2. Margen Base Actual (%)</label>
                  <div className="flex items-center gap-4">
                      <input type="range" min="5" max="70" step="1" value={promoMargin} onChange={(e) => setPromoMargin(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                      <span className={`font-mono font-black text-lg w-12 text-right ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{promoMargin}%</span>
                  </div>
              </div>
              <div className={!selectedPromoProductId ? 'opacity-30 pointer-events-none' : ''}>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${t.textTitle}`}><TrendingDown className="w-4 h-4 text-rose-500" /> 3. Descuento Promocional (%)</label>
                  <div className="flex items-center gap-4">
                      <input type="range" min="1" max="50" step="1" value={promoDiscount} onChange={(e) => setPromoDiscount(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                      <span className={`font-mono font-black text-lg w-12 text-right ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>{promoDiscount}%</span>
                  </div>
                  {promoDiscount >= promoMargin && <p className="text-xs text-rose-500 font-bold mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Alerta: Descuento destruye todo el margen.</p>}
              </div>
          </div>
          <div className={`p-6 rounded-2xl border flex flex-col lg:col-span-2 transition-colors ${t.card} relative overflow-hidden`}>
              {!promoSimulation ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/5 dark:bg-black/20 backdrop-blur-sm z-10">
                      <Calculator className={`w-12 h-12 mb-3 opacity-20 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}/>
                      <h3 className={`font-bold ${t.textTitle}`}>Esperando selección...</h3>
                      <p className={`text-sm mt-1 ${t.textSub}`}>Busca y selecciona un producto a la izquierda para iniciar.</p>
                  </div>
              ) : (
                  <>
                      <h3 className={`font-bold text-lg mb-6 flex items-center gap-2 ${t.textTitle}`}><Award className="w-5 h-5 text-indigo-500" /> Diagnóstico de Rentabilidad (Break-Even)</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}><p className={`text-[10px] uppercase font-bold ${t.textSub}`}>Precio Regular</p><p className={`text-xl font-black mt-1 ${t.textTitle}`}>{formatCurrency(promoSimulation.aur)}</p></div>
                          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-indigo-950/30 border-indigo-900/50' : 'bg-indigo-50 border-indigo-200'}`}><p className="text-[10px] uppercase font-bold text-indigo-500">Precio Promo</p><p className="text-xl font-black mt-1 text-indigo-600 dark:text-indigo-400">{formatCurrency(promoSimulation.newAur)}</p></div>
                          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}><p className={`text-[10px] uppercase font-bold ${t.textSub}`}>Ganancia Regular/Und</p><p className={`text-xl font-black mt-1 ${t.textTitle}`}>{formatCurrency(promoSimulation.originalProfitPerUnit)}</p></div>
                          <div className={`p-4 rounded-xl border ${promoSimulation.isLoss ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50' : (isDarkMode ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200')}`}><p className={`text-[10px] uppercase font-bold ${promoSimulation.isLoss ? 'text-rose-500' : 'text-emerald-500'}`}>Ganancia Promo/Und</p><p className={`text-xl font-black mt-1 ${promoSimulation.isLoss ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{formatCurrency(promoSimulation.newProfitPerUnit)}</p></div>
                      </div>
                      <div className={`mb-6 p-5 rounded-2xl border-2 flex flex-col sm:flex-row justify-between items-center gap-4 ${promoSimulation.isLoss ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20' : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'}`}>
                          <div><h4 className={`font-black text-lg ${promoSimulation.isLoss ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-700 dark:text-indigo-300'}`}>Objetivo Lift (Break-Even)</h4><p className={`text-xs font-medium mt-1 ${promoSimulation.isLoss ? 'text-rose-700 dark:text-rose-300' : 'text-indigo-800 dark:text-indigo-200'}`}>{promoSimulation.isLoss ? 'Promoción a pérdida. No hay Break-Even posible.' : 'Crecimiento de unidades exigido para no perder $.'}</p></div>
                          <div className="text-right"><p className={`text-4xl font-black tracking-tighter ${promoSimulation.isLoss ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{promoSimulation.isLoss ? 'N/A' : `+${promoSimulation.requiredLiftPct.toFixed(0)}%`}</p>{!promoSimulation.isLoss && <p className={`text-sm font-bold uppercase mt-1 text-indigo-500`}>Vender {formatNumber(promoSimulation.requiredUnitsBreakEven)} unds</p>}</div>
                      </div>
                      {!promoSimulation.isLoss && (
                          <div className="h-48 w-full mt-auto">
                              <ResponsiveContainer width="100%" height="100%">
                                  <ComposedChart data={promoSimulation.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} /><XAxis dataKey="lift" axisLine={false} tickLine={false} tick={{ fill: t.chartText, fontSize: 10, fontWeight: 600 }} /><YAxis hide /><Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '12px'}} formatter={(val) => formatCurrency(val)} /><Line type="monotone" dataKey="profitOriginal" name="Ganancia Regular Constante" stroke={isDarkMode ? '#64748b' : '#94a3b8'} strokeWidth={3} strokeDasharray="5 5" dot={false} /><Line type="monotone" dataKey="profitPromo" name="Crecimiento con Promo" stroke="#4f46e5" strokeWidth={4} dot={{r: 4, fill: '#4f46e5'}} activeDot={{r: 6}} /></ComposedChart>
                              </ResponsiveContainer>
                          </div>
                      )}
                  </>
              )}
          </div>
      </div>
    </div>
  );

  const renderGmroiTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><DollarSign className="w-6 h-6 text-emerald-500" /> Rentabilidad Estructural & Rotación (GMROI)</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Gross Margin Return on Inventory Investment. Audita cuánto margen bruto genera cada dólar invertido en inventario físico y clasifica el portafolio en cuadrantes de capital.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Store className="w-4 h-4 text-indigo-400" />
            <select className={`bg-transparent border-none text-xs font-bold focus:outline-none ${t.textTitle}`} value={gmroiStoreFilter} onChange={(e) => setGmroiStoreFilter(e.target.value)}>
              <option value="Todas">Todas las Tiendas</option>
              {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Filter className="w-4 h-4 text-emerald-400" />
            <select className={`bg-transparent border-none text-xs font-bold focus:outline-none ${t.textTitle}`} value={gmroiCategoryFilter} onChange={(e) => setGmroiCategoryFilter(e.target.value)}>
              <option value="Todas">Todas las Categorías</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${t.card}`}>
            <Percent className="text-emerald-500 w-4 h-4 shrink-0" />
            <div className="flex flex-col">
              <span className={`text-[9px] font-bold uppercase tracking-wider ${t.textSub}`}>Margen Bruto ({globalMargin}%)</span>
              <input type="range" min="10" max="65" step="1" value={globalMargin} onChange={(e) => setGlobalMargin(Number(e.target.value))} className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-1" />
            </div>
          </div>
          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${t.card}`}>
            <Target className="text-indigo-500 w-4 h-4 shrink-0" />
            <div className="flex flex-col">
              <span className={`text-[9px] font-bold uppercase tracking-wider ${t.textSub}`}>Meta GMROI ({targetGmroiThreshold}x)</span>
              <input type="range" min="1.0" max="6.0" step="0.5" value={targetGmroiThreshold} onChange={(e) => setTargetGmroiThreshold(Number(e.target.value))} className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-1" />
            </div>
          </div>
        </div>
      </div>

      {gmroiAnalysis && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`p-5 rounded-2xl border ${t.card}`}>
              <p className={`text-[10px] uppercase font-bold ${t.textSub}`}>Margen Bruto Total ($)</p>
              <p className="text-2xl font-black mt-1 text-emerald-500">{formatCurrency(gmroiAnalysis.totalMargin)}</p>
              <p className={`text-xs mt-1 ${t.textSub}`}>Sobre {formatCurrency(gmroiAnalysis.totalSales)} en ventas</p>
            </div>
            <div className={`p-5 rounded-2xl border ${t.card}`}>
              <p className={`text-[10px] uppercase font-bold ${t.textSub}`}>Capital Atado en Inventario (Costo)</p>
              <p className={`text-2xl font-black mt-1 ${t.textTitle}`}>{formatCurrency(gmroiAnalysis.totalInvCost)}</p>
              <p className={`text-xs mt-1 ${t.textSub}`}>Valorizado al {100 - globalMargin}% de costo</p>
            </div>
            <div className={`p-5 rounded-2xl border ${t.card}`}>
              <p className={`text-[10px] uppercase font-bold ${t.textSub}`}>Rotación Anual (Inventory Turns)</p>
              <p className="text-2xl font-black mt-1 text-indigo-500">{gmroiAnalysis.globalTurns.toFixed(1)}x <span className="text-xs font-normal">vueltas/año</span></p>
              <p className={`text-xs mt-1 ${t.textSub}`}>Velocidad de renovación de stock</p>
            </div>
            <div className={`p-5 rounded-2xl border border-emerald-500/50 ${isDarkMode ? 'bg-emerald-950/20' : 'bg-emerald-50/50'}`}>
              <p className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>GMROI Global Consolidado</p>
              <p className={`text-3xl font-black mt-1 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>${gmroiAnalysis.globalGmroi.toFixed(2)}</p>
              <p className={`text-xs mt-1 ${t.textSub}`}>Retorno por cada $1.00 en stock</p>
            </div>
          </div>

          {/* Filtros de Cuadrantes de Eficiencia de Capital */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            <button onClick={() => setGmroiQuadrantFilter("Todos")} className={`p-3.5 rounded-xl border text-center transition-all ${gmroiQuadrantFilter === "Todos" ? 'ring-2 ring-indigo-500 bg-indigo-500/10' : t.card}`}>
              <span className={`text-[10px] font-bold uppercase block ${t.textSub}`}>Todos los SKUs</span>
              <span className={`text-xl font-black mt-1 block ${t.textTitle}`}>{gmroiAnalysis.allCount}</span>
            </button>
            {[
              { key: 'Estrella', label: 'Estrellas (Alto Vol + GMROI)', color: 'emerald' },
              { key: 'Alta Eficiencia', label: 'Alta Eficiencia (Joya Nicho)', color: 'blue' },
              { key: 'Generador Tráfico', label: 'Tráfico (Alto Vol / Bajo GMROI)', color: 'amber' },
              { key: 'Capital Lento', label: 'Capital Lento (Bajo Retorno)', color: 'rose' }
            ].map(q => {
              const tone = getToneClasses(q.color, isDarkMode);
              return (
                <button key={q.key} onClick={() => setGmroiQuadrantFilter(gmroiQuadrantFilter === q.key ? "Todos" : q.key)} className={`p-3.5 rounded-xl border text-center transition-all ${gmroiQuadrantFilter === q.key ? 'ring-2 ring-indigo-500 scale-[1.02]' : ''} ${tone.card}`}>
                  <span className={`text-[10px] font-bold uppercase block ${tone.label}`}>{q.label}</span>
                  <span className={`text-xl font-black mt-1 block ${tone.val}`}>{gmroiAnalysis.quadrantCounts[q.key]}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-2xl border lg:col-span-1 transition-colors ${t.card}`}>
              <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${t.textTitle}`}><BarChart3 className="w-5 h-5 text-emerald-500" /> GMROI por Categoría</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gmroiAnalysis.categories} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={t.chartGrid} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={105} tick={{ fill: t.chartText, fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}} contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '8px'}} formatter={(val) => `$${Number(val).toFixed(2)} retorno`} />
                    <Bar dataKey="gmroi" name="GMROI" fill="#10b981" radius={[0, 4, 4, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`overflow-hidden rounded-2xl border transition-colors lg:col-span-2 ${t.tableWrapper}`}>
              <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                <h3 className={`font-black flex items-center gap-2 ${t.textTitle}`}><Database className="w-5 h-5 text-indigo-500" /> Auditoría Financiera por SKU ({gmroiAnalysis.items.length})</h3>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
                    <tr className="text-[10px] uppercase font-black tracking-widest">
                      <th className="px-4 py-4">Producto & Categoría</th>
                      <th className="px-4 py-4 text-right">Margen Bruto</th>
                      <th className="px-4 py-4 text-right">Costo Inv.</th>
                      <th className="px-4 py-4 text-center">Rotación / Sell-Thru</th>
                      <th className="px-4 py-4 text-center">GMROI</th>
                      <th className="px-4 py-4 text-center">Rol Capital</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
                    {gmroiAnalysis.items.slice(0, 100).map((p, index) => (
                      <tr key={`gmroi_${index}`} className={`transition-colors ${t.rowBase}`}>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className={`font-bold text-xs uppercase leading-tight ${t.textTitle}`}>{p.name}</span>
                            <span className={`text-[10px] font-mono mt-0.5 ${t.textSub}`}>UPC: {p.upc || 'N/A'} • {p.category}</span>
                          </div>
                        </td>
                        <td className={`px-4 py-3.5 text-right font-mono font-bold text-xs ${t.textTitle}`}>{formatCurrency(p.grossMargin)}</td>
                        <td className={`px-4 py-3.5 text-right font-mono text-xs ${t.textSub}`}>{formatCurrency(p.invCost)}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`font-mono font-bold text-xs block ${t.textTitle}`}>{p.turns > 50 ? '50+x' : `${p.turns.toFixed(1)}x`}</span>
                          <span className={`text-[10px] font-mono ${t.textSub}`}>{p.sellThrough.toFixed(0)}% sell-thru</span>
                        </td>
                        <td className={`px-4 py-3.5 text-center font-mono font-black text-sm ${p.gmroi >= targetGmroiThreshold ? 'text-emerald-500' : 'text-amber-500'}`}>
                          ${p.gmroi > 90 ? '99.9+' : p.gmroi.toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`text-[9px] uppercase font-black px-2 py-1 rounded-full ${
                            p.quadrant === 'Estrella' ? 'bg-emerald-500/20 text-emerald-500' :
                            p.quadrant === 'Alta Eficiencia' ? 'bg-blue-500/20 text-blue-500' :
                            p.quadrant === 'Generador Tráfico' ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500'
                          }`}>
                            {p.quadrant}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderForecastTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${t.textTitle} flex items-center gap-2`}><LineChart className="w-6 h-6 text-indigo-500" /> Forecasting & Planificación de Demanda (Next Year)</h2>
          <p className={`text-sm mt-1 ${t.textSub}`}>Simulador proyectivo de ingresos y unidades. Combina la inercia histórica de cada SKU con escenarios macroeconómicos e inflación esperada.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Store className="w-4 h-4 text-indigo-400" />
            <select className={`bg-transparent border-none text-xs font-bold focus:outline-none ${t.textTitle}`} value={forecastStoreFilter} onChange={(e) => setForecastStoreFilter(e.target.value)}>
              <option value="Todas">Todas las Tiendas</option>
              {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${t.card}`}>
            <Filter className="w-4 h-4 text-indigo-400" />
            <select className={`bg-transparent border-none text-xs font-bold focus:outline-none ${t.textTitle}`} value={forecastCategoryFilter} onChange={(e) => setForecastCategoryFilter(e.target.value)}>
              <option value="Todas">Todas las Categorías</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Barra de Escenarios Rápidos y Controles Macro */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 ${t.card}`}>
        <div>
          <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${t.textSub}`}>Escenarios Preconfigurados:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Recesión (-10%)', vol: -10, inf: 1 },
              { label: 'Conservador (0%)', vol: 0, inf: 2 },
              { label: 'Crecimiento Moderado (+6%)', vol: 6, inf: 3 },
              { label: 'Expansión Agresiva (+15%)', vol: 15, inf: 4 }
            ].map((sc, i) => (
              <button
                key={i}
                onClick={() => { setMarketAdjustment(sc.vol); setPriceInflationAdj(sc.inf); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${marketAdjustment === sc.vol && priceInflationAdj === sc.inf ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : t.card}`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
          <div className="flex flex-col flex-1 sm:flex-initial">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${t.textSub}`}>Ajuste Volumen Mercado: <strong className={marketAdjustment >= 0 ? 'text-emerald-500' : 'text-rose-500'}>{marketAdjustment >= 0 ? '+' : ''}{marketAdjustment}%</strong></span>
            <input type="range" min="-25" max="25" step="1" value={marketAdjustment} onChange={(e) => setMarketAdjustment(Number(e.target.value))} className="w-40 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2" />
          </div>
          <div className="flex flex-col flex-1 sm:flex-initial">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${t.textSub}`}>Inflación de Precios (AUR): <strong className="text-amber-500">{priceInflationAdj >= 0 ? '+' : ''}{priceInflationAdj}%</strong></span>
            <input type="range" min="-10" max="15" step="1" value={priceInflationAdj} onChange={(e) => setPriceInflationAdj(Number(e.target.value))} className="w-40 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2" />
          </div>
        </div>
      </div>

      {forecastAnalysis && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className={`p-5 rounded-2xl border transition-colors ${t.card}`}>
              <p className={`text-[10px] uppercase font-bold ${t.textSub}`}>Base Actual (Ventas TY)</p>
              <p className={`text-2xl font-black mt-1 ${t.textTitle}`}>{formatCurrency(forecastAnalysis.totalTy)}</p>
              <p className={`text-xs mt-1 ${t.textSub}`}>LY: {formatCurrency(forecastAnalysis.totalLy)}</p>
            </div>
            <div className={`p-5 rounded-2xl border transition-colors border-indigo-500/50 ${isDarkMode ? 'bg-indigo-950/20' : 'bg-indigo-50/50'}`}>
              <p className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>Proyección Esperada (NY)</p>
              <p className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>{formatCurrency(forecastAnalysis.totalNy)}</p>
              <p className={`text-xs mt-1 ${t.textSub}`}>Crec. Total: {forecastAnalysis.globalGrowth >= 0 ? '+' : ''}{forecastAnalysis.globalGrowth.toFixed(1)}%</p>
            </div>
            <div className={`p-5 rounded-2xl border transition-colors ${t.card}`}>
              <p className={`text-[10px] uppercase font-bold ${t.textSub}`}>Variación Neta en Dólares</p>
              <p className={`text-2xl font-black mt-1 ${forecastAnalysis.absoluteDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {forecastAnalysis.absoluteDelta >= 0 ? '+' : ''}{formatCurrency(forecastAnalysis.absoluteDelta)}
              </p>
              <p className={`text-xs mt-1 ${t.textSub}`}>Ingreso incremental estimado</p>
            </div>
            <div className={`p-5 rounded-2xl border transition-colors ${t.card}`}>
              <p className={`text-[10px] uppercase font-bold ${t.textSub}`}>Demanda de Unidades NY</p>
              <p className="text-2xl font-black mt-1 text-amber-500">{formatNumber(forecastAnalysis.totalUnitsNy)} u</p>
              <p className={`text-xs mt-1 ${t.textSub}`}>vs {formatNumber(forecastAnalysis.totalUnitsTy)} u este año</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-2xl border lg:col-span-3 transition-colors ${t.card}`}>
              <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${t.textTitle}`}><BarChart3 className="w-5 h-5 text-indigo-500" /> Evolución de 3 Horizontes por Categoría (LY Pasado vs TY Presente vs NY Futuro)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={forecastAnalysis.categories} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} tick={{ fill: t.chartText, fontWeight: 700 }} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}} contentStyle={{backgroundColor: t.chartTooltipBg, borderColor: t.chartTooltipBorder, color: t.chartTooltipText, borderRadius: '10px'}} formatter={(val) => formatCurrency(val)} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ color: t.chartText }} />
                    <Bar dataKey="ly" name="Año Pasado (LY)" fill={isDarkMode ? '#334155' : '#e2e8f0'} radius={[4, 4, 0, 0]} barSize={28} />
                    <Bar dataKey="ty" name="Año Actual (TY)" fill={isDarkMode ? '#64748b' : '#94a3b8'} radius={[4, 4, 0, 0]} barSize={28} />
                    <Bar dataKey="ny" name="Proyección (NY)" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={28} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`overflow-hidden rounded-2xl border transition-colors lg:col-span-3 ${t.tableWrapper}`}>
              <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                <h3 className={`font-black flex items-center gap-2 ${t.textTitle}`}><Database className="w-5 h-5 text-indigo-500" /> Plan Maestro de Demanda y Stock Sugerido por SKU</h3>
              </div>
              <div className="max-h-[450px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className={`sticky top-0 z-10 border-b transition-colors ${t.tableHeader}`}>
                    <tr className="text-[10px] uppercase font-black tracking-widest">
                      <th className="px-4 py-4">Producto & Categoría</th>
                      <th className="px-4 py-4 text-right">Ventas TY</th>
                      <th className="px-4 py-4 text-right">Forecast NY ($)</th>
                      <th className="px-4 py-4 text-right">Delta ($)</th>
                      <th className="px-4 py-4 text-center">Unidades NY</th>
                      <th className="px-4 py-4 text-center">Stock Base Sugerido (21d)</th>
                      <th className="px-4 py-4 text-center">Variación %</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors ${t.tableDivide}`}>
                    {forecastAnalysis.items.slice(0, 120).map((p, index) => (
                      <tr key={`fore_${index}`} className={`transition-colors ${t.rowBase}`}>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className={`font-bold text-xs uppercase leading-tight ${t.textTitle}`}>{p.name}</span>
                            <span className={`text-[10px] font-mono mt-0.5 ${t.textSub}`}>UPC: {p.upc || 'N/A'} • {p.category}</span>
                          </div>
                        </td>
                        <td className={`px-4 py-3.5 text-right font-mono text-xs ${t.textSub}`}>{formatCurrency(p.ty)}</td>
                        <td className="px-4 py-3.5 text-right font-mono font-black text-xs text-indigo-500">{formatCurrency(p.projectedSales)}</td>
                        <td className={`px-4 py-3.5 text-right font-mono font-bold text-xs ${p.deltaDollars >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {p.deltaDollars >= 0 ? '+' : ''}{formatCurrency(p.deltaDollars)}
                        </td>
                        <td className={`px-4 py-3.5 text-center font-mono text-xs font-bold ${t.textTitle}`}>{formatNumber(p.projectedUnits)}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                            {formatNumber(p.suggestedStock)} unds
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`text-[11px] font-black inline-flex items-center justify-center gap-0.5 px-2 py-0.5 rounded-lg ${p.adjustedGrowth >= 0 ? (isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (isDarkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-100 text-rose-700')}`}>
                            {p.adjustedGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {(Math.abs(p.adjustedGrowth) * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // ============================================================================
  // 4. CONTEXTO COMPARTIDO (`toolContext`) Y REGISTRO CENTRAL (`TOOLS_REGISTRY`)
  // ============================================================================
  // Este objeto `toolContext` se inyecta automáticamente a cualquier herramienta nueva
  // definida en EXTRA_TOOLS_MODULES para que no tengas que pasar props manualmente.
  const toolContext = useMemo(() => ({
    displayProducts,
    storeStats,
    mapData,
    uniqueStores,
    uniqueCategories,
    uniqueSegments,
    uniqueVendors,
    jdaLibrary,
    filterAndConsolidate: (filters) => filterAndConsolidateProducts(displayProducts, filters),
    getRegionAndTownForStore,
    formatCurrency,
    formatNumber,
    t,
    isDarkMode,
    COLORS
  }), [displayProducts, storeStats, mapData, uniqueStores, uniqueCategories, uniqueSegments, uniqueVendors, jdaLibrary, t, isDarkMode]);
  const TOOLS_REGISTRY = [
    // FASE 1: INGESTA & CATÁLOGO MAESTRO
    { id: 'cleaner', code: '1.1', order: 11, label: 'Ingesta & ETL', group: 'DATA', icon: Wand2, iconColor: 'text-indigo-400', render: renderCleanerTab },
    { id: 'inventory', code: '1.2', order: 12, label: 'Catálogo Maestro', group: 'DATA', icon: Package, iconColor: 'text-indigo-400', render: renderInventoryTab },

    // FASE 2: DIAGNÓSTICO EJECUTIVO & DESEMPEÑO (El Puente PVM se inserta como 2.1 automáticamente por `order: 21`)
    { id: 'ranking', code: '2.2', order: 22, label: 'Leaderboard & KPIs', group: 'EXEC', icon: Trophy, iconColor: 'text-amber-500', render: renderRankingTab },
    { id: 'pareto', code: '2.3', order: 23, label: 'Curva Pareto (80/20)', group: 'EXEC', icon: Target, iconColor: 'text-emerald-500', render: renderParetoTab },
    { id: 'health', code: '2.4', order: 24, label: 'Scorecard 360° (Salud)', group: 'EXEC', icon: HeartPulse, iconColor: 'text-rose-500', render: renderHealthTab },

    // FASE 3: INTELIGENCIA TERRITORIAL & TIENDAS
    { id: 'map', code: '3.1', order: 31, label: 'Geografía', group: 'GEO', icon: MapIcon, iconColor: 'text-indigo-400', render: renderMapTab },
    { id: 'stores', code: '3.2', order: 32, label: 'Benchmarking Tiendas', group: 'GEO', icon: MapPin, iconColor: 'text-indigo-400', render: renderStoresTab },
    { id: 'clustering', code: '3.3', order: 33, label: 'Clustering & Tiers (A/B/C)', group: 'GEO', icon: Network, iconColor: 'text-emerald-500', render: renderClusteringTab },

    // FASE 4: REVENUE GROWTH MANAGEMENT (RGM) & FINANZAS
    { id: 'pricing', code: '4.1', order: 41, label: 'Arquitectura Precios (AUR)', group: 'FIN', icon: Tags, iconColor: 'text-amber-500', render: renderPricingTab },
    { id: 'elasticity', code: '4.2', order: 42, label: 'Elasticidad & Price Lab', group: 'FIN', icon: Calculator, iconColor: 'text-emerald-400', render: renderElasticityTab },
    { id: 'promo', code: '4.3', order: 43, label: 'Simulador Promo ROI', group: 'FIN', icon: BadgePercent, iconColor: 'text-indigo-500', render: renderPromoTab },
    { id: 'gmroi', code: '4.4', order: 44, label: 'Retorno Capital (GMROI)', group: 'FIN', icon: DollarSign, iconColor: 'text-emerald-500', render: renderGmroiTab },
    { id: 'forecast', code: '4.5', order: 45, label: 'Proyección S&OP (Forecast)', group: 'FIN', icon: LineChart, iconColor: 'text-indigo-500', render: renderForecastTab },

    // FASE 5: SURTIDO, ABASTECIMIENTO & MACRO-ESPACIO
    { id: 'dos', code: '5.1', order: 51, label: 'Cobertura & Quiebres (DOS)', group: 'MERCH', icon: Activity, iconColor: 'text-rose-500', render: renderDOSTab },
    { id: 'markdowns', code: '5.2', order: 52, label: 'Liquidación & Obsoletos', group: 'MERCH', icon: TrendingDown, iconColor: 'text-rose-500', render: renderMarkdownsTab },
    { id: 'rationalization', code: '5.3', order: 53, label: 'Depuración Surtido (SKU)', group: 'MERCH', icon: Scissors, iconColor: 'text-rose-500', render: renderRationalizationTab },
    { id: 'npi', code: '5.4', order: 54, label: 'Radar Innovación (NPI)', group: 'MERCH', icon: Lightbulb, iconColor: 'text-yellow-500', render: renderNPITab },
    { id: 'space', code: '5.6', order: 56, label: 'Productividad Góndola', group: 'MERCH', icon: LayoutTemplate, iconColor: 'text-indigo-500', render: renderSpaceTab },
    { id: 'adjacency', code: '5.7', order: 57, label: 'Roles & Adyacencias', group: 'MERCH', icon: GitMerge, iconColor: 'text-blue-500', render: renderAdjacencyTab },
    { id: 'seasonality', code: '5.8', order: 58, label: 'Ciclos & Estacionalidad', group: 'MERCH', icon: CalendarDays, iconColor: 'text-purple-500', render: renderSeasonalityTab },

    // MÓDULOS ADICIONALES PLUG & PLAY
    ...EXTRA_TOOLS_MODULES
  ].sort((a, b) => (a.order || 999) - (b.order || 999));

  const visibleTools = activeNavGroup === 'ALL'
    ? TOOLS_REGISTRY
    : TOOLS_REGISTRY.filter(tool => tool.group === activeNavGroup);

  const activeToolIndex = TOOLS_REGISTRY.findIndex(tool => tool.id === activeTab);
  const activeToolObj = activeToolIndex >= 0 ? TOOLS_REGISTRY[activeToolIndex] : TOOLS_REGISTRY[0];
  const prevToolObj = activeToolIndex > 0 ? TOOLS_REGISTRY[activeToolIndex - 1] : null;
  const nextToolObj = activeToolIndex < TOOLS_REGISTRY.length - 1 ? TOOLS_REGISTRY[activeToolIndex + 1] : null;
  const activeGroupMeta = TOOL_GROUPS.find(g => g.id === activeToolObj?.group);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${t.app}`}>
      {/* HEADER */}
      <div className={`pt-6 pb-0 px-4 md:px-8 transition-colors duration-300 ${t.header}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2 tracking-tight">
              RETAIL INTELLIGENCE <span className={t.headerBtnText}>& RGM SUITE</span>
            </h1>
            <p className={`font-medium text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-indigo-200'}`}>
              Arquitectura Ejecutiva de Category Management, Pricing & Supply Chain ({TOOLS_REGISTRY.length} Módulos en Orden Lógico)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-xl transition-all border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-indigo-800 border-indigo-700 text-indigo-200 hover:bg-indigo-700'}`} title="Cambiar Modo">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            <button onClick={() => setShowFileRequirementsModal(true)} className={`p-2.5 rounded-xl transition-all border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-indigo-800 border-indigo-700 text-indigo-100 hover:bg-indigo-700'}`} title="Requerimientos de Data"><Info className="w-5 h-5" /></button>
            <input type="file" accept=".csv, .xlsx, .xls, .psp, .pst, .psg" onChange={handleLibraryUpload} className="hidden" id="library-upload" />
            <label htmlFor="library-upload" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-bold border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-indigo-300 hover:bg-slate-700' : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'} ${!excelLoaded ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {isImportingLibrary ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}<span className="hidden sm:inline">Catálogo JDA</span>
            </label>
            <input type="file" multiple accept=".csv, .xlsx, .xls" onChange={handleFileUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className={`flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-bold shadow-lg shadow-indigo-900/20 border border-indigo-500 ${!excelLoaded ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}Sincronizar Data
            </label>
            <button
              onClick={() => setActiveTab('pdf_executive_report')}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg shadow-red-900/30 border border-red-500"
              title="Ir al Generador de Reporte PDF Ejecutivo"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>
            {uploadedFiles.length > 0 && (
              <button onClick={() => setShowFileManager(true)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-bold border ${isDarkMode ? 'bg-indigo-900/40 border-indigo-800 text-indigo-300 hover:bg-indigo-900/60' : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}>
                <Database className="w-4 h-4" /> Gestor ({uploadedFiles.length})
              </button>
            )}
          </div>
        </div>

        {uploadError && (
          <div className="max-w-7xl mx-auto mt-4 animate-in fade-in slide-in-from-top-2">
            <div className={`border px-4 py-3 rounded-xl flex items-center justify-between shadow-sm ${isDarkMode ? 'bg-rose-950/50 border-rose-900 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
              <div className="flex items-center gap-3"><AlertTriangle className="w-5 h-5 shrink-0" /><span className="text-sm font-bold">{uploadError}</span></div>
              <button onClick={() => setUploadError("")} className="p-1 rounded-lg hover:bg-rose-500/20 transition-colors"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* SELECTOR DE FASES EJECUTIVAS (Ordenado por flujo analítico) */}
        <div className="max-w-7xl mx-auto mt-6 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300/80 mr-1 shrink-0">Fases de Análisis:</span>
          {TOOL_GROUPS.map(grp => {
            const count = grp.id === 'ALL' ? TOOLS_REGISTRY.length : TOOLS_REGISTRY.filter(x => x.group === grp.id).length;
            const isCurrentPhase = activeNavGroup === grp.id || (activeNavGroup === 'ALL' && activeToolObj?.group === grp.id);
            return (
              <button
                key={grp.id}
                onClick={() => {
                  setActiveNavGroup(grp.id);
                  if (grp.id !== 'ALL') {
                    const firstInGroup = TOOLS_REGISTRY.find(tool => tool.group === grp.id);
                    if (firstInGroup && activeToolObj.group !== grp.id) setActiveTab(firstInGroup.id);
                  }
                }}
                title={grp.description}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeNavGroup === grp.id
                    ? 'bg-indigo-500 text-white shadow-md ring-2 ring-indigo-300/30'
                    : isCurrentPhase
                    ? 'bg-indigo-500/30 text-white border border-indigo-400/40'
                    : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                }`}
              >
                <span>{grp.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">{count}</span>
              </button>
            );
          })}
        </div>

        {/* BARRA DINÁMICA DE PESTAÑAS NUMERADAS EN ORDEN LÓGICO */}
        <div className="max-w-7xl mx-auto mt-1 flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {visibleTools.map(tool => {
            const IconComponent = tool.icon;
            const isActive = activeTab === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`flex items-center gap-2 px-3.5 py-3 rounded-t-xl font-bold text-xs transition-all whitespace-nowrap ${
                  isActive ? t.tabActive : t.tabInactive
                }`}
              >
                {tool.code && (
                  <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-500'
                      : 'bg-black/20 text-indigo-300/80'
                  }`}>
                    {tool.code}
                  </span>
                )}
                <IconComponent className={`w-4 h-4 ${tool.iconColor}`} />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BARRA DE SECUENCIA LÓGICA (BREADCRUMB + NAVEGACIÓN PASO A PASO) */}
      <div className={`border-b px-4 md:px-8 py-2.5 transition-colors ${isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200/80'}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-md font-black uppercase tracking-wider text-[10px] bg-indigo-500/15 text-indigo-500">
              {activeGroupMeta?.label || 'Módulo'}
            </span>
            <ChevronRight className={`w-3.5 h-3.5 ${t.textSub}`} />
            <span className={`font-black ${t.textTitle}`}>
              {activeToolObj?.code} — {activeToolObj?.label}
            </span>
            {activeGroupMeta?.description && (
              <span className={`hidden md:inline text-[11px] ${t.textSub}`}>
                • {activeGroupMeta.description}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {prevToolObj && (
              <button
                onClick={() => setActiveTab(prevToolObj.id)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all ${t.cardHover}`}
                title={`Ir a ${prevToolObj.code} ${prevToolObj.label}`}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">{prevToolObj.code}</span> {prevToolObj.label}
              </button>
            )}
            <span className={`text-[10px] font-mono font-bold px-2 ${t.textSub}`}>
              Paso {activeToolIndex + 1} de {TOOLS_REGISTRY.length}
            </span>
            {nextToolObj && (
              <button
                onClick={() => setActiveTab(nextToolObj.id)}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm"
                title={`Siguiente paso lógico: ${nextToolObj.code} ${nextToolObj.label}`}
              >
                <span>Siguiente: {nextToolObj.code} {nextToolObj.label}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RENDERIZADOR AUTOMÁTICO (SOPORTA FUNCIONES `render` Y COMPONENTES AUTÓNOMOS `Component`) */}
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {activeToolObj && (
          activeToolObj.Component
            ? <activeToolObj.Component ctx={toolContext} />
            : activeToolObj.render()
        )}
      </div>
      
      {showFileManager && renderFileManagerModal()}
      {showFileRequirementsModal && renderRequirementsModal()}
    </div>
  );
};

export default App;