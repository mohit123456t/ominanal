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
import { KeyRound, LoaderCircle, Youtube, Instagram, Save, Twitter, Info, Facebook, Unlink, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { PlatformCredentials, SocialMediaAccount } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getYoutubeAuthUrl } from '@/ai/flows/youtube-auth';
import { getInstagramAuthUrl } from '@/ai/flows/instagram-auth';
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


function OAuthForm({
    platform,
    credentials,
    onSave,
    fields,
    helpText,
    onConnect,
    isConnecting,
    accounts,
    onDisconnect
}: {
    platform: PlatformCredentials['platform'];
    credentials: Partial<PlatformCredentials> | null;
    onSave: (platform: PlatformCredentials['platform'], data: Partial<PlatformCredentials>) => Promise<void>;
    fields: {id: keyof PlatformCredentials, label: string, placeholder: string}[];
    helpText: {title: string, link: string, description: string};
    onConnect: (platform: PlatformCredentials['platform']) => void;
    isConnecting: boolean;
    accounts: SocialMediaAccount[];
    onDisconnect: (accountId: string) => Promise<void>;
}) {
    const [formData, setFormData] = useState<Partial<PlatformCredentials>>({});
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        setFormData(credentials || {});
    }, [credentials]);

    const handleInputChange = (fieldId: keyof PlatformCredentials, value: string) => {
        setFormData(prev => ({...prev, [fieldId]: value}));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(platform, formData);
        setIsSaving(false);
    }
    
    const platformName = platform === 'Instagram' ? 'Facebook/Instagram' : platform;
    const hasCreds = credentials && Object.values(credentials).some(v => v);

    return (
        <div className="space-y-4">
             <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 !text-blue-600" />
              <AlertTitle className="text-blue-800">{helpText.title}</AlertTitle>
              <AlertDescription className="text-blue-700">
               {helpText.description} <a href={helpText.link} target="_blank" rel="noopener noreferrer" className="underline font-semibold">Developer Console</a>.
              </AlertDescription>
          </Alert>

            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
                <h3 className="font-medium">Step 1: Save Credentials</h3>
                {fields.map(field => (
                    <div className="space-y-2" key={field.id}>
                        <Label htmlFor={`${platform}-${field.id}`}>{field.label}</Label>
                        <Input 
                            id={`${platform}-${field.id}`} 
                            type="password"
                            value={formData[field.id] as string || ''} 
                            onChange={e => handleInputChange(field.id, e.target.value)} 
                            placeholder={field.placeholder} 
                        />
                    </div>
                ))}
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save {platformName} Credentials
                </Button>
            </form>
            
            <div className="space-y-4 p-4 border rounded-md">
                 <h3 className="font-medium">Step 2: Connect Accounts</h3>
                 <div className="space-y-2">
                    {accounts.map(account => (
                        <div key={account.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <p className="font-mono text-sm">@{account.username}</p>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Unlink className="mr-2 h-4 w-4" />
                                    Disconnect
                                </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                <AlertDialogDescription>This will permanently remove the connection for @{account.username}. You will need to re-authenticate to connect it again.</AlertDialogDescription>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDisconnect(account.id)}>Disconnect</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))}
                 </div>
                 <Button onClick={() => onConnect(platform)} disabled={!hasCreds || isConnecting}>
                    {isConnecting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                    Add New {platformName} Account
                </Button>
                {!hasCreds && <p className="text-xs text-muted-foreground">You must save your credentials before you can connect an account.</p>}
            </div>
        </div>
    );
}


export default function ApiKeysView({ credentialsList, isLoadingCreds }: { credentialsList: PlatformCredentials[], isLoadingCreds: boolean }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const { toast } = useToast();

  const accountsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'socialMediaAccounts');
  }, [user, firestore]);
  
  const { data: accounts, isLoading: isLoadingAccounts } = useCollection<SocialMediaAccount>(accountsCollectionRef);

  const credentials = useMemo(() => {
    if (!credentialsList) return {};
    return credentialsList.reduce((acc, cred) => {
        acc[cred.platform] = cred;
        return acc;
    }, {} as {[key: string]: PlatformCredentials});
  }, [credentialsList]);


  const youtubeCreds = useMemo(() => credentials?.['YouTube'] || null, [credentials]);
  const instagramCreds = useMemo(() => credentials?.['Instagram'] || null, [credentials]);
  const twitterCreds = useMemo(() => credentials?.['Twitter'] || null, [credentials]);

  const youtubeAccounts = useMemo(() => accounts?.filter(a => a.platform === 'YouTube') || [], [accounts]);
  const instagramAccounts = useMemo(() => accounts?.filter(a => a.platform === 'Instagram' || a.platform === 'Facebook') || [], [accounts]);


  useEffect(() => {
    if (!isLoadingCreds) {
      if (!instagramCreds) setActiveAccordionItem('instagram');
      else if (!youtubeCreds) setActiveAccordionItem('youtube');
      else if (!twitterCreds) setActiveAccordionItem('twitter');
    }
  }, [isLoadingCreds, instagramCreds, youtubeCreds, twitterCreds]);

  const handleSaveCredentials = async (platform: PlatformCredentials['platform'], data: Partial<PlatformCredentials>) => {
    if (!user || !firestore) return;
    const credsCollectionRef = collection(firestore, 'users', user.uid, 'platformCredentials');
    
    try {
      const docRef = doc(credsCollectionRef, platform);
      const platformData = {
        id: platform,
        platform,
        userId: user.uid,
        ...data,
      };

      await setDoc(docRef, platformData, { merge: true });
      
      toast({ title: `${platform} Credentials Saved!` });

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    }
  };

  const handleConnect = async (platform: PlatformCredentials['platform']) => {
    if (!user) return;
    setIsConnecting(platform);
    
    const creds = credentials?.[platform];

    if (!creds?.clientId || !creds?.clientSecret) {
        toast({ variant: 'destructive', title: 'Connection Error', description: `Credentials for ${platform} must be saved first.` });
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
  
  const isLoading = isLoadingAccounts || isLoadingCreds;

  if (isLoading) {
    return (
        <div className="flex justify-center p-8">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Platform Setup</CardTitle>
          <CardDescription>
           Enter your API credentials once per platform, then connect as many accounts as you need.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Accordion type="single" collapsible value={activeAccordionItem} onValueChange={setActiveAccordionItem} className="w-full">
            
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
                        credentials={instagramCreds}
                        onSave={handleSaveCredentials}
                        fields={[
                            {id: 'clientId', label: 'Facebook App ID', placeholder: 'Enter your Facebook App ID'},
                            {id: 'clientSecret', label: 'Facebook App Secret', placeholder: 'Enter your Facebook App Secret'},
                        ]}
                        helpText={{
                            title: 'Facebook Developer App Required',
                            description: 'Get these from your app settings in the',
                            link: 'https://developers.facebook.com/apps/'
                        }}
                        onConnect={handleConnect}
                        isConnecting={isConnecting === 'Instagram'}
                        accounts={instagramAccounts}
                        onDisconnect={handleDisconnect}
                    />
                </AccordionContent>
            </AccordionItem>

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
                        credentials={youtubeCreds}
                        onSave={handleSaveCredentials}
                        fields={[
                            {id: 'clientId', label: 'Google Client ID', placeholder: 'Enter your Google Client ID'},
                            {id: 'clientSecret', label: 'Google Client Secret', placeholder: 'Enter your Google Client Secret'},
                        ]}
                        helpText={{
                            title: 'Google Cloud Project Required',
                            description: 'Get these from your project credentials in the',
                            link: 'https://console.cloud.google.com/'
                        }}
                        onConnect={handleConnect}
                        isConnecting={isConnecting === 'YouTube'}
                        accounts={youtubeAccounts}
                        onDisconnect={handleDisconnect}
                    />
                </AccordionContent>
            </AccordionItem>

            </Accordion>
        </CardContent>
      </Card>
      
    </div>
  );
}

    