import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Camera, Save, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authApi, urlApi } from '@/lib/api';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [stats, setStats] = useState({ totalUrls: 0, totalClicks: 0, qrCodes: 0 });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    website: '',
    company: '',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await urlApi.getUserStats();
        setStats({
          totalUrls: data.totalUrls || 0,
          totalClicks: data.totalClicks || 0,
          qrCodes: data.qrCodes || 0,
        });
      } catch {
        // Silently fail
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user?.avatar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
        
        // Save to backend
        const { user: updatedUser } = await authApi.updateProfile({ avatar: base64 });
        updateProfile({ avatar: updatedUser.avatar });
        
        toast({
          title: 'Avatar updated',
          description: 'Your profile picture has been updated.',
        });
        setIsUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update avatar.',
        variant: 'destructive',
      });
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user: updatedUser } = await authApi.updateProfile({ name: formData.name });
      updateProfile({ name: updatedUser.name });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile.',
        variant: 'destructive',
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
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information
        </p>
      </motion.div>

      {/* Avatar Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-xl p-6"
      >
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarImage src={avatarPreview || user?.avatar} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button 
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-primary-foreground" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-2 capitalize">
              {user?.role}
            </span>
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="glass-strong rounded-xl p-6 space-y-4"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-9"
                disabled
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            className="mt-1.5 resize-none"
            rows={3}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Acme Inc."
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} className="shadow-glow">
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </motion.form>

      {/* Account Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-strong rounded-xl p-6"
      >
        <h3 className="font-semibold mb-4">Account Statistics</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold gradient-text">{stats.totalUrls}</p>
            <p className="text-sm text-muted-foreground">Total URLs</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold gradient-text">
              {stats.totalClicks >= 1000 ? `${(stats.totalClicks / 1000).toFixed(1)}K` : stats.totalClicks}
            </p>
            <p className="text-sm text-muted-foreground">Total Clicks</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold gradient-text">{stats.qrCodes}</p>
            <p className="text-sm text-muted-foreground">QR Codes</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
