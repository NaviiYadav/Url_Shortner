import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, ArrowRight, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { urlApi } from '@/lib/api';

interface UrlShortenerFormProps {
  onSuccess?: () => void;
}

const UrlShortenerForm: React.FC<UrlShortenerFormProps> = ({ onSuccess }) => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to shorten URLs",
        variant: "destructive",
      });
      navigate('/auth?mode=login');
      return;
    }

    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to shorten",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { url: createdUrl } = await urlApi.shorten(url);
      setShortUrl(createdUrl.shortUrl);
      setUrl('');
      
      toast({
        title: "URL Shortened!",
        description: "Your short URL has been created successfully",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to shorten URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Short URL copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-2 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your long URL here..."
              className="h-14 pl-12 pr-4 text-base bg-background/50 border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-14 px-8 rounded-xl text-base font-semibold shadow-glow hover:shadow-glow transition-shadow"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Shorten
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Result */}
      {shortUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 glass-strong rounded-xl p-4"
        >
          <p className="text-sm text-muted-foreground mb-2">Your shortened URL:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-background/50 rounded-lg px-4 py-3 font-mono text-sm truncate">
              {shortUrl}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="h-12 w-12 rounded-lg"
            >
              {copied ? (
                <Check className="w-5 h-5 text-success" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(shortUrl, '_blank')}
              className="h-12 w-12 rounded-lg"
            >
              <ExternalLink className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UrlShortenerForm;
