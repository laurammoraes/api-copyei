import { Router } from "express";

import { isUser } from "../middlewares/isUser.js";
import { aaPanelWebsitesCreate } from "../controllers/aapanel/websites-create.js";
import { aaPanelWebsitesList } from "../controllers/aapanel/websites-list.js";
import { aaPanelWebsitesDelete } from "../controllers/aapanel/websites-delete.js";

export const aaPanelRouter = Router();

/* User protected Routes */
aaPanelRouter.post("/aapanel/websites/create", isUser, aaPanelWebsitesCreate);
aaPanelRouter.get("/aapanel/websites/list", isUser, aaPanelWebsitesList);
aaPanelRouter.delete(
  "/aapanel/websites/:websiteId",
  isUser,
  aaPanelWebsitesDelete
);
