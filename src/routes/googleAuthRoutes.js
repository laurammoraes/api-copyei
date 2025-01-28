import { Router } from "express";

import { googleAuth } from "../controllers/social-auth/google/auth.js";
import { googleCallback } from "../controllers/social-auth/google/callback.js";

export const googleAuthRouter = Router();

/* User protected Routes */
googleAuthRouter.get("/google/auth", googleAuth);
googleAuthRouter.get("/google/callback", googleCallback);
