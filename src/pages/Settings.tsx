import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { Copy, Plus, Trash2, X } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { apiKeys, createApiKey, revokeApiKey, settings, updateSettings } = useAppData();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [timezone, setTimezone] = useState(settings.timezone);
  const [darkMode, setDarkMode] = useState(true); // Dark mode on by default
  const [emailNotifications, setEmailNotifications] = useState(settings.emailNotifications);
  const [newKeyModalOpen, setNewKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [captchaAttempts, setCaptchaAttempts] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSaveProfile = () => {
    updateSettings({ name, email });
    toast({
      title: 'Profile updated',
      description: 'Your profile has been saved.',
    });
  };

  const handleUpdatePassword = () => {
    if (!currentPassword) {
      toast({ title: 'Error', description: 'Please enter your current password.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: 'Error', description: 'New password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    toast({
      title: 'Password updated',
      description: 'Your password has been changed.',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    updateSettings({ darkMode: checked });
    // Actually toggle dark mode
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleEmailNotificationsToggle = (checked: boolean) => {
    setEmailNotifications(checked);
    updateSettings({ emailNotifications: checked });
  };

  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
    updateSettings({ timezone: value });
  };

  // UX Issue: CAPTCHA loops
  const handleDeleteAccount = () => {
    setCaptchaAttempts((prev) => prev + 1);
    if (captchaAttempts < 2) {
      toast({
        title: 'Verification failed',
        description: 'Please try the CAPTCHA again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account deletion',
        description: 'This is a demo. Account not deleted.',
      });
      setDeleteModalOpen(false);
      setCaptchaAttempts(0);
    }
  };

  const handleCreateKey = () => {
    if (!newKeyName) {
      toast({ title: 'Error', description: 'Please enter a name for the API key.', variant: 'destructive' });
      return;
    }
    createApiKey(newKeyName);
    setNewKeyName('');
    setNewKeyModalOpen(false);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: 'Copied', description: 'API key copied to clipboard.' });
  };

  const activeApiKeys = apiKeys.filter(k => !k.revoked);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={handleTimezoneChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time</SelectItem>
                    <SelectItem value="pst">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveProfile}>Save changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input 
                  id="current-password" 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                {/* UX Issue: No show password toggle */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input 
                  id="new-password" 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input 
                  id="confirm-password" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleUpdatePassword}>Update password</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete your account?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. All your data will be permanently deleted.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="p-4 bg-muted rounded-lg">
                      {/* UX Issue: Fake CAPTCHA that loops */}
                      <p className="text-sm mb-2">Please verify you're not a robot:</p>
                      <div className="h-16 bg-secondary rounded flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">[CAPTCHA Placeholder - Click Confirm to verify]</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAccount}>
                        Confirm Delete
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark mode</Label>
                  {/* UX Issue: Low contrast text */}
                  <p className="text-[11px] low-contrast">Enable dark theme across the app</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive report updates via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={handleEmailNotificationsToggle} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">API Keys</CardTitle>
                <CardDescription>Manage your API keys for integrations</CardDescription>
              </div>
              <Dialog open={newKeyModalOpen} onOpenChange={setNewKeyModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Key
                  </Button>
                </DialogTrigger>
                {/* UX Issue: Modal X off-screen on small viewports */}
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create API Key</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Key name</Label>
                      <Input 
                        placeholder="My API Key"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateKey}>Create</Button>
                  </div>
                  {/* X button positioned awkwardly */}
                  <button
                    className="absolute right-2 top-2 opacity-70 hover:opacity-100"
                    onClick={() => setNewKeyModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeApiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {key.key}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{key.created}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleCopyKey(key.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => revokeApiKey(key.id)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
