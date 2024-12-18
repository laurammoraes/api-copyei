import { z } from "zod";

export const envSchema = z.object({
  /* APP */
  PORT: z.string().default("3333"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  APP_BASE_URL: z.string(),
  API_BASE_URL: z.string(),

  /* DATABASE */
  DATABASE_URL: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  REDIS_PASSWORD: z.string(),

  /* SECRETS */
  COPYEI_WEBSITES_OUTPUT_DIRECTORY: z.string(),
  JWT_SECRET: z.string(),
  AAPANEL_ENDPOINT: z.string().optional(),
  AAPANEL_API_SECRET: z.string().optional(),
});
