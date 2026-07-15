import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { toast } from '@/hooks/use-toast';
import { Loader2, Check, X } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';

interface PasswordCheck {
  label: string;
  test: (v: string) => boolean;
}

const PASSWORD_RULES: PasswordCheck[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'One digit', test: (v) => /\d/.test(v) },
  { label: 'One special character', test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const allPasswordRulesMet = PASSWORD_RULES.every((r) => r.test(password));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    const email = (fd.get('email') as string).trim();
    const username = (fd.get('username') as string).trim();
    const firstName = (fd.get('firstName') as string).trim();
    const lastName = (fd.get('lastName') as string).trim();
    const pwd = fd.get('password') as string;

    // Client-side validation
    if (!email || !username || !pwd) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (!allPasswordRulesMet) {
      setError('Password does not meet the requirements.');
      setLoading(false);
      return;
    }

    if (!/^[a-z0-9_.-]+$/.test(username)) {
      setError('Username must be lowercase and can only contain letters, numbers, dots, underscores, or hyphens.');
      setLoading(false);
      return;
    }

    try {
      await authService.register({
        email,
        username,
        password: pwd,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      });
      toast({
        title: 'Account created',
        description: 'You can now sign in with your credentials.',
        variant: 'success',
      });
      navigate('/login');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const detail = axiosErr.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join('. '));
      } else if (axiosErr.request && !axiosErr.response) {
        setError('Unable to reach the server. Please check your connection.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container relative flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 h-[calc(100vh-130px)]">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <span className="text-accent mr-1">Veti</span>Care
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Join thousands of pet owners taking a proactive approach to pet healthcare.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 flex items-center justify-center h-full overflow-y-auto">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <Card className="border-none shadow-none md:border md:shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>
                Enter your details below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-firstName">First name</Label>
                    <Input id="reg-firstName" name="firstName" autoComplete="given-name" disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-lastName">Last name</Label>
                    <Input id="reg-lastName" name="lastName" autoComplete="family-name" disabled={loading} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-username">
                    Username <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reg-username"
                    name="username"
                    placeholder="john.doe"
                    autoComplete="username"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lowercase letters, numbers, dots, underscores, or hyphens
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reg-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {password.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = rule.test(password);
                        return (
                          <li key={rule.label} className="flex items-center gap-1.5 text-xs">
                            {passed ? (
                              <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                            ) : (
                              <X className="h-3 w-3 text-muted-foreground shrink-0" />
                            )}
                            <span className={passed ? 'text-emerald-600' : 'text-muted-foreground'}>
                              {rule.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <Button className="w-full" type="submit" disabled={loading || !allPasswordRulesMet}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-center w-full text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
