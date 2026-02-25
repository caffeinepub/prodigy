import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { BookOpen, Users, CheckCircle, Clock, Eye, Bookmark, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { AdminStats, BookView } from '../../backend';

function StatCard({ title, value, icon: Icon, color, loading }: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) {
  return (
    <Card className="bg-admin-card border-admin-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-admin-muted text-xs font-medium uppercase tracking-wider">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1 bg-admin-border" />
            ) : (
              <p className="text-2xl font-bold text-admin-text mt-1">{value}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OverviewSection() {
  const { actor, isFetching: actorFetching } = useActor();

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdminStats();
    },
    enabled: !!actor && !actorFetching,
  });

  const { data: mostViewed, isLoading: viewedLoading } = useQuery<BookView[]>({
    queryKey: ['mostViewedBooks'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMostViewedBooks();
    },
    enabled: !!actor && !actorFetching,
  });

  const { data: mostPopular, isLoading: popularLoading } = useQuery<BookView[]>({
    queryKey: ['mostPopularBooks'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMostPopularBooks();
    },
    enabled: !!actor && !actorFetching,
  });

  const isLoading = statsLoading || actorFetching;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-gold">Platform Overview</h1>
        <p className="text-admin-muted text-sm mt-1">Analytics and platform statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats ? Number(stats.totalUsers) : 0}
          icon={Users}
          color="bg-blue-500/10 text-blue-400"
          loading={isLoading}
        />
        <StatCard
          title="Total Books"
          value={stats ? Number(stats.totalBooks) : 0}
          icon={BookOpen}
          color="bg-admin-gold/10 text-admin-gold"
          loading={isLoading}
        />
        <StatCard
          title="Approved"
          value={stats ? Number(stats.totalApprovedBooks) : 0}
          icon={CheckCircle}
          color="bg-green-500/10 text-green-400"
          loading={isLoading}
        />
        <StatCard
          title="Pending"
          value={stats ? Number(stats.totalPendingBooks) : 0}
          icon={Clock}
          color="bg-orange-500/10 text-orange-400"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Books */}
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-admin-text flex items-center gap-2 text-base">
              <Eye className="h-4 w-4 text-admin-gold" />
              Most Viewed Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewedLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full bg-admin-border" />
                ))}
              </div>
            ) : mostViewed && mostViewed.length > 0 ? (
              <div className="space-y-2">
                {mostViewed.slice(0, 8).map((book, idx) => (
                  <div key={Number(book.id)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-admin-border/30 transition-colors">
                    <span className="text-admin-muted text-xs w-5 text-center font-mono">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-admin-text text-sm font-medium truncate">{book.title}</p>
                      <p className="text-admin-muted text-xs truncate">{book.author}</p>
                    </div>
                    <Badge variant="outline" className="border-admin-gold/30 text-admin-gold text-xs shrink-0">
                      <Eye className="h-3 w-3 mr-1" />
                      {Number(book.viewCount)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-admin-muted text-sm text-center py-6">No books yet</p>
            )}
          </CardContent>
        </Card>

        {/* Most Bookmarked Books */}
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-admin-text flex items-center gap-2 text-base">
              <Bookmark className="h-4 w-4 text-admin-gold" />
              Most Bookmarked Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            {popularLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full bg-admin-border" />
                ))}
              </div>
            ) : mostPopular && mostPopular.length > 0 ? (
              <div className="space-y-2">
                {mostPopular.slice(0, 8).map((book, idx) => (
                  <div key={Number(book.id)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-admin-border/30 transition-colors">
                    <span className="text-admin-muted text-xs w-5 text-center font-mono">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-admin-text text-sm font-medium truncate">{book.title}</p>
                      <p className="text-admin-muted text-xs truncate">{book.author}</p>
                    </div>
                    <Badge variant="outline" className="border-blue-400/30 text-blue-400 text-xs shrink-0">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-admin-muted text-sm text-center py-6">No books yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
