"use client";

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';
import {
  Bell,
  Trash2,
  CheckCircle2,
  CalendarPlus,
  XCircle,
  CheckCircle,
  Car,
  Clock,
  Wrench,
  ShieldAlert,
  UserPlus,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'new_reservation': return <CalendarPlus className="h-5 w-5 text-blue-500" />;
    case 'reservation_cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
    case 'reservation_confirmed': return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'vehicle_delivery_approaching': return <Car className="h-5 w-5 text-orange-500" />;
    case 'vehicle_return_approaching': return <Clock className="h-5 w-5 text-orange-500" />;
    case 'vehicle_maintenance_due': return <Wrench className="h-5 w-5 text-yellow-600" />;
    case 'kabis_failed': return <ShieldAlert className="h-5 w-5 text-destructive" />;
    case 'new_user_created': return <UserPlus className="h-5 w-5 text-indigo-500" />;
    default: return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

const getPriorityColor = (priority: Notification['priority']) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200';
    case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200';
    case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200';
  }
};

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread') return !notif.isRead;
    if (activeTab === 'alerts') return notif.priority === 'high';
    if (activeTab === 'system') return notif.type === 'new_user_created' || notif.type === 'kabis_failed';
    return true; // all
  });

  const NotificationItem = ({ notif }: { notif: Notification }) => (
    <div className={cn(
      "flex gap-4 p-4 rounded-lg border mb-3 transition-colors",
      notif.isRead ? "bg-card border-border" : "bg-primary/5 border-primary/20"
    )}>
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notif.type)}
      </div>
      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-sm font-semibold truncate", !notif.isRead && "text-foreground")}>
            {notif.title}
          </p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: tr }) : ''}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notif.message}
        </p>
        <div className="flex items-center justify-between pt-2">
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", getPriorityColor(notif.priority))}>
            {notif.priority === 'high' ? 'Yüksek' : notif.priority === 'medium' ? 'Orta' : 'Düşük'}
          </Badge>
          <div className="flex items-center gap-1">
            {!notif.isRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => markAsRead(notif.id)}
                title="Okundu olarak işaretle"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => removeNotification(notif.id)}
              title="Bildirimi sil"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="relative hover:bg-accent" />}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        <span className="sr-only">Bildirimler</span>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-2 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Bildirimler</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-primary"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Tümünü Okundu İşaretle
              </Button>
            )}
          </div>
        </SheetHeader>

        <Tabs defaultValue="all" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
          <div className="px-6 pt-4 border-b">
            <TabsList className="w-full justify-between bg-transparent">
              <TabsTrigger value="all" className="text-xs px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Tümü</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Okunmamış {unreadCount > 0 && <span className="ml-1 opacity-70">({unreadCount})</span>}
              </TabsTrigger>
              <TabsTrigger value="alerts" className="text-xs px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Uyarılar</TabsTrigger>
              <TabsTrigger value="system" className="text-xs px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Sistem</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <ScrollArea className="h-full px-6 py-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => (
                  <NotificationItem key={notif.id} notif={notif} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
                  <div className="bg-muted rounded-full p-3">
                    <Bell className="h-6 w-6 text-muted-foreground opacity-50" />
                  </div>
                  <p className="text-sm text-muted-foreground">Bu kategoride bildirim bulunmuyor.</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
