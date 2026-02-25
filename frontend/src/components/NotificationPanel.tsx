import React from 'react';
import { Bell, CheckCheck, BookOpen, TrendingUp, Heart } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  type?: 'view' | 'like' | 'general';
}

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

function NotificationIcon({ type }: { type?: string }) {
  if (type === 'view') return <TrendingUp size={16} className="text-primary" />;
  if (type === 'like') return <Heart size={16} className="text-accent" />;
  return <BookOpen size={16} className="text-muted-foreground" />;
}

export default function NotificationPanel({
  open,
  onOpenChange,
  notifications,
  onMarkAllRead,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 sm:w-96 p-0 flex flex-col">
        <SheetHeader className="px-4 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Bell size={18} className="text-primary" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                  {unreadCount}
                </span>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllRead}
                className="text-xs gap-1 h-7"
              >
                <CheckCheck size={13} />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <Bell size={40} className="text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                We'll notify you when your books hit milestones
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 flex gap-3 transition-colors ${
                    !notification.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <NotificationIcon type={notification.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {timeAgo(notification.timestamp)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
