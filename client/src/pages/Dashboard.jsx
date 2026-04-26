import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Banknote, ShoppingBag, Receipt, Package,
  Store, Tag, BadgePercent, TrendingUp, Coins,
} from 'lucide-react';
import Layout from '../components/Layout.jsx';
import FiltersBar from '../components/FiltersBar.jsx';
import KpiCard from '../components/KpiCard.jsx';
import DataTable from '../components/DataTable.jsx';
import SalesOverTime from '../components/charts/SalesOverTime.jsx';
import HorizontalBars from '../components/charts/HorizontalBars.jsx';
import CategoryDonut from '../components/charts/CategoryDonut.jsx';
import DowHeatmap from '../components/charts/DowHeatmap.jsx';
import { api } from '../lib/api.js';
import { compactMoney, money, n } from '../lib/format.js';

const initialFilters = () => ({
  from: null,
  to: null,
  store: null,
  category: null,
  terminal: null,
  cashier: null,
  event_name: null,
});

export default function Dashboard({ user, onLogout }) {
  const [filterOptions, setFilterOptions] = useState(null);
  const [filters, setFilters] = useState(initialFilters());
  const [granularity, setGranularity] = useState('day');

  const [kpis, setKpis] = useState(null);
  const [series, setSeries] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topTerminals, setTopTerminals] = useState([]);
  const [topCashiers, setTopCashiers] = useState([]);
  const [eventBreakdown, setEventBreakdown] = useState([]);
  const [dow, setDow] = useState([]);

  const [loading, setLoading] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [error, setError] = useState('');

  // Load filter options + default date range once.
  useEffect(() => {
    api.filters().then(({ data }) => {
      setFilterOptions(data);
      // Default to last 30 days within available range, if any.
      if (data?.max_date) {
        const max = data.max_date;
        const minBound = data.min_date;
        const d = new Date(max + 'T00:00:00Z');
        d.setUTCDate(d.getUTCDate() - 29);
        let from = d.toISOString().slice(0, 10);
        if (minBound && from < minBound) from = minBound;
        setFilters((f) => ({ ...f, from, to: max }));
      }
    }).catch((e) => setError(e.message));
  }, []);

  const filtersReady = !!filterOptions;

  const loadAll = useCallback(async () => {
    if (!filtersReady) return;
    setLoading(true);
    setError('');
    try {
      const [
        kpisRes, seriesRes, storesRes, catsRes, prodsRes,
        termsRes, cashRes, eventsRes, dowRes,
      ] = await Promise.all([
        api.kpis(filters),
        api.salesOverTime(filters, granularity),
        api.topByDimension('store', filters, 10),
        api.topByDimension('category', filters, 10),
        api.topProducts(filters, 20),
        api.topByDimension('terminal', filters, 10),
        api.topByDimension('cashier', filters, 10),
        api.topByDimension('event_name', filters, 10),
        api.dowHeatmap(filters),
      ]);
      setKpis(kpisRes.data);
      setSeries(seriesRes.data);
      setTopStores(storesRes.data);
      setCategories(catsRes.data);
      setTopProducts(prodsRes.data);
      setTopTerminals(termsRes.data);
      setTopCashiers(cashRes.data);
      setEventBreakdown(eventsRes.data);
      setDow(dowRes.data);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [filters, granularity, filtersReady, refreshNonce]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const refresh = () => setRefreshNonce((x) => x + 1);

  const reset = () => {
    const base = initialFilters();
    if (filterOptions?.max_date) {
      const max = filterOptions.max_date;
      const d = new Date(max + 'T00:00:00Z');
      d.setUTCDate(d.getUTCDate() - 29);
      let from = d.toISOString().slice(0, 10);
      if (filterOptions.min_date && from < filterOptions.min_date) from = filterOptions.min_date;
      base.from = from;
      base.to = max;
    }
    setFilters(base);
  };

  const moneyCol = (v) => compactMoney(v);
  const numCol = (v) => n(v);

  const periodLabel = useMemo(() => {
    if (filters.from && filters.to) return `${filters.from} → ${filters.to}`;
    if (filterOptions?.min_date && filterOptions?.max_date) return `${filterOptions.min_date} → ${filterOptions.max_date}`;
    return '—';
  }, [filters, filterOptions]);

  return (
    <Layout user={user} onLogout={onLogout} onRefresh={refresh} refreshing={loading}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-100">Performance overview</h1>
          <p className="text-sm text-ink-400">Period: <span className="font-medium text-ink-200">{periodLabel}</span></p>
        </div>
      </div>

      <FiltersBar
        filters={filters}
        options={filterOptions}
        onChange={setFilters}
        onReset={reset}
      />

      {error && (
        <div className="card card-pad text-red-300 bg-red-950/40 border-red-900/60">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard label="Revenue (gross)" value={compactMoney(kpis?.revenue)} sublabel={money(kpis?.revenue)} icon={Banknote} accent="brand" />
        <KpiCard label="Net sales" value={compactMoney(kpis?.net_sales)} sublabel={money(kpis?.net_sales)} icon={TrendingUp} accent="emerald" />
        <KpiCard label="Transactions" value={n(kpis?.transactions)} sublabel={`${n(kpis?.items)} items sold`} icon={Receipt} accent="violet" />
        <KpiCard label="Avg. transaction" value={compactMoney(kpis?.avg_txn_value)} sublabel="Revenue / txn" icon={ShoppingBag} accent="sky" />
        <KpiCard label="Discount given" value={compactMoney(kpis?.discount)} sublabel={`Tax: ${compactMoney(kpis?.tax)}`} icon={BadgePercent} accent="amber" />
        <KpiCard label="Items sold" value={n(kpis?.items)} icon={Package} accent="slate" />
        <KpiCard label="Stores" value={n(kpis?.stores)} icon={Store} accent="brand" />
        <KpiCard label="Products (SKUs)" value={n(kpis?.products)} icon={Tag} accent="violet" />
        <KpiCard label="Tax collected" value={compactMoney(kpis?.tax)} icon={Coins} accent="rose" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <SalesOverTime data={series} granularity={granularity} setGranularity={setGranularity} />
        </div>
        <CategoryDonut title="Revenue by category" data={categories} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <HorizontalBars title="Top stores by revenue" data={topStores} currency />
        <HorizontalBars title="Top terminals by revenue" data={topTerminals} currency />
        <HorizontalBars title="Top cashiers by revenue" data={topCashiers} currency />
      </div>

      <DowHeatmap data={dow} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DataTable
          title="Top products"
          columns={[
            { key: 'sku', label: 'SKU', mono: true },
            { key: 'product_name', label: 'Product' },
            { key: 'category', label: 'Category' },
            { key: 'items', label: 'Qty', align: 'right', render: numCol },
            { key: 'net_sales', label: 'Net sales', align: 'right', render: moneyCol },
            { key: 'revenue', label: 'Revenue', align: 'right', render: moneyCol },
          ]}
          rows={topProducts}
        />
        <DataTable
          title="Event types"
          columns={[
            { key: 'label', label: 'Event' },
            { key: 'transactions', label: 'Txns', align: 'right', render: numCol },
            { key: 'items', label: 'Items', align: 'right', render: numCol },
            { key: 'net_sales', label: 'Net sales', align: 'right', render: moneyCol },
            { key: 'revenue', label: 'Revenue', align: 'right', render: moneyCol },
          ]}
          rows={eventBreakdown}
        />
      </div>
    </Layout>
  );
}
