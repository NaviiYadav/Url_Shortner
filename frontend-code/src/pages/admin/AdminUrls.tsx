import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MoreVertical, Trash2, Eye, ExternalLink, Copy, Ban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';
import UrlPagination from '@/components/UrlPagination';

interface AdminUrl {
  id: string;
  _id?: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  userId: any;
  clicks: number;
  isActive: boolean;
  createdAt: string;
}

const AdminUrls: React.FC = () => {
  const [urls, setUrls] = useState<AdminUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUrls, setTotalUrls] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<AdminUrl | null>(null);
  const { toast } = useToast();

  const fetchUrls = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllUrls(page, 10, searchQuery);
      let fetchedUrls = data.urls || [];
      
      // Sort locally
      if (sortBy === 'newest') {
        fetchedUrls = fetchedUrls.sort((a: AdminUrl, b: AdminUrl) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === 'oldest') {
        fetchedUrls = fetchedUrls.sort((a: AdminUrl, b: AdminUrl) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else if (sortBy === 'most-clicks') {
        fetchedUrls = fetchedUrls.sort((a: AdminUrl, b: AdminUrl) => b.clicks - a.clicks);
      }
      
      setUrls(fetchedUrls);
      setTotalPages(data.pagination?.pages || 1);
      setTotalUrls(data.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch URLs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch URLs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [page, searchQuery, sortBy]);

  const handleDelete = async () => {
    if (!selectedUrl) return;
    
    try {
      await adminApi.deleteUrl(selectedUrl.id || selectedUrl._id!);
      toast({
        title: 'URL Deleted',
        description: 'The URL has been deleted.',
      });
      setShowDeleteDialog(false);
      setSelectedUrl(null);
      fetchUrls();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete URL',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: 'Copied!',
      description: 'Short URL copied to clipboard.',
    });
  };

  if (isLoading && urls.length === 0) {
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
      >
        <h1 className="text-2xl font-bold">All URLs</h1>
        <p className="text-muted-foreground">
          Manage all shortened URLs across the platform ({totalUrls} total)
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search URLs, users..."
            className="pl-9"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="most-clicks">Most Clicks</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* URLs Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-xl overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Short URL</TableHead>
              <TableHead>Original URL</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {urls.map((url) => (
              <TableRow key={url.id || url._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-primary">/{url.shortCode}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(url.shortUrl)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="max-w-xs truncate text-muted-foreground text-sm">
                    {url.originalUrl}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {typeof url.userId === 'object' ? url.userId?.name || url.userId?.email : 'Unknown'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={url.isActive ? 'outline' : 'destructive'}>
                    {url.isActive ? 'active' : 'disabled'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {url.clicks.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {new Date(url.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(url.shortUrl, '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open URL
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUrl(url);
                          setShowDeleteDialog(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete URL
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <UrlPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="glass-strong rounded-xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">{totalUrls}</p>
          <p className="text-sm text-muted-foreground">Total URLs</p>
        </div>
        <div className="glass-strong rounded-xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">
            {urls.filter(u => u.isActive).length}
          </p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="glass-strong rounded-xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">
            {urls.filter(u => !u.isActive).length}
          </p>
          <p className="text-sm text-muted-foreground">Disabled</p>
        </div>
        <div className="glass-strong rounded-xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">
            {urls.reduce((sum, u) => sum + u.clicks, 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Total Clicks</p>
        </div>
      </motion.div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete URL?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently disable the URL. This action cannot be undone.
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

export default AdminUrls;
