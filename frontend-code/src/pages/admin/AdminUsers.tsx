import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MoreVertical, Mail, Shield, Trash2, Eye, Ban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface AdminUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  urlCount: number;
  clickCount: number;
  createdAt: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const role = roleFilter === 'all' ? '' : roleFilter;
      const data = await adminApi.getUsers(page, 10, searchQuery, role);
      setUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalUsers(data.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery, roleFilter]);

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await adminApi.updateUser(userId, { role: newRole });
      toast({
        title: 'Role Updated',
        description: `User role has been changed to ${newRole}.`,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await adminApi.updateUser(userId, { isActive });
      toast({
        title: isActive ? 'User Activated' : 'User Suspended',
        description: `User status has been updated.`,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await adminApi.deleteUser(selectedUser.id || selectedUser._id!);
      toast({
        title: 'User Deleted',
        description: 'User has been deleted successfully.',
      });
      setShowDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  if (isLoading && users.length === 0) {
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
        <h1 className="text-2xl font-bold">All Users</h1>
        <p className="text-muted-foreground">
          Manage all registered users ({totalUsers} total)
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
            placeholder="Search users..."
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-xl overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">URLs</TableHead>
              <TableHead className="text-right">Total Clicks</TableHead>
              <TableHead className="text-right">Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id || user._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'outline' : 'destructive'}>
                    {user.isActive ? 'active' : 'suspended'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{user.urlCount || 0}</TableCell>
                <TableCell className="text-right">{(user.clickCount || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
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
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.role === 'user' ? (
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id || user._id!, 'admin')}>
                          <Shield className="w-4 h-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id || user._id!, 'user')}>
                          <Shield className="w-4 h-4 mr-2" />
                          Remove Admin
                        </DropdownMenuItem>
                      )}
                      {user.isActive ? (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(user.id || user._id!, false)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Suspend User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleStatusChange(user.id || user._id!, true)}>
                          <Shield className="w-4 h-4 mr-2" />
                          Activate User
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteDialog(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete User
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
          <p className="text-2xl font-bold gradient-text">{totalUsers}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
        <div className="glass-strong rounded-xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">
            {users.filter(u => u.role === 'admin').length}
          </p>
          <p className="text-sm text-muted-foreground">Admins</p>
        </div>
        <div className="glass-strong rounded-xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">
            {users.filter(u => u.isActive).length}
          </p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="glass-strong rounded-xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">
            {users.filter(u => !u.isActive).length}
          </p>
          <p className="text-sm text-muted-foreground">Suspended</p>
        </div>
      </motion.div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the user account and all their URLs. This action cannot be undone.
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

export default AdminUsers;
