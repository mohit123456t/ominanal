'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instagram, Facebook, Twitter, Linkedin, Link2, Plus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Platform = {
  id: 'instagram' | 'facebook' | 'x' | 'linkedin';
  name: string;
  icon: React.ElementType;
  connected: boolean;
};

const initialPlatforms: Platform[] = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, connected: true },
  { id: 'facebook', name: 'Facebook', icon: Facebook, connected: true },
  { id: 'x', name: 'X (Twitter)', icon: Twitter, connected: true },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, connected: false },
];

export default function ConnectedAccountsPage() {
  const [accounts, setAccounts] = useState<Platform[]>(initialPlatforms);

  const toggleConnection = (id: string) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((account) =>
        account.id === id ? { ...account, connected: !account.connected } : account
      )
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
       <div className="text-center">
        <Link2 className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl font-headline font-bold tracking-tight text-foreground sm:text-4xl">
          Connected Accounts
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Manage your connected social media accounts to streamline your posting process.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Connections</CardTitle>
          <CardDescription>
            Connect or disconnect your social media profiles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-4">
                <account.icon className="h-8 w-8 text-muted-foreground" />
                <span className="font-medium text-lg">{account.name}</span>
              </div>
              <div className="flex items-center gap-4">
                 <span className={cn("text-sm font-medium", account.connected ? "text-primary" : "text-muted-foreground")}>
                    {account.connected ? 'Connected' : 'Disconnected'}
                 </span>
                <Switch
                  id={account.id}
                  checked={account.connected}
                  onCheckedChange={() => toggleConnection(account.id)}
                  aria-label={`Connect/Disconnect ${account.name}`}
                />
              </div>
            </div>
          ))}
        </CardContent>
         <CardFooter className="border-t px-6 py-4">
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Account
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
