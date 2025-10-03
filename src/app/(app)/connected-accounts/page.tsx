'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instagram, Facebook, Link2, Plus, Youtube, LoaderCircle, Twitter } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { SocialMediaAccount } from '@/lib/types';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';


const platformIcons = {
  Instagram,
  Facebook,
  YouTube: Youtube,
  Twitter,
};

export default function ConnectedAccountsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const accountsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/socialMediaAccounts`);
  }, [user, firestore]);

  const { data: accounts, isLoading, error } = useCollection<SocialMediaAccount>(accountsCollectionRef);

  const toggleConnection = (id: string, currentStatus: boolean) => {
    if (!accountsCollectionRef) return;
    const docRef = doc(accountsCollectionRef, id);
    updateDocumentNonBlocking(docRef, { connected: !currentStatus });
  };
  
  const availablePlatforms = useMemo(() => {
    const connectedPlatforms = accounts?.map(acc => acc.platform) || [];
    return Object.keys(platformIcons).filter(p => !connectedPlatforms.includes(p));
  }, [accounts]);


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
          {isLoading && <div className="flex justify-center p-8"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>}
          {!isLoading && accounts && accounts.map((account) => {
            const Icon = platformIcons[account.platform as keyof typeof platformIcons] || Link2;
            const isInstagram = account.platform === 'Instagram';
            
            return (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <Icon className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-lg">{account.platform}</p>
                    <p className="text-sm text-muted-foreground">{account.username}</p>
                    {isInstagram && account.facebookPageName && (
                        <p className="text-sm text-muted-foreground">Page: {account.facebookPageName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className={cn("text-sm font-medium", account.connected ? "text-primary" : "text-muted-foreground")}>
                      {account.connected ? 'Connected' : 'Disconnected'}
                   </span>
                  <Switch
                    id={account.id}
                    checked={!!account.connected}
                    onCheckedChange={() => toggleConnection(account.id, !!account.connected)}
                    aria-label={`Connect/Disconnect ${account.platform}`}
                  />
                </div>
              </div>
            )
           })}
           {!isLoading && (!accounts || accounts.length === 0) && (
             <p className="text-muted-foreground text-center py-8">No accounts connected yet. Add one to get started!</p>
           )}
        </CardContent>
         <CardFooter className="border-t px-6 py-4">
            <Button onClick={() => router.push('/api-keys')}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Account
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
