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
import { KeyRound, LoaderCircle, Youtube, Link, Unlink, Instagram, AlertCircle, Trash2, Save, Twitter, Info, Facebook } from 'lucide-react';
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
      username: account?.username || 'Twitter Account',
      apiKey,
      apiSecret,
      accessToken,
      accessTokenSecret,
      connected: !!(apiKey && apiSecret && accessToken && accessTokenSecret),
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
        {account?.id ? 'Update Credentials' : 'Save Credentials'}
      </Button>
    </form>
  )
}

function OAuthForm({ 
    platform, 
    account, 
    onSave, 
    onConnect 
}: { 
    platform: 'YouTube' | 'Instagram';
    account: Partial<SocialMediaAccount> | null;
    onSave: (platform: 'YouTube' | 'Instagram', data: Partial<SocialMediaAccount>) => Promise<void>;
    onConnect: (platform: 'YouTube' | 'Instagram') => Promise<void>;
}) {
    const [clientId, setClientId] = useState(account?.clientId || '');
    const [clientSecret, setClientSecret] = useState(account?.clientSecret || '');
    const [isSaving, setIsSaving] = useState(false);

    const platformName = platform === 'Instagram' ? 'Facebook' : platform;
    
    useEffect(() => {
        if (account) {
            setClientId(account.clientId || '');
            setClientSecret(account.clientSecret || '');
        }
    }, [account]);


    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(platform, {
            clientId,
            clientSecret,
        });
        setIsSaving(false);
    }
    
    const handleConnect = () => {
        if (!account?.clientId || !account?.clientSecret) {
            alert(`Please save your ${platformName} Client ID and Secret first.`);
            return;
        }
        onConnect(platform);
    }
    
    const handleDisconnect = async () => {
        await onSave(platform, {
            connected: false,
            apiKey: '',
            refreshToken: '',
            username: '',
            instagramId: '',
            facebookPageId: '',
            facebookPageName: ''
        });
    }

    return (
        <div className='space-y-4'>
            {account?.connected ? (
                 <div className='flex items-center justify-between'>
                    <p className='text-sm text-muted-foreground'>Connected as <span className="font-semibold text-foreground">{account.username}</span>.</p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Unlink className="mr-2 h-4 w-4" />
                            Disconnect
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogDescription>This will remove your {platformName} connection and you will need to re-authenticate.</AlertDialogDescription>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDisconnect}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ) : (
                <div className='space-y-6'>
                    <form onSubmit={handleSave} className="space-y-4">
                         <Alert variant="default" className="bg-blue-50 border-blue-200">
                              <Info className="h-4 w-4 !text-blue-600" />
                              <AlertTitle className="text-blue-800">OAuth Credentials Required</AlertTitle>
                              <AlertDescription className="text-blue-700">
                                You need to create an App in the <a href={platform === 'YouTube' ? 'https://console.cloud.google.com/': 'https://developers.facebook.com/apps/'} target="_blank" rel="noopener noreferrer" className="underline font-semibold">{platformName} Developer Console</a> to get these credentials.
                              </AlertDescription>
                          </Alert>
                        <div className="space-y-2">
                            <Label htmlFor={`${platform}-client-id`}>{platformName} App/Client ID</Label>
                            <Input id={`${platform}-client-id`} value={clientId} onChange={e => setClientId(e.target.value)} placeholder={`Enter your ${platformName} App/Client ID`} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`${platform}-client-secret`}>{platformName} App/Client Secret</Label>
                            <Input id={`${platform}-client-secret`} value={clientSecret} onChange={e => setClientSecret(e.target.value)} placeholder={`Enter your ${platformName} App/Client Secret`} />
                        </div>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                             {account?.id ? 'Update' : 'Save'} Credentials
                        </Button>
                    </form>
                    <Separator />
                    <Button onClick={handleConnect} disabled={!account?.id}>
                        <Link className="mr-2 h-4 w-4" />
                        Connect {platformName} Account
                    </Button>
                </div>
            )}
        </div>
    )
}


export default function ApiKeysPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isConnecting, setIsConnecting] = useState<null | 'YouTube' | 'Instagram'>(null);
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


  const handleSaveAccount = async (platform: 'Twitter' | 'YouTube' | 'Instagram', data: Partial<SocialMediaAccount>) => {
    if (!user || !firestore || !socialMediaAccountsCollection) return;
    
    let targetAccount;
    if (platform === 'Twitter') targetAccount = twitterAccount;
    if (platform === 'YouTube') targetAccount = youtubeAccount;
    if (platform === 'Instagram') targetAccount = instagramAccount;

    try {
      const accountData = {
        ...data,
        platform,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      };

      if (targetAccount) {
        // Update existing document
        const docRef = doc(firestore, `users/${user.uid}/socialMediaAccounts`, targetAccount.id);
        await updateDoc(docRef, accountData);
        toast({ title: `${platform} Credentials Updated!` });
      } else {
        // Create new document
        await addDoc(socialMediaAccountsCollection, { ...accountData, createdAt: new Date().toISOString(), username: `${platform} Account` });
        toast({ title: `${platform} Credentials Saved!` });
        if(platform !== 'Twitter') setActiveAccordionItem(undefined); 
      }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    }
  };


  const handleConnect = async (platform: 'YouTube' | 'Instagram') => {
    setIsConnecting(platform);
    
    const account = platform === 'YouTube' ? youtubeAccount : instagramAccount;
    if (!account?.clientId || !account?.clientSecret) {
        toast({ variant: 'destructive', title: 'Connection Error', description: 'Client ID and Secret must be saved first.' });
        setIsConnecting(null);
        return;
    }

    try {
        let authUrlResult;
        if (platform === 'YouTube') {
            authUrlResult = await getYoutubeAuthUrl({clientId: account.clientId, clientSecret: account.clientSecret});
        } else {
            authUrlResult = await getInstagramAuthUrl({clientId: account.clientId, clientSecret: account.clientSecret});
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
          Manage your credentials and connections to post to your social media accounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Your Connections</CardTitle>
          <CardDescription>
           Enter your API credentials for each platform you want to connect.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Accordion type="single" collapsible value={activeAccordionItem} onValueChange={setActiveAccordionItem} className="w-full">
            
            {/* Instagram / Facebook */}
            <AccordionItem value="instagram">
                <AccordionTrigger>
                    <div className='flex items-center gap-2'>
                        <Instagram className="h-5 w-5 text-pink-600" />
                        <Facebook className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Instagram & Facebook</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-muted/30 rounded-b-lg">
                    <OAuthForm 
                        platform='Instagram'
                        account={instagramAccount}
                        onSave={handleSaveAccount}
                        onConnect={handleConnect}
                    />
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
                    <OAuthForm 
                        platform='YouTube'
                        account={youtubeAccount}
                        onSave={handleSaveAccount}
                        onConnect={handleConnect}
                    />
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
                    <TwitterForm account={twitterAccount} onSave={(data) => handleSaveAccount('Twitter', data)} />
                </AccordionContent>
            </AccordionItem>

            </Accordion>
        </CardContent>
      </Card>
      
    </div>
  );
}
