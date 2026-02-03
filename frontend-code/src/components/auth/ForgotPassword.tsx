import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Lock, Eye, EyeOff, CheckCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OtpInput from './OtpInput';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

type Step = 'email' | 'otp' | 'reset' | 'success';

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (step === 'otp' && countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend, step]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    try {
      await authApi.requestPasswordReset(email);
      toast({
        title: 'Reset code sent',
        description: 'Check your email for the verification code.',
      });
      setStep('otp');
      setCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authApi.verifyResetOtp(email, otp);
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      passwordSchema.parse(newPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(email, otp, newPassword);
      setStep('success');
      toast({
        title: 'Password reset successful',
        description: 'You can now login with your new password.',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otp.length === 6 && step === 'otp') {
      handleVerifyOtp();
    }
  }, [otp, step]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      {step !== 'success' && (
        <button
          onClick={step === 'email' ? onBack : () => setStep('email')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'email' ? 'Back to login' : 'Start over'}
        </button>
      )}

      {step === 'email' && (
        <motion.div
          key="email"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-glow">
            <KeyRound className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Forgot password?</h2>
          <p className="text-muted-foreground mb-6">
            No worries, we'll send you reset instructions.
          </p>

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-12"
                />
              </div>
              {error && <p className="text-sm text-destructive mt-1">{error}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-12 shadow-glow">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send reset code'
              )}
            </Button>
          </form>
        </motion.div>
      )}

      {step === 'otp' && (
        <motion.div
          key="otp"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Enter reset code</h2>
          <p className="text-muted-foreground mb-8">
            We've sent a 6-digit code to<br />
            <span className="font-medium text-foreground">{email}</span>
          </p>

          <div className="mb-6">
            <OtpInput
              value={otp}
              onChange={setOtp}
              disabled={isLoading}
              error={!!error}
            />
            {error && (
              <p className="text-sm text-destructive mt-3">{error}</p>
            )}
          </div>

          <Button
            onClick={handleVerifyOtp}
            disabled={isLoading || otp.length !== 6}
            className="w-full h-12 shadow-glow mb-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              'Verify code'
            )}
          </Button>

          <div className="text-sm text-muted-foreground">
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                onClick={() => handleSendOtp()}
                className="text-primary font-medium hover:underline"
              >
                Resend code
              </button>
            ) : (
              <span>Resend in {countdown}s</span>
            )}
          </div>
        </motion.div>
      )}

      {step === 'reset' && (
        <motion.div
          key="reset"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 shadow-glow">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Set new password</h2>
          <p className="text-muted-foreground mb-6">
            Your new password must be at least 6 characters.
          </p>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-12"
                />
              </div>
              {error && <p className="text-sm text-destructive mt-1">{error}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-12 shadow-glow">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                'Reset password'
              )}
            </Button>
          </form>
        </motion.div>
      )}

      {step === 'success' && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Password reset!</h2>
          <p className="text-muted-foreground mb-6">
            Your password has been successfully reset.<br />
            You can now login with your new password.
          </p>
          <Button onClick={onSuccess} className="w-full h-12 shadow-glow">
            Back to login
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ForgotPassword;
