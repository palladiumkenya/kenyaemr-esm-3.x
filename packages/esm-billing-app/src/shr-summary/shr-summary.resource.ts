import { z } from 'zod';

export const authorizationSchema = z.object({
  otp: z.string().min(1, 'Required'),
});
