import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink, Trash2, BarChart3, QrCode, MoreVertical, Pencil } from 'lucide-react';
import { ShortenedUrl } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface UrlCardProps {
  url: ShortenedUrl;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, newUrl: string) => void;
  showActions?: boolean;
}

const UrlCard: React.FC<UrlCardProps> = ({ url, onDelete, onUpdate, showActions = true }) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editUrl, setEditUrl] = useState(url.originalUrl);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleEdit = () => {
    setEditUrl(url.originalUrl);
    setShowEdit(true);
  };

  const handleUpdate = async () => {
    if (!editUrl.trim()) {
      toast({
        title: "Error",
        description: "URL cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(editUrl);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    if (editUrl === url.originalUrl) {
      setShowEdit(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate?.(url.id, editUrl);
      setShowEdit(false);
      toast({
        title: "Success",
        description: "URL updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update URL",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="glass-strong rounded-xl p-4 transition-shadow hover:shadow-lg"
      >
        <div className="flex items-start gap-4">
          {/* QR Code Preview */}
          <div
            className="hidden sm:flex w-16 h-16 rounded-lg bg-background items-center justify-center cursor-pointer hover:ring-2 ring-primary transition-all"
            onClick={() => setShowQr(true)}
          >
            <QRCodeSVG value={url.shortUrl} size={48} />
          </div>

          {/* URL Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <a
                href={url.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline truncate"
              >
                {url.shortUrl.replace(/^https?:\/\//, '')}
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground truncate mb-2">
              {url.originalUrl}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" />
                {url.clicks} clicks
              </span>
              <span>{formatDate(url.createdAt)}</span>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowQr(true)}
              >
                <QrCode className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.open(url.shortUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowQr(true)}>
                    <QrCode className="w-4 h-4 mr-2" />
                    View QR Code
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit URL
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(url.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </motion.div>

      {/* QR Code Dialog */}
      <Dialog open={showQr} onOpenChange={setShowQr}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="p-4 bg-background rounded-xl">
              <QRCodeSVG value={url.shortUrl} size={200} level="H" />
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              {url.shortUrl}
            </p>
            <Button onClick={copyToClipboard} className="mt-4 shadow-glow">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit URL Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Edit URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Short URL (cannot be changed)</p>
              <div className="px-4 py-3 bg-muted rounded-lg text-sm font-mono">
                {url.shortUrl}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Destination URL</p>
              <Input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://example.com/your-long-url"
                className="h-12"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating} className="shadow-glow">
              {isUpdating ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UrlCard;
