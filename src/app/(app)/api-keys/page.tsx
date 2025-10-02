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
import { Input } from '@/components/ui/input';
import { KeyRound, Plus, Trash2, Copy } from 'lucide-react';
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


type ApiKey = {
  platform: string;
  key: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([
    { platform: 'Instagram', key: 'IG-************' },
    { platform: 'Facebook', key: 'FB-************' },
  ]);
  const [newKeyPlatform, setNewKeyPlatform] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  const { toast } = useToast();

  const handleAddKey = () => {
    if (newKeyPlatform && newKeyValue) {
      setKeys([...keys, { platform: newKeyPlatform, key: newKeyValue }]);
      setNewKeyPlatform('');
      setNewKeyValue('');
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

  const handleDeleteKey = (platform: string) => {
    setKeys(keys.filter((key) => key.platform !== platform));
    toast({
        title: 'API Key Removed',
        description: `Your key for ${platform} has been removed.`,
      });
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
    });
  };


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
             <Select value={newKeyPlatform} onValueChange={setNewKeyPlatform}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="X">X (Twitter)</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                </SelectContent>
            </Select>
            <Input
              type="text"
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              placeholder="Paste your API Key here"
              className="sm:col-span-2"
              aria-label="API Key Value"
            />
           </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleAddKey}>
                <Plus className="mr-2 h-4 w-4" />
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
          {keys.length > 0 ? (
            keys.map((apiKey) => (
              <div
                key={apiKey.platform}
                className="flex items-center justify-between p-4 rounded-lg border bg-muted/20"
              >
                <div className="flex items-center gap-4">
                  <KeyRound className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-lg">{apiKey.platform}</p>
                    <p className="font-mono text-sm text-muted-foreground">{apiKey.key}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKey.key)}>
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
                        <AlertDialogAction onClick={() => handleDeleteKey(apiKey.platform)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              You haven't added any API keys yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
