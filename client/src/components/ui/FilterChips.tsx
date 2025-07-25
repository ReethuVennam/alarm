import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Filter, ChevronDown } from 'lucide-react';
import { microInteractions, springConfigs } from '@/utils/animations';

interface FilterChip {
  id: string;
  label: string;
  icon?: React.ElementType;
  count?: number;
  color?: string;
  removable?: boolean;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selectedChips?: string[];
  onChipClick?: (chipId: string) => void;
  onChipRemove?: (chipId: string) => void;
  multiSelect?: boolean;
  hapticFeedback?: boolean;
  showClearAll?: boolean;
  maxVisible?: number;
  className?: string;
}

// Haptic feedback utility
const triggerHapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30
    };
    navigator.vibrate(patterns[intensity]);
  }
};

// Chip animation variants
const chipVariants = {
  hidden: { 
    scale: 0, 
    opacity: 0,
    filter: 'blur(4px)'
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      mass: 0.8
    }
  },
  exit: { 
    scale: 0, 
    opacity: 0,
    filter: 'blur(4px)',
    transition: {
      duration: 0.2
    }
  }
};

const chipHoverVariants = {
  idle: { 
    scale: 1,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  hover: { 
    scale: 1.05,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: springConfigs.snappy
  },
  tap: { 
    scale: 0.95,
    transition: springConfigs.elastic
  }
};

export function FilterChips({
  chips,
  selectedChips = [],
  onChipClick,
  onChipRemove,
  multiSelect = true,
  hapticFeedback = true,
  showClearAll = true,
  maxVisible,
  className = ''
}: FilterChipsProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleChips = maxVisible && !showAll 
    ? chips.slice(0, maxVisible) 
    : chips;
  
  const hiddenCount = maxVisible && !showAll 
    ? Math.max(0, chips.length - maxVisible) 
    : 0;

  const handleChipClick = (chipId: string) => {
    if (hapticFeedback) {
      triggerHapticFeedback('light');
    }
    onChipClick?.(chipId);
  };

  const handleChipRemove = (chipId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (hapticFeedback) {
      triggerHapticFeedback('medium');
    }
    onChipRemove?.(chipId);
  };

  const handleClearAll = () => {
    if (hapticFeedback) {
      triggerHapticFeedback('heavy');
    }
    selectedChips.forEach(chipId => onChipRemove?.(chipId));
  };

  const handleShowMore = () => {
    setShowAll(!showAll);
    if (hapticFeedback) {
      triggerHapticFeedback('light');
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <AnimatePresence>
        {visibleChips.map((chip, index) => {
          const isSelected = selectedChips.includes(chip.id);
          const Icon = chip.icon;

          return (
            <motion.button
              key={chip.id}
              variants={chipVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={index}
              onClick={() => handleChipClick(chip.id)}
              className={`
                relative flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium
                border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50
                ${isSelected 
                  ? 'bg-accent-primary text-white border-accent-primary shadow-md' 
                  : 'bg-background-secondary text-text-primary border-border-color hover:border-accent-primary/50'
                }
              `}
              whileHover="hover"
              whileTap="tap"
              variants={chipHoverVariants}
              style={{
                animationDelay: `${index * 0.05}s`
              }}
            >
              {/* Selection indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={springConfigs.elastic}
                    className="w-4 h-4"
                  >
                    <Check className="w-full h-full" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Icon */}
              {Icon && !isSelected && (
                <motion.div
                  animate={isSelected ? { scale: 0 } : { scale: 1 }}
                  transition={springConfigs.snappy}
                >
                  <Icon className="w-4 h-4" />
                </motion.div>
              )}

              {/* Label */}
              <span className="truncate max-w-32">
                {chip.label}
              </span>

              {/* Count badge */}
              {chip.count !== undefined && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`
                    text-xs px-1.5 py-0.5 rounded-full font-semibold
                    ${isSelected 
                      ? 'bg-white/20 text-white' 
                      : 'bg-accent-primary/10 text-accent-primary'
                    }
                  `}
                >
                  {chip.count}
                </motion.span>
              )}

              {/* Remove button */}
              {chip.removable && (
                <motion.button
                  onClick={(e) => handleChipRemove(chip.id, e)}
                  className={`
                    ml-1 w-4 h-4 rounded-full flex items-center justify-center
                    ${isSelected 
                      ? 'hover:bg-white/20' 
                      : 'hover:bg-red-100 dark:hover:bg-red-900/20'
                    }
                  `}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Remove ${chip.label} filter`}
                >
                  <X className="w-3 h-3" />
                </motion.button>
              )}

              {/* Ripple effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{ 
                  scale: 2, 
                  opacity: [0, 0.3, 0],
                  transition: { duration: 0.3 }
                }}
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.3)' : 'rgba(var(--accent-primary-rgb),0.3)'
                }}
              />
            </motion.button>
          );
        })}
      </AnimatePresence>

      {/* Show more/less button */}
      {maxVisible && hiddenCount > 0 && (
        <motion.button
          onClick={handleShowMore}
          className="flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium bg-background-tertiary text-text-secondary hover:text-text-primary border border-border-color hover:border-accent-primary/50 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{showAll ? 'Show Less' : `+${hiddenCount} more`}</span>
          <motion.div
            animate={{ rotate: showAll ? 180 : 0 }}
            transition={springConfigs.snappy}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>
      )}

      {/* Clear all button */}
      {showClearAll && selectedChips.length > 0 && (
        <motion.button
          onClick={handleClearAll}
          className="flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="w-4 h-4" />
          <span>Clear All</span>
        </motion.button>
      )}
    </div>
  );
}

// Specialized filter chip components

export function CategoryFilterChips({
  categories,
  selectedCategories = [],
  onCategoryChange,
  className = ''
}: {
  categories: Array<{ id: string; name: string; count?: number; color?: string }>;
  selectedCategories?: string[];
  onCategoryChange?: (categoryIds: string[]) => void;
  className?: string;
}) {
  const chips: FilterChip[] = categories.map(cat => ({
    id: cat.id,
    label: cat.name,
    count: cat.count,
    color: cat.color
  }));

  const handleChipClick = (chipId: string) => {
    const newSelected = selectedCategories.includes(chipId)
      ? selectedCategories.filter(id => id !== chipId)
      : [...selectedCategories, chipId];
    
    onCategoryChange?.(newSelected);
  };

  return (
    <FilterChips
      chips={chips}
      selectedChips={selectedCategories}
      onChipClick={handleChipClick}
      className={className}
    />
  );
}

export function StatusFilterChips({
  statuses,
  selectedStatus,
  onStatusChange,
  className = ''
}: {
  statuses: Array<{ id: string; name: string; icon?: React.ElementType; count?: number }>;
  selectedStatus?: string;
  onStatusChange?: (statusId: string) => void;
  className?: string;
}) {
  const chips: FilterChip[] = statuses.map(status => ({
    id: status.id,
    label: status.name,
    icon: status.icon,
    count: status.count
  }));

  const handleChipClick = (chipId: string) => {
    onStatusChange?.(chipId);
  };

  return (
    <FilterChips
      chips={chips}
      selectedChips={selectedStatus ? [selectedStatus] : []}
      onChipClick={handleChipClick}
      multiSelect={false}
      className={className}
    />
  );
}

// Animated filter header with chips
export function FilterHeader({
  title,
  description,
  chips,
  selectedChips,
  onChipClick,
  onChipRemove,
  children,
  className = ''
}: {
  title: string;
  description?: string;
  chips: FilterChip[];
  selectedChips?: string[];
  onChipClick?: (chipId: string) => void;
  onChipRemove?: (chipId: string) => void;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfigs.gentle}
      className={`space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center">
            <Filter className="w-5 h-5 mr-2 text-accent-primary" />
            {title}
          </h2>
          {description && (
            <p className="text-sm text-text-secondary mt-1">{description}</p>
          )}
        </div>
        {children}
      </div>

      <FilterChips
        chips={chips}
        selectedChips={selectedChips}
        onChipClick={onChipClick}
        onChipRemove={onChipRemove}
        maxVisible={6}
      />
    </motion.div>
  );
}