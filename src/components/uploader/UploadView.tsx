'use client';

import { useState, useMemo, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import {
  Bold,
  Italic,
  Link,
  List,
  Sparkles,
  ImageIcon,
  Calendar as CalendarIcon,
  Send,
  LoaderCircle,
  Instagram,
  Facebook,
  Heart,
  MessageCircle,
  Repeat,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Youtube,
  Eye,
  Upload,
  Twitter,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { generateAiCaption } from '@/ai/flows/ai-caption-generation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { type Post, SocialMediaAccount, PlatformCredentials } from '@/lib/types';
import { uploadVideoToYoutube } from '@/ai/flows/youtube-upload';
import { postToInstagram } from '@/ai/flows/instagram-post';
import { postToFacebook } from '@/ai/flows/facebook-post';
import { postToTwitter } from '@/ai/flows/twitter-post';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

export default function UploadView() {
  const [text, setText] = useState('');
  const [youtubeDescription, setYoutubeDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState(''); // For URL input
  const [mediaFile, setMediaFile] = useState<File | null>(null); // For file upload
  const [mediaPreview, setMediaPreview] = useState<string>(''); // For file upload preview

  const [tone, setTone] = useState('Casual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, string[]>>({});

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const socialMediaAccountsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'socialMediaAccounts');
  }, [user, firestore]);

  const { data: accountsList } = useCollection<SocialMediaAccount>(socialMediaAccountsCollection);
  
  const credsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'platformCredentials');
  }, [user, firestore]);
  
  const { data: credentialsList } = useCollection<PlatformCredentials>(credsCollectionRef);

  const accountsByPlatform = useMemo(() => {
    if (!accountsList) return {};
    return accountsList.reduce((acc, account) => {
      const platformKey = (account.platform === 'Facebook' ? 'Instagram' : account.platform) as 'Instagram' | 'YouTube' | 'Twitter';
      if (!acc[platformKey]) {
        acc[platformKey] = [];
      }
      acc[platformKey].push(account);
      return acc;
    }, {} as Record<'Instagram' | 'YouTube' | 'Twitter', SocialMediaAccount[]>);
  }, [accountsList]);


  const credentials = useMemo(() => {
    if (!credentialsList) return {};
    return credentialsList.reduce((acc, cred) => {
        acc[cred.platform] = cred;
        return acc;
    }, {} as {[key: string]: PlatformCredentials});
  }, [credentialsList]);

  const userAvatar = useMemo(
    () => PlaceHolderImages.find((img) => img.id === 'user-avatar-1'),
    []
  );

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const dataUri = await fileToDataUri(file);
      setMediaPreview(dataUri);
      setMediaUrl(''); // Clear URL if a file is selected
    }
  };
  
  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
      setMediaUrl(e.target.value);
      setMediaFile(null); // Clear file if a URL is entered
      setMediaPreview('');
  }

  const effectiveMediaUrl = mediaUrl || mediaPreview;
  const isYouTubeSelected = Object.entries(selectedAccounts).some(([platform, ids]) => platform === 'YouTube' && ids.length > 0);
  const isInstagramPlatformSelected = Object.entries(selectedAccounts).some(([platform, ids]) => platform === 'Instagram' && ids.length > 0);
  
  const handleGenerateCaption = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAiCaption({
        topic: text || 'a social media post',
        tone: tone as any,
        mediaDataUri: effectiveMediaUrl,
      });

      if (result.caption) {
        if(isYouTubeSelected) {
          const [title, ...descParts] = result.caption.split('\n');
          setText(title);
          setYoutubeDescription(descParts.join('\n'));
        } else {
          setText(result.caption);
        }
        toast({
          title: 'Caption Generated!',
          description: 'The AI has crafted a new caption for you.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate AI caption.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a post.' });
      return;
    }
    if (!text && !effectiveMediaUrl) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please add content or media to your post.' });
        return;
    }
    
    const totalSelectedAccounts = Object.values(selectedAccounts).flat().length;
    if (totalSelectedAccounts === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select at least one account to post to.' });
      return;
    }

    setIsPublishing(true);

    try {
      let publishedCount = 0;
      const allPromises = [];

      // YouTube Uploads
      const youtubeAccountIds = selectedAccounts['YouTube'] || [];
      if (youtubeAccountIds.length > 0) {
        const youtubeCreds = credentials['YouTube'];
        if (!youtubeCreds?.clientId || !youtubeCreds?.clientSecret) {
          toast({ variant: 'destructive', title: 'YouTube Error', description: 'You must save your YouTube credentials first in API Keys.' });
        } else if (!mediaFile) {
          toast({ variant: 'destructive', title: 'YouTube Error', description: 'YouTube requires a video file to be uploaded.' });
        } else {
          const videoDataUri = await fileToDataUri(mediaFile);
          for (const accountId of youtubeAccountIds) {
            const account = accountsList?.find(acc => acc.id === accountId);
            if (account) {
              const promise = uploadVideoToYoutube({
                  videoDataUri,
                  title: text || 'My OmniPost AI Video',
                  description: youtubeDescription,
                  accessToken: account.accessToken || '',
                  refreshToken: account.refreshToken,
                  clientId: youtubeCreds.clientId,
                  clientSecret: youtubeCreds.clientSecret,
              }).then(() => {
                toast({ title: 'Video sent to YouTube!', description: `Your video is being processed on the "${account.username}" channel.` });
                publishedCount++;
                savePostToFirestore(account, 'youtube');
              }).catch(err => {
                toast({ variant: 'destructive', title: `YouTube Error (${account.username})`, description: err.message });
              });
              allPromises.push(promise);
            }
          }
        }
      }

      // Instagram & Facebook Posts
      const instagramAccountIds = selectedAccounts['Instagram'] || [];
      if (instagramAccountIds.length > 0) {
          const instagramAccountData = accountsByPlatform['Instagram']?.[0]; // All IG/FB accounts use the same connection
          if (!instagramAccountData || !instagramAccountData.pageAccessToken) {
              toast({ variant: 'destructive', title: 'Instagram/Facebook Error', description: 'You must connect an Instagram Business/Facebook Page account first.' });
          } else if (!mediaUrl) {
              toast({ variant: 'destructive', title: 'Instagram/Facebook Error', description: 'Instagram & Facebook posts require a public Media URL from this app.' });
          } else {
              for (const accountId of instagramAccountIds) {
                  const account = accountsList?.find(acc => acc.id === accountId);
                  if (!account) continue;
                  
                  if (account.platform === 'Instagram' && account.instagramId) {
                      const promise = postToInstagram({
                          instagramUserId: account.instagramId,
                          mediaUrl: mediaUrl,
                          caption: text,
                          accessToken: instagramAccountData.pageAccessToken || '',
                      }).then(() => {
                          toast({ title: `Posted to Instagram!`, description: `@${account.username}` });
                          publishedCount++;
                          savePostToFirestore(account, 'instagram');
                      }).catch(err => {
                          toast({ variant: 'destructive', title: `Instagram Error (@${account.username})`, description: err.message });
                      });
                      allPromises.push(promise);
                  } else if (account.platform === 'Facebook' && account.facebookPageId) {
                       const promise = postToFacebook({
                          facebookPageId: account.facebookPageId,
                          mediaUrl: mediaUrl,
                          caption: text,
                          pageAccessToken: instagramAccountData.pageAccessToken || '',
                      }).then(() => {
                          toast({ title: `Posted to Facebook!`, description: `${account.username}` });
                          publishedCount++;
                          savePostToFirestore(account, 'facebook');
                      }).catch(err => {
                          toast({ variant: 'destructive', title: `Facebook Error (${account.username})`, description: err.message });
                      });
                      allPromises.push(promise);
                  }
              }
          }
      }

      // Twitter Posts
      const twitterAccountIds = selectedAccounts['Twitter'] || [];
      if (twitterAccountIds.length > 0) {
        for (const accountId of twitterAccountIds) {
          const account = accountsList?.find(acc => acc.id === accountId);
          if (account && account.apiKey && account.apiSecret && account.accessToken && account.accessTokenSecret) {
            const promise = postToTwitter({
                text,
                apiKey: account.apiKey,
                apiSecret: account.apiSecret,
                accessToken: account.accessToken,
                accessTokenSecret: account.accessTokenSecret,
            }).then(() => {
              toast({ title: 'Posted to Twitter!', description: `@${account.username}` });
              publishedCount++;
              savePostToFirestore(account, 'twitter');
            }).catch(err => {
              toast({ variant: 'destructive', title: `Twitter Error (@${account.username})`, description: err.message });
            });
            allPromises.push(promise);
          } else if (account) {
             toast({ variant: 'destructive', title: `Twitter Error (@${account.username})`, description: 'Missing one or more required API credentials for this account.' });
          }
        }
      }

      await Promise.all(allPromises);
      
      if (publishedCount > 0) {
          toast({
            title: 'Publishing Complete!',
            description: `${publishedCount} post(s) were successfully processed.`,
          });
          // Reset form
          setText('');
          setYoutubeDescription('');
          setMediaUrl('');
          setMediaFile(null);
          setMediaPreview('');
          setDate(new Date());
          setSelectedAccounts({});
      }

    } catch (error: any) {
        console.error("Error creating post:", error);
        toast({
            variant: 'destructive',
            title: 'Error Publishing Post',
            description: error.message || 'An unknown error occurred during publishing.',
        });
    } finally {
        setIsPublishing(false);
    }
  };

  const savePostToFirestore = (account: SocialMediaAccount, platform: Post['platform']) => {
    if (!user || !firestore) return;
     const postDataBase: Omit<Post, 'id'> = {
        userId: user.uid,
        content: text,
        platform: platform,
        status: date ? 'Scheduled' : 'Published',
        scheduledAt: date?.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
      };
      
      const postData: Partial<Post> = {...postDataBase};

      if (mediaUrl) {
        postData.mediaUrl = mediaUrl;
      }

      const postsCollection = collection(firestore, `users/${user.uid}/posts`);
      addDocumentNonBlocking(postsCollection, postData);
  }

  const platforms: { id: 'Instagram' | 'YouTube' | 'Twitter'; label: string; icon: React.ReactNode }[] = [
    { id: 'Instagram', label: 'Instagram & Facebook', icon: <><Instagram className="w-5 h-5 text-pink-600"/><Facebook className="w-5 h-5 text-blue-700"/></> },
    { id: 'YouTube', label: 'YouTube', icon: <Youtube className="w-5 h-5 text-red-600"/> },
    { id: 'Twitter', label: 'Twitter', icon: <Twitter className="w-5 h-5 text-sky-500"/> },
  ];

  const handleAccountSelection = (platformId: string, accountId: string) => {
    setSelectedAccounts(prev => {
        const currentSelection = prev[platformId] || [];
        const newSelection = currentSelection.includes(accountId)
            ? currentSelection.filter(id => id !== accountId)
            : [...currentSelection, accountId];
        
        return { ...prev, [platformId]: newSelection };
    });
  };
  
  const handlePlatformCheckboxChange = (platformId: 'Instagram' | 'YouTube' | 'Twitter', isChecked: boolean) => {
      setSelectedAccounts(prev => {
          if (isChecked) {
              const platformAccounts = accountsByPlatform[platformId];
              const firstAccountId = platformAccounts?.[0]?.id;
              return { ...prev, [platformId]: firstAccountId ? [firstAccountId] : [] };
          } else {
              const { [platformId]: _, ...rest } = prev;
              return rest;
          }
      });
  };

  const handleSelectAllForPlatform = (platformId: 'Instagram' | 'YouTube' | 'Twitter', isChecked: boolean) => {
      const platformAccounts = accountsByPlatform[platformId];
      if (!platformAccounts) return;
      
      setSelectedAccounts(prev => {
          if (isChecked) {
              return { ...prev, [platformId]: platformAccounts.map(a => a.id) };
          } else {
               const { [platformId]: _, ...rest } = prev;
               return { ...rest, [platformId]: [] };
          }
      });
  };
  
  const isInstagramSelectedForMedia = isInstagramPlatformSelected;
  const isYouTubeSelectedForMedia = isYouTubeSelected;

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
             <div>
                <Label>Select Accounts to Post to</Label>
                 <div className="space-y-4 pt-2">
                    {platforms.map((p) => {
                        const platformAccounts = accountsByPlatform[p.id];
                        if (!platformAccounts || platformAccounts.length === 0) return null;
                        
                        const isPlatformSelected = selectedAccounts[p.id] && selectedAccounts[p.id]!.length > 0;
                        const allForPlatformSelected = isPlatformSelected && platformAccounts.length > 1 && platformAccounts.every(acc => selectedAccounts[p.id]?.includes(acc.id));

                        return (
                            <div key={p.id} className="p-4 border rounded-lg space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`platform-${p.id}`} 
                                        checked={isPlatformSelected} 
                                        onCheckedChange={(checked) => handlePlatformCheckboxChange(p.id, !!checked)} 
                                    />
                                    <label htmlFor={`platform-${p.id}`} className="flex items-center gap-2 font-medium cursor-pointer">
                                        {p.icon}
                                        {p.label}
                                    </label>
                                </div>
                                
                                {isPlatformSelected && (
                                    <div className="pl-6 space-y-3 border-l ml-2 pt-2">
                                        {platformAccounts.length > 1 && (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id={`select-all-${p.id}`} checked={allForPlatformSelected} onCheckedChange={(checked) => handleSelectAllForPlatform(p.id, !!checked)} />
                                                <label htmlFor={`select-all-${p.id}`} className="text-sm font-medium">Select All</label>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            {platformAccounts.map(acc => (
                                                <div key={acc.id} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={acc.id} 
                                                        checked={selectedAccounts[p.id]?.includes(acc.id)} 
                                                        onCheckedChange={() => handleAccountSelection(p.id, acc.id)} 
                                                    />
                                                    <label htmlFor={acc.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                        @{acc.username} <span className="text-muted-foreground">({acc.platform})</span>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                 </div>
            </div>


            <div className="space-y-2">
                <Label htmlFor="post-content">{isYouTubeSelected ? "Video Title" : "Post Content"}</Label>
                <Textarea
                    id="post-content"
                    placeholder={isYouTubeSelected ? "Enter your video title" : "What's on your mind?"}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[120px] text-base"
                />
            </div>
            
            {isYouTubeSelected && (
              <div className="space-y-2">
                <Label htmlFor="youtube-description">YouTube Description</Label>
                <Textarea
                  id="youtube-description"
                  placeholder="Tell viewers about your video..."
                  value={youtubeDescription}
                  onChange={(e) => setYoutubeDescription(e.target.value)}
                  className="min-h-[150px] text-base"
                />
              </div>
            )}

            
            <Tabs defaultValue="url" className="w-full">
                <TabsList>
                    <TabsTrigger value="url" disabled={isYouTubeSelectedForMedia}>
                        <Link className="mr-2 h-4 w-4"/> Media URL
                    </TabsTrigger>
                    <TabsTrigger value="upload" disabled={isInstagramSelectedForMedia}>
                        <Upload className="mr-2 h-4 w-4"/> Upload File
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="space-y-2">
                     <Label htmlFor="media-url">Image/Video URL</Label>
                    <Input 
                        id="media-url"
                        type="url"
                        placeholder="https://... (publicly accessible media URL)"
                        value={mediaUrl}
                        onChange={handleUrlChange}
                        disabled={isYouTubeSelectedForMedia}
                    />
                    {isYouTubeSelectedForMedia && <p className="text-xs text-muted-foreground">YouTube only supports file uploads from this interface.</p>}
                </TabsContent>
                <TabsContent value="upload" className="space-y-2">
                    <Label htmlFor="media-file">Upload Image/Video</Label>
                     <Input 
                        id="media-file"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                        disabled={isInstagramSelectedForMedia}
                    />
                    {isInstagramSelectedForMedia && <p className="text-xs text-muted-foreground">Instagram & Facebook only support public URLs from this interface.</p>}
                </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5" /> AI Content Studio
              </h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="tone" className="text-sm">
                  Tone:
                </Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Casual">Casual</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Witty">Witty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button
                onClick={handleGenerateCaption}
                disabled={isGenerating || (!text && !effectiveMediaUrl)}
                variant="outline"
              >
                {isGenerating ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Content
              </Button>
              <Button variant="outline" disabled>
                <Sparkles className="mr-2 h-4 w-4" />
                Suggest Hashtags
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button size="lg" onClick={handlePublish} disabled={isPublishing}>
             {isPublishing ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
            Publish Now
          </Button>
        </div>
      </div>

      <div className="lg:sticky top-24">
        <h2 className="font-headline text-lg font-semibold mb-4">Live Preview</h2>
        <Tabs defaultValue="instagram" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="instagram"><Instagram className="w-5 h-5"/></TabsTrigger>
            <TabsTrigger value="facebook"><Facebook className="w-5 h-5"/></TabsTrigger>
            <TabsTrigger value="youtube"><Youtube className="w-5 h-5"/></TabsTrigger>
          </TabsList>
          
          <TabsContent value="instagram">
             <Card className="bg-white text-black border-gray-200 aspect-[9/16] max-w-[320px] mx-auto flex flex-col">
                <div className="p-3 flex items-center justify-between border-b">
                   {userAvatar && <div className="flex items-center gap-2">
                        <Avatar size="sm">
                            <AvatarImage src={userAvatar.imageUrl} />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <p className="font-semibold text-sm">janedoe</p>
                    </div>}
                    <MoreHorizontal className="h-5 w-5"/>
                </div>
                {effectiveMediaUrl ? <Image src={effectiveMediaUrl} alt="preview" width={320} height={320} className="object-cover w-full aspect-square"/> : <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-muted-foreground"><ImageIcon/></div> }
                 <div className="p-3 flex flex-col flex-1">
                    <div className="flex items-center space-x-4">
                        <Heart className="h-6 w-6"/>
                        <MessageCircle className="h-6 w-6"/>
                        <Send className="h-6 w-6"/>
                        <div className="flex-1 text-right">
                           <Bookmark className="h-6 w-6"/>
                        </div>
                    </div>
                    <p className="text-sm font-semibold mt-2">56 likes</p>
                    <p className="text-sm mt-1 whitespace-pre-wrap"><span className="font-semibold">janedoe</span> {text || "Your post caption..."}</p>
                    <p className="text-xs text-gray-400 mt-2 uppercase">1 minute ago</p>
                </div>
            </Card>
          </TabsContent>
          <TabsContent value="facebook">
            <Card className="bg-white text-black border-gray-200">
                <CardContent className="p-4">
                    <div className="flex space-x-3">
                        {userAvatar && <Avatar>
                            <AvatarImage src={userAvatar.imageUrl} />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>}
                        <div className="flex-1 space-y-1">
                             <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold">Jane Doe</h4>
                                    <p className="text-xs text-gray-500">1m ago</p>
                                </div>
                                <MoreHorizontal className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                     <p className="text-sm mt-3 whitespace-pre-wrap">{text || "Your post content will appear here..."}</p>
                     {effectiveMediaUrl && <div className="mt-3 -mx-4"><Image src={effectiveMediaUrl} alt="preview" width={600} height={400} className="object-cover w-full"/></div>}
                     <div className="flex justify-between items-center text-gray-600 text-xs mt-2 pt-2 border-t">
                        <span>56 Likes</span>
                        <span>12 Comments · 34 Shares</span>
                     </div>
                     <div className="flex justify-around pt-2 mt-2 border-t">
                         <Button variant="ghost" className="text-gray-600"><ThumbsUp className="mr-2 h-4 w-4"/>Like</Button>
                         <Button variant="ghost" className="text-gray-600"><MessageCircle className="mr-2 h-4 w-4"/>Comment</Button>                         <Button variant="ghost" className="text-gray-600"><Repeat className="mr-2 h-4 w-4"/>Share</Button>
                     </div>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="youtube">
            <Card className="bg-[#f9f9f9] text-black border-gray-200">
              <CardContent className="p-0">
                  {effectiveMediaUrl && mediaFile?.type.startsWith('video/') ? (
                    <video controls src={effectiveMediaUrl} className="w-full aspect-video bg-black" />
                  ) : (
                    <div className="w-full aspect-video bg-black flex items-center justify-center text-white"><Youtube className="w-16 h-16"/></div>
                  )}

                  <div className="p-4">
                     <h3 className="text-lg font-bold">{text || "Your Video Title Here"}</h3>
                     <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        {userAvatar && <Avatar size="sm">
                            <AvatarImage src={userAvatar.imageUrl} />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>}
                        <div className='flex flex-col'>
                            <span className="font-semibold">Jane Doe's Channel</span>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1"><Eye size={14}/> <span>1.2M views</span></div>
                                <div className="flex items-center gap-1"><ThumbsUp size={14}/> <span>56K</span></div>
                                <span>&bull; 1 minute ago</span>
                            </div>
                        </div>
                     </div>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap mt-2">{youtubeDescription || "Your video description will appear here..."}</p>
                  </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
