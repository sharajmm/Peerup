'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { User, Save, LogOut, Instagram, Linkedin, Mail, Calendar, Users2, Loader2 } from 'lucide-react';
import { getUser, updateUser } from '@/lib/firestore';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile form states
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedIn, setLinkedIn] = useState('');

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const userData = await getUser(user.uid);
      if (userData) {
        setUsername(userData.username || user.email?.split('@')[0] || '');
        setAge(userData.profile?.age?.toString() || '');
        setGender(userData.profile?.gender || '');
        setInstagram(userData.profile?.instagram || '');
        setLinkedIn(userData.profile?.linkedin || '');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await updateUser(user.uid, {
        username: username.trim(),
        profile: {
          age: age ? parseInt(age) : null,
          gender: gender || null,
          instagram: instagram.trim() || null,
          linkedin: linkedIn.trim() || null,
        }
      });

      toast({
        title: 'Profile Updated!',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Profile Settings
          </h1>
          <p className="text-slate-300 text-lg">Manage your account and personal information</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-gradient-to-br from-blue-400 to-purple-400">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
                    {username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  {username || user?.email?.split('@')[0]}
                </h3>
                
                <div className="flex items-center justify-center gap-1 text-slate-400 mb-4">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>

                {age && (
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{age} years old</span>
                  </div>
                )}

                {gender && (
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-4">
                    <Users2 className="w-4 h-4" />
                    <span className="text-sm">{gender}</span>
                  </div>
                )}

                <div className="space-y-2">
                  {instagram && (
                    <a
                      href={`https://instagram.com/${instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-pink-400 hover:text-pink-300 text-sm"
                    >
                      <Instagram className="w-4 h-4" />
                      @{instagram}
                    </a>
                  )}
                  
                  {linkedIn && (
                    <a
                      href={linkedIn.startsWith('http') ? linkedIn : `https://linkedin.com/in/${linkedIn}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Save className="w-5 h-5" />
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-200">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="glass-input bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                      placeholder="Your display name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-slate-200">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="glass-input bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                      placeholder="Your age"
                      min="13"
                      max="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-slate-200">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="glass-input bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/20 bg-slate-900/95 backdrop-blur-xl">
                      <SelectItem value="male" className="text-slate-200 hover:bg-white/10">Male</SelectItem>
                      <SelectItem value="female" className="text-slate-200 hover:bg-white/10">Female</SelectItem>
                      <SelectItem value="non-binary" className="text-slate-200 hover:bg-white/10">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say" className="text-slate-200 hover:bg-white/10">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-slate-200 flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram Username
                    </Label>
                    <Input
                      id="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="glass-input bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                      placeholder="username (without @)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-slate-200 flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn Profile
                    </Label>
                    <Input
                      id="linkedin"
                      value={linkedIn}
                      onChange={(e) => setLinkedIn(e.target.value)}
                      className="glass-input bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                      placeholder="Profile URL or username"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>

                  <Button
                    type="button"
                    onClick={handleLogout}
                    variant="outline"
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}