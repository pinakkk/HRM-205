import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional().or(z.literal("")),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().or(z.literal("")),
  OPENROUTER_API_KEY: z.string().optional().or(z.literal("")),
  OPENROUTER_DEFAULT_MODEL: z.string().default("openai/gpt-4o-mini"),
  OPENROUTER_ALLOCATOR_MODEL: z.string().default("openai/gpt-4o"),
  OPENROUTER_NARRATOR_MODEL: z.string().default("openai/gpt-4o-mini"),
  RESEND_API_KEY: z.string().optional().or(z.literal("")),
  APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional().or(z.literal("")),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().min(8).optional().or(z.literal("")),
  ADMIN_BOOTSTRAP_NAME: z.string().optional().or(z.literal("")),
});

export const env = serverSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_DEFAULT_MODEL: process.env.OPENROUTER_DEFAULT_MODEL,
  OPENROUTER_ALLOCATOR_MODEL: process.env.OPENROUTER_ALLOCATOR_MODEL,
  OPENROUTER_NARRATOR_MODEL: process.env.OPENROUTER_NARRATOR_MODEL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  APP_URL: process.env.APP_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  ADMIN_BOOTSTRAP_EMAIL: process.env.ADMIN_BOOTSTRAP_EMAIL,
  ADMIN_BOOTSTRAP_PASSWORD: process.env.ADMIN_BOOTSTRAP_PASSWORD,
  ADMIN_BOOTSTRAP_NAME: process.env.ADMIN_BOOTSTRAP_NAME,
});

export type Env = typeof env;
