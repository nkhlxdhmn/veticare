import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { authService } from '@/services/auth.service';
import { toast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AxiosError } from 'axios';
import type { ApiError, UserUpdatePayload } from '@/types';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload: UserUpdatePayload = {};
    if (formData.username !== user?.username) payload.username = formData.username;
    if (formData.email !== user?.email) payload.email = formData.email;
    if (formData.first_name !== user?.first_name) payload.first_name = formData.first_name;
    if (formData.last_name !== user?.last_name) payload.last_name = formData.last_name;

    if (Object.keys(payload).length === 0) {
      setLoading(false);
      toast({ title: 'No changes made', description: 'Your profile is up to date.' });
      return;
    }

    try {
      const updatedUser = await authService.updateProfile(payload);
      updateUser(updatedUser);
      toast({ title: 'Profile updated', variant: 'success' });
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const detail = axiosErr.response?.data?.detail;
      toast({
        title: 'Update failed',
        description: typeof detail === 'string' ? detail : 'Could not update profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground mt-1">Manage your account information and preferences.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} disabled={loading} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="username" name="username" value={formData.username} onChange={handleChange} disabled={loading} className="pl-9" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={loading} className="pl-9" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={loading} className="ml-auto">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <Badge variant={user.is_active ? 'success' : 'destructive'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Role
                </span>
                <span className="text-sm font-semibold uppercase">{user.role?.replace('_', ' ') || 'User'}</span>
              </div>
              <div className="pt-4 border-t text-xs text-muted-foreground">
                <p>Member since {new Date(user.created_at).toLocaleDateString()}</p>
                <p className="mt-1">Last updated {new Date(user.updated_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
