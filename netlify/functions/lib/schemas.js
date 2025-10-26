import { z } from 'zod';

export const airtableSubscriberSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
}).strict();

export function validatePayload(schema, payload) {
  try {
    return { 
      data: schema.parse(payload), 
      error: null 
    };
  } catch (err) {
    return { 
      data: null, 
      error: err.errors?.map(e => ({
        path: e.path.join('.'),
        message: e.message
      })) 
    };
  }
}