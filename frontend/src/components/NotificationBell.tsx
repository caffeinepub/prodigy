import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationPanel, { AppNotification } from './NotificationPanel';
import { BookView } from '../backend';

interface NotificationBellProps {
  books: BookView[];
}

function generateNotifications(books: BookView[]): AppNotification[] {
  const notifications: AppNotification[] = [];
  let id = 1;

  books.forEach((book) => {
    const views = Number(book.viewCount);
    const milestones = [10, 50, 100, 500, 1000];
    milestones.forEach((milestone) => {
      if (views >= milestone) {
        notifications.push({
          id: id++,
          title: `📈 View milestone reached!`,
          message: `"${book.title}" has reached ${milestone} views.`,
          timestamp: Number(book.uploadDate) / 1_000_000 + milestone * 1000,
          isRead: false,
          type: 'view',
        });
      }
    });

    if (book.status === 'approved') {
      notifications.push({
        id: id++,
        title: '✅ Book approved',
        message: `"${book.title}" has been approved and is now live in the library.`,
        timestamp: Number(book.uploadDate) / 1_000_000,
        isRead: true,
        type: 'general',
      });
    }
  });

  return notifications.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
}

export default function NotificationBell({ books }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  const rawNotifications = generateNotifications(books);
  const notifications = rawNotifications.map((n) => ({
    ...n,
    isRead: n.isRead || readIds.has(n.id),
  }));

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        open={open}
        onOpenChange={setOpen}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />
    </>
  );
}
