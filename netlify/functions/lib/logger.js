import { randomUUID } from 'crypto';

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL ? 
  LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] : 
  (process.env.DEBUG ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO);

const SENSITIVE_KEYS = [
  'authorization',
  'apikey',
  'token',
  'accesstoken',
  'password',
  'secret',
  'key'
];

function truncate(str, maxLength = 2000) {
  if (!str || str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}... (truncated)`;
}

export function redact(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const clone = JSON.parse(JSON.stringify(obj));
  
  function redactObject(o) {
    if (!o || typeof o !== 'object') return;
    
    for (const [key, value] of Object.entries(o)) {
      const lowerKey = key.toLowerCase();
      
      if (SENSITIVE_KEYS.some(k => lowerKey.includes(k))) {
        o[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        redactObject(value);
      }
    }
  }
  
  redactObject(clone);
  return clone;
}

export class Logger {
  constructor(context = {}) {
    this.context = context;
    this.correlationId = context.correlationId || randomUUID();
    this.startTime = Date.now();
  }

  _log(level, message, data = {}) {
    if (LOG_LEVELS[level] > CURRENT_LOG_LEVEL) return;

    const timestamp = new Date().toISOString();
    const elapsed = Date.now() - this.startTime;
    
    console[level.toLowerCase()]({
      timestamp,
      level,
      correlationId: this.correlationId,
      message,
      elapsed,
      ...this.context,
      ...redact(data)
    });
  }

  debug(message, data) { this._log('DEBUG', message, data); }
  info(message, data) { this._log('INFO', message, data); }
  warn(message, data) { this._log('WARN', message, data); }
  error(message, data) { this._log('ERROR', message, data); }

  child(context) {
    return new Logger({ ...this.context, ...context, correlationId: this.correlationId });
  }
}

export function makeErrorResponse({ 
  ok = false, 
  code = 'ERR_INTERNAL', 
  message = 'Internal error', 
  details = null, 
  correlationId = null, 
  status = 500 
}) {
  return {
    statusCode: status,
    body: JSON.stringify({ 
      ok, 
      code, 
      message, 
      details: redact(details), 
      correlationId 
    })
  };
}

export async function readResponseSafely(response) {
  const text = await response.text();
  try {
    return { parsed: JSON.parse(text), raw: truncate(text) };
  } catch (err) {
    return { parsed: null, raw: truncate(text) };
  }
}

export async function retryWithBackoff(fn, { retries = 3, baseMs = 200, logger }) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn(i);
    } catch (err) {
      const isLast = i === retries - 1;
      if (isLast) throw err;
      
      const backoff = Math.floor(baseMs * Math.pow(2, i) + Math.random() * 100);
      logger?.warn('Operation failed, retrying', {
        attempt: i + 1,
        maxAttempts: retries,
        backoffMs: backoff,
        error: err.message
      });
      
      await new Promise(r => setTimeout(r, backoff));
    }
  }
}