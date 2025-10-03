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
import { KeyRound, LoaderCircle, Youtube, Instagram, Save, Twitter, Info, Facebook } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { PlatformCredentials } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


function CredentialForm({ 
    platform, 
    credentials, 
    onSave,
    fields,
    helpText
}: { 
    platform: PlatformCredentials['platform'];
    credentials: Partial<PlatformCredentials> | null;
    onSave: (platform: PlatformCredentials['platform'], data: Partial<PlatformCredentials>) => Promise<void>;
    fields: {id: keyof PlatformCredentials, label: string, placeholder: string}[];
    helpText: {title: string, link: string, description: string};
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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
           <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 !text-blue-600" />
              <AlertTitle className="text-blue-800">{helpText.title}</AlertTitle>
              <AlertDescription className="text-blue-700">
               {helpText.description} <a href={helpText.link} target="_blank" rel="noopener noreferrer" className="underline font-semibold">Developer Console</a>.
              </AlertDescription>
          </Alert>
          {fields.map(field => (
             <div className="space-y-2" key={field.id}>
                <Label htmlFor={`${platform}-${field.id}`}>{field.label}</Label>
                <Input 
                    id={`${platform}-${field.id}`} 
                    value={formData[field.id] || ''} 
                    onChange={e => handleInputChange(field.id, e.target.value)} 
                    placeholder={field.placeholder} 
                />
            </div>
          ))}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {credentials?.id ? `Update ${platformName} Credentials` : `Save ${platformName} Credentials`}
          </Button>
        </form>
    )
}


export default function ApiKeysPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>();

  const { toast } = useToast();

  const credentialsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'platformCredentials');
  }, [user, firestore]);

  const { data: credentials, isLoading } = useCollection<PlatformCredentials>(credentialsCollectionRef);

  const youtubeCreds = useMemo(() => credentials?.find(c => c.platform === 'YouTube'), [credentials]);
  const instagramCreds = useMemo(() => credentials?.find(c => c.platform === 'Instagram'), [credentials]);
  const twitterCreds = useMemo(() => credentials?.find(c => c.platform === 'Twitter'), [credentials]);

  useEffect(() => {
    if (!isLoading) {
      if (!instagramCreds) setActiveAccordionItem('instagram');
      else if (!youtubeCreds) setActiveAccordionItem('youtube');
      else if (!twitterCreds) setActiveAccordionItem('twitter');
    }
  }, [isLoading, instagramCreds, youtubeCreds, twitterCreds]);

  const handleSaveCredentials = async (platform: PlatformCredentials['platform'], data: Partial<PlatformCredentials>) => {
    if (!user || !firestore) return;
    
    try {
      // We use the platform name as the document ID for simplicity, ensuring one doc per platform.
      const docRef = doc(firestore, `users/${user.uid}/platformCredentials`, platform);
      
      const credentialData = {
        ...data,
        id: platform,
        platform,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(), // This will be set on first save
      };

      await setDoc(docRef, credentialData, { merge: true });
      
      toast({ title: `${platform} Credentials Saved!` });
      setActiveAccordionItem(undefined); 

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    }
  };
  
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
          API Credentials
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Manage your app-level credentials for each platform. You only need to do this once per platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Credentials</CardTitle>
          <CardDescription>
           Enter your API credentials for each platform to enable connecting accounts.
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
                    <CredentialForm 
                        platform='Instagram'
                        credentials={instagramCreds || null}
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
                     <CredentialForm 
                        platform='YouTube'
                        credentials={youtubeCreds || null}
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
                    />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="twitter">
                <AccordionTrigger>
                    <div className='flex items-center gap-2'>
                        <Twitter className="h-5 w-5 text-sky-500" />
                        <span className="font-medium">X (Twitter)</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-muted/30 rounded-b-lg">
                    <CredentialForm 
                        platform='Twitter'
                        credentials={twitterCreds || null}
                        onSave={handleSaveCredentials}
                        fields={[
                            {id: 'apiKey', label: 'API Key', placeholder: 'Enter your API Key'},
                            {id: 'apiSecret', label: 'API Key Secret', placeholder: 'Enter your API Key Secret'},
                            {id: 'accessToken', label: 'Access Token', placeholder: 'Enter your Access Token'},
                            {id: 'accessTokenSecret', label: 'Access Token Secret', placeholder: 'Enter your Access Token Secret'},
                        ]}
                        helpText={{
                            title: 'X Developer App Required',
                            description: 'Get these from your app in the',
                            link: 'https://developer.twitter.com/en/portal/dashboard'
                        }}
                    />
                </AccordionContent>
            </AccordionItem>

            </Accordion>
        </CardContent>
      </Card>
      
    </div>
  );
}
