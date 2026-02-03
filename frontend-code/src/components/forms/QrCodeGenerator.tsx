import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const QrCodeGenerator: React.FC = () => {
  const [url, setUrl] = useState('https://example.com');
  const [size, setSize] = useState('200');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = parseInt(size);
      canvas.height = parseInt(size);
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = 'qr-code.png';
      downloadLink.href = pngFile;
      downloadLink.click();

      toast({
        title: "Downloaded!",
        description: "QR code saved as PNG",
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
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
      transition={{ delay: 0.3 }}
      className="glass-strong rounded-2xl p-6 shadow-xl"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <RefreshCw className="w-5 h-5 text-primary" />
        QR Code Generator
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="qr-url">URL</Label>
            <Input
              id="qr-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL..."
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Size</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="128">128px</SelectItem>
                  <SelectItem value="200">200px</SelectItem>
                  <SelectItem value="256">256px</SelectItem>
                  <SelectItem value="512">512px</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fg-color">Foreground</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  type="color"
                  id="fg-color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bg-color">Background</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  type="color"
                  id="bg-color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={downloadQR} className="flex-1 shadow-glow">
              <Download className="w-4 h-4 mr-2" />
              Download PNG
            </Button>
            <Button variant="outline" onClick={copyToClipboard}>
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center justify-center">
          <div
            className="p-4 rounded-xl border-2 border-dashed border-border"
            style={{ backgroundColor: bgColor }}
          >
            <QRCodeSVG
              id="qr-code-svg"
              value={url || 'https://example.com'}
              size={parseInt(size)}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
              includeMargin
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QrCodeGenerator;
