import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, SortAsc, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UrlCard from '@/components/dashboard/UrlCard';
import UrlShortenerForm from '@/components/forms/UrlShortenerForm';
import UrlPagination from '@/components/UrlPagination';
import { useUrls } from '@/hooks/useUrls';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MyUrls: React.FC = () => {
  const { urls, isLoading, pagination, search, goToPage, refresh, deleteUrl, updateUrl } = useUrls({ limit: 10 });
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      search(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    refresh();
  };

  const handleDelete = async (id: string) => {
    await deleteUrl(id);
  };

  const handleUpdate = async (id: string, newOriginalUrl: string) => {
    await updateUrl(id, newOriginalUrl);
  };

  // Sort URLs client-side (API handles pagination, we sort current page)
  const sortedUrls = [...urls].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'most-clicks':
        return b.clicks - a.clicks;
      case 'least-clicks':
        return a.clicks - b.clicks;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">My URLs</h1>
          <p className="text-muted-foreground">
            Manage all your shortened URLs ({pagination.total} total)
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Short URL</DialogTitle>
              <DialogDescription>
                Enter a long URL below to generate a shortened link.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <UrlShortenerForm onSuccess={handleCreateSuccess} />
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search URLs..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most-clicks">Most Clicks</SelectItem>
              <SelectItem value="least-clicks">Least Clicks</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* URLs List */}
          <div className="space-y-3">
            {sortedUrls.length > 0 ? (
              sortedUrls.map((url, index) => (
                <motion.div
                  key={url.id || url._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <UrlCard 
                    url={{ ...url, id: url.id || url._id }} 
                    onDelete={handleDelete} 
                    onUpdate={handleUpdate} 
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 glass-strong rounded-xl"
              >
                <p className="text-muted-foreground">No URLs found</p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="mt-4"
                >
                  Create your first URL
                </Button>
              </motion.div>
            )}
          </div>

          {/* Pagination */}
          <UrlPagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={goToPage}
          />
        </>
      )}
    </div>
  );
};

export default MyUrls;
