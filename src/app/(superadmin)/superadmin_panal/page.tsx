'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Users, FileText, Gem } from 'lucide-react';
import { EngagementRateChart } from '@/components/charts';


// Dummy data for demonstration purposes
const kpis = [
  { title: 'Total Users', value: '1,254', icon: Users },
  { title: 'Total Posts', value: '15,890', icon: FileText },
  { title: 'Active Subscriptions', value: '312', icon: Gem },
];

const recentUsers = [
  { name: 'John Smith', email: 'john.s@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { name: 'Alice Johnson', email: 'alice.j@example.com', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
  { name: 'Mike Williams', email: 'mike.w@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' },
  { name: 'Emily Brown', email: 'emily.b@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d' },
];

const userGrowthData = [
    { platform: 'Jan', likes: 100, comments: 20 },
    { platform: 'Feb', likes: 150, comments: 30 },
    { platform: 'Mar', likes: 220, comments: 45 },
    { platform: 'Apr', likes: 300, comments: 60 },
    { platform: 'May', likes: 280, comments: 55 },
    { platform: 'Jun', likes: 450, comments: 80 },
];


export default function SuperAdminPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
         <Shield className="h-10 w-10 text-primary" />
         <div>
            <h1 className="text-3xl font-headline font-bold">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">Application-wide overview and metrics.</p>
         </div>
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                Current total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="grid gap-4 md:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user sign-ups over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
                <EngagementRateChart data={userGrowthData} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>The latest users to sign up for the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right">Email</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentUsers.map((user) => (
                             <TableRow key={user.email}>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium">{user.name}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">{user.email}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
