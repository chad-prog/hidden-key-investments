/**
 * Test Helper for Netlify Functions
 * 
 * Utilities to run Netlify-style handlers in-process for testing
 */

import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';

/**
 * Create a mock Netlify event object
 */
export function createMockEvent(options: {
  path?: string;
  httpMethod?: string;
  headers?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  body?: string | null;
}): HandlerEvent {
  return {
    path: options.path || '/.netlify/functions/test',
    httpMethod: options.httpMethod || 'GET',
    headers: options.headers || {},
    queryStringParameters: options.queryStringParameters || null,
    body: options.body || null,
    isBase64Encoded: false,
    rawUrl: `http://localhost:8888${options.path || '/.netlify/functions/test'}`,
    rawQuery: '',
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
  };
}

/**
 * Create a mock Netlify context object
 */
export function createMockContext(): HandlerContext {
  return {
    functionName: 'test-function',
    functionVersion: '1.0.0',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
    memoryLimitInMB: '1024',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/test-function',
    logStreamName: '2024/01/01/[$LATEST]abcdef',
    identity: undefined,
    clientContext: undefined,
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
    callbackWaitsForEmptyEventLoop: true,
  };
}

/**
 * Invoke a Netlify handler function with mock event and context
 */
export async function invokeHandler(
  handler: Handler,
  event: Partial<HandlerEvent> = {},
  context?: HandlerContext
): Promise<HandlerResponse> {
  const mockEvent = createMockEvent(event as any);
  const mockContext = context || createMockContext();
  
  const result = await handler(mockEvent, mockContext);
  
  // Ensure we always return a proper response
  if (!result) {
    throw new Error('Handler returned undefined');
  }
  
  return result;
}

/**
 * Parse response body as JSON
 */
export function parseResponseBody<T = any>(response: HandlerResponse): T {
  if (!response.body) {
    throw new Error('Response has no body');
  }
  
  return JSON.parse(response.body);
}

/**
 * Helper to create a POST request event with JSON body
 */
export function createPostEvent(path: string, body: any, headers: Record<string, string> = {}): HandlerEvent {
  return createMockEvent({
    path,
    httpMethod: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

/**
 * Helper to create a GET request event with query parameters
 */
export function createGetEvent(path: string, queryParams: Record<string, string> = {}): HandlerEvent {
  return createMockEvent({
    path,
    httpMethod: 'GET',
    queryStringParameters: queryParams,
  });
}
