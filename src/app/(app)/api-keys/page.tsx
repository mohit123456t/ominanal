'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, Plus, Trash2, Copy, LoaderCircle, Youtube, Link, Unlink, Instagram, Facebook, AlertCircle } from 'lucide-react';
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
import { useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { SocialMediaAccount } from '@/lib/types';
import { getYoutubeAuthUrl } from '@/ai/flows/youtube-auth';
import { getInstagramAuthUrl } from '@/ai/flows/instagram-auth';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function ApiKeysPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isConnectingYouTube, setIsConnectingYouTube] = useState(false);
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);

  const { toast } = useToast();

  const socialMediaAccountsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'socialMediaAccounts');
  }, [user, firestore]);

  const { data: keys, isLoading } = useCollection<SocialMediaAccount>(socialMediaAccountsCollection);

  const youtubeAccount = useMemo(() => keys?.find(k => k.platform === 'YouTube'), [keys]);
  const instagramAccount = useMemo(() => keys?.find(k => k.platform === 'Instagram'), [keys]);
  
  const youtubeRedirectUri = typeof window !== 'undefined' ? `${window.location.origin}/youtube-callback` : '';
  const instagramRedirectUri = typeof window !== 'undefined' ? `${window.location.origin}/instagram-callback` : '';


  const handleDeleteKey = (accountId: string) => {
    if (!socialMediaAccountsCollection) return;
    const docRef = doc(socialMediaAccountsCollection, accountId);
    deleteDocumentNonBlocking(docRef);
    toast({
        title: 'Connection Removed',
        description: `The connection has been removed.`,
      });
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  const handleConnectYouTube = async () => {
    setIsConnectingYouTube(true);
    try {
        const { url } = await getYoutubeAuthUrl();
        window.location.href = url;
    } catch (error) {
        console.error("Failed to get YouTube auth URL", error);
        toast({
            variant: "destructive",
            title: "YouTube Connection Failed",
            description: "Could not initiate connection with YouTube. Please try again.",
        });
        setIsConnectingYouTube(false);
    }
  }

  const handleConnectInstagram = async () => {
    setIsConnectingInstagram(true);
    try {
        const { url } = await getInstagramAuthUrl();
        window.location.href = url;
    } catch (error) {
        console.error("Failed to get Instagram auth URL", error);
        toast({
            variant: "destructive",
            title: "Instagram Connection Failed",
            description: "Could not initiate connection with Instagram. Please try again.",
        });
        setIsConnectingInstagram(false);
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <KeyRound className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl font-headline font-bold tracking-tight text-foreground sm:text-4xl">
          API Keys & Connections
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Securely manage your connections to enable posting to your social media accounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OAuth Connections</CardTitle>
          <CardDescription>
            Connect your accounts by authenticating with the platform. You'll be redirected to their site to grant permission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className='space-y-6'>
                 {/* Instagram Connection */}
                <div className="space-y-4">
                    {instagramAccount ? (
                        <div className='flex items-center justify-between p-4 border rounded-lg'>
                            <div className='flex items-center gap-2'>
                                <Instagram className="h-6 w-6 text-pink-600" />
                                <div>
                                    <p className='font-medium'>Instagram & Facebook</p>
                                    <p className='text-sm text-muted-foreground'>{instagramAccount.username}</p>
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
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This action cannot be undone. This will permanently remove your connection for Instagram & Facebook.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteKey(instagramAccount.id)}>
                                    Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ) : (
                        <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Platform Requirement</AlertTitle>
                                <AlertDescription>
                                    To post automatically, Instagram requires a <b>Business</b> or <b>Creator</b> account linked to a Facebook Page. This single connection enables posting to both platforms.
                                </AlertDescription>
                            </Alert>
                             <div className="space-y-2">
                                <Label>Connect to Instagram & Facebook</Label>
                                 <p className="text-xs text-muted-foreground">You will be redirected to Facebook to authorize the application. Make sure your developer app has the correct Redirect URIs configured.</p>
                                <Button onClick={handleConnectInstagram} disabled={isConnectingInstagram} className='w-full sm:w-auto'>
                                {isConnectingInstagram ? (
                                    <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Redirecting...</>
                                    ) : (
                                    <><Link className="mr-2 h-4 w-4" /> Connect Instagram & Facebook</>
                                )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* YouTube Connection */}
                 <div className="space-y-4">
                    {youtubeAccount ? (
                        <div className='flex items-center justify-between p-4 border rounded-lg'>
                            <div className='flex items-center gap-2'>
                                <Youtube className="h-6 w-6 text-red-600" />
                                <div>
                                    <p className='font-medium'>YouTube Connected</p>
                                    <p className='text-sm text-muted-foreground'>{youtubeAccount.username}</p>
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
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This action cannot be undone. This will permanently remove your connection for YouTube.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteKey(youtubeAccount.id)}>
                                    Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ) : (
                        <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                            <div className="space-y-2">
                                <Label>Connect to YouTube</Label>
                                <p className="text-xs text-muted-foreground">You will be redirected to Google to authorize the application. Make sure your Google Cloud project has the correct Redirect URIs configured.</p>

                                <Button onClick={handleConnectYouTube} disabled={isConnectingYouTube} className='w-full sm:w-auto'>
                                {isConnectingYouTube ? (
                                    <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Redirecting...</>
                                    ) : (
                                    <><Link className="mr-2 h-4 w-4" /> Connect YouTube</>
                                )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
