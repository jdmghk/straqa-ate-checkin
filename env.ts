import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "PUBLIC_",
  server: {
    COOKIE_SECRET: z.string().min(1),
  },
  client: {
    PUBLIC_BASE_URL: z.string().url(),
  },
  runtimeEnvStrict: {
    COOKIE_SECRET: process.env.COOKIE_SECRET,
    PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL,
  },
  emptyStringAsUndefined: true,
});
