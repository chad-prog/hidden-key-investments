/**
 * Observability and Error Tracking Infrastructure
 * 
 * Centralized error handling, logging, and monitoring
 * Integrates with services like Sentry, Datadog, etc.
 */

import { randomUUID } from 'crypto';

// ============================================================================
// Types
// ============================================================================

export interface ErrorContext {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  environment?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface LogContext extends ErrorContext {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  data?: any;
}

export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp?: string;
}

export interface PerformanceMetric {
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Error Tracking Service
// ============================================================================

export class ErrorTracker {
  private enabled: boolean;
  private environment: string;
  private sentryAvailable: boolean = false;

  constructor() {
    this.enabled = typeof process !== 'undefined' && process.env.VITE_FEATURE_ERRORTRACKING === 'true';
    this.environment = typeof process !== 'undefined' ? (process.env.NODE_ENV || 'development') : 'development';
    
    // Check if Sentry is available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      this.sentryAvailable = true;
    }
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: ErrorContext): void {
    const enrichedContext = {
      ...context,
      environment: this.environment,
      timestamp: new Date().toISOString(),
      errorType: error.name,
      errorMessage: error.message,
      stack: error.stack,
    };

    // Send to Sentry if available
    if (this.sentryAvailable && typeof window !== 'undefined') {
      const Sentry = (window as any).Sentry;
      Sentry.captureException(error, {
        contexts: { custom: enrichedContext },
        tags: {
          component: context?.component,
          action: context?.action,
        },
        user: context?.userId ? { id: context.userId } : undefined,
      });
    }

    // Always log to console in development or if tracking disabled
    if (!this.enabled || this.environment === 'development') {
      console.error('[ErrorTracker]', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        context: enrichedContext,
      });
    }
  }

  /**
   * Capture a message (for non-error logging)
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
    const enrichedContext = {
      ...context,
      environment: this.environment,
      timestamp: new Date().toISOString(),
      level,
    };

    // Send to Sentry if available
    if (this.sentryAvailable && typeof window !== 'undefined') {
      const Sentry = (window as any).Sentry;
      Sentry.captureMessage(message, {
        level: level === 'warning' ? 'warning' : level,
        contexts: { custom: enrichedContext },
        tags: {
          component: context?.component,
          action: context?.action,
        },
      });
    }

    // Log to console in development or if tracking disabled
    if (!this.enabled || this.environment === 'development') {
      console.log('[ErrorTracker]', level, message, enrichedContext);
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(userId: string, email?: string, username?: string): void {
    // Set in Sentry if available
    if (this.sentryAvailable && typeof window !== 'undefined') {
      const Sentry = (window as any).Sentry;
      Sentry.setUser({ id: userId, email, username });
    }

    if (this.environment === 'development') {
      console.log('[ErrorTracker] User set:', { userId, email, username });
    }
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    // Clear in Sentry if available
    if (this.sentryAvailable && typeof window !== 'undefined') {
      const Sentry = (window as any).Sentry;
      Sentry.setUser(null);
    }

    if (this.environment === 'development') {
      console.log('[ErrorTracker] User cleared');
    }
  }

  /**
   * Add breadcrumb (for debugging)
   */
  addBreadcrumb(message: string, category?: string, data?: any): void {
    // Add to Sentry if available
    if (this.sentryAvailable && typeof window !== 'undefined') {
      const Sentry = (window as any).Sentry;
      Sentry.addBreadcrumb({ message, category, data, timestamp: Date.now() / 1000 });
    }

    if (this.environment === 'development') {
      console.debug('[ErrorTracker] Breadcrumb:', { message, category, data });
    }
  }
}

// ============================================================================
// Structured Logger
// ============================================================================

export class Logger {
  private context: ErrorContext;
  private correlationId: string;

  constructor(context: ErrorContext = {}) {
    this.context = context;
    this.correlationId = context.correlationId || randomUUID();
  }

  private log(level: LogContext['level'], message: string, data?: any): void {
    const logEntry: LogContext = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: this.correlationId,
      ...this.context,
      ...(data && { data }),
    };

    const consoleMethod = level === 'debug' ? console.debug : 
                         level === 'info' ? console.info :
                         level === 'warn' ? console.warn :
                         console.error;

    consoleMethod(JSON.stringify(logEntry));
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | any, data?: any): void {
    const errorData = error instanceof Error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      ...data,
    } : { error, ...data };

    this.log('error', message, errorData);
  }

  fatal(message: string, error?: Error | any, data?: any): void {
    const errorData = error instanceof Error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      ...data,
    } : { error, ...data };

    this.log('fatal', message, errorData);
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: Partial<ErrorContext>): Logger {
    return new Logger({
      ...this.context,
      ...additionalContext,
      correlationId: this.correlationId,
    });
  }
}

// ============================================================================
// Performance Monitoring
// ============================================================================

export class PerformanceMonitor {
  private enabled: boolean;

  constructor() {
    this.enabled = typeof process !== 'undefined' && process.env.VITE_FEATURE_PERFORMANCEMONITORING === 'true';
  }

  /**
   * Track operation performance
   */
  async trackOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      const result = await fn();
      success = true;
      return result;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      
      if (this.enabled) {
        this.recordMetric({
          operation,
          duration,
          success,
          error,
          metadata,
        });
      }
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    console.log('[PerformanceMonitor]', metric);

    // TODO: Send to monitoring service (Datadog, New Relic, etc.)
    // datadog.increment('operation.count', 1, { operation: metric.operation, success: metric.success });
    // datadog.histogram('operation.duration', metric.duration, { operation: metric.operation });
  }

  /**
   * Create a timer for manual tracking
   */
  startTimer(operation: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric({
        operation,
        duration,
        success: true,
      });
    };
  }
}

// ============================================================================
// Metrics Collector
// ============================================================================

export class MetricsCollector {
  private enabled: boolean;

  constructor() {
    this.enabled = typeof process !== 'undefined' && process.env.VITE_FEATURE_PERFORMANCEMONITORING === 'true';
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: MetricData): void {
    if (!this.enabled) {
      console.debug('[Metrics] (disabled)', metric);
      return;
    }

    const enrichedMetric = {
      ...metric,
      timestamp: metric.timestamp || new Date().toISOString(),
    };

    console.log('[Metrics]', enrichedMetric);

    // TODO: Send to metrics service
    // datadog.gauge(metric.name, metric.value, metric.tags);
  }

  /**
   * Increment a counter
   */
  increment(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.recordMetric({
      name,
      value,
      unit: 'count',
      tags,
    });
  }

  /**
   * Record a gauge value
   */
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name,
      value,
      unit: 'gauge',
      tags,
    });
  }

  /**
   * Record a histogram value (for distributions)
   */
  histogram(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name,
      value,
      unit: 'histogram',
      tags,
    });
  }

  /**
   * Record a timing value
   */
  timing(name: string, durationMs: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name,
      value: durationMs,
      unit: 'milliseconds',
      tags,
    });
  }
}

// ============================================================================
// Singleton Instances
// ============================================================================

export const errorTracker = new ErrorTracker();
export const performanceMonitor = new PerformanceMonitor();
export const metricsCollector = new MetricsCollector();

/**
 * Create a logger instance
 */
export function createLogger(context?: ErrorContext): Logger {
  return new Logger(context);
}

// ============================================================================
// React Error Boundary Helper
// ============================================================================

export function logError(error: Error, errorInfo?: any): void {
  errorTracker.captureException(error, {
    component: 'ErrorBoundary',
    metadata: errorInfo,
  });
}

// ============================================================================
// Express/Netlify Middleware Helpers
// ============================================================================

/**
 * Extract correlation ID from request or generate new one
 */
export function getCorrelationId(req: any): string {
  return req.headers['x-correlation-id'] || 
         req.headers['x-request-id'] || 
         randomUUID();
}

/**
 * Create logger from request context
 */
export function createRequestLogger(req: any): Logger {
  return new Logger({
    correlationId: getCorrelationId(req),
    requestId: req.id,
    component: 'api',
    metadata: {
      method: req.method,
      path: req.path,
      ip: req.ip,
    },
  });
}
