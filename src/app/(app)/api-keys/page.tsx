'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, LoaderCircle, Youtube, Link, Unlink, Instagram, AlertCircle, Trash2, Save, Twitter, Info } from 'lucide-react';
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
import { collection, doc, addDoc, updateDoc } from 'firebase/firestore';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { SocialMediaAccount } from '@/lib/types';
import { getYoutubeAuthUrl } from '@/ai/flows/youtube-auth';
import { getInstagramAuthUrl } from '@/ai/flows/instagram-auth';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


function TwitterForm({ account, onSave }: { account: Partial<SocialMediaAccount> | null, onSave: (data: Partial<SocialMediaAccount>) => Promise<void> }) {
  const [apiKey, setApiKey] = useState(account?.apiKey || '');
  const [apiSecret, setApiSecret] = useState(account?.apiSecret || '');
  const [accessToken, setAccessToken] = useState(account?.accessToken || '');
  const [accessTokenSecret, setAccessTokenSecret] = useState(account?.accessTokenSecret || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({
      platform: 'Twitter',
      username: 'Twitter Account', // A generic name, can be updated later
      apiKey,
      apiSecret,
      accessToken,
      accessTokenSecret,
      connected: true,
    });
    setIsSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <Alert variant="default" className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 !text-blue-600" />
          <AlertTitle className="text-blue-800">Developer Account Required</AlertTitle>
          <AlertDescription className="text-blue-700">
           To post to X (formerly Twitter), you need a developer account with v2 API access. You can get your credentials from the <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Twitter Developer Portal</a>.
          </AlertDescription>
      </Alert>
      <div className="space-y-2">
        <Label htmlFor="twitter-api-key">API Key</Label>
        <Input id="twitter-api-key" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Enter your API Key" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="twitter-api-secret">API Key Secret</Label>
        <Input id="twitter-api-secret" value={apiSecret} onChange={e => setApiSecret(e.target.value)} placeholder="Enter your API Key Secret" />
      </div>
       <div className="space-y-2">
        <Label htmlFor="twitter-access-token">Access Token</Label>
        <Input id="twitter-access-token" value={accessToken} onChange={e => setAccessToken(e.target.value)} placeholder="Enter your Access Token" />
      </div>
       <div className="space-y-2">
        <Label htmlFor="twitter-access-token-secret">Access Token Secret</Label>
        <Input id="twitter-access-token-secret" value={accessTokenSecret} onChange={e => setAccessTokenSecret(e.target.value)} placeholder="Enter your Access Token Secret" />
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        {account ? 'Update Credentials' : 'Save & Connect'}
      </Button>
    </form>
  )
}


export default function ApiKeysPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isConnectingYouTube, setIsConnectingYouTube] = useState(false);
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>();


  const { toast } = useToast();

  const socialMediaAccountsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'socialMediaAccounts');
  }, [user, firestore]);

  const { data: keys, isLoading } = useCollection<SocialMediaAccount>(socialMediaAccountsCollection);

  const youtubeAccount = useMemo(() => keys?.find(k => k.platform === 'YouTube'), [keys]);
  const instagramAccount = useMemo(() => keys?.find(k => k.platform === 'Instagram'), [keys]);
  const twitterAccount = useMemo(() => keys?.find(k => k.platform === 'Twitter'), [keys]);

  useEffect(() => {
    if (!isLoading) {
      if (!instagramAccount) setActiveAccordionItem('instagram');
      else if (!youtubeAccount) setActiveAccordionItem('youtube');
      else if (!twitterAccount) setActiveAccordionItem('twitter');
    }
  }, [isLoading, instagramAccount, youtubeAccount, twitterAccount]);


  const handleDeleteKey = (accountId: string) => {
    if (!socialMediaAccountsCollection) return;
    const docRef = doc(socialMediaAccountsCollection, accountId);
    deleteDocumentNonBlocking(docRef);
    toast({
        title: 'Connection Removed',
        description: `The connection has been removed.`,
      });
  };
  
  const handleSaveTwitter = async (data: Partial<SocialMediaAccount>) => {
    if (!user || !firestore || !socialMediaAccountsCollection) return;

    try {
      const accountData = {
        ...data,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      };

      if (twitterAccount) {
        // Update existing document
        const docRef = doc(firestore, `users/${user.uid}/socialMediaAccounts`, twitterAccount.id);
        await updateDoc(docRef, accountData);
         toast({ title: 'Twitter Credentials Updated!' });
      } else {
        // Create new document
        await addDoc(socialMediaAccountsCollection, { ...accountData, createdAt: new Date().toISOString() });
        toast({ title: 'Twitter Account Connected!' });
        setActiveAccordionItem(undefined); // Close accordion on success
      }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    }
  };


  const handleConnectYouTube = async () => {
    setIsConnectingYouTube(true);
    try {
        const { url } = await getYoutubeAuthUrl();
        window.location.href = url;
    } catch (error: any) {
        console.error("Failed to get YouTube auth URL", error);
        toast({
            variant: "destructive",
            title: "YouTube Connection Failed",
            description: error.message || "Could not initiate connection with YouTube. Please try again.",
        });
        setIsConnectingYouTube(false);
    }
  }

  const handleConnectInstagram = async () => {
    setIsConnectingInstagram(true);
    try {
        const { url } = await getInstagramAuthUrl();
        window.location.href = url;
    } catch (error: any) {
        console.error("Failed to get Instagram auth URL", error);
        toast({
            variant: "destructive",
            title: "Instagram Connection Failed",
            description: error.message || "Could not initiate connection with Instagram. Please try again.",
        });
        setIsConnectingInstagram(false);
    }
  }
  
  if (isLoading) {
    return (
        <div className="flex justify-center p-8">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <KeyRound className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl font-headline font-bold tracking-tight text-foreground sm:text-4xl">
          API Keys & Connections
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Manage your connections to enable posting to your social media accounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Your Connections</CardTitle>
          <CardDescription>
           Connect to OAuth-based platforms or enter your credentials for key-based platforms.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Accordion type="single" collapsible value={activeAccordionItem} onValueChange={setActiveAccordionItem} className="w-full">
            
            {/* Instagram / Facebook */}
            <AccordionItem value="instagram">
                <AccordionTrigger>
                    <div className='flex items-center gap-2'>
                        <Instagram className="h-5 w-5 text-pink-600" />
                        <span className="font-medium">Instagram & Facebook</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-muted/30 rounded-b-lg">
                    {instagramAccount ? (
                        <div className='flex items-center justify-between'>
                            <p className='text-sm text-muted-foreground'>Connected as <span className="font-semibold text-foreground">{instagramAccount.username}</span>.</p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Unlink className="mr-2 h-4 w-4" />
                                    Disconnect
                                </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                <AlertDialogDescription>This will remove your Instagram & Facebook connection.</AlertDialogDescription>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteKey(instagramAccount.id)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ) : (
                        <div className="space-y-4">
                             <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Platform Requirement</AlertTitle>
                                <AlertDescription>
                                    To post automatically, Instagram requires a <b>Business</b> or <b>Creator</b> account linked to a Facebook Page.
                                </AlertDescription>
                            </Alert>
                             <p className="text-xs text-muted-foreground">You will be redirected to Facebook to authorize the application.</p>
                            <Button onClick={handleConnectInstagram} disabled={isConnectingInstagram}>
                            {isConnectingInstagram ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Redirecting...</> : <><Link className="mr-2 h-4 w-4" /> Connect Instagram & Facebook</>}
                            </Button>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>

            {/* YouTube */}
            <AccordionItem value="youtube">
                <AccordionTrigger>
                    <div className='flex items-center gap-2'>
                        <Youtube className="h-5 w-5 text-red-600" />
                        <span className="font-medium">YouTube</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-muted/30 rounded-b-lg">
                     {youtubeAccount ? (
                        <div className='flex items-center justify-between'>
                            <p className='text-sm text-muted-foreground'>Connected as <span className="font-semibold text-foreground">{youtubeAccount.username}</span>.</p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Unlink className="mr-2 h-4 w-4" />
                                    Disconnect
                                </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                <AlertDialogDescription>This will remove your YouTube connection.</AlertDialogDescription>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteKey(youtubeAccount.id)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ) : (
                         <div className="space-y-4">
                            <p className="text-xs text-muted-foreground">You will be redirected to Google to authorize the application.</p>
                            <Button onClick={handleConnectYouTube} disabled={isConnectingYouTube}>
                            {isConnectingYouTube ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Redirecting...</> : <><Link className="mr-2 h-4 w-4" /> Connect YouTube</>}
                            </Button>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>

             {/* Twitter */}
            <AccordionItem value="twitter">
                <AccordionTrigger>
                    <div className='flex items-center gap-2'>
                        <Twitter className="h-5 w-5 text-sky-500" />
                        <span className="font-medium">X (Twitter)</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-muted/30 rounded-b-lg">
                    <TwitterForm account={twitterAccount} onSave={handleSaveTwitter} />
                </AccordionContent>
            </AccordionItem>

            </Accordion>
        </CardContent>
      </Card>
      
    </div>
  );
}
