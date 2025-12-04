import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';
import { Search, UserPlus, Shield, Trash2 } from 'lucide-react';

const permissions = [
  { id: 'view_reports', label: 'View Reports', description: 'Can view all reports' },
  { id: 'edit_reports', label: 'Edit Reports', description: 'Can create and edit reports' },
  { id: 'delete_reports', label: 'Delete Reports', description: 'Can delete reports' },
  { id: 'manage_team', label: 'Manage Team', description: 'Can invite and remove members' },
  { id: 'billing', label: 'Billing Access', description: 'Can view and manage billing' },
  { id: 'api_keys', label: 'API Keys', description: 'Can create and manage API keys' },
];

export default function Team() {
  const { teamMembers, addTeamMember, updateMemberPermissions, removeMember } = useAppData();
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);
  const [memberPermissions, setMemberPermissions] = useState<string[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      Admin: 'default',
      Editor: 'secondary',
      Viewer: 'outline',
    };
    return <Badge variant={variants[role] || 'outline'}>{role}</Badge>;
  };

  const handleOpenPermissions = (member: typeof teamMembers[0]) => {
    setSelectedMember(member);
    setMemberPermissions([...member.permissions]);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setMemberPermissions([...memberPermissions, permissionId]);
    } else {
      setMemberPermissions(memberPermissions.filter((p) => p !== permissionId));
    }
  };

  const handleSavePermissions = () => {
    // UX Issue: Aggressive validation - clears on error
    if (memberPermissions.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one permission is required.',
        variant: 'destructive',
      });
      setMemberPermissions(['view_reports']);
      return;
    }
    
    if (selectedMember) {
      updateMemberPermissions(selectedMember.id, memberPermissions);
      toast({
        title: 'Permissions updated',
        description: `Permissions for ${selectedMember.name} have been saved.`,
      });
    }
    setSelectedMember(null);
  };

  const handleInvite = () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }
    addTeamMember(inviteEmail);
    setInviteEmail('');
    setInviteModalOpen(false);
  };

  const handleRemove = (member: typeof teamMembers[0]) => {
    if (member.role === 'Admin') {
      toast({
        title: 'Error',
        description: 'Cannot remove admin users.',
        variant: 'destructive',
      });
      return;
    }
    removeMember(member.id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team & Permissions</h1>
          <p className="text-muted-foreground text-sm">Manage team members and their access</p>
        </div>
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email address</label>
                <Input 
                  type="email" 
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleInvite}>Send Invitation</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Team Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[150px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id} className="group">
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell className="text-muted-foreground">{member.lastActive}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenPermissions(member)}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Permissions
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemove(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Permissions Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              Manage permissions for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* UX Issue: Tiny click targets and confusing matrix */}
            <div className="space-y-3">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-start gap-3">
                  {/* UX Issue: Tiny click target */}
                  <Checkbox
                    id={permission.id}
                    checked={memberPermissions.includes(permission.id)}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(permission.id, checked as boolean)
                    }
                    className="mt-0.5 tiny-target"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={permission.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {permission.label}
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-muted-foreground truncate cursor-help">
                          {permission.description}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>{permission.description}</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedMember(null)}>
                Cancel
              </Button>
              <Button onClick={handleSavePermissions}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
