'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Youtube, Instagram, Twitter, Facebook, Unlink } from 'lucide-react';
import { SocialMediaAccount } from '@/lib/types';
import { Button } from '@/components/ui/button';
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
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const platformIcons: { [key: string]: React.ReactNode } = {
  YouTube: <Youtube className="h-6 w-6 text-red-600" />,
  Instagram: <Instagram className="h-6 w-6 text-pink-600" />,
  Facebook: <Facebook className="h-6 w-6 text-blue-700" />,
  Twitter: <Twitter className="h-6 w-6 text-sky-500" />,
};

export default function ConnectedAccountsView({ accounts, isLoadingAccounts }: { accounts: SocialMediaAccount[], isLoadingAccounts: boolean }) {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleDisconnect = async (accountId: string) => {
    if (!user || !firestore) return;
    const accountsCollectionRef = collection(firestore, 'users', user.uid, 'socialMediaAccounts');
    try {
        const docRef = doc(accountsCollectionRef, accountId);
        await deleteDoc(docRef);
        toast({ title: "Account Disconnected", description: "The social media account has been removed." });
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error", description: `Failed to disconnect account: ${error.message}` });
    }
  };


  if (isLoadingAccounts) {
    return (
      <div className="flex justify-center p-8">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">Connected Accounts</h1>
            <Button onClick={() => router.push('/uploader_panel?view=api-keys')}>Add New Account</Button>
       </div>
      {accounts.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border">
            <p className="font-semibold">No accounts connected yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Go to the API Keys page to connect your first account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map(account => (
                <div key={account.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {platformIcons[account.platform]}
                        <span className="font-semibold text-slate-800">@{account.username}</span>
                    </div>
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
                            <AlertDialogAction onClick={() => handleDisconnect(account.id)}>Disconnect</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}