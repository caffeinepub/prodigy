import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BookOpen, Eye, Heart, TrendingUp } from 'lucide-react';
import { BookView } from '../backend';
import HelpTooltip from './HelpTooltip';

interface AnalyticsOverviewProps {
  books: BookView[];
}

const CHART_COLORS = [
  'oklch(0.50 0.22 250)',
  'oklch(0.75 0.15 85)',
  'oklch(0.60 0.18 200)',
  'oklch(0.65 0.20 160)',
  'oklch(0.55 0.20 300)',
  'oklch(0.70 0.18 30)',
];

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground font-cinzel">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function AnalyticsOverview({ books }: AnalyticsOverviewProps) {
  const totalBooks = books.length;
  const totalViews = books.reduce((sum, b) => sum + Number(b.viewCount), 0);
  const approvedBooks = books.filter((b) => b.status === 'approved').length;

  // Genre distribution
  const genreCounts: Record<string, number> = {};
  books.forEach((book) => {
    book.genres.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });
  const genreData = Object.entries(genreCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Monthly growth (last 6 months based on upload dates)
  const now = Date.now();
  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleString('default', { month: 'short' });
  });

  const monthlyData = monthLabels.map((month, i) => {
    const monthStart = new Date(now);
    monthStart.setMonth(monthStart.getMonth() - (5 - i));
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const booksInMonth = books.filter((b) => {
      const uploadMs = Number(b.uploadDate) / 1_000_000;
      return uploadMs >= monthStart.getTime() && uploadMs < monthEnd.getTime();
    });

    const views = booksInMonth.reduce((sum, b) => sum + Number(b.viewCount), 0);
    return { month, books: booksInMonth.length, views };
  });

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Total Books"
          value={totalBooks}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Eye}
          label="Total Views"
          value={totalViews.toLocaleString()}
          color="bg-accent/20 text-accent-foreground"
        />
        <StatCard
          icon={Heart}
          label="Approved"
          value={approvedBooks}
          color="bg-green-500/10 text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Pending Review"
          value={books.filter((b) => b.status === 'pending').length}
          color="bg-orange-500/10 text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-foreground">Genre Distribution</h3>
            <HelpTooltip content="This pie chart shows how your books are distributed across different genres." />
          </div>
          {genreData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No genre data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {genreData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Growth */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-foreground">Monthly Activity</h3>
            <HelpTooltip content="This chart shows how many books you uploaded and total views accumulated each month over the last 6 months." />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--foreground)',
                }}
              />
              <Legend />
              <Bar dataKey="books" name="Books Uploaded" fill="oklch(0.50 0.22 250)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="views" name="Views" fill="oklch(0.75 0.15 85)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
