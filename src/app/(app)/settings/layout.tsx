'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { KeyRound, Users } from 'lucide-react';

const settingsNav = [
  { name: 'Team', href: '/settings/team', icon: Users },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[250px_1fr] gap-10 items-start">
      <nav className="hidden md:flex flex-col gap-1 text-sm text-muted-foreground">
        {settingsNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
              (pathname === item.href || (item.href === '/settings' && pathname.startsWith('/settings'))) && 'bg-muted text-primary'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>
      <main>{children}</main>
    </div>
  );
}
