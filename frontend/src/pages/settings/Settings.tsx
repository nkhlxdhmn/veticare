import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Save, Bell, Moon, Sun, Lock, Shield } from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    twoFactor: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    setLoading(true);
    // In a real app, this would send an API request
    setTimeout(() => {
      setLoading(false);
      toast({ title: 'Settings saved', variant: 'success' });
    }, 500);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground mt-1">Manage app preferences and security.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
            <CardDescription>Control how you receive alerts and updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications" className="text-base font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive appointment reminders and health summaries via email.</p>
              </div>
              <Switch 
                id="emailNotifications" 
                checked={settings.emailNotifications} 
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pushNotifications" className="text-base font-medium">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive urgent alerts directly on your device.</p>
              </div>
              <Switch 
                id="pushNotifications" 
                checked={settings.pushNotifications} 
                onCheckedChange={() => handleToggle('pushNotifications')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5" /> Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="darkMode" className="text-base font-medium">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch to a darker theme for better viewing in low light.</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch 
                  id="darkMode" 
                  checked={settings.darkMode} 
                  onCheckedChange={() => handleToggle('darkMode')}
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security</CardTitle>
            <CardDescription>Manage your account's security protocols.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="twoFactor" className="text-base font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
              </div>
              <Switch 
                id="twoFactor" 
                checked={settings.twoFactor} 
                onCheckedChange={() => handleToggle('twoFactor')}
              />
            </div>
            <div className="pt-4 border-t">
              <Button variant="outline" className="gap-2">
                <Lock className="h-4 w-4" /> Change Password
              </Button>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 bg-muted/20">
            <Button onClick={handleSave} disabled={loading} className="ml-auto">
              {loading ? <span className="flex items-center gap-2">Saving...</span> : <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Save Preferences</span>}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
