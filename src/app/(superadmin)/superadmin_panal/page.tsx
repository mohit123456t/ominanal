import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function SuperAdminPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
         <Shield className="h-10 w-10 text-primary" />
         <div>
            <h1 className="text-3xl font-headline font-bold">Super Admin Panel</h1>
            <p className="text-muted-foreground">Manage the entire application from here.</p>
         </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Super Admin!</CardTitle>
          <CardDescription>This is your control center. More features will be added here soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>You can manage users, view system-wide analytics, and configure application settings from this panel.</p>
        </CardContent>
      </Card>
    </div>
  );
}
