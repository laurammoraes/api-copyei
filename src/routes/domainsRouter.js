import { Router } from "express";

import { isUser } from "../middlewares/isUser.js";
import { createDomain } from "../controllers/domains/create.js";
import { deleteDomain } from "../controllers/domains/delete.js";

export const domainsRouter = Router();

/* User protected Routes */
domainsRouter.post("/domain", isUser, createDomain);
domainsRouter.delete("/domain", isUser, deleteDomain);
