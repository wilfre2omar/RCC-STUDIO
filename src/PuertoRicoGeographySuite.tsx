// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Line
} from 'recharts';
import {
  Map as MapIcon, MapPin, Navigation, Store, Layers, Search, X, Sparkles,
  Award, Lightbulb, ShieldCheck, CheckSquare, BarChart3, PieChart as PieChartIcon,
  Users, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Eye, Compass,
  GitMerge, Target, Activity, Plus, Minus, Filter
} from 'lucide-react';
import { PR_MUNICIPALITIES_GEO, PR_HIGHWAYS_GEO } from './prGeoData';

const ORDERED_REGIONS = ['Metro', 'Norte', 'Centro', 'Este', 'Sur', 'Oeste'];

const REGION_PALETTE = {
  Metro: {
    name: 'Metro',
    hexActive: '#4f46e5',
    hexSoftDark: '#1e1b4b',
    hexSoftLight: '#e0e7ff',
    hexStroke: '#818cf8',
    badge: 'bg-indigo-600 text-white',
    dot: 'bg-indigo-500',
    text: 'text-indigo-500'
  },
  Norte: {
    name: 'Norte',
    hexActive: '#0284c7',
    hexSoftDark: '#0c4a6e',
    hexSoftLight: '#e0f2fe',
    hexStroke: '#38bdf8',
    badge: 'bg-sky-600 text-white',
    dot: 'bg-sky-500',
    text: 'text-sky-500'
  },
  Centro: {
    name: 'Centro',
    hexActive: '#d97706',
    hexSoftDark: '#451a03',
    hexSoftLight: '#fef3c7',
    hexStroke: '#fbbf24',
    badge: 'bg-amber-500 text-slate-950',
    dot: 'bg-amber-500',
    text: 'text-amber-500'
  },
  Este: {
    name: 'Este',
    hexActive: '#059669',
    hexSoftDark: '#064e3b',
    hexSoftLight: '#d1fae5',
    hexStroke: '#34d399',
    badge: 'bg-emerald-600 text-white',
    dot: 'bg-emerald-500',
    text: 'text-emerald-500'
  },
  Sur: {
    name: 'Sur',
    hexActive: '#e11d48',
    hexSoftDark: '#4c0519',
    hexSoftLight: '#ffe4e6',
    hexStroke: '#fb7185',
    badge: 'bg-rose-600 text-white',
    dot: 'bg-rose-500',
    text: 'text-rose-500'
  },
  Oeste: {
    name: 'Oeste',
    hexActive: '#7c3aed',
    hexSoftDark: '#2e1065',
    hexSoftLight: '#ede9fe',
    hexStroke: '#a78bfa',
    badge: 'bg-purple-600 text-white',
    dot: 'bg-purple-500',
    text: 'text-purple-500'
  }
};

// Distancia Haversine en kilómetros entre dos municipios de Puerto Rico
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const PuertoRicoGeographySuite = ({
  displayProducts,
  uniqueStores,
  mapData,
  regionalDetails,
  selectedMapRegion,
  setSelectedMapRegion,
  selectedMapTown,
  setSelectedMapTown,
  mapViewMode,
  setMapViewMode,
  mapColorMetric,
  setMapColorMetric,
  mapTownSearch,
  setMapTownSearch,
  mapRegionFilter,
  setMapRegionFilter,
  mapStatusFilter,
  setMapStatusFilter,
  mapTownSort,
  setMapTownSort,
  showStoreTownMapper,
  setShowStoreTownMapper,
  customTownOverrides,
  setCustomTownOverrides,
  getRegionAndTownForStore,
  regionalPanelTab,
  setRegionalPanelTab,
  whiteSpaceCapturePct,
  setWhiteSpaceCapturePct,
  PR_REGIONS,
  PR_ISLAND_GRID,
  REGION_VISUAL_THEME,
  COLORS,
  formatCurrency,
  formatNumber,
  t,
  isDarkMode
}) => {
  // Estados exclusivos del Mapa Geográfico Real de Puerto Rico
  const [hoveredTownName, setHoveredTownName] = useState(null);
  const [showHighways, setShowHighways] = useState(true);
  const [showStoreBubbles, setShowStoreBubbles] = useState(true);
  const [showCatchmentRadius, setShowCatchmentRadius] = useState(true);
  const [catchmentRadiusKm, setCatchmentRadiusKm] = useState(18);
  const [labelDisplayMode, setLabelDisplayMode] = useState('smart'); // 'smart' | 'all' | 'active' | 'none'
  const [mapZoomLevel, setMapZoomLevel] = useState(1);
  const [compareTownA, setCompareTownA] = useState('Bayamón');
  const [compareTownB, setCompareTownB] = useState('Caguas');

  const activeRegions = useMemo(
    () => ORDERED_REGIONS.map(k => mapData.find(r => r.name === k)).filter(Boolean),
    [mapData]
  );
  const unassignedRegion = useMemo(
    () => mapData.find(r => r.name === 'Sin Asignar'),
    [mapData]
  );

  // Consolidar métricas comerciales + demográficas para cada uno de los 78 municipios
  const geoTownsData = useMemo(() => {
    const dict = {};
    const list = [];
    let maxTy = 1;
    let maxSalesPerStore = 1;
    let maxPerCapita = 0.01;
    let maxOpportunityScore = 1;

    PR_MUNICIPALITIES_GEO.forEach(geo => {
      const regObj = mapData.find(r => r.name === geo.region);
      const pData = regObj?.pueblos?.[geo.name];
      const ty = pData ? pData.ty : 0;
      const ly = pData ? pData.ly : 0;
      const units = pData ? pData.units : 0;
      const storeCount = pData ? pData.stores.size : 0;
      const skuCount = pData ? pData.skus.size : 0;
      const storeNames = pData ? Array.from(pData.stores) : [];
      const topCat = pData
        ? Object.entries(pData.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
        : 'N/A';
      const topVendor = pData
        ? Object.entries(pData.vendors).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
        : 'N/A';

      const growth = ly > 0 ? ((ty / ly) - 1) * 100 : ty > 0 ? 100 : 0;
      const salesPerStore = storeCount > 0 ? ty / storeCount : 0;
      const salesPerCapita = geo.pop > 0 ? ty / geo.pop : 0;

      // Poder adquisitivo municipal estimado (Hogares * Ingreso Mediano) y Score de Oportunidad Retail (0 - 100)
      const purchasingPowerMillions = (geo.households * geo.medianIncome) / 1_000_000;
      const popFactor = Math.min(55, (geo.pop / 120000) * 55);
      const incomeFactor = Math.min(35, (geo.medianIncome / 38000) * 35);
      const highwayBonus = geo.corridor.includes('PR-22') || geo.corridor.includes('PR-52') || geo.corridor.includes('PR-2') || geo.corridor.includes('PR-30') ? 10 : 4;
      const marketPotentialScore = Math.min(99, Math.round(popFactor + incomeFactor + highwayBonus));

      // Potencial estimado de ventas anuales si se captura el mercado local
      const estimatedAnnualPotential = Math.round(
        (geo.pop * 4.85) * (geo.medianIncome / 21000)
      );

      if (ty > maxTy) maxTy = ty;
      if (salesPerStore > maxSalesPerStore) maxSalesPerStore = salesPerStore;
      if (salesPerCapita > maxPerCapita) maxPerCapita = salesPerCapita;
      if (marketPotentialScore > maxOpportunityScore) maxOpportunityScore = marketPotentialScore;

      const enriched = {
        ...geo,
        ty,
        ly,
        units,
        storeCount,
        storeNames,
        skuCount,
        topCat,
        topVendor,
        growth,
        salesPerStore,
        salesPerCapita,
        purchasingPowerMillions,
        marketPotentialScore,
        estimatedAnnualPotential,
        categoriesMap: pData?.categories || {}
      };

      dict[geo.name] = enriched;
      list.push(enriched);
    });

    return {
      dict,
      list,
      maxTy,
      maxSalesPerStore,
      maxPerCapita,
      maxOpportunityScore,
      activeTownsCount: list.filter(t => t.ty > 0).length,
      totalIslandPop: list.reduce((s, x) => s + x.pop, 0),
      coveredPop: list.filter(t => t.ty > 0).reduce((s, x) => s + x.pop, 0)
    };
  }, [mapData]);

  // Cálculo del Radio de Influencia Comercial (Catchment Area & Vecinos en X km) cuando hay un pueblo seleccionado
  const catchmentAnalysis = useMemo(() => {
    const centerName = selectedMapTown || hoveredTownName;
    if (!centerName || !geoTownsData.dict[centerName]) return null;
    const center = geoTownsData.dict[centerName];

    const neighbors = geoTownsData.list
      .filter(m => m.name !== center.name)
      .map(m => ({
        ...m,
        distanceKm: getDistanceKm(center.lat, center.lng, m.lat, m.lng)
      }))
      .filter(m => m.distanceKm <= catchmentRadiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const clusterPop = center.pop + neighbors.reduce((s, n) => s + n.pop, 0);
    const clusterSales = center.ty + neighbors.reduce((s, n) => s + n.ty, 0);
    const clusterStores = center.storeCount + neighbors.reduce((s, n) => s + n.storeCount, 0);
    const activeNeighbors = neighbors.filter(n => n.storeCount > 0);

    // En la proyección SVG (~515px por grado), 1 km equivale aprox a 4.65 unidades SVG
    const svgRadius = catchmentRadiusKm * 4.65;

    return {
      center,
      neighbors,
      activeNeighbors,
      clusterPop,
      clusterSales,
      clusterStores,
      svgRadius,
      cannibalizationRisk:
        activeNeighbors.length >= 3
          ? 'Alto (Saturación Cercana)'
          : activeNeighbors.length >= 1
          ? 'Moderado (Coexistencia Regional)'
          : 'Bajo / Territorio Virgen (0 tiendas vecinas)'
    };
  }, [selectedMapTown, hoveredTownName, geoTownsData, catchmentRadiusKm]);

  // ViewBox dinámico del SVG para soportar Zoom a toda la isla o Auto-Enfoque a una Región seleccionada
  const svgViewBox = useMemo(() => {
    if (mapZoomLevel > 1 && (selectedMapTown || (mapRegionFilter && mapRegionFilter !== 'Todas'))) {
      let targetPolys = PR_MUNICIPALITIES_GEO;
      if (selectedMapTown && geoTownsData.dict[selectedMapTown]) {
        const c = geoTownsData.dict[selectedMapTown];
        const w = 1100 / mapZoomLevel;
        const h = 380 / mapZoomLevel;
        const minX = Math.max(0, Math.min(1100 - w, c.cx - w / 2));
        const minY = Math.max(0, Math.min(380 - h, c.cy - h / 2));
        return `${minX.toFixed(0)} ${minY.toFixed(0)} ${w.toFixed(0)} ${h.toFixed(0)}`;
      }
      if (mapRegionFilter !== 'Todas') {
        targetPolys = PR_MUNICIPALITIES_GEO.filter(m => m.region === mapRegionFilter);
        if (targetPolys.length > 0) {
          const avgX = targetPolys.reduce((s, m) => s + m.cx, 0) / targetPolys.length;
          const avgY = targetPolys.reduce((s, m) => s + m.cy, 0) / targetPolys.length;
          const w = 1100 / mapZoomLevel;
          const h = 380 / mapZoomLevel;
          const minX = Math.max(0, Math.min(1100 - w, avgX - w / 2));
          const minY = Math.max(0, Math.min(380 - h, avgY - h / 2));
          return `${minX.toFixed(0)} ${minY.toFixed(0)} ${w.toFixed(0)} ${h.toFixed(0)}`;
        }
      }
    }
    return '0 0 1100 380';
  }, [mapZoomLevel, selectedMapTown, mapRegionFilter, geoTownsData]);

  // Motor de coloración de polígonos SVG según la capa seleccionada
  const getPolygonFillAndStroke = (muni, isSelected, isHovered, isNeighborInRadius) => {
    const regPal = REGION_PALETTE[muni.region] || REGION_PALETTE.Metro;

    if (isSelected) {
      return {
        fill: '#f59e0b',
        stroke: '#ffffff',
        strokeWidth: 2.6,
        textColor: '#0f172a'
      };
    }

    if (isHovered) {
      return {
        fill: '#6366f1',
        stroke: '#fde047',
        strokeWidth: 2.2,
        textColor: '#ffffff'
      };
    }

    // 1. Capa por Región Comercial (6 Regiones)
    if (mapColorMetric === 'region') {
      if (muni.ty > 0) {
        return {
          fill: regPal.hexActive,
          stroke: isNeighborInRadius ? '#fde047' : '#ffffff',
          strokeWidth: isNeighborInRadius ? 1.8 : 1.1,
          textColor: '#ffffff'
        };
      }
      return {
        fill: isDarkMode ? regPal.hexSoftDark : regPal.hexSoftLight,
        stroke: isNeighborInRadius ? '#f59e0b' : regPal.hexStroke,
        strokeWidth: isNeighborInRadius ? 1.5 : 0.75,
        textColor: isDarkMode ? '#cbd5e1' : '#1e293b'
      };
    }

    // 2. Capa de Potencial Demográfico & Poder Adquisitivo (Colorea los 78 pueblos aunque no tengan tienda)
    if (mapColorMetric === 'demographics') {
      const score = muni.marketPotentialScore;
      let fill = '#334155';
      if (score >= 75) fill = '#7c3aed'; // Polo Metropolitano / Alto Poder Adquisitivo
      else if (score >= 58) fill = '#2563eb'; // Cabecera Regional Fuerte
      else if (score >= 45) fill = '#0d9488'; // Mercado Intermedio Atractivo
      else if (score >= 34) fill = '#0284c7'; // Mercado Secundario
      else fill = isDarkMode ? '#1e293b' : '#cbd5e1';

      return {
        fill,
        stroke: muni.ty > 0 ? '#fde047' : (isDarkMode ? '#475569' : '#ffffff'),
        strokeWidth: muni.ty > 0 ? 1.6 : 0.8,
        textColor: score >= 34 || isDarkMode ? '#ffffff' : '#0f172a'
      };
    }

    // Helper para interpolar el gradiente de Heatmap desde Transparente (0%) hasta Azul Profundo (#1e3a8a, 100%) basado en densidad de ventas 'ty'
    if (mapColorMetric === 'heatmap' || mapColorMetric === 'ty') {
      if (muni.ty <= 0) {
        return {
          fill: 'rgba(30, 58, 138, 0)',
          stroke: isNeighborInRadius ? '#f59e0b' : (isDarkMode ? 'rgba(148, 163, 184, 0.35)' : 'rgba(100, 116, 139, 0.45)'),
          strokeWidth: isNeighborInRadius ? 1.5 : 0.8,
          textColor: isDarkMode ? '#94a3b8' : '#475569'
        };
      }
      const densityRatio = Math.max(0.08, Math.min(1, muni.ty / Math.max(1, geoTownsData.maxTy)));
      // Interpola desde azul celeste translúcido hasta Azul Profundo (#1e3a8a -> rgb(30, 58, 138)) con opacidad escalada por 'ty'
      const r = Math.round(96 - densityRatio * (96 - 30));
      const g = Math.round(165 - densityRatio * (165 - 58));
      const b = Math.round(250 - densityRatio * (250 - 138));
      const alpha = Number((0.18 + densityRatio * 0.82).toFixed(2));
      return {
        fill: `rgba(${r}, ${g}, ${b}, ${alpha})`,
        stroke: densityRatio > 0.6 ? '#93c5fd' : '#3b82f6',
        strokeWidth: 0.9 + densityRatio * 0.9,
        textColor: densityRatio > 0.45 || isDarkMode ? '#ffffff' : '#0f172a'
      };
    }

    // Para el resto de métricas de ventas, si el pueblo no tiene ventas aún (White Space)
    if (muni.ty <= 0) {
      return {
        fill: isDarkMode ? '#0f172a' : '#f1f5f9',
        stroke: isNeighborInRadius ? '#f59e0b' : (isDarkMode ? '#334155' : '#cbd5e1'),
        strokeWidth: isNeighborInRadius ? 1.5 : 0.7,
        textColor: isDarkMode ? '#64748b' : '#64748b'
      };
    }

    // 3. Capa Semáforo de Crecimiento YoY (%)
    if (mapColorMetric === 'growth') {
      let fill = '#10b981';
      if (muni.growth >= 15) fill = '#059669';
      else if (muni.growth >= 5) fill = '#10b981';
      else if (muni.growth >= 0) fill = '#34d399';
      else if (muni.growth >= -10) fill = '#f59e0b';
      else fill = '#e11d48';
      return {
        fill,
        stroke: '#ffffff',
        strokeWidth: 1.2,
        textColor: '#ffffff'
      };
    }

    // 4. Capa Gasto Per Cápita ($ Venta / Habitante)
    if (mapColorMetric === 'perCapita') {
      const ratio = Math.min(1, muni.salesPerCapita / Math.max(0.01, geoTownsData.maxPerCapita));
      let fill = '#06b6d4';
      if (ratio >= 0.7) fill = '#c026d3';
      else if (ratio >= 0.45) fill = '#7c3aed';
      else if (ratio >= 0.25) fill = '#4f46e5';
      else fill = '#0284c7';
      return {
        fill,
        stroke: '#ffffff',
        strokeWidth: 1.2,
        textColor: '#ffffff'
      };
    }

    // 5. Capa Productividad por Tienda ($ / Sucursal)
    if (mapColorMetric === 'salesPerStore') {
      const ratio = Math.min(1, muni.salesPerStore / Math.max(1, geoTownsData.maxSalesPerStore));
      let fill = '#38bdf8';
      if (ratio >= 0.75) fill = '#1d4ed8';
      else if (ratio >= 0.5) fill = '#2563eb';
      else if (ratio >= 0.25) fill = '#0284c7';
      return {
        fill,
        stroke: '#ffffff',
        strokeWidth: 1.2,
        textColor: '#ffffff'
      };
    }

    return {
      fill: '#1e3a8a',
      stroke: '#ffffff',
      strokeWidth: 1.2,
      textColor: '#ffffff'
    };
  };

  // Directorio filtrado de los 78 pueblos
  const filteredTownsDirectory = useMemo(() => {
    return geoTownsData.list
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
          twn.corridor.toLowerCase().includes(mapTownSearch.toLowerCase()) ||
          twn.storeNames.some(s => s.toLowerCase().includes(mapTownSearch.toLowerCase()));
        return matchesRegion && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (mapTownSort === 'ty') return b.ty - a.ty || b.marketPotentialScore - a.marketPotentialScore;
        if (mapTownSort === 'growth') return b.growth - a.growth || b.ty - a.ty;
        if (mapTownSort === 'potential') return b.marketPotentialScore - a.marketPotentialScore || b.pop - a.pop;
        return a.name.localeCompare(b.name, 'es');
      });
  }, [geoTownsData, mapRegionFilter, mapStatusFilter, mapTownSearch, mapTownSort]);

  // Ranking Top Oportunidades White Space (Municipios sin tienda ordenados por atractivo demográfico y comercial)
  const whiteSpaceOpportunities = useMemo(() => {
    return geoTownsData.list
      .filter(m => m.ty <= 0 && (mapRegionFilter === 'Todas' || m.region === mapRegionFilter))
      .sort((a, b) => b.marketPotentialScore - a.marketPotentialScore || b.pop - a.pop);
  }, [geoTownsData, mapRegionFilter]);

  const leadingRegion = useMemo(
    () => [...activeRegions].sort((a, b) => b.ty - a.ty)[0],
    [activeRegions]
  );
  const fastestGrowingRegion = useMemo(
    () => [...activeRegions].filter(r => r.ty > 0).sort((a, b) => b.growth - a.growth)[0],
    [activeRegions]
  );

  const hoveredTownObj = hoveredTownName ? geoTownsData.dict[hoveredTownName] : null;
  const townAObj = geoTownsData.dict[compareTownA] || geoTownsData.list[0];
  const townBObj = geoTownsData.dict[compareTownB] || geoTownsData.list[1];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ENCABEZADO PRINCIPAL Y BOTONES ESTRATÉGICOS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500">
              GIS & Trade Area Intelligence • 78 Municipios Oficiales
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">
              Demografía + Red Vial + Canibalización
            </span>
          </div>
          <h2 className={`text-2xl font-black mt-1 ${t.textTitle} flex items-center gap-2`}>
            <MapIcon className="w-6 h-6 text-indigo-500" /> Inteligencia Geográfica de Puerto Rico por Pueblo
          </h2>
          <p className={`text-sm mt-0.5 ${t.textSub}`}>
            Explora el mapa político real de los 78 pueblos con capas térmicas de color, autopistas principales, potencial demográfico, radio de influencia en km y comparador cara a cara.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Asignador Manual de Pueblos */}
          <button
            type="button"
            onClick={() => setShowStoreTownMapper(!showStoreTownMapper)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              showStoreTownMapper
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : t.cardHover
            }`}
          >
            <MapPin className="w-4 h-4 text-amber-500" />
            Vincular Tiendas a Pueblos ({uniqueStores.length})
          </button>
        </div>
      </div>

      {/* BARRA DE MODOS DE VISTA Y CAPAS DE COLOR */}
      <div className={`p-3.5 rounded-2xl border mb-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 ${t.card}`}>
        {/* 5 Vistas Geográficas */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'polygon_map', label: '🗺️ 1. Mapa País por Pueblo (78 Polígonos)' },
            { id: 'island_map', label: '🧭 2. Cuadrícula Isla' },
            { id: 'regions', label: '🏛️ 3. Bento 6 Regiones' },
            { id: 'compare_towns', label: '⚔️ 4. Comparador Pueblos (A vs B)' },
            { id: 'whitespace_radar', label: '🚀 5. Radar Expansión & Demografía' }
          ].map(mode => {
            const isCurrent = (mapViewMode === 'island_map' && mode.id === 'polygon_map' && false) || mapViewMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setMapViewMode(mode.id)}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-md'
                    : isDarkMode
                    ? 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Selector de Capas de Color (Incluye Heatmap Mode: Transparent -> Deep Blue) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-[10px] font-black uppercase tracking-wider mr-1 flex items-center gap-1 ${t.textSub}`}>
            <Layers className="w-3.5 h-3.5 text-indigo-500" /> Colorear Pueblos por:
          </span>
          {[
            { id: 'region', label: '6 Regiones' },
            { id: 'ty', label: '🔥 Heatmap Ventas TY (Azul Profundo)' },
            { id: 'growth', label: 'Semáforo YoY (%)' },
            { id: 'salesPerStore', label: '$/Tienda' },
            { id: 'demographics', label: 'Potencial Demográfico' },
            { id: 'perCapita', label: 'Gasto Per Cápita' }
          ].map(layer => {
            const isLayerActive = mapColorMetric === layer.id || (layer.id === 'ty' && mapColorMetric === 'heatmap');
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setMapColorMetric(layer.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  isLayerActive
                    ? layer.id === 'ty'
                      ? 'bg-[#1e3a8a] text-white shadow-md ring-2 ring-blue-400/50'
                      : 'bg-emerald-600 text-white shadow-sm'
                    : isDarkMode
                    ? 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {layer.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5 TARJETAS KPI TERRITORIALES Y DEMOGRÁFICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
        <div className={`p-4 rounded-2xl border ${t.card}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Región Dominante ($)</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-xl font-black text-indigo-500">
              {leadingRegion?.ty > 0 ? leadingRegion.name : 'Sin Datos'}
            </p>
            {leadingRegion?.ty > 0 && (
              <span className="text-xs font-mono font-bold text-indigo-400">
                {leadingRegion.shareOfIsland.toFixed(1)}% Isla
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 font-mono ${t.textSub}`}>
            {leadingRegion?.ty > 0 ? formatCurrency(leadingRegion.ty) : 'Sube o sincroniza tu Excel/CSV'}
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${t.card}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Líder en Expansión (% YoY)</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-xl font-black text-emerald-500">
              {fastestGrowingRegion ? fastestGrowingRegion.name : 'Sin Datos'}
            </p>
            {fastestGrowingRegion && (
              <span className={`text-xs font-mono font-black ${fastestGrowingRegion.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {fastestGrowingRegion.growth >= 0 ? '+' : ''}{fastestGrowingRegion.growth.toFixed(1)}%
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 ${t.textSub}`}>
            Cat. Líder: {fastestGrowingRegion?.topCategory || 'N/A'}
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${t.card}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Huella Municipal PR</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className={`text-xl font-black ${t.textTitle}`}>
              {geoTownsData.activeTownsCount} / 78 Pueblos
            </p>
            <span className="text-xs font-bold text-emerald-500">
              {((geoTownsData.activeTownsCount / 78) * 100).toFixed(0)}% Isla
            </span>
          </div>
          <p className={`text-xs mt-1 ${t.textSub}`}>
            {78 - geoTownsData.activeTownsCount} municipios White Space disponibles
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${t.card}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Población Cubierta (Censo PR)</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-xl font-black text-sky-500">
              {((geoTownsData.coveredPop / Math.max(1, geoTownsData.totalIslandPop)) * 100).toFixed(1)}%
            </p>
            <span className={`text-xs font-mono font-bold ${t.textSub}`}>
              {(geoTownsData.coveredPop / 1_000_000).toFixed(2)}M hab.
            </span>
          </div>
          <p className={`text-xs mt-1 ${t.textSub}`}>
            De {(geoTownsData.totalIslandPop / 1_000_000).toFixed(2)}M habitantes en los 78 pueblos
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${t.card}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${t.textSub}`}>Top White Space Recomendado</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-xl font-black text-amber-500 truncate">
              {whiteSpaceOpportunities[0]?.name || 'Isla Completa'}
            </p>
            {whiteSpaceOpportunities[0] && (
              <span className="text-xs font-mono font-black text-amber-500">
                Score {whiteSpaceOpportunities[0].marketPotentialScore}/99
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 ${t.textSub}`}>
            {whiteSpaceOpportunities[0]
              ? `${formatNumber(whiteSpaceOpportunities[0].pop)} hab • ${whiteSpaceOpportunities[0].corridor}`
              : 'Todos los municipios cubiertos'}
          </p>
        </div>
      </div>

      {/* PANEL DESPLEGABLE PARA ASIGNAR TIENDAS A CUALQUIERA DE LOS 78 PUEBLOS */}
      {(showStoreTownMapper || unassignedRegion?.storeCount > 0) && uniqueStores.length > 0 && (
        <div className={`p-5 rounded-2xl border mb-6 transition-all ${
          unassignedRegion?.storeCount > 0
            ? isDarkMode ? 'bg-amber-950/20 border-amber-800/60' : 'bg-amber-50/90 border-amber-200'
            : t.card
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${unassignedRegion?.storeCount > 0 ? 'text-amber-500' : 'text-indigo-500'}`}>
                <MapPin className="w-4 h-4" /> Gestor de Ubicación Municipal por Tienda (78 Municipios organizados por Región)
              </h4>
              <p className={`text-xs mt-0.5 ${t.textSub}`}>
                Asigna o corrige el pueblo de cualquier tienda para que su polígono se ilumine en el mapa de Puerto Rico:
              </p>
            </div>
            <button
              onClick={() => setShowStoreTownMapper(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-200 self-end sm:self-auto"
            >
              Ocultar Panel
            </button>
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
                      : isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-200'
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
                    value={detected.town === 'Sin Asignar' ? '' : detected.town}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) setCustomTownOverrides(prev => ({ ...prev, [stName]: val }));
                    }}
                    className={`w-full p-1.5 rounded-lg border text-xs font-bold focus:outline-none cursor-pointer ${t.input}`}
                  >
                    <option value="">-- Seleccionar Pueblo (78) --</option>
                    {ORDERED_REGIONS.map(rKey => (
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

      {/* =========================================================================
          VISTA 4: COMPARADOR CARA A CARA DE MUNICIPIOS (PUEBLO A vs PUEBLO B)
         ========================================================================= */}
      {mapViewMode === 'compare_towns' && (
        <div className={`p-6 rounded-3xl border mb-8 ${t.card}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">
                Benchmarking Municipal Directo (Head-to-Head)
              </span>
              <h3 className={`text-xl font-black mt-0.5 ${t.textTitle}`}>
                Comparador Cara a Cara: {townAObj.name} vs. {townBObj.name}
              </h3>
              <p className={`text-xs ${t.textSub}`}>
                Compara indicadores comerciales, demográficos, corredores viales, gasto per cápita y distancia entre cualquier par de pueblos de Puerto Rico.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                <select
                  value={compareTownA}
                  onChange={(e) => setCompareTownA(e.target.value)}
                  className={`p-2.5 rounded-xl border text-xs font-black focus:outline-none ${t.input}`}
                >
                  {ORDERED_REGIONS.map(rKey => (
                    <optgroup key={rKey} label={`Región ${rKey}`}>
                      {PR_REGIONS[rKey].map(twn => (
                        <option key={twn} value={twn}>{twn} ({rKey})</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <span className={`text-xs font-black px-2 py-1 rounded-lg ${isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'}`}>
                VS ({getDistanceKm(townAObj.lat, townAObj.lng, townBObj.lat, townBObj.lng).toFixed(1)} km)
              </span>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                <select
                  value={compareTownB}
                  onChange={(e) => setCompareTownB(e.target.value)}
                  className={`p-2.5 rounded-xl border text-xs font-black focus:outline-none ${t.input}`}
                >
                  {ORDERED_REGIONS.map(rKey => (
                    <optgroup key={rKey} label={`Región ${rKey}`}>
                      {PR_REGIONS[rKey].map(twn => (
                        <option key={twn} value={twn}>{twn} ({rKey})</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Tarjeta Pueblo A */}
            <div className={`lg:col-span-4 p-5 rounded-2xl border-2 border-indigo-500/40 ${isDarkMode ? 'bg-indigo-950/20' : 'bg-indigo-50/40'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${REGION_PALETTE[townAObj.region]?.badge}`}>
                    Región {townAObj.region}
                  </span>
                  <h4 className={`text-2xl font-black mt-1 ${t.textTitle}`}>{townAObj.name}</h4>
                  <p className={`text-xs ${t.textSub}`}>{townAObj.hub} • {townAObj.corridor}</p>
                </div>
                <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-indigo-600 text-white">
                  Score {townAObj.marketPotentialScore}/99
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-indigo-500/20 text-xs">
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${t.textSub}`}>Ventas TY</span>
                  <span className={`text-base font-mono font-black ${t.textTitle}`}>{formatCurrency(townAObj.ty)}</span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${t.textSub}`}>Crecimiento YoY</span>
                  <span className={`text-base font-mono font-black ${townAObj.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {townAObj.growth >= 0 ? '+' : ''}{townAObj.growth.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${t.textSub}`}>Población / Hogares</span>
                  <span className={`font-mono font-bold ${t.textTitle}`}>
                    {formatNumber(townAObj.pop)} ({formatNumber(townAObj.households)} hog)
                  </span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${t.textSub}`}>Ingreso Mediano</span>
                  <span className={`font-mono font-bold ${t.textTitle}`}>{formatCurrency(townAObj.medianIncome)}</span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${t.textSub}`}>Poder Adquisitivo</span>
                  <span className="font-mono font-black text-indigo-500">${townAObj.purchasingPowerMillions.toFixed(0)}M / año</span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${t.textSub}`}>Gasto Per Cápita</span>
                  <span className="font-mono font-black text-emerald-500">{formatCurrency(townAObj.salesPerCapita)}/hab</span>
                </div>
              </div>
            </div>

            {/* Barras Comparativas Centrales */}
            <div className="lg:col-span-4 space-y-3.5">
              {[
                { label: 'Ventas Actuales TY ($)', a: townAObj.ty, b: townBObj.ty, fmt: formatCurrency },
                { label: 'Población Municipal (Hab)', a: townAObj.pop, b: townBObj.pop, fmt: formatNumber },
                { label: 'Ingreso Familiar Mediano ($)', a: townAObj.medianIncome, b: townBObj.medianIncome, fmt: formatCurrency },
                { label: 'Poder de Compra Total ($M)', a: townAObj.purchasingPowerMillions, b: townBObj.purchasingPowerMillions, fmt: (v) => `$${v.toFixed(0)}M` },
                { label: 'Potencial Estimado Anual ($)', a: townAObj.estimatedAnnualPotential, b: townBObj.estimatedAnnualPotential, fmt: formatCurrency }
              ].map((row, idx) => {
                const total = Math.max(1, row.a + row.b);
                const pctA = (row.a / total) * 100;
                const pctB = (row.b / total) * 100;
                return (
                  <div key={idx} className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="text-indigo-500 font-mono">{row.fmt(row.a)}</span>
                      <span className={`uppercase text-[10px] font-black ${t.textSub}`}>{row.label}</span>
                      <span className="text-emerald-500 font-mono">{row.fmt(row.b)}</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
                      <div className="h-full bg-indigo-600 transition-all" style={{ width: `${pctA}%` }}></div>
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pctB}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tarjeta Pueblo B */}
            <div className={`lg:col-span-4 p-5 rounded-2xl border-2 border-emerald-500/40 ${isDarkMode ? 'bg-emerald-950/20' : 'bg-emerald-50/40'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${REGION_PALETTE[townBObj.region]?.badge}`}>
                    Región {townBObj.region}
                  </span>
                  <h4 className={`text-2xl font-black mt-1 ${t.textTitle}`}>{townBObj.name}</h4>
                  <p className={`text-xs ${t.textSub}`}>{townBObj.hub} • {townBObj.corridor}</p>
                </div>
                <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-emerald-600 text-white">
                  Score {townBObj.marketPotentialScore}/99
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-emerald-500/20 text-xs">
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${t.textSub}`}>Ventas TY</span>
                  <span className={`text-base font-mono font-black ${t.textTitle}`}>{formatCurrency(townBObj.ty)}</span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${t.textSub}`}>Crecimiento YoY</span>
                  <span className={`text-base font-mono font-black ${townBObj.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {townBObj.growth >= 0 ? '+' : ''}{townBObj.growth.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${t.textSub}`}>Población / Hogares</span>
                  <span className={`font-mono font-bold ${t.textTitle}`}>
                    {formatNumber(townBObj.pop)} ({formatNumber(townBObj.households)} hog)
                  </span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${t.textSub}`}>Ingreso Mediano</span>
                  <span className={`font-mono font-bold ${t.textTitle}`}>{formatCurrency(townBObj.medianIncome)}</span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${t.textSub}`}>Poder Adquisitivo</span>
                  <span className="font-mono font-black text-indigo-500">${townBObj.purchasingPowerMillions.toFixed(0)}M / año</span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${t.textSub}`}>Gasto Per Cápita</span>
                  <span className="font-mono font-black text-emerald-500">{formatCurrency(townBObj.salesPerCapita)}/hab</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VISTA 5: RADAR DE EXPANSIÓN WHITE SPACE & ATRACTIVO DEMOGRÁFICO
         ========================================================================= */}
      {mapViewMode === 'whitespace_radar' && (
        <div className={`p-6 rounded-3xl border mb-8 ${t.card}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block">
                Algoritmo de Expansión Comercial en Puerto Rico
              </span>
              <h3 className={`text-xl font-black mt-0.5 ${t.textTitle}`}>
                Ranking de Municipios White Space con Mayor Poder Adquisitivo y Población
              </h3>
              <p className={`text-xs ${t.textSub}`}>
                Identifica en qué pueblos de Puerto Rico aún no tienes ventas registradas pero existe alta densidad de hogares, ingreso mediano y conectividad vial.
              </p>
            </div>
            <button
              onClick={() => setMapViewMode('polygon_map')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-500 transition-colors"
            >
              Ver en Mapa Geográfico →
            </button>
          </div>

          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className={`sticky top-0 z-10 ${t.tableHeader}`}>
                <tr className="text-[10px] uppercase font-black tracking-widest">
                  <th className="px-4 py-3 text-center"># Prioridad</th>
                  <th className="px-4 py-3">Municipio & Región</th>
                  <th className="px-4 py-3">Corredor Vial & Polo</th>
                  <th className="px-4 py-3 text-right">Población (Hogares)</th>
                  <th className="px-4 py-3 text-right">Ingreso Mediano</th>
                  <th className="px-4 py-3 text-right">Poder Compra ($M)</th>
                  <th className="px-4 py-3 text-center">Score Oportunidad</th>
                  <th className="px-4 py-3 text-right">Potencial Venta Est.</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${t.tableDivide}`}>
                {whiteSpaceOpportunities.slice(0, 30).map((m, idx) => (
                  <tr
                    key={m.name}
                    onClick={() => {
                      setSelectedMapRegion(m.region);
                      setSelectedMapTown(m.name);
                      setMapViewMode('polygon_map');
                    }}
                    className={`cursor-pointer transition-colors ${t.rowBase}`}
                  >
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                        idx < 5 ? 'bg-amber-500 text-slate-950' : 'bg-slate-500/15 text-slate-400'
                      }`}>
                        Top #{idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-black text-xs block ${t.textTitle}`}>{m.name}</span>
                      <span className={`text-[10px] font-bold ${REGION_PALETTE[m.region]?.text}`}>
                        Región {m.region}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold block ${t.textTitle}`}>{m.corridor}</span>
                      <span className={`text-[10px] ${t.textSub}`}>{m.hub}</span>
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${t.textTitle}`}>
                      {formatNumber(m.pop)} <span className={`text-[10px] ${t.textSub}`}>({formatNumber(m.households)} hog)</span>
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${t.textTitle}`}>
                      {formatCurrency(m.medianIncome)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black text-indigo-500">
                      ${m.purchasingPowerMillions.toFixed(0)}M
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-1 rounded-lg font-mono font-black text-xs bg-emerald-500/15 text-emerald-500">
                        {m.marketPotentialScore} / 99
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black text-emerald-500">
                      +{formatCurrency(m.estimatedAnnualPotential)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SPLIT-SCREEN PRINCIPAL: MAPA DEL PAÍS POR PUEBLO (7 COLS) + INSPECTOR (5 COLS)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA (7 COLS): LIENZO CARTOGRÁFICO DE PUERTO RICO (#map-view-container) */}
        <div
          id="map-view-container"
          className={`lg:col-span-7 rounded-3xl border overflow-hidden shadow-xl transition-colors flex flex-col ${
            isDarkMode
              ? 'bg-[#06101e] border-slate-800'
              : 'bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-50/50 border-sky-200'
          }`}
        >
          {/* Barra Superior del Mapa: Estado + Filtro de las 6 Regiones + Toggles de Capas */}
          <div className={`px-4 py-3 border-b flex flex-col gap-2.5 ${
            isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-300' : 'bg-white/95 border-sky-100 text-slate-700'
          }`}>
            <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-black uppercase tracking-wider">
                  {selectedMapTown
                    ? `Municipio Activo: ${selectedMapTown} (Región ${selectedMapRegion}) • Radio ${catchmentRadiusKm}km`
                    : selectedMapRegion
                    ? `Región Enfocada: ${selectedMapRegion} (${PR_REGIONS[selectedMapRegion]?.length || 0} Pueblos)`
                    : 'Mapa Oficial de Puerto Rico • 78 Municipios + Vieques & Culebra'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Controles de Zoom del Mapa Vectorial */}
                <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded-lg">
                  <span className="text-[10px] font-bold px-1">Zoom:</span>
                  {[1, 1.6, 2.3].map(z => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setMapZoomLevel(z)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                        mapZoomLevel === z ? 'bg-indigo-600 text-white' : ''
                      }`}
                    >
                      {z}x
                    </button>
                  ))}
                </div>

                {(selectedMapRegion || selectedMapTown || mapRegionFilter !== 'Todas') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMapRegion(null);
                      setSelectedMapTown(null);
                      setMapRegionFilter('Todas');
                      setMapZoomLevel(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-500 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <X className="w-3 h-3" /> Reset Isla (78)
                  </button>
                )}
              </div>
            </div>

            {/* Chips de las 6 Regiones para Enfocar/Filtrar en Vivo */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-[10px] font-black uppercase tracking-wider mr-1 ${t.textSub}`}>Región:</span>
              <button
                type="button"
                onClick={() => {
                  setMapRegionFilter('Todas');
                  setSelectedMapRegion(null);
                  setSelectedMapTown(null);
                  setMapZoomLevel(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                  mapRegionFilter === 'Todas' && !selectedMapRegion
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Toda la Isla (78)
              </button>
              {ORDERED_REGIONS.map(rKey => {
                const rPal = REGION_PALETTE[rKey];
                const isFocused = mapRegionFilter === rKey || selectedMapRegion === rKey;
                const regData = activeRegions.find(r => r.name === rKey);
                return (
                  <button
                    key={rKey}
                    type="button"
                    onClick={() => {
                      const nextReg = mapRegionFilter === rKey ? 'Todas' : rKey;
                      setMapRegionFilter(nextReg);
                      setSelectedMapTown(null);
                      setSelectedMapRegion(nextReg === 'Todas' ? null : rKey);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1.5 border ${
                      isFocused
                        ? `${rPal.badge} border-transparent shadow-md scale-[1.03]`
                        : isDarkMode
                        ? 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isFocused ? 'bg-white' : rPal.dot}`}></span>
                    <span>{rKey} ({PR_REGIONS[rKey].length})</span>
                    {regData?.storeCount > 0 && (
                      <span className="text-[9px] font-mono opacity-90">• {regData.storeCount}t</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =====================================================================
              MODO 1 (POR DEFECTO): MAPA VECTORIAL POLÍTICO REAL DE LOS 78 PUEBLOS
             ===================================================================== */}
          {(mapViewMode === 'polygon_map' || mapViewMode === 'compare_towns' || mapViewMode === 'whitespace_radar') && (
            <div className="p-3 sm:p-4 flex flex-col gap-3 relative">
              {/* Barra de Búsqueda + Capas Superpuestas (Autopistas, Pines, Nombres, Radio km) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border flex-1 ${t.card}`}>
                  <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Buscar pueblo o autopista en el mapa (ej. Naranjito, Caguas, Ponce, PR-22)..."
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

                {/* Toggles de Capas Superpuestas sobre el Mapa SVG */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMapColorMetric(mapColorMetric === 'ty' || mapColorMetric === 'heatmap' ? 'region' : 'ty')}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black transition-all flex items-center gap-1 ${
                      mapColorMetric === 'ty' || mapColorMetric === 'heatmap'
                        ? 'bg-[#1e3a8a] text-white border-blue-400 shadow-md ring-2 ring-blue-500/30'
                        : t.card
                    }`}
                    title="Activar/Desactivar Heatmap Mode basado en densidad de ventas TY (Transparente a Azul Profundo)"
                  >
                    🌊 Heatmap Mode (TY)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowHighways(!showHighways)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black transition-all ${
                      showHighways
                        ? 'bg-sky-600 text-white border-sky-500'
                        : t.card
                    }`}
                    title="Mostrar/Ocultar Autopistas PR-22, PR-52, PR-2, PR-30, PR-66 y PR-10"
                  >
                    🛣️ Autopistas PR
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowStoreBubbles(!showStoreBubbles)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black transition-all ${
                      showStoreBubbles
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : t.card
                    }`}
                  >
                    📍 Pines Ventas
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCatchmentRadius(!showCatchmentRadius)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black transition-all ${
                      showCatchmentRadius
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : t.card
                    }`}
                  >
                    🎯 Radio ({catchmentRadiusKm}km)
                  </button>

                  <select
                    value={labelDisplayMode}
                    onChange={(e) => setLabelDisplayMode(e.target.value)}
                    className={`px-2 py-1.5 rounded-xl border text-[10px] font-black focus:outline-none ${t.card} ${t.textTitle}`}
                  >
                    <option value="smart">Etiquetas: Inteligente</option>
                    <option value="active">Etiquetas: Con Tienda</option>
                    <option value="all">Etiquetas: Los 78 Pueblos</option>
                    <option value="none">Etiquetas: Ocultar</option>
                  </select>
                </div>
              </div>

              {/* LIENZO SVG DEL MAPA DE PUERTO RICO POR PUEBLO (78 POLÍGONOS REALES) */}
              <div className={`rounded-2xl border relative overflow-hidden select-none ${
                isDarkMode
                  ? 'bg-gradient-to-b from-[#040d1a] via-[#07162c] to-[#040d1a] border-sky-900/50'
                  : 'bg-gradient-to-b from-sky-200/70 via-sky-100/80 to-cyan-200/60 border-sky-300/80'
              }`}>
                {/* Etiquetas Oceánicas y Rosa de los Vientos */}
                <div className="absolute top-2.5 left-4 z-10 pointer-events-none flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-400 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.28em] text-sky-500/80 dark:text-sky-300/70">
                    Océano Atlántico • Costa Norte
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-4 z-10 pointer-events-none">
                  <span className="text-[9px] font-black uppercase tracking-[0.28em] text-sky-600/80 dark:text-sky-300/70">
                    Mar Caribe • Costa Sur
                  </span>
                </div>
                <div className="absolute top-2.5 right-4 z-10 pointer-events-none text-right">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/30 text-white backdrop-blur-sm">
                    Islas Municipio: Vieques & Culebra →
                  </span>
                </div>

                {/* TOOLTIP FLOTANTE EN VIVO AL PASAR EL CURSOR POR UN PUEBLO */}
                {hoveredTownObj && (
                  <div className={`absolute bottom-3 right-3 z-30 p-3.5 rounded-2xl border shadow-2xl pointer-events-none min-w-[250px] backdrop-blur-md transition-all ${
                    isDarkMode
                      ? 'bg-slate-900/95 border-indigo-500/60 text-white'
                      : 'bg-white/95 border-indigo-300 text-slate-900'
                  }`}>
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-500/20">
                      <div>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${REGION_PALETTE[hoveredTownObj.region]?.badge}`}>
                          Región {hoveredTownObj.region}
                        </span>
                        <h5 className="font-black text-sm mt-0.5">{hoveredTownObj.name}</h5>
                      </div>
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                        hoveredTownObj.ty > 0
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {hoveredTownObj.ty > 0 ? `${hoveredTownObj.storeCount} Tienda(s)` : 'White Space'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                      <div>
                        <span className="text-[9px] uppercase opacity-70 block">Ventas TY</span>
                        <span className="font-mono font-black text-indigo-400">
                          {formatCurrency(hoveredTownObj.ty)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase opacity-70 block">Crecimiento YoY</span>
                        <span className={`font-mono font-black ${hoveredTownObj.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {hoveredTownObj.ty > 0 ? `${hoveredTownObj.growth >= 0 ? '+' : ''}${hoveredTownObj.growth.toFixed(1)}%` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase opacity-70 block">Población Censo</span>
                        <span className="font-mono font-bold">{formatNumber(hoveredTownObj.pop)} hab</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase opacity-70 block">Ingreso Mediano</span>
                        <span className="font-mono font-bold">{formatCurrency(hoveredTownObj.medianIncome)}</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-500/20 flex justify-between items-center text-[10px]">
                      <span className="opacity-80 truncate max-w-[160px]">🛣️ {hoveredTownObj.corridor}</span>
                      <span className="font-mono font-black text-amber-400">
                        Score: {hoveredTownObj.marketPotentialScore}/99
                      </span>
                    </div>
                  </div>
                )}

                {/* SVG VECTORIAL DE LOS 78 MUNICIPIOS DE PUERTO RICO */}
                <svg
                  viewBox={svgViewBox}
                  className="w-full h-[350px] sm:h-[410px] transition-all duration-500"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <filter id="pr-drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.35" />
                    </filter>
                    <radialGradient id="catchment-grad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
                      <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </radialGradient>
                    <radialGradient id="ty-heatmap-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.88" />
                      <stop offset="55%" stopColor="#2563eb" stopOpacity="0.42" />
                      <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.0" />
                    </radialGradient>
                  </defs>

                  {/* Grupo Principal con Sombra de Isla */}
                  <g filter="url(#pr-drop-shadow)">
                    {geoTownsData.list.map(muni => {
                      const isSelected = selectedMapTown === muni.name;
                      const isHovered = hoveredTownName === muni.name;
                      const isNeighborInRadius =
                        showCatchmentRadius &&
                        catchmentAnalysis?.neighbors?.some(n => n.name === muni.name);

                      const isRegionFocused =
                        (mapRegionFilter === 'Todas' && !selectedMapRegion) ||
                        mapRegionFilter === muni.region ||
                        selectedMapRegion === muni.region;

                      const matchesSearch =
                        mapTownSearch &&
                        (muni.name.toLowerCase().includes(mapTownSearch.toLowerCase()) ||
                          muni.corridor.toLowerCase().includes(mapTownSearch.toLowerCase()));

                      const isDimmed =
                        (!isRegionFocused && !isNeighborInRadius && !isSelected) ||
                        (mapTownSearch && !matchesSearch);

                      const styleObj = getPolygonFillAndStroke(
                        muni,
                        isSelected,
                        isHovered,
                        isNeighborInRadius
                      );

                      return (
                        <path
                          key={muni.id}
                          d={muni.path}
                          fill={styleObj.fill}
                          stroke={matchesSearch ? '#fde047' : styleObj.stroke}
                          strokeWidth={matchesSearch ? 2.6 : styleObj.strokeWidth}
                          strokeLinejoin="round"
                          className="cursor-pointer transition-all duration-300"
                          style={{
                            opacity: isDimmed ? 0.25 : 1
                          }}
                          onMouseEnter={() => setHoveredTownName(muni.name)}
                          onMouseLeave={() => setHoveredTownName(null)}
                          onClick={() => {
                            setSelectedMapRegion(muni.region);
                            setSelectedMapTown(isSelected ? null : muni.name);
                          }}
                        />
                      );
                    })}
                  </g>

                  {/* HALO DE DENSIDAD TÉRMICA EN MODO HEATMAP (Transparente -> Azul Profundo) */}
                  {(mapColorMetric === 'ty' || mapColorMetric === 'heatmap') && (
                    <g className="pointer-events-none">
                      {geoTownsData.list
                        .filter(m => m.ty > 0)
                        .map(m => {
                          const density = Math.min(1, m.ty / Math.max(1, geoTownsData.maxTy));
                          const glowRadius = 14 + density * 28;
                          return (
                            <circle
                              key={`heat_glow_${m.name}`}
                              cx={m.cx}
                              cy={m.cy}
                              r={glowRadius}
                              fill="url(#ty-heatmap-glow)"
                              opacity={0.25 + density * 0.65}
                            />
                          );
                        })}
                    </g>
                  )}

                  {/* CAPA SUPERPUESTA 1: AUTOPISTAS Y CORREDORES COMERCIALES DE PR */}
                  {showHighways && (
                    <g className="pointer-events-none">
                      {PR_HIGHWAYS_GEO.map(hw => (
                        <g key={hw.id}>
                          <path
                            d={hw.d}
                            fill="none"
                            stroke="#0f172a"
                            strokeWidth="3.6"
                            strokeLinecap="round"
                            opacity="0.55"
                          />
                          <path
                            d={hw.d}
                            fill="none"
                            stroke={hw.color}
                            strokeWidth="2.1"
                            strokeDasharray="6 3"
                            strokeLinecap="round"
                          />
                          <rect
                            x={hw.labelX - 16}
                            y={hw.labelY - 7}
                            width="32"
                            height="13"
                            rx="3.5"
                            fill="#0f172a"
                            stroke={hw.color}
                            strokeWidth="1"
                          />
                          <text
                            x={hw.labelX}
                            y={hw.labelY + 2.2}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="7.2"
                            fontWeight="900"
                          >
                            {hw.id}
                          </text>
                        </g>
                      ))}
                    </g>
                  )}

                  {/* CAPA SUPERPUESTA 2: ANILLO DE RADIO DE INFLUENCIA Y CANIBALIZACIÓN (KM) */}
                  {showCatchmentRadius && catchmentAnalysis && (
                    <g className="pointer-events-none">
                      <circle
                        cx={catchmentAnalysis.center.cx}
                        cy={catchmentAnalysis.center.cy}
                        r={catchmentAnalysis.svgRadius}
                        fill="url(#catchment-grad)"
                        stroke="#fbbf24"
                        strokeWidth="1.6"
                        strokeDasharray="5 4"
                      />
                      {/* Líneas de conexión a los municipios vecinos dentro del radio */}
                      {catchmentAnalysis.neighbors.map(nb => (
                        <line
                          key={`line_${nb.name}`}
                          x1={catchmentAnalysis.center.cx}
                          y1={catchmentAnalysis.center.cy}
                          x2={nb.cx}
                          y2={nb.cy}
                          stroke="#fbbf24"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                          opacity="0.75"
                        />
                      ))}
                    </g>
                  )}

                  {/* CAPA SUPERPUESTA 3: BURBUJAS Y PINES DE VENTAS SOBRE PUEBLOS ACTIVOS */}
                  {showStoreBubbles && (
                    <g className="pointer-events-none">
                      {geoTownsData.list
                        .filter(m => m.ty > 0)
                        .map(m => {
                          const ratio = Math.min(1, m.ty / Math.max(1, geoTownsData.maxTy));
                          const radius = 3.8 + ratio * 7.5;
                          return (
                            <g key={`bubble_${m.name}`}>
                              <circle
                                cx={m.cx}
                                cy={m.cy}
                                r={radius + 2.5}
                                fill="#10b981"
                                opacity="0.28"
                              />
                              <circle
                                cx={m.cx}
                                cy={m.cy}
                                r={radius}
                                fill="#10b981"
                                stroke="#ffffff"
                                strokeWidth="1.4"
                              />
                            </g>
                          );
                        })}
                    </g>
                  )}

                  {/* CAPA SUPERPUESTA 4: ETIQUETAS DE NOMBRES Y VENTAS DE LOS MUNICIPIOS */}
                  {labelDisplayMode !== 'none' && (
                    <g className="pointer-events-none">
                      {geoTownsData.list.map(m => {
                        const isSelected = selectedMapTown === m.name;
                        const isHovered = hoveredTownName === m.name;
                        const isFocusedReg =
                          mapRegionFilter !== 'Todas' && mapRegionFilter === m.region;

                        const showThisLabel =
                          isSelected ||
                          isHovered ||
                          labelDisplayMode === 'all' ||
                          (labelDisplayMode === 'active' && m.ty > 0) ||
                          (labelDisplayMode === 'smart' &&
                            (m.ty > 0 || isFocusedReg || m.pop >= 42000 || m.name === 'Naranjito' || m.name === 'Vieques' || m.name === 'Culebra'));

                        if (!showThisLabel) return null;

                        return (
                          <g key={`lbl_${m.name}`}>
                            <text
                              x={m.cx}
                              y={m.cy - (m.ty > 0 ? 5 : 0)}
                              textAnchor="middle"
                              fill="#ffffff"
                              stroke="#0f172a"
                              strokeWidth="2.4"
                              paintOrder="stroke"
                              fontSize={isSelected || isHovered ? '9.5' : labelDisplayMode === 'all' ? '6.4' : '7.5'}
                              fontWeight="900"
                            >
                              {m.name}
                            </text>
                            {m.ty > 0 && (
                              <text
                                x={m.cx}
                                y={m.cy + 7.5}
                                textAnchor="middle"
                                fill="#fde047"
                                stroke="#0f172a"
                                strokeWidth="2.2"
                                paintOrder="stroke"
                                fontSize="6.8"
                                fontWeight="900"
                              >
                                {m.ty >= 1000 ? `$${(m.ty / 1000).toFixed(0)}k` : formatCurrency(m.ty)}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  )}
                </svg>
              </div>

              {/* BARRA INFERIOR DE RADIO DE COBERTURA Y CANIBALIZACIÓN (CATCHMENT AREA) */}
              {catchmentAnalysis && (
                <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isDarkMode ? 'bg-slate-900/90 border-amber-500/30' : 'bg-amber-50/70 border-amber-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block">
                        Área de Influencia ({catchmentRadiusKm} km alrededor de {catchmentAnalysis.center.name})
                      </span>
                      <p className={`text-xs font-bold ${t.textTitle}`}>
                        Abarca <strong>{catchmentAnalysis.neighbors.length + 1} pueblos</strong> ({formatNumber(catchmentAnalysis.clusterPop)} hab.) • Ventas Cluster: <strong className="text-emerald-500">{formatCurrency(catchmentAnalysis.clusterSales)}</strong> ({catchmentAnalysis.clusterStores} tiendas)
                      </p>
                      <p className={`text-[10px] ${t.textSub}`}>
                        Pueblos vecinos en radio: {catchmentAnalysis.neighbors.map(n => `${n.name} (${n.distanceKm.toFixed(0)}km)`).join(', ') || 'Ninguno en este radio'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <span className={`text-[10px] font-bold ${t.textSub}`}>Radio:</span>
                    {[12, 18, 25, 35].map(km => (
                      <button
                        key={km}
                        type="button"
                        onClick={() => setCatchmentRadiusKm(km)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black border ${
                          catchmentRadiusKm === km
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : t.card
                        }`}
                      >
                        {km}km
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              MODO 2: CUADRÍCULA CARTOGRÁFICA (MOSAICO 78 PUEBLOS)
             ===================================================================== */}
          {mapViewMode === 'island_map' && (
            <div className="p-3 sm:p-5 flex flex-col gap-3">
              <div className={`rounded-2xl border p-3 sm:p-4 overflow-x-auto ${
                isDarkMode
                  ? 'bg-gradient-to-b from-slate-950 via-[#0a192f] to-slate-950 border-sky-900/40'
                  : 'bg-gradient-to-b from-sky-100/80 via-sky-50 to-cyan-100/70 border-sky-200/80'
              }`}>
                <div className="text-center text-[9px] font-black uppercase tracking-[0.35em] text-sky-500/70 mb-2">
                  🌊 Océano Atlántico • Cuadrícula Cartográfica de los 78 Municipios 🌊
                </div>
                <div className="min-w-[760px] space-y-1.5">
                  {PR_ISLAND_GRID.map((rowTowns, rowIdx) => (
                    <div
                      key={`grid_r_${rowIdx}`}
                      className="grid gap-1 items-stretch"
                      style={{ gridTemplateColumns: 'repeat(17, minmax(0, 1fr))' }}
                    >
                      {rowTowns.map((townName, colIdx) => {
                        if (!townName) return <div key={`empty_${rowIdx}_${colIdx}`} />;
                        const tStat = geoTownsData.dict[townName];
                        const isSelected = selectedMapTown === townName;
                        const styleObj = getPolygonFillAndStroke(tStat, isSelected, false, false);
                        return (
                          <button
                            key={townName}
                            type="button"
                            onClick={() => {
                              setSelectedMapRegion(tStat?.region || 'Metro');
                              setSelectedMapTown(isSelected ? null : townName);
                            }}
                            style={{ backgroundColor: styleObj.fill, borderColor: styleObj.stroke, color: styleObj.textColor }}
                            className="h-[50px] p-1 rounded-lg border text-left transition-all hover:scale-105 flex flex-col justify-between"
                          >
                            <span className="text-[8.5px] font-black truncate block">{townName}</span>
                            <span className="text-[8px] font-mono font-bold truncate block opacity-90">
                              {tStat?.ty > 0 ? `$${(tStat.ty / 1000).toFixed(0)}k` : `Sc:${tStat?.marketPotentialScore}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              MODO 3: MAPA BENTO DE LAS 6 REGIONES DE PUERTO RICO
             ===================================================================== */}
          {mapViewMode === 'regions' && (
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[540px] overflow-y-auto">
              {activeRegions.map(reg => {
                const regPal = REGION_PALETTE[reg.name] || REGION_PALETTE.Metro;
                const isSelected = selectedMapRegion === reg.name && !selectedMapTown;
                const townsInReg = PR_REGIONS[reg.name] || [];
                return (
                  <div
                    key={reg.name}
                    onClick={() => {
                      setSelectedMapTown(null);
                      setSelectedMapRegion(isSelected ? null : reg.name);
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-amber-400 border-indigo-500' : ''
                    } ${t.card}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${regPal.badge}`}>
                          Región {reg.name} ({townsInReg.length} Pueblos)
                        </span>
                        <h4 className={`text-lg font-black mt-1 ${t.textTitle}`}>
                          {formatCurrency(reg.ty)}
                        </h4>
                      </div>
                      <span className={`text-xs font-mono font-black ${reg.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {reg.growth >= 0 ? '+' : ''}{reg.growth.toFixed(1)}% YoY
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {townsInReg.map(twn => {
                        const tStat = geoTownsData.dict[twn];
                        const isTownSel = selectedMapTown === twn;
                        return (
                          <button
                            key={twn}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMapRegion(reg.name);
                              setSelectedMapTown(isTownSel ? null : twn);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                              isTownSel
                                ? 'bg-amber-400 text-slate-950 font-black'
                                : tStat?.ty > 0
                                ? `${regPal.badge} shadow-sm`
                                : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {twn}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PIE DEL MAPA: LEYENDA DE COLORES DINÁMICA */}
          <div className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-sky-100'
          }`}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`font-black uppercase tracking-wider ${t.textSub}`}>Leyenda Activa:</span>
              {mapColorMetric === 'region' && (
                <div className="flex flex-wrap items-center gap-2.5 font-bold text-[10px]">
                  {ORDERED_REGIONS.map(rKey => (
                    <span key={rKey} className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: REGION_PALETTE[rKey].hexActive }}></span>
                      {rKey}
                    </span>
                  ))}
                </div>
              )}
              {(mapColorMetric === 'ty' || mapColorMetric === 'heatmap') && (
                <div className="flex items-center gap-2.5 font-bold text-[10px]">
                  <span className={t.textSub}>0% (Transparente)</span>
                  <div
                    className="w-36 sm:w-48 h-3 rounded-full border border-blue-500/40 shadow-inner"
                    style={{
                      background: 'linear-gradient(90deg, rgba(30, 58, 138, 0.0) 0%, rgba(96, 165, 250, 0.35) 30%, rgba(37, 99, 235, 0.75) 65%, rgba(30, 58, 138, 1) 100%)'
                    }}
                  />
                  <span className="text-blue-600 dark:text-blue-300 font-black">100% Densidad TY (Azul Profundo)</span>
                </div>
              )}
              {mapColorMetric === 'growth' && (
                <div className="flex items-center gap-2 font-bold text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-600"></span> &gt;+15%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-400"></span> 0 a +15%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500"></span> -10% a 0%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-rose-600"></span> &lt;-10%</span>
                </div>
              )}
              {mapColorMetric === 'demographics' && (
                <div className="flex items-center gap-2 font-bold text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-purple-600"></span> Polo Mayor (&gt;75 pts)</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-600"></span> Cabecera (58-74)</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-teal-600"></span> Medio (45-57)</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-sky-600"></span> Local</span>
                </div>
              )}
              {(mapColorMetric === 'salesPerStore' || mapColorMetric === 'perCapita') && (
                <div className="flex items-center gap-2 font-bold text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-sky-500"></span> Bajo</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-indigo-600"></span> Medio</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-fuchsia-600"></span> Alto Rendimiento</span>
                </div>
              )}
            </div>
            <span className={`text-[10px] font-semibold ${t.textSub}`}>
              Pasa el cursor o haz clic en cualquier municipio
            </span>
          </div>
        </div>

        {/* COLUMNA DERECHA (5 COLS): INSPECTOR MUNICIPAL PROFUNDO + DEMOGRAFÍA + BRECHAS */}
        <div className={`lg:col-span-5 rounded-3xl border overflow-hidden transition-colors flex flex-col ${t.card}`}>
          {(selectedMapRegion || selectedMapTown) && regionalDetails ? (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              {(() => {
                const muniGeo = selectedMapTown ? geoTownsData.dict[selectedMapTown] : null;
                return (
                  <div className={`p-5 border-b ${isDarkMode ? 'bg-indigo-950/40 border-slate-800' : 'bg-indigo-50/80 border-indigo-100'}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            REGION_PALETTE[regionalDetails.isTownLevel ? regionalDetails.regionObj?.parentRegion : regionalDetails.regionObj?.name]?.badge || 'bg-indigo-600 text-white'
                          }`}>
                            {regionalDetails.isTownLevel
                              ? `Región ${regionalDetails.regionObj?.parentRegion}`
                              : `Región ${regionalDetails.regionObj?.name}`}
                          </span>
                          {muniGeo && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/10 dark:bg-white/10">
                              🛣️ {muniGeo.corridor}
                            </span>
                          )}
                        </div>
                        <h3 className={`text-2xl font-black mt-1 ${t.textTitle}`}>
                          {regionalDetails.isTownLevel
                            ? `Municipio de ${regionalDetails.regionObj?.name}`
                            : `Región ${regionalDetails.regionObj?.name}`}
                        </h3>
                        {muniGeo && (
                          <p className={`text-xs ${t.textSub}`}>
                            {muniGeo.hub} • Población: <strong>{formatNumber(muniGeo.pop)} hab.</strong> ({formatNumber(muniGeo.households)} hogares) • Ingreso Med: <strong>{formatCurrency(muniGeo.medianIncome)}</strong>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {regionalDetails.isTownLevel && (
                          <button
                            onClick={() => setSelectedMapTown(null)}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold ${t.card}`}
                          >
                            ← Región
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedMapRegion(null);
                            setSelectedMapTown(null);
                          }}
                          className={`p-1.5 rounded-xl border text-xs font-bold ${t.card}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Mini KPIs Comerciales + Demográficos */}
                    <div className="grid grid-cols-3 gap-2.5 mt-4">
                      <div className={`p-3 rounded-xl border ${t.card}`}>
                        <span className={`text-[9px] font-bold uppercase block ${t.textSub}`}>Ventas TY</span>
                        <span className={`text-sm font-mono font-black ${t.textTitle}`}>
                          {formatCurrency(regionalDetails.regionObj?.ty || 0)}
                        </span>
                        <span className={`text-[10px] font-bold block mt-0.5 ${(regionalDetails.regionObj?.growth || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {(regionalDetails.regionObj?.growth || 0) >= 0 ? '+' : ''}{(regionalDetails.regionObj?.growth || 0).toFixed(1)}% YoY
                        </span>
                      </div>

                      <div className={`p-3 rounded-xl border ${t.card}`}>
                        <span className={`text-[9px] font-bold uppercase block ${t.textSub}`}>
                          {muniGeo ? 'Poder Compra Municipal' : 'Prom / Tienda'}
                        </span>
                        <span className="text-sm font-mono font-black text-indigo-500 block">
                          {muniGeo
                            ? `$${muniGeo.purchasingPowerMillions.toFixed(0)}M / año`
                            : formatCurrency(regionalDetails.regionObj?.salesPerStore || 0)}
                        </span>
                        <span className={`text-[10px] block mt-0.5 ${t.textSub}`}>
                          {regionalDetails.regionObj?.storeCount || 0} tienda(s) activa(s)
                        </span>
                      </div>

                      <div className={`p-3 rounded-xl border ${t.card}`}>
                        <span className={`text-[9px] font-bold uppercase block ${t.textSub}`}>
                          {muniGeo ? 'Score Potencial' : 'AUR / Surtido'}
                        </span>
                        <span className="text-sm font-mono font-black text-emerald-500 block">
                          {muniGeo
                            ? `${muniGeo.marketPotentialScore} / 99 pts`
                            : formatCurrency(regionalDetails.regionObj?.aur || 0)}
                        </span>
                        <span className={`text-[10px] truncate block mt-0.5 ${t.textSub}`}>
                          {muniGeo
                            ? `Per cápita: ${formatCurrency(muniGeo.salesPerCapita)}`
                            : `${regionalDetails.regionObj?.skuCount || 0} SKUs`}
                        </span>
                      </div>
                    </div>

                    {/* Botón rápido para enviar este pueblo al Comparador A vs B */}
                    {selectedMapTown && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setCompareTownA(selectedMapTown);
                            setMapViewMode('compare_towns');
                          }}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600/15 text-indigo-500 hover:bg-indigo-600 hover:text-white text-[10px] font-black transition-all"
                        >
                          ⚔️ Comparar {selectedMapTown} como Pueblo A
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCompareTownB(selectedMapTown);
                            setMapViewMode('compare_towns');
                          }}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600/15 text-emerald-500 hover:bg-emerald-600 hover:text-white text-[10px] font-black transition-all"
                        >
                          ⚔️ Comparar {selectedMapTown} como Pueblo B
                        </button>
                      </div>
                    )}

                    {/* 5 Pestañas del Inspector */}
                    <div className="grid grid-cols-5 gap-1 bg-slate-200/70 dark:bg-slate-900 p-1 rounded-xl mt-3">
                      {[
                        { id: 'stores', label: 'Tiendas' },
                        { id: 'skus', label: 'Top SKUs' },
                        { id: 'gaps', label: 'Brechas' },
                        { id: 'categories', label: 'Afinidad' },
                        { id: 'expansion', label: 'Expansión' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setRegionalPanelTab(tab.id)}
                          className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                            regionalPanelTab === tab.id ? 'bg-indigo-600 text-white shadow' : t.textSub
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Cuerpo del Inspector */}
              <div className="p-5 flex-1 max-h-[430px] overflow-y-auto">
                {regionalPanelTab === 'stores' && (
                  <div className="space-y-3">
                    <h4 className={`text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${t.textSub}`}>
                      <Store className="w-4 h-4 text-emerald-500" /> Sucursales en {regionalDetails.regionObj?.name}
                    </h4>
                    {regionalDetails.storesPerform.length > 0 ? (
                      regionalDetails.storesPerform.map((st, i) => (
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
                      ))
                    ) : (
                      <div className={`p-5 rounded-2xl border border-dashed text-center ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <p className={`text-xs font-bold ${t.textTitle}`}>
                          Oportunidad White Space en {regionalDetails.regionObj?.name}
                        </p>
                        <p className={`text-[11px] mt-1 ${t.textSub}`}>
                          Potencial anual estimado de apertura:{' '}
                          <strong className="text-emerald-500">
                            +{formatCurrency(regionalDetails.regionalBenchmarkPerStore * (whiteSpaceCapturePct / 100))} / año
                          </strong>
                        </p>
                        <button
                          type="button"
                          onClick={() => setRegionalPanelTab('expansion')}
                          className="mt-3 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
                        >
                          Simular Apertura y Ver Kit de Surtido →
                        </button>
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
                      <p className={`text-xs italic py-8 text-center ${t.textSub}`}>Sin ventas registradas aún en este municipio.</p>
                    )}
                  </div>
                )}

                {regionalPanelTab === 'gaps' && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-emerald-500 mb-1">
                      <Lightbulb className="w-4 h-4" /> Brechas de Distribución en {regionalDetails.regionObj?.name}
                    </h4>
                    <p className={`text-[11px] mb-3 ${t.textSub}`}>
                      SKUs ganadores en Puerto Rico que aún tienen <strong>$0 ventas</strong> en esta localidad:
                    </p>
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
                                +{formatCurrency(item.estimatedOpportunity)}
                              </span>
                              <span className={`text-[9px] font-mono ${t.textSub}`}>Isla: {formatCurrency(item.islandTy)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center rounded-2xl border border-dashed border-emerald-500/30">
                        <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className={`text-xs font-bold ${t.textTitle}`}>¡100% de Surtido Líder Presente!</p>
                      </div>
                    )}
                  </div>
                )}

                {regionalPanelTab === 'categories' && (
                  <div>
                    <h4 className={`text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${t.textSub}`}>
                      <PieChartIcon className="w-4 h-4 text-indigo-500" /> Índice de Afinidad Regional (CDI)
                    </h4>
                    {regionalDetails.categoryMix.length > 0 ? (
                      <div className="space-y-2">
                        {regionalDetails.categoryMix.map((c, i) => (
                          <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                              <span className={`font-bold truncate ${t.textTitle}`}>{c.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-bold">{formatCurrency(c.value)} ({c.localShare.toFixed(1)}%)</span>
                              <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                                c.affinityIndex >= 110 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-indigo-500/15 text-indigo-400'
                              }`}>
                                CDI: {c.affinityIndex.toFixed(0)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-xs italic py-8 text-center ${t.textSub}`}>Sin datos de categorías en esta localidad.</p>
                    )}
                  </div>
                )}

                {regionalPanelTab === 'expansion' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-emerald-950/20 border-emerald-800/50' : 'bg-emerald-50/70 border-emerald-200'}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block">
                        Simulador de Apertura / Expansión Municipal
                      </span>
                      <div className="mt-2">
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className={t.textSub}>Captura vs Benchmark Regional:</span>
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
                          <span className={`text-[9px] font-bold uppercase block ${t.textSub}`}>Benchmark Regional</span>
                          <span className={`text-xs font-mono font-black ${t.textTitle}`}>
                            {formatCurrency(regionalDetails.regionalBenchmarkPerStore)}
                          </span>
                        </div>
                        <div className={`p-2.5 rounded-xl border ${t.card}`}>
                          <span className="text-[9px] font-bold uppercase block text-emerald-500">Ingreso Proyectado</span>
                          <span className="text-sm font-mono font-black text-emerald-500">
                            +{formatCurrency(regionalDetails.regionalBenchmarkPerStore * (whiteSpaceCapturePct / 100))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className={`text-[11px] font-black uppercase tracking-wider mb-2 ${t.textTitle}`}>
                        Kit de Surtido Inicial Recomendado (Top SKUs de la Región)
                      </h5>
                      <div className="space-y-1.5">
                        {regionalDetails.recommendedLaunchKit.slice(0, 8).map((sku, idx) => (
                          <div key={idx} className={`px-3 py-1.5 rounded-lg border text-xs flex items-center justify-between ${t.card}`}>
                            <span className={`font-bold truncate pr-2 ${t.textTitle}`}>{idx + 1}. {sku.name}</span>
                            <span className="font-mono text-[10px] font-bold text-indigo-500 shrink-0">{formatCurrency(sku.ty)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* VISTA CUANDO NO HAY PUEBLO SELECCIONADO: EXPLORADOR RÁPIDO DE LOS 78 PUEBLOS Y 6 REGIONES */
            <div className="p-5 flex flex-col h-full">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">
                    Explorador Municipal & Regional (78 Pueblos)
                  </span>
                  <h3 className={`text-lg font-black ${t.textTitle}`}>
                    Directorio Interactivo por Pueblo
                  </h3>
                </div>
                <select
                  value={mapTownSort}
                  onChange={(e) => setMapTownSort(e.target.value)}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold focus:outline-none ${t.input}`}
                >
                  <option value="ty">Orden: Mayor Venta ($)</option>
                  <option value="potential">Orden: Mayor Potencial Demográfico</option>
                  <option value="growth">Orden: Mayor Crecimiento (%)</option>
                  <option value="alpha">Orden: Alfabético (A-Z)</option>
                </select>
              </div>

              {/* Filtros rápidos de estatus */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {[
                  { id: 'Todos', label: 'Todos (78)' },
                  { id: 'active', label: `Con Tienda (${geoTownsData.activeTownsCount})` },
                  { id: 'whitespace', label: `White Space (${78 - geoTownsData.activeTownsCount})` }
                ].map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setMapStatusFilter(st.id)}
                    className={`py-1.5 rounded-xl text-[10px] font-black border transition-all ${
                      mapStatusFilter === st.id
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : t.card
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2 flex-1 max-h-[430px] overflow-y-auto pr-1">
                {filteredTownsDirectory.map((m, idx) => {
                  const regPal = REGION_PALETTE[m.region] || REGION_PALETTE.Metro;
                  return (
                    <div
                      key={m.name}
                      onMouseEnter={() => setHoveredTownName(m.name)}
                      onMouseLeave={() => setHoveredTownName(null)}
                      onClick={() => {
                        setSelectedMapRegion(m.region);
                        setSelectedMapTown(m.name);
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${t.cardHover}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${regPal.dot}`}></span>
                          <span className={`font-black text-xs ${t.textTitle}`}>{idx + 1}. {m.name}</span>
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${regPal.badge}`}>
                            {m.region}
                          </span>
                        </div>
                        <p className={`text-[10px] font-mono mt-0.5 truncate ${t.textSub}`}>
                          {formatNumber(m.pop)} hab • Ing: {formatCurrency(m.medianIncome)} • {m.corridor}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        {m.ty > 0 ? (
                          <>
                            <span className={`font-mono font-black text-xs block ${t.textTitle}`}>
                              {formatCurrency(m.ty)}
                            </span>
                            <span className={`text-[10px] font-mono font-bold ${m.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {m.growth >= 0 ? '+' : ''}{m.growth.toFixed(1)}% ({m.storeCount}t)
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 block">
                              Score {m.marketPotentialScore}/99
                            </span>
                            <span className={`text-[9px] font-mono ${t.textSub}`}>
                              Pot: +{formatCurrency(m.estimatedAnnualPotential)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PuertoRicoGeographySuite;
