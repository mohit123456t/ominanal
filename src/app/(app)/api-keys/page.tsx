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
import { KeyRound, Plus, Trash2, Copy, LoaderCircle } from 'lucide-react';
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


export default function ApiKeysPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [newKeyPlatform, setNewKeyPlatform] = useState<SocialMediaAccount['platform'] | ''>('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const socialMediaAccountsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'socialMediaAccounts');
  }, [user, firestore]);

  const { data: keys, isLoading } = useCollection<SocialMediaAccount>(socialMediaAccountsCollection);

  const handleAddKey = async () => {
    if (!socialMediaAccountsCollection || !user) return;

    if (newKeyPlatform && newKeyValue) {
      setIsSubmitting(true);
      const newKeyData: Omit<SocialMediaAccount, 'id'> = {
        platform: newKeyPlatform as SocialMediaAccount['platform'],
        apiKey: newKeyValue,
        username: 'default_user', // This would come from the API verification in a real app
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await addDocumentNonBlocking(socialMediaAccountsCollection, newKeyData);

      setNewKeyPlatform('');
      setNewKeyValue('');
      setIsSubmitting(false);

      toast({
        title: 'API Key Added',
        description: `Your key for ${newKeyPlatform} has been saved.`,
      });
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please select a platform and enter a key.',
        });
    }
  };

  const handleDeleteKey = async (accountId: string) => {
    if (!socialMediaAccountsCollection) return;
    const docRef = doc(socialMediaAccountsCollection, accountId);
    await deleteDocumentNonBlocking(docRef);
    toast({
        title: 'API Key Removed',
        description: `Your key has been removed.`,
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
    return `${key.substring(0, 4)}************${key.substring(key.length - 4)}`;
  }


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <KeyRound className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl font-headline font-bold tracking-tight text-foreground sm:text-4xl">
          API Keys Management
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Securely manage your API keys to connect your social media accounts and enable posting.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New API Key</CardTitle>
          <CardDescription>
            Select a platform and paste your API key below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid sm:grid-cols-3 gap-4">
             <Select value={newKeyPlatform} onValueChange={(value) => setNewKeyPlatform(value as SocialMediaAccount['platform'])} disabled={isSubmitting}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="X">X</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                </SelectContent>
            </Select>
            <Input
              type="text"
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              placeholder="Paste your API Key here"
              className="sm:col-span-2"
              aria-label="API Key Value"
              disabled={isSubmitting}
            />
           </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleAddKey} disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add Key
            </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Here are the API keys you have connected to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />}
          {!isLoading && keys && keys.length > 0 ? (
            keys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-muted/20"
              >
                <div className="flex items-center gap-4">
                  <KeyRound className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-lg">{apiKey.platform}</p>
                    <p className="font-mono text-sm text-muted-foreground">{maskApiKey(apiKey.apiKey)}</p>
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
                        <span className="sr-only">Delete Key</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your API key
                          for {apiKey.platform} and you will need to re-add it to post to this platform.
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
          ) : (
            !isLoading && <p className="text-muted-foreground text-center py-8">
              You have not added any API keys yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
