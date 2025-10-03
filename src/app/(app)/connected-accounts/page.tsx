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
import { Instagram, Facebook, Link2, Plus, Youtube, LoaderCircle, Twitter, Unlink } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { SocialMediaAccount, PlatformCredentials } from '@/lib/types';
import { getYoutubeAuthUrl } from '@/ai/flows/youtube-auth';
import { getInstagramAuthUrl } from '@/ai/flows/instagram-auth';
import { useRouter } from 'next/navigation';


const platformIcons: { [key: string]: React.ElementType } = {
  Instagram,
  Facebook,
  YouTube: Youtube,
  Twitter,
};

export default function ConnectedAccountsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const accountsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/socialMediaAccounts`);
  }, [user, firestore]);

  const credsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'platformCredentials');
  }, [user, firestore]);

  const { data: accounts, isLoading: isLoadingAccounts } = useCollection<SocialMediaAccount>(accountsCollectionRef);
  const { data: credentialsList, isLoading: isLoadingCreds } = useCollection<PlatformCredentials>(credsCollectionRef);

  const credentials = useMemo(() => {
    if (!credentialsList) return {};
    return credentialsList.reduce((acc, cred) => {
        acc[cred.platform] = cred;
        return acc;
    }, {} as {[key: string]: PlatformCredentials});
  }, [credentialsList]);

  const handleDisconnect = async (accountId: string) => {
    if (!accountsCollectionRef) return;
    try {
        const docRef = doc(accountsCollectionRef, accountId);
        await deleteDoc(docRef);
        toast({ title: "Account Disconnected", description: "The social media account has been removed." });
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error", description: `Failed to disconnect account: ${error.message}` });
    }
  };

  const handleConnect = async (platform: PlatformCredentials['platform']) => {
    setIsConnecting(platform);
    
    const creds = credentials?.[platform];
    if (!creds?.clientId || !creds?.clientSecret) {
        toast({ variant: 'destructive', title: 'Connection Error', description: `Credentials for ${platform} must be saved first in the API Credentials page.` });
        setIsConnecting(null);
        return;
    }

    try {
        let authUrlResult;
        if (platform === 'YouTube') {
            authUrlResult = await getYoutubeAuthUrl({clientId: creds.clientId, clientSecret: creds.clientSecret});
        } else if (platform === 'Instagram') {
            authUrlResult = await getInstagramAuthUrl({clientId: creds.clientId, clientSecret: creds.clientSecret});
        } else {
             throw new Error("This platform does not support OAuth connection.");
        }
        window.location.href = authUrlResult.url;
    } catch (error: any) {
        console.error(`Failed to get ${platform} auth URL`, error);
        toast({
            variant: "destructive",
            title: `${platform} Connection Failed`,
            description: error.message || `Could not initiate connection. Please try again.`,
        });
        setIsConnecting(null);
    }
  }
  
  const isLoading = isLoadingAccounts || isLoadingCreds;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
          <CardTitle>Your Accounts</CardTitle>
          <CardDescription>
            Connect or disconnect your social media profiles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <div className="flex justify-center p-8"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>}
          
          {!isLoading && accounts && accounts.length > 0 && accounts.map((account) => {
            const Icon = platformIcons[account.platform] || Link2;
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
                        <p className="text-xs text-muted-foreground">Page: {account.facebookPageName}</p>
                    )}
                  </div>
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Unlink className="mr-2 h-4 w-4" />
                        Disconnect
                    </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogDescription>This will permanently remove the connection for @{account.username}. You will need to re-authenticate to connect it again.</AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDisconnect(account.id)}>Disconnect</AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
            )
           })}
           {!isLoading && (!accounts || accounts.length === 0) && (
             <p className="text-muted-foreground text-center py-8">No accounts connected yet. Add one to get started!</p>
           )}
        </CardContent>
         <CardFooter className="border-t px-6 py-4 flex flex-wrap gap-2">
            {isConnecting === 'Instagram' ? <Button disabled><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Connecting...</Button> : <Button onClick={() => handleConnect('Instagram')}><Instagram className="mr-2 h-4 w-4" /> Add Instagram/Facebook Account</Button>}
            {isConnecting === 'YouTube' ? <Button disabled><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Connecting...</Button> : <Button onClick={() => handleConnect('YouTube')}><Youtube className="mr-2 h-4 w-4" /> Add YouTube Account</Button>}
             <Button onClick={() => router.push('/api-keys')} variant="secondary">Manage API Credentials</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    