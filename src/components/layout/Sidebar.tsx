"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Car, Building, Star, History, LayoutDashboard, Users, Wrench, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Reservasyonlarım', href: '/reservations', icon: Calendar },
  { name: 'Araçlarım', href: '/cars', icon: Car },
  { name: 'Ofislerim', href: '/offices', icon: Building },
  { name: 'Kullanıcılar', href: '/users', icon: Users },
  { name: 'Bakım Yönetimi', href: '/maintenance', icon: Wrench },
  { name: 'Favorilerim', href: '/favorites', icon: Star },
  { name: 'KABİS', href: '/kabis', icon: ShieldCheck },
  { name: 'Son Görüntülenenler', href: '/cars/recently-viewed', icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-card border-r shadow-sm">
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Car className="h-6 w-6" />
          <span>RentCar CRM</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground'
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
