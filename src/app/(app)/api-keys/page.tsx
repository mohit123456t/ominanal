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
import { KeyRound, Plus, Trash2, Copy, LoaderCircle, Youtube, Link, Unlink, Instagram, Facebook, Twitter as XIcon, Linkedin } from 'lucide-react';
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
import { Label } from '@/components/ui/label';


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
  const [newKeyUsername, setNewKeyUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnectingYouTube, setIsConnectingYouTube] = useState(false);

  const { toast } = useToast();

  const socialMediaAccountsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'socialMediaAccounts');
  }, [user, firestore]);

  const { data: keys, isLoading } = useCollection<SocialMediaAccount>(socialMediaAccountsCollection);

  const youtubeAccount = useMemo(() => keys?.find(k => k.platform === 'YouTube'), [keys]);

  const handleAddKey = async () => {
    if (!socialMediaAccountsCollection || !user) return;

    if (newKeyPlatform && newKeyValue && newKeyUsername) {
      setIsSubmitting(true);
      const newKeyData: Omit<SocialMediaAccount, 'id' > = {
        platform: newKeyPlatform as SocialMediaAccount['platform'],
        apiKey: newKeyValue,
        username: newKeyUsername,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        connected: true,
      };
      
      addDocumentNonBlocking(socialMediaAccountsCollection, newKeyData);

      setNewKeyPlatform('');
      setNewKeyValue('');
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
    if (key.startsWith('ya29.')) return 'Connected via OAuth'; // YouTube
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
  
  const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/youtube-callback` : '';


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
            Select a platform to connect your account. For YouTube, you'll be redirected. For others, enter your details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <Select value={newKeyPlatform} onValueChange={(value) => setNewKeyPlatform(value as SocialMediaAccount['platform'])} disabled={isSubmitting}>
                <SelectTrigger className="w-full sm:w-1/2">
                    <SelectValue placeholder="Select Platform..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="X">X</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                </SelectContent>
            </Select>
            
            {newKeyPlatform && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                        type="text"
                        value={newKeyUsername}
                        onChange={(e) => setNewKeyUsername(e.target.value)}
                        placeholder="Username"
                        aria-label="Username"
                        disabled={isSubmitting}
                    />
                    <Input
                        type="password"
                        value={newKeyValue}
                        onChange={(e) => setNewKeyValue(e.target.value)}
                        placeholder="Paste your API Key here"
                        aria-label="API Key Value"
                        disabled={isSubmitting}
                    />
                </div>
                <Button onClick={handleAddKey} disabled={isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Add Key
                </Button>
              </>
            )}

            <div className='border-t pt-4 space-y-2'>
                {youtubeAccount ? (
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <Youtube className="h-6 w-6 text-red-600" />
                            <p className='font-medium'>YouTube Connected</p>
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
                    <>
                        <div className="space-y-2 pt-2">
                            <Label htmlFor="redirect-uri-display">To connect YouTube, copy this Redirect URI to your Google Cloud Console credentials page:</Label>
                             <div className="flex items-center gap-2">
                                <Input id="redirect-uri-display" type="text" readOnly value={redirectUri} className="bg-muted" />
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(redirectUri)}>
                                    <Copy className="h-4 w-4"/>
                                    <span className="sr-only">Copy URI</span>
                                </Button>
                            </div>
                        </div>
                        <Button onClick={handleConnectYouTube} disabled={isConnectingYouTube} className='w-full sm:w-auto'>
                           {isConnectingYouTube ? (
                               <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Redirecting...</>
                            ) : (
                               <><Link className="mr-2 h-4 w-4" /> Connect YouTube</>
                           )}
                        </Button>
                    </>
                )}
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Connections</CardTitle>
          <CardDescription>
            Here are the accounts you have connected (excluding YouTube).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <div className="flex justify-center p-4"><LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" /></div>}
          
          {!isLoading && keys && keys.filter(k => k.platform !== 'YouTube').map((apiKey) => (
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
                        </AlertDialogDescription>
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

          {!isLoading && (!keys || keys.filter(k => k.platform !== 'YouTube').length === 0) && (
            <p className="text-muted-foreground text-center py-8">
              You have not added any manual connections yet.
            </p>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
