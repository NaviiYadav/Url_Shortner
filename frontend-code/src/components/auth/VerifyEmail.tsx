import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OtpInput from './OtpInput';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface VerifyEmailProps {
  email: string;
  onVerified: (user: any, token: string) => void;
  onBack: () => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ email, onVerified, onBack }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.verifySignupOtp(email, otp);
      toast({
        title: 'Email verified!',
        description: 'Welcome to LinkSnip!',
      });
      onVerified(response.user, response.token);
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authApi.resendVerificationOtp(email);
      toast({
        title: 'Code resent',
        description: 'A new verification code has been sent to your email.',
      });
      setCountdown(60);
      setCanResend(false);
      setOtp('');
      setError('');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to resend code',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto text-center"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-glow">
        <Mail className="w-10 h-10 text-primary-foreground" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Verify your email</h2>
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
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive mt-3"
          >
            {error}
          </motion.p>
        )}
      </div>

      <Button
        onClick={handleVerify}
        disabled={isLoading || otp.length !== 6}
        className="w-full h-12 text-base shadow-glow mb-4"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            Verify Email
          </>
        )}
      </Button>

      <div className="text-sm text-muted-foreground">
        Didn't receive the code?{' '}
        {canResend ? (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            {isResending ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : null}
            Resend code
          </button>
        ) : (
          <span className="text-muted-foreground">
            Resend in {countdown}s
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default VerifyEmail;
