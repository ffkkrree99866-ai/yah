import { useEffect, useMemo, useState } from 'react';
import {
  Phone,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import type { KaratPrice } from './types';
import {
  computePrices,
  formatSAR,
  formatTime,
  formatDate,
  KARAT_LABELS,
} from './lib/gold';

// A realistic SAR/gram spot for 24k gold (used as the live "feed" baseline).
const BASE_SPOT_24K = 345;

function jitter(value: number, pct: number): number {
  const delta = value * pct * (Math.random() * 2 - 1);
  return Math.max(1, value + delta);
}

export default function App() {
  const [spot, setSpot] = useState(BASE_SPOT_24K);
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [prevPrices, setPrevPrices] = useState<KaratPrice[]>(
    computePrices(BASE_SPOT_24K)
  );
  const [refreshing, setRefreshing] = useState(false);
  const [lastChange, setLastChange] = useState(0);

  const prices = useMemo(() => computePrices(spot), [spot]);

  // Attach change percentages relative to previous tick.
  const pricesWithChange: KaratPrice[] = useMemo(() => {
    return prices.map((p, i) => ({
      ...p,
      change:
        prevPrices[i] && prevPrices[i].sell > 0
          ? ((p.sell - prevPrices[i].sell) / prevPrices[i].sell) * 100
          : 0,
    }));
  }, [prices, prevPrices]);

  // Live price simulation: updates every 8 seconds with small jitter.
  useEffect(() => {
    const id = setInterval(() => {
      setSpot((cur) => {
        const next = Math.round(jitter(cur, 0.012));
        setLastChange(next - cur);
        setTrend(next > cur ? 'up' : next < cur ? 'down' : 'stable');
        setUpdatedAt(new Date());
        setPrevPrices(computePrices(cur));
        return next;
      });
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setSpot((cur) => {
        const next = Math.round(jitter(cur, 0.02));
        setLastChange(next - cur);
        setTrend(next > cur ? 'up' : next < cur ? 'down' : 'stable');
        setUpdatedAt(new Date());
        setPrevPrices(computePrices(cur));
        return next;
      });
      setRefreshing(false);
    }, 700);
  };

  const tickerItems = pricesWithChange.map((p) => ({
    label: p.label,
    sell: p.sell,
    change: p.change,
  }));

  return (
    <div className="min-h-screen bg-[#0b0a08] text-amber-50 font-arabic">
      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-yellow-600/10 blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-amber-700/10 blur-[110px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-amber-900/40 bg-gradient-to-b from-[#15110a] to-[#0b0a08]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 animate-pulse-glow">
              <Sparkles className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold leading-tight gold-text">
                مؤسسة تاج الزمرد للذهب
              </h1>
              <p className="text-xs text-amber-200/60">
                أسعار الذهب مباشرة · بالريال السعودي
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-sm text-amber-200 transition hover:border-amber-400/60 hover:bg-amber-500/10 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">تحديث الأسعار</span>
          </button>
        </div>
      </header>

      {/* Ticker */}
      <div className="relative z-10 overflow-hidden border-b border-amber-900/30 bg-[#120e07] py-2">
        <div className="ticker-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-8 px-4">
              {tickerItems.map((t) => (
                <span
                  key={`${dup}-${t.label}`}
                  className="flex items-center gap-2 text-sm text-amber-100/80"
                >
                  <span className="font-semibold text-amber-300">
                    {t.label}
                  </span>
                  <span>{formatSAR(t.sell)} ر.س</span>
                  <span
                    className={
                      t.change > 0
                        ? 'text-emerald-400'
                        : t.change < 0
                        ? 'text-rose-400'
                        : 'text-amber-200/50'
                    }
                  >
                    {t.change > 0 ? '▲' : t.change < 0 ? '▼' : '—'}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-5 py-10">
        {/* Hero / spot price */}
        <section className="animate-fade-up text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-amber-300/70">
            سعر الذهب العالمي · جرام عيار 24
          </p>
          <div className="mb-2 flex items-center justify-center gap-3">
            <span className="font-display text-6xl font-bold gold-text sm:text-7xl">
              {formatSAR(spot)}
            </span>
            <span className="text-2xl text-amber-200/80">ر.س</span>
          </div>
          <div className="mb-1 flex items-center justify-center gap-2 text-sm">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-4 w-4 text-rose-400" />
            ) : (
              <Minus className="h-4 w-4 text-amber-200/50" />
            )}
            <span
              className={
                trend === 'up'
                  ? 'text-emerald-400'
                  : trend === 'down'
                  ? 'text-rose-400'
                  : 'text-amber-200/60'
              }
            >
              {lastChange > 0 ? '+' : ''}
              {formatSAR(lastChange)} ر.س
            </span>
            <span className="text-amber-200/40">·</span>
            <span className="text-amber-200/60">
              آخر تحديث {formatTime(updatedAt)}
            </span>
          </div>
          <p className="text-sm text-amber-200/50">{formatDate(updatedAt)}</p>
        </section>

        {/* Karat cards */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-amber-100">
              أسعار العيارات
            </h2>
            <span className="text-xs text-amber-200/50">
              الأسعار بالريال السعودي للجرام
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pricesWithChange.map((p, i) => (
              <KaratCard key={p.karat} price={p} index={i} />
            ))}
          </div>
        </section>

        {/* Buy / Sell explainer */}
        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoCard
            title="سعر الشراء"
            subtitle="نشتري منك الذهب بهذا السعر"
            tone="buy"
          />
          <InfoCard
            title="سعر البيع"
            subtitle="نبيعك الذهب بهذا السعر"
            tone="sell"
          />
        </section>

        {/* Contact */}
        <section className="mt-12 rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#15110a] to-[#0d0b07] p-6 sm:p-8">
          <h2 className="mb-5 font-display text-xl font-semibold text-amber-100">
            تواصل معنا
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ContactItem
              icon={<Phone className="h-5 w-5" />}
              label="الهاتف"
              value="+966 50 289 9866"
              href="tel:+966502899866"
            />
            <ContactItem
              icon={<MapPin className="h-5 w-5" />}
              label="العنوان"
              value="المملكة العربية السعودية"
            />
            <ContactItem
              icon={<Clock className="h-5 w-5" />}
              label="ساعات العمل"
              value="السبت - الخميس · 9 ص - 10 م"
            />
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mt-8 text-center text-xs text-amber-200/40">
          الأسعار استرشادية ومحدّثة لحظياً، يُرجى التواصل مع المؤسسة لتأكيد السعر
          النهائي عند المعاملة.
        </section>
      </main>

      <footer className="relative z-10 border-t border-amber-900/40 py-6 text-center text-xs text-amber-200/40">
        © {new Date().getFullYear()} مؤسسة تاج الزمرد للذهب · جميع الحقوق
        محفوظة
      </footer>
    </div>
  );
}

function KaratCard({ price, index }: { price: KaratPrice; index: number }) {
  const up = price.change > 0;
  const down = price.change < 0;
  return (
    <div
      className="animate-fade-up group relative overflow-hidden rounded-2xl border border-amber-800/40 bg-gradient-to-b from-[#1a1409] to-[#100c06] p-5 transition hover:border-amber-500/50 hover:shadow-[0_0_30px_-8px_rgba(212,175,55,0.25)]"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-lg font-bold text-amber-200">
          {price.label}
        </span>
        <span className="rounded-full border border-amber-700/40 bg-amber-500/5 px-2 py-0.5 text-[10px] text-amber-300/70">
          {KARAT_LABELS[price.karat]}
        </span>
      </div>

      <div className="mb-1 flex items-baseline gap-1">
        <span className="font-display text-3xl font-bold text-amber-50">
          {formatSAR(price.sell)}
        </span>
        <span className="text-sm text-amber-200/60">ر.س / جرام</span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-amber-900/30 pt-3 text-xs">
        <span className="text-amber-200/50">
          شراء: <span className="text-amber-200">{formatSAR(price.buy)}</span>
        </span>
        <span
          className={
            up
              ? 'text-emerald-400'
              : down
              ? 'text-rose-400'
              : 'text-amber-200/40'
          }
        >
          {up ? '▲' : down ? '▼' : '—'}{' '}
          {Math.abs(price.change).toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  subtitle,
  tone,
}: {
  title: string;
  subtitle: string;
  tone: 'buy' | 'sell';
}) {
  const isBuy = tone === 'buy';
  return (
    <div
      className={`rounded-2xl border p-5 ${
        isBuy
          ? 'border-emerald-700/40 bg-emerald-900/10'
          : 'border-amber-700/40 bg-amber-900/10'
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isBuy ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
        />
        <h3 className="font-display text-lg font-semibold text-amber-50">
          {title}
        </h3>
      </div>
      <p className="text-sm text-amber-200/60">{subtitle}</p>
    </div>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 rounded-xl border border-amber-800/30 bg-amber-500/5 p-4 transition hover:border-amber-500/40 hover:bg-amber-500/10">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 text-amber-400">
        {icon}
      </div>
      <div>
        <p className="text-xs text-amber-200/50">{label}</p>
        <p className="font-semibold text-amber-100" dir="ltr">
          {value}
        </p>
      </div>
      {href && (
        <ChevronLeft className="mr-auto h-4 w-4 text-amber-300/50" />
      )}
    </div>
  );
  return href ? (
    <a href={href} className="block">
      {content}
    </a>
  ) : (
    content
  );
}
