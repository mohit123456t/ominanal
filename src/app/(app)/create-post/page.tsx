'use client';

import { useState, useMemo, ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';
import {
  Bold,
  Italic,
  Link,
  List,
  Sparkles,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Send,
  LoaderCircle,
  Twitter,
  Instagram,
  Facebook,
  Heart,
  MessageCircle,
  Repeat,
  Bookmark,
  MoreHorizontal,
  UploadCloud,
  ThumbsUp,
  Linkedin,
  Youtube,
  Eye,
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
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { type Post, SocialMediaAccount } from '@/lib/types';
import { uploadVideoToYoutube } from '@/ai/flows/youtube-upload';


const fileToDataUri = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

export default function CreatePostPage() {
  const [text, setText] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [tone, setTone] = useState('Casual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<Post['platform'][]>(['x']);


  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const socialMediaAccountsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'socialMediaAccounts');
  }, [user, firestore]);

  const { data: accounts } = useCollection<SocialMediaAccount>(socialMediaAccountsCollection);

  const userAvatar = useMemo(
    () => PlaceHolderImages.find((img) => img.id === 'user-avatar-1'),
    []
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMedia(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };
  
  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      // Allow videos only for YouTube
      if (isVideo && !selectedPlatforms.includes('youtube')) {
          toast({
              variant: "destructive",
              title: "Invalid File Type",
              description: "Video uploads are only supported for YouTube at the moment.",
          });
          return;
      }
      
       if (isImage || isVideo) {
        setMedia(file);
        setMediaPreview(URL.createObjectURL(file));
      } else {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload an image or video file.",
        })
      }
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleGenerateCaption = async () => {
    setIsGenerating(true);
    try {
      let mediaDataUri: string | undefined;
      if (media && media.type.startsWith('image/')) {
        mediaDataUri = await fileToDataUri(media);
      }

      const result = await generateAiCaption({
        topic: text || 'a social media post',
        tone: tone as any,
        mediaDataUri,
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
    if (!text && !media) {
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

      // YouTube Upload Logic
      if (selectedPlatforms.includes('youtube')) {
        const youtubeAccount = accounts?.find(acc => acc.platform === 'YouTube');
        if (youtubeAccount && media && media.type.startsWith('video/')) {
          const videoDataUri = await fileToDataUri(media);
          const [title, ...descriptionParts] = text.split('\n');
          const description = descriptionParts.join('\n');
          
          await uploadVideoToYoutube({
            userId: user.uid,
            accountId: youtubeAccount.id,
            videoDataUri,
            title: title || 'My YouTube Video',
            description: description || 'Uploaded via OmniPost AI',
            accessToken: youtubeAccount.apiKey,
            refreshToken: youtubeAccount.refreshToken,
          });

          somethingPublished = true;
          toast({ title: 'YouTube video is being uploaded!', description: 'It may take a few moments to appear on your channel.' });
        } else {
            if(!media || !media.type.startsWith('video/')) {
                 toast({ variant: 'destructive', title: 'YouTube Error', description: 'You must upload a video file to post to YouTube.' });
            }
             if(!youtubeAccount) {
                 toast({ variant: 'destructive', title: 'YouTube Error', description: 'You must connect your YouTube account first.' });
            }
        }
      }

      // Firestore post creation for other platforms (simplified)
      for (const platform of selectedPlatforms.filter(p => p !== 'youtube')) {
          const mediaUrl = mediaPreview || undefined;
          const postData: Omit<Post, 'id'> = {
            userId: user.uid,
            content: text,
            platform: platform,
            mediaUrl: mediaUrl,
            status: date ? 'Scheduled' : 'Published',
            scheduledAt: date?.toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0,
          };
          const postsCollection = collection(firestore, `users/${user.uid}/posts`);
          addDocumentNonBlocking(postsCollection, postData);
          somethingPublished = true;
      }
      

      if (somethingPublished) {
          toast({
            title: 'Post Published!',
            description: 'Your post has been successfully saved and/or scheduled.',
          });

          // Reset form
          setText('');
          setMedia(null);
          setMediaPreview(null);
          setDate(new Date());
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
    { id: 'x', label: 'X (Twitter)' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'youtube', label: 'YouTube' },
  ];
  
  const handlePlatformChange = (platformId: Post['platform']) => {
    setSelectedPlatforms(prev => 
        prev.includes(platformId) 
            ? prev.filter(id => id !== platformId)
            : [...prev, platformId]
    );
  }

  const isVideo = media?.type.startsWith('video/');

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
            
            {!mediaPreview ? (
              <label
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  className={cn("flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors", isDragging && "border-primary bg-primary/10")}
                >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">Image or Video (for YouTube)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
              </label>
            ) : (
                <div className="relative">
                    {isVideo ? (
                        <video src={mediaPreview} controls className="rounded-lg object-cover w-full max-h-[300px]" />
                    ) : (
                        <Image
                            src={mediaPreview}
                            alt="Media preview"
                            width={500}
                            height={300}
                            className="rounded-lg object-cover w-full max-h-[300px]"
                        />
                    )}
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => { setMedia(null); setMediaPreview(null)}}>
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </div>
            )}
            
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
                disabled={isGenerating || isVideo}
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
        <Tabs defaultValue="x" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="x"><Twitter className="w-5 h-5"/></TabsTrigger>
            <TabsTrigger value="instagram"><Instagram className="w-5 h-5"/></TabsTrigger>
            <TabsTrigger value="facebook"><Facebook className="w-5 h-5"/></TabsTrigger>
            <TabsTrigger value="linkedin"><Linkedin className="w-5 h-5"/></TabsTrigger>
            <TabsTrigger value="youtube"><Youtube className="w-5 h-5"/></TabsTrigger>
          </TabsList>
          <TabsContent value="x">
            <Card className="bg-[#000] text-white border-gray-800">
                <CardContent className="p-4">
                    <div className="flex space-x-3">
                        {userAvatar && <Avatar>
                            <AvatarImage src={userAvatar.imageUrl} />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>}
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                    <h4 className="text-sm font-semibold">Jane Doe</h4>
                                    <p className="text-sm text-gray-500">@janedoe · 1m</p>
                                </div>
                                <MoreHorizontal className="h-4 w-4" />
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{text || "Your post content will appear here..."}</p>
                            {mediaPreview && !isVideo && <div className="mt-2 rounded-xl border border-gray-800 overflow-hidden"><Image src={mediaPreview} alt="preview" width={500} height={300} className="object-cover w-full"/></div>}
                            <div className="flex justify-between pt-2 text-gray-500">
                                <div className="flex items-center space-x-1 hover:text-primary transition-colors"><MessageCircle size={18} /><span className="text-xs">12</span></div>
                                <div className="flex items-center space-x-1 hover:text-green-500 transition-colors"><Repeat size={18} /><span className="text-xs">34</span></div>
                                <div className="flex items-center space-x-1 hover:text-red-500 transition-colors"><Heart size={18} /><span className="text-xs">56</span></div>
                                <div className="flex items-center space-x-1 hover:text-primary transition-colors"><Bookmark size={18} /></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
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
                {mediaPreview && !isVideo ? <Image src={mediaPreview} alt="preview" width={320} height={320} className="object-cover w-full aspect-square"/> : <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-muted-foreground"><ImageIcon/></div> }
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
                     {mediaPreview && !isVideo && <div className="mt-3 -mx-4"><Image src={mediaPreview} alt="preview" width={600} height={400} className="object-cover w-full"/></div>}
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
          <TabsContent value="linkedin">
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
                  {mediaPreview && !isVideo && <div className="mt-3 -mx-4"><Image src={mediaPreview} alt="preview" width={600} height={400} className="object-cover w-full"/></div>}
                  <div className="flex justify-between items-center text-gray-600 text-xs mt-2 pt-2 border-t">
                    <span>56 Likes</span>
                    <span>12 Comments</span>
                  </div>
                  <div className="flex justify-around pt-2 mt-2 border-t">
                      <Button variant="ghost" className="text-gray-600"><ThumbsUp className="mr-2 h-4 w-4"/>Like</Button>
                      <Button variant="ghost" className="text-gray-600"><MessageCircle className="mr-2 h-4 w-4"/>Comment</Button>
                      <Button variant="ghost" className="text-gray-600"><Repeat className="mr-2 h-4 w-4"/>Repost</Button>
                      <Button variant="ghost" className="text-gray-600"><Send className="mr-2 h-4 w-4"/>Send</Button>
                  </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="youtube">
            <Card className="bg-[#f9f9f9] text-black border-gray-200">
              <CardContent className="p-0">
                  {mediaPreview && isVideo ? <video src={mediaPreview} controls className="w-full aspect-video bg-black"/> : <div className="w-full aspect-video bg-black flex items-center justify-center text-white"><Youtube className="w-16 h-16"/></div> }
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
        </Tabs>
      </div>
    </div>
  );
}
