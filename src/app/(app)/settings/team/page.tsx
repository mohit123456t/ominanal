'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  

export default function TeamSettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Name</CardTitle>
          <CardDescription>
            This is the name of your team or agency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex gap-4">
            <Input defaultValue="My Awesome Agency" />
            <Button>Save</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage who has access to this team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">Jane Doe (You)</div>
                  </div>
                </TableCell>
                <TableCell>Owner</TableCell>
                <TableCell className="text-right">
                    {/* No actions for owner */}
                </TableCell>
              </TableRow>
               <TableRow>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">John Smith</div>
                  </div>
                </TableCell>
                <TableCell>Admin</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Make Owner</DropdownMenuItem>
                            <DropdownMenuItem>Remove from team</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button>
            <Plus className="mr-2" />
            Invite Member
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
