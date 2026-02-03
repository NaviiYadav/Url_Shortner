import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import DashboardSidebar from './DashboardSidebar';
import { useAuth } from '@/contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 256 }}
        className="pt-16 min-h-screen transition-all duration-300"
      >
        <div className="p-6">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
