import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';
import VerifyEmail from '@/components/auth/VerifyEmail';
import ForgotPassword from '@/components/auth/ForgotPassword';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type AuthView = 'login' | 'signup' | 'verify' | 'forgot';

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';

  const [view, setView] = useState<AuthView>(mode === 'signup' ? 'signup' : 'login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const navigate = useNavigate();
  const { login, isAuthenticated, updateProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setView(mode === 'signup' ? 'signup' : 'login');
  }, [mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (view === 'login') {
        loginSchema.parse({ email: formData.email, password: formData.password });
      } else {
        signupSchema.parse(formData);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (view === 'login') {
        await login(formData.email, formData.password);
        toast({ title: 'Welcome back!', description: 'You have been logged in successfully.' });
        navigate('/dashboard');
      } else {
        // Send OTP for verification
        await authApi.sendVerificationOtp(formData.name, formData.email, formData.password);
        setPendingEmail(formData.email);
        setView('verify');
        toast({ title: 'Verification code sent', description: 'Please check your email.' });
      }
    } catch (err: any) {
      if (err.message?.includes('not verified') || err.needsVerification) {
        setPendingEmail(formData.email);
        setView('verify');
      } else {
        toast({
          title: 'Error',
          description: err.message || (view === 'login' ? 'Invalid credentials' : 'Failed to create account'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerified = (user: any, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    updateProfile(user);
    navigate('/dashboard');
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {view === 'signup' && (
        <div>
          <Label htmlFor="name">Full Name</Label>
          <div className="relative mt-1.5">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="John Doe" className="pl-10 h-12" />
          </div>
          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <div className="relative mt-1.5">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="pl-10 h-12" />
        </div>
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative mt-1.5">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="••••••••" className="pl-10 pr-10 h-12" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
      </div>

      {view === 'signup' && (
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="pl-10 h-12" />
          </div>
          {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
        </div>
      )}

      {view === 'login' && (
        <div className="text-right">
          <button type="button" onClick={() => setView('forgot')} className="text-sm text-primary hover:underline">
            Forgot password?
          </button>
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full h-12 text-base shadow-glow mt-6">
        {isLoading ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <>{view === 'login' ? 'Sign In' : 'Create Account'}<ArrowRight className="w-5 h-5 ml-2" /></>}
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {view === 'verify' ? (
            <VerifyEmail key="verify" email={pendingEmail} onVerified={handleVerified} onBack={() => setView('signup')} />
          ) : view === 'forgot' ? (
            <ForgotPassword key="forgot" onBack={() => setView('login')} onSuccess={() => setView('login')} />
          ) : (
            <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full max-w-md">
              <Link to="/" className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                  <Link2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold gradient-text">LinkSnip</span>
              </Link>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{view === 'login' ? 'Welcome back' : 'Create an account'}</h1>
                <p className="text-muted-foreground">{view === 'login' ? 'Enter your credentials to access your dashboard' : 'Start shortening URLs and tracking analytics'}</p>
              </div>
              {renderForm()}
              <p className="text-center text-sm text-muted-foreground mt-6">
                {view === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <Link to={`/auth?mode=${view === 'login' ? 'signup' : 'login'}`} className="text-primary font-medium hover:underline">
                  {view === 'login' ? 'Sign up' : 'Sign in'}
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative z-10 text-center p-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-8 shadow-glow animate-float">
            <Link2 className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Shorten, Share, <span className="gradient-text">Track</span></h2>
          <p className="text-muted-foreground max-w-sm mx-auto">Create powerful short links and gain insights with advanced analytics.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
