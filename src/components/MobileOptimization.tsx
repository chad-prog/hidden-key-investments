
/**
 * Mobile optimization component with responsive utilities and touch enhancements
 * Ensures optimal experience across all device sizes
 */
import React from 'react';

// Custom hook for window size detection
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  React.useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

interface MobileOptimizationProps {
  children: React.ReactNode;
  className?: string;
}

export default function MobileOptimization({ children, className = '' }: MobileOptimizationProps) {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  return (
    <div 
      className={`
        ${className}
        ${isMobile ? 'mobile-optimized' : ''}
        ${isTablet ? 'tablet-optimized' : ''}
        transition-all duration-300
      `}
      style={{
        // Ensure proper touch targets on mobile
        minHeight: isMobile ? 'calc(100vh - 60px)' : 'auto',
      }}
    >
      {children}
    </div>
  );
}

// Additional mobile utility component for touch-friendly buttons
export function TouchOptimizedButton({ 
  children, 
  className = '',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`
        ${className}
        min-h-[44px] min-w-[44px] // Minimum touch target size
        px-4 py-3 // Adequate padding for touch
        text-base // Readable text size
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        active:scale-95 // Touch feedback
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// Responsive grid component
export function ResponsiveGrid({ 
  children, 
  className = '',
  columns = { mobile: 1, tablet: 2, desktop: 3 }
}: { 
  children: React.ReactNode;
  className?: string;
  columns?: { mobile: number; tablet: number; desktop: number };
}) {
  const { width } = useWindowSize();
  
  const getGridColumns = () => {
    if (width < 768) return columns.mobile;
    if (width < 1024) return columns.tablet;
    return columns.desktop;
  };

  return (
    <div
      className={`
        ${className}
        grid gap-4
        grid-cols-1 // Mobile first
        md:grid-cols-${columns.tablet}
        lg:grid-cols-${columns.desktop}
      `}
      style={{
        gridTemplateColumns: `repeat(${getGridColumns()}, minmax(0, 1fr))`
      }}
    >
      {children}
    </div>
  );
}
