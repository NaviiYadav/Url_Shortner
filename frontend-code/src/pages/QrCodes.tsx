import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Plus, Search, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { qrcodeApi } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface QRCode {
  id: string;
  _id?: string;
  url: string;
  name: string;
  fgColor: string;
  bgColor: string;
  createdAt: string;
}

const QrCodes: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedQr, setSelectedQr] = useState<QRCode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newQR, setNewQR] = useState({
    url: '',
    name: '',
    fgColor: '#000000',
    bgColor: '#ffffff',
  });
  const { toast } = useToast();

  const fetchQrCodes = async () => {
    try {
      const data = await qrcodeApi.getAll(1, 100, searchQuery);
      setQrCodes(data.qrCodes || []);
    } catch (error) {
      console.error('Failed to fetch QR codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQrCodes();
  }, [searchQuery]);

  const downloadQR = (qrId: string, name: string) => {
    const svg = document.getElementById(`qr-${qrId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 200;
      canvas.height = 200;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-code-${name}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast({
        title: "Downloaded!",
        description: "QR code saved as PNG",
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleCreate = async () => {
    if (!newQR.url || !newQR.name) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await qrcodeApi.create(newQR);
      toast({
        title: "Created!",
        description: "QR code created successfully",
      });
      setShowCreateDialog(false);
      setNewQR({ url: '', name: '', fgColor: '#000000', bgColor: '#ffffff' });
      fetchQrCodes();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create QR code",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedQr) return;

    setIsSaving(true);
    try {
      await qrcodeApi.update(selectedQr.id || selectedQr._id!, {
        name: selectedQr.name,
        url: selectedQr.url,
        fgColor: selectedQr.fgColor,
        bgColor: selectedQr.bgColor,
      });
      toast({
        title: "Updated!",
        description: "QR code updated successfully",
      });
      setShowEditDialog(false);
      setSelectedQr(null);
      fetchQrCodes();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update QR code",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedQr) return;

    try {
      await qrcodeApi.delete(selectedQr.id || selectedQr._id!);
      toast({
        title: "Deleted!",
        description: "QR code deleted successfully",
      });
      setShowDeleteDialog(false);
      setSelectedQr(null);
      fetchQrCodes();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete QR code",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">QR Codes</h1>
          <p className="text-muted-foreground">
            Create and manage your QR codes
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Create QR Code
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong">
            <DialogHeader>
              <DialogTitle>Create New QR Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={newQR.name}
                  onChange={(e) => setNewQR({ ...newQR, name: e.target.value })}
                  placeholder="My QR Code"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={newQR.url}
                  onChange={(e) => setNewQR({ ...newQR, url: e.target.value })}
                  placeholder="https://example.com"
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Foreground Color</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      type="color"
                      value={newQR.fgColor}
                      onChange={(e) => setNewQR({ ...newQR, fgColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={newQR.fgColor}
                      onChange={(e) => setNewQR({ ...newQR, fgColor: e.target.value })}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label>Background Color</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      type="color"
                      value={newQR.bgColor}
                      onChange={(e) => setNewQR({ ...newQR, bgColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={newQR.bgColor}
                      onChange={(e) => setNewQR({ ...newQR, bgColor: e.target.value })}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center p-4 border-2 border-dashed border-border rounded-xl" style={{ backgroundColor: newQR.bgColor }}>
                <QRCodeSVG
                  value={newQR.url || 'https://example.com'}
                  size={150}
                  fgColor={newQR.fgColor}
                  bgColor={newQR.bgColor}
                  level="H"
                />
              </div>
              <Button onClick={handleCreate} disabled={isSaving} className="w-full shadow-glow">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create QR Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search QR codes..."
            className="pl-9"
          />
        </div>
      </motion.div>

      {/* QR Codes Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {qrCodes.map((qr, index) => (
          <motion.div
            key={qr.id || qr._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="glass-strong rounded-xl p-4 transition-shadow hover:shadow-lg"
          >
            <div
              className="flex items-center justify-center p-4 rounded-lg mb-4"
              style={{ backgroundColor: qr.bgColor }}
            >
              <QRCodeSVG
                id={`qr-${qr.id || qr._id}`}
                value={qr.url}
                size={120}
                fgColor={qr.fgColor}
                bgColor={qr.bgColor}
                level="H"
              />
            </div>
            <h3 className="font-medium truncate">{qr.name}</h3>
            <p className="text-sm text-muted-foreground truncate mb-4">{qr.url}</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => downloadQR(qr.id || qr._id!, qr.name)}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setSelectedQr(qr);
                  setShowEditDialog(true);
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => {
                  setSelectedQr(qr);
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {qrCodes.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 glass-strong rounded-xl"
        >
          <p className="text-muted-foreground">No QR codes found</p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="mt-4"
          >
            Create your first QR code
          </Button>
        </motion.div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Edit QR Code</DialogTitle>
          </DialogHeader>
          {selectedQr && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={selectedQr.name}
                  onChange={(e) => setSelectedQr({ ...selectedQr, name: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={selectedQr.url}
                  onChange={(e) => setSelectedQr({ ...selectedQr, url: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Foreground Color</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      type="color"
                      value={selectedQr.fgColor}
                      onChange={(e) => setSelectedQr({ ...selectedQr, fgColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={selectedQr.fgColor}
                      onChange={(e) => setSelectedQr({ ...selectedQr, fgColor: e.target.value })}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label>Background Color</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      type="color"
                      value={selectedQr.bgColor}
                      onChange={(e) => setSelectedQr({ ...selectedQr, bgColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={selectedQr.bgColor}
                      onChange={(e) => setSelectedQr({ ...selectedQr, bgColor: e.target.value })}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center p-4 border-2 border-dashed border-border rounded-xl" style={{ backgroundColor: selectedQr.bgColor }}>
                <QRCodeSVG
                  value={selectedQr.url || 'https://example.com'}
                  size={150}
                  fgColor={selectedQr.fgColor}
                  bgColor={selectedQr.bgColor}
                  level="H"
                />
              </div>
              <Button onClick={handleEdit} disabled={isSaving} className="w-full shadow-glow">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete QR Code?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the QR code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QrCodes;
