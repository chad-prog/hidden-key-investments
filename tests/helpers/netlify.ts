/**
 * Netlify Function Test Helper
 * 
 * Helper utilities for testing Netlify functions in-process without network calls.
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

export interface MockEvent extends Partial<HandlerEvent> {
  httpMethod?: string;
  body?: string;
  headers?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
}

export interface MockContext extends Partial<HandlerContext> {
  functionName?: string;
}

/**
 * Create a mock Netlify event for testing
 */
export function createMockEvent(overrides: MockEvent = {}): HandlerEvent {
  return {
    httpMethod: 'POST',
    body: null,
    headers: {},
    isBase64Encoded: false,
    path: '/',
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: 'test-account',
      apiId: 'test-api',
      authorizer: {},
      protocol: 'HTTP/1.1',
      httpMethod: 'POST',
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '127.0.0.1',
        user: null,
        userAgent: 'test-agent',
        userArn: null,
      },
      path: '/',
      stage: 'test',
      requestId: 'test-request-id',
      requestTimeEpoch: Date.now(),
      resourceId: 'test-resource-id',
      resourcePath: '/',
    },
    resource: '/',
    rawUrl: 'http://localhost:8888/.netlify/functions/test',
    rawQuery: '',
    ...overrides,
  };
}

/**
 * Create a mock Netlify context for testing
 */
export function createMockContext(overrides: MockContext = {}): HandlerContext {
  return {
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'test-function',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789:function:test',
    memoryLimitInMB: '1024',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/test',
    logStreamName: '2024/11/06/test',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
    ...overrides,
  };
}

/**
 * Invoke a Netlify handler with mock event and context
 * 
 * @param handler - Netlify handler function
 * @param event - Mock event (or overrides)
 * @param context - Mock context (or overrides)
 * @returns Handler response
 */
export async function invokeHandler(
  handler: Handler,
  event: MockEvent = {},
  context: MockContext = {}
): Promise<any> {
  const mockEvent = createMockEvent(event);
  const mockContext = createMockContext(context);
  
  const result = await handler(mockEvent, mockContext);
  return result;
}

/**
 * Parse JSON response body from handler result
 */
export function parseResponse(response: any): any {
  if (!response || !response.body) {
    return null;
  }
  
  try {
    return JSON.parse(response.body);
  } catch {
    return response.body;
  }
}
