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

const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

export default function CreatePostPage() {
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState(''); // For URL input
  const [mediaFile, setMediaFile] = useState<File | null>(null); // For file upload
  const [mediaPreview, setMediaPreview] = useState<string>(''); // For file upload preview

  const [tone, setTone] = useState('Casual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<Post['platform'][]>([]);

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const socialMediaAccountsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'socialMediaAccounts');
  }, [user, firestore]);

  const { data: accounts } = useCollection<SocialMediaAccount>(socialMediaAccountsCollection);
  
  const credsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'platformCredentials');
  }, [user, firestore]);
  
  const { data: credentialsList } = useCollection<PlatformCredentials>(credsCollectionRef);

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


  const handleGenerateCaption = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAiCaption({
        topic: text || 'a social media post',
        tone: tone as any,
        mediaDataUri: effectiveMediaUrl,
      });

      if (result.caption) {
        setText(result.caption);
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
    if (selectedPlatforms.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select at least one platform to post to.' });
      return;
    }

    setIsPublishing(true);

    try {
      let somethingPublished = false;
      const effectiveUrlForApi = mediaFile ? await fileToDataUri(mediaFile) : mediaUrl;

      // YouTube Upload Logic
      if (selectedPlatforms.includes('youtube')) {
        const youtubeAccount = accounts?.find(acc => acc.platform === 'YouTube');
        const youtubeCreds = credentials['YouTube'];

        if (!youtubeAccount || !youtubeCreds?.clientId || !youtubeCreds?.clientSecret) {
            toast({ variant: 'destructive', title: 'YouTube Error', description: 'You must connect your YouTube account and save credentials first.' });
        } else if (!youtubeAccount.connected) {
            toast({ variant: 'destructive', title: 'YouTube Error', description: "Your YouTube account is disconnected. Please connect it in the 'Connected Accounts' page." });
        } else if (!mediaFile) {
            toast({ variant: 'destructive', title: 'YouTube Error', description: 'YouTube requires a video file to be uploaded.' });
        } else {
            const videoDataUri = await fileToDataUri(mediaFile);
            const [title, ...descriptionParts] = text.split('\n');
            const description = descriptionParts.join('\n');
            
            await uploadVideoToYoutube({
                videoDataUri,
                title: title || 'My OmniPost AI Video',
                description: description || '',
                accessToken: youtubeAccount.accessToken || '',
                refreshToken: youtubeAccount.refreshToken,
                clientId: youtubeCreds.clientId,
                clientSecret: youtubeCreds.clientSecret,
            });
            toast({ title: 'Video sent to YouTube!', description: 'Your video is being processed by YouTube.' });
            somethingPublished = true;
        }
      }

      // Instagram Post Logic
      if (selectedPlatforms.includes('instagram')) {
          const instagramAccount = accounts?.find(acc => acc.platform === 'Instagram');
          if (!instagramAccount || !instagramAccount.instagramId) {
              toast({ variant: 'destructive', title: 'Instagram Error', description: 'You must connect your Instagram account first.' });
          } else if (!instagramAccount.connected) {
              toast({ variant: 'destructive', title: 'Instagram Error', description: "Your Instagram account is disconnected. Please connect it in the 'Connected Accounts' page." });
          } else if (!text) {
               toast({ variant: 'destructive', title: 'Instagram Error', description: 'Instagram posts require a caption.' });
          } else if (!mediaUrl) { // Instagram requires a public URL
              toast({ variant: 'destructive', title: 'Instagram Error', description: 'Instagram posts require a public Media URL. File uploads are not supported for Instagram directly.' });
          }
          else {
              await postToInstagram({
                  instagramUserId: instagramAccount.instagramId,
                  mediaUrl: mediaUrl,
                  caption: text,
                  accessToken: instagramAccount.pageAccessToken || '', // Use PAGE access token
              });

              toast({
                  title: 'Posted to Instagram!',
                  description: 'Your post should be live on your Instagram account.',
              });
              somethingPublished = true;
          }
      }

      // Facebook Post Logic
      if (selectedPlatforms.includes('facebook')) {
        const facebookAccount = accounts?.find(acc => acc.platform === 'Instagram'); // Instagram connection holds FB data
        if (!facebookAccount || !facebookAccount.facebookPageId || !facebookAccount.pageAccessToken) {
            toast({ variant: 'destructive', title: 'Facebook Error', description: 'A connected Instagram/Facebook account with a Page ID and Page Access Token is required.' });
        } else if (!facebookAccount.connected) {
            toast({ variant: 'destructive', title: 'Facebook Error', description: "Your Facebook account is disconnected. Please reconnect it in the 'API Keys' page." });
        } else if (!mediaUrl) {
            toast({ variant: 'destructive', title: 'Facebook Error', description: 'Facebook posts from this app require a public Media URL.' });
        } else {
            await postToFacebook({
                facebookPageId: facebookAccount.facebookPageId,
                mediaUrl: mediaUrl,
                caption: text,
                pageAccessToken: facebookAccount.pageAccessToken,
            });
            toast({ title: 'Posted to Facebook!', description: 'Your post should be live on your Facebook Page.' });
            somethingPublished = true;
        }
      }
      
      // Twitter Post Logic
      if (selectedPlatforms.includes('twitter')) {
        const twitterAccount = accounts?.find(acc => acc.platform === 'Twitter');
        if (!twitterAccount) {
            toast({ variant: 'destructive', title: 'Twitter Error', description: 'You must add your Twitter credentials in the API Keys page.' });
        } else if (!twitterAccount.connected) {
            toast({ variant: 'destructive', title: 'Twitter Error', description: "Your Twitter account is disconnected. Please connect it in the 'Connected Accounts' page." });
        } else if (!twitterAccount.apiKey || !twitterAccount.apiSecret || !twitterAccount.accessToken || !twitterAccount.accessTokenSecret) {
            toast({ variant: 'destructive', title: 'Twitter Error', description: 'Missing one or more required Twitter API credentials.' });
        }
        else {
            await postToTwitter({
                text,
                apiKey: twitterAccount.apiKey,
                apiSecret: twitterAccount.apiSecret,
                accessToken: twitterAccount.accessToken,
                accessTokenSecret: twitterAccount.accessTokenSecret,
            });
            toast({ title: 'Posted to Twitter!', description: 'Your tweet should be live on your profile.' });
            somethingPublished = true;
        }
      }


      // Save a record to Firestore for our own analytics, even if posted via API
      for (const platform of selectedPlatforms) {
          const postData: Omit<Post, 'id' | 'mediaUrl'> & { mediaUrl?: string } = {
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
          
          if (mediaUrl) {
            postData.mediaUrl = mediaUrl;
          }

          const postsCollection = collection(firestore, `users/${user.uid}/posts`);
          addDocumentNonBlocking(postsCollection, postData);
      }
      
      if (somethingPublished) {
          toast({
            title: 'Post Published/Scheduled!',
            description: 'Your post has been successfully processed.',
          });

          // Reset form
          setText('');
          setMediaUrl('');
          setMediaFile(null);
          setMediaPreview('');
          setDate(new Date());
          setSelectedPlatforms([]);
      }

    } catch (error: any) {
        console.error("Error creating post:", error);
        toast({
            variant: 'destructive',
            title: 'Error Publishing Post',
            description: error.message || 'Failed to publish post. Please try again.',
        });
    } finally {
        setIsPublishing(false);
    }
  };


  const platforms: { id: Post['platform']; label: string }[] = [
    { id: 'facebook', label: 'Facebook' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'twitter', label: 'Twitter' },
  ];

  const handlePlatformChange = (platformId: Post['platform']) => {
    setSelectedPlatforms(prev => 
        prev.includes(platformId) 
            ? prev.filter(id => id !== platformId)
            : [...prev, platformId]
    );
  }
  
  const isYouTubeSelected = selectedPlatforms.includes('youtube');
  const isInstagramSelected = selectedPlatforms.includes('instagram');
  const isFacebookSelected = selectedPlatforms.includes('facebook');
  const isTwitterSelected = selectedPlatforms.includes('twitter');


  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label>Select Platforms</Label>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
                {platforms.map((p) => (
                   <div key={p.id} className="flex items-center space-x-2">
                    <Checkbox id={p.id} checked={selectedPlatforms.includes(p.id)} onCheckedChange={() => handlePlatformChange(p.id)} />
                    <label htmlFor={p.id} className="text-sm font-medium">
                      {p.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[150px] text-base"
            />
            
            <Tabs defaultValue="url" className="w-full">
                <TabsList>
                    <TabsTrigger value="url" disabled={isYouTubeSelected}>
                        <Link className="mr-2 h-4 w-4"/> Media URL
                    </TabsTrigger>
                    <TabsTrigger value="upload" disabled={isInstagramSelected || isFacebookSelected}>
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
                        disabled={isYouTubeSelected}
                    />
                    {isYouTubeSelected && <p className="text-xs text-muted-foreground">YouTube only supports file uploads from this interface.</p>}
                </TabsContent>
                <TabsContent value="upload" className="space-y-2">
                    <Label htmlFor="media-file">Upload Image/Video</Label>
                     <Input 
                        id="media-file"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                        disabled={isInstagramSelected || isFacebookSelected}
                    />
                    {(isInstagramSelected || isFacebookSelected) && <p className="text-xs text-muted-foreground">Instagram & Facebook only support public URLs from this interface.</p>}
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
                Generate Caption
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="instagram"><Instagram className="w-5 h-5"/></TabsTrigger>
            <TabsTrigger value="facebook"><Facebook className="w-5 h-5"/></TabsTrigger>
            <TabsTrigger value="youtube"><Youtube className="w-5 h-5"/></TabsTrigger>
            <TabsTrigger value="twitter"><Twitter className="w-5 h-5"/></TabsTrigger>
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
                     <h3 className="text-lg font-bold">{text.split('\n')[0] || "Your Video Title Here"}</h3>
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
                      <p className="text-sm text-gray-600 whitespace-pre-wrap mt-2">{text.split('\n').slice(1).join('\n') || "Your video description will appear here..."}</p>
                  </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="twitter">
             <Card className="bg-white text-black border-gray-200 max-w-[550px] mx-auto">
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
                                    <p className="text-xs text-gray-500">@janedoe</p>
                                </div>
                                <Twitter className="h-5 w-5 text-sky-500" />
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{text || "Your tweet will appear here..."}</p>
                            {effectiveMediaUrl && !mediaFile && <div className="mt-3 rounded-lg border overflow-hidden"><Image src={effectiveMediaUrl} alt="preview" width={500} height={300} className="object-cover w-full"/></div>}
                             <div className="flex justify-between items-center text-gray-600 text-xs pt-2">
                                <span>1m ago</span>
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1"><MessageCircle size={14}/> 12</span>
                                    <span className="flex items-center gap-1"><Repeat size={14}/> 34</span>
                                    <span className="flex items-center gap-1"><Heart size={14}/> 56</span>
                                    <span className="flex items-center gap-1"><Eye size={14}/> 1.2K</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
