import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  CalendarDays,
  Clock,
  Compass,
  Eye,
  Globe,
  Loader2,
  Monitor,
  RefreshCw,
  Repeat,
  ShieldCheck,
  Smartphone,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface Breakdown {
  label: string;
  count: number;
}

interface RecentVisitor {
  first_seen: string;
  last_seen: string;
  visit_count: number;
  device: string | null;
  browser: string | null;
  os: string | null;
  source: string | null;
  timezone: string | null;
  language: string | null;
  landing_path: string | null;
}

interface VisitorStats {
  total: number;
  total_visits: number;
  returning: number;
  today: number;
  last_7_days: number;
  last_30_days: number;
  active_24h: number;
  daily: { date: string; count: number }[];
  devices: Breakdown[];
  browsers: Breakdown[];
  os: Breakdown[];
  sources: Breakdown[];
  timezones: Breakdown[];
  recent: RecentVisitor[];
}

const RANGES = [7, 30, 90] as const;

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const numberFmt = new Intl.NumberFormat('en-US');
const dayFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

// 'YYYY-MM-DD' -> local Date without a UTC shift.
const parseDay = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const timeAgo = (iso: string) => {
  const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 86400 * 30) return `${Math.floor(sec / 86400)}d ago`;
  return dateTimeFmt.format(new Date(iso));
};

const fetchStats = async (days: number): Promise<VisitorStats> => {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.rpc('get_visitor_stats', {
    p_days: days,
    p_timezone: timezone,
  });
  if (error) throw error;
  return data as VisitorStats;
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  hint?: string;
}) => (
  <div className="glass-card rounded-xl p-5 hover:border-primary/40 transition-all duration-300">
    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-3">
      <Icon size={16} className="text-primary" />
      {label}
    </div>
    <p className="text-3xl font-display font-bold text-foreground">{numberFmt.format(value)}</p>
    {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const BreakdownCard = ({
  icon: Icon,
  title,
  items,
  total,
}: {
  icon: LucideIcon;
  title: string;
  items: Breakdown[];
  total: number;
}) => (
  <div className="glass-card rounded-2xl p-6">
    <div className="flex items-center gap-2 mb-5">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        <Icon size={18} />
      </div>
      <h3 className="font-display font-semibold text-foreground">{title}</h3>
    </div>
    {items.length === 0 ? (
      <p className="text-sm text-muted-foreground">No data yet</p>
    ) : (
      <ul className="space-y-3">
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <li key={item.label}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-foreground truncate pr-3">{item.label}</span>
                <span className="text-muted-foreground tabular-nums">
                  {numberFmt.format(item.count)} · {pct}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-secondary/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

const VisitorDashboard = () => {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);

  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['visitor-stats', days],
    queryFn: () => fetchStats(days),
    refetchInterval: 60_000,
    placeholderData: (prev) => prev,
  });

  const chartData =
    data?.daily.map((d) => ({ label: dayFmt.format(parseDay(d.date)), count: d.count })) ?? [];
  const rangeNew = data?.daily.reduce((sum, d) => sum + d.count, 0) ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Visitor Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            This browser is excluded from the stats
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="flex justify-center py-32">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : error && !data ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-destructive mb-4">Couldn't load stats: {(error as Error).message}</p>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Hero metric */}
          <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 100% 0%, hsl(var(--primary) / 0.14), transparent 55%)',
              }}
            />
            <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase tracking-wider mb-3">
                  <Users size={18} className="text-primary" />
                  Unique visitors
                </div>
                <p className="text-6xl md:text-7xl font-display font-bold gradient-text glow-text leading-none">
                  {numberFmt.format(data.total)}
                </p>
                <p className="text-sm text-muted-foreground mt-3">
                  Each person is counted once, no matter how many times they come back.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Updated {dataUpdatedAt ? timeAgo(new Date(dataUpdatedAt).toISOString()) : '—'} ·
                auto-refreshes every minute
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard icon={UserPlus} label="New today" value={data.today} />
            <StatCard icon={CalendarDays} label="Last 7 days" value={data.last_7_days} />
            <StatCard icon={CalendarDays} label="Last 30 days" value={data.last_30_days} />
            <StatCard icon={Activity} label="Active 24h" value={data.active_24h} hint="Seen in the last day" />
            <StatCard icon={Repeat} label="Returning" value={data.returning} hint="Came back after 30+ min" />
            <StatCard icon={Eye} label="Total visits" value={data.total_visits} hint="Including repeat visits" />
          </div>

          {/* Chart */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display font-semibold text-foreground">New visitors per day</h3>
                <p className="text-sm text-muted-foreground">
                  {numberFmt.format(rangeNew)} new in the last {days} days
                </p>
              </div>
              <div className="inline-flex rounded-lg border border-border/60 p-1 bg-secondary/30">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setDays(r)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      days === r
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r}d
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, 'auto']}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ stroke: 'hsl(var(--primary))', strokeOpacity: 0.3 }}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: number) => [numberFmt.format(value), 'New visitors']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#visitorsFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdowns */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BreakdownCard icon={Compass} title="Sources" items={data.sources} total={data.total} />
            <BreakdownCard icon={Smartphone} title="Devices" items={data.devices} total={data.total} />
            <BreakdownCard icon={Globe} title="Regions (timezone)" items={data.timezones} total={data.total} />
            <BreakdownCard icon={Monitor} title="Browsers" items={data.browsers} total={data.total} />
            <BreakdownCard icon={Monitor} title="Operating systems" items={data.os} total={data.total} />
          </div>

          {/* Recent visitors */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Clock size={18} />
              </div>
              <h3 className="font-display font-semibold text-foreground">Recent visitors</h3>
            </div>
            {data.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No visitors yet</p>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border/50">
                      <th className="py-3 pr-4 font-medium">Last seen</th>
                      <th className="py-3 pr-4 font-medium">First seen</th>
                      <th className="py-3 pr-4 font-medium">Visits</th>
                      <th className="py-3 pr-4 font-medium">Device</th>
                      <th className="py-3 pr-4 font-medium">Source</th>
                      <th className="py-3 font-medium">Region</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((v, i) => (
                      <tr key={i} className="border-b border-border/30 last:border-0">
                        <td className="py-3 pr-4 text-foreground whitespace-nowrap">{timeAgo(v.last_seen)}</td>
                        <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                          {dateTimeFmt.format(new Date(v.first_seen))}
                        </td>
                        <td className="py-3 pr-4 text-foreground tabular-nums">{v.visit_count}</td>
                        <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                          {[v.device, v.browser, v.os].filter(Boolean).join(' · ') || '—'}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{v.source ?? 'direct'}</td>
                        <td className="py-3 text-muted-foreground whitespace-nowrap">
                          {v.timezone ?? '—'}
                          {v.language ? ` · ${v.language}` : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default VisitorDashboard;
