'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, Plus, Trash2, Copy, LoaderCircle, Youtube, Link, Unlink, Instagram, Facebook, Twitter as XIcon, Linkedin, AlertCircle } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { SocialMediaAccount } from '@/lib/types';
import { getYoutubeAuthUrl } from '@/ai/flows/youtube-auth';
import { getInstagramAuthUrl } from '@/ai/flows/instagram-auth';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const platformIcons = {
  Instagram: <Instagram className="h-8 w-8 text-pink-600" />,
  Facebook: <Facebook className="h-8 w-8 text-blue-700" />,
  X: <XIcon className="h-8 w-8" />,
  LinkedIn: <Linkedin className="h-8 w-8 text-sky-600" />,
  YouTube: <Youtube className="h-8 w-8 text-red-600" />,
};


export default function ApiKeysPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [newKeyPlatform, setNewKeyPlatform] = useState<SocialMediaAccount['platform'] | ''>('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeySecret, setNewKeySecret] = useState('');
  const [newKeyUsername, setNewKeyUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleAddKey = async () => {
    if (!socialMediaAccountsCollection || !user) return;

    if (newKeyPlatform && newKeyValue && newKeyUsername) {
      setIsSubmitting(true);
      const newKeyData: Omit<SocialMediaAccount, 'id' > = {
        platform: newKeyPlatform as SocialMediaAccount['platform'],
        apiKey: newKeyValue,
        apiSecret: newKeyPlatform === 'X' ? newKeySecret : undefined,
        username: newKeyUsername,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        connected: true,
      };
      
      addDocumentNonBlocking(socialMediaAccountsCollection, newKeyData);

      setNewKeyPlatform('');
      setNewKeyValue('');
      setNewKeySecret('');
      setNewKeyUsername('');
      setIsSubmitting(false);

      toast({
        title: 'Connection Added',
        description: `Your connection for ${newKeyPlatform} has been saved.`,
      });
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please fill out all fields.',
        });
    }
  };

  const handleDeleteKey = async (accountId: string) => {
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

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.startsWith('ya29.') || key.startsWith('EAA')) return 'Connected via OAuth';
    return `${key.substring(0, 4)}************${key.substring(key.length - 4)}`;
  }

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
          <CardTitle>Add New Connection</CardTitle>
          <CardDescription>
            For OAuth connections (YouTube, Instagram), you'll be redirected. For manual API Key connections (X, etc.), you'll need to get an API Key from the platform's developer portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <Select value={newKeyPlatform} onValueChange={(value) => setNewKeyPlatform(value as SocialMediaAccount['platform'])} disabled={isSubmitting}>
                <SelectTrigger className="w-full sm:w-1/2">
                    <SelectValue placeholder="Select Platform..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="X">X (Twitter)</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                </SelectContent>
            </Select>
            
            {newKeyPlatform && (
              <>
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Where to find your API Key?</AlertTitle>
                    <AlertDescription>
                        To get an API key, you typically need to register an application in the developer portal for {newKeyPlatform}. Look for settings related to "API", "Developer Tools", or "Apps" on their website. For X (Twitter), you'll need an 'Essential' access level to get an App's API Key and Secret.
                    </AlertDescription>
                </Alert>
                <div className="space-y-4">
                    <Input
                        type="text"
                        value={newKeyUsername}
                        onChange={(e) => setNewKeyUsername(e.target.value)}
                        placeholder="Username (e.g. @YourHandle)"
                        aria-label="Username"
                        disabled={isSubmitting}
                    />
                    <Input
                        type="password"
                        value={newKeyValue}
                        onChange={(e) => setNewKeyValue(e.target.value)}
                        placeholder={newKeyPlatform === 'X' ? "Paste your API Key here" : "Paste your API Key or Access Token here"}
                        aria-label="API Key Value"
                        disabled={isSubmitting}
                    />
                    {newKeyPlatform === 'X' && (
                        <Input
                            type="password"
                            value={newKeySecret}
                            onChange={(e) => setNewKeySecret(e.target.value)}
                            placeholder="Paste your API Secret Key here"
                            aria-label="API Secret Key"
                            disabled={isSubmitting}
                        />
                    )}
                </div>
                <Button onClick={handleAddKey} disabled={isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Add Key
                </Button>
              </>
            )}

            <div className='border-t pt-4 space-y-6'>
                 <h3 className="font-medium text-lg">OAuth Connections</h3>

                 {/* Instagram Connection */}
                <div className="space-y-4">
                    {instagramAccount ? (
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <Instagram className="h-6 w-6 text-pink-600" />
                                <div>
                                    <p className='font-medium'>Instagram Connected</p>
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
                                    This action cannot be undone. This will permanently remove your connection for Instagram.
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
                                <AlertTitle>Account Requirement</AlertTitle>
                                <AlertDescription>
                                    Posting to Instagram requires an Instagram <b>Business</b> or <b>Creator</b> account that is linked to a Facebook Page.
                                </AlertDescription>
                            </Alert>
                            <div className="space-y-2">
                                <Label htmlFor="instagram-redirect-uri">1. Add Redirect URI to Facebook Developer App</Label>
                                 <p className="text-xs text-muted-foreground">Copy this URI and paste it into your Facebook App's "Valid OAuth Redirect URIs" list under Facebook Login settings.</p>
                                <div className="flex items-center gap-2">
                                    <Input id="instagram-redirect-uri" type="text" readOnly value={instagramRedirectUri} className="bg-background" />
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(instagramRedirectUri)}>
                                        <Copy className="h-4 w-4"/>
                                        <span className="sr-only">Copy URI</span>
                                    </Button>
                                </div>
                            </div>
                            <div className='space-y-2'>
                                <Label>2. Connect Your Account</Label>
                                <Button onClick={handleConnectInstagram} disabled={isConnectingInstagram} className='w-full sm:w-auto'>
                                {isConnectingInstagram ? (
                                    <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Redirecting...</>
                                    ) : (
                                    <><Link className="mr-2 h-4 w-4" /> Connect Instagram</>
                                )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* YouTube Connection */}
                 <div className="space-y-4">
                    {youtubeAccount ? (
                        <div className='flex items-center justify-between'>
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
                                <Label htmlFor="youtube-redirect-uri">1. Add Redirect URI to Google Cloud Console</Label>
                                 <p className="text-xs text-muted-foreground">Copy this URI and paste it into your Google Cloud Console's OAuth 2.0 Client ID "Authorized redirect URIs" list.</p>
                                <div className="flex items-center gap-2">
                                    <Input id="youtube-redirect-uri" type="text" readOnly value={youtubeRedirectUri} className="bg-background" />
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(youtubeRedirectUri)}>
                                        <Copy className="h-4 w-4"/>
                                        <span className="sr-only">Copy URI</span>
                                    </Button>
                                </div>
                            </div>
                            <div className='space-y-2'>
                                <Label>2. Connect Your Account</Label>
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
      
      <Card>
        <CardHeader>
          <CardTitle>Your Manual Connections</CardTitle>
          <CardDescription>
            Here are the accounts you have connected manually (e.g., X, LinkedIn, Facebook).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <div className="flex justify-center p-4"><LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" /></div>}
          
          {!isLoading && keys && keys.filter(k => k.platform !== 'YouTube' && k.platform !== 'Instagram').map((apiKey) => (
              <div
                key={apiKey.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  {platformIcons[apiKey.platform as keyof typeof platformIcons] || <KeyRound className="h-8 w-8 text-primary" />}
                  <div>
                    <p className="font-semibold text-lg">{apiKey.platform}</p>
                    <p className="font-mono text-sm text-muted-foreground">{apiKey.username}</p>
                    <p className="font-mono text-xs text-muted-foreground">{maskApiKey(apiKey.apiKey)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKey.apiKey)}>
                      <Copy className="h-4 w-4"/>
                      <span className="sr-only">Copy Key</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Connection</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently remove your connection
                          for {apiKey.platform}.
                        </description>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteKey(apiKey.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          }

          {!isLoading && (!keys || keys.filter(k => k.platform !== 'YouTube' && k.platform !== 'Instagram').length === 0) && (
            <p className="text-muted-foreground text-center py-8">
              You have not added any manual connections yet.
            </p>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
    