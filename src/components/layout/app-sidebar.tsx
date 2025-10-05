'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  DollarSign,
  Home,
  Lightbulb,
  MessageSquarePlus,
  PanelLeft,
  Link2,
  LogOut,
  FileText,
  Settings,
  KeyRound,
  Shield,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/firebase';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/posts', icon: FileText, label: 'Posts' },
  { href: '/campaign-ideas', icon: Lightbulb, label: 'Campaign Ideas' },
  { href: '/connected-accounts', icon: Link2, label: 'Connected Accounts' },
  { href: '/pricing', icon: DollarSign, label: 'Pricing' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const auth = useAuth();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex w-full items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <svg
              className="size-7 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                fill="currentColor"
              />
              <path
                d="M12 17.5C15.0376 17.5 17.5 15.0376 17.5 12C17.5 8.96243 15.0376 6.5 12 6.5C8.96243 6.5 6.5 8.96243 6.5 12C6.5 15.0376 8.96243 17.5 12 17.5Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 2V22"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-headline text-lg font-semibold">
              OmniPost AI
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="size-7 data-[collapsible=icon]:hidden"
            onClick={toggleSidebar}
          >
            <PanelLeft />
          </Button>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                icon={<item.icon />}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>{item.label}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <Separator className="my-2" />
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/settings')}
              icon={<Settings />}
              tooltip={{ children: 'Settings' }}
            >
              <Link href="/settings">Team Settings</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/api-keys'}
              icon={<KeyRound />}
              tooltip={{ children: 'API Credentials' }}
            >
              <Link href="/api-keys">API Credentials</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/admin_panel'}
              icon={<Shield />}
              tooltip={{ children: 'Admin Panel' }}
            >
              <Link href="/admin_panel">Admin Panel</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/superadmin_panal'}
              icon={<Shield />}
              tooltip={{ children: 'Super Admin' }}
            >
              <Link href="/superadmin_panal">Super Admin</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                icon={<LogOut />}
                tooltip={{ children: 'Log Out' }}
              >
                Log Out
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}