import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Lock, Palette, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({ email: true, push: false, weekly: true });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  useEffect(() => {
    // Load notification settings from backend
    authApi.getNotificationSettings()
      .then((res) => setNotifications(res.notifications))
      .catch(() => {});
  }, []);

  const handleNotificationChange = async (key: keyof typeof notifications, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    setIsSavingNotifications(true);
    try {
      await authApi.updateNotificationSettings(updated);
      toast({ title: 'Settings saved', description: 'Your notification preferences have been updated.' });
    } catch {
      setNotifications(notifications); // revert
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: 'Error', description: "Passwords don't match", variant: 'destructive' });
      return;
    }
    if (passwords.new.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await authApi.changePassword(passwords.current, passwords.new);
      toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to change password', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔧 THIS FUNCTION WAS MISSING AND CAUSED THE CRASH
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await authApi.updateNotificationSettings(notifications);
      toast({
        title: 'Settings saved',
        description: 'All your settings have been saved successfully.'
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences
        </p>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Appearance</h3>
            <p className="text-sm text-muted-foreground">Customize how the app looks</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(value: 'light' | 'dark') => setTheme(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-strong rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">Choose what you want to be notified about</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => handleNotificationChange('email', checked)}
              disabled={isSavingNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive push notifications</p>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) => handleNotificationChange('push', checked)}
              disabled={isSavingNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">Get weekly analytics digest</p>
            </div>
            <Switch
              checked={notifications.weekly}
              onCheckedChange={(checked) => handleNotificationChange('weekly', checked)}
              disabled={isSavingNotifications}
            />
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-strong rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold">Security</h3>
            <p className="text-sm text-muted-foreground">Manage your security settings</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input type="password" placeholder="••••••••" className="mt-1.5" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
          </div>
          <div>
            <Label>New Password</Label>
            <Input type="password" placeholder="••••••••" className="mt-1.5" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
          </div>
          <div>
            <Label>Confirm Password</Label>
            <Input type="password" placeholder="••••••••" className="mt-1.5" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
          </div>
          <Button variant="outline" onClick={handlePasswordChange} disabled={isLoading}>
            {isLoading ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" /> : null}
            Update Password
          </Button>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-strong rounded-xl p-6 border-destructive/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">Irreversible actions</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-strong">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end"
      >
        <Button onClick={handleSave} disabled={isLoading} className="shadow-glow">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </Button>
      </motion.div>
    </div>
  );
};

export default Settings;
