import { fetch } from 'undici';
import { Logger, makeErrorResponse, readResponseSafely, retryWithBackoff } from './lib/logger.js';
import { airtableSubscriberSchema, validatePayload } from './lib/schemas.js';

export async function handler(event, context) {
  const logger = new Logger({ 
    function: 'airtable-sync',
    requestId: event.requestContext?.requestId
  });

  // Method validation
  if (event.httpMethod !== 'POST') {
    return makeErrorResponse({
      code: 'ERR_METHOD_NOT_ALLOWED',
      message: 'Method not allowed',
      status: 405,
      correlationId: logger.correlationId
    });
  }

  try {
    // Parse and validate payload
    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (err) {
      logger.warn('Invalid JSON payload', { error: err.message });
      return makeErrorResponse({
        code: 'ERR_INVALID_JSON',
        message: 'Invalid JSON payload',
        status: 400,
        correlationId: logger.correlationId
      });
    }

    const { data, error } = validatePayload(airtableSubscriberSchema, payload);
    if (error) {
      logger.warn('Validation failed', { validationErrors: error });
      return makeErrorResponse({
        code: 'ERR_VALIDATION',
        message: 'Invalid request data',
        details: { validationErrors: error },
        status: 400,
        correlationId: logger.correlationId
      });
    }

    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE_NAME;

    logger.debug('Environment check', {
      hasApiKey: !!AIRTABLE_API_KEY,
      hasBaseId: !!AIRTABLE_BASE_ID,
      hasTable: !!AIRTABLE_TABLE,
      baseId: AIRTABLE_BASE_ID,
      table: AIRTABLE_TABLE
    });

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE) {
      logger.info('Running in demo mode', { payload: data });
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          code: 'DEMO_MODE',
          message: 'Running in demo mode',
          details: { 
            action: 'simulated-record-create',
            missingVariables: {
              apiKey: !AIRTABLE_API_KEY,
              baseId: !AIRTABLE_BASE_ID,
              table: !AIRTABLE_TABLE
            }
          },
          correlationId: logger.correlationId
        })
      };
    }

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`;
    
    // Format the data according to Airtable's API requirements
    const recordData = {
      records: [{
        fields: data, // Using validated data
      }],
    };

    const makeRequest = async (attempt) => {
      const requestStart = Date.now();
      logger.debug('Sending request to Airtable', { 
        attempt: attempt + 1,
        url,
        hasPayload: !!recordData
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });

      const { parsed: responseData, raw: responseText } = await readResponseSafely(response);
      const requestDuration = Date.now() - requestStart;

      logger.debug('Received response from Airtable', {
        status: response.status,
        duration: requestDuration,
        hasResponse: !!responseData,
        responseLength: responseText?.length
      });

      if (!response.ok) {
        // Log error details at appropriate level
        const logLevel = response.status >= 500 ? 'error' : 'warn';
        logger[logLevel]('Airtable API error', {
          status: response.status,
          error: responseData?.error,
          rawResponse: responseText
        });

        // For authentication errors
        if (response.status === 401) {
          throw new Error(JSON.stringify({
            message: responseData?.error?.message || 'Authentication failed',
            type: 'AUTHENTICATION_FAILED',
            status: 401,
            details: responseData
          }));
        }

        // For rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          throw new Error(JSON.stringify({
            message: 'Rate limited by Airtable',
            type: 'RATE_LIMIT',
            status: 429,
            retryAfter,
            details: responseData
          }));
        }

        throw new Error(JSON.stringify({
          message: responseData?.error?.message || 'Failed to create record in Airtable',
          type: responseData?.error?.type || 'API_ERROR',
          status: response.status,
          details: responseData
        }));
      }

      return responseData;
    };

    // Attempt the request with retries
    const responseData = await retryWithBackoff(makeRequest, {
      retries: 3,
      baseMs: 200,
      logger: logger.child({ context: 'retry' })
    });

    return makeErrorResponse({
      ok: true,
      code: 'SUCCESS',
      message: 'Record created successfully',
      details: { result: responseData },
      status: 200,
      correlationId: logger.correlationId
    });
  } catch (err) {
    logger.error('Operation failed', { error: err });
    
    let errorCode = 'ERR_INTERNAL';
    let errorMessage = err.message;
    let errorDetails = {};
    let statusCode = 500;
    
    try {
      const parsed = JSON.parse(err.message);
      errorMessage = parsed.message;
      errorDetails = parsed.details;
      statusCode = parsed.status || 500;
      errorCode = parsed.type ? `ERR_${parsed.type.toUpperCase()}` : 'ERR_AIRTABLE_API';
    } catch (e) {
      // If error message isn't JSON, use as is
      logger.debug('Failed to parse error as JSON', { 
        originalError: err.message,
        parseError: e.message 
      });
    }
    
    if (err.status === 429) {
      return makeErrorResponse({
        code: 'ERR_RATE_LIMIT',
        message: 'Rate limited by Airtable',
        details: { retryAfter: err.retryAfter },
        status: 429,
        correlationId: logger.correlationId
      });
    }

    return makeErrorResponse({
      code: errorCode,
      message: errorMessage,
      details: errorDetails,
      status: statusCode,
      correlationId: logger.correlationId
    });
  }
}
