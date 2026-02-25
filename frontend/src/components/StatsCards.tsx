import { useGetAdminStats } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';

export default function StatsCards() {
  const { data: stats, isLoading } = useGetAdminStats();

  const cards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Total Books',
      value: stats?.totalBooks,
      icon: BookOpen,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Approved',
      value: stats?.totalApprovedBooks,
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Pending',
      value: stats?.totalPendingBooks,
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                {isLoading ? (
                  <>
                    <Skeleton className="h-6 w-12 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </>
                ) : (
                  <>
                    <p className="text-xl font-bold text-foreground">
                      {card.value?.toString() ?? '0'}
                    </p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
