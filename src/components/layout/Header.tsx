"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';

const headerLinks = [
  { name: 'Reservasyonlarım', href: '/reservations' },
  { name: 'Araçlarım', href: '/cars' },
  { name: 'Ofislerim', href: '/offices' },
];

export function Header() {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile sidebar trigger here if needed in future */}
      <button type="button" className="-m-2.5 p-2.5 text-muted-foreground lg:hidden">
        <span className="sr-only">Menüyü aç</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Header Links */}
      <div className="flex flex-1 gap-x-4 lg:gap-x-6 items-center">
        <nav className="hidden lg:flex lg:gap-x-8">
          {headerLinks.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-semibold leading-6 transition-colors hover:text-primary",
                  isActive ? "text-primary border-b-2 border-primary pb-1" : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Dark Mode Toggle */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Temayı değiştir</span>
        </Button>

        <NotificationCenter />
        
        {/* Separator */}
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

        {/* Profile dropdown */}
        <DropdownMenu>

          <DropdownMenuTrigger className="relative flex items-center gap-2 rounded-full p-2 hover:bg-accent hover:text-accent-foreground outline-none">
            <span className="sr-only">Kullanıcı menüsünü aç</span>
            <span className="hidden lg:flex lg:items-center">
              <span className="text-sm font-semibold leading-6 text-foreground" aria-hidden="true">
                Admin User
              </span>
            </span>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="@admin" />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem>Ayarlar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Çıkış Yap</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
