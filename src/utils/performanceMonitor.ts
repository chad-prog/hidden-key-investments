
/**
 * Performance monitoring utility for tracking application performance metrics
 * Provides real-time monitoring and performance insights
 */
interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage: number | null;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    memoryUsage: null,
  };

  private observer: PerformanceObserver | null = null;
  private isMonitoring = false;

  /**
   * Initialize performance monitoring
   */
  public initialize(): void {
    if (this.isMonitoring) return;

    this.setupPerformanceObserver();
    this.setupMemoryMonitoring();
    this.trackLoadTime();
    this.trackCoreWebVitals();

    this.isMonitoring = true;
    console.log('Performance monitoring initialized');
  }

  /**
   * Set up Performance Observer for various metrics
   */
  private setupPerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.handlePerformanceEntry(entry);
        });
      });

      // Observe different types of performance entries
      const entryTypes = [
        'paint',
        'largest-contentful-paint',
        'layout-shift',
        'first-input',
        'navigation',
        'resource'
      ];

      entryTypes.forEach(type => {
        try {
          this.observer?.observe({ entryTypes: [type] });
        } catch (e) {
          console.warn(`Cannot observe ${type}:`, e);
        }
      });
    } catch (error) {
      console.error('Performance Observer setup failed:', error);
    }
  }

  /**
   * Handle individual performance entries
   */
  private handlePerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
        break;

      case 'largest-contentful-paint':
        this.metrics.largestContentfulPaint = entry.startTime;
        break;

      case 'layout-shift':
        if (!entry.hadRecentInput) {
          this.metrics.cumulativeLayoutShift += (entry as any).value;
        }
        break;

      case 'first-input':
        this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
        break;

      case 'navigation':
        this.handleNavigationEntry(entry as PerformanceNavigationTiming);
        break;
    }
  }

  /**
   * Handle navigation timing entries
   */
  private handleNavigationEntry(entry: PerformanceNavigationTiming): void {
    this.metrics.loadTime = entry.loadEventEnd - entry.fetchStart;
  }

  /**
   * Set up memory usage monitoring (if available)
   */
  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        this.metrics.memoryUsage = memory.usedJSHeapSize;
        
        // Monitor memory periodically
        setInterval(() => {
          this.metrics.memoryUsage = memory.usedJSHeapSize;
        }, 5000);
      }
    }
  }

  /**
   * Track page load time
   */
  private trackLoadTime(): void {
    if (document.readyState === 'complete') {
      this.captureLoadTime();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.captureLoadTime(), 0);
      });
    }
  }

  /**
   * Capture load time from navigation timing
   */
  private captureLoadTime(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
    }
  }

  /**
   * Track Core Web Vitals
   */
  private trackCoreWebVitals(): void {
    // LCP is already tracked by PerformanceObserver
    // FID is already tracked by PerformanceObserver
    // CLS is already tracked by PerformanceObserver
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Report metrics to console or external service
   */
  public reportMetrics(): void {
    const metrics = this.getMetrics();
    
    console.group('🚀 Performance Metrics');
    console.log('Load Time:', metrics.loadTime.toFixed(2) + 'ms');
    console.log('First Contentful Paint:', metrics.firstContentfulPaint.toFixed(2) + 'ms');
    console.log('Largest Contentful Paint:', metrics.largestContentfulPaint.toFixed(2) + 'ms');
    console.log('Cumulative Layout Shift:', metrics.cumulativeLayoutShift.toFixed(4));
    console.log('First Input Delay:', metrics.firstInputDelay.toFixed(2) + 'ms');
    console.log('Memory Usage:', metrics.memoryUsage ? (metrics.memoryUsage / 1024 / 1024).toFixed(2) + 'MB' : 'N/A');
    console.groupEnd();

    // Here you could send metrics to an analytics service
    // this.sendToAnalytics(metrics);
  }

  /**
   * Start continuous monitoring
   */
  public startContinuousMonitoring(): void {
    // Report metrics every 30 seconds
    setInterval(() => {
      this.reportMetrics();
    }, 30000);

    // Also report when page is about to be unloaded
    window.addEventListener('beforeunload', () => {
      this.reportMetrics();
    });
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isMonitoring = false;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export hook for React components
export const usePerformanceMonitor = () => {
  React.useEffect(() => {
    performanceMonitor.initialize();
    performanceMonitor.startContinuousMonitoring();

    return () => {
      performanceMonitor.stopMonitoring();
    };
  }, []);
};

export default performanceMonitor;
