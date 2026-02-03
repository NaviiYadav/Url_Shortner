import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  variant = 'default',
}) => {
  const variants = {
    default: {
      icon: 'bg-muted text-muted-foreground',
      glow: '',
    },
    primary: {
      icon: 'bg-primary/20 text-primary',
      glow: 'shadow-glow',
    },
    accent: {
      icon: 'bg-accent/20 text-accent',
      glow: 'shadow-glow-accent',
    },
    success: {
      icon: 'bg-success/20 text-success',
      glow: '',
    },
    warning: {
      icon: 'bg-warning/20 text-warning',
      glow: '',
    },
  };

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        'glass-strong rounded-xl p-6 transition-shadow duration-300',
        variants[variant].glow && `hover:${variants[variant].glow}`
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('p-3 rounded-lg', variants[variant].icon)}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              isPositive && 'bg-success/20 text-success',
              isNegative && 'bg-destructive/20 text-destructive',
              !isPositive && !isNegative && 'bg-muted text-muted-foreground'
            )}
          >
            {isPositive && '+'}
            {change}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
